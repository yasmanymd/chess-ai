import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const locales = [
  {
    code: 'en',
    localeLabel: 'Language',
    homeTitle: 'Make your next move together.',
    importTitle: 'Replay a game from PGN.',
    pgnLabel: 'PGN text',
  },
  {
    code: 'es',
    localeLabel: 'Idioma',
    homeTitle: 'Haz tu próxima jugada en compañía.',
    importTitle: 'Repite una partida desde PGN.',
    pgnLabel: 'Texto PGN',
  },
  {
    code: 'fr',
    localeLabel: 'Langue',
    homeTitle: 'Jouez votre prochain coup ensemble.',
    importTitle: 'Relisez une partie depuis un PGN.',
    pgnLabel: 'Texte PGN',
  },
] as const;

test('critical public pages remain translated, accessible, and responsive', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const locale of locales) {
    await page.goto(`/?lang=${locale.code}`);

    await expect(page.locator('html')).toHaveAttribute('lang', locale.code);
    await expect(page.getByRole('heading', { name: locale.homeTitle })).toBeVisible();
    await expect(page.getByRole('combobox', { name: locale.localeLabel })).toHaveValue(locale.code);
    await expect(page.locator('#main-content')).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);

    const homeScan = await new AxeBuilder({ page }).analyze();
    expect(homeScan.violations).toEqual([]);

    await page.goto(`/import?lang=${locale.code}`);
    await expect(page.getByRole('heading', { name: locale.importTitle })).toBeVisible();
    await expect(page.getByRole('combobox', { name: locale.localeLabel })).toHaveValue(locale.code);
    await expect(page.getByRole('textbox', { name: locale.pgnLabel })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
  }
});

test('archive and PGN import navigation remain usable at desktop width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?lang=en');

  await page.getByRole('link', { name: 'Import PGN' }).click();
  await expect(page).toHaveURL(/\/import\?lang=en/);
  await expect(page.getByRole('heading', { name: 'Replay a game from PGN.' })).toBeVisible();

  await page.getByRole('link', { name: 'Archive' }).click();
  await expect(page).toHaveURL(/\/archive\?lang=en/);
  await expect(page.getByRole('heading', { name: 'Revisit every finished game.' })).toBeVisible();
});

test('mobile navigation exposes the PGN import route', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?lang=en');

  await page.getByText('More', { exact: true }).click();
  await page.getByRole('link', { name: 'Import PGN' }).click();

  await expect(page).toHaveURL(/\/import\?lang=en/);
  await expect(page.getByRole('heading', { name: 'Replay a game from PGN.' })).toBeVisible();
});

test('mobile PGN form remains usable before client JavaScript is available', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  await page.goto('/import?lang=en');

  const textArea = page.getByRole('textbox', { name: 'PGN text' });
  await expect(textArea).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);

  const bounds = await textArea.boundingBox();
  expect(bounds?.x).toBeGreaterThanOrEqual(0);
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(390);

  await context.close();
});

test('mobile PGN replay controls advance the displayed position', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/import?lang=en');

  await page.getByRole('textbox', { name: 'PGN text' }).fill('1. e4 e5 2. Nf3 Nc6 *');
  await page.getByRole('button', { name: 'Open replay' }).click();

  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('status')).toHaveText('Current position: 1. e4');

  await page.getByRole('button', { name: 'End' }).click();
  await expect(page.getByRole('status')).toHaveText('Current position: 2… Nc6');
});
