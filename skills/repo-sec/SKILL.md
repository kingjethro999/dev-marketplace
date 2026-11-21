---
name: repo-sec
title: Repository Security
description: Comprehensive repository security hardening - analyzes Git config, branch protection, secret scanning, dependency auditing, signed commits, security policies, and more. Interactive setup grills user for their threat model and applies tailored hardening. Use to lock down repository security posture.
category: Code Review & Quality
tags:
  - repo-security
  - git-security
  - branch-protection
  - secret-scanning
  - dependency-audit
  - signed-commits
  - security-policy
  - supply-chain
  - interactive-setup
files:
  - SKILL.md
  - scripts/repo-sec.js
  - templates/security-policy.md
  - templates/dependabot.yml
  - templates/codeowners
  - templates/.gitignore.security
  - config/repo-sec.json
---

## Repository Security

Comprehensive repository security hardening tool. Analyzes your repository's security posture across multiple dimensions and applies fixes. **Interactive setup grills you for your threat model and applies tailored hardening.**

### When to Use

- New repository needing security baseline
- Existing repo with unknown security posture
- Compliance requirements (SOC2, ISO27001, etc.)
- Supply chain attack prevention
- Before public release / open sourcing
- After security incident

### Installation

```bash
npx dev-marketplace add repo-sec
```

### Quickstart

```bash
# Interactive setup (RECOMMENDED) - grills you for threat model
node .agents/skills/repo-sec/scripts/repo-sec.js setup

# Run security audit only
node .agents/skills/repo-sec/scripts/repo-sec.js audit

# Apply all recommended fixes
node .agents/skills/repo-sec/scripts/repo-sec.js harden

# Check status of security controls
node .agents/skills/repo-sec/scripts/repo-sec.js status

# Generate security policy
node .agents/skills/repo-sec/scripts/repo-sec.js policy
```

### Interactive Setup

Run `setup` and answer questions about:

**Threat Model & Scope**
- What type of project? (open source, private, internal tool, compliance)
- Who has push access? (core team, many contributors, bots)
- What's the blast radius if compromised? (low, medium, high, critical)
- Any compliance requirements? (SOC2, HIPAA, PCI, GDPR, none)

**Git Configuration Hardening**
- Require signed commits? (GPG/SSH)
- Require signed tags?
- Enforce commit message format?
- Disable force push to protected branches?
- Require linear history?
- Enable `push --follow-tags`?

**Branch Protection**
- Which branches to protect? (main, release/*, etc.)
- Require PR reviews? (how many?)
- Require status checks? (which CI jobs?)
- Require up-to-date branches?
- Dismiss stale reviews on new pushes?
- Require conversation resolution?
- Lock branches from force push?

**Secret Scanning**
- Enable GitHub secret scanning?
- Enable push protection?
- Custom patterns? (API keys, internal tokens)
- Scan history for leaked secrets?
- Use Periderm CLI for deep scans?

**Dependency Security**
- Enable Dependabot alerts?
- Enable Dependabot auto-fix PRs?
- Schedule? (daily, weekly, monthly)
- Allow auto-merge for patch/minor?
- Pin dependencies to exact versions?
- Audit for malicious packages? (npm audit, OSV, Snyk)

**Supply Chain**
- Verify commit signatures on merge?
- Require SBOM generation?
- Sign releases/artifacts?
- SLSA provenance?
- Reproducible builds?

**Security Policy & Governance**
- Create SECURITY.md with vulnerability disclosure?
- Add CODEOWNERS for security-sensitive paths?
- Create CONTRIBUTING.md with security guidelines?
- Add .gitignore for secrets/artifacts?
- Enable GitHub Security Advisories?

### What It Audits

| Control | Check | Auto-Fix |
|---------|-------|----------|
| Signed commits | `git config commit.gpgSign` | `git config --global commit.gpgSign true` |
| Signed tags | `git config tag.gpgSign` | `git config --global tag.gpgSign true` |
| Force push protection | Branch protection rules | API call to GitHub/GitLab |
| PR reviews required | Branch protection rules | API call |
| Status checks required | Branch protection rules | API call |
| Secret scanning | GitHub secret scanning settings | API call |
| Push protection | GitHub secret scanning settings | API call |
| Dependabot alerts | Repository settings | API call |
| Dependabot auto-fix | dependabot.yml | Create/update file |
| Security policy | SECURITY.md exists | Create template |
| CODEOWNERS | CODEOWNERS exists | Create template |
| .gitignore secrets | .gitignore has secret patterns | Append patterns |

### Periderm Integration

If Periderm CLI is installed, repo-sec can:
- Run `periderm scan` on full history during audit
- Run `periderm review --deep` before releases
- Integrate Periderm findings into CI
- Use Periderm as pre-push hook (with commit-hook skill)

### Configuration

Create `repo-sec.json` in project root (or run `setup`):

```json
{
  "threatModel": {
    "projectType": "open-source",
    "pushAccess": "core-team",
    "blastRadius": "medium",
    "compliance": ["none"]
  },
  "gitConfig": {
    "requireSignedCommits": true,
    "requireSignedTags": true,
    "enforceConventionalCommits": true,
    "disableForcePush": true,
    "requireLinearHistory": true,
    "followTags": true
  },
  "branchProtection": {
    "protectedBranches": ["main", "release/*"],
    "requiredReviews": 2,
    "dismissStaleReviews": true,
    "requireConversationResolution": true,
    "requiredStatusChecks": ["ci/lint", "ci/test", "ci/periderm"],
    "requireUpToDateBranch": true,
    "lockBranch": true
  },
  "secretScanning": {
    "enabled": true,
    "pushProtection": true,
    "customPatterns": [],
    "scanHistory": true,
    "usePeriderm": true
  },
  "dependencies": {
    "dependabotAlerts": true,
    "dependabotAutoFix": true,
    "schedule": "weekly",
    "autoMerge": ["patch", "minor"],
    "pinVersions": false,
    "auditSources": ["npm", "osv", "snyk"]
  },
  "supplyChain": {
    "verifySignatures": true,
    "generateSBOM": true,
    "signReleases": true,
    "slsaProvenance": false,
    "reproducibleBuilds": false
  },
  "governance": {
    "securityPolicy": true,
    "codeowners": true,
    "contributingSecurity": true,
    "gitignoreSecrets": true,
    "securityAdvisories": true
  }
}
```

### Files

- `scripts/repo-sec.js` — Auditor, hardener, interactive setup
- `templates/security-policy.md` — SECURITY.md template
- `templates/dependabot.yml` — Dependabot configuration
- `templates/codeowners` — CODEOWNERS template
- `templates/.gitignore.security` — Security .gitignore patterns
- `config/repo-sec.json` — Default configuration