/**
 * Best Puzzle Games - Main Script v2.1
 * Dynamic loading, search, tag filtering, favorites, likes, share, PWA, top-rated view
 */

// ========================================
// STATE MANAGEMENT
// ========================================
const state = {
  games: [],
  filteredGames: [],
  activeTags: new Set(),
  searchQuery: '',
  currentView: 'grid',
  currentSort: 'default', // 'default', 'top-rated', 'most-liked'
  favorites: new Set(),
  likes: new Map() // gameId -> like count
};

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
  searchInput: document.getElementById('search-input'),
  searchResultsCount: document.getElementById('search-results-count'),
  tagsList: document.getElementById('tags-list'),
  totalGamesCount: document.getElementById('total-games-count'),
  gamesGrid: document.getElementById('games-grid'),
  noResults: document.getElementById('no-results'),
  resetSearchBtn: document.getElementById('reset-search'),
  clearFiltersBtn: document.getElementById('clear-filters'),
  viewButtons: document.querySelectorAll('.view-btn'),
  sortSelect: document.getElementById('sort-select')
};

// ========================================
// TAG COLORS
// ========================================
const tagColors = [
  { color: '#00f3ff', glow: 'rgba(0, 243, 255, 0.4)', bg: 'rgba(0, 243, 255, 0.15)', border: '#00f3ff' },
  { color: '#ff2a6d', glow: 'rgba(255, 42, 109, 0.4)', bg: 'rgba(255, 42, 109, 0.15)', border: '#ff2a6d' },
  { color: '#39ff14', glow: 'rgba(57, 255, 20, 0.4)', bg: 'rgba(57, 255, 20, 0.15)', border: '#39ff14' },
  { color: '#bc13fe', glow: 'rgba(188, 19, 254, 0.4)', bg: 'rgba(188, 19, 254, 0.15)', border: '#bc13fe' },
  { color: '#ff9500', glow: 'rgba(255, 149, 0, 0.4)', bg: 'rgba(255, 149, 0, 0.15)', border: '#ff9500' },
  { color: '#ffff00', glow: 'rgba(255, 255, 0, 0.4)', bg: 'rgba(255, 255, 0, 0.15)', border: '#ffff00' },
  { color: '#00ff88', glow: 'rgba(0, 255, 136, 0.4)', bg: 'rgba(0, 255, 136, 0.15)', border: '#00ff88' },
  { color: '#ff6b35', glow: 'rgba(255, 107, 53, 0.4)', bg: 'rgba(255, 107, 53, 0.15)', border: '#ff6b35' },
];

const tagColorMap = new Map();

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  loadFavorites();
  loadLikes();
  await loadGames();
  initializeParticles();
  registerServiceWorker();
  setupEventListeners();
  renderAll();
});

// ========================================
// SERVICE WORKER REGISTRATION
// ========================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[SW] Registered:', reg.scope);
          setInterval(() => reg.update(), 60 * 60 * 1000);
        })
        .catch((err) => console.log('[SW] Registration failed:', err));
    });
  }
}

