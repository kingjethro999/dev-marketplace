---
name: leak-spots
title: Leak Spots
description: Detect leaked secrets, API keys, tokens, and credentials in your Git history using Periderm CLI. Scans all commits (not just working tree) to find secrets that were ever committed. Runs: periderm scan --json, periderm review --deep. AI analyzes results and provides remediation steps. Use before releases, during audits, or as pre-push hook.
category: Code Review & Quality
tags:
  - leak-spots
  - secret-scanning
  - periderm
  - security
  - credentials
  - code-review-quality
files:
  - SKILL.md
  - scripts/leak-spots.js
  - config/leak-spots.json
---

## Leak Spots

Find secrets leaked anywhere in your Git history using Periderm CLI. Unlike basic grep tools, this scans **every commit** to catch secrets that were added then removed. Runs `periderm scan` and `periderm review --deep`, then AI analyzes findings and gives you exact remediation steps.

### When to Use

- Before any release — catch secrets in history
- Pre-push hook — prevent new leaks
- Security audit — full history scan
- Incident response — find scope of leak
- Compliance — prove clean history

### Installation

```bash
npx dev-marketplace add leak-spots
```

### Quickstart

```bash
# Full history scan (recommended)
node .agents/skills/leak-spots/scripts/leak-spots.js scan

# Working tree only (faster, misses history)
node .agents/skills/leak-spots/scripts/leak-spots.js scan --working-tree

# Specific branch range
node .agents/skills/leak-spots/scripts/leak-spots.js scan --since=main --until=HEAD

# JSON output for CI
node .agents/skills/leak-spots/scripts/leak-spots.js scan --format=json

# Fail CI if leaks found
node .agents/skills/leak-spots/scripts/leak-spots.js scan --fail-on-leak
```

### What It Runs

| Step | Command                         | Purpose                                 |
| ---- | ------------------------------- | --------------------------------------- |
| 1    | `periderm scan --json`          | Full secret scan with structured output |
| 2    | `periderm review --deep --json` | Deep AI analysis of findings            |
| 3    | **AI Analysis**                 | Classify, prioritize, give remediation  |

### Configuration

Create `leak-spots.json` in project root:

```json
{
  "scan": {
    "args": ["--json"],
    "failOn": ["critical", "high"],
    "entropyThreshold": 4.5
  },
  "review": {
    "deep": true
  },
  "allowList": ["EXAMPLE_KEY", "test-key-123", "placeholder", "dummy"],
  "ignorePaths": [
    "*.lock",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "dist/",
    "build/",
    "node_modules/",
    ".git/"
  ],
  "outputFormat": "text"
}
```

### What Periderm Detects

Periderm CLI detects 100+ secret types including:

- **Cloud**: AWS keys, GCP service accounts, Azure tokens, DigitalOcean
- **Databases**: MongoDB, PostgreSQL, MySQL, Redis, Elasticsearch URLs
- **API Keys**: GitHub, GitLab, npm, PyPI, Docker Hub, Stripe, Twilio, SendGrid
- **Auth**: JWTs, OAuth tokens, Bearer tokens, Basic auth headers
- **Keys**: SSH private keys, PGP keys, TLS certs, RSA/DSA/EC keys
- **Config**: .env files, config with passwords, Kubernetes secrets

### Remediation

If leaks found, the AI provides:

1. **Rotate** compromised credentials immediately
2. **Rewrite history** to remove (git filter-repo / BFG Repo-Cleaner)
3. **Force push** cleaned history
4. **Re-scan** to verify

```bash
# Remove file from all history
git filter-repo --path secrets.txt --invert-paths
git push --force
```

### Pre-push Hook

Add to `.hookrc.json`:

```json
{
  "prePush": {
    "commands": [
      "node .agents/skills/leak-spots/scripts/leak-spots.js scan --working-tree --fail-on-leak"
    ]
  }
}
```

### Files

- `scripts/leak-spots.js` — Runs periderm-cli scan + review, AI analyzes results
- `config/leak-spots.json` — Default configuration
