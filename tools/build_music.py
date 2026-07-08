import json, re, shutil, os
from PIL import Image

SRC = r"D:\Cowbird Capital LP Dropbox\Data Train\Suno Library"
SITE = r"D:\Cowbird Capital LP Dropbox\Data Train\misterconsistency-site"
AUD_OUT = os.path.join(SITE, "assets", "music", "audio")
COV_OUT = os.path.join(SITE, "assets", "music", "covers")
os.makedirs(AUD_OUT, exist_ok=True); os.makedirs(COV_OUT, exist_ok=True)

manifest = json.load(open(os.path.join(SRC, "published_manifest.json"), encoding="utf-8"))

def index_by_id8(folder):
    d = {}
    for fn in os.listdir(folder):
        m = re.search(r"\[([0-9a-f]{8})\]", fn)
        if m: d[m.group(1)] = fn
    return d

aud = index_by_id8(os.path.join(SRC, "audio"))
cov = index_by_id8(os.path.join(SRC, "cover_art"))
anim_dir = os.path.join(SRC, "animated_covers")
anim = index_by_id8(anim_dir) if os.path.isdir(anim_dir) else {}

songs = []
for t in manifest:
    id8 = t["id"][:8]
    title = t["title"]
    if id8 not in aud or id8 not in cov:
        print("MISSING for", id8, title); continue
    shutil.copy2(os.path.join(SRC, "audio", aud[id8]), os.path.join(AUD_OUT, id8 + ".mp3"))
    im = Image.open(os.path.join(SRC, "cover_art", cov[id8])).convert("RGB")
    im.thumbnail((640, 640), Image.LANCZOS)
    im.save(os.path.join(COV_OUT, id8 + ".jpg"), quality=82, optimize=True, progressive=True)
    entry = {"id": id8, "title": title,
             "audio": f"assets/music/audio/{id8}.mp3",
             "cover": f"assets/music/covers/{id8}.jpg"}
    if id8 in anim:  # animated cover (mp4) — plays in the tile in place of the still
        shutil.copy2(os.path.join(anim_dir, anim[id8]), os.path.join(COV_OUT, id8 + ".mp4"))
        entry["anim"] = f"assets/music/covers/{id8}.mp4"
    songs.append(entry)

with open(os.path.join(SITE, "songs.js"), "w", encoding="utf-8") as f:
    f.write("window.SONGS = " + json.dumps(songs, ensure_ascii=False) + ";\n")

cov_bytes = sum(os.path.getsize(os.path.join(COV_OUT, f)) for f in os.listdir(COV_OUT))
print(f"songs: {len(songs)} | covers total: {cov_bytes/1024/1024:.1f} MB")
print("titles:", " | ".join(s["title"] for s in songs[:5]), "...")