// ========================================
// LOAD GAMES FROM JSON
// ========================================
async function loadGames() {
  try {
    showLoadingState();

    const response = await fetch('games.json', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    state.games = data.games || [];

    assignTagColors();
    state.filteredGames = [...state.games];
    applySort();

    hideLoadingState();
  } catch (error) {
    console.error('Error loading games:', error);
    showErrorState(error.message);
  }
}

function showLoadingState() {
  elements.gamesGrid.innerHTML = Array(6).fill(0).map((_, i) => `
    <article class="game-card loading-skeleton" aria-hidden="true" style="animation-delay: ${i * 30}ms;">
      <div class="skeleton-icon"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-tags"></div>
      <div class="skeleton-btn"></div>
    </article>
  `).join('');
}

function hideLoadingState() {
  // Replaced by renderAll()
}

function showErrorState(message) {
  elements.gamesGrid.innerHTML = `
    <div class="no-results" style="grid-column: 1 / -1;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 80px; height: 80px; color: var(--neon-pink);">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <h3>Error al cargar los juegos</h3>
      <p>${message}</p>
      <button onclick="location.reload()" class="reset-btn">Reintentar</button>
    </div>
  `;
}

// ========================================
// TAG COLOR ASSIGNMENT
// ========================================
function assignTagColors() {
  const allTags = new Set();
  state.games.forEach(game => {
    game.tags.forEach(tag => allTags.add(tag));
  });

  let colorIndex = 0;
  allTags.forEach(tag => {
    tagColorMap.set(tag, tagColors[colorIndex % tagColors.length]);
    colorIndex++;
  });
}

function getTagStyle(tag) {
  return tagColorMap.get(tag) || tagColors[0];
}

// ========================================
// FAVORITES (localStorage)
// ========================================
function loadFavorites() {
  try {
    const saved = localStorage.getItem('bpg-favorites');
    if (saved) {
      state.favorites = new Set(JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Could not load favorites:', e);
  }
}

function saveFavorites() {
  try {
    localStorage.setItem('bpg-favorites', JSON.stringify([...state.favorites]));
  } catch (e) {
    console.warn('Could not save favorites:', e);
  }
}

function toggleFavorite(gameId) {
  if (state.favorites.has(gameId)) {
    state.favorites.delete(gameId);
  } else {
    state.favorites.add(gameId);
  }
  saveFavorites();
  renderGames();
}

function isFavorite(gameId) {
  return state.favorites.has(gameId);
}

// ========================================
// LIKES (localStorage) - PERSISTENT
// ========================================
function loadLikes() {
  try {
    const saved = localStorage.getItem('bpg-likes');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.likes = new Map(Object.entries(parsed).map(([k, v]) => [parseInt(k), v]));
    }
  } catch (e) {
    console.warn('Could not load likes:', e);
  }
}

function saveLikes() {
  try {
    const obj = Object.fromEntries(state.likes);
    localStorage.setItem('bpg-likes', JSON.stringify(obj));
  } catch (e) {
    console.warn('Could not save likes:', e);
  }
}

function getLikes(gameId) {
  return state.likes.get(gameId) || 0;
}

function hasLiked(gameId) {
  // Track user's own likes separately
  const userLikes = JSON.parse(localStorage.getItem('bpg-user-likes') || '[]');
  return userLikes.includes(gameId);
}

function toggleLike(gameId) {
  const userLikes = JSON.parse(localStorage.getItem('bpg-user-likes') || '[]');
  const currentLikes = getLikes(gameId);

  if (userLikes.includes(gameId)) {
    // Unlike
    const index = userLikes.indexOf(gameId);
    userLikes.splice(index, 1);
    state.likes.set(gameId, Math.max(0, currentLikes - 1));
    showToast('💔 Like retirado', 'info');
  } else {
    // Like
    userLikes.push(gameId);
    state.likes.set(gameId, currentLikes + 1);
    showToast('❤️ ¡Gracias por tu like!', 'success');
  }

  localStorage.setItem('bpg-user-likes', JSON.stringify(userLikes));
  saveLikes();
  renderGames();
}

// ========================================
// SHARE API
// ========================================
async function shareGame(game) {
  const shareData = {
    title: game.title,
    text: `🎮 ${game.title} - ${game.tags.join(', ')} - ⭐ ${game.rate}/5 - 👍 ${getLikes(game.id)} likes`,
    url: game.gameUrl
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${game.title}\n${game.gameUrl}`);
      showToast('¡Enlace copiado al portapapeles!', 'success');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Share failed:', err);
      await navigator.clipboard.writeText(`${game.title}\n${game.gameUrl}`);
      showToast('¡Enlace copiado al portapapeles!', 'success');
    }
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close" aria-label="Cerrar">&times;</button>
  `;

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  const timeout = setTimeout(() => removeToast(toast), 4000);
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timeout);
    removeToast(toast);
  });
}

function removeToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => toast.remove(), 300);
}

// ========================================
// RENDER FUNCTIONS
// ========================================
function renderAll() {
  renderTags();
  renderSortOptions();
  renderGames();
  updateResultsCount();
  updateTotalCount();
}

