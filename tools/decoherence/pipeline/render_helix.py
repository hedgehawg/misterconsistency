"""The Fraying Helix — the empirical braid, from the measured CSV.

Two fiber bundles (cyan Democrats, magenta Republicans) travel a bounded
diagonal path through the X/Y/Z coordinate space, 1994 -> 2025. Everything
structural is driven by empirical_linguistic_data.csv:

  - winding rate  = the measured shared linguistic space (the braid winds
    while a common language exists and stops winding as it collapses)
  - core separation per axis = the measured X/Y/Z divergence series
  - fiber fray    = raw baseline strain (1994 is already frayed: raw
    partisanship 0.68) plus growth with measured divergence
  - annotations   = placed at the true path positions of the events

Outputs: fraying_helix_static.png (hero frame) and, with --animate,
fraying_helix.gif (80 draw frames + 20 hold, matching the torus format).
"""
import sys

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from matplotlib.animation import FuncAnimation
from scipy.interpolate import interp1d

CSV = r'D:\decoherence-data\results\empirical_linguistic_data.csv'
YEAR0, YEAR1 = 1994, 2025

CYAN, MAGENTA = '#00FFFF', '#FF00FF'
BG = '#0d1117'

# ---------------------------------------------------------------- data
df = pd.read_csv(CSV)
years = df['Year'].to_numpy(float)
xn = interp1d(years, df['Lexical_Drift_X'], kind='cubic')
yn = interp1d(years, df['Outrage_Tone_Y'], kind='cubic')
zn = interp1d(years, df['Semantic_Distance_Z'], kind='cubic')


def shared(yr):
    return 1.0 - (xn(yr) + yn(yr) + zn(yr)) / 3.0


# ---------------------------------------------------------------- geometry
N_T = 2600                       # samples along the full path
N_FIB = 26                       # fibers per party bundle
TURNS = 6.0                      # braid turns over the era if fully cohesive

t_grid = np.linspace(0, 1, N_T)
yr_grid = YEAR0 + t_grid * (YEAR1 - YEAR0)

# Bounded diagonal path through the box (no loop, no periodicity)
P0 = np.array([-7.5, -7.5, -4.5])
P1 = np.array([7.5, 7.5, 3.0])
center = P0[None, :] + t_grid[:, None] * (P1 - P0)[None, :]

path_dir = (P1 - P0) / np.linalg.norm(P1 - P0)
e1 = np.cross(path_dir, [0, 0, 1.0]); e1 /= np.linalg.norm(e1)
e2 = np.cross(path_dir, e1)

# Braid phase: winds at a rate proportional to the SHARED space -> the
# braid physically stops winding as the common language collapses.
sh = np.array([shared(y) for y in yr_grid])
phase = 2 * np.pi * TURNS * np.cumsum(sh) / N_T
phase += 0.9                      # terminal-direction tuning (skew ending +Z)

# Core separation: measured, per-axis, mapped like the torus drift
sep_vec = np.stack([5.5 * xn(yr_grid), 5.5 * yn(yr_grid), 4.5 * zn(yr_grid)], axis=1)
sep_mag = np.linalg.norm(sep_vec, axis=1)
sep_mag = np.maximum(sep_mag, 0.55)          # bundles never coincide exactly

# Separation direction rotates with the braid phase in the plane normal to
# the path; magnitude is the measured divergence.
offset = (np.cos(phase)[:, None] * e1[None, :] +
          np.sin(phase)[:, None] * e2[None, :]) * (0.5 * sep_mag)[:, None]

core_d = center + offset
core_r = center - offset

# Fiber fray: raw 1994 strain baseline + growth with measured divergence
div = np.clip(1.0 - sh, 0.0, 1.0)
fray = 0.30 + 1.6 * div ** 1.5

rng = np.random.default_rng(42)


