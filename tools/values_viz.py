"""Gwen & Bill values map — aggregate 4-judge panel, build radar + heatmap.
Site theme: dark bg, gold, model-brand colors."""
import json, glob
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.path import Path
from matplotlib.spines import Spine
from matplotlib.transforms import Affine2D

S = r"C:\Users\Scott\AppData\Local\Temp\claude\D--Cowbird-Capital-LP-Dropbox-Data-Train\15f3b224-83de-4094-8c4d-a6cdd8809f29\scratchpad"
ASSETS = r"D:\Cowbird Capital LP Dropbox\Data Train\misterconsistency-site\assets"

BG, PANEL, DIM, TEXT, GOLD = "#0e0f12", "#16171c", "#9a978f", "#e8e6e1", "#d0a44c"
COL = {"ChatGPT": "#6fbfa8", "Claude": "#d97757", "Gemini": "#6f9bff", "Grok": "#c9c9c9"}

AXES = ["materialism", "capitalist_achievement", "happiness_source", "gender_agency", "ambition_framing"]
AX_LABEL = ["money can't\nfix it", "success rings\nhollow", "love over\nmoney",
            "the wife gets\nher own life", "ambition is\na trap"]

import re
from svgpath2mpl import parse_path
from matplotlib.patches import PathPatch
LOGO_DIR = r"D:\Cowbird Capital LP Dropbox\Data Train\misterconsistency-site\tools\logos"
def _load(fn):
    return parse_path(re.search(r'\sd="([^"]+)"', open(fn, encoding="utf-8").read()).group(1))
LOGOS = {"ChatGPT": _load(LOGO_DIR + r"\openai.svg"),
         "Claude": _load(LOGO_DIR + r"\claude.svg"),
         "Gemini": _load(LOGO_DIR + r"\gemini.svg"),
         "Grok": parse_path("M2 21 L13 3 L17.5 3 L6.5 21 Z M9 21 L20 3 L24 3 L13 21 Z")}
def draw_logo(fig, model, cx, cy, size):
    p = LOGOS[model]; v = p.vertices
    xmn, ymn = v.min(0); xmx, ymx = v.max(0); ext = max(xmx - xmn, ymx - ymn)
    mx, my = (xmn + xmx) / 2, (ymn + ymx) / 2
    a = fig.add_axes([cx - size/2, cy - size/2, size, size]); a.axis("off"); a.set_aspect("equal")
    a.set_xlim(mx - ext/2*1.1, mx + ext/2*1.1); a.set_ylim(my + ext/2*1.1, my - ext/2*1.1)
    a.add_patch(PathPatch(p, facecolor=COL[model], edgecolor="none"))

MAP = {  # C-id -> (date, model)
 "C01": ("July 2024","ChatGPT"),"C02": ("July 2024","Claude"),"C03": ("July 2024","Gemini"),
 "C04": ("May 2025","ChatGPT"),"C05": ("May 2025","Claude"),"C06": ("May 2025","Gemini"),"C07": ("May 2025","Grok"),
 "C08": ("July 2026","ChatGPT"),"C09": ("July 2026","Claude"),"C10": ("July 2026","Gemini"),"C11": ("July 2026","Grok")}
DATES = ["July 2024", "May 2025", "July 2026"]
MODELS = ["ChatGPT", "Claude", "Gemini", "Grok"]

# ---- aggregate ----
judges = [json.load(open(f, encoding="utf-8")) for f in sorted(glob.glob(S + r"\judges_cross\*.json"))]
print("judges:", len(judges))
mean, std = {}, {}
for cid in MAP:
    for ax in AXES:
        vals = [next(r for r in J if r["id"] == cid)[ax] for J in judges]
        mean[(cid, ax)] = np.mean(vals)
        std[(cid, ax)] = np.std(vals)
print("mean panel std across all cells:", round(np.mean(list(std.values())), 2))

# ================= RADAR =================
N = len(AXES)
angles = np.linspace(0, 2*np.pi, N, endpoint=False)
ang_closed = np.concatenate([angles, [angles[0]]])

fig, axs = plt.subplots(2, 2, figsize=(9.6, 9.8), subplot_kw=dict(polar=True), facecolor=BG)
fig.subplots_adjust(hspace=0.42, wspace=0.42, top=0.88, bottom=0.08, left=0.08, right=0.92)
sit_style = {"July 2024": (":", 1.3, 0.55), "May 2025": ("--", 1.7, 0.8), "July 2026": ("-", 2.3, 1.0)}

