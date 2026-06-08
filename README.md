# 🎨 fleet-midi-visualizer

> *MIDI → SVG piano roll visualization for the fleet*

Turns any Standard MIDI Format 1 file into a beautiful SVG piano roll. Every note is a colored rectangle — pitch on Y, time on X, velocity as opacity, pitch class as hue.

```bash
node lib/visualizer.js path/to/file.mid --save
# → produces path/to/file.svg
```

## Architecture
```
MIDI → music21 parse → note extraction → SVG rendering → file output
```

## Ennsign: **Chroma** — Fleet Visualization Officer
**Summon:** `/ensign chroma visualize path/to/file.mid`
