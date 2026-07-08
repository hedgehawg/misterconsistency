"""Generate a dark/gold typographic World Cup knockout bracket SVG for
misterconsistency.com.

AUTOMATION: you only ever edit RESULTS. Teams propagate through the tree
automatically — enter a score for a match and its winner (and the bronze-match
losers) flow into every downstream slot. Penalty shootouts: pass (ga, gb, pa, pb).
Country flags (base64 PNGs) live in flags_b64.py."""

from flags_b64 import FLAGS

OUT = r"D:\Cowbird Capital LP Dropbox\Data Train\misterconsistency-site\assets\world-cup-bracket.svg"
AS_OF = "July 8, 2026"

CARD, BORDER, DIV = "#16171c", "#26272e", "#26272e"
TEXT, DIM, GOLD, CONN = "#e8e6e1", "#9a978f", "#d0a44c", "#3a3b42"
BG = "#0e0f12"

# ---- the bracket tree: each match's two feeders ----
# a feeder is a country (Round of 16 seed) or ("W", mid) / ("L", mid)
TREE = {
 "M89": ("Canada", "Morocco"),        "M90": ("Paraguay", "France"),
 "M93": ("Portugal", "Spain"),        "M94": ("USA", "Belgium"),
 "M91": ("Brazil", "Norway"),         "M92": ("Mexico", "England"),
 "M95": ("Egypt", "Argentina"),       "M96": ("Switzerland", "Colombia"),
 "M97": (("W", "M89"), ("W", "M90")), "M98": (("W", "M93"), ("W", "M94")),
 "M99": (("W", "M91"), ("W", "M92")), "M100": (("W", "M95"), ("W", "M96")),
 "M101": (("W", "M97"), ("W", "M98")), "M102": (("W", "M99"), ("W", "M100")),
 "M104": (("W", "M101"), ("W", "M102")),
 "M103": (("L", "M101"), ("L", "M102")),
}
# ---- the ONLY thing to edit as the tournament plays out ----
# mid -> (goals_a, goals_b) or (goals_a, goals_b, pens_a, pens_b) for shootouts
RESULTS = {
 "M89": (0, 3), "M90": (0, 1), "M93": (0, 1), "M94": (1, 4),
 "M91": (1, 2), "M92": (2, 3), "M95": (2, 3), "M96": (0, 0, 4, 3),
}
META = {
 "M89": "Jul 4 · Houston", "M90": "Jul 4 · Philadelphia", "M93": "Jul 6 · Dallas",
 "M94": "Jul 6 · Seattle", "M91": "Jul 5 · NY/NJ", "M92": "Jul 5 · Mexico City",
 "M95": "Jul 7 · Atlanta", "M96": "Jul 7 · Vancouver (pens)",
 "M97": "Jul 9, 4 PM · Boston", "M98": "Jul 10, 3 PM · Los Angeles",
 "M99": "Jul 11, 5 PM · Miami", "M100": "Jul 11, 9 PM · Kansas City",
 "M101": "Jul 14, 3 PM · Dallas", "M102": "Jul 15, 4 PM · Atlanta",
 "M104": "Jul 19, 3 PM · NY/NJ", "M103": "Jul 18, 4 PM · Miami",
}

# ---- resolution: winners/losers flow through the tree ----
def winner(mid):
    r = RESULTS.get(mid)
    if not r: return None
    ga, gb = r[0], r[1]; pa = r[2] if len(r) > 2 else None; pb = r[3] if len(r) > 2 else None
    a, b = teams(mid)
    if ga > gb or (ga == gb and pa is not None and pa > pb): return a
    if gb > ga or (ga == gb and pb is not None and pb > pa): return b
    return None

def loser(mid):
    if not RESULTS.get(mid): return None
    a, b = teams(mid); w = winner(mid)
    return b if w == a else a

def resolve(src):
    if isinstance(src, str): return src
    return winner(src[1]) if src[0] == "W" else loser(src[1])

def teams(mid):
    a, b = TREE[mid]
    return resolve(a), resolve(b)

def slot(src):
    """-> (display_name, is_placeholder)"""
    if isinstance(src, str): return src, False
    r = resolve(src)
    if r: return r, False
    return ("Winner " if src[0] == "W" else "Loser ") + src[1], True

# ---- layout ----
W, H = 236, 76
COLX = [24, 288, 552, 816, 1080, 1344, 1608]
VB_W, VB_H = 1868, 1200
top, bot = 176, 1096
span = bot - top
def frac(i, n): return top + span * (2*i + 1) / (2*n)
R16y = [frac(i, 4) for i in range(4)]
QFy = [frac(i, 2) for i in range(2)]
SFy = frac(0, 1)
POS = {
 "M89": (0, R16y[0]), "M90": (0, R16y[1]), "M93": (0, R16y[2]), "M94": (0, R16y[3]),
 "M97": (1, QFy[0]), "M98": (1, QFy[1]),
 "M101": (2, SFy), "M104": (3, SFy), "M102": (4, SFy),
 "M99": (5, QFy[0]), "M100": (5, QFy[1]),
 "M91": (6, R16y[0]), "M92": (6, R16y[1]), "M95": (6, R16y[2]), "M96": (6, R16y[3]),
}
BRONZE = ("M103", 3, 990)

svg = []
def esc(s): return s.replace("&", "&amp;")
s = svg