function renderTags() {
  const tagCounts = new Map();
  state.games.forEach(game => {
    game.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const sortedTags = [...tagCounts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  elements.tagsList.innerHTML = sortedTags.map(([tag, count], index) => {
    const style = getTagStyle(tag);
    const isActive = state.activeTags.has(tag);

    return `
      <div class="tag-item ${isActive ? 'active' : ''}"
           data-tag="${escapeHtml(tag)}"
           role="option"
           aria-selected="${isActive}"
           tabindex="0"
           style="--tag-color: ${style.color}; --tag-glow: ${style.glow}; animation-delay: ${index * 20}ms;">
        <div class="tag-info">
          <span class="tag-color-indicator" style="background: ${style.color}; box-shadow: 0 0 8px ${style.color};"></span>
          <span class="tag-name">${escapeHtml(tag)}</span>
        </div>
        <span class="tag-count">${count}</span>
      </div>
    `;
  }).join('');

  requestAnimationFrame(() => {
    document.querySelectorAll('.tag-item').forEach((el, i) => {
      el.style.animation = `tag-slide-in 0.4s ease-out ${i * 15}ms both`;
    });
  });
}

function renderSortOptions() {
  if (!elements.sortSelect) return;
  elements.sortSelect.innerHTML = `
    <option value="default" ${state.currentSort === 'default' ? 'selected' : ''}>🎮 Por defecto</option>
    <option value="top-rated" ${state.currentSort === 'top-rated' ? 'selected' : ''}>⭐ Mejor valorados</option>
    <option value="most-liked" ${state.currentSort === 'most-liked' ? 'selected' : ''}>❤️ Más votados</option>
    <option value="favorites" ${state.currentSort === 'favorites' ? 'selected' : ''}>💖 Mis favoritos</option>
  `;
}

function applySort() {
  switch (state.currentSort) {
    case 'top-rated':
      state.filteredGames.sort((a, b) => b.rate - a.rate || getLikes(b.id) - getLikes(a.id));
      break;
    case 'most-liked':
      state.filteredGames.sort((a, b) => getLikes(b.id) - getLikes(a.id) || b.rate - a.rate);
      break;
    case 'favorites':
      state.filteredGames = state.filteredGames.filter(g => state.favorites.has(g.id));
      break;
    default:
      // Default: maintain original order from JSON
      break;
  }
}

function renderGames() {
  if (state.filteredGames.length === 0) {
    elements.gamesGrid.innerHTML = '';
    elements.noResults.classList.remove('hidden');
    return;
  }

  elements.noResults.classList.add('hidden');

  elements.gamesGrid.innerHTML = state.filteredGames.map((game, index) => {
    const primaryTag = game.tags[0];
    const secondaryTag = game.tags[1] || primaryTag;
    const tagStyle = getTagStyle(primaryTag);
    const secondaryStyle = getTagStyle(secondaryTag);
    const favorite = isFavorite(game.id);
    const likes = getLikes(game.id);
    const userLiked = hasLiked(game.id);

    return `
      <a href="${escapeHtml(game.gameUrl)}"
         target="_blank"
         rel="noopener noreferrer"
         class="game-card ${favorite ? 'favorite' : ''}"
         data-id="${game.id}"
         role="listitem"
         tabindex="0"
         style="
           --tag-color: ${tagStyle.color};
           --tag-glow: ${tagStyle.glow};
           --tag-color-secondary: ${secondaryStyle.color};
           --tag-glow-secondary: ${secondaryStyle.glow};
           --tag-bg: ${tagStyle.bg};
           --tag-bg-secondary: ${secondaryStyle.bg};
           --tag-border: ${tagStyle.border};
           animation-delay: ${index * 30}ms;"
         aria-label="${escapeHtml(game.title)} - Valoración: ${game.rate}/5 - Likes: ${likes} - ${favorite ? 'Favorito' : ''} - Se abre en nueva pestaña">

        <!-- Favorite Star (top-right) -->
        <button class="favorite-btn ${favorite ? 'active' : ''}"
                data-game-id="${game.id}"
                aria-label="${favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}"
                aria-pressed="${favorite}"
                tabindex="-1">
          <svg class="star-icon" viewBox="0 0 24 24" fill="${favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>

        <!-- Share Button (top-left) -->
        <button class="share-btn"
                data-game-id="${game.id}"
                aria-label="Compartir juego"
                tabindex="-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>

        <div class="game-content">
          <!-- Icon Badge -->
          <div class="game-icon-badge">
            <span class="icon-emoji">${getGameIcon(primaryTag)}</span>
          </div>

          <!-- Game Main Info -->
          <div class="game-main">
            <h3 class="game-title">${escapeHtml(game.title)}</h3>
            <div class="game-tags">
              ${game.tags.map(tag => {
                const style = getTagStyle(tag);
                return `<span class="game-tag" style="--tag-color: ${style.color}; --tag-bg: ${style.bg}; --tag-border: ${style.border};"><span>${escapeHtml(tag)}</span></span>`;
              }).join('')}
            </div>
            <!-- Rating + Likes in one row -->
            <div class="game-meta">
              <div class="game-rating" aria-label="Valoración: ${game.rate} de 5 estrellas">
                <div class="stars" role="img">${generateStars(game.rate)}</div>
                <span class="rating-value">${game.rate.toFixed(1)}</span>
              </div>
              <button class="like-btn ${userLiked ? 'liked' : ''}"
                      data-game-id="${game.id}"
                      aria-label="${userLiked ? 'Quitar like' : 'Dar like'}"
                      aria-pressed="${userLiked}"
                      tabindex="0">
                <svg class="like-icon" viewBox="0 0 24 24" fill="${userLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="like-count">${likes}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- CTA Button - CENTERED "ENTRAR" -->
        <div class="game-cta">
          <button class="enter-btn"
                  type="button"
                  aria-label="Entrar a ${escapeHtml(game.title)} en nueva pestaña">
            <span class="enter-content">
              <svg class="enter-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5"/></svg>
              Entrar
            </span>
          </button>
        </div>
      </a>
    `;
  }).join('');

  // Event listeners for interactive buttons
  elements.gamesGrid.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const gameId = parseInt(btn.dataset.gameId);
      toggleFavorite(gameId);
      showToast(isFavorite(gameId) ? '❤️ Añadido a favoritos' : '💔 Eliminado de favoritos', 'info');
    });
  });

  elements.gamesGrid.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const gameId = parseInt(btn.dataset.gameId);
      const game = state.games.find(g => g.id === gameId);
      if (game) await shareGame(game);
    });
  });

  elements.gamesGrid.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const gameId = parseInt(btn.dataset.gameId);
      toggleLike(gameId);
    });

    // Keyboard support for like button
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Stagger animation
  requestAnimationFrame(() => {
    document.querySelectorAll('.game-card').forEach((el, i) => {
      el.style.animation = `card-slide-up 0.5s ease-out ${i * 30}ms both`;
    });
  });
}

