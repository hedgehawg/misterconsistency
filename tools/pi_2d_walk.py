import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.collections import LineCollection
from matplotlib.colors import LinearSegmentedColormap

BG = "#0e0f12"
N_STEPS = 150000
SRC = r"C:\Users\Scott\Dropbox (Personal)\pi\pi_billion_digits.txt"
OUT = "pi-walk-2d.png"

raw = open(SRC).read(N_STEPS + 50)
digs = [int(c) for c in raw if c.isdigit()][1:N_STEPS+1]   # drop leading '3'
# digit % 4 -> direction; per 10 digits: R,L each 3, U,D each 2 -> balanced per axis
dirmap = {0: (1, 0), 1: (-1, 0), 2: (0, 1), 3: (0, -1)}
x = y = 0
xs = [0]; ys = [0]
for d in digs:
    dx, dy = dirmap[d % 4]
    x += dx; y += dy; xs.append(x); ys.append(y)
xs = np.array(xs); ys = np.array(ys)
print("steps:", len(xs), "| x:", xs.min(), xs.max(), "| y:", ys.min(), ys.max())

pts = np.array([xs, ys]).T.reshape(-1, 1, 2)
segs = np.concatenate([pts[:-1], pts[1:]], axis=1)
cmap = LinearSegmentedColormap.from_list("gold", ["#4a3a1a", "#8a6a2a", "#d0a44c", "#f0d79a"])
lc = LineCollection(segs, cmap=cmap, linewidth=0.45, alpha=0.85)
lc.set_array(np.linspace(0, 1, len(segs)))

fig, ax = plt.subplots(figsize=(9, 9), facecolor=BG)
ax.add_collection(lc)
ax.set_facecolor(BG); ax.set_aspect("equal"); ax.autoscale(); ax.margins(0.04); ax.axis("off")
fig.savefig(OUT, facecolor=BG, dpi=150, bbox_inches="tight", pad_inches=0.15)
print("saved", OUT)