def bundle(core, party_seed):
    """Scatter-cloud fibers around one strand core."""
    r = np.random.default_rng(party_seed)
    pts, cols = [], []
    for j in range(N_FIB):
        a0 = r.uniform(0, 2 * np.pi)
        wob = r.uniform(2.5, 4.5)
        rad = fray * r.uniform(0.35, 1.0)
        snap = r.uniform(0.55, 0.95)          # divergence level where fiber snaps
        drift = np.clip(div - snap, 0, None)[:, None] * \
            r.normal(0, 2.2, 3)[None, :]      # snapped fibers wander off
        ang = a0 + wob * phase
        fib = (core
               + rad[:, None] * (np.cos(ang)[:, None] * e1[None, :]
                                 + np.sin(ang)[:, None] * e2[None, :])
               + drift
               + r.normal(0, 0.05, core.shape))
        keep = slice(None, None, 2)
        pts.append(fib[keep])
    return np.concatenate(pts)


pts_d = bundle(core_d, 1)
pts_r = bundle(core_r, 2)
n_per_fib = pts_d.shape[0] // N_FIB

# Both parties in ONE point cloud so matplotlib depth-sorts per point:
# separate scatter collections are sorted by their MEAN depth, which makes
# whole bundles pop in front of / behind each other as the camera moves.
from matplotlib.colors import to_rgba
pts_all = np.concatenate([pts_d, pts_r])
cols_all = np.concatenate([
    np.tile(to_rgba(CYAN), (pts_d.shape[0], 1)),
    np.tile(to_rgba(MAGENTA), (pts_r.shape[0], 1)),
])

EVENTS = [
    # (year, label, vertical offset — negative hangs the label below the
    # braid; staggered so labels never collide at any camera angle)
    (1995.0, 'Gingrich Snap\nTension', 2.4),
    (2001.7, '9/11 Rapprochement\nre-tightening (temporary)', -4.6),
    (2010.0, 'Tea Party Ramp\n(significant Z-drift)', 3.4),
    (2021.3, '117th Congress\n(peak divergence)', 3.4),
]


def year_index(yr):
    return int(np.clip((yr - YEAR0) / (YEAR1 - YEAR0), 0, 1) * (N_T - 1))


def setup_axes(ax):
    ax.set_facecolor(BG)
    for axis in (ax.xaxis, ax.yaxis, ax.zaxis):
        axis.set_pane_color((0, 0, 0, 0))
    ax.grid(color='#30363d', linestyle='--', linewidth=0.5)
    ax.set_xlabel('\n\nX: Lexical Partisanship (Shared Vocab <-> Shibboleths)',
                  color='#a5b4fc', fontsize=10, fontweight='bold')
    ax.set_ylabel('\n\nY: Affective Tone (Procedural <-> Outrage)',
                  color='#a5b4fc', fontsize=10, fontweight='bold')
    ax.set_zlabel('\n\nZ: Semantic Distance (Word2Vec Meaning Drift)',
                  color='#a5b4fc', fontsize=10, fontweight='bold')
    ax.tick_params(colors='#8b949e')
    ax.set_xlim(-11, 11); ax.set_ylim(-11, 11); ax.set_zlim(-8, 8)


def fraction_mask(pts, frac):
    """Boolean mask keeping each fiber's first `frac` of path samples."""
    idx = np.arange(pts.shape[0]) % n_per_fib
    return idx < frac * n_per_fib


def annotate(ax, events=EVENTS):
    for yr, label, dz in events:
        i = year_index(yr)
        p = center[i]
        ax.text(p[0], p[1], p[2] + dz, label, color='#b8b5ac', fontsize=15,
                ha='center', va='bottom' if dz > 0 else 'top')


def make_figure():
    fig = plt.figure(figsize=(11, 12), facecolor=BG)
    gs = gridspec.GridSpec(12, 1, figure=fig)
    ax = fig.add_subplot(gs[0:11, 0], projection='3d')
    setup_axes(ax)
    ax_t = fig.add_subplot(gs[11, 0])
    ax_t.set_facecolor(BG)
    ax_t.set_xlim(YEAR0, YEAR1); ax_t.set_ylim(0, 1); ax_t.axis('off')
    ax_t.plot([YEAR0, YEAR1], [0.5, 0.5], color='#333333', linewidth=4, zorder=1)
    ax_t.text(YEAR0, 0.1, str(YEAR0), color='gray', fontsize=14, ha='center')
    ax_t.text(YEAR1, 0.1, str(YEAR1), color='gray', fontsize=14, ha='center')
    fig.text(0.5, 0.95, 'Empirical Decoherence: The Fraying Helix',
             color='white', fontsize=20, ha='center', fontweight='bold')
    return fig, ax, ax_t


