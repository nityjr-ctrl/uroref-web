# UroRef Web

Source-led learning and product hub for **UroRef** — a urology quick-reference app and a connected family of spatial teaching projects.
Built with [Astro](https://astro.build) + Tailwind CSS v4. Static output, deploy anywhere.

## Stack

- Astro 7 (static site)
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- MDX for long-form Deep Dives
- `@astrojs/sitemap` for SEO
- Pagefind for private, browser-side hub search and filters
- Google model-viewer for the local GLB/USDZ teaching demonstration
- Promptfoo and axe-core quality gates
- Optional Umami wiring for privacy-first aggregate analytics

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # → ./dist/ plus the Pagefind index
npm run preview  # serve the production build
```

Node `>=22.22.0` is required (see `package.json#engines`).

The presentation entry point is `/showcase/`. After building, `npm run presentation` serves the fully local fallback at `http://127.0.0.1:4321/showcase/`.

## Project structure

```
src/
├── content/deep-dives/   # MDX articles, schema in src/content.config.ts
├── layouts/Base.astro    # Shared shell (nav, footer, SEO meta)
├── pages/                # File-based routes
│   ├── index.astro       # Marketing home
│   ├── showcase.astro    # Five-project Mega Hub and guided presentation
│   ├── imaging-lab.astro # Synthetic/public-data imaging boundary
│   ├── app.astro         # Download page
│   ├── contact.astro
│   ├── updates.astro     # Changelog
│   └── deep-dives/       # Listing + [slug].astro
└── styles/global.css     # Tailwind entry + theme tokens
public/
├── about/index.html      # Standalone editorial About experience
└── ...                   # Static assets (favicons, models, publicity files)
evals/                    # Ariadne contract fixtures and gated live suite
docs/                     # Presentation runbook and technology gates
```

## Quality gates

```sh
npm run build
npm run check:links
npm run audit:production
npm run eval:ariadne:fixtures
npm run check:a11y
```

The deterministic Promptfoo fixture suite validates response contracts; it is not represented as a live-model evaluation. The separate live suite refuses to run unless `ARIADNE_EVAL_ENDPOINT` is set; only an approved, evaluation-only endpoint should be supplied. axe-core automation complements rather than replaces manual keyboard, zoom, contrast and assistive-technology review.

See [`docs/PRESENTATION-RUNBOOK.md`](docs/PRESENTATION-RUNBOOK.md) and [`docs/TECHNOLOGY-READINESS.md`](docs/TECHNOLOGY-READINESS.md).

For a Claude Design → Claude Code homepage redesign, start with [`docs/CLAUDE-DESIGN-HANDOFF.md`](docs/CLAUDE-DESIGN-HANDOFF.md). Claude Code also reads the repository contract in [`CLAUDE.md`](CLAUDE.md).

## Deploying

The production site is published to GitHub Pages at `https://uroref.com` by `.github/workflows/deploy.yml`. Pull requests run the quality workflow; a merge or direct push to `master` runs the same gates, deploys `./dist/`, and verifies that the public homepage exposes the deployed commit SHA in its `uroref-build-ref` meta tag. A feature-branch push alone does not update the public site.

The output remains fully static and portable. The canonical production URL is set in `astro.config.mjs`, while `public/CNAME` keeps the custom GitHub Pages domain.

Umami remains disabled unless both variables in `.env.example` are provided. Do not add search text, patient data or free text to analytics events.

## Content

Add a new Deep Dive by creating an `.mdx` file in `src/content/deep-dives/` with
frontmatter matching the schema in `src/content.config.ts` (`title`, `description`,
`date`, optional `author`, `tags`).

## Disclaimer

UroRef is a quick-reference tool for trained clinicians and is **not** a substitute
for senior advice or trust guidelines.
