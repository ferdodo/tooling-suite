#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// `throw` as a keyword only: not `toThrow`, `obj.throw` or `throwError`.
const THROW_PATTERN = /(?<![\w$.])throw(?![\w$])/;

async function checkFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const errors = [];

  content.split('\n').forEach((line, index) => {
    if (THROW_PATTERN.test(line)) {
      errors.push(`${filePath}:${index + 1}`);
    }
  });

  return errors;
}

async function walkDir(dir, extensions = ['.ts', '.tsx', '.js', '.mjs']) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...(await walkDir(fullPath, extensions)));
      }
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function noThrow() {
  const files = await walkDir(process.cwd());

  const allErrors = [];
  for (const file of files) {
    allErrors.push(...(await checkFile(file)));
  }

  if (allErrors.length > 0) {
    console.error('❌ no-throw: `throw` is not allowed in this project\n');
    allErrors.forEach(location => console.error(`  ${location}`));
    console.error('\n  Suggestion: return a value that signals the problem.\n');
    return 1;
  }

  console.log('✅ No throw statements found');
  return 0;
}