def scatter(ax, mask):
    from matplotlib.lines import Line2D
    m_all = np.concatenate([mask, mask])
    s = ax.scatter(pts_all[m_all, 0], pts_all[m_all, 1], pts_all[m_all, 2],
                   c=cols_all[m_all], s=1.3, alpha=0.28, depthshade=False)
    proxies = [Line2D([0], [0], marker='o', linestyle='', markersize=4,
                      color=CYAN, label='Congressional Democrats'),
               Line2D([0], [0], marker='o', linestyle='', markersize=4,
                      color=MAGENTA, label='Congressional Republicans')]
    ax.legend(handles=proxies, loc='upper left', facecolor=BG,
              edgecolor='#30363d', labelcolor='white', fontsize=11)
    return (s,)


if __name__ == '__main__':
    animate = '--animate' in sys.argv

    if not animate:
        fig, ax, ax_t = make_figure()
        scatter(ax, np.ones(pts_d.shape[0], bool))
        annotate(ax)
        end_sh = int(round(shared(YEAR1) * 100))
        fig.text(0.5, 0.91, f'Shared Linguistic Feasible Space: 100% (1994) '
                 f'→ {end_sh}% (2025)', color='#00FFFF', fontsize=15,
                 ha='center', fontweight='bold')
        ax.view_init(elev=24, azim=-58)
        ax_t.plot([YEAR0, YEAR1], [0.5, 0.5], color='#a5b4fc', linewidth=4, zorder=2)
        fig.savefig(r'D:\decoherence-data\results\fraying_helix_static.png',
                    dpi=150, facecolor=BG)
        print('saved fraying_helix_static.png')
    else:
        fig, ax, ax_t = make_figure()
        overlap_text = fig.text(0.5, 0.91, '', color='#00FFFF', fontsize=15,
                                ha='center', fontweight='bold')
        fg = ax_t.plot([], [], color='#a5b4fc', linewidth=4, zorder=2)[0]
        mark = ax_t.plot([], [], 'o', color='white', markersize=12, zorder=3)[0]
        yr_txt = ax_t.text(YEAR0, 0.85, '', color='white', fontsize=18,
                           ha='center', fontweight='bold')
        state = {'artists': [], 'annotated': set()}

        def update(frame):
            t = min(frame / 80.0, 1.0)
            yr = YEAR0 + t * (YEAR1 - YEAR0)
            for a in state['artists']:
                a.remove()
            mask = fraction_mask(pts_d, t)
            state['artists'] = list(scatter(ax, mask))
            # Each event label appears as the braid reaches its year
            due = [ev for ev in EVENTS
                   if ev[0] <= yr and ev[0] not in state['annotated']]
            if due:
                annotate(ax, due)
                state['annotated'].update(ev[0] for ev in due)
            ax.view_init(elev=20 + t * 12, azim=-70 + t * 30)
            fg.set_data([YEAR0, yr], [0.5, 0.5])
            mark.set_data([yr], [0.5])
            yr_txt.set_text(f'{int(yr)}')
            yr_txt.set_position((yr, 0.85))
            pct = max(0, int(round(shared(yr) * 100)))
            overlap_text.set_text(f'Shared Linguistic Feasible Space: {pct}%')
            overlap_text.set_color('#FF00FF' if pct < 30 else '#00FFFF')
            return state['artists']

        anim = FuncAnimation(fig, update, frames=100, interval=50, blit=False)
        anim.save(r'D:\decoherence-data\results\fraying_helix.gif',
                  writer='pillow', savefig_kwargs={'facecolor': BG})
        print('saved fraying_helix.gif')
