# 404 Page Snake Game Design

**Date:** 2026-02-01
**Status:** Approved Design

## Overview

Add a terminal-style snake game to the 404 page as an optional distraction for visitors who land on non-existent pages. The game maintains the "page not found" message prominence while offering interactive entertainment.

## Design Goals

- Keep 404 message as primary content
- Provide fun, programming-themed distraction
- Maintain cohesive design with tech blog aesthetic
- Simple, classic gameplay without feature bloat
- Zero external dependencies

## Layout & Visual Structure

### Page Structure

1. **Header Section**
   - "404: Page Not Found" title
   - Brief explanatory text about the missing page

2. **Game Section**
   - Introductory text: "Take a break with some snake 🐍"
   - 600x600px HTML5 canvas game
   - Score display in terminal style

3. **Footer Helper**
   - "Looking for something?" with link to homepage/blog

### Terminal Aesthetic

**Color Palette:**
- Canvas background: Dark charcoal (#1e1e1e - VS Code dark theme)
- Snake: Bright green (#4EC9B0) or cyan (#9CDCFE)
- Food: Orange/yellow (#CE9178) or pink (#C586C0)
- Text overlays: Light gray with colored keywords
- Canvas border: Subtle glow or colored accent (cyan/green)

**Visual Elements:**
- Monospace font (Fira Code or Consolas)
- Subtle grid lines on canvas (20x20 grid)
- Modern terminal theme aesthetic (not retro green-on-black)
- Grid-based rendering: 20x20 cells at 30px per cell = 600x600px total

## Game Mechanics

### Starting State

- Snake: 3 blocks long, centered, moving right
- Food: Single item at random position (not on snake)
- Overlay: "PRESS ANY KEY TO START" (large), "Use arrow keys to move" (smaller)
- Game begins on any keypress

### Core Gameplay

**Controls:**
- Arrow keys only (up/down/left/right)
- Cannot reverse direction (e.g., left when moving right)

**Movement:**
- Continuous movement at constant speed (~150ms per cell)
- No speed increases

**Scoring:**
- Score = number of food items eaten
- Display: "SCORE: X" in top-left corner (terminal style)

**Food Mechanics:**
- Eating food: snake grows by 1 block
- New food spawns immediately at random valid position

**Collision:**
- Hit wall → game over
- Hit self → game over

### Game Over State

**Display:**
- Semi-transparent overlay
- "GAME OVER" in large terminal green text
- "SCORE: X" below
- "Press any key to restart" (smaller text)
- "Or find your way [home]" with clickable link

**Restart:**
- Any keypress resets game (snake, score, food position)

## Technical Implementation

### File Structure

```
layouts/404.html                          # Override theme's 404 page
assets/js/snake-game.js                   # Game logic
assets/scss/common/_custom.scss           # Canvas styling (or dedicated file)
```

### Hugo Template (layouts/404.html)

- 404 message at top (keep existing i18n structure)
- Canvas element: `<canvas id="snake-game" width="600" height="600">`
- Instruction text above canvas
- JavaScript reference at bottom

### JavaScript Architecture (assets/js/snake-game.js)

**Game State Object:**
```javascript
{
  snake: [[x, y], ...],     // Array of position objects
  direction: 'right',       // Current direction
  food: {x, y},             // Food position
  score: 0,                 // Current score
  status: 'waiting'         // waiting|playing|gameOver
}
```

**Main Components:**

1. **Game Loop**
   - `setInterval` at ~150ms
   - Handles movement, collision detection, rendering

2. **Event Listeners**
   - Keydown for arrow keys
   - Start/restart on any key (when appropriate)

3. **Rendering**
   - Canvas 2D context
   - Clear and redraw each frame
   - Draw grid, snake, food, score, overlays

4. **Helper Functions**
   - `spawnFood()` - Random position not on snake
   - `checkCollision()` - Wall and self-collision detection
   - `drawOverlay()` - Instructions and game over screens
   - `resetGame()` - Reset state for new game

**Constants:**
```javascript
const GRID_SIZE = 20;        // 20x20 cells
const CELL_SIZE = 30;        // 30px per cell
const MOVE_INTERVAL = 150;   // milliseconds
const COLORS = {
  background: '#1e1e1e',
  snake: '#4EC9B0',
  food: '#CE9178',
  text: '#d4d4d4',
  overlay: 'rgba(0,0,0,0.8)'
};
```

### CSS/SCSS Styling

- Center canvas on page
- Add subtle border/glow effect
- Responsive container
- Terminal-themed instruction text styling

## Integration & Polish

### Hugo Integration

- 404 page automatically served by Hugo for missing routes
- JavaScript scoped to 404 page only (check canvas existence)
- No external dependencies (vanilla JS + Canvas API)

### Responsive Behavior

**Desktop/Tablet (≥600px):**
- 600x600px canvas, centered

**Mobile (<600px):**
- Option A: Scale canvas proportionally with `max-width: 100%`
- Option B: Show message "Best played on desktop" with smaller/hidden canvas

**Recommended:** Option A with minimum playable size consideration

### Accessibility

- Canvas has `aria-label="Snake game"`
- Clear visible instructions
- Keyboard-only controls (no mouse required)
- Game is optional, doesn't block navigation
- 404 message remains accessible and prominent

### Browser Compatibility

- Canvas API: IE9+, all modern browsers
- Vanilla ES6: No transpiling needed for simple features used
- Fallback: If canvas unsupported, show 404 message only (progressive enhancement)

## Success Criteria

- 404 message remains primary focus
- Game loads and plays smoothly on modern browsers
- Terminal aesthetic matches tech blog theme
- Controls are intuitive (no tutorial needed beyond overlay)
- Game provides brief entertainment without becoming addictive/distracting
- Mobile experience is acceptable (even if degraded)

## Future Enhancements (Out of Scope)

- High score tracking with localStorage
- Multiple difficulty levels
- WASD key support
- Speed increases
- Sound effects
- Different game modes

These are intentionally excluded to keep the game simple and lightweight.
