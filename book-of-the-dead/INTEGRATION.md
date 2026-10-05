# Integration: Book of the Dead

**Build:** v2.5.0 · working integration build · 5 October 2026  
**Destination:** `misterconsistency.com/book-of-the-dead/`  
**Integration and deployment:** Claude Code, in Scott’s existing site workflow.  
**Scope:** Add this folder and a homepage entry. Do not replace the homepage, shared `/assets`, root `CNAME`, publishing branch, or Pages settings.

## Publication status

This is a complete static **working build**, not the finished, source-audited research release. It includes the real interactive 3D component, the real web-sized facsimile scans, the historical reader, local search and stable passage links. The source audit, final model refinement and physical-device/browser release checks remain open. The two HTML documents deliberately retain `noindex`; do not remove that merely because integration succeeds. A preview can be published as a clearly labeled working study, but `noindex` is not access control and the files will be public.

The new folder and URL replace the earlier proposed `/ani/` destination. This package does not install or modify an `/ani/` page or redirect. The builder has not accessed the private repository or deployed this build.

## Main-page section: ready-to-use content

**Section title:** Book of the Dead: The Papyrus of Ani

**Two-sentence blurb:**

Explore all 37 facsimile sheets of the Papyrus of Ani, with a linked historical English translation and an interactive three-dimensional underworld map. This educational study distinguishes the source text from modern commentary and an explicitly interpretive spatial model.

**Navigation label:** Book of the Dead

**Link from the main page:** `book-of-the-dead/`

**Cover image:** `book-of-the-dead/assets/cover.webp`  
**JPEG alternative:** `book-of-the-dead/assets/cover.jpg`  
**Dimensions:** 1600 × 900 pixels, 16:9.  
**Suggested alternative text:** Detail of the weighing-of-the-heart scene from the Papyrus of Ani facsimile.

The cover is a web-sized detail of the actual bundled sheet 3 facsimile, not generated concept art or a claim that the 3D model is historically attested. Its source is recorded in `assets/SOURCE_CREDITS.md`. Keep the cover inside this folder; no copy to the parent’s shared assets is needed.

### Minimal homepage section

Use the existing homepage’s section/card styles around this markup. It contains no script and needs no new global stylesheet. The short inline image style only ensures the cover scales within the existing layout.

```html
<section id="book-of-the-dead" aria-labelledby="book-of-the-dead-title">
  <a href="book-of-the-dead/">
    <picture>
      <source srcset="book-of-the-dead/assets/cover.webp" type="image/webp">
      <img src="book-of-the-dead/assets/cover.jpg"
           width="1600" height="900"
           loading="lazy" decoding="async"
           style="display:block;width:100%;height:auto"
           alt="Detail of the weighing-of-the-heart scene from the Papyrus of Ani facsimile.">
    </picture>
  </a>
  <h2 id="book-of-the-dead-title">Book of the Dead: The Papyrus of Ani</h2>
  <p>Explore all 37 facsimile sheets of the Papyrus of Ani, with a linked historical English translation and an interactive three-dimensional underworld map. This educational study distinguishes the source text from modern commentary and an explicitly interpretive spatial model.</p>
  <a href="book-of-the-dead/">Explore the study</a>
</section>
```

Navigation entry:

```html
<a href="book-of-the-dead/">Book of the Dead</a>
```

During preview publication, add a small **Working study** label using the main page’s existing visual style. No museum affiliation or scholarly endorsement should be implied.

## Drop-in directory

```text
book-of-the-dead/
  index.html
  INTEGRATION.md
  VERIFICATION.md
  CHANGELOG.md
  assets/
    cover.webp
    cover.jpg
    favicon.svg
    research.html
    SOURCE_CREDITS.md
    release.json
    asset-manifest.json
    verification.json
    js/
      geometry.js  guide.js  budge.js  text.js  spells.js
      map-data.js  map-fallback.js  duat-webgl.js  map.js
      viewer.js  study-tools.js
    styles/
      map-archive.css
      study-tools.css
    scans/
      ani-01.webp … ani-37.webp
      ani-lowres.jpg
```

