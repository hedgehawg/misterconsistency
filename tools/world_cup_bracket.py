"""Generate a dark/gold typographic World Cup knockout bracket SVG for
misterconsistency.com. Data-driven — edit MATCHES and regenerate."""

OUT = r"D:\Cowbird Capital LP Dropbox\Data Train\misterconsistency-site\assets\world-cup-bracket.svg"

# colors
CARD, BORDER, DIV = "#16171c", "#26272e", "#26272e"
TEXT, DIM, GOLD, CONN = "#e8e6e1", "#9a978f", "#d0a44c", "#3a3b42"
BG = "#0e0f12"

# each match: id -> teams [(name, score_or_None), ...], meta, played(bool)
# score None everywhere -> pending. winner = higher score when played.
M = {
 "M89": (("Canada", 0), ("Morocco", 3), "Jul 4 · Houston", True),
 "M90": (("Paraguay", 0), ("France", 1), "Jul 4 · Philadelphia", True),
 "M93": (("Portugal", 0), ("Spain", 1), "Jul 6 · Dallas", True),
 "M94": (("USA", 1), ("Belgium", 4), "Jul 6 · Seattle", True),
 "M91": (("Brazil", 1), ("Norway", 2), "Jul 5 · NY/NJ", True),
 "M92": (("Mexico", 2), ("England", 3), "Jul 5 · Mexico City", True),
 "M95": (("Egypt", 2), ("Argentina", 3), "Jul 7 · Atlanta", True),
 "M96": (("Switzerland", None), ("Colombia", None), "Jul 7, 4 PM · Toronto", False),
 "M97": (("Morocco", None), ("France", None), "Jul 9, 4 PM · Boston", False),
 "M98": (("Spain", None), ("Belgium", None), "Jul 10, 3 PM · Los Angeles", False),
 "M99": (("Norway", None), ("England", None), "Jul 11, 5 PM · Miami", False),
 "M100": (("Argentina", None), ("Winner M96", None), "Jul 11, 9 PM · Kansas City", False),
 "M101": (("Winner M97", None), ("Winner M98", None), "Jul 14, 3 PM · Dallas", False),
 "M102": (("Winner M99", None), ("Winner M100", None), "Jul 15, 4 PM · Atlanta", False),
 "M104": (("Winner M101", None), ("Winner M102", None), "Jul 19, 3 PM · NY/NJ", False),
 "M103": (("Loser M101", None), ("Loser M102", None), "Jul 18, 4 PM · Miami", False),
}

W, H = 178, 58          # card size
COLX = [20, 220, 420, 620, 820, 1020, 1220]   # 7 column left-edges
VB_W, VB_H = 1418, 900

# y-centers
top, bot = 132, 812
span = bot - top
def frac(i, n): return top + span * (2*i + 1) / (2*n)
R16y = [frac(i, 4) for i in range(4)]     # 0..3
QFy = [frac(i, 2) for i in range(2)]      # 0..1
SFy = frac(0, 1)

# placement: id -> (col, y_center)
POS = {
 "M89": (0, R16y[0]), "M90": (0, R16y[1]), "M93": (0, R16y[2]), "M94": (0, R16y[3]),
 "M97": (1, QFy[0]), "M98": (1, QFy[1]),
 "M101": (2, SFy),
 "M104": (3, SFy),
 "M102": (4, SFy),
 "M99": (5, QFy[0]), "M100": (5, QFy[1]),
 "M91": (6, R16y[0]), "M92": (6, R16y[1]), "M95": (6, R16y[2]), "M96": (6, R16y[3]),
}
BRONZE = ("M103", 3, 720)

svg = []
def esc(s): return s.replace("&", "&amp;")

