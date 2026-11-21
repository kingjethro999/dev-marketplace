---
name: launch-ready
title: Launch Ready
description: Pre-launch checklist that runs periderm-cli scan, verifies quality gates, checks dependencies, validates environment, and produces a launch readiness report. Runs: npm i -g periderm-cli, periderm --help, periderm --version, periderm scan, periderm review --deep. AI takes over from results to decide launch/block. Use before every production release.
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

Complete pre-launch verification that runs Periderm CLI through its full suite and produces an AI-actionable launch decision. Runs the exact commands you specified: `npm i -g periderm-cli`, `periderm --help`, `periderm --version`, `periderm scan`, `periderm review --deep`, then hands off to AI for final launch/block decision.

### When to Use

- Before every production release
- Release branch validation
- Pre-merge checks for main branch
- Automated release pipelines
- Manual launch verification

### Installation

```bash
npx dev-marketplace add launch-ready
```

### Quickstart

```bash
# Full launch readiness check
node .agents/skills/launch-ready/scripts/launch-ready.js

# With custom thresholds
node .agents/skills/launch-ready/scripts/launch-ready.js --min-launch=70 --min-reality=60

# Output JSON for CI
node .agents/skills/launch-ready/scripts/launch-ready.js --format=json

# Skip periderm install (already installed)
node .agents/skills/launch-ready/scripts/launch-ready.js --skip-install
```

### What It Runs

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `npm i -g periderm-cli` | Ensure latest Periderm |
| 2 | `periderm --help` | Verify CLI works |
| 3 | `periderm --version` | Log version for audit |
| 4 | `periderm auth status` | Check authentication |
| 5 | `periderm scan --json` | Full security/quality scan |
| 6 | `periderm review --deep --json` | Deep AI review |
| 7 | **AI Decision** | Evaluate all results, decide launch/block |

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
    "dependencyAudit": true,
    "envValidation": true,
    "buildVerification": true
  },
  "envRequired": [
    "PERIDERM_API_KEY",
    "NODE_ENV"
  ],
  "buildCommand": "npm run build",
  "testCommand": "npm test",
  "aiHandoff": true,
  "outputFormat": "text"
}
```

### Output

The skill produces:
1. **Console report** — Human-readable launch decision
2. **JSON report** — Machine-readable for CI (`launch-report.json`)
3. **AI handoff prompt** — Structured prompt for AI to make final decision
4. **Checklist** — Markdown checklist (`LAUNCH_CHECKLIST.md`)

### AI Handoff

When `aiHandoff: true` (default), the skill outputs a structured prompt:

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
- 2 high-severity issues: [details]
- 3 medium-severity issues: [details]

DECISION: BLOCK / LAUNCH / LAUNCH_WITH_CONDITIONS

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

- `scripts/launch-ready.js` — Main launcher (Node.js, zero deps)
- `config/launch-ready.json` — Default configuration
- `templates/launch-checklist.md` — Markdown checklist template