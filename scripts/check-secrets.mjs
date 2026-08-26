import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const rules = [
  { name: 'GitHub token', expression: /github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,}/ },
  { name: 'AWS access key', expression: /AKIA[0-9A-Z]{16}/ },
  { name: 'private key', expression: /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/ },
  { name: 'Stripe live secret', expression: /sk_live_[A-Za-z0-9]+/ },
];

const ignoredDirectories = new Set([
  '.git',
  '.pnpm-store',
  '.turbo',
  'build',
  'dist',
  'docs',
  'node_modules',
]);

function applicationFiles(directory = '.') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory())
      return ignoredDirectories.has(entry.name) ? [] : applicationFiles(path);
    return entry.isFile() ? [path] : [];
  });
}

const files = applicationFiles();

const findings = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const rule of rules) {
    if (rule.expression.test(content)) findings.push(`${rule.name}: ${file}`);
  }
}

if (findings.length > 0) {
  console.error(`Potential committed secrets detected:\n${findings.join('\n')}`);
  process.exit(1);
}

console.log(`Secret baseline passed for ${files.length} application files.`);
