---
name: branch-sec
title: Branch Security
description: Enforce branch protection rules, signed commits, required reviews, status checks, and linear history via GitHub/GitLab API. Generates branch protection configs, commit message templates with security footers, and CI integration for Periderm scans on protected branches. Use to harden your Git workflow against unauthorized changes.
category: Code Review & Quality
tags:
  - branch-sec
  - branch-protection
  - git-security
  - signed-commits
  - periderm
  - code-review-quality
files:
  - SKILL.md
  - scripts/branch-sec.js
  - templates/.github/branch-protection.yml
  - templates/.gitmessage
  - config/branch-sec.json
---

## Branch Security

Harden your Git branches with protection rules, signed commit enforcement, and required Periderm scans. Configures GitHub/GitLab branch protection via API, generates commit templates with security footers, and ensures every push to protected branches passes quality gates.

### When to Use

- New repo setup — protect from day one
- Existing repo — add missing protections
- Compliance — SOC2, ISO27001 branch controls
- Team workflow — enforce review + scan requirements
- Release branches — extra protection for production

### Installation

```bash
npx dev-marketplace add branch-sec
```

### Quickstart

```bash
# Apply all branch protections (requires gh CLI auth)
node .agents/skills/branch-sec/scripts/branch-sec.js apply

# Audit current protection status
node .agents/skills/branch-sec/scripts/branch-sec.js audit

# Generate commit template with security footer
node .agents/skills/branch-sec/scripts/branch-sec.js gen-template

# Protect specific branches
node .agents/skills/branch-sec/scripts/branch-sec.js protect main release/*

# Setup Periderm required status check
node .agents/skills/branch-sec/scripts/branch-sec.js add-periderm-check
```

### What It Configures

| Protection | Description |
|------------|-------------|
| **Required Reviews** | Minimum approvals before merge |
| **Status Checks** | Periderm scan, build, tests must pass |
| **Signed Commits** | GPG/SSH signatures required |
| **Linear History** | No merge commits, rebase only |
| **Stale Review Dismissal** | New pushes dismiss old approvals |
| **Push Restrictions** | Only admins can force push |
| **Periderm Required** | Scan must pass on every PR |

### Configuration

Create `branch-sec.json` in project root:

```json
{
  "branchProtection": {
    "enabled": true,
    "branches": ["main", "release/**", "production"],
    "requireReviews": 2,
    "requireStatusChecks": ["periderm-scan", "build", "test", "lint"],
    "requireSignedCommits": true,
    "requireLinearHistory": true,
    "dismissStaleReviews": true,
    "restrictPushes": true,
    "requireConversationResolution": true
  },
  "peridermCheck": {
    "enabled": true,
    "contextName": "periderm-scan",
    "failOnCritical": true,
    "failOnHigh": true
  },
  "commitTemplate": {
    "enabled": true,
    "requireConventional": true,
    "requireSecurityFooter": true,
    "securityFooterKeys": ["Security", "CVE", "GHSA", "Periderm"]
  },
  "github": {
    "owner": "",
    "repo": ""
  }
}
```

### GitHub Branch Protection (via gh CLI)

```bash
# Authenticate first
gh auth login

# Apply protections
node .agents/skills/branch-sec/scripts/branch-sec.js apply
```

This calls GitHub API to set:
- Required PR reviews (configurable count)
- Required status checks (including periderm-scan)
- Signed commits required
- Linear history enforced
- Stale review dismissal
- Admin-only force push

### Periderm Status Check

The skill adds a GitHub Actions workflow that:
1. Runs on every PR to protected branches
2. Executes `periderm scan --json`
3. Reports as required status check `periderm-scan`
4. Blocks merge on critical/high findings
5. Posts summary to PR

### Commit Template with Security Footer

Generates `.gitmessage`:

```
# <type>(<scope>): <subject>
# Types: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert
# 
# Security Footer (required for security changes):
# Security: CVE-XXXX-XXXX / GHSA-XXXX / Periderm: scan-id
# 
# ------------------------ >8 ------------------------
```

### Files

- `scripts/branch-sec.js` — Main tool, applies protections via gh CLI
- `templates/.github/branch-protection.yml` — Protection rules reference
- `templates/.gitmessage` — Commit template with security footer
- `config/branch-sec.json` — Default configuration