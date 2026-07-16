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
def lexical_partisanship(speeches, min_speaker_words=500, seed=42):
    """Balanced CV accuracy of party prediction from speaker vocabulary."""
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import StratifiedKFold, cross_val_score

    docs = defaultdict(list)
    for s in speeches:
        if s['party'] in ('D', 'R'):
            docs[(s['party'], s['speaker'])].append(s['text'])
    texts, labels = [], []
    for (party, _spk), chunks in docs.items():
        joined = ' '.join(chunks)
        if len(joined.split()) >= min_speaker_words:
            texts.append(joined)
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
    acc = cross_val_score(clf, X, y, cv=cv, scoring='balanced_accuracy').mean()
    return {'x_raw_accuracy': float(acc),
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
                      top_shared=2000, seed=42):
    """1 - mean cosine similarity of shared vocab after Procrustes alignment."""
    from gensim.models import Word2Vec
    from scipy.linalg import orthogonal_procrustes

    sents = {'D': [], 'R': []}
    for s in speeches:
        if s['party'] in sents:
            sents[s['party']].append(tokenize(s['text']))
    models = {}
    for party, ss in sents.items():
        if sum(len(x) for x in ss) < 50000:
            raise ValueError(f'too little text for Z ({party})')
        models[party] = Word2Vec(ss, vector_size=vector_size, window=5,
                                 min_count=min_count, workers=8, epochs=epochs,
                                 seed=seed)
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
    B_al = B @ R
    cos = np.sum(A * B_al, axis=1)
    return {'z_raw_distance': float(1.0 - cos.mean()),
            'n_shared_vocab': len(shared)}
