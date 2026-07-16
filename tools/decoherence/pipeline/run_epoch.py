"""Compute the three decoherence metrics for one epoch.

Usage:
  python run_epoch.py stanford 104          # one Congress from hein-daily
  python run_epoch.py crec 2025 [2026]      # calendar years from CREC zips

Appends a JSON line to D:\decoherence-data\results\epochs.jsonl
"""
import glob
import json
import os
import sys
import time

import metrics

RESULTS = r'D:\decoherence-data\results\epochs.jsonl'
CREC_DIR = r'D:\decoherence-data\crec'
VAD = r'D:\decoherence-data\meta\NRC-VAD-Lexicon\NRC-VAD-Lexicon.txt'


def load_speeches(source, args):
    if source == 'stanford':
        import stanford_parse
        congress = int(args[0])
        speeches = list(stanford_parse.parse_congress(congress))
        label = f'congress-{congress}'
        years = stanford_parse.congress_years(congress)
    elif source == 'crec':
        import crec_parse
        speeches = []
        years = [int(a) for a in args]
        for y in years:
            for zp in sorted(glob.glob(os.path.join(CREC_DIR, f'CREC-{y}-*.zip'))):
                speeches.extend(crec_parse.parse_package(zp))
        label = 'crec-' + '-'.join(str(y) for y in years)
        years = (min(years), max(years))
    else:
        raise SystemExit(f'unknown source {source}')
    return label, years, speeches


def main():
    source, args = sys.argv[1], sys.argv[2:]
    label, years, speeches = load_speeches(source, args)
    words = sum(len(s['text'].split()) for s in speeches)
    print(f'{label}: {len(speeches)} speeches, {words:,} words')

    result = {'label': label, 'years': list(years),
              'n_speeches': len(speeches), 'n_words': words,
              'computed_at': time.strftime('%Y-%m-%d %H:%M:%S')}

    t0 = time.time()
    result.update(metrics.lexical_partisanship(speeches))
    print(f"  X lexical: {result['x']:.3f} (bal.acc {result['x_raw_accuracy']:.3f}, "
          f"{result['n_speakers']} speakers)  [{time.time()-t0:.0f}s]")

    t0 = time.time()
    result.update(metrics.affective_tone(speeches, metrics.load_arousal(VAD)))
    print(f"  Y arousal: {result['y_raw_arousal']:.4f} "
          f"(D {result['y_raw_arousal_D']:.4f} / R {result['y_raw_arousal_R']:.4f})  "
          f"[{time.time()-t0:.0f}s]")

    t0 = time.time()
    result.update(metrics.semantic_distance(speeches))
    print(f"  Z semantic: {result['z_raw_distance']:.4f} "
          f"({result['n_shared_vocab']} shared vocab)  [{time.time()-t0:.0f}s]")

    os.makedirs(os.path.dirname(RESULTS), exist_ok=True)
    with open(RESULTS, 'a', encoding='utf-8') as f:
        f.write(json.dumps(result) + '\n')
    print(f'appended -> {RESULTS}')


if __name__ == '__main__':
    main()
