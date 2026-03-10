# Week 7 — Deep Sea Prospector Improvements

## Overview

Week 7 focuses on UI/UX enhancements, canvas expansion, and new gameplay features for Deep Sea Prospector.

---

## Key Changes

### 1. Canvas Expansion
- **Resolution:** 800×600 → 1280×720 (16:9)
- Game container and p5 canvas updated for wider display

### 2. Deep Sea Mode
- **Trigger:** Level ≥ 3 enters deep sea
- Different background, fish distribution (70% BigFish), adjusted treasure/stone counts
- "DEEP SEA" label displayed in UI

### 3. Mode Selection UI
- **Mermaid cursor:** Single mermaid icon follows selection (mouse priority over keyboard)
- Keyboard navigation with arrow keys + Enter
- Canvas focus handling for reliable key input

### 4. Menu Backgrounds
- **Contain mode:** Full background visible, no cropping
- **Blur extension:** Letterboxing areas filled with blurred image edges
- Back button positioned within visible image area

### 5. Game Pause
- Pause/play button in level UI
- Game logic pauses when paused; visuals continue to draw

---

## Files Modified

- `docs/index.html` — canvas size, overlay, back button
- `docs/sketch.js` — canvas setup, mode selection wiring
- `docs/js/GameManager.js` — pause logic, background drawing
- `docs/js/LevelManager.js` — deep sea mode, UI layout
- `docs/js/ShopManager.js` — shop layout for 1280×720