def card(mid, col, yc, special=None):
    x = COLX[col]; y0 = round(yc - H/2)
    t1, t2, meta, played = M[mid]
    s.append(f'<text x="{x}" y="{y0-6}" font-size="10" fill="{DIM}">{mid} · {esc(meta)}</text>')
    frame = GOLD if special == "final" else BORDER
    fw = "1.6" if special == "final" else "1"
    s.append(f'<rect x="{x}" y="{y0}" width="{W}" height="{H}" rx="7" fill="{CARD}" stroke="{frame}" stroke-width="{fw}"/>')
    s.append(f'<line x1="{x}" y1="{y0+H/2}" x2="{x+W}" y2="{y0+H/2}" stroke="{DIV}" stroke-width="1"/>')
    if special == "final":
        s.append(f'<text x="{x+W/2}" y="{y0-21}" font-size="11" fill="{GOLD}" text-anchor="middle" font-weight="bold" letter-spacing="2">FINAL</text>')
    if special == "bronze":
        s.append(f'<text x="{x+W/2}" y="{y0-21}" font-size="10" fill="{GOLD}" text-anchor="middle" letter-spacing="1.5">BRONZE MATCH</text>')
    for i, (name, sc) in enumerate(((t1[0], t1[1]), (t2[0], t2[1]))):
        ty = y0 + 22 + i*28
        placeholder = name.startswith(("Winner", "Loser"))
        if played:
            other = t2[1] if i == 0 else t1[1]
            win = sc is not None and other is not None and sc > other
            col_ = GOLD if win else DIM
            wt = 'bold' if win else 'normal'
        else:
            col_ = DIM if placeholder else TEXT
            wt = 'normal'
        style = ' font-style="italic"' if placeholder else ''
        s.append(f'<text x="{x+12}" y="{ty}" font-size="13" fill="{col_}" font-weight="{wt}"{style}>{esc(name)}</text>')
        if sc is not None:
            s.append(f'<text x="{x+W-12}" y="{ty}" font-size="13" fill="{col_}" font-weight="{wt}" text-anchor="end">{sc}</text>')

s = svg
# round headers
heads = ["Round of 16", "Quarterfinals", "Semifinal", "Final", "Semifinal", "Quarterfinals", "Round of 16"]
dates = ["July 4–6", "July 9–10", "July 14", "July 19", "July 15", "July 11", "July 5–7"]
for col, (hd, dt) in enumerate(zip(heads, dates)):
    cx = COLX[col] + W/2
    s.append(f'<text x="{cx}" y="72" font-size="12.5" fill="{GOLD}" text-anchor="middle" font-weight="bold" letter-spacing="1.5">{hd.upper()}</text>')
    s.append(f'<text x="{cx}" y="90" font-size="10.5" fill="{DIM}" text-anchor="middle" font-style="italic">{dt}</text>')

# connectors
def conn_L2R(f_top, f_bot, tgt):
    fx = COLX[POS[f_top][0]] + W
    tx = COLX[POS[tgt][0]]
    midx = (fx + tx) / 2
    yt, yb, yc = POS[f_top][1], POS[f_bot][1], POS[tgt][1]
    s.append(f'<path d="M{fx},{yt} H{midx} V{yc} H{tx}" fill="none" stroke="{CONN}" stroke-width="1"/>')
    s.append(f'<path d="M{fx},{yb} H{midx} V{yc}" fill="none" stroke="{CONN}" stroke-width="1"/>')

def conn_R2L(f_top, f_bot, tgt):
    fx = COLX[POS[f_top][0]]
    tx = COLX[POS[tgt][0]] + W
    midx = (fx + tx) / 2
    yt, yb, yc = POS[f_top][1], POS[f_bot][1], POS[tgt][1]
    s.append(f'<path d="M{fx},{yt} H{midx} V{yc} H{tx}" fill="none" stroke="{CONN}" stroke-width="1"/>')
    s.append(f'<path d="M{fx},{yb} H{midx} V{yc}" fill="none" stroke="{CONN}" stroke-width="1"/>')

conn_L2R("M89", "M90", "M97")
conn_L2R("M93", "M94", "M98")
conn_L2R("M97", "M98", "M101")
conn_R2L("M91", "M92", "M99")
conn_R2L("M95", "M96", "M100")
conn_R2L("M99", "M100", "M102")
# SF -> final (both sides)
fx = COLX[POS["M101"][0]] + W; tx = COLX[POS["M104"][0]]; midx = (fx+tx)/2
s.append(f'<path d="M{fx},{SFy} H{tx}" fill="none" stroke="{CONN}" stroke-width="1"/>')
fx = COLX[POS["M102"][0]]; tx = COLX[POS["M104"][0]] + W; midx = (fx+tx)/2
s.append(f'<path d="M{fx},{SFy} H{tx}" fill="none" stroke="{CONN}" stroke-width="1"/>')

# cards
for mid, (col, yc) in POS.items():
    card(mid, col, yc, special=("final" if mid == "M104" else None))
card(BRONZE[0], BRONZE[1], BRONZE[2], special="bronze")

body = "\n".join(s)
out = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VB_W} {VB_H}" font-family="Helvetica Neue, Arial, sans-serif" role="img" aria-label="2026 Men's World Cup knockout bracket, as of July 7 2026">
<rect x="0" y="0" width="{VB_W}" height="{VB_H}" rx="10" fill="{BG}"/>
<text x="{VB_W/2}" y="38" font-size="20" fill="{TEXT}" text-anchor="middle" font-family="Georgia, serif">2026 Men’s World Cup — Road to the Final</text>
{body}
</svg>'''
open(OUT, "w", encoding="utf-8").write(out)
print("wrote", OUT, len(out), "bytes")