function generateStars(rate) {
  const fullStars = Math.floor(rate);
  const hasHalf = rate % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += `<span class="star filled" style="animation-delay: ${i * 80}ms;">★</span>`;
  }
  if (hasHalf) {
    stars += `<span class="star half" style="position: relative;">★</span>`;
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += `<span class="star">☆</span>`;
  }
  return stars;
}

function getGameIcon(tag) {
  // Icono de Lógica (◈) en todos los juegos
  return '◈';
}

function updateResultsCount() {
  const total = state.games.length;
  const filtered = state.filteredGames.length;

  if (state.searchQuery || state.activeTags.size > 0 || state.currentSort !== 'default') {
    if (filtered === total && state.currentSort === 'default') {
      elements.searchResultsCount.textContent = `${total} juegos`;
    } else {
      const sortLabel = state.currentSort === 'top-rated' ? ' (mejor valorados)' :
                        state.currentSort === 'most-liked' ? ' (más votados)' :
                        state.currentSort === 'favorites' ? ' (favoritos)' : '';
      elements.searchResultsCount.textContent = `${filtered} de ${total} juegos${sortLabel}`;
    }
  } else {
    elements.searchResultsCount.textContent = '';
  }
}

function updateTotalCount() {
  elements.totalGamesCount.textContent = `${state.games.length} juegos`;
}

