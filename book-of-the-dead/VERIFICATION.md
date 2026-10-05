# Verification — v2.5.0 working integration build

5 October 2026. Tests refer to the packaged application in this folder, not just the old v2.4 page. This report does not certify scholarly accuracy or a public deployment.

## Results

| Check group | Result | Scope |
|---|---:|---|
| Main browser suite | 67 / 67 passed | Real 3D initialization, reduced motion, reader/map linkage, search, passage/column links, direct-link restoration, history, clipboard fallback, graphics-context loss/recovery, and responsive layouts |
| Isolated browser checks | 7 / 7 passed | Explicit vector fallback, fallback search and reading, mobile-to-desktop resize, full-text drawer, guided journey, and runtime exceptions |
| Static delivery checks | 15 / 15 passed | File sizes, source preservation, JavaScript syntax, local reference resolution, no external startup imports, and byte-correct local HTTP serving at two directory depths |
| Negative corpus-build checks | 3 / 3 passed | Invalid source section, missing sheet and zero-width rectangle are rejected; failed builds do not overwrite successful output |
| Model structure | Passed | 16 place records; finite native model buffers; 14,956 triangles and 20,830 line segments. Counts describe the model, not its historical accuracy. |

**74 browser checks passed across two isolated suites, with no recorded JavaScript exceptions.** Search/dialog checks include Escape and focus behavior, explicit empty results, no query-as-markup injection, and selection from keyboard results. The reader keeps a selected passage link stable while the manuscript scrolls beneath it.

The raw current browser and static check records are in `assets/verification.json`. The source/build checks use the retained v2.4 corpus pipeline; the four shipped corpus files remain byte-identical to its successful output. The map data and renderer are also retained without content changes. This milestone did not retranslate the manuscript or revise the annotation geometry.

## How the browser tests were run

Chromium, on Linux under a virtual display, using software WebGL rendering. Real local scripts, styles and all 37 real scans were loaded into test documents in memory. Scan bytes were exposed as local blob URLs in the browser test harness to avoid large repeated data-URL attributes. The transport substitution is confined to the test harness; the delivered application uses ordinary relative file paths.

Viewport checks cover 320 × 740, 390 × 844, 760 × 900, 768 × 600, 1100 × 760 and 1500 × 960. These are viewport emulations, not physical phones or tablets. The fallback suite uses a forced-unavailable-graphics test flag. Other tests initialize and exercise the actual native 3D model, not a fallback labeled as 3D.

The environment blocks direct browser URL navigation. Consequently, no browser-based `file://`, localhost URL, Safari, Firefox, Edge, hardware graphics-performance or live GitHub Pages certification is claimed here. A combined in-memory stress run was split into independent browser suites to bound test-fixture resource use; the reported suites complete successfully. That change is not evidence of real-device performance.

## What the path tests establish

Every local HTML script, stylesheet, favicon and source-document reference resolves to a file inside this folder. The sole relative parent-home link is intentional and is listed in the integration brief. Bibliographic hyperlinks are external but are not startup dependencies. Dynamic scan paths and the overview path resolve inside `assets/scans/`.

The actual files were additionally served by a plain local HTTP server at both:

```text
/book-of-the-dead/
/preview/personal-site/book-of-the-dead/
```

A non-browser HTTP client fetched the files and compared their bytes to the packaged originals. This checks relative placement and serving without requiring rewriting or a build pipeline. It is not a test of the private repository, the domain’s configuration, browser behavior on those URLs or GitHub’s production response headers.

## Preservation and asset budget

All 37 facsimile tiles and the overview image are unchanged. `guide.js`, `budge.js`, `text.js`, `spells.js` and `map-data.js` are byte-identical to the prior prototype. `geometry.js` changes only the overview-image path. The native renderer mesh source is byte-identical; controller and viewer changes are recorded in `CHANGELOG.md`.

No movie footage, movie stills, generated concept art, font files, package dependencies, server programs or full-resolution source scans are included. The cover is derived from the existing sheet 3 facsimile. Exact sizes and SHA-256 file hashes are in the release and asset manifests. The asset manifest excludes its own hash to avoid a circular checksum.

## Remaining release gates

The per-association source ledger and full annotation review; source/rights verification; final 3D visual detail and camera polish; unified image/text interactions and improved reading crops; comprehensive keyboard accessibility; physical-device and cross-browser performance testing; and verification after Claude Code’s integration on the actual host.

Both HTML documents remain marked `noindex` and describe the study’s interpretive limitations. A successful integration preview is not the final scholarly release. No repository read, repository write or deployment was performed in this session.
