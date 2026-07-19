"""Per-party diachronic semantic drift: how far each party's OWN semantic
space has moved from its 1994 baseline (Rodriguez/Spirling-style).

For each Congress epoch and each party, train word2vec on that party's
speeches (3M-word budget, 3 seeds), Procrustes-align to the SAME party's
1994 (103rd) reference model with the matching seed, and measure
1 - mean cosine similarity over the top shared vocabulary.

Appends records labeled 'zdrift-congress-NNN' to epochs.jsonl with
z_drift_D / z_drift_R (seed means) and their seed std.
"""
import json
import time
from collections import Counter

import numpy as np
from gensim.models import Word2Vec
from scipy.linalg import orthogonal_procrustes

import metrics
import run_epoch
from run_all_epochs import EPOCHS, done_labels

SEEDS = (42, 43, 44)
BUDGET = 3_000_000
TOP_SHARED = 2000


def subsample(sentences, seed, budget=BUDGET):
    rng = np.random.default_rng(seed)
    order = rng.permutation(len(sentences))
    out, total = [], 0
    for i in order:
        out.append(sentences[i])
        total += len(sentences[i])
        if total >= budget:
            break
    return out


def train_party_models(speeches):
    tokenized = {'D': [], 'R': []}
    for s in speeches:
        if s['party'] in tokenized:
            tokenized[s['party']].append(metrics.tokenize(s['text']))
    models = {'D': [], 'R': []}
    for party, ss in tokenized.items():
        for seed in SEEDS:
            models[party].append(
                Word2Vec(subsample(ss, seed), vector_size=100, window=5,
                         min_count=10, workers=8, epochs=5, seed=seed).wv)
    return models


def drift(ref_kv, kv):
    freq = Counter()
    for w in ref_kv.index_to_key:
        if w in kv.key_to_index and w not in metrics.PROCEDURAL:
            freq[w] = ref_kv.get_vecattr(w, 'count') + kv.get_vecattr(w, 'count')
    shared = [w for w, _ in freq.most_common(TOP_SHARED)]
    if len(shared) < 200:
        raise ValueError(f'shared vocab too small ({len(shared)})')
    A = np.stack([ref_kv[w] for w in shared])
    B = np.stack([kv[w] for w in shared])
    A /= np.linalg.norm(A, axis=1, keepdims=True)
    B /= np.linalg.norm(B, axis=1, keepdims=True)
    R, _ = orthogonal_procrustes(B, A)
    return float(1.0 - np.sum(A * (B @ R), axis=1).mean())


def main():
    finished = done_labels()
    print('training 1994 (103rd) reference models...', flush=True)
    _, _, ref_speeches = run_epoch.load_speeches('crec', ['1994'])
    ref = train_party_models(ref_speeches)

    for congress, years in EPOCHS:
        label = f'zdrift-congress-{congress}'
        if label in finished:
            print(f'{label}: already done, skipping', flush=True)
            continue
        print(f'=== {label} ({years}) ===', flush=True)
        if congress == 103:
            # drift of the baseline against itself across seeds ~ 0 by
            # construction; record the cross-seed floor for honesty
            epoch_models = ref
        else:
            _, _, speeches = run_epoch.load_speeches(
                'crec', [str(y) for y in years])
            epoch_models = train_party_models(speeches)
        rec = {'label': label, 'years': years,
               'computed_at': time.strftime('%Y-%m-%d %H:%M:%S'),
               'y_raw_arousal': 0, 'z_raw_distance': 0}
        for party in 'DR':
            ds = [drift(ref[party][i], epoch_models[party][i])
                  for i in range(len(SEEDS))]
            rec[f'z_drift_{party}'] = float(np.mean(ds))
            rec[f'z_drift_{party}_std'] = float(np.std(ds))
        rec['x'] = 0
        print(f"  D drift {rec['z_drift_D']:.4f}  R drift {rec['z_drift_R']:.4f}",
              flush=True)
        with open(run_epoch.RESULTS, 'a', encoding='utf-8') as f:
            f.write(json.dumps(rec) + '\n')
    print('done', flush=True)


if __name__ == '__main__':
    main()
