import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('renders the translated public route without detected accessibility violations', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Chess AI' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Language' }).selectOption('es');
  await expect(page.getByText('La base de la plataforma está en funcionamiento.')).toBeVisible();

  const accessibilityScan = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScan.violations).toEqual([]);
});
