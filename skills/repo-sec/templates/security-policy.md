# Security Policy

## Supported Versions

| Version  | Supported          |
| -------- | ------------------ |
| Latest   | :white_check_mark: |
| Previous | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report via:

1. **Email**: security@example.com (replace with actual contact)
2. **GitHub Security Advisories**: Use the "Report a vulnerability" tab in the Security section of this repository
3. **Encrypted**: PGP key available at [keys.example.com](https://keys.example.com)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any known mitigations
- Your contact information

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 30 days
  - Medium: Within 90 days
  - Low: Next release cycle

### Disclosure Policy

- We follow coordinated disclosure
- We will credit you in the advisory (unless you prefer anonymity)
- We request you not disclose publicly until we've released a fix
- If we don't respond within 90 days, you may disclose publicly

## Security Best Practices for Contributors

- All commits must be signed (GPG/SSH)
- Conventional commit format required
- Security-related changes must include Security footer
- Run `periderm scan` before pushing
- Dependencies audited regularly via `npm audit` / OSV / Snyk
- Branch protection enforced on main and release branches

## Security Tooling

This repository uses:

- **Periderm CLI** for secret scanning and deep review
- **npm audit** / **OSV** / **Snyk** for vulnerability scanning
- **Signed commits and tags** required
- **SBOM generation** for releases

## Contact

Security team: security@example.com
PGP Key: [keys.example.com](https://keys.example.com)
