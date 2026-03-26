# GitHub Actions

Shared GitHub Actions workflows for consistent code quality checks across
repositories.

## Available Workflows

This repository provides reusable workflows for:

- **Prettier Check** - Validates code formatting with Prettier
- **Markdown Lint** - Lints Markdown files using rumdl
- **Conventional Commit Check for PR Title** - Validates PR titles follow
  conventional commit format
- **PR Checks** - Combined reusable workflow that runs selected checks in one
  job with draft PR handling

## Usage

Use a full commit SHA when referencing this repository in `uses:` for immutable,
secure pinning. Replace `<commit-sha>` in examples below with a real SHA.

### Option 1: Combined Reusable Workflow

Use the combined `pr-checks.yml` reusable workflow to run all checks at once.
This workflow automatically handles draft PRs and runs all checks by default.

#### Basic Usage

Create `.github/workflows/pr-checks.yml` in your repository:

```yaml
name: PR Checks

on:
  pull_request:
    types: [opened, reopened, synchronize, ready_for_review]

jobs:
  checks:
    uses: holdex/github-actions/.github/workflows/pr-checks.yml@<commit-sha>
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
    uses: holdex/github-actions/.github/workflows/pr-checks.yml@<commit-sha>
    with:
      run-prettier: true
      run-markdown: false # Skip markdown check
      run-commits: true
      package-manager: bun # Optional: bun (default) or pnpm
```

### Option 2: Composite Action

Use individual actions when you want project-specific steps in the same job.

#### Direct Action Example (Prettier)

```yaml
name: Prettier Check

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  checks:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: holdex/github-actions/.github/actions/prettier@<commit-sha>
        with:
          package-manager: pnpm
          setup-runtime: "true"

      - name: Run project checks
        run: |
          pnpm install --frozen-lockfile
          pnpm lint
          pnpm check
```

Make sure `actions/checkout` runs before the action step.

### Option 3: Individual Workflows

Use individual workflows for granular control over when each check runs.

> [!NOTE]
> If you want to run shared checks and project-specific steps in the same job,
> use Option 2 (direct composite actions) instead.

#### Prettier Check

```yaml
name: Prettier Check

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  prettier:
    uses: holdex/github-actions/.github/workflows/prettier.yml@<commit-sha>
```

#### Markdown Lint

```yaml
name: Markdown Lint

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  markdown:
    uses: holdex/github-actions/.github/workflows/markdown-check.yml@<commit-sha>
```

#### Conventional Commit Check

```yaml
name: Commit Check

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  commits:
    uses: holdex/github-actions/.github/workflows/commit-check.yml@<commit-sha>
```

**Requirements:**

- Commitlint configuration file (`.commitlintrc.json`, etc.) or `commitlint`
  config in `package.json`
- If no config exists, the workflow/action will create a default
  `.commitlintrc.yml` file

## Workflow Details

### PR Checks (`pr-checks.yml`)

The combined workflow includes:

- **Draft PR handling** - Automatically skips checks for draft PRs
- **Selective execution** - Control which checks run via inputs
- **Default behavior** - Runs all checks if no inputs specified
- **Single job execution** - Runs checks in one job to avoid tiny per-check jobs

**Inputs:**

- `run-prettier` (boolean, default: `true`) - Run Prettier check
- `run-markdown` (boolean, default: `true`) - Run Markdown lint
- `run-commits` (boolean, default: `true`) - Run commit check
- `package-manager` (string, default: `bun`) - Package manager (`bun` or `pnpm`)

## Reusable Workflow vs Composite Action

- Use **reusable workflow** for easiest adoption and stable interface across
  repos
- Use **composite action** when you need custom project steps in the same job
- Composite actions can reduce billed minute waste from tiny separate jobs
  because everything runs on one runner job

### Prettier Check (`prettier.yml`)

- Validates that a Prettier configuration exists
- Checks formatting on changed files using Prettier
- Supports all Prettier-supported file types
- Supports Bun or pnpm for package management

### Markdown Lint (`markdown-check.yml`)

- Installs `rumdl` from npm using Bun or pnpm
- Lints changed Markdown files (`.md` and `.mdx`)
- Reports issues with GitHub annotations

### Conventional Commit Check (`commit-check.yml`)

- Validates PR titles follow conventional commit format
- Creates default commitlint config if missing (requires `package.json`)
- Supports Bun or pnpm for package management

## Requirements

- Node.js 22+
- Bun (installed automatically in workflows)
  - Uses the latest version of Bun
