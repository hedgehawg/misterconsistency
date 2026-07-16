"""Read the Stanford (Gentzkow/Shapiro/Taddy) hein-daily corpus, one Congress
at a time, yielding the same speech dicts as crec_parse.

hein-daily.zip contains, per Congress NNN:
  speeches_NNN.txt    speech_id | speech            (pipe-delimited)
  NNN_SpeakerMap.txt  speakerid|speech_id|lastname|firstname|chamber|state|gender|party|district|nonvoting
  descr_NNN.txt       speech metadata incl. date

Congress N covers years 1787+2N-1 .. 1787+2N+1 (104th = 1995-96).
"""
import io
import re
import zipfile

HEIN_DAILY = r'D:\decoherence-data\stanford\hein-daily.zip'


def congress_years(congress):
    start = 1789 + 2 * (congress - 1)
    return (start, start + 1)  # e.g. 104 -> (1995, 1996)


def _open_member(z, name):
    return io.TextIOWrapper(z.open(name), encoding='latin-1', errors='replace')


def parse_congress(congress, zip_path=HEIN_DAILY, min_words=50):
    """Yield {speaker, party, chamber, text, speech_id} for one Congress."""
    z = zipfile.ZipFile(zip_path)
    names = z.namelist()
    nnn = f'{congress:03d}'
    sp_name = next(n for n in names if n.endswith(f'speeches_{nnn}.txt'))
    map_name = next(n for n in names if n.endswith(f'{nnn}_SpeakerMap.txt'))

    meta = {}
    with _open_member(z, map_name) as f:
        header = f.readline().rstrip('\n').split('|')
        idx = {c: i for i, c in enumerate(header)}
        for line in f:
            p = line.rstrip('\n').split('|')
            if len(p) != len(header):
                continue
            party = p[idx['party']]
            if party not in ('D', 'R'):
                continue
            meta[p[idx['speech_id']]] = (
                p[idx['lastname']].upper(), party, p[idx['chamber']])

    with _open_member(z, sp_name) as f:
        f.readline()  # header: speech_id|speech
        for line in f:
            sid, sep, text = line.partition('|')
            if not sep:
                continue
            m = meta.get(sid)
            if not m:
                continue
            text = text.strip()
            if len(text.split()) < min_words:
                continue
            yield {'speech_id': sid, 'speaker': m[0], 'party': m[1],
                   'chamber': m[2], 'text': text}


if __name__ == '__main__':
    import sys
    from collections import Counter
    congress = int(sys.argv[1])
    n, words, parties = 0, 0, Counter()
    for s in parse_congress(congress):
        n += 1
        words += len(s['text'].split())
        parties[s['party']] += 1
    print(f'Congress {congress} ({congress_years(congress)}): '
          f'{n} speeches, {words:,} words, {dict(parties)}')
