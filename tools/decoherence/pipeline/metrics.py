"""The three decoherence metrics, computed per epoch (one Congress).

Input: speeches as dicts with at least {speaker, party ('D'/'R'), text}.

X  Lexical Partisanship - how well vocabulary predicts party.
   Balanced cross-validated accuracy of a logistic regression over tf-idf
   speaker-documents, rescaled so 0.5 (coin flip) -> 0.0 and 1.0 -> 1.0.
   (Gentzkow/Shapiro/Taddy's construct, simplified to a transparent estimator.)

Y  Affective Tone - mean word arousal, NRC-VAD lexicon.
   Raw epoch mean (all parties pooled); normalize across the full series later.

Z  Semantic Distance - Rodriguez/Spirling-style embedding divergence.
   Separate word2vec per party, orthogonal Procrustes alignment, then
   1 - mean cosine similarity across the shared frequent vocabulary.
"""
import re
from collections import Counter, defaultdict

import numpy as np

TOKEN = re.compile(r"[a-z][a-z'\-]+")

# Chamber-procedure words that track majority control rather than ideology.
PROCEDURAL = {
    'speaker', 'president', 'chairman', 'chairwoman', 'gentleman', 'gentlelady',
    'gentlewoman', 'madam', 'yield', 'yields', 'yielding', 'quorum', 'unanimous',
    'consent', 'colleague', 'colleagues', 'amendment', 'amendments', 'clerk',
    'senator', 'senators', 'congressman', 'congresswoman', 'rollcall', 'cloture',
}


def tokenize(text):
    return TOKEN.findall(text.lower())


# ---------------------------------------------------------------- X: lexical
def lexical_partisanship(speeches, min_speaker_words=1000, word_cap=2000, seed=42):
    """Balanced CV accuracy of party prediction from speaker vocabulary.

    Each speaker document is capped at `word_cap` randomly-sampled words so
    epochs with more floor time per member are not mechanically easier to
    classify (the finite-sample bias Gentzkow et al. correct for).
    """
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import StratifiedKFold, cross_val_score

    rng = np.random.default_rng(seed)
    docs = defaultdict(list)
    for s in speeches:
        if s['party'] in ('D', 'R'):
            docs[(s['party'], s['speaker'])].append(s['text'])
    texts, labels = [], []
    for (party, _spk), chunks in docs.items():
        words = ' '.join(chunks).split()
        if len(words) < min_speaker_words:
            continue
        if len(words) > word_cap:
            start = rng.integers(0, len(words) - word_cap + 1)
            words = words[start:start + word_cap]
        texts.append(' '.join(words))
        labels.append(party)
    if len(texts) < 40 or len(set(labels)) < 2:
        raise ValueError(f'too few speakers for X ({len(texts)})')

    vec = TfidfVectorizer(tokenizer=tokenize, lowercase=True, ngram_range=(1, 2),
                          min_df=5, max_features=50000,
                          stop_words=list(PROCEDURAL), token_pattern=None)
    X = vec.fit_transform(texts)
    y = np.array(labels)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=seed)
    clf = LogisticRegression(max_iter=2000, C=1.0, class_weight='balanced')
    from sklearn.model_selection import cross_val_predict
    pred = cross_val_predict(clf, X, y, cv=cv)
    recall_d = float((pred[y == 'D'] == 'D').mean())   # how identifiable D vocab is
    recall_r = float((pred[y == 'R'] == 'R').mean())   # how identifiable R vocab is
    acc = (recall_d + recall_r) / 2.0                  # balanced accuracy
    return {'x_raw_accuracy': float(acc),
            'x_raw_recall_D': recall_d,
            'x_raw_recall_R': recall_r,
            'x': float(np.clip((acc - 0.5) / 0.5, 0, 1)),
            'n_speakers': len(texts)}


