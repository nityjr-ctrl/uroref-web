# Technology readiness and gates

Status date: 27 August 2026. Core integration versions are pinned in `package.json`; the complete resolved dependency tree is locked in `package-lock.json`.

| Capability | Current state | Evidence in this repository | Next gate |
| --- | --- | --- | --- |
| Pagefind | Integrated | Production builds generate `dist/pagefind`; the global dialog searches locally and exposes audience, topic and content-type filters. | Recheck filters and index size after major content imports. |
| Google model-viewer | Integrated | The showcase and imaging lab use one local public-research teaching GLB, explicit USDZ and an independent static poster. | Device-test AR on the final HTTPS URL; retain static/video fallback. |
| Offline presentation | Safe local pack | `npm run build` produces a versioned static presentation pack; `npm run presentation` serves it on localhost. | Resolve the ProstateView service-worker retirement script and agree stale-clinical-content controls before adding a root PWA. |
| vite-plugin-pwa | Gated | Listed transparently in the public technology map, but not installed. Existing mirrored ProstateView pages unregister every service worker, so a root worker would be silently removed after a project visit and could leave clinical content stale. | Fix the mirror at its source, then evaluate a post-Pagefind Workbox build with explicit content-version and update UX. |
| Promptfoo | Fixture gate integrated | Offline response-contract fixtures run without an API; a separate live-endpoint configuration refuses to run without `ARIADNE_EVAL_ENDPOINT`. | Connect an approved evaluation-only endpoint and add source-ground-truth, red-team and abstention thresholds. |
| axe-core | Automated gate | Playwright scans every authored route, landmark/heading structure, overflow, search, the mobile menu and the offline 3D load. | Keep manual keyboard, 200% zoom, contrast, screen-reader and reduced-motion review. |
| Umami | Connection-ready | `Analytics.astro` loads Umami only when both public environment values exist; search text is never emitted. | Approve hosting, retention, consent and the minimum aggregate event dictionary before enabling. |
| OHIF + Cornerstone3D | Synthetic interface staged | `/imaging-lab/` documents the DICOMweb boundary and links the maintained upstream projects; the public site has no DICOM server. | Create a separate synthetic/public-data pilot with governance, performance and de-identification tests. |
| MONAI | Research provenance only | The imaging lab identifies where governed segmentation research could sit; the public website performs no inference. | Version models/data, capture provenance and complete clinical-safety/regulatory assessment before any clinical use. |

## Why there is no root service worker yet

The mirrored ProstateView build contains code that calls `navigator.serviceWorker.getRegistrations()` and unregisters every registration it finds. A root UroRef worker would therefore be removed after visiting those pages. A service worker also introduces a stale-content risk for clinical education material. The local static server provides the Sunday resilience benefit without disguising either problem.

## Analytics contract

Until Umami is configured, the impact page reports only build-derived facts. Once approved, capture aggregate events such as “opened original source,” “started teaching model,” and “completed showcase chapter.” Do not capture search text, free text, patient details, session replay or patient-level identifiers. Report sample size, collection dates and method beside every result.

## Dependency assurance

The deployment workflow fails on high or critical production advisories. On 27 August 2026 the complete production audit reports zero known vulnerabilities. The full development audit currently reports three high-severity advisories inside an unused optional image-processing dependency pulled in by the latest Promptfoo release. That optional path is neither imported by the fixture harness nor shipped in the public build. Keep Promptfoo pinned, monitor its upstream dependency update and rerun both audits before enabling any new provider or media-processing plugin.
