---
name: commit-hook
title: Commit Hook
description: Install Git hooks that run Periderm CLI scans, tests, linting, and custom commands before commit/push. Enforces conventional commits with security footers. Runs: periderm scan on staged files, periderm review --deep on push. AI analyzes results and blocks on critical findings. Interactive setup grills user for preferences. Use to prevent broken/insecure code from entering history.
category: Engineering & Workflow
tags:
  - commit-hook
  - git-hooks
  - pre-commit
  - pre-push
  - periderm
  - quality-gates
  - engineering-workflow
  - interactive-setup
files:
  - SKILL.md
  - scripts/commit-hook.js
  - templates/pre-commit
  - templates/pre-push
  - templates/commit-msg
  - config/commit-hook.json
---

## Commit Hook

Git hooks powered by Periderm CLI. Runs security scans on staged changes before commit, full scans before push, and validates commit messages. Integrates with Periderm for automated quality gates. **Interactive setup grills you for preferences.**

### When to Use

- Local quality gates matching CI
- Prevent secrets in commits
- Enforce conventional commits + security footers
- Run Periderm on every push
- Block pushes with critical findings
- Want interactive configuration

### Installation

```bash
npx dev-marketplace add commit-hook
```

### Quickstart

```bash
# Interactive setup (RECOMMENDED) - grills you for preferences
node .agents/skills/commit-hook/scripts/commit-hook.js setup

# Install hooks with current config
node .agents/skills/commit-hook/scripts/commit-hook.js install

# Uninstall hooks
node .agents/skills/commit-hook/scripts/commit-hook.js uninstall

# Test pre-commit manually
node .agents/skills/commit-hook/scripts/commit-hook.js test-pre-commit

# Test pre-push manually
node .agents/skills/commit-hook/scripts/commit-hook.js test-pre-push

# Show status
node .agents/skills/commit-hook/scripts/commit-hook.js status
```

### Interactive Setup

Run `setup` and answer questions about:

**Pre-commit (runs on every git commit)**
- Enable pre-commit hook?
- Run Periderm scan on staged files?
- Fail on which severity levels? (critical, high, medium, low)
- Run lint? (detected from package.json)
- Run typecheck? (detected from package.json)
- Which tests? (unit, integration, all - detected from package.json)

**Pre-push (runs on every git push)**
- Enable pre-push hook?
- Run full Periderm scan?
- Run Periderm deep review (--deep)?
- Fail on which severity levels?
- Run build? (detected from package.json)
- Which tests? (unit, integration, all)

**Commit Message (validates every commit message)**
- Enable commit-msg validation?
- Enforce conventional commit format?
- Require security footer for security-related commits?
- Security footer keys (comma-separated)
- Max subject line length

Configuration saved to `commit-hook.json` in project root.

### What It Installs

| Hook | Runs | Purpose |
|------|------|---------|
| `pre-commit` | `periderm scan --staged`, lint, typecheck, unit tests | Catch issues before commit |
| `pre-push` | `periderm scan`, `periderm review --deep`, full test suite, build | Gate pushes to remote |
| `commit-msg` | Conventional format + security footer | Enforce commit standards |

### Periderm Integration

**pre-commit** runs `periderm scan --staged --json` on only staged files (fast).
**pre-push** runs full `periderm scan --json` + `periderm review --deep --json`.

Both hooks:
- Parse JSON output
- Block on critical/high findings (configurable)
- Show colored summary
- Allow `--no-verify` bypass

### Configuration

Create `commit-hook.json` in project root (or run `setup`):

```json
{
  "preCommit": {
    "enabled": true,
    "peridermScan": true,
    "peridermArgs": ["--staged", "--json"],
    "failOn": ["critical", "high"],
    "lint": true,
    "typecheck": true,
    "tests": ["unit"],
    "timeout": 60000
  },
  "prePush": {
    "enabled": true,
    "peridermScan": true,
    "peridermReview": true,
    "peridermArgs": ["--json"],
    "failOn": ["critical", "high"],
    "tests": ["all"],
    "build": true,
    "timeout": 300000
  },
  "commitMsg": {
    "enabled": true,
    "requireConventional": true,
    "requireSecurityFooter": true,
    "securityFooterKeys": ["Security", "CVE", "GHSA", "Periderm"],
    "maxLength": 72
  }
}
```

### Security Footer

Commits with security changes must include footer:

```
feat(auth): add rate limiting

Security: CVE-2024-XXXX / Periderm: scan-abc123
```

### Skip Hooks (Emergency)

```bash
# Skip pre-commit
git commit --no-verify -m "fix: hotfix"

# Skip pre-push
git push --no-verify
```

### Files

- `scripts/commit-hook.js` — Installer, interactive setup, test runner
- `templates/pre-commit` — Pre-commit hook template
- `templates/pre-push` — Pre-push hook template
- `templates/commit-msg` — Commit message validator
- `config/commit-hook.json` — Default configuration