# UroRef interactive app preview

The phone preview at `/try/` and `/app-demo/` uses a dedicated build of UroRef 3.3.1. It runs the real interface with selected, complete reference entries, all existing calculators and two complete pathway collections. Clinical entries are selected without rewriting or summarising them. The full app retains its full dataset and offline functionality.

The website formerly published the full web payload extracted from the Android 3.1.1 package. That delivery method is retired. Historical release provenance remains in Git history; do not restore those assets as a demo update.

## Release contract

- The private app repository owns `security/demo-selection.json`, the build transformation and clinical integrity baseline.
- `security/demo-release.json` in this repository records the exact allowed demo files and SHA-256 hashes. The website build rejects unexpected files or mismatches.
- The demo has its own entry point, lazy app/operative chunks, no service worker, no offline pack and no global full-app search export. Search operates over the selected entries.
- Ariadne's online interaction explains how to access the full app; it does not send demo queries to the clinical API. Analytics is disabled in the static demo.
- Third-party licence notices are retained. Every demo HTML document is excluded from Pagefind; robots directives are indexing preferences, not access control.
- The iframe preserves keyboard access, selection, zoom and pop-out viewing. The showroom banner makes the selected-entry scope visible.

## Updating the preview

In the private UroRef-App checkout, use the reviewed clinical baseline and run:

```text
npm run check:clinical
npm run test:security
npm run build:demo
node scripts/check-demo-exposure.cjs
node scripts/export-demo.cjs <absolute-path-to-uroref-web-worktree>
```

The exporter verifies file hashes and refuses unknown destination files. Commit the reviewed publication snapshot and manifest together. Do not copy the full app `build/`, an APK, source maps or app source into `public/`.

Run the website build, link, logo, production dependency, fixture and accessibility checks. Check the phone iframe and full-screen demo at desktop/mobile widths before publishing. Selected-entry changes require the same content-equality checks; a website build must never regenerate the clinical baseline.

## Optional guarded hosting

The private app repository contains a separate Cloudflare Worker and owner activation checklist. No guard is enabled by this website branch. After its private assets and Turnstile entry have been tested, `UROREF_DEMO_DELIVERY=edge` omits demo bundles from the Pages output and leaves an accessible fallback document. The Worker must own `/app-demo/*` before that website mode is published.

Keeping another public origin copy would bypass the guard. Repository history and historical deployments need separate owner review. A browser can recover any entries it legitimately receives; the showroom limits unnecessary distribution, rather than promising unextractable content.
