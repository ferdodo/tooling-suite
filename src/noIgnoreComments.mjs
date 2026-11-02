#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const IGNORE_PATTERNS = ['biome-ignore', 'ts-ignore', '@ts-ignore'];

async function checkFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const errors = [];

  lines.forEach((line, index) => {
    for (const pattern of IGNORE_PATTERNS) {
      if (line.includes(pattern)) {
        errors.push(`${filePath}:${index + 1} - Found "${pattern}"`);
      }
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

export async function noIgnoreComments() {
  const projectRoot = process.cwd();
  const files = await walkDir(projectRoot);

  const allErrors = [];
  for (const file of files) {
    const errors = await checkFile(file);
    allErrors.push(...errors);
  }

  if (allErrors.length > 0) {
    console.error('❌ Found ignore comments in code:\n');
    allErrors.forEach(error => console.error(error));
    return 1;
  }

  console.log('✅ No ignore comments found');
  return 0;
}