// ========================================
// FILTERING & SORTING LOGIC
// ========================================
function applyFilters() {
  let results = [...state.games];

  // Search filter
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase().trim();
    results = results.filter(game =>
      game.title.toLowerCase().includes(query) ||
      game.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Tag filter
  if (state.activeTags.size > 0) {
    results = results.filter(game =>
      game.tags.some(tag => state.activeTags.has(tag))
    );
  }

  state.filteredGames = results;
  applySort();
  renderGames();
  updateResultsCount();

  // Update active tag styles
  document.querySelectorAll('.tag-item').forEach(item => {
    const tag = item.dataset.tag;
    const isActive = state.activeTags.has(tag);
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-selected', isActive);
  });
}

function toggleTag(tag) {
  if (state.activeTags.has(tag)) {
    state.activeTags.delete(tag);
  } else {
    state.activeTags.add(tag);
  }
  applyFilters();
}

function clearAllFilters() {
  state.activeTags.clear();
  state.searchQuery = '';
  state.currentSort = 'default';
  elements.searchInput.value = '';
  if (elements.sortSelect) elements.sortSelect.value = 'default';
  applyFilters();
}

function setSort(sortValue) {
  state.currentSort = sortValue;
  applyFilters();
  renderSortOptions();
}

// ========================================
// SEARCH
// ========================================
let searchDebounceTimer;
function handleSearch(input) {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    state.searchQuery = input.value.trim();
    applyFilters();
  }, 150);
}

// ========================================
// VIEW TOGGLE
// ========================================
function setView(view) {
  state.currentView = view;
  elements.gamesGrid.classList.toggle('list-view', view === 'list');

  elements.viewButtons.forEach(btn => {
    const isActive = btn.dataset.view === view;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
  // Search
  elements.searchInput.addEventListener('input', (e) => handleSearch(e.target));

  // Reset search
  elements.resetSearchBtn.addEventListener('click', clearAllFilters);

  // Clear filters
  elements.clearFiltersBtn.addEventListener('click', clearAllFilters);

  // Sort select
  if (elements.sortSelect) {
    elements.sortSelect.addEventListener('change', (e) => setSort(e.target.value));
  }

  // Tag clicks (event delegation)
  elements.tagsList.addEventListener('click', (e) => {
    const tagItem = e.target.closest('.tag-item');
    if (tagItem) {
      toggleTag(tagItem.dataset.tag);
    }
  });

  // Tag keyboard support
  elements.tagsList.addEventListener('keydown', (e) => {
    const tagItem = e.target.closest('.tag-item');
    if (tagItem && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleTag(tagItem.dataset.tag);
    }
  });

  // View toggle
  elements.viewButtons.forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K to focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      elements.searchInput.focus();
    }

    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === elements.searchInput) {
      elements.searchInput.blur();
      if (state.searchQuery || state.activeTags.size > 0 || state.currentSort !== 'default') {
        clearAllFilters();
      }
    }
  });

  // Install prompt handling
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

// ========================================
// PARTICLES BACKGROUND
// ========================================
function initializeParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 20000));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.5 + 0.5,
        color: tagColors[Math.floor(Math.random() * tagColors.length)].color,
        opacity: Math.random() * 0.4 + 0.05
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = (1 - dist / 100) * 0.06;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    animationId = requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// PERFORMANCE: Intersection Observer
// ========================================
if ('IntersectionObserver' in window) {
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '100px', threshold: 0.1 });

  const observeCards = () => {
    document.querySelectorAll('.game-card').forEach(card => {
      cardObserver.observe(card);
    });
  };

  setTimeout(observeCards, 100);

  const originalApplyFilters = applyFilters;
  applyFilters = function() {
    originalApplyFilters();
    setTimeout(observeCards, 100);
  };
}

// ========================================
// EXPORT FOR DEBUGGING
// ========================================
window.BestPuzzleGames = {
  state,
  elements,
  shareGame,
  toggleFavorite,
  isFavorite,
  toggleLike,
  getLikes,
  applyFilters,
  clearAllFilters,
  setSort
};