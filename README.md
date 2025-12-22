# GitHub Actions

Shared GitHub Actions workflows for consistent code quality checks across
repositories.

## Available Workflows

This repository provides reusable workflows for:

- **Prettier Check** - Validates code formatting with Prettier
- **Markdown Lint** - Lints Markdown files using rumdl
- **Conventional Commit Check for PR Title** - Validates PR titles follow
  conventional commit format
- **PR Checks** - Combined workflow that runs all checks (or selected ones) with
  draft PR handling

## Usage

### Option 1: Combined Workflow (Recommended for Simple Setup)

Use the combined `pr-checks.yml` workflow to run all checks at once. This
workflow automatically handles draft PRs and runs all checks by default.

#### Basic Usage

Create `.github/workflows/pr-checks.yml` in your repository:

```yaml
name: PR Checks

on:
  pull_request:
    types: [opened, reopened, synchronize, ready_for_review]

jobs:
  checks:
    uses: holdex/github-actions/.github/workflows/pr-checks.yml@main
```

#### Selective Checks

To run only specific checks, pass input flags:

```yaml
name: PR Checks

on:
  pull_request:
    types: [opened, reopened, synchronize, ready_for_review]

jobs:
  checks:
    uses: holdex/github-actions/.github/workflows/pr-checks.yml@main
    with:
      run-prettier: true
      run-markdown: false # Skip markdown check
      run-commits: true
```

### Option 2: Individual Workflows

Use individual workflows for granular control over when each check runs.

#### Prettier Check

```yaml
name: Prettier Check

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  prettier:
    uses: holdex/github-actions/.github/workflows/prettier.yml@main
```

**Requirements:**

- Prettier configuration file (`.prettierrc`, `.prettierrc.json`, etc.) or
  `prettier` config in `package.json`

#### Markdown Lint

```yaml
name: Markdown Lint

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  markdown:
    uses: holdex/github-actions/.github/workflows/markdown-check.yml@main
```

#### Conventional Commit Check

```yaml
name: Commit Check

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  commits:
    uses: holdex/github-actions/.github/workflows/commit-check.yml@main
```

**Requirements:**

- Commitlint configuration file (`.commitlintrc.json`, etc.) or `commitlint`
  config in `package.json`
- If no config exists, the workflow will create a default `.commitlintrc.json`
  file
- `package.json` is required because the workflow installs
  `@commitlint/config-conventional` as a dev dependency

## Workflow Details

### PR Checks (`pr-checks.yml`)

The combined workflow includes:

- **Draft PR handling** - Automatically skips checks for draft PRs
- **Selective execution** - Control which checks run via inputs
- **Default behavior** - Runs all checks if no inputs specified

**Inputs:**

- `run-prettier` (boolean, default: `true`) - Run Prettier check
- `run-markdown` (boolean, default: `true`) - Run Markdown lint
- `run-commits` (boolean, default: `true`) - Run commit check

### Prettier Check (`prettier.yml`)

- Validates that a Prettier configuration exists
- Checks code formatting using Prettier
- Supports all Prettier-supported file types
- Uses Bun for package management

### Markdown Lint (`markdown-check.yml`)

- Uses `rumdl` v0.0.185 for fast Markdown linting
- Checks all Markdown files in the repository
- Reports issues with GitHub annotations

### Conventional Commit Check (`commit-check.yml`)

- Validates PR titles follow conventional commit format
- Creates default commitlint config if missing (requires `package.json`)
- Uses Bun for package management

## Requirements

- Node.js 22+
- Bun (installed automatically in workflows)
  - Uses the latest version of Bun