Extract the archive **before** integration. Copy the one top-level `book-of-the-dead` directory to the existing publishing root beside the parent `index.html`. Do not upload the ZIP as the page, and do not nest the folder twice.

## What the page needs from the parent site

**No runtime dependency on the parent site.** The viewer does not import the homepage’s CSS, JavaScript, fonts, shared assets, cookies, accounts, or data. The original native WebGL renderer and the vector fallback are included as readable source; no third-party library or content delivery network is required. The page requires JavaScript for interaction; the source/methodology document remains readable without it.

The only parent link inside the study is the relative `../` return link in About. All document, script, stylesheet and image paths used by the application are relative. Bibliographic links intentionally point to external source publications, but they are not fetched at startup. No `<base>` element, root-absolute asset path, routing rewrite, server-side code, build step, package install, external image request or worker is required.

**Analytics:** Insert the parent site’s existing approved analytics snippet during integration. There is an insertion comment in `index.html`’s `<head>`. Add the same approved snippet to `assets/research.html` only if that page should also be tracked. No analytics, consent mechanism, tracking identifier or network endpoint has been invented or included in this delivery.

**Site configuration:** Preserve the root `CNAME`, current branch and existing Pages workflow. No `.htaccess`, custom response header, Git Large File Storage, service worker, extra domain, deployment action or nested `.nojekyll` file is required. Respect an existing root `.nojekyll` configuration rather than changing it for this module.

**Metadata:** The title, description and local favicon are included. Canonical and social-image absolute URLs are intentionally left to final integration so the runtime bundle remains relocatable. Once the public release is approved, set the final canonical URL and the JPEG cover’s absolute social-image URL, and remove the preview `noindex` from both HTML documents as a deliberate release change.

## Static links and interaction checks

These are fragment routes; there is no client-side path router and no custom 404 behavior.

```text
book-of-the-dead/
book-of-the-dead/#sheet-3
book-of-the-dead/#b=7-7
book-of-the-dead/#b=7-7&c=6
book-of-the-dead/assets/research.html
```

`b` is the persistent annotated passage identifier. `c` is a **one-based index of the clickable column region in that block**, not a Budge printed number or a claim of exact sentence correspondence. An out-of-range column opens the whole passage; an unknown passage safely returns to sheet 1. Copying a link in a local file preview produces a local address; copying it on the hosted site produces that site’s address.

Use the normal static preview workflow from the publishing root. Test the direct links above, refresh them, use Back/Forward, search for `Osiris` and `spell 125`, copy a selected-column link, open the full translation, and select a place in **Map → Expand**. Check the model with reduced motion enabled and the non-3D fallback. Confirm no missing local assets, no unwanted external startup requests, and no parent-page layout changes. See `VERIFICATION.md` for exactly what has and has not been tested here.

## Asset and hosting budget

The package ships the existing web-sized WebP facsimiles, not the original full-resolution source scans. It also includes one small overview image and two cover formats. Movie stills, video clips, generated concept images, old builds, test screenshots, node modules and full-resolution downloads are not inside the deployment folder.

The measured sizes and hashes are recorded in `assets/release.json` and `assets/asset-manifest.json`. The full folder is approximately **32 MB**, and its largest file is approximately **1.05 MB**; use the exact release manifest for this build. This is below Scott’s stricter 100 MB per-file budget. Size accounting here covers this module only, not the rest of the private repository or the published site.

GitHub’s current documentation sets a 1 GB maximum published Pages site and a soft 100 GB monthly bandwidth limit. Regular repository files larger than 100 MiB are blocked. Those are platform limits, not this project’s size targets; the project budget remains far smaller. There is no full-resolution download in this build. A future one should be delivered separately, not placed in the Pages folder or committed to its history.

Official references checked 5 October 2026:
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [About large files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- [Creating a GitHub Pages site: static files and publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## Safe publication and rollback

Record the existing revision before copying the folder or editing the homepage. Integrate the folder and homepage/nav entry without changing unrelated files. After deployment, verify the actual custom-domain page and direct passage links on the declared browsers and a real phone. Keep the prior revision available for rollback; do not substitute local test success for a live-host check.
