"""Fine-grained export: one chronological pass over the full CREC corpus.

Produces, in D:\decoherence-data\results\export\:
  y_daily.csv       date, n_speeches_D/R, n_tokens_D/R, arousal_D/R/combined
  x_quarterly.csv   quarter, bal_accuracy, recall_D, recall_R, n_speakers, n_words
  z_annual.csv      year, z_between (D-R distance), z_drift_D, z_drift_R
                    (drift = distance from the same party's 1994 space), seed stds
Granularity rationale: Y is a lexicon mean (daily is honest); X needs enough
speakers per slice (quarterly floor); Z needs millions of words per party
(annual floor). 2 seeds for annual Z (std recorded).
"""
import glob
import json
import os
import time
from collections import Counter, defaultdict

import numpy as np

import crec_parse
import metrics

CREC_DIR = r'D:\decoherence-data\crec'
OUT_DIR = r'D:\decoherence-data\results\export'
VAD = r'D:\decoherence-data\meta\NRC-VAD-Lexicon\NRC-VAD-Lexicon.txt'

SEEDS = (42, 43)
BUDGET = 3_000_000
TOP_SHARED = 2000

os.makedirs(OUT_DIR, exist_ok=True)
arousal = metrics.load_arousal(VAD)


# ---------------------------------------------------------------- helpers
def quarter_of(date):
    y, m, _ = date.split('-')
    return f'{y}Q{(int(m) - 1) // 3 + 1}'


def x_quarter(speaker_docs):
    """Quarterly X with per-party recalls; same estimator/caps as metrics."""
    speeches = [{'speaker': spk, 'party': p, 'text': ' '.join(chunks)}
                for (p, spk), chunks in speaker_docs.items()]
    try:
        r = metrics.lexical_partisanship(speeches)
        return (r['x_raw_accuracy'], r['x_raw_recall_D'], r['x_raw_recall_R'],
                r['n_speakers'])
    except ValueError:
        return (None, None, None, 0)


def train_kv(sent_lists, seed):
    from gensim.models import Word2Vec
    rng = np.random.default_rng(seed)
    order = rng.permutation(len(sent_lists))
    sub, total = [], 0
    for i in order:
        sub.append(sent_lists[i])
        total += len(sent_lists[i])
        if total >= BUDGET:
            break
    return Word2Vec(sub, vector_size=100, window=5, min_count=10,
                    workers=8, epochs=5, seed=seed).wv


def pair_distance(kv_a, kv_b):
    from scipy.linalg import orthogonal_procrustes
    freq = Counter()
    for w in kv_a.index_to_key:
        if w in kv_b.key_to_index and w not in metrics.PROCEDURAL:
            freq[w] = kv_a.get_vecattr(w, 'count') + kv_b.get_vecattr(w, 'count')
    shared = [w for w, _ in freq.most_common(TOP_SHARED)]
    if len(shared) < 200:
        return None
    A = np.stack([kv_a[w] for w in shared])
    B = np.stack([kv_b[w] for w in shared])
    A /= np.linalg.norm(A, axis=1, keepdims=True)
    B /= np.linalg.norm(B, axis=1, keepdims=True)
    R, _ = orthogonal_procrustes(B, A)
    return float(1.0 - np.sum(A * (B @ R), axis=1).mean())


# ---------------------------------------------------------------- the pass
y_rows = []
x_rows = []
z_rows = []

cur_quarter = None
q_docs = defaultdict(list)          # (party, speaker) -> [texts]
cur_year = None
year_tokens = {'D': [], 'R': []}    # token lists per speech
year_refs = {}                      # party -> [kv per seed] for 1994


def flush_quarter():
    global q_docs
    if cur_quarter and q_docs:
        n_words = sum(len(t.split()) for c in q_docs.values() for t in c)
        acc, rd, rr, n_spk = x_quarter(q_docs)
        x_rows.append([cur_quarter, acc, rd, rr, n_spk, n_words])
        print(f'  X {cur_quarter}: acc={acc if acc is None else round(acc,3)} '
              f'({n_spk} speakers)', flush=True)
    q_docs = defaultdict(list)


