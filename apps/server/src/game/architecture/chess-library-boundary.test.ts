import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const sourceRoot = new URL('../', import.meta.url);
const adapterPath = 'infrastructure/chess-js-rules-adapter.ts';

const sourceFiles = async (directory: URL, relative = ''): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const nextRelative = join(relative, entry.name);
      if (entry.isDirectory())
        return sourceFiles(new URL(`${entry.name}/`, directory), nextRelative);
      return entry.name.endsWith('.ts') ? [nextRelative] : [];
    }),
  );
  return nested.flat();
};

describe('chess library boundary', () => {
  it('allows a chess.js import only inside the infrastructure adapter', async () => {
    const files = await sourceFiles(sourceRoot);
    const directImports = await Promise.all(
      files.map(async (relativePath) => ({
        relativePath,
        source: await readFile(new URL(relativePath, sourceRoot), 'utf8'),
      })),
    );

    expect(
      directImports
        .filter(({ source }) => /from ['"]chess\.js['"]/.test(source))
        .map(({ relativePath }) => relativePath),
    ).toEqual([adapterPath]);
  });
});
