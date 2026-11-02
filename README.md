# tooling-suite

A suite of code-quality tools bundled behind a single CLI:

| Command              | What it runs                                           |
| -------------------- | ------------------------------------------------------ |
| `biome`              | `biome check .` with the bundled `biome.json`          |
| `exportcase`         | `exportcase check src`                                 |
| `typecheck`          | `tsc --noEmit`                                         |
| `test`               | `vitest run --passWithNoTests`                         |
| `mutation`           | Stryker, with the bundled `stryker.config.json`        |
| `no-ignore-comments` | Fails if `biome-ignore` / `ts-ignore` comments exist    |

## Usage

```sh
npm install --save-dev tooling-suite
npx tooling-suite biome exportcase typecheck no-ignore-comments
```

Commands run in the order given and stop at the first failure.

## Scripts

```json
{
  "scripts": {
    "test": "tooling-suite biome exportcase typecheck no-ignore-comments"
  }
}
```

# Publishing

  docker compose build --no-cache publish
  docker compose run publish bash ./scripts/publish.sh

## Notes

- `biome.json` forbids importing `beforeEach`, `afterEach` and `vi` from `vitest`, so each test stays isolated. Use dedicated test doubles instead of `vi`.
- `exportcase` checks the `src` directory of the project you run the command in.
