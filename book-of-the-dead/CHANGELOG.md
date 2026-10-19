# World look v0.6 — 19 October 2026

Presentation only, by the Websites thread on `main` (Scott: "make every rendered image look more authentic, realistic, interesting, detailed, engaging; ensure the afterlife world is a continuous dimensional space and the path of the audience is continuous and intuitive"). Nothing drawn was added or removed from what the ledger justifies; what changed is how it is lit, surfaced and approached.

- `world/world-look.js` (new): procedural textures (sandstone with strata, cliff rock, the bare Duat floor, bronze patina, water ripples as a normal map, the ember crust of the Lake of Fire, cropped earth for the Field); physically based materials by the old names (`M.stone` is opaque sandstone for real walls; `M.wall` stays translucent for Hetep, the one city the text names without describing); a night dome with the dusk glow at Manu, 2,600 stars and a dense band for the arch of Nut; all flames as one instanced, noise-animated mesh with embers; bloom and ACES tone mapping; the route drawn on the ground; the camera's walk.
- `world.js`: shadows (the low western sun stops at the translucent slab, so the hidden land is lit only by its lamps, flames, the boat and the Field, which has its own light); craggy cliffs displaced by noise, the notch at Manu, the tomb's recess; figures with capsule limbs, shoulders and arms; `box`/`cyl` with world-scaled uvs; `merged()` keeps normals and uvs and sets shadows; lamps in the dark rooms (the sun in the notch, the stair, the pool, each Arit, each pylon's doorway for the "shining ones", the councils, the hall, the throne, the hall of the cows, each Aat, starlight on the river); the diagram grid removed.
- `world-data.js`: `paths` (the eye's way into each room: causeway, door, stair, valley, river) and `road` (the pilgrim's road drawn on the ground); closer framings with a direction for every room. The journey now walks from room to room along these paths instead of cutting; chips and pills still fly straight.
- `vendor/postprocessing`, `vendor/shaders`: three.js r160 EffectComposer, RenderPass, ShaderPass, MaskPass, UnrealBloomPass, OutputPass and their shaders, unmodified.

Known: labels in the pylon room overlap at the new framing (their layout is unchanged); on phones the shadow map is halved. The ledger, corpus and every feature's justification are untouched.

# World journey v0.5 — 8 October 2026

Added by the Websites thread on `main` (the world's files are otherwise the Book of the Dead World thread's): the journey now has narration and a score. `world/journey/SCRIPT.md` is the narration (17 rooms, one clip each, spoken by Microsoft's neural voice Ryan en-GB via edge-tts; every statement is in the ledger); `world/journey.js` is generated from it with clip durations and the act-to-music map; `world/journey/music/` holds seven Kevin MacLeod tracks (incompetech.com, CC BY 4.0), loudness-matched to -18 LUFS and re-encoded at 96 kbps; `world/world-audio.js` plays them (one bed per act, looped, crossfaded between acts, ducked under narration; every play() runs inside the click that asked for it). `world.js` gains the journey console (room, subtitle, back/next, sound) and a `window.__bod` debug handle; the bottom-left ‹ n of 17 › nav is replaced by the console; the Full screen button now hides only where full screen is not allowed, so it works inside the homepage's allowfullscreen frame. Tools: `misterconsistency-inbox/bod-tools/` (make_journey.py, encode_music.py). No ledger, geometry or corpus change.

# v2.6.0 — 6 October 2026

Tag-only corpus correction: fifteen Spell 147 blocks (11-1–11-9 and 12-1–12-6) now point to `arits`; 33-1 and 15-9–15-12 point to `lake`. The two existing tomb tags remain unchanged. No translation, image, geometry, map architecture, or application logic changed. These are navigation associations, not proof that the different fire/water passages describe one identical physical lake.

The JSON list in `assets/tag-overrides-v2.6.json` must be retained when rebuilding the corpus from upstream source. A rebuild of the older specification alone would lose these corrections.

## Earlier releases

# v2.5.0 — Static integration and source navigation

5 October 2026. Continuing from the supplied v2.4 prototype, not a restart.

- Repackaged the application under `book-of-the-dead/`, with runtime JavaScript, styling, images and the source/methodology document inside its own `assets/`.
- Retained the native WebGL model and explicit vector fallback. There are no third-party runtime libraries or remote rendering services to install.
- Added local search over the 287 existing passages: names, spell identifiers, titles, historical text and editorial spell notes. Added keyboard search access and linked results.
- Added stable passage and one-based annotated-column fragments, direct-load restoration, Back/Forward restoration, and copy-link control with a truthful manual-copy fallback.
- Kept an open passage’s URL stable while the underlying wall scrolls. Preserved map focus during passage navigation.
- Made Escape close the topmost search/share dialog without also dismissing the reader or underlying expanded map.
- Disconnected obsolete lazy-load observers when rebuilding the wall, and installed image load handlers before assigning image sources.
- Replaced the old About text’s overconfident map and click descriptions with explicit source, commentary and visual-invention distinctions.
- Added a web-sized cover from the actual sheet 3 facsimile, the integration instructions, exact asset inventory and current test report.

## Intentionally unchanged

The four corpus files (`guide.js`, `budge.js`, `text.js`, `spells.js`), map-data records and 38 scan/overview image files remain byte-identical to v2.4. `geometry.js` changes only its overview-image path; geometry values are unchanged. The native renderer’s mesh code is unchanged. No historical quotation, annotation boundary, spell association or original scan was corrected in this integration milestone.

## Still open

The full visual annotation audit and passage-to-place evidence ledger; final 3D architectural/detail/lighting refinement; unified figure/column interactions and richer reading crops; broad keyboard-accessibility and physical-device performance checks; independent source/rights verification; final public-release indexing and live-host verification. The bundle remains a working study, not a finished critical edition.
