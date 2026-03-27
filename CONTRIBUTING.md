# Contributing

## Requirements

- Node.js 22+
- Bun

## Local Validation

- Install dependencies:
  - `bun i`
- Update action/workflow YAML as needed.
- Verify references with:
  - `bun run verify:action-paths`
- Test from a consumer repository by pinning to your latest commit SHA:
  - use action/workflow refs as `@<your-latest-commit-sha>`
  - for checkout-based flow, pass the same SHA to `base/checkout`:
    - `ref: <your-latest-commit-sha>`

## Documentation

- Keep `README.md` focused on usage.
- Put contributor and maintenance guidance in this file.
- Update `ACTIONS.md` whenever action paths, inputs, or behavior change.
