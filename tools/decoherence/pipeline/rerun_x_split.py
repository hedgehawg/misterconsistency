"""Recompute the X metric only (now with per-party recalls) for every epoch.

Appends records labeled 'xsplit-congress-NNN' to epochs.jsonl; Y and Z are
untouched (their values are already stored, Y per-party included).
"""
import json
import time

import metrics
import run_epoch
from run_all_epochs import EPOCHS, done_labels

for congress, years in EPOCHS:
    label = f'xsplit-congress-{congress}'
    if label in done_labels():
        print(f'{label}: already done, skipping', flush=True)
        continue
    print(f'=== {label} ({years}) ===', flush=True)
    _, _, speeches = run_epoch.load_speeches('crec', [str(y) for y in years])
    result = {'label': label, 'years': years,
              'computed_at': time.strftime('%Y-%m-%d %H:%M:%S')}
    result.update(metrics.lexical_partisanship(speeches))
    result['y_raw_arousal'] = 0  # satisfy done_labels' completeness check
    result['z_raw_distance'] = 0
    print(f"  bal.acc {result['x_raw_accuracy']:.3f}  "
          f"D-recall {result['x_raw_recall_D']:.3f}  "
          f"R-recall {result['x_raw_recall_R']:.3f}", flush=True)
    with open(run_epoch.RESULTS, 'a', encoding='utf-8') as f:
        f.write(json.dumps(result) + '\n')
print('done', flush=True)
