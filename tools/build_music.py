"""
Publish selected Suno songs to the misterconsistency.com site.

Reads the selection in tools/site_songs.txt (which songs, in what order), copies their
audio + cover art from the Suno Library into assets/music/, and rebuilds songs.js.

- Selection file absent  -> falls back to every song in published_manifest.json (old behaviour).
- Nothing is deleted: de-selected songs' files are left in place (just not referenced by
  songs.js, so they don't appear on the site) and reported as orphans for you to clean up.
- Animated covers (.mp4) already in the covers folder are preserved.
"""
import json, re, shutil, os
from PIL import Image

SRC = r"D:\Cowbird Capital LP Dropbox\Data Train\Suno Library"
SITE = r"D:\Cowbird Capital LP Dropbox\Data Train\misterconsistency-site"
SELECTION = os.path.join(SITE, "tools", "site_songs.txt")
AUD_OUT = os.path.join(SITE, "assets", "music", "audio")
COV_OUT = os.path.join(SITE, "assets", "music", "covers")
os.makedirs(AUD_OUT, exist_ok=True); os.makedirs(COV_OUT, exist_ok=True)

manifest = json.load(open(os.path.join(SRC, "published_manifest.json"), encoding="utf-8"))
by_id8 = {t["id"][:8]: t for t in manifest}

def index_by_id8(folder):
    d = {}
    if not os.path.isdir(folder):
        return d
    for fn in os.listdir(folder):
        m = re.search(r"\[([0-9a-f]{8})\]", fn)
        if m: d[m.group(1)] = fn
    return d

aud = index_by_id8(os.path.join(SRC, "audio"))
cov = index_by_id8(os.path.join(SRC, "cover_art"))
anim_dir = os.path.join(SRC, "animated_covers")
anim = index_by_id8(anim_dir)

def load_selection():
    """Return ordered list of id8 from site_songs.txt, or None to publish everything."""
    if not os.path.exists(SELECTION):
        return None
    ids = []
    for line in open(SELECTION, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        tok = line.split()[0].lower()
        if re.fullmatch(r"[0-9a-f]{8}", tok):
            ids.append(tok)
    return ids

sel = load_selection()
order = sel if sel is not None else [t["id"][:8] for t in manifest]

songs = []
for id8 in order:
    t = by_id8.get(id8)
    if not t:
        print("SKIP (not a published song):", id8); continue
    title = t["title"]
    if id8 not in aud or id8 not in cov:
        print("MISSING audio/cover in library for", id8, title); continue
    shutil.copy2(os.path.join(SRC, "audio", aud[id8]), os.path.join(AUD_OUT, id8 + ".mp3"))
    im = Image.open(os.path.join(SRC, "cover_art", cov[id8])).convert("RGB")
    im.thumbnail((640, 640), Image.LANCZOS)
    im.save(os.path.join(COV_OUT, id8 + ".jpg"), quality=82, optimize=True, progressive=True)
    entry = {"id": id8, "title": title,
             "audio": f"assets/music/audio/{id8}.mp3",
             "cover": f"assets/music/covers/{id8}.jpg"}
    # animated cover: copy from the library if present, then attach if an mp4 exists either way
    if id8 in anim:
        shutil.copy2(os.path.join(anim_dir, anim[id8]), os.path.join(COV_OUT, id8 + ".mp4"))
    if os.path.exists(os.path.join(COV_OUT, id8 + ".mp4")):
        entry["anim"] = f"assets/music/covers/{id8}.mp4"
    songs.append(entry)

with open(os.path.join(SITE, "songs.js"), "w", encoding="utf-8") as f:
    f.write("window.SONGS = " + json.dumps(songs, ensure_ascii=False) + ";\n")

# refresh the reference list at the bottom of the selection file (all published songs)
if os.path.exists(SELECTION):
    text = open(SELECTION, encoding="utf-8").read()
    marker = "\n# === ALL PUBLISHED SONGS (reference — copy an id above to feature it) ==="
    text = text.split(marker)[0].rstrip() + "\n"
    ref = marker + "\n" + "".join(
        f"#   {t['id'][:8]}  {t['title']}\n" for t in manifest)
    with open(SELECTION, "w", encoding="utf-8") as f:
        f.write(text + ref)

# report orphans: music files in the repo not referenced by the new songs.js
kept = {s["id"] for s in songs}
orphans = []
for folder, ext in ((AUD_OUT, ".mp3"), (COV_OUT, ".jpg"), (COV_OUT, ".mp4")):
    for fn in os.listdir(folder):
        if fn.endswith(ext) and fn[:8] not in kept:
            orphans.append(os.path.relpath(os.path.join(folder, fn), SITE))

cov_bytes = sum(os.path.getsize(os.path.join(COV_OUT, f)) for f in os.listdir(COV_OUT))
print(f"published to site: {len(songs)} songs | covers total: {cov_bytes/1024/1024:.1f} MB")
print("order:", " | ".join(s["title"] for s in songs))
if orphans:
    print(f"\nOrphaned files (in repo but not on the site now) - delete if you like:")
    for o in orphans: print("  ", o)
