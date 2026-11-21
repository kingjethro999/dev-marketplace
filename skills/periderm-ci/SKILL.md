---
name: periderm-ci
title: Periderm CI Integration
description: Run Periderm CLI scans in CI/CD pipelines with configurable gates, SARIF output for GitHub Code Scanning, and failure thresholds. Wraps `periderm scan` and `periderm review` for automated quality gates. Use in GitHub Actions, GitLab CI, or any CI to block merges on security/quality issues.
category: Code Review & Quality
tags:
  - periderm-ci
  - periderm
  - ci-cd
  - quality-gates
  - code-review-quality
files:
  - SKILL.md
  - scripts/periderm-ci.js
  - templates/.github/workflows/periderm.yml
  - templates/gitlab-ci.yml
  - config/periderm-ci.json
---

## Periderm CI Integration

Run Periderm CLI scans as automated quality gates in your CI pipeline. Configurable thresholds, SARIF upload to GitHub Code Scanning, and failure modes for blocking merges.

### When to Use

- Block PR merges on critical findings
- Upload SARIF results to GitHub Security tab
- Enforce "Launch Confidence" thresholds
- Run deep AI reviews on release branches
- Track scan trends over time

### Installation

```bash
npx dev-marketplace add periderm-ci
```

### Quickstart

```bash
# Run scan with default CI config (fails on critical/high)
node .agents/skills/periderm-ci/scripts/periderm-ci.js scan

# Run deep AI review
node .agents/skills/periderm-ci/scripts/periderm-ci.js review --deep

# Check launch readiness (exits 0/1 based on thresholds)
node .agents/skills/periderm-ci/scripts/periderm-ci.js ready

# Custom thresholds
node .agents/skills/periderm-ci/scripts/periderm-ci.js scan --min-launch=50 --min-reality=40
```

### Configuration

Create `periderm-ci.json` in project root:

```json
{
  "scan": {
    "args": ["--json"],
    "failOn": ["critical", "high"],
    "minLaunchConfidence": 0,
    "minRealityScore": 0,
    "minPerceivedPerformance": 0
  },
  "review": {
    "deep": false,
    "failOn": ["critical", "high", "medium"]
  },
  "ready": {
    "minLaunchConfidence": 60,
    "minRealityScore": 50,
    "minPerceivedPerformance": 70,
    "allowWarnings": true
  },
  "sarif": {
    "enabled": true,
    "outputFile": "periderm-results.sarif",
    "category": "periderm"
  },
  "github": {
    "uploadSarif": true,
    "tokenEnv": "GITHUB_TOKEN"
  }
}
```

### CI Pipeline Examples

**GitHub Actions** (`.github/workflows/periderm.yml`):
```yaml
name: Periderm Scan
on: [pull_request, push]
jobs:
  periderm:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - run: npm i -g periderm-cli
      - run: npx dev-marketplace add periderm-ci
      - run: node .agents/skills/periderm-ci/scripts/periderm-ci.js scan --format=sarif
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: periderm-results.sarif
```

**GitLab CI** (`.gitlab-ci.yml`):
```yaml
periderm_scan:
  image: node:20
  script:
    - npm i -g periderm-cli
    - npx dev-marketplace add periderm-ci
    - node .agents/skills/periderm-ci/scripts/periderm-ci.js scan --fail-on=critical,high
  artifacts:
    reports:
      sast: periderm-results.sarif
    when: always
```

### Commands

| Command | Description |
|---------|-------------|
| `scan` | Run `periderm scan` with CI options |
| `review` | Run `periderm review --deep` |
| `ready` | Check launch readiness thresholds |
| `auth` | Handle Periderm authentication in CI |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | Findings exceed thresholds |
| 2 | Periderm CLI error |
| 3 | Configuration error |

### Periderm Auth in CI

Set `PERIDERM_API_KEY` or `PERIDERM_TOKEN` as a secret in your CI:

```bash
# GitHub Actions
env:
  PERIDERM_API_KEY: ${{ secrets.PERIDERM_API_KEY }}

# Then run
periderm auth login --token $PERIDERM_API_KEY
```

### Files

- `scripts/periderm-ci.js` — Main CI wrapper (Node.js, zero deps)
- `templates/.github/workflows/periderm.yml` — GitHub Actions template
- `templates/gitlab-ci.yml` — GitLab CI template
- `config/periderm-ci.json` — Default configuration