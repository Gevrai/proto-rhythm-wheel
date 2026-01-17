# Rhythm Wheel Puzzle Game

A rhythm puzzle game where players press QWER keys at correct beats based on symbols on a circular wheel.

## Tech Stack
- Vanilla JavaScript (no frameworks/build tools)
- SVG for wheel visualization
- Web Audio API for precise timing and synthesized drums

## File Structure
```
index.html          - Main HTML with SVG container and UI elements
css/styles.css      - All styling and animations
js/
  timing.js         - Web Audio lookahead scheduler ("Tale of Two Clocks" pattern)
  synth.js          - Synthesized drum sounds (kick, snare, hihat, other)
  wheel.js          - SVG wheel rendering with 8 position markers
  input.js          - QWER keyboard capture with timestamps
  puzzles.js        - Puzzle definitions array
  feedback.js       - Visual hit/miss feedback (floating text)
  main.js           - Game state machine and orchestration
```

## Key Concepts

### Beat Positions (8 subdivisions around wheel)
- Position 0: Beat 1 (12 o'clock, top)
- Position 2: Beat 2 (3 o'clock)
- Position 4: Beat 3 (6 o'clock, bottom)
- Position 6: Beat 4 (9 o'clock)
- Odd positions (1,3,5,7): eighth notes between beats

### Key Mapping
- Q = Kick (red circle)
- W = Snare (blue square)
- E = Hi-hat (green triangle)
- R = Other (purple diamond)

### Timing Architecture
Uses "Tale of Two Clocks" for precise audio:
1. `setTimeout` (25ms lookahead) - schedules upcoming events
2. `Web Audio clock` - precise sound scheduling
3. `requestAnimationFrame` - visual updates

### Game States
`IDLE` → `COUNTDOWN` → `PLAYING` → `SUCCESS`/`FAILURE`

### Puzzle Data Structure
```javascript
{
  id: 1,
  name: "First Beat",
  tempo: 80,
  subdivisions: 8,
  symbols: [{ position: 0, key: 'q', instrument: 'kick' }],
  tolerance: 200,  // ms hit window
  loops: 2         // measures to complete
}
```

## Module Communication
- `Timing` fires callbacks → `main.js` handles subdivision/beat events
- `Input` fires keypress → `main.js` does hit detection
- `main.js` calls `Wheel`, `Feedback`, `Synth` for visual/audio response

## Adding New Puzzles
Edit `js/puzzles.js` - add objects to the `puzzles` array with positions 0-7 for symbol placement.

## Deployment
GitHub Pages via `.github/workflows/deploy.yml` - auto-deploys on push to `main`.
