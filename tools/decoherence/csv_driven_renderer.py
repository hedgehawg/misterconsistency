import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib.gridspec as gridspec
from scipy.interpolate import interp1d

# ==========================================
# 1. INGEST THE EMPIRICAL CSV
# ==========================================
try:
    df = pd.read_csv('empirical_linguistic_data.csv')
except FileNotFoundError:
    print("Error: Run the CSV generator script first!")
    exit()

# Create smooth interpolators so the animation glides cleanly through sub-years (e.g. 1995.4)
interp_x_smooth = interp1d(df['Year'], df['Lexical_Drift_X'], kind='cubic')
interp_y_smooth = interp1d(df['Year'], df['Outrage_Tone_Y'], kind='cubic')
interp_z_smooth = interp1d(df['Year'], df['Semantic_Distance_Z'], kind='cubic')

# ==========================================
# 2. TORUS TOPOLOGY SETUP
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
# 3. FIGURE & ARCHITECTURE
# ==========================================
print("Rendering Data-Driven Decoherence GIF (Takes ~60 seconds)...")
fig = plt.figure(figsize=(11, 12), facecolor='#0d1117')
gs = gridspec.GridSpec(12, 1, figure=fig)

ax_3d = fig.add_subplot(gs[0:11, 0], projection='3d')
ax_3d.set_facecolor('#0d1117')

for pane in [ax_3d.xaxis.pane, ax_3d.yaxis.pane, ax_3d.zaxis.pane]:
    pane.fill = False
ax_3d.grid(color='#30363d', linestyle='--', linewidth=0.5)

ax_3d.set_xlabel('\n\nX: Lexical Partisanship', color='#a5b4fc', fontsize=10, fontweight='bold')
ax_3d.set_ylabel('\n\nY: Affective Tone (Outrage)', color='#a5b4fc', fontsize=10, fontweight='bold')
ax_3d.set_zlabel('\n\nZ: Semantic Distance (Meaning Drift)', color='#a5b4fc', fontsize=10, fontweight='bold')
ax_3d.tick_params(colors='#8b949e')

ax_3d.set_xlim(-8, 8); ax_3d.set_ylim(-8, 8); ax_3d.set_zlim(-6, 6)

# Timeline Area
ax_time = fig.add_subplot(gs[11, 0])
ax_time.set_facecolor('#0d1117')
ax_time.set_xlim(1990, 2024); ax_time.set_ylim(0, 1); ax_time.axis('off')

scatter_left = ax_3d.scatter([], [], [], color='#00FFFF', s=1.5, alpha=0.3, label="Congressional Democrats")
scatter_right = ax_3d.scatter([], [], [], color='#FF00FF', s=1.5, alpha=0.3, label="Congressional Republicans")
ax_3d.legend(loc='upper left', facecolor='#0d1117', edgecolor='#30363d', labelcolor='white')

timeline_bg = ax_time.plot([1990, 2024], [0.5, 0.5], color='#333333', linewidth=4)[0]
timeline_fg = ax_time.plot([], [], color='#a5b4fc', linewidth=4)[0]
year_marker = ax_time.plot([], [], 'o', color='white', markersize=12)[0]

ax_time.text(1990, 0.1, '1990', color='gray', fontsize=14, ha='center')
ax_time.text(2024, 0.1, '2024', color='gray', fontsize=14, ha='center')
year_text_ui = ax_time.text(1990, 0.85, '', color='white', fontsize=18, ha='center', fontweight='bold')

fig.text(0.5, 0.95, "Empirical Decoherence: CSV NLP Data Ingestion", color='white', fontsize=20, ha='center', fontweight='bold')
overlap_text = fig.text(0.5, 0.91, "", color='#00FFFF', fontsize=15, ha='center', fontweight='bold')

# ==========================================
# 4. THE ANIMATION LOOP
# ==========================================
def update(frame):
    # Progress math: 80 movement frames mapping to 34 years, holding static at the end
    t = min(frame / 80.0, 1.0)
    current_year = 1990 + (t * 34)
    
    # Read the drift directly from our CSV interpolation
    x_val = float(interp_x_smooth(current_year))
    y_val = float(interp_y_smooth(current_year))
    z_val = float(interp_z_smooth(current_year))
    
    # Scale from 0.0-1.0 to physical coordinate distances in our 3D bounds
    drift_x = 5.0 * x_val
    drift_y = 5.0 * y_val
    drift_z = 4.0 * z_val
    
    # Systemic Vibration (Derivative-driven Dermatitis)
    # The faster the data separates between last year and this year, the more violent the vibration
    if current_year > 1990.5 and t < 1.0:
        velocity = float(interp_x_smooth(current_year) - interp_x_smooth(current_year - 0.5))
        vibration = abs(velocity) * 2.5
    else:
        vibration = 0
    
    # Left Reality Node Transforms
    xl = x_base - drift_x + np.random.normal(0, vibration, N_POINTS)
    yl = y_base + drift_y + np.random.normal(0, vibration, N_POINTS)
    zl = z_base - drift_z + np.random.normal(0, vibration, N_POINTS)
    
    # Right Reality Node Transforms
    xr = x_base + drift_x + np.random.normal(0, vibration, N_POINTS)
    yr = y_base - drift_y + np.random.normal(0, vibration, N_POINTS)
    zr = z_base + drift_z + np.random.normal(0, vibration, N_POINTS)
    
    scatter_left._offsets3d = (xl, yl, zl)
    scatter_right._offsets3d = (xr, yr, zr)
    
    ax_3d.view_init(elev=20 + (t * 15), azim=-60 + (t * 45))
    
    # Update Timeline
    timeline_fg.set_data([1990, current_year], [0.5, 0.5])
    year_marker.set_data([current_year], [0.5])
    year_text_ui.set_text(f'{int(current_year)}')
    year_text_ui.set_position((current_year, 0.85))
    
    # Overlap UI
    average_divergence = (x_val + y_val + z_val) / 3.0
    overlap_pct = max(0, int(100 - (average_divergence * 100)))
    if t == 1.0: overlap_pct = 0
    
    overlap_text.set_color('#FF00FF') if overlap_pct < 30 else overlap_text.set_color('#00FFFF')
    overlap_text.set_text(f"Shared Linguistic Feasible Space: {overlap_pct}%")
    
    return scatter_left, scatter_right, timeline_fg, year_marker, year_text_ui, overlap_text

anim = FuncAnimation(fig, update, frames=110, interval=50, blit=False)
anim.save('csv_driven_decoherence.gif', writer='pillow', savefig_kwargs={'facecolor': '#0d1117'})
print("Saved -> 'csv_driven_decoherence.gif'")
