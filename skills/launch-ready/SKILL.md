---
name: launch-ready
title: Launch Ready
description: Pre-launch verification that runs Periderm CLI through its full suite: npm i -g periderm-cli, periderm --help, periderm --version, periderm scan, periderm review --deep. AI analyzes all results and makes launch/block decision with remediation steps. Use before every production release.
category: Engineering & Workflow
tags:
  - launch-ready
  - periderm
  - release-checklist
  - quality-gates
  - engineering-workflow
files:
  - SKILL.md
  - scripts/launch-ready.js
  - config/launch-ready.json
  - templates/launch-checklist.md
---

## Launch Ready

Complete pre-launch verification using Periderm CLI. Runs the exact sequence you specified: `npm i -g periderm-cli`, `periderm --help`, `periderm --version`, `periderm scan`, `periderm review --deep`. Then AI takes over, analyzes all results, and gives you a clear LAUNCH / BLOCK / LAUNCH_WITH_CONDITIONS decision with specific remediation steps.

### When to Use

- Before every production release
- Release branch validation
- Pre-merge to main branch
- Manual launch verification
- Automated release pipelines

### Installation

```bash
npx dev-marketplace add launch-ready
```

### Quickstart

```bash
# Full launch readiness check
node .agents/skills/launch-ready/scripts/launch-ready.js

# Custom thresholds
node .agents/skills/launch-ready/scripts/launch-ready.js --min-launch=70 --min-reality=60

# JSON output for CI
node .agents/skills/launch-ready/scripts/launch-ready.js --format=json

# Skip periderm install (already installed globally)
node .agents/skills/launch-ready/scripts/launch-ready.js --skip-install
```

### What It Runs (Exact Sequence)

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `npm i -g periderm-cli` | Ensure latest Periderm CLI |
| 2 | `periderm --help` | Verify CLI responsive |
| 3 | `periderm --version` | Log version for audit trail |
| 4 | `periderm auth status` | Check authentication |
| 5 | `periderm scan --json` | Full security/quality scan |
| 6 | `periderm review --deep --json` | Deep AI review |
| 7 | **AI Decision** | Analyze all results, decide LAUNCH/BLOCK |

### Configuration

Create `launch-ready.json` in project root:

```json
{
  "thresholds": {
    "minLaunchConfidence": 60,
    "minRealityScore": 50,
    "minPerceivedPerformance": 70,
    "maxCriticalFindings": 0,
    "maxHighFindings": 0,
    "maxMediumFindings": 5
  },
  "checks": {
    "peridermInstall": true,
    "peridermScan": true,
    "peridermReview": true,
    "buildVerification": true,
    "testSuite": true
  },
  "buildCommand": "npm run build",
  "testCommand": "npm test",
  "aiHandoff": true,
  "outputFormat": "text"
}
```

### Output

Produces three artifacts:

1. **Console report** — Human-readable with colored output
2. **JSON report** — `launch-report.json` for CI/CD
3. **Checklist** — `LAUNCH_CHECKLIST.md` for sign-off

### AI Handoff Decision

When `aiHandoff: true` (default), outputs structured prompt:

```
## LAUNCH DECISION REQUIRED

Periderm Results:
- Launch Confidence: 72/100 (threshold: 60) ✓
- Reality Score: 58/100 (threshold: 50) ✓
- Perceived Performance: 85/100 (threshold: 70) ✓
- Critical Findings: 0 (max: 0) ✓
- High Findings: 2 (max: 0) ✗
- Medium Findings: 3 (max: 5) ✓

Review Summary:
- 2 high-severity issues: [details from periderm review]

DECISION: BLOCK

If BLOCK: List blocking issues and remediation steps.
If LAUNCH_WITH_CONDITIONS: List conditions and monitoring plan.
```

### CI Integration

```yaml
# .github/workflows/launch-ready.yml
name: Launch Ready
on:
  workflow_dispatch:
  push:
    branches: [release/**]
jobs:
  launch-ready:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - run: npm i -g periderm-cli
      - run: npx dev-marketplace add launch-ready
      - run: node .agents/skills/launch-ready/scripts/launch-ready.js --format=json
      - uses: actions/upload-artifact@v4
        with:
          name: launch-report
          path: launch-report.json
```

### Files

- `scripts/launch-ready.js` — Runs periderm-cli sequence, AI decides launch/block
- `config/launch-ready.json` — Default configuration
- `templates/launch-checklist.md` — Sign-off checklist template