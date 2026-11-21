---
name: cyber-sec
title: Cyber Security
description: Cybersecurity skillset for threat modeling, attack surface analysis, penetration testing guidance, secure code review, and incident response. Includes OWASP Top 10 checks, STRIDE threat modeling, security headers validation, crypto audit, and integration with Periderm CLI for automated vulnerability scanning. Use for security assessments, pre-release audits, and continuous security monitoring.
category: Code Review & Quality
tags:
  - cyber-sec
  - cybersecurity
  - threat-modeling
  - penetration-testing
  - owasp
  - periderm
  - code-review-quality
files:
  - SKILL.md
  - scripts/cyber-sec.js
  - templates/threat-model.md
  - templates/security-headers.json
  - templates/incident-response.md
  - config/cyber-sec.json
---

## Cyber Security

Comprehensive cybersecurity toolkit for developers. Performs threat modeling (STRIDE), OWASP Top 10 validation, security headers audit, cryptographic review, and integrates with Periderm CLI for automated vulnerability scanning. Provides actionable remediation for each finding.

### When to Use

- Pre-release security audit
- Threat modeling for new features
- Secure code review checklist
- Incident response preparation
- Compliance (OWASP, NIST, ISO27001)
- Continuous security monitoring

### Installation

```bash
npx dev-marketplace add cyber-sec
```

### Quickstart

```bash
# Full security assessment
node .agents/skills/cyber-sec/scripts/cyber-sec.js assess

# Threat modeling for a feature
node .agents/skills/cyber-sec/scripts/cyber-sec.js threat-model --feature="user-auth"

# OWASP Top 10 check
node .agents/skills/cyber-sec/scripts/cyber-sec.js owasp

# Security headers audit
node .agents/skills/cyber-sec/scripts/cyber-sec.js headers

# Crypto audit
node .agents/skills/cyber-sec/scripts/cyber-sec.js crypto

# Generate incident response plan
node .agents/skills/cyber-sec/scripts/cyber-sec.js incident-plan
```

### What It Runs

| Check | Tool | Description |
|-------|------|-------------|
| **Periderm Scan** | `periderm scan` | Secrets, vulnerabilities, quality |
| **Periderm Review** | `periderm review --deep` | Deep AI security analysis |
| **OWASP Top 10** | Custom rules | A01-A10 validation |
| **Security Headers** | Header analysis | CSP, HSTS, X-Frame-Options, etc. |
| **Crypto Audit** | Pattern matching | Weak algorithms, hardcoded keys |
| **Dependency Audit** | `npm audit` / `pip audit` | Known vulnerabilities |

### STRIDE Threat Modeling

Generates threat model for each feature:

| Threat | Description | Mitigation |
|--------|-------------|------------|
| **Spoofing** | Fake identity | AuthN, MFA, cert pinning |
| **Tampering** | Data modification | Integrity checks, signatures |
| **Repudiation** | Deny actions | Audit logs, non-repudiation |
| **Info Disclosure** | Data leakage | Encryption, access control |
| **DoS** | Service disruption | Rate limiting, circuit breakers |
| **Elevation** | Privilege escalation | Least privilege, RBAC |

### Configuration

Create `cyber-sec.json` in project root:

```json
{
  "periderm": {
    "enabled": true,
    "scanArgs": ["--json"],
    "reviewDeep": true
  },
  "owasp": {
    "enabled": true,
    "categories": ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10"]
  },
  "headers": {
    "enabled": true,
    "required": {
      "Content-Security-Policy": true,
      "Strict-Transport-Security": true,
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": true
    }
  },
  "crypto": {
    "enabled": true,
    "forbidWeak": ["md5", "sha1", "des", "3des", "rc4", "ecb"],
    "minKeySize": { "rsa": 2048, "ec": 256 }
  },
  "threatModel": {
    "enabled": true,
    "methodology": "STRIDE"
  }
}
```

### Output

- **Console report** — Colored findings with severity
- **JSON report** — `cyber-sec-report.json` for CI
- **Threat model** — `THREAT_MODEL.md` per feature
- **Incident plan** — `INCIDENT_RESPONSE.md`

### CI Integration

```yaml
# .github/workflows/cyber-sec.yml
name: Cyber Security Assessment
on: [push, pull_request, schedule]
jobs:
  assess:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm i -g periderm-cli
      - run: npx dev-marketplace add cyber-sec
      - run: node .agents/skills/cyber-sec/scripts/cyber-sec.js assess --format=json
      - uses: actions/upload-artifact@v4
        with:
          name: cyber-sec-report
          path: cyber-sec-report.json
```

### Files

- `scripts/cyber-sec.js` — Main assessment runner
- `templates/threat-model.md` — STRIDE threat model template
- `templates/security-headers.json` — Required headers config
- `templates/incident-response.md` — Incident response plan template
- `config/cyber-sec.json` — Default configuration