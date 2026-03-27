# GitHub Actions

Shared checks for Holdex repositories.

## Action Structure

See [ACTIONS.md](ACTIONS.md) for detailed action structure and behavior.

## Versioning

- Use a full commit SHA for `uses:` and checkout refs in examples.
- Replace `<commit-sha>` below with the exact commit you want to consume.

## Usage

### Option 1 (Primary): Direct Composition with Checkout + Local Paths

This is the primary pattern. First checkout this repository into
`.holdex-actions`, then call actions from that checked-out path.

```yaml
name: PR Checks

on:
  pull_request:
    types: [opened, reopened, synchronize, ready_for_review]

jobs:
  checks:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: holdex/github-actions/.github/actions/base/checkout@<commit-sha>
        with:
          ref: <commit-sha>

      - uses: ./.holdex-actions/.github/actions/base/setup-runtime
        with:
          package-manager: pnpm

      - uses: ./.holdex-actions/.github/actions/composed/pr-checks
        with:
          run-prettier: true
          run-markdown: false
          run-commits: true
          package-manager: pnpm

      - name: Run project checks
        run: |
          pnpm install --frozen-lockfile
          pnpm lint
          pnpm check
```

### Option 2: Direct Granular Actions

Use base actions directly when you need full control in one job.

```yaml
name: Checks

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: holdex/github-actions/.github/actions/base/checkout@<commit-sha>
        with:
          ref: <commit-sha>

      - uses: ./.holdex-actions/.github/actions/base/setup-runtime
        with:
          package-manager: pnpm

      - uses: ./.holdex-actions/.github/actions/base/prettier
        with:
          package-manager: pnpm

      - uses: ./.holdex-actions/.github/actions/base/commit-check
        with:
          package-manager: pnpm
```

### Option 3: Reusable Workflows

Use reusable workflows when you prefer a stable job-level interface.

```yaml
name: PR Checks

on:
  pull_request:
    types: [opened, reopened, synchronize, ready_for_review]

jobs:
  checks:
    uses: holdex/github-actions/.github/workflows/pr-checks.yml@<commit-sha>
```

Selective checks:

```yaml
jobs:
  checks:
    uses: holdex/github-actions/.github/workflows/pr-checks.yml@<commit-sha>
    with:
      run-prettier: true
      run-markdown: false
      run-commits: true
      package-manager: bun
```

## Inputs and Behavior Reference

See [ACTIONS.md](ACTIONS.md) for workflow inputs and detailed behavior of each action.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and testing flow.
