# Actions

This repository provides reusable GitHub Actions under:

- `/.github/actions/base`
- `/.github/actions/composed`

## Base Actions

Base actions are granular, single-purpose building blocks. They are intended to
be called explicitly in your workflow steps after `base/checkout`, so you can
compose only the checks your repository needs in a single job.

### `base/checkout`

Path: `/.github/actions/base/checkout`

### Inputs

- `ref` (required): ref/commit to checkout from `holdex/github-actions`.

### Behavior

- Checks out `holdex/github-actions` into `.holdex-actions`.
- Intended as the first step before calling local-path actions from that checkout.

### `base/setup-runtime`

Path: `/.github/actions/base/setup-runtime`

### Inputs

- `package-manager` (default: `"bun"`): `bun`, `pnpm`, or `npm`.

### Behavior

- Validates allowed `package-manager` values.
- For `bun`: installs Bun runtime.
- For `pnpm`/`npm`: installs Node.js.
- For `pnpm`: installs pnpm using `package.json#packageManager` when present, otherwise falls back to `latest`.

### `base/prettier`

Path: `/.github/actions/base/prettier`

### Inputs

- `changed-files` (default: `""`): optional pre-resolved changed files list.
- `package-manager` (default: `"bun"`): `bun`, `pnpm`, or `npm`.

### Behavior

- Discovers changed files itself if `changed-files` is not provided.
- Skips execution if no changed files exist.
- Installs Prettier globally using selected package manager.
- Verifies a resolvable Prettier config exists.
- Runs dependency install in repo context when `package.json` exists:
  - `bun i --frozen-lockfile`, `pnpm install --frozen-lockfile`, or `npm ci`.
- Runs `prettier --check --ignore-unknown` on changed files.

### `base/markdown-check`

Path: `/.github/actions/base/markdown-check`

### Inputs

- `changed-files` (default: `""`): optional pre-resolved changed files list.
- `package-manager` (default: `"bun"`): `bun`, `pnpm`, or `npm`.

### Behavior

- Discovers changed markdown files (`.md`, `.mdx`) if `changed-files` is not provided.
- Filters/uses markdown-only changed files.
- Skips execution if no markdown files changed.
- Installs `rumdl` globally using selected package manager.
- Runs `rumdl check --output-format github` on changed markdown files.

### `base/commit-check`

Path: `/.github/actions/base/commit-check`

### Inputs

- `package-manager` (default: `"bun"`): `bun`, `pnpm`, or `npm`.

### Behavior

- Runs only on `pull_request` events for install/config/check steps.
- Installs commitlint CLI globally using selected package manager.
- Detects commitlint configuration from standard config files or `package.json`.
- If config exists, installs dependencies in repo context:
  - `bun i --frozen-lockfile`, `pnpm install --frozen-lockfile`, or `npm ci`.
- If config does not exist, installs `@commitlint/config-conventional` and creates fallback `.commitlintrc.yml`.
- Validates PR title via `commitlint`.

## Composed Actions

Composed actions orchestrate multiple base actions into a single, higher-level
check. They are intended to run after `base/checkout` (so `.holdex-actions` is
present) and typically assume `base/setup-runtime` has already been called.

### `composed/pr-checks`

Path: `/.github/actions/composed/pr-checks`

### Inputs

- `run-prettier` (default: `"true"`): enable prettier check.
- `run-markdown` (default: `"true"`): enable markdown check.
- `run-commits` (default: `"true"`): enable commit check.
- `package-manager` (default: `"bun"`): `bun`, `pnpm`, or `npm`.

### Behavior

- Discovers changed files once when needed (prettier/markdown enabled).
- Runs selected base actions:
  - `base/prettier`
  - `base/markdown-check`
  - `base/commit-check`
- Assumes `base/setup-runtime` has already been called by the client.
