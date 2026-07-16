"""Build empirical_linguistic_data.csv from per-Congress metric results.

Reads epochs.jsonl (keeping the latest record per congress label), assigns
each Congress's values to its midpoint year, min-max normalizes each raw
series to 0-1 across the full period, and PCHIP-interpolates to every year
1994-2025 — the same interpolation scheme the original design specified.

Columns: Year, Lexical_Drift_X, Outrage_Tone_Y, Semantic_Distance_Z
         (+ *_raw columns for the paper's appendix).
"""
import json
import os

import numpy as np
import pandas as pd
from scipy.interpolate import PchipInterpolator

RESULTS = r'D:\decoherence-data\results\epochs.jsonl'
OUT = r'D:\decoherence-data\results\empirical_linguistic_data.csv'


def load_epochs():
    latest = {}
    with open(RESULTS, encoding='utf-8') as f:
        for line in f:
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            if rec.get('label', '').startswith('congress-'):
                latest[rec['label']] = rec
    rows = []
    for rec in latest.values():
        years = rec['years']
        rows.append({'year_mid': sum(years) / len(years),
                     'x_raw': rec['x_raw_accuracy'],
                     'y_raw': rec['y_raw_arousal'],
                     'z_raw': rec['z_raw_distance'],
                     'label': rec['label']})
    return pd.DataFrame(rows).sort_values('year_mid').reset_index(drop=True)


def main():
    ep = load_epochs()
    print(ep[['label', 'year_mid', 'x_raw', 'y_raw', 'z_raw']].to_string(index=False))

    def norm(s):
        return (s - s.min()) / (s.max() - s.min())

    years_full = np.arange(1994, 2026)
    out = {'Year': years_full}
    for col, name in [('x_raw', 'Lexical_Drift_X'),
                      ('y_raw', 'Outrage_Tone_Y'),
                      ('z_raw', 'Semantic_Distance_Z')]:
        interp_raw = PchipInterpolator(ep['year_mid'], ep[col])
        raw_yearly = interp_raw(np.clip(years_full, ep['year_mid'].min(),
                                        ep['year_mid'].max()))
        out[name + '_raw'] = raw_yearly
        rn = (raw_yearly - raw_yearly.min()) / (raw_yearly.max() - raw_yearly.min())
        out[name] = np.clip(rn, 0, 1)

    df = pd.DataFrame(out)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    df.to_csv(OUT, index=False, float_format='%.6f')
    print(f'\nwrote {OUT} ({len(df)} years)')


if __name__ == '__main__':
    main()
