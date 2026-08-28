# Claude Code working agreement — UroRef web

This repository is the production source for `https://uroref.com`. Treat an attached Claude Design export as the visual brief, and this repository as the authority for content, routes, safety language, data and deployment.

## What “the UroRef page” means

- The public homepage is `/`, served from `public/index.html`: the approved portfolio design promoted from the `/next/` preview at the user's instruction (28 Aug 2026), with its css/js/assets at `public/css`, `public/js` and `public/assets`. `src/pages/index.astro` was deleted to avoid the route collision, following the `/about` precedent. A repo-native Astro rebuild of this page remains welcome but is not required. `/next/` now serves redirect stubs.
- Do not create a separate `/urf` route unless the user explicitly asks for one.
- The presentation hub is `/showcase/`, implemented in `src/pages/showcase.astro`.

## Canonical project set

Use these names exactly and do not invent additional ecosystem projects:

1. UroRef
2. ProstateView
3. CalyxView
4. UrOops3D
5. Cystosight by UroRef

Project names, links, stages, descriptions, accents and safety notices come from `src/data/ecosystem.ts`. The five presentation logos live in `public/brand/logo-kit/presentation/`.

## Design-system implementation contract

- Translate the approved design system into repo-native Astro, CSS and assets. Do not paste a static screenshot as the page.
- Prefer shared tokens and primitives in `src/styles/global.css`; keep page-specific rules with their page or component.
- Preserve the shared shell in `src/layouts/Base.astro`, including metadata, navigation, search, skip link, main landmark, footer and deployment marker.
- Keep existing URLs working. Preserve `/showcase/`, `/deep-dives/`, `/app/`, `/about/`, `/contact/`, `/privacy/`, `/terms/`, `/nity/` and `/imaging-lab/`.
- Do not overwrite the mirrored application under `public/prostateview/` unless the user explicitly places that mirror in scope.
- Use supplied logo files rather than recreating them with text or generic icons.
- Do not fabricate engagement, adoption, validation, outcome or endorsement claims. Keep dates, denominators, provenance and limitations beside any metric.
- Keep educational-use boundaries visible. Do not imply diagnosis, clinical decision support, medical-device status, NHS endorsement or BAUS endorsement.
- Never add patient-identifiable data, real patient imaging or analytics that capture search/free text.
- Maintain keyboard operation, focus visibility, reduced-motion support, 200% zoom resilience and responsive layouts without horizontal overflow.

The intake checklist and copy-ready task prompt are in `docs/CLAUDE-DESIGN-HANDOFF.md`. Design exports placed in `docs/design-system/` should remain attributable to their source and version.

## Required verification

Inspect each command definition before running it, then complete the relevant gates:

```text
npm ci
npm run build
npm run check:logos
npm run check:links
npm run audit:production
npm run eval:ariadne:fixtures
npm run check:a11y
```

Also inspect the homepage at desktop and mobile widths and test keyboard navigation. A build alone is not visual approval.

## GitHub and production handoff

- Work on a feature branch and open a pull request into `master`.
- Feature-branch pushes do not update the public site.
- The required checks must pass before merge.
- Merge only when the user has authorised publishing in the current Claude Code conversation.
- A merge or direct push to `master` triggers `.github/workflows/deploy.yml`.
- Do not claim the page is live until the `Deploy to GitHub Pages` workflow succeeds and `https://uroref.com/` exposes the merged commit in `<meta name="uroref-build-ref">`.

“Done” means the design is implemented responsively, the safety/content contract is preserved, the checks pass, the reviewed commit is on `master`, the Pages deployment succeeds, and the deployed build marker matches that commit.
