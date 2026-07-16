"""Parse govinfo CREC daily-package zips into party-attributed floor speeches.

Input:  CREC-YYYY-MM-DD.zip (govinfo.gov package download, keyless)
Output: list of dicts {date, granule, chamber, speaker, bioguide, party, text}

Speaker attribution comes from the package's mods.xml, which lists each granule's
SPEAKING members with bioGuideId, party, and the parsed name exactly as it
appears in the transcript ("Mr. HOYER", "Ms. PELOSI"). We split each granule's
text on speaker-header lines and attribute the spans.

Only House (PgH*) and Senate (PgS*) pages are used — Daily Digest (PgD) and
Extensions of Remarks (PgE, written insertions, not spoken) are excluded.
"""
import re
import zipfile
import html as htmllib
from xml.etree import ElementTree as ET

MODS_NS = {'m': 'http://www.loc.gov/mods/v3'}

# Header that opens a member's speaking turn in CREC text, e.g.
#   "  Mr. HOYER. Mr. Speaker, ..." / "  Ms. PELOSI of California. ..."
SPEAKER_HEADER = re.compile(
    r'^  ((?:Mr|Ms|Mrs|Miss)\. ([A-Z][A-Za-z\'\-]*[A-Z][A-Za-z\'\-]*|[A-Z]{2,})'
    r'(?: of [A-Z][a-zA-Z ]+?)?)\.\s',
    re.M)

# Non-member chair headers we split on but do not attribute
CHAIR_HEADER = re.compile(
    r'^  (The (?:ACTING |VICE )?(?:SPEAKER|PRESIDENT|PRESIDING OFFICER|CHAIR|CLERK)'
    r'[^.\n]*)\.\s', re.M)


def _granule_members(mods_bytes):
    """granule id -> {'chamber': 'H'|'S', 'members': {SURNAME_UPPER: (bioguide, party)}}"""
    root = ET.fromstring(mods_bytes)
    out = {}
    for rel in root.findall('.//m:relatedItem[@type="constituent"]', MODS_NS):
        gid = rel.get('ID', '')
        if not gid.startswith('id-'):
            continue
        gid = gid[3:]
        members = {}
        chamber = None
        for cm in rel.findall('.//m:extension/m:congMember', MODS_NS):
            if cm.get('role') != 'SPEAKING':
                continue
            chamber = chamber or cm.get('chamber')
            party = cm.get('party')
            bio = cm.get('bioGuideId')
            parsed = cm.find('m:name[@type="parsed"]', MODS_NS)
            if parsed is None or not party:
                continue
            # "Mr. HOYER" / "Ms. PELOSI of California" -> HOYER / PELOSI
            name = parsed.text or ''
            mm = re.match(r'(?:Mr|Ms|Mrs|Miss)\.\s+([A-Z][A-Za-z\'\- ]+?)(?:\s+of\s+.*)?$',
                          name.strip())
            if mm:
                members[mm.group(1).strip().upper()] = (bio, party)
        if members:
            out[gid] = {'chamber': chamber, 'members': members}
    return out


def _granule_text(raw_htm):
    """Extract transcript text from a CREC granule htm (content is inside <pre>)."""
    m = re.search(r'<pre>(.*?)</pre>', raw_htm, re.S | re.I)
    txt = m.group(1) if m else raw_htm
    txt = re.sub(r'<[^>]+>', '', txt)
    txt = htmllib.unescape(txt)
    # strip page-break/timestamp artifacts: "[[Page H2734]]", "{time} 1400"
    txt = re.sub(r'\[\[Page [^\]]+\]\]', ' ', txt)
    txt = re.sub(r'\{time\}\s*\d{4}', ' ', txt)
    return txt


def parse_package(zip_path):
    """Yield speech dicts from one CREC daily zip."""
    z = zipfile.ZipFile(zip_path)
    names = z.namelist()
    mods_name = next(n for n in names if n.endswith('/mods.xml'))
    date = re.search(r'CREC-(\d{4}-\d{2}-\d{2})', mods_name).group(1)
    gmeta = _granule_members(z.read(mods_name))

    for n in sorted(names):
        m = re.search(r'/(CREC-[\d-]+-pt\d+-Pg([A-Z]+)[\dA-Za-z-]*)\.htm$', n)
        if not m:
            continue
        gid, pgtype = m.group(1), m.group(2)
        if pgtype not in ('H', 'S'):          # floor speech pages only
            continue
        meta = gmeta.get(gid)
        if not meta:                           # no SPEAKING members -> procedural
            continue
        text = _granule_text(z.read(n).decode('utf-8', 'replace'))

        # split into turns on member/chair headers
        events = []
        for hm in SPEAKER_HEADER.finditer(text):
            events.append((hm.start(), hm.end(), hm.group(2).upper()))
        for cm in CHAIR_HEADER.finditer(text):
            events.append((cm.start(), cm.end(), None))
        events.sort()

        for i, (s, e, surname) in enumerate(events):
            if surname is None:
                continue
            info = meta['members'].get(surname)
            if not info:
                continue
            end = events[i + 1][0] if i + 1 < len(events) else len(text)
            body = re.sub(r'\s+', ' ', text[e:end]).strip()
            if len(body) < 200:               # skip procedural one-liners
                continue
            yield {
                'date': date, 'granule': gid, 'chamber': meta['chamber'],
                'speaker': surname, 'bioguide': info[0], 'party': info[1],
                'text': body,
            }


if __name__ == '__main__':
    import sys
    from collections import Counter
    speeches = list(parse_package(sys.argv[1]))
    by_party = Counter(s['party'] for s in speeches)
    words = sum(len(s['text'].split()) for s in speeches)
    print(f"{len(speeches)} speeches, {words:,} words, by party: {dict(by_party)}")
    for s in speeches[:3]:
        print(f"\n[{s['party']}] {s['speaker']} ({s['chamber']}) {s['granule']}")
        print(' ', s['text'][:220], '...')
