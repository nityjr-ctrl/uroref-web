# Claude Design → Claude Code → UroRef production

This is the shortest reliable path from a Claude Design system to the live UroRef homepage.

## 1. Export from Claude Design

Ask Claude Design for, or save, the following:

- a design-system description with layout, hierarchy, spacing, typography, colour, component and interaction rules;
- desktop and mobile homepage references;
- named design tokens in CSS, JSON or a clearly structured table;
- original image, icon and illustration files rather than screenshots of those assets;
- font names and licensing/source notes;
- accessibility expectations, including focus, hover, reduced-motion and contrast states;
- a short version/date note identifying which export is approved.

The existing UroRef logo kit is in `public/brand/logo-kit/`. Give Claude Code the transparent lockup PNGs for visual reference and the SVGs for implementation.

If you copy the export into the repository, use `docs/design-system/` and follow its README. An attachment supplied directly to Claude Code is also acceptable.

## 2. Give Claude Code this task

Replace the bracketed line with the location or attachment name of the approved design system.

```text
Implement the approved Claude Design system for the UroRef public homepage in this repository.

Approved design source: [ATTACHMENT OR docs/design-system/ FILE]

Read CLAUDE.md and docs/CLAUDE-DESIGN-HANDOFF.md before editing. Treat the design export as authoritative for visual direction, but keep the repository authoritative for content, routes, canonical project names, safety notices, metrics, evidence and deployment.

Rebuild the homepage at src/pages/index.astro using reusable Astro components and shared CSS tokens. Use the existing five-project logo suite. Preserve the Base.astro shell, search, metadata, routes, accessibility behaviour and clinical-education boundaries. Do not overwrite public/prostateview/.

Work on a feature branch. Inspect and run the complete repository checks, visually test desktop and mobile layouts, fix defects, then commit and push the branch. Open a pull request into master with screenshots and a concise mapping from design-system components to code.

I authorise publishing this homepage after the required checks pass and the pull request is mergeable. Merge it into master, monitor the Deploy to GitHub Pages workflow, and verify that https://uroref.com/ reports the merged commit in the uroref-build-ref meta tag. Do not claim completion while the change exists only on a feature branch or while deployment verification is pending.
```

If you want to review before publication, remove the final paragraph and replace it with: “Stop after opening the pull request and wait for my review.”

## 3. What the automated path guarantees

1. Pull requests run the production build, link checks, logo checks, dependency audit, Ariadne contract fixtures and accessibility suite.
2. Only `master` deploys the public GitHub Pages site.
3. Every Pages build embeds its Git commit SHA in the homepage.
4. The deployment workflow waits for `uroref.com` to return that SHA before reporting success.

This makes “pushed to GitHub,” “merged,” and “live on the public page” three separately verifiable states.

## 4. Human review points

- Confirm the desktop and mobile hierarchy matches the approved Claude Design reference.
- Check all five project names and logos.
- Check every numerical or clinical claim against its existing source and limitation.
- Test keyboard navigation, visible focus, 200% zoom and reduced motion.
- Confirm the pull request targets `master` and the deployed SHA matches the merged commit.
