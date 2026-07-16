"""Run the three metrics for every Congress epoch, 103rd (1994) - 119th (2025).

Each epoch = one Congress's calendar years, restricted to what govinfo CREC
covers (1994+ ; 2026 excluded so the series ends at 2025 per the piece's spec).

Usage: python run_all_epochs.py [--only 104,110]   (default: all missing)
"""
import glob
import json
import os
import sys

import run_epoch

RESULTS = run_epoch.RESULTS
CREC_DIR = run_epoch.CREC_DIR

EPOCHS = []  # (congress, [years])
for congress in range(103, 120):
    y0 = 1789 + 2 * (congress - 1)
    years = [y for y in (y0, y0 + 1) if 1994 <= y <= 2025]
    if years:
        EPOCHS.append((congress, years))


def done_labels():
    if not os.path.exists(RESULTS):
        return set()
    labels = set()
    with open(RESULTS, encoding='utf-8') as f:
        for line in f:
            try:
                rec = json.loads(line)
                if all(k in rec for k in ('x', 'y_raw_arousal', 'z_raw_distance')):
                    labels.add(rec['label'])
            except json.JSONDecodeError:
                pass
    return labels


def main():
    only = None
    if '--only' in sys.argv:
        only = {int(c) for c in sys.argv[sys.argv.index('--only') + 1].split(',')}
    finished = done_labels()
    for congress, years in EPOCHS:
        if only and congress not in only:
            continue
        label = f'congress-{congress}'
        if label in finished:
            print(f'{label}: already done, skipping')
            continue
        n_files = sum(len(glob.glob(os.path.join(CREC_DIR, f'CREC-{y}-*.zip')))
                      for y in years)
        if n_files < 50:
            print(f'{label}: only {n_files} issues on disk, skipping (download incomplete)')
            continue
        print(f'=== {label} ({years}, {n_files} issues) ===', flush=True)
        _, _, speeches = run_epoch.load_speeches('crec', [str(y) for y in years])
        import metrics, time
        result = {'label': label, 'years': years,
                  'n_speeches': len(speeches),
                  'n_words': sum(len(s['text'].split()) for s in speeches),
                  'computed_at': time.strftime('%Y-%m-%d %H:%M:%S')}
        print(f"  {result['n_speeches']} speeches, {result['n_words']:,} words", flush=True)
        result.update(metrics.lexical_partisanship(speeches))
        print(f"  X: {result['x']:.3f} (bal.acc {result['x_raw_accuracy']:.3f})", flush=True)
        result.update(metrics.affective_tone(speeches, metrics.load_arousal(run_epoch.VAD)))
        print(f"  Y: {result['y_raw_arousal']:.4f}", flush=True)
        result.update(metrics.semantic_distance(speeches))
        print(f"  Z: {result['z_raw_distance']:.4f} (±{result['z_seed_std']:.4f})", flush=True)
        with open(RESULTS, 'a', encoding='utf-8') as f:
            f.write(json.dumps(result) + '\n')


if __name__ == '__main__':
    main()