def flush_year():
    global year_tokens
    if cur_year and (year_tokens['D'] or year_tokens['R']):
        row = [cur_year]
        kvs = {}
        enough = all(sum(len(s) for s in year_tokens[p]) > 500_000 for p in 'DR')
        if enough:
            for p in 'DR':
                kvs[p] = [train_kv(year_tokens[p], s) for s in SEEDS]
            between = [pair_distance(kvs['D'][i], kvs['R'][i])
                       for i in range(len(SEEDS))]
            between = [b for b in between if b is not None]
            row += [float(np.mean(between)), float(np.std(between))]
            if cur_year == 1994:
                year_refs.update(kvs)
            for p in 'DR':
                if year_refs:
                    ds = [pair_distance(year_refs[p][i], kvs[p][i])
                          for i in range(len(SEEDS))]
                    ds = [d for d in ds if d is not None]
                    row += [float(np.mean(ds)), float(np.std(ds))]
                else:
                    row += [None, None]
        else:
            row += [None, None, None, None, None, None]
        z_rows.append(row)
        print(f'  Z {cur_year}: {row[1:]}', flush=True)
    year_tokens = {'D': [], 'R': []}


t0 = time.time()
zips = sorted(glob.glob(os.path.join(CREC_DIR, 'CREC-*.zip')))
print(f'{len(zips)} packages', flush=True)

for k, zp in enumerate(zips):
    date = os.path.basename(zp)[5:15]
    year = int(date[:4])
    if year > 2025:
        break
    q = quarter_of(date)
    global cur_quarter, cur_year
    if q != cur_quarter:
        flush_quarter()
        cur_quarter = q
    if year != cur_year:
        flush_year()
        cur_year = year

    day = {'D': [0.0, 0, 0], 'R': [0.0, 0, 0]}   # arousal_sum, n_tokens, n_speeches
    try:
        speeches = list(crec_parse.parse_package(zp))
    except Exception as e:
        print(f'  PARSE FAIL {date}: {e}', flush=True)
        continue
    for s in speeches:
        p = s['party']
        if p not in day:
            continue
        toks = metrics.tokenize(s['text'])
        a_sum = 0.0
        a_n = 0
        for tok in toks:
            a = arousal.get(tok)
            if a is not None:
                a_sum += a
                a_n += 1
        day[p][0] += a_sum
        day[p][1] += a_n
        day[p][2] += 1
        q_docs[(p, s['speaker'])].append(s['text'])
        year_tokens[p].append(toks)

    nd, nr = day['D'][1], day['R'][1]
    y_rows.append([
        date, day['D'][2], day['R'][2], nd, nr,
        day['D'][0] / nd if nd else None,
        day['R'][0] / nr if nr else None,
        (day['D'][0] + day['R'][0]) / (nd + nr) if (nd + nr) else None,
    ])
    if k % 250 == 0:
        print(f'[{k}/{len(zips)}] {date}  ({(time.time()-t0)/60:.0f} min)',
              flush=True)

flush_quarter()
flush_year()

# ---------------------------------------------------------------- write CSVs
import csv

with open(os.path.join(OUT_DIR, 'y_daily.csv'), 'w', newline='',
          encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['date', 'n_speeches_D', 'n_speeches_R', 'n_scored_tokens_D',
                'n_scored_tokens_R', 'arousal_D', 'arousal_R',
                'arousal_combined'])
    w.writerows(y_rows)

with open(os.path.join(OUT_DIR, 'x_quarterly.csv'), 'w', newline='',
          encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['quarter', 'bal_accuracy_combined', 'recall_D', 'recall_R',
                'n_speakers', 'n_words'])
    w.writerows(x_rows)

with open(os.path.join(OUT_DIR, 'z_annual.csv'), 'w', newline='',
          encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['year', 'z_between_DR', 'z_between_seed_std',
                'z_drift_D_vs_1994', 'z_drift_D_seed_std',
                'z_drift_R_vs_1994', 'z_drift_R_seed_std'])
    w.writerows(z_rows)

print(f'\nDONE in {(time.time()-t0)/60:.0f} min -> {OUT_DIR}', flush=True)