# ----------------------------------------------------------------- Y: arousal
def load_arousal(lexicon_path):
    """word -> arousal (0..1) from NRC-VAD-Lexicon.txt"""
    table = {}
    with open(lexicon_path, encoding='utf-8') as f:
        header = f.readline()   # Word\tValence\tArousal\tDominance
        for line in f:
            parts = line.rstrip('\n').split('\t')
            if len(parts) >= 3:
                try:
                    table[parts[0]] = float(parts[2])
                except ValueError:
                    pass
    return table


def affective_tone(speeches, arousal_table):
    """Count-weighted mean arousal of all lexicon words spoken in the epoch."""
    total, weight = 0.0, 0
    per_party = {'D': [0.0, 0], 'R': [0.0, 0]}
    for s in speeches:
        for tok in tokenize(s['text']):
            a = arousal_table.get(tok)
            if a is not None:
                total += a
                weight += 1
                if s['party'] in per_party:
                    per_party[s['party']][0] += a
                    per_party[s['party']][1] += 1
    if weight == 0:
        raise ValueError('no lexicon hits for Y')
    return {'y_raw_arousal': total / weight,
            'y_raw_arousal_D': per_party['D'][0] / max(per_party['D'][1], 1),
            'y_raw_arousal_R': per_party['R'][0] / max(per_party['R'][1], 1),
            'n_tokens_scored': weight}


# ---------------------------------------------------------------- Z: semantic
def semantic_distance(speeches, vector_size=100, min_count=10, epochs=5,
                      top_shared=2000, word_budget=3_000_000, n_seeds=3):
    """1 - mean cosine similarity of shared vocab after Procrustes alignment.

    Each party's corpus is subsampled to `word_budget` words so embedding
    quality (and hence measured distance) is comparable across epochs, and
    the result is averaged over `n_seeds` word2vec runs for stability
    (Rodriguez & Spirling's embedding-instability caution).
    """
    from gensim.models import Word2Vec
    from scipy.linalg import orthogonal_procrustes

    tokenized = {'D': [], 'R': []}
    for s in speeches:
        if s['party'] in tokenized:
            tokenized[s['party']].append(tokenize(s['text']))
    for party, ss in tokenized.items():
        if sum(len(x) for x in ss) < 500_000:
            raise ValueError(f'too little text for Z ({party})')

    def subsample(ss, seed):
        rng = np.random.default_rng(seed)
        order = rng.permutation(len(ss))
        out, total = [], 0
        for i in order:
            out.append(ss[i])
            total += len(ss[i])
            if total >= word_budget:
                break
        return out

    dists, shared_ns = [], []
    for seed in range(42, 42 + n_seeds):
        models = {}
        for party, ss in tokenized.items():
            models[party] = Word2Vec(subsample(ss, seed), vector_size=vector_size,
                                     window=5, min_count=min_count, workers=8,
                                     epochs=epochs, seed=seed)
        kv_d, kv_r = models['D'].wv, models['R'].wv
        freq = Counter()
        for w in kv_d.index_to_key:
            if w in kv_r.key_to_index and w not in PROCEDURAL:
                freq[w] = kv_d.get_vecattr(w, 'count') + kv_r.get_vecattr(w, 'count')
        shared = [w for w, _ in freq.most_common(top_shared)]
        if len(shared) < 200:
            raise ValueError(f'shared vocab too small for Z ({len(shared)})')
        A = np.stack([kv_d[w] for w in shared])
        B = np.stack([kv_r[w] for w in shared])
        A /= np.linalg.norm(A, axis=1, keepdims=True)
        B /= np.linalg.norm(B, axis=1, keepdims=True)
        R, _ = orthogonal_procrustes(B, A)
        cos = np.sum(A * (B @ R), axis=1)
        dists.append(1.0 - cos.mean())
        shared_ns.append(len(shared))

    return {'z_raw_distance': float(np.mean(dists)),
            'z_seed_std': float(np.std(dists)),
            'n_shared_vocab': int(np.mean(shared_ns))}
