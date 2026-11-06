# Best Puzzle Games 🎮

Catálogo interactivo y visualmente impactante de los mejores juegos de puzle independientes. Diseñado con estética gaming (modo oscuro, acentos neón, bordes redondeados y efectos hover suaves). **Ahora con enlaces directos** - cada tarjeta abre el juego en una pestaña nueva.

![Best Puzzle Games Preview](https://img.shields.io/badge/Status-Listo-brightgreen?style=for-the-badge&logo=github)
![Games Count](https://img.shields.io/badge/Juegos-50-blue?style=for-the-badge&logo=game-controller)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

## 🌟 Características

- **🎨 Estética Gaming Completa**: Modo oscuro con acentos neón (cian, rosa, verde, púrpura), partículas animadas, glows dinámicos
- **⚡ Carga Dinámica**: Los juegos se cargan desde `games.json` mediante `fetch()` - sin datos hardcodeados
- **🔍 Buscador en Tiempo Real**: Filtra instantáneamente por título o etiquetas mientras escribes (⌘K para foco)
- **🏷️ Sistema de Etiquetas Inteligente**: Contadores automáticos, filtrado por clic, colores únicos por etiqueta, animaciones escalonadas
- **⭐ Valoración Visual**: Estrellas (1-5) con animación "pop" y soporte para medias estrellas
- **🔗 Enlaces Directos**: Cada tarjeta abre el juego en pestaña nueva - sin iframes, sin CORS/sandbox
- **❤️ Favoritos Persistentes**: Click en ♡ para guardar favoritos (localStorage, sobrevive a recargas)
- **📤 Compartir Nativo**: Botón share → Web Share API nativa / fallback clipboard
- **🔔 Toast Notifications**: Feedback visual elegante para acciones (favoritos, share, errores)
- **📱 PWA Ready**: `manifest.json` + `sw.js` Service Worker → instalable, offline-first
- **📱 Totalmente Responsivo**: Mobile-first, breakpoints 1024/768/480px
- **♿ Accesible**: ARIA labels, focus management, screen reader support, prefers-reduced-motion
- **🚀 Optimizado para GitHub Pages**: Estático, sin build, sin dependencias externas

## 📁 Estructura del Proyecto

```
best-puzzle-games/
├── index.html      # Estructura HTML5 semántica + PWA meta tags
├── styles.css      # Estilos completos (gaming dark mode, neon, responsive, animations)
├── script.js       # Lógica dinámica (fetch, search, filter, favorites, share, PWA)
├── games.json      # Datos de los 50 juegos (id, title, gameUrl, tags[], rate)
├── manifest.json   # PWA Manifest (instalable, shortcuts, icons)
├── sw.js           # Service Worker (cache-first, offline, updates)
└── README.md       # Esta documentación
```

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/best-puzzle-games.git
cd best-puzzle-games

# Sirve con cualquier servidor estático
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js (http-server)
npx http-server

# Opción 3: PHP
php -S localhost:8000

# Opción 4: VS Code Live Server
# Click derecho en index.html > "Open with Live Server"

# Abre http://localhost:8000
```

> **⚠️ Importante**: Necesitas un servidor local (`http://localhost:...`) porque `fetch('games.json')` no funciona con protocolo `file://` (política CORS del navegador).

### Despliegue en GitHub Pages

Ver sección **[📤 Subir a GitHub](#-subir-a-github-y-activar-github-pages)** abajo.

## 🎮 Gestión de Juegos (games.json)

El archivo `games.json` es la **única fuente de verdad**. Todos los datos se cargan dinámicamente desde aquí.

### Estructura de Cada Juego

```json
{
  "id": 1,
  "title": "Nombre del Juego",
  "gameUrl": "https://ejemplo.com/juego",
  "tags": ["Lógica", "Bloques", "Sokoban"],
  "rate": 4.5
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `number` | ✅ | Identificador único (número entero) |
| `title` | `string` | ✅ | Título del juego |
| `gameUrl` | `string` | ✅ | **URL directa del juego** (se abre en pestaña nueva) |
| `tags` | `string[]` | ✅ | Array de etiquetas (mínimo 1) |
| `rate` | `number` | ✅ | Valoración de **1 a 5** (decimales permitidos: 4.5) |

### ⭐ Gestión de Valoración (Rate)

**Cómo editar la valoración:**

1. Abre `games.json`
2. Busca el juego por su `id` o `title`
3. Modifica el campo `"rate"` con un número del **1 al 5**
   - Valores válidos: `1`, `2`, `3`, `4`, `5`
   - Decimales permitidos: `3.5`, `4.2`, `4.7`, etc.
4. Guarda el archivo

**Representación visual en la web:**
- ⭐ **Estrellas llenas**: Número entero de la valoración (ej: rate 4.2 → 4 estrellas llenas)
- ⭐ **Media estrella**: Si el decimal ≥ 0.5 (ej: rate 4.5 → 4.5 estrellas)
- ⭐ **Estrellas vacías**: Restan hasta completar 5
- 🎬 **Animación**: Las estrellas aparecen con efecto "pop" escalonado al cargar
- 💫 **Hover**: En tarjetas, las estrellas reaccionan al pasar el ratón

> **Ejemplo**: `"rate": 4.5` se muestra como ⭐⭐⭐⭐⯪ (4.5/5)

### 🏷️ Gestión de Etiquetas (Tags)

**Cómo añadir/modificar etiquetas:**

1. Abre `games.json`
2. En el array `"tags"` de cualquier juego, añade o modifica strings:
   ```json
   "tags": ["Lógica", "Bloques", "MiNuevaEtiqueta"]
   ```
3. Guarda el archivo

**Comportamiento automático:**
- 📊 **Contadores**: El script calcula cuántos juegos tienen cada etiqueta
- 🎨 **Colores únicos**: Cada etiqueta recibe un color neón automático (cian, rosa, verde, púrpura, naranja, amarillo, menta, coral)
- 🔘 **Filtro interactivo**: Al hacer clic en una etiqueta en la barra lateral, filtra la cuadrícula
- 🔄 **Multi-filtro**: Puedes seleccionar múltiples etiquetas (AND lógico)
- ❌ **Limpiar**: Botón "Limpiar filtros" restaura vista completa
- 📱 **Responsive**: En móvil, las etiquetas se muestran en fila horizontal scrollable

> **Consejo**: Usa etiquetas consistentes entre juegos para que los contadores sean útiles. Ej: "Sokoban", "Lógica", "Ajedrez", "Narrativa", "Metroidvania", etc.

### 🔗 URLs Soportadas (gameUrl)

Cualquier URL válida que abra el juego directamente:

| Plataforma | Ejemplo |
|------------|---------|
| **itch.io** | `https://autor.itch.io/nombre-juego` |
| **GitHub Pages** | `https://usuario.github.io/repo/` |
| **Netlify** | `https://app.netlify.app` |
| **PuzzleScript** | `https://jacklance.github.io/...` |
| **SudokuPad** | `https://sudokupad.app/...` |
| **Web propia** | `https://tudominio.com/juego` |

> **Ventaja sobre iframes**: Funciona siempre, sin restricciones de `X-Frame-Options`, `CSP`, o `sandbox`. El usuario va directo a la página del autor.

## ⭐ Nuevas Funcionalidades v2.0

### ❤️ Favoritos (localStorage)
- Click en el **corazón ♡** (esquina sup. der. de cada tarjeta) para marcar/desmarcar favorito
- Se guardan en `localStorage` → persisten entre sesiones y recargas
- Tarjetas favoritas muestran corazón relleno ♥ y barra lateral rosa
- Badge "Favorito" en screen readers

### 📤 Compartir (Web Share API)
- Click en **icono share** (esquina sup. izq.) → abre menú nativo del SO
- En desktop: copia al portapapeles con toast de confirmación
- En móvil: menú nativo (WhatsApp, Telegram, Email, etc.)
- Comparte: Título + Tags + Rating + URL directa

### 🔔 Toast Notifications
Feedback visual no intrusivo para:
- ✅ "Añadido a favoritos" / "Eliminado de favoritos"
- 📋 "Enlace copiado al portapapeles"
- ❌ Errores de carga

### 📱 PWA (Progressive Web App)
- **`manifest.json`**: Nombre, iconos, shortcuts, theme-color
- **`sw.js` Service Worker**:
  - Cache-first para CSS/JS/HTML
  - Network-first para `games.json` (siempre fresco)
  - Offline-ready: funciona sin conexión tras primera visita
  - Auto-update check cada hora
- **Instalable**: "Añadir a pantalla de inicio" en Chrome/Edge/Safari
- **Shortcuts**: Acceso directo a buscador desde icono app

### ⌨️ Atajos de Teclado
| Tecla | Acción |
|-------|--------|
| `⌘K` / `Ctrl+K` | Foco en buscador |
| `Escape` | Limpiar búsqueda (si hay texto) |
| `Enter`/`Space` en tag | Toggle filtro tag |
| `Tab` | Navegación accesible |

## 🛠️ Personalización Avanzada

### Cambiar Colores Neón

En `styles.css`, modifica las variables CSS en `:root`:

```css
:root {
  --neon-cyan: #00f3ff;      /* Color principal */
  --neon-pink: #ff2a6d;      /* Color secundario */
  --neon-green: #39ff14;     /* Color éxito/nuevo */
  --neon-purple: #bc13fe;    /* Color especial */
  --neon-orange: #ff9500;    /* Color advertencia */
  --neon-yellow: #ffff00;    /* Color destacado */
}
```

### Añadir Nuevos Iconos de Etiquetas

En `script.js`, función `getGameIcon(tag)`:

```javascript
const icons = {
  'TuNuevaEtiqueta': '🎯',  // Emoji o carácter Unicode
  // ...
};
```

### Modificar Animaciones

Desactiva/reduce animaciones en `styles.css`:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

## 📤 Subir a GitHub y Activar GitHub Pages

### Paso a Paso (Terminal)

```bash
# 1. Navega a la carpeta del proyecto
cd best-puzzle-games

# 2. Inicializa git (si no lo has hecho)
git init

# 3. Añade todos los archivos
git add .

# 4. Primer commit
git commit -m "Initial commit: Best Puzzle Games catalog

- 50 puzzle games with direct links
- Gaming dark theme with neon accents
- Dynamic loading from games.json
- Real-time search & tag filtering
- Star ratings & direct links (no iframes)
- Fully responsive & accessible

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

# 5. Renombra rama a main (estándar GitHub)
git branch -M main

# 6. Conecta con tu repositorio GitHub (REEMPLAZA tu-usuario)
git remote add origin https://github.com/tu-usuario/best-puzzle-games.git

# 7. Sube a GitHub
git push -u origin main
```

### Activar GitHub Pages

1. Ve a tu repositorio en GitHub: `https://github.com/tu-usuario/best-puzzle-games`
2. Click en **Settings** (⚙️) > **Pages** (en el menú lateral izquierdo)
3. En **Source**, selecciona: **Deploy from a branch**
4. En **Branch**, selecciona: **main** y **/ (root)**
5. Click **Save**
6. Espera 1-2 minutos
7. Tu sitio estará en: `https://tu-usuario.github.io/best-puzzle-games/`

> **Nota**: La primera vez puede tardar unos minutos. Verifica en la pestaña **Actions** que el workflow de Pages termine correctamente.

### Actualizaciones Futuras

```bash
# Haces cambios en games.json, styles.css, etc.
git add .
git commit -m "Update: Añadidos 5 nuevos juegos y ajustes visuales

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
# GitHub Pages se redepliega automáticamente
```

## 🔧 Scripts Útiles

### Validar JSON

```bash
# Verifica que games.json es válido
python -m json.tool games.json > /dev/null && echo "✅ JSON válido"
```

### Contar Juegos y Etiquetas

```bash
# Resumen rápido desde terminal
python3 -c "
import json
with open('games.json') as f:
    data = json.load(f)
games = data['games']
print(f'Total juegos: {len(games)}')
tags = {}
for g in games:
    for t in g['tags']:
        tags[t] = tags.get(t, 0) + 1
print(f'Total etiquetas únicas: {len(tags)}')
for tag, count in sorted(tags.items(), key=lambda x: -x[1])[:10]:
    print(f'  {tag}: {count}')
"
```

## 🐛 Solución de Problemas

| Problema | Solución |
|----------|----------|
| Juegos no cargan | Verifica que `games.json` está en la misma carpeta que `index.html` y es JSON válido |
| "Failed to fetch" | Usa un servidor local (`python -m http.server`), no abras `index.html` directo |
| Estrellas no se ven | Revisa que `rate` es número (no string) en JSON |
| Filtros no funcionan | Abre DevTools (F12) > Console para ver errores JS |
| GitHub Pages 404 | Verifica que el repo es público y Pages está activado en branch `main` / root |
| Enlace no abre | Verifica que `gameUrl` es URL válida y completa (con `https://`) |

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

## 🤝 Créditos

- **Juegos**: Curados desde `puzzles.docx` (varios autores indie en itch.io)
- **Desarrollo**: Asistido por Claude Opus 5.5
- **Fuentes**: [Orbitron](https://fonts.google.com/specimen/Orbitron) + [Rajdhani](https://fonts.google.com/specimen/Rajdhani) (Google Fonts)
- **Iconos**: SVG inline + Emojis Unicode

## 📞 Soporte

¿Problemas o sugerencias? 
- Abre un **Issue** en GitHub
- Revisa la consola del navegador (F12) para errores
- Verifica que `games.json` es JSON válido

---

<div align="center">
  <strong>Hecho con 💜 para la comunidad de puzles</strong><br>
  <sub>⭐ Dale una estrella al repo si te gusta el proyecto</sub>
</div>