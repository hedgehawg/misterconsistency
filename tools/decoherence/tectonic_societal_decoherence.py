import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# ==========================================
# 1. SYSTEM PARAMETERS
# ==========================================
N_POINTS = 4000 # Number of nodes (individuals) per reality block
R_MAJOR = 3.0 # The overarching architecture of their reality
R_MINOR = 1.0 # The thickness/volume of the reality

# Generate the foundational coordinates for the two realities
np.random.seed(42)
u1 = np.random.uniform(0, 2 * np.pi, N_POINTS)
v1 = np.random.uniform(0, 2 * np.pi, N_POINTS)
x1_base = (R_MAJOR + R_MINOR * np.cos(v1)) * np.cos(u1)
y1_base = (R_MAJOR + R_MINOR * np.cos(v1)) * np.sin(u1)
z1_base = R_MINOR * np.sin(v1)

u2 = np.random.uniform(0, 2 * np.pi, N_POINTS)
v2 = np.random.uniform(0, 2 * np.pi, N_POINTS)
x2_base = (R_MAJOR + R_MINOR * np.cos(v2)) * np.cos(u2)
y2_base = (R_MAJOR + R_MINOR * np.cos(v2)) * np.sin(u2)
z2_base = R_MINOR * np.sin(v2)

# ==========================================
# 2. THE TOPOLOGICAL MATH MODEL
# ==========================================
def get_tectonic_state(t):
    """
    Calculate the 3D coordinates at decoherence level t (0.0 to 1.0).
    t=0: Heavy overlap (Shared feasible space)
    t=1: Zero overlap, sheared, stabilized in isolation
    """
    # 1. TECTONIC DRIFT: Centers pull apart along the X-axis
    drift = 0.5 + 5.0 * (t ** 1.5) # Accelerating drift
    
    # 2. TECTONIC SHEAR: They twist and "fall away" from each other
    angle = (np.pi / 4) * t # Tilts up to 45 degrees
    cos_t, sin_t = np.cos(angle), np.sin(angle)
    
    # Apply Y-axis rotation (Tilt)
    x1_rot = x1_base * cos_t - z1_base * sin_t
    z1_rot = x1_base * sin_t + z1_base * cos_t
    
    x2_rot = x2_base * cos_t - z2_base * (-sin_t) # Opposite tilt
    z2_rot = x2_base * (-sin_t) + z2_base * cos_t
    
    # 3. DECOHERENCE EARTHQUAKE (Scott's Dermatitis)
    # Violent shaking peaks while tearing apart (t=0.5), settles at isolation (t=1.0)
    jitter_amp = 0.5 * np.sin(t * np.pi)
    
    # Apply drift, shear/subduction (Z-axis offset), and vibration
    x1 = x1_rot - drift + np.random.normal(0, jitter_amp, N_POINTS)
    y1 = y1_base + np.random.normal(0, jitter_amp, N_POINTS)
    z1 = z1_rot - (1.5 * t) + np.random.normal(0, jitter_amp, N_POINTS)
    
    x2 = x2_rot + drift + np.random.normal(0, jitter_amp, N_POINTS)
    y2 = y2_base + np.random.normal(0, jitter_amp, N_POINTS)
    z2 = z2_rot + (1.5 * t) + np.random.normal(0, jitter_amp, N_POINTS)
    
    return (x1, y1, z1), (x2, y2, z2)

def setup_axes(ax):
    """Helper to lock the camera/scene so it doesn't zoom artificially."""
    ax.set_facecolor('#0d1117')
    ax.axis('off')
    ax.set_xlim(-9, 9)
    ax.set_ylim(-6, 6)
    ax.set_zlim(-6, 6)

# ==========================================
# 3. RENDER 1x5 STATIC SNAPSHOTS
# ==========================================
print("Rendering 1x5 Snapshot Progression...")
fig_snap = plt.figure(figsize=(25, 5), facecolor='#0d1117')
fig_snap.suptitle("Societal Decoherence: Tectonic Reality Drift",
                  color='white', fontsize=22, fontweight='bold', y=1.05)

times = [0.0, 0.25, 0.50, 0.75, 1.0]
labels = ["0% - Heavy Shared Overlap",
          "25% - Tectonic Drift Begins",
          "50% - Peak Earthquake (Tearing)",
          "75% - Overlap Eroded",
          "100% - Stabilized Disjoint Realities"]

for idx, t in enumerate(times):
    ax = fig_snap.add_subplot(1, 5, idx+1, projection='3d')
    setup_axes(ax)
    
    (x1, y1, z1), (x2, y2, z2) = get_tectonic_state(t)
    
    # Reality A (Cyan) and Reality B (Magenta).
    # Alpha blending creates a deep, dense purple in the intersecting volume.
    ax.scatter(x1, y1, z1, color='#00FFFF', s=1.0, alpha=0.3)
    ax.scatter(x2, y2, z2, color='#FF00FF', s=1.0, alpha=0.3)
    
    # Start with a top-down angled view, then slowly pan and tilt as society fractures
    ax.view_init(elev=50 - (t * 30), azim=-90 + (t * 40))
    ax.set_title(labels[idx], color='#e6edf3', fontsize=15, pad=10)

plt.tight_layout()
plt.savefig('tectonic_decoherence_1x5.png', dpi=300, facecolor='#0d1117', bbox_inches='tight')
print("Saved -> 'tectonic_decoherence_1x5.png'")

# ==========================================
# 4. RENDER CONTINUOUS VIDEO (GIF)
# ==========================================
print("Rendering Continuous Animation (This will take ~1 minute)...")
fig_vid = plt.figure(figsize=(8, 8), facecolor='#0d1117')
ax_vid = fig_vid.add_subplot(111, projection='3d')

def update(frame):
    ax_vid.clear()
    setup_axes(ax_vid)
    
    # Time t progresses from 0 to 1 over 70 frames, then holds static for 30
    t = min(frame / 70.0, 1.0)
    
    (x1, y1, z1), (x2, y2, z2) = get_tectonic_state(t)
    
    ax_vid.scatter(x1, y1, z1, color='#00FFFF', s=1.5, alpha=0.3)
    ax_vid.scatter(x2, y2, z2, color='#FF00FF', s=1.5, alpha=0.3)
    
    ax_vid.view_init(elev=50 - (t * 30), azim=-90 + (t * 40))
    
    # Mathematical proxy for the loss of volumetric overlap and rise in friction
    overlap_pct = max(0, int(100 - (t * 120)))
    if t == 1.0: overlap_pct = 0
    friction_pct = int(np.sin(t * np.pi) * 100)
    
    ax_vid.set_title(f"Feasible Space Overlap: {overlap_pct}%\nSystemic Friction: {friction_pct}%",
                     color='white', fontsize=16, pad=20)

anim = FuncAnimation(fig_vid, update, frames=100, interval=40)
anim.save('tectonic_decoherence.gif', writer='pillow', savefig_kwargs={'facecolor': '#0d1117'})
print("Saved -> 'tectonic_decoherence.gif'")
