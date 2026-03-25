# 404 Letter Grid Design

**Date:** 2026-03-25
**Status:** Approved

## Overview

Replace the plain-text 404 page with a canvas-based typographic dot grid that renders "NOT FOUND" using a block matrix pattern. The grid animates on entrance and pulses subtly while idle. Colors are theme-aware (light/dark mode).

## Layout

Top to bottom:

1. **Title** — "404" heading using existing i18n `404_title` string
2. **Subtitle** — explanatory text using existing i18n `404_text` string
3. **Canvas** — full-width dot matrix rendering "NOT FOUND" in two lines (NOT / FOUND)
4. **Navigation** — "Back to homepage" link

## Canvas Rendering

### Grid Structure

- The canvas is divided into a grid of small square cells
- Each cell is either "on" (filled) or "off" (empty/transparent)
- "On" cells form the letter shapes of "NOT" (line 1) and "FOUND" (line 2)
- Letters are defined as hardcoded pixel font bitmaps (5x7 or similar compact grid per character)
- Spacing between characters: 1 cell gap
- Spacing between lines: 2 cell gap

### Colors

Theme-aware via reading CSS custom properties at canvas initialization:

- **"On" cells:** use `--bs-body-color` (adapts to light/dark)
- **Background:** transparent canvas (page background shows through)

Re-read CSS variables on `data-bs-theme` attribute changes (MutationObserver on `<html>`) to support live theme toggling.

### Responsive Sizing

- Canvas container is full-width within the page content column
- Cell size is computed dynamically: `container width / total grid columns`
- Minimum cell size clamped so text remains readable on small screens
- Canvas height derives from cell size and total grid rows
- On resize, recalculate and redraw

## Animation

### Entrance (~1 second)

1. Compute list of all "on" cell positions
2. Shuffle the list randomly
3. Reveal cells in batches per animation frame over ~1 second
4. After all cells revealed, transition to idle animation

### Idle Pulse (continuous)

- Each "on" cell has a random phase offset (assigned once at init)
- Per frame, each cell's opacity = `0.5 + 0.5 * sin(time * speed + phase)`
- Speed tuned for subtle, slow breathing effect (~0.5-1 Hz)
- Uses `requestAnimationFrame` for smooth rendering

### Performance

- Pause animation loop when tab is hidden (`document.visibilitychange`)
- Resume when tab becomes visible
- Only "on" cells are drawn; "off" cells are skipped (canvas is transparent)

## File Structure

```
layouts/404.html              # Hugo template override (new file)
assets/js/404-grid.js         # Canvas rendering + animation (new file)
assets/scss/common/_custom.scss  # Canvas container styles (append)
```

### layouts/404.html

- Extends the base layout (`{{ define "main" }}`)
- Contains: title, subtitle, canvas element with `id="not-found-grid"` and `aria-label="NOT FOUND"`, homepage link
- Loads `404-grid.js` via Hugo's asset pipeline (`resources.Get | js.Build | minify`)

### assets/js/404-grid.js

**Constants:**
- Pixel font bitmaps for letters: N, O, T, F, U, D
- Character dimensions (e.g., 5 wide x 7 tall)
- Inter-character gap: 1 column
- Inter-line gap: 2 rows
- Pulse speed: ~0.002 (tuned for subtle effect)
- Entrance duration: ~1000ms

**Initialization:**
1. Get canvas element; if not found, bail (progressive enhancement)
2. Read theme colors from CSS variables
3. Compute grid layout from "NOT" / "FOUND" bitmaps
4. Compute cell size from container width
5. Set canvas dimensions
6. Build list of "on" cells with random phase offsets
7. Shuffle cell order for entrance animation
8. Start animation loop

**Animation loop (`requestAnimationFrame`):**
1. Clear canvas
2. For each revealed cell, compute current opacity from sine wave
3. Fill cell rectangle with theme color at computed opacity
4. If entrance still in progress, reveal next batch of cells
5. Request next frame

**Resize handler:**
- Debounced window resize listener
- Recalculate cell size and canvas dimensions
- Redraw

**Theme change handler:**
- MutationObserver on `<html>` `data-bs-theme` attribute
- Re-read CSS variables, redraw

### SCSS additions

```scss
.not-found-grid {
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
}

.not-found-grid canvas {
  width: 100%;
  height: auto;
  display: block;
}
```

## Accessibility

- Canvas has `aria-hidden="true"` (decorative; the text title/subtitle convey the 404 message)
- 404 message is in standard HTML above the canvas
- Navigation link is standard `<a>` element
- No keyboard interaction required
- Animation respects `prefers-reduced-motion`: if set, skip entrance animation and disable pulse (show static grid)

## Browser Compatibility

- Canvas 2D API: all modern browsers
- MutationObserver: all modern browsers
- `requestAnimationFrame`: all modern browsers
- Fallback: if canvas unsupported, user sees the text-only 404 message (progressive enhancement)

## Success Criteria

- "NOT FOUND" is clearly readable in the dot grid
- Entrance animation feels smooth and polished
- Idle pulse is subtle — noticeable but not distracting
- Works in both light and dark mode
- Responsive down to 320px width
- Page remains functional without JavaScript (text-only fallback)
