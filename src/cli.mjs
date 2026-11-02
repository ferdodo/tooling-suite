#!/usr/bin/env node

import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { noIgnoreComments } from './noIgnoreComments.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const toolingRoot = resolve(__dirname, '..');
const require = createRequire(import.meta.url);

// Path of a dependency's executable, resolved from this package so it works
// wherever tooling-suite is installed (npx, npm scripts, consumer project).
function toolBin(pkg, name) {
  const pkgJsonPath = require.resolve(`${pkg}/package.json`);
  const { bin } = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  return resolve(dirname(pkgJsonPath), typeof bin === 'string' ? bin : bin[name]);
}

function run(pkg, name, args) {
  const result = spawnSync(process.execPath, [toolBin(pkg, name), ...args], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  return result.status ?? -1;
}

function biome() {
  const configPath = resolve(toolingRoot, 'biome.json');
  return run('@biomejs/biome', 'biome', ['check', '.', '--config-path', configPath]);
}

function exportcase() {
  return run('exportcase', 'exportcase', ['check', 'src']);
}

function typecheck() {
  return run('typescript', 'tsc', ['--noEmit']);
}

function test() {
  return run('vitest', 'vitest', ['run', '--passWithNoTests']);
}

function mutation() {
  const configPath = resolve(toolingRoot, 'stryker.config.json');
  return run('@stryker-mutator/core', 'stryker', ['run', configPath]);
}

function usage() {
  console.log(`
Usage: tooling-suite <command>

Commands:
  biome              Check code with biome
  exportcase         Run exportcase
  typecheck          Type check with TypeScript
  test               Run tests with vitest
  mutation           Run mutation testing with stryker
  no-ignore-comments Check for biome-ignore and ts-ignore comments
`);
}

const commands = process.argv.slice(2);

if (!commands.length) {
  usage();
  process.exit(0);
}

let exitCode = 0;
for (const command of commands) {
  let status = 0;
  switch (command) {
    case 'biome':
      status = biome();
      break;
    case 'exportcase':
      status = exportcase();
      break;
    case 'typecheck':
      status = typecheck();
      break;
    case 'test':
      status = test();
      break;
    case 'mutation':
      status = mutation();
      break;
    case 'no-ignore-comments':
      status = await noIgnoreComments();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      usage();
      exitCode = 1;
      break;
  }
  if (status !== 0) {
    exitCode = status;
    break;
  }
}

process.exit(exitCode);
