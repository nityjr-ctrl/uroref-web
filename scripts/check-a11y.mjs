import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const host = '127.0.0.1';
const port = 4387;
const origin = `http://${host}:${port}`;
const distRoot = path.resolve('dist');

const walk = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
};

const routes = (await walk(distRoot))
  .filter((file) => file.endsWith('.html'))
  .map((file) => path.relative(distRoot, file).replaceAll('\\', '/'))
  .filter((relative) => !relative.split('/').includes('prostateview'))
  .map((relative) => relative === 'index.html' ? '/' : `/${relative.replace(/index\.html$/, '')}`)
  .sort((a, b) => a.localeCompare(b));
const server = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--host', host, '--port', String(port)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
});

const waitForServer = async () => {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Timed out waiting for the local production preview.');
};

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const failures = [];

  for (const route of routes) {
    const page = await context.newPage();
    const response = await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) failures.push(`${route}: navigation returned ${response?.status() ?? 'no response'}`);
    await page.waitForTimeout(400);

    const structural = await page.evaluate(() => ({
      h1Count: document.querySelectorAll('h1').length,
      hasMain: Boolean(document.querySelector('main#main-content')),
      hasSkipLink: Boolean(document.querySelector('a[href="#main-content"]')),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    if (structural.h1Count !== 1) failures.push(`${route}: expected one h1, found ${structural.h1Count}`);
    if (!structural.hasMain) failures.push(`${route}: missing main landmark`);
    if (!structural.hasSkipLink) failures.push(`${route}: missing skip link to the main landmark`);
    if (structural.horizontalOverflow) failures.push(`${route}: horizontal overflow at 1280px`);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    for (const violation of results.violations) {
      const targets = violation.nodes.slice(0, 8).map((node) => node.target.join(' ')).join(', ');
      failures.push(`${route}: axe ${violation.id} (${violation.impact ?? 'impact unknown'}) on ${violation.nodes.length} node(s): ${targets}`);
    }
    await page.close();
  }

  const interactionPage = await context.newPage();
  await interactionPage.goto(`${origin}/showcase/`, { waitUntil: 'domcontentloaded' });
  await interactionPage.getByRole('button', { name: /search/i }).click();
  const dialog = interactionPage.getByRole('dialog', { name: /find a topic/i });
  if (!await dialog.isVisible()) failures.push('/showcase/: search dialog did not open');
  const searchInput = dialog.locator('[data-hub-search-input]');
  await searchInput.fill('stone');
  try {
    await dialog.locator('[data-search-result]').first().waitFor({ state: 'visible', timeout: 10_000 });
    await interactionPage.waitForFunction(() => document.querySelector('[data-hub-search-status]')?.textContent?.includes('private static index'), null, { timeout: 10_000 });
  } catch {
    failures.push('/showcase/: Pagefind did not return a production-index result');
  }
  const searchState = await interactionPage.evaluate((query) => {
    const links = Array.from(document.querySelectorAll('[data-search-result]'));
    const leaking = links
      .map((link) => link.getAttribute('href') || '')
      .filter((href) => {
        const resultUrl = new URL(href, location.href);
        return resultUrl.origin === location.origin && resultUrl.search.toLowerCase().includes(query);
      });
    return {
      resultCount: links.length,
      leaking,
      status: document.querySelector('[data-hub-search-status]')?.textContent?.trim() || '',
    };
  }, 'stone');
  if (!searchState.resultCount) failures.push('/showcase/: search returned no results for “stone”');
  if (!searchState.status.includes('private static index')) failures.push(`/showcase/: search did not confirm the private production index (${searchState.status || 'no status'})`);
  if (searchState.leaking.length) failures.push(`/showcase/: search text leaked into internal result URLs: ${searchState.leaking.join(', ')}`);

  await searchInput.fill('');
  await dialog.locator('[data-hub-search-topic]').selectOption('Stones');
  await dialog.locator('[data-hub-search-type]').selectOption('Deep Dive');
  await searchInput.fill('stone');
  try {
    await interactionPage.waitForFunction(() => {
      const status = document.querySelector('[data-hub-search-status]')?.textContent || '';
      const metas = Array.from(document.querySelectorAll('.hub-search-result-meta')).map((node) => node.textContent?.trim());
      return status.includes('private static index') && metas.length > 0 && metas.every((meta) => meta === 'Deep Dive');
    }, null, { timeout: 10_000 });
  } catch {
    failures.push('/showcase/: Stones + Deep Dive filters did not return only matching indexed content');
  }
  await interactionPage.keyboard.press('Escape');
  await interactionPage.waitForTimeout(50);
  if (await dialog.isVisible()) failures.push('/showcase/: Escape did not close the search dialog');
  const searchFocusRestored = await interactionPage.evaluate(() => document.activeElement?.matches('[data-hub-search-open]'));
  if (!searchFocusRestored) failures.push('/showcase/: search close did not restore focus to its trigger');
  await interactionPage.setViewportSize({ width: 390, height: 844 });
  await interactionPage.reload({ waitUntil: 'domcontentloaded' });
  const menuButton = interactionPage.locator('[data-site-menu-button]');
  await menuButton.waitFor({ state: 'visible' });
  await menuButton.click();
  if (await menuButton.getAttribute('aria-expanded') !== 'true') failures.push('/showcase/: mobile menu did not expose its expanded state');
  const mobileOverflow = await interactionPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (mobileOverflow) failures.push('/showcase/: horizontal overflow at 390px');
  const mobileAxe = await new AxeBuilder({ page: interactionPage })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  for (const violation of mobileAxe.violations) {
    const targets = violation.nodes.slice(0, 8).map((node) => node.target.join(' ')).join(', ');
    failures.push(`/showcase/ mobile: axe ${violation.id} (${violation.impact ?? 'impact unknown'}) on ${violation.nodes.length} node(s): ${targets}`);
  }
  await interactionPage.keyboard.press('Escape');
  if (await menuButton.getAttribute('aria-expanded') !== 'false') failures.push('/showcase/: Escape did not collapse the mobile menu');
  await interactionPage.close();

  const presentationPage = await context.newPage();
  await presentationPage.goto(`${origin}/showcase/`, { waitUntil: 'domcontentloaded' });
  const presentationStart = presentationPage.locator('[data-presentation-start]');
  const presentationControls = presentationPage.locator('[data-presentation-controls]');
  await presentationStart.click();
  await presentationControls.waitFor({ state: 'visible' });
  await presentationPage.waitForTimeout(100);
  const presentationEntryState = await presentationPage.evaluate(() => ({
    exitFocused: document.activeElement?.matches('[data-presentation-exit]'),
    liveLabel: document.querySelector('[data-presentation-label]')?.getAttribute('aria-live'),
  }));
  if (!presentationEntryState.exitFocused) failures.push('/showcase/: guided view did not move focus to the exit control');
  if (presentationEntryState.liveLabel !== 'polite') failures.push('/showcase/: guided chapter changes are not announced');
  await presentationPage.keyboard.press('Tab');
  const tabReachedPrevious = await presentationPage.evaluate(() => document.activeElement?.matches('[data-presentation-prev]'));
  if (!tabReachedPrevious) failures.push('/showcase/: guided controls have an unexpected Tab order');
  const originalChapter = await presentationPage.locator('[data-presentation-label]').textContent();
  await presentationPage.keyboard.press('ArrowRight');
  await presentationPage.waitForTimeout(100);
  const nextChapter = await presentationPage.locator('[data-presentation-label]').textContent();
  if (nextChapter === originalChapter) failures.push('/showcase/: guided keyboard navigation did not advance a chapter');
  await presentationPage.locator('[data-presentation-exit]').click();
  if (await presentationControls.isVisible()) failures.push('/showcase/: guided exit did not hide its controls');
  const presentationFocusRestored = await presentationPage.evaluate(() => document.activeElement?.matches('[data-presentation-start]'));
  if (!presentationFocusRestored) failures.push('/showcase/: guided exit did not restore focus to its trigger');
  await presentationPage.close();

  const offlineModelPage = await context.newPage();
  await offlineModelPage.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url());
    if ((requestUrl.protocol === 'http:' || requestUrl.protocol === 'https:') && requestUrl.origin !== origin) {
      await route.abort();
      return;
    }
    await route.continue();
  });
  await offlineModelPage.goto(`${origin}/showcase/`, { waitUntil: 'domcontentloaded' });
  await offlineModelPage.getByRole('button', { name: 'Load interactive 3D' }).click();
  try {
    await offlineModelPage.locator('[data-model-stage].is-loaded').waitFor({ state: 'visible', timeout: 20_000 });
  } catch {
    const statusText = await offlineModelPage.locator('[data-model-status]').textContent();
    failures.push(`/showcase/: local 3D did not load with all external requests blocked (${statusText?.trim() || 'no status'})`);
  }
  if (await offlineModelPage.locator('[data-model-stage].has-error').count()) {
    failures.push('/showcase/: local 3D entered its error state with all external requests blocked');
  }
  await offlineModelPage.close();

  if (failures.length) {
    console.error(`Accessibility check failed with ${failures.length} issue(s):\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(`Accessibility check passed for ${routes.length} authored routes, desktop and mobile interactions, guided view, private search and the offline 3D load.`);
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}
