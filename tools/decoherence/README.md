# Decoherence animation generators

Source scripts for the Section 03 (Topology of Societal Decoherence) videos,
recovered 2026-07-16 from the original Gemini authoring session
("Visualizing Societal Decoherence Topology", Feb 19 2026).

| Script | Output | Notes |
|---|---|---|
| `linguistic_torus_2025.py` | `assets/decoherence-linguistic.mp4` (current, 1990–2025) | The live site asset. |
| `linguistic_torus_SITE_ORIGINAL.py` | previous site asset (1990–2024) | Verified frame-identical to the version published 2026-07-07. |
| `tectonic_societal_decoherence.py` | `assets/decoherence-societal.mp4` | Two-torus tectonic drift version. |
| `replication_data_csv_generator.py` | `empirical_linguistic_data.csv` | Anchor values hand-transcribed from Gentzkow/Shapiro/Taddy 2019, Card et al. 2022, Rodriguez & Spirling 2022; PCHIP-interpolated. |
| `csv_driven_renderer.py` | `csv_driven_decoherence.gif` | Alternate renderer that ingests the CSV. **Not** what the site uses. |

Pipeline: `python linguistic_torus_2025.py` (needs numpy, matplotlib, pillow;
~60s) writes a 100-frame GIF (pillow merges the 20 duplicate hold frames → 81),
then convert:

```
ffmpeg -i linguistic_decoherence_2025.gif -movflags +faststart -pix_fmt yuv420p -c:v libx264 -crf 20 decoherence-linguistic.mp4
```

Honesty note: the published animation's drift is a parametric curve
(`t_empirical = t_linear ** 2.5`) calibrated to the *shape* of the
Gentzkow/Shapiro/Taddy partisanship series — it is not rendered from a
measured dataset. Site copy accordingly says "modeled on findings from".
The real from-scratch NLP pipeline (GovInfo → partisan corpora → diachronic
embeddings → Procrustes disparity) is scoped in the Mar 27 2026 Gemini thread
("Visualizing Political Language Drift") and is not yet built.