def card(mid, col, yc, special=None):
    x = COLX[col]; y0 = round(yc - H/2)
    res = RESULTS.get(mid); played = res is not None
    win = winner(mid)
    s.append(f'<text x="{x}" y="{y0-9}" font-size="13" fill="{DIM}">{mid} · {esc(META[mid])}</text>')
    frame = GOLD if special == "final" else BORDER
    fw = "1.8" if special == "final" else "1.1"
    s.append(f'<rect x="{x}" y="{y0}" width="{W}" height="{H}" rx="9" fill="{CARD}" stroke="{frame}" stroke-width="{fw}"/>')
    s.append(f'<line x1="{x}" y1="{y0+H/2}" x2="{x+W}" y2="{y0+H/2}" stroke="{DIV}" stroke-width="1"/>')
    if special == "final":
        s.append(f'<text x="{x+W/2}" y="{y0-30}" font-size="15" fill="{GOLD}" text-anchor="middle" font-weight="bold" letter-spacing="2.5">FINAL</text>')
    if special == "bronze":
        s.append(f'<text x="{x+W/2}" y="{y0-30}" font-size="13.5" fill="{GOLD}" text-anchor="middle" letter-spacing="2">BRONZE MATCH</text>')
    slots = [slot(TREE[mid][0]), slot(TREE[mid][1])]
    for i, (name, ph) in enumerate(slots):
        ty = y0 + 28 + i*33
        if played:
            is_win = name == win
            col_ = GOLD if is_win else DIM
            wt = 'bold' if is_win else 'normal'
        else:
            col_ = DIM if ph else TEXT
            wt = 'normal'
        if name in FLAGS:
            s.append(f'<image x="{x+12}" y="{ty-16}" width="27" height="19" href="data:image/png;base64,{FLAGS[name]}" preserveAspectRatio="xMidYMid meet"/>')
        style = ' font-style="italic"' if ph else ''
        s.append(f'<text x="{x+47}" y="{ty}" font-size="16.5" fill="{col_}" font-weight="{wt}"{style}>{esc(name)}</text>')
        if played:
            goals = res[0] if i == 0 else res[1]
            pen = (res[2] if i == 0 else res[3]) if len(res) > 2 else None
            sc_txt = str(goals) + (f" ({pen})" if pen is not None else "")
            s.append(f'<text x="{x+W-14}" y="{ty}" font-size="16.5" fill="{col_}" font-weight="{wt}" text-anchor="end">{sc_txt}</text>')

# round headers
heads = ["Round of 16", "Quarterfinals", "Semifinal", "Final", "Semifinal", "Quarterfinals", "Round of 16"]
dates = ["July 4–6", "July 9–10", "July 14", "July 19", "July 15", "July 11", "July 5–7"]
for col, (hd, dt) in enumerate(zip(heads, dates)):
    cx = COLX[col] + W/2
    s.append(f'<text x="{cx}" y="108" font-size="16.5" fill="{GOLD}" text-anchor="middle" font-weight="bold" letter-spacing="2">{hd.upper()}</text>')
    s.append(f'<text x="{cx}" y="130" font-size="13.5" fill="{DIM}" text-anchor="middle" font-style="italic">{dt}</text>')

def conn_L2R(f_top, f_bot, tgt):
    fx = COLX[POS[f_top][0]] + W; tx = COLX[POS[tgt][0]]; midx = (fx + tx) / 2
    yt, yb, yc = POS[f_top][1], POS[f_bot][1], POS[tgt][1]
    s.append(f'<path d="M{fx},{yt} H{midx} V{yc} H{tx}" fill="none" stroke="{CONN}" stroke-width="1.2"/>')
    s.append(f'<path d="M{fx},{yb} H{midx} V{yc}" fill="none" stroke="{CONN}" stroke-width="1.2"/>')

def conn_R2L(f_top, f_bot, tgt):
    fx = COLX[POS[f_top][0]]; tx = COLX[POS[tgt][0]] + W; midx = (fx + tx) / 2
    yt, yb, yc = POS[f_top][1], POS[f_bot][1], POS[tgt][1]
    s.append(f'<path d="M{fx},{yt} H{midx} V{yc} H{tx}" fill="none" stroke="{CONN}" stroke-width="1.2"/>')
    s.append(f'<path d="M{fx},{yb} H{midx} V{yc}" fill="none" stroke="{CONN}" stroke-width="1.2"/>')

conn_L2R("M89", "M90", "M97"); conn_L2R("M93", "M94", "M98"); conn_L2R("M97", "M98", "M101")
conn_R2L("M91", "M92", "M99"); conn_R2L("M95", "M96", "M100"); conn_R2L("M99", "M100", "M102")
fx = COLX[POS["M101"][0]] + W; tx = COLX[POS["M104"][0]]
s.append(f'<path d="M{fx},{SFy} H{tx}" fill="none" stroke="{CONN}" stroke-width="1.2"/>')
fx = COLX[POS["M102"][0]]; tx = COLX[POS["M104"][0]] + W
s.append(f'<path d="M{fx},{SFy} H{tx}" fill="none" stroke="{CONN}" stroke-width="1.2"/>')

for mid, (col, yc) in POS.items():
    card(mid, col, yc, special=("final" if mid == "M104" else None))
card(BRONZE[0], BRONZE[1], BRONZE[2], special="bronze")

body = "\n".join(s)
out = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VB_W} {VB_H}" font-family="Helvetica Neue, Arial, sans-serif" role="img" aria-label="2026 Men's World Cup knockout bracket, as of {AS_OF}">
<rect x="0" y="0" width="{VB_W}" height="{VB_H}" rx="12" fill="{BG}"/>
<text x="{VB_W/2}" y="52" font-size="27" fill="{TEXT}" text-anchor="middle" font-family="Georgia, serif">2026 Men’s World Cup — Road to the Final</text>
{body}
</svg>'''
open(OUT, "w", encoding="utf-8").write(out)
print("wrote", OUT, len(out), "bytes | Switzerland ->", "M100" if winner("M96") == "Switzerland" else "?",
      "| M100 teams:", teams("M100"))
