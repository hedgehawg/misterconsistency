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
