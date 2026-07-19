"""The measured-series chart, party-split: cyan = Democrats, magenta =
Republicans (matching the torus animation), gold = combined.

X panel: per-party classifier recall (how identifiable each side's vocabulary
is) around the combined balanced accuracy. Y panel: per-party mean arousal
around the combined. Z panel: the single pairwise distance (it has no
per-party decomposition - it IS the distance between the parties).

Output: D:\decoherence-data\results\measured_series.png
"""
import json

import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import PchipInterpolator

RESULTS = r'D:\decoherence-data\results\epochs.jsonl'
OUT = r'D:\decoherence-data\results\measured_series.png'

GOLD, CYAN, MAGENTA = '#d0a44c', '#00FFFF', '#FF00FF'

main, xsplit = {}, {}
with open(RESULTS, encoding='utf-8') as f:
    for line in f:
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        label = rec.get('label', '')
        if label.startswith('congress-'):
            main[label] = rec
        elif label.startswith('xsplit-congress-'):
            xsplit[label.replace('xsplit-', '')] = rec

rows = []
for label, rec in main.items():
    xs = xsplit.get(label)
    if not xs:
        continue
    rows.append({
        'year': sum(rec['years']) / len(rec['years']),
        'x_all': xs['x_raw_accuracy'], 'x_d': xs['x_raw_recall_D'], 'x_r': xs['x_raw_recall_R'],
        'y_all': rec['y_raw_arousal'], 'y_d': rec['y_raw_arousal_D'], 'y_r': rec['y_raw_arousal_R'],
        'z': rec['z_raw_distance'],
    })
rows.sort(key=lambda r: r['year'])
yrs = np.array([r['year'] for r in rows])
years_full = np.arange(1994, 2026)


def smooth(key):
    return PchipInterpolator(yrs, [r[key] for r in rows])(
        np.clip(years_full, yrs.min(), yrs.max()))


fig, axes = plt.subplots(3, 1, figsize=(10, 11), facecolor='#0d1117', sharex=True)
events = {1995: 'Gingrich\n104th', 2001.7: '9/11', 2010: 'Tea Party\nera',
          2021.2: '117th\n(Jan 6 era)'}

panels = [
    (axes[0], 'X: Lexical Partisanship\n(party predictability from vocabulary, bal. accuracy)',
     [('x_all', GOLD, 'Combined', 2.2), ('x_d', CYAN, 'Democrats', 1.4), ('x_r', MAGENTA, 'Republicans', 1.4)]),
    (axes[1], 'Y: Affective Tone\n(how emotionally charged the language runs — procedural/calm vs outrage; NRC-VAD arousal)',
     [('y_all', GOLD, 'Combined', 2.2), ('y_d', CYAN, 'Democrats', 1.4), ('y_r', MAGENTA, 'Republicans', 1.4)]),
    (axes[2], 'Z: Semantic Distance\n(same words, same meanings? 1 − cosine sim after Procrustes alignment — one line: it IS the D–R distance)',
     [('z', GOLD, None, 2.2)]),
]

for ax, title, series in panels:
    ax.set_facecolor('#0d1117')
    for key, color, lbl, lw in series:
        ax.plot(years_full, smooth(key), color=color, linewidth=lw, label=lbl)
    ax.set_title(title, color='white', fontsize=10.5, loc='left')
    ax.grid(color='#30363d', linestyle='--', linewidth=0.5)
    ax.tick_params(colors='#8b949e')
    for spine in ax.spines.values():
        spine.set_color('#30363d')
    for yr in events:
        ax.axvline(yr, color='#9a978f', linewidth=0.6, alpha=0.5)

for yr, label in events.items():
    axes[0].text(yr, 0.03, label, transform=axes[0].get_xaxis_transform(),
                 color='#9a978f', fontsize=8, ha='center', va='bottom')

leg = axes[0].legend(loc='upper left', facecolor='#0d1117', edgecolor='#30363d',
                     labelcolor='white', fontsize=9)
axes[-1].set_xlabel('Year', color='#8b949e')

fig.suptitle('Measured Linguistic Decoherence — U.S. Congressional Record, 1994–2025\n'
             '640M words, 1.06M floor speeches, single source (govinfo CREC)',
             color='white', fontsize=13, y=0.995)
plt.tight_layout(rect=[0, 0, 1, 0.96])
plt.savefig(OUT, dpi=150, facecolor='#0d1117', bbox_inches='tight')
print('saved', OUT)
