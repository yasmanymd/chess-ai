import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('renders the translated public route without detected accessibility violations', async ({
  page,
}) => {
  await page.goto('/?lang=es&intent=create');

  await expect(
    page.getByRole('heading', { name: 'Haz tu próxima jugada en compañía.' }),
  ).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Elige tu nombre visible' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Idioma' })).toHaveValue('es');

  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-enhanced', 'true');
  await expect(
    page.getByRole('heading', { name: 'Haz tu próxima jugada en compañía.' }),
  ).toBeVisible();

  const accessibilityScan = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScan.violations).toEqual([]);
});
