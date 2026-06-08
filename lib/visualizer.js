#!/usr/bin/env node
/**
 * MIDI Visualizer — Generates SVG piano roll from MIDI files
 */
const { spawnSync } = require('child_process');

function renderSVG(midiPath) {
  const pyCode = `
import music21, json, sys
m = music21.converter.parse('${midiPath.replace(/'/g, "\\'")}')
notes = []
for p in m.parts:
    for n in p.flat.notes:
        if hasattr(n, 'pitch'):
            notes.append({
                'pitch': n.pitch.midi,
                'start': n.offset,
                'duration': n.duration.quarterLength,
                'velocity': int(n.volume.realized * 127) if hasattr(n, 'volume') else 90
            })

# Generate SVG
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300">'
svg += '<rect width="800" height="300" fill="#1a1a2e"/>'

max_pitch = max(n['pitch'] for n in notes) if notes else 80
min_pitch = min(n['pitch'] for n in notes) if notes else 50
pitch_range = max_pitch - min_pitch + 1
max_time = max(n['start'] + n['duration'] for n in notes) if notes else 4

for n in notes:
    x = (n['start'] / max_time) * 780 + 10
    w = (n['duration'] / max_time) * 780
    y = 290 - ((n['pitch'] - min_pitch) / pitch_range) * 260
    h = 260 / pitch_range * 0.8
    opacity = max(0.3, n['velocity'] / 127)
    color = f'hsl({(n["pitch"] * 30) % 360}, 80%, 60%)'
    svg += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}" opacity="{opacity}" rx="2"/>'

svg += '</svg>'
print(json.dumps({'svg': svg, 'notes': len(notes), 'pitch_range': [min_pitch, max_pitch], 'duration': max_time}))
`;
  const result = spawnSync('python3.10', ['-c', pyCode], {timeout:15000, encoding:'utf8', maxBuffer: 1024*1024});
  if (result.error) throw result.error;
  const lines = result.stdout.split('\n').filter(l => l.startsWith('{'));
  return JSON.parse(lines[lines.length - 1]);
}

const midiFile = process.argv[2];
if (midiFile) {
  const result = renderSVG(midiFile);
  if (process.argv.includes('--save')) {
    require('fs').writeFileSync(midiFile.replace('.mid', '.svg'), result.svg);
    console.log(`Saved: ${midiFile.replace('.mid', '.svg')}`);
  } else {
    console.log(result.svg);
  }
} else {
  console.log("Usage: node lib/visualizer.js <midi_file> [--save]");
}

module.exports = { renderSVG };
