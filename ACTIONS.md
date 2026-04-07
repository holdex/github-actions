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

#### Inputs

- `ref` (required): ref/commit to checkout from `holdex/github-actions`.

#### Behavior

- Checks out `holdex/github-actions` into `.holdex-actions`.
- Intended as the first step before calling local-path actions from that checkout.

> [!WARNING]
> Keep `base/checkout` backward compatible. Workflows reference the action as `.../base/checkout@main`, so any breaking change merged to this repo’s `main` will immediately break consumers.
>
> This also applies to the `ref` input: existing workflows often pass `ref: main` (a branch name) for the _target_ repo checkout, so don’t change `ref` semantics in a way that would require a commit SHA.

### `base/setup-runtime`

Path: `/.github/actions/base/setup-runtime`

#### Inputs

- `package-manager` (default: `"bun"`): `bun`, `pnpm`, or `npm`.

#### Behavior

- Validates allowed `package-manager` values.
- For `bun`: installs Bun runtime.
- For `pnpm`/`npm`: installs Node.js.
- For `pnpm`: installs pnpm using `package.json#packageManager` when present, otherwise falls back to `latest`.
- Respects `HOLDEX_WORKING_DIR` env var for `package.json` detection when set.

### `base/prettier`

Path: `/.github/actions/base/prettier`

#### Inputs

- `changed-files` (default: `""`): optional pre-resolved changed files list.
- `package-manager` (default: `"bun"`): `bun`, `pnpm`, or `npm`.

#### Behavior

- Discovers changed files itself if `changed-files` is not provided.
- Skips execution if no changed files exist.
- Installs Prettier globally using selected package manager.
- Verifies a resolvable Prettier config exists.
- Runs dependency install in repo context when `package.json` exists:
  - `bun i --frozen-lockfile`, `pnpm install --frozen-lockfile`, or `npm ci`.
- Runs `prettier --check --ignore-unknown` on changed files.
- Respects `HOLDEX_WORKING_DIR` env var: all steps run in that directory when set.

### `base/markdown-check`

Path: `/.github/actions/base/markdown-check`

#### Inputs

- `changed-files` (default: `""`): optional pre-resolved changed files list.
- `package-manager` (default: `"bun"`): `bun`, `pnpm`, or `npm`.

#### Behavior

- Discovers changed markdown files (`.md`, `.mdx`) if `changed-files` is not provided.
- Filters/uses markdown-only changed files.
- Skips execution if no markdown files changed.
- Installs `rumdl` globally using selected package manager.
- Runs `rumdl check --output-format github --fail-on error` on changed markdown files.
- Respects `HOLDEX_WORKING_DIR` env var: all steps run in that directory when set.

### `base/commit-check`

Path: `/.github/actions/base/commit-check`

#### Inputs

- `package-manager` (default: `"bun"`): `bun`, `pnpm`, or `npm`.

#### Behavior

- Runs only on `pull_request` events for install/config/check steps.
- Installs commitlint CLI globally using selected package manager.
- Detects commitlint configuration from standard config files or `package.json`.
- If config exists, installs dependencies in repo context:
  - `bun i --frozen-lockfile`, `pnpm install --frozen-lockfile`, or `npm ci`.
- If config does not exist, installs `@commitlint/config-conventional` and creates fallback `.commitlintrc.yml`.
- Validates PR title via `commitlint`.
- Respects `HOLDEX_WORKING_DIR` env var: all steps run in that directory when set.

## Composed Actions

Composed actions orchestrate multiple base actions into a single, higher-level
check. They are intended to run after `base/checkout` (so `.holdex-actions` is
present) and typically assume `base/setup-runtime` has already been called.

### `composed/pr-checks`

Path: `/.github/actions/composed/pr-checks`

#### Inputs

- `run-prettier` (default: `"true"`): enable prettier check.
- `run-markdown` (default: `"true"`): enable markdown check.
- `run-commits` (default: `"true"`): enable commit check.
- `package-manager` (default: `"bun"`): `bun`, `pnpm`, or `npm`.
- `working-directory` (default: `"."`): working directory to run all checks in.

#### Behavior

- Discovers changed files once when needed (prettier/markdown enabled).
- Runs selected base actions:
  - `base/prettier`
  - `base/markdown-check`
  - `base/commit-check`
- Assumes `base/setup-runtime` has already been called by the client.
- Sets `HOLDEX_WORKING_DIR` env var from `working-directory` input (falls back to existing env var if already set by the calling workflow).

## Working Directory

All base actions and the `composed/pr-checks` action support running in a subdirectory via the `HOLDEX_WORKING_DIR` environment variable. This is useful for monorepos where checks should be scoped to a specific package.

The env var is set automatically when using the `pr-checks.yml` reusable workflow with the `working-directory` input, or when using `composed/pr-checks` directly with the `working-directory` input. Base actions read it implicitly — they require no additional inputs.

### Usage via reusable workflow

```yaml
jobs:
  checks:
    uses: holdex/github-actions/.github/workflows/pr-checks.yml@main
    with:
      working-directory: ./packages/my-package
```

### Usage via composed action

```yaml
- name: Run PR checks
  uses: ./.holdex-actions/.github/actions/composed/pr-checks
  with:
    working-directory: ./packages/my-package
```
