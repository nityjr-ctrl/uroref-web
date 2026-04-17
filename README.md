# UroRef Web

Marketing and content site for **UroRef** — a urology quick-reference app for trainees.
Built with [Astro](https://astro.build) + Tailwind CSS v4. Static output, deploy anywhere.

## Stack

- Astro 6 (static site)
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- MDX for long-form Deep Dives
- `@astrojs/sitemap` for SEO

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # → ./dist/
npm run preview  # serve the production build
```

Node `>=22.12.0` is required (see `package.json#engines`).

## Project structure

```
src/
├── content/deep-dives/   # MDX articles, schema in src/content.config.ts
├── layouts/Base.astro    # Shared shell (nav, footer, SEO meta)
├── pages/                # File-based routes
│   ├── index.astro       # Marketing home
│   ├── app.astro         # Download page
│   ├── about.astro
│   ├── contact.astro
│   ├── updates.astro     # Changelog
│   └── deep-dives/       # Listing + [slug].astro
└── styles/global.css     # Tailwind entry + theme tokens
public/                   # Static assets (favicon, robots.txt)
```

## Deploying

The build output in `./dist/` is fully static. Recommended hosts: Cloudflare Pages,
Netlify, Vercel, or GitHub Pages. Set the production `site` URL in `astro.config.mjs`
before publishing so canonical URLs and the sitemap are correct.

## Content

Add a new Deep Dive by creating an `.mdx` file in `src/content/deep-dives/` with
frontmatter matching the schema in `src/content.config.ts` (`title`, `description`,
`date`, optional `author`, `tags`).

## Disclaimer

UroRef is a quick-reference tool for trained clinicians and is **not** a substitute
for senior advice or trust guidelines.
