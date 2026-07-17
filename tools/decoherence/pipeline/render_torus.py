"""Render the Linguistic Torus animation from the real measured CSV.

Visual identity is identical to the published parametric version
(linguistic_torus_2025.py): same title, axis labels, legend, colors,
camera pan, figure size, and frame count. Only two things change:
the drift now comes from empirical_linguistic_data.csv, and the
timeline runs 1994-2025 (the span the data actually covers).

Output: linguistic_decoherence_empirical.gif -> convert to mp4 with
ffmpeg -i ... -movflags +faststart -pix_fmt yuv420p -c:v libx264 -crf 20
"""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib.gridspec as gridspec
from scipy.interpolate import interp1d

CSV = r'D:\decoherence-data\results\empirical_linguistic_data.csv'
YEAR0, YEAR1 = 1994, 2025

# ==========================================
# 1. INGEST THE EMPIRICAL CSV
# ==========================================
df = pd.read_csv(CSV)
interp_x = interp1d(df['Year'], df['Lexical_Drift_X'], kind='cubic')
interp_y = interp1d(df['Year'], df['Outrage_Tone_Y'], kind='cubic')
interp_z = interp1d(df['Year'], df['Semantic_Distance_Z'], kind='cubic')

# ==========================================
# 2. PARAMETERS & TORUS GEOMETRY  (unchanged)
# ==========================================
N_POINTS = 3000
R_MAJOR = 3.0
R_MINOR = 1.0

np.random.seed(42)
u = np.random.uniform(0, 2*np.pi, N_POINTS)
v = np.random.uniform(0, 2*np.pi, N_POINTS)

x_base = (R_MAJOR + R_MINOR * np.cos(v)) * np.cos(u)
y_base = (R_MAJOR + R_MINOR * np.cos(v)) * np.sin(u)
z_base = R_MINOR * np.sin(v)

# ==========================================
# 3. FIGURE & ARCHITECTURE SETUP  (unchanged visual identity)
# ==========================================
print(f"Rendering Linguistic Decoherence ({YEAR0}-{YEAR1}, empirical)...")
fig = plt.figure(figsize=(11, 12), facecolor='#0d1117')
gs = gridspec.GridSpec(12, 1, figure=fig)

ax_3d = fig.add_subplot(gs[0:11, 0], projection='3d')
ax_3d.set_facecolor('#0d1117')

ax_3d.xaxis.set_pane_color((0.0, 0.0, 0.0, 0.0))
ax_3d.yaxis.set_pane_color((0.0, 0.0, 0.0, 0.0))
ax_3d.zaxis.set_pane_color((0.0, 0.0, 0.0, 0.0))
ax_3d.grid(color='#30363d', linestyle='--', linewidth=0.5)

ax_3d.set_xlabel('\n\nX: Lexical Partisanship (Shared Vocab <-> Shibboleths)', color='#a5b4fc', fontsize=10, fontweight='bold')
ax_3d.set_ylabel('\n\nY: Affective Tone (Procedural <-> Outrage)', color='#a5b4fc', fontsize=10, fontweight='bold')
ax_3d.set_zlabel('\n\nZ: Semantic Distance (Word2Vec Meaning Drift)', color='#a5b4fc', fontsize=10, fontweight='bold')

ax_3d.tick_params(colors='#8b949e')
ax_3d.set_xlim(-11, 11)
ax_3d.set_ylim(-11, 11)
ax_3d.set_zlim(-8, 8)

ax_time = fig.add_subplot(gs[11, 0])
ax_time.set_facecolor('#0d1117')
ax_time.set_xlim(YEAR0, YEAR1)
ax_time.set_ylim(0, 1)
ax_time.axis('off')

scatter_left = ax_3d.scatter([], [], [], color='#00FFFF', s=1.5, alpha=0.3, label="Congressional Democrats")
scatter_right = ax_3d.scatter([], [], [], color='#FF00FF', s=1.5, alpha=0.3, label="Congressional Republicans")
ax_3d.legend(loc='upper left', facecolor='#0d1117', edgecolor='#30363d', labelcolor='white', fontsize=11)

