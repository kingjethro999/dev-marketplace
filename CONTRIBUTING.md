# Contributing to Dev Marketplace

Thank you for your interest in contributing to Dev Marketplace! This project is a community-driven marketplace for AI agent skills, LSP connectors, design engines, and video synthesis toolkits.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Types of Contributions](#types-of-contributions)
- [Skill Development Guidelines](#skill-development-guidelines)
- [Submitting Changes](#submitting-changes)
- [Review Process](#review-process)
- [Community](#community)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@dev-marketplace.org.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- A GitHub account

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/dev-marketplace.git
cd dev-marketplace

# Install dependencies
npm install

# Run the CLI to verify setup
npx dev-marketplace list
```

---

## Types of Contributions

### 1. New Skills

Add new AI agent skills following the [Skill Development Guidelines](#skill-development-guidelines).

### 2. Skill Improvements

- Bug fixes for existing skills
- Enhanced documentation
- Additional templates or configurations
- Performance improvements

### 3. Translations

Add or improve README translations in new languages.

### 4. Infrastructure

- CLI improvements
- Registry updates
- CI/CD enhancements
- Testing infrastructure

### 5. Documentation

- README improvements
- Usage examples
- Tutorial content
- API documentation

---

## Skill Development Guidelines

### Skill Structure

Each skill must follow the standard structure:

```
skills/your-skill-name/
├── SKILL.md          # Required: Skill manifest with frontmatter
├── scripts/          # Optional: Executable scripts
├── templates/        # Optional: Template files
├── config/           # Optional: Default configuration
└── tests/            # Optional: Test files
```

### SKILL.md Frontmatter (Required)

```yaml
---
name: your-skill-name
title: Your Skill Title
description: One-sentence description for search/catalog
category: Category Name
tags:
  - tag1
  - tag2
  - tag3
files:
  - SKILL.md
  - scripts/your-script.js
  - templates/template-file
  - config/default.json
---
```

### Categories

Choose from existing categories or propose a new one:

- **Code Review & Quality**
- **Connectors & LSP**
- **Design & UI**
- **Developer Tools & AI**
- **Engineering & Workflow**
- **Video & Motion**

### Content Guidelines

1. **Clear Purpose**: State what the skill does and when to use it
2. **Installation Instructions**: Provide exact install commands
3. **Quickstart**: Minimal working example
4. **Configuration**: Document all options with defaults
5. **Examples**: Real-world usage examples
6. **File List**: Document all included files

### Script Requirements

- Use Node.js (no external runtime dependencies)
- Include proper error handling
- Support `--help` flag
- Use structured logging (success, warn, error, info)
- Exit with appropriate codes (0 for success, non-zero for failure)

### Template Files

- Use `.template` extension or place in `templates/` directory
- Include placeholder variables with clear documentation
- Support multiple output formats where applicable

### Testing

- Include test cases for scripts
- Test installation/uninstallation flows
- Verify cross-platform compatibility (Linux, macOS, Windows)
- Test with different project types (Node, Python, Go, Rust, etc.)

---

## Submitting Changes

### Branch Naming

```
feat/skill-name          # New skill
fix/skill-name-issue     # Bug fix
docs/skill-name-update   # Documentation
chore/skill-name-refactor # Refactoring
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(skill-name): add interactive setup wizard
fix(commit-hook): handle missing periderm-cli gracefully
docs(repo-sec): update threat model documentation
chore(ci-cd): refactor matrix generation logic
```

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the guidelines above
3. **Test your changes** thoroughly
4. **Run linting**: `npm run lint` (if available)
5. **Update documentation** if needed
6. **Submit PR** with:
   - Clear title and description
   - Link to any related issues
   - Screenshots/examples for UI changes
   - Test results

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New skill
- [ ] Bug fix
- [ ] Documentation update
- [ ] Feature enhancement
- [ ] Translation

## Testing
- [ ] Tested locally
- [ ] All existing tests pass
- [ ] New tests added (if applicable)

## Checklist
- [ ] SKILL.md frontmatter is complete
- [ ] Installation commands work
- [ ] Documentation is clear
- [ ] No breaking changes (or documented)
```

---

## Review Process

### Automated Checks

All PRs must pass:
- Linting (ESLint, Prettier)
- Type checking (TypeScript)
- Unit tests
- Integration tests (where applicable)

### Manual Review

Maintainers will review:
- Skill quality and completeness
- Documentation clarity
- Code style and best practices
- Security considerations
- Compatibility with existing skills

### Approval Requirements

- At least 1 maintainer approval
- All CI checks passing
- No unresolved review comments

---

## Community

### Getting Help

- **GitHub Discussions**: Ask questions, share ideas
- **GitHub Issues**: Report bugs, request features
- **Discord**: Real-time chat (link in repo description)

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

### Maintainer Guidelines

Maintainers should:
- Respond to PRs within 48 hours
- Provide constructive feedback
- Merge approved PRs promptly
- Update registry.json after merges

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License (see [LICENSE](LICENSE)).

---

## Questions?

Open a GitHub Discussion or issue. We're here to help!