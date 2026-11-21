---
name: commit-hook
title: Commit Hook
description: Install and manage Git commit hooks that run tests, linting, type-checking, and custom commands before every commit. Prevents broken code from entering history. Use when you want to enforce quality gates locally, customize pre-commit/pre-push behavior, or automate checks that CI runs.
category: Engineering & Workflow
tags:
  - commit-hook
  - git-hooks
  - pre-commit
  - quality-gates
  - engineering-workflow
files:
  - SKILL.md
  - scripts/install-hooks.sh
  - scripts/run-checks.js
  - templates/.huskyrc
  - templates/pre-commit
  - templates/pre-push
  - templates/commit-msg
---

## Commit Hook Skill

Automatically install and configure Git hooks that run your test suite, linter, type-checker, and any custom commands before commits or pushes. Keeps broken code out of history without waiting for CI.

### When to Use

- You want local quality gates that match CI
- You need custom pre-commit/pre-push logic (e.g., run only affected tests)
- You want to enforce commit message conventions
- You're tired of "fix CI" commits after pushing

### Installation

```bash
npx dev-marketplace add commit-hook
```

This copies the hook templates to your project and runs the installer.

### Quickstart

```bash
# After installing, run the installer in your project root:
./.agents/skills/commit-hook/scripts/install-hooks.sh

# Or with bun/node directly:
node .agents/skills/commit-hook/scripts/install-hooks.js
```

### What Gets Installed

| Hook | Runs |
|------|------|
| `pre-commit` | Lint, typecheck, format check, unit tests (fast) |
| `pre-push` | Full test suite, build verification |
| `commit-msg` | Conventional commits format validation |

### Configuration

Create a `.hookrc.json` in your project root to customize:

```json
{
  "preCommit": {
    "commands": [
      "npm run lint",
      "npm run typecheck",
      "npm run test:unit -- --passWithNoTests"
    ],
    "timeout": 60000,
    "skipOnNoChanges": true
  },
  "prePush": {
    "commands": [
      "npm run test",
      "npm run build"
    ],
    "timeout": 180000
  },
  "commitMsg": {
    "pattern": "^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\\!.*)?: .+",
    "maxLength": 72
  }
}
```

### Custom Commands

Add project-specific checks by extending the config:

```json
{
  "preCommit": {
    "commands": [
      "npm run lint",
      "npm run typecheck",
      "node scripts/check-secrets.js",
      "node scripts/verify-exports.js"
    ]
  }
}
```

### Skip Hooks (Emergency)

```bash
# Skip pre-commit
git commit --no-verify -m "fix: hotfix"

# Skip pre-push
git push --no-verify
```

### Uninstall

```bash
./.agents/skills/commit-hook/scripts/uninstall-hooks.sh
```

### Files

- `scripts/install-hooks.js` — Main installer (Node.js, zero deps)
- `scripts/uninstall-hooks.js` — Clean removal
- `scripts/run-checks.js` — Runs configured commands with timeout, parallel execution, and colored output
- `templates/.huskyrc` — Husky-compatible config template
- `templates/pre-commit` — Pre-commit hook template
- `templates/pre-push` — Pre-push hook template
- `templates/commit-msg` — Commit message validation template