timeline_bg = ax_time.plot([YEAR0, YEAR1], [0.5, 0.5], color='#333333', linewidth=4, zorder=1)[0]
timeline_fg = ax_time.plot([], [], color='#a5b4fc', linewidth=4, zorder=2)[0]
year_marker = ax_time.plot([], [], 'o', color='white', markersize=12, zorder=3)[0]

ax_time.text(YEAR0, 0.1, str(YEAR0), color='gray', fontsize=14, ha='center')
ax_time.text(YEAR1, 0.1, str(YEAR1), color='gray', fontsize=14, ha='center')
year_text_ui = ax_time.text(YEAR0, 0.85, '', color='white', fontsize=18, ha='center', fontweight='bold')

fig.text(0.5, 0.95, "Empirical Decoherence: The Linguistic Torus", color='white', fontsize=20, ha='center', fontweight='bold')
overlap_text = fig.text(0.5, 0.91, "", color='#00FFFF', fontsize=15, ha='center', fontweight='bold')

# ==========================================
# 4. EMPIRICAL DATA ANIMATION LOOP
# ==========================================
SPAN = YEAR1 - YEAR0

def update(frame):
    # 80 frames of movement mapping 1994-2025, 20 hold frames
    t_linear = min(frame / 80.0, 1.0)
    current_year = YEAR0 + (t_linear * SPAN)

    x_val = float(interp_x(current_year))
    y_val = float(interp_y(current_year))
    z_val = float(interp_z(current_year))

    # Scale measured 0-1 divergence to the coordinate drift of the original
    drift_x = 5.5 * x_val
    drift_y = 5.5 * y_val
    drift_z = 4.5 * z_val

    # Systemic vibration driven by the measured rate of separation,
    # capped so the torus geometry stays legible through fast swings
    if current_year > YEAR0 + 0.5 and t_linear < 1.0:
        velocity = x_val - float(interp_x(current_year - 0.5))
        vibration = min(abs(velocity) * 4.0, 0.45)
    else:
        vibration = 0

    xl = x_base - drift_x + np.random.normal(0, vibration, N_POINTS)
    yl = y_base + drift_y + np.random.normal(0, vibration, N_POINTS)
    zl = z_base - drift_z + np.random.normal(0, vibration, N_POINTS)

    xr = x_base + drift_x + np.random.normal(0, vibration, N_POINTS)
    yr = y_base - drift_y + np.random.normal(0, vibration, N_POINTS)
    zr = z_base + drift_z + np.random.normal(0, vibration, N_POINTS)

    scatter_left._offsets3d = (xl, yl, zl)
    scatter_right._offsets3d = (xr, yr, zr)

    ax_3d.view_init(elev=20 + (t_linear * 15), azim=-60 + (t_linear * 45))

    timeline_fg.set_data([YEAR0, current_year], [0.5, 0.5])
    year_marker.set_data([current_year], [0.5])
    year_text_ui.set_text(f'{int(current_year)}')
    year_text_ui.set_position((current_year, 0.85))

    # Shared space = 100% minus mean measured divergence
    overlap_pct = max(0, int(round(100 - (x_val + y_val + z_val) / 3.0 * 100)))
    overlap_text.set_text(f"Shared Linguistic Feasible Space: {overlap_pct}%")
    overlap_text.set_color('#FF00FF' if overlap_pct < 30 else '#00FFFF')

    return scatter_left, scatter_right, timeline_fg, year_marker, year_text_ui, overlap_text

anim = FuncAnimation(fig, update, frames=100, interval=50, blit=False)
anim.save('linguistic_decoherence_empirical.gif', writer='pillow', savefig_kwargs={'facecolor': '#0d1117'})
print("Saved -> 'linguistic_decoherence_empirical.gif'")