for ax, model in zip(axs.flat, MODELS):
    ax.set_facecolor(BG)
    ax.set_theta_offset(np.pi/2); ax.set_theta_direction(-1)
    ax.set_ylim(0, 10)
    ax.set_xticks(angles)
    ax.set_xticklabels(AX_LABEL, color=DIM, fontsize=8)
    ax.tick_params(axis='x', pad=8)
    ax.set_yticks([2,4,6,8]); ax.set_yticklabels([], color=DIM)
    ax.set_rlabel_position(0)
    ax.grid(color="#2a2b31", lw=0.7)
    for spine in ax.spines.values():
        spine.set_color("#2a2b31")
    c = COL[model]
    for date in DATES:
        cid = next((k for k,(d,m) in MAP.items() if d==date and m==model), None)
        if not cid: continue
        vals = [mean[(cid, a)] for a in AXES]
        vc = vals + [vals[0]]
        ls, lw, al = sit_style[date]
        ax.plot(ang_closed, vc, ls=ls, lw=lw, color=c, alpha=al, zorder=3)
        if date == "July 2026" or (model=="Grok" and date=="May 2025") or (model!="Grok" and date=="July 2026"):
            ax.fill(ang_closed, vc, color=c, alpha=0.10, zorder=2)
    ax.set_title("      " + model, color=c, fontsize=13, fontweight="bold", pad=18)

fig.canvas.draw()
for ax, model in zip(axs.flat, MODELS):
    pos = ax.get_position()
    tw = {"ChatGPT": 0.052, "Claude": 0.044, "Gemini": 0.046, "Grok": 0.033}[model]
    draw_logo(fig, model, pos.x0 + pos.width/2 - tw - 0.014, pos.y1 + 0.0135, 0.026)

fig.suptitle("Gwen & Bill — the values map", color=TEXT, fontsize=16, family="serif", y=0.965)
fig.text(0.5, 0.925, "Further out = money can't fix it, success rings hollow, love wins, the wife has her own life, ambition is a trap.  Each ring is one sitting.",
         ha="center", color=DIM, fontsize=8.5)
fig.text(0.5, 0.028, "····· July 2024      – – – May 2025      —— July 2026        (four-judge panel mean, 0–10 each axis)",
         ha="center", color=DIM, fontsize=8.5, family="monospace")
fig.savefig(ASSETS + r"\gwen-bill-values-radar.png", facecolor=BG, dpi=130)
plt.close(fig)
print("saved radar")

# ================= HEATMAP =================
rows = list(MAP.keys())  # C01..C11 in order
M = np.array([[mean[(cid, a)] for a in AXES] for cid in rows])
row_labels = [f"{MAP[c][1]} · {MAP[c][0].replace(' 20',' ’')}" for c in rows]

cmap = LinearSegmentedColormap.from_list("gold", ["#14151a", "#3a2f1c", "#7a5a1e", "#d0a44c", "#f0d79a"])
fig, ax = plt.subplots(figsize=(8.4, 8.6), facecolor=BG)
fig.subplots_adjust(left=0.24, right=0.99, top=0.80, bottom=0.06)
ax.set_facecolor(BG)
im = ax.imshow(M, cmap=cmap, vmin=0, vmax=10, aspect="auto")

ax.set_xticks(range(N))
ax.set_xticklabels([l.replace("\n"," ") for l in AX_LABEL], color=DIM, fontsize=8.5, rotation=18, ha="left")
ax.xaxis.set_ticks_position("top"); ax.xaxis.set_label_position("top")
ax.set_yticks(range(len(rows)))
ax.set_yticklabels(row_labels, fontsize=9)
for t, c in zip(ax.get_yticklabels(), rows):
    t.set_color(COL[MAP[c][1]])
ax.tick_params(length=0)
for sp in ax.spines.values(): sp.set_visible(False)

# group separators between sittings
for y in (2.5, 6.5):
    ax.axhline(y, color=BG, lw=3)

for i in range(len(rows)):
    for j in range(N):
        v = M[i, j]
        ax.text(j, i, f"{v:.1f}", ha="center", va="center",
                color=(BG if v >= 5.5 else TEXT), fontsize=9,
                fontweight="bold" if v>=5.5 else "normal")

fig.suptitle("Gwen & Bill — the values map", color=TEXT, fontsize=16, family="serif", y=0.965)
fig.text(0.615, 0.885, "Brighter = money can't fix it, success rings hollow, love wins, the wife has her own life, ambition is a trap.",
         ha="center", color=DIM, fontsize=8.5)
cbar = fig.colorbar(im, ax=ax, fraction=0.035, pad=0.03)
cbar.set_ticks([0,5,10]); cbar.ax.tick_params(colors=DIM, labelsize=8)
cbar.outline.set_edgecolor("#2a2b31")
fig.savefig(ASSETS + r"\gwen-bill-values-heatmap.png", facecolor=BG, dpi=130)
plt.close(fig)
print("saved heatmap")

# print a quick summary table
print("\n=== panel means ===")
for c in rows:
    d,m = MAP[c]
    print(f"{d:9s} {m:8s} " + " ".join(f"{mean[(c,a)]:.1f}" for a in AXES))
