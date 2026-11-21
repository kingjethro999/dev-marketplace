---
name: ci-cd
title: CI/CD Pipeline Analyzer & Generator
description: Analyze existing CI/CD pipelines, generate new ones, or explain workflows. Supports GitHub Actions, GitLab CI, CircleCI, Azure Pipelines, and more. Interactive mode grills user: create new, edit existing, or understand a specific workflow. Generates production-ready configs with caching, matrix testing, security scanning, and deployment.
category: Engineering & Workflow
tags:
  - ci-cd
  - github-actions
  - gitlab-ci
  - circleci
  - azure-pipelines
  - pipeline-generation
  - workflow-analysis
  - interactive-setup
  - devops
files:
  - SKILL.md
  - scripts/ci-cd.js
  - templates/github-actions/
  - templates/gitlab-ci/
  - templates/circleci/
  - config/ci-cd.json
---

## CI/CD Pipeline Analyzer & Generator

Analyze, generate, or understand CI/CD pipelines. **Interactive mode grills you: create new, edit existing, or understand a specific workflow.** Supports GitHub Actions, GitLab CI, CircleCI, Azure Pipelines, and more.

### When to Use

- New project needing CI/CD from scratch
- Existing pipeline needs improvement/fixes
- Want to understand what a workflow does
- Migrating between CI providers
- Adding security scanning, matrix testing, caching
- Setting up deployment pipelines

### Installation

```bash
npx dev-marketplace add ci-cd
```

### Quickstart

```bash
# Interactive setup (RECOMMENDED) - grills you for what you need
node .agents/skills/ci-cd/scripts/ci-cd.js setup

# Analyze existing pipeline
node .agents/skills/ci-cd/scripts/ci-cd.js analyze

# Generate new pipeline
node .agents/skills/ci-cd/scripts/ci-cd.js generate

# Explain a specific workflow file
node .agents/skills/ci-cd/scripts/ci-cd.js explain .github/workflows/ci.yml

# Validate pipeline syntax
node .agents/skills/ci-cd/scripts/ci-cd.js validate .github/workflows/ci.yml
```

### Interactive Setup

Run `setup` and answer questions about:

**Mode Selection**

- What do you want to do?
  - **Create New**: Generate a complete pipeline from scratch
  - **Edit Existing**: Modify an existing workflow file
  - **Understand**: Explain what a workflow does in plain English

**Project Detection**

- Auto-detects: Node.js, Python, Go, Rust, Java, .NET, Docker, etc.
- Reads package.json, requirements.txt, Cargo.toml, go.mod, pom.xml, etc.
- Detects existing CI configs

**Create New Pipeline**

- CI Provider: GitHub Actions, GitLab CI, CircleCI, Azure Pipelines
- Pipeline Type: CI only, CI + CD, Monorepo, Multi-environment
- Triggers: push, PR, schedule, manual, tags, releases
- Jobs: lint, typecheck, test (unit/integration/e2e), build, security scan, deploy
- Caching: npm, pip, cargo, go, maven, gradle, docker layers
- Matrix: OS (ubuntu, macos, windows), Node/Python/Go versions
- Security: Periderm scan, dependency audit, SAST, container scan
- Deployment: environments, approvals, rollback, blue-green, canary
- Notifications: Slack, Discord, email, webhook

**Edit Existing Pipeline**

- Select workflow file to edit
- What to change: add job, modify steps, change triggers, update versions, fix bug
- Shows diff before applying

**Understand Workflow**

- Select workflow file
- Outputs: plain English explanation, Mermaid diagram, key insights, potential issues

### What It Generates

**GitHub Actions** (`.github/workflows/*.yml`):

- Optimized caching with `actions/cache`
- Matrix strategies for parallel testing
- Conditional job execution
- Reusable workflows
- Environment protection rules
- OIDC for cloud deployments
- SARIF upload for code scanning

**GitLab CI** (`.gitlab-ci.yml`):

- Cache and artifacts configuration
- Rules for conditional execution
- Child pipelines for monorepos
- DAG dependencies
- Protected environments

**CircleCI** (`.circleci/config.yml`):

- Orbs for common tasks
- Workspaces for data persistence
- Resource classes
- Contexts for secrets

### Configuration

Create `ci-cd.json` in project root (or run `setup`):

```json
{
  "provider": "github-actions",
  "projectType": "node",
  "mode": "create",
  "pipeline": {
    "name": "CI/CD",
    "triggers": {
      "push": ["main", "develop"],
      "pullRequest": ["main"],
      "schedule": "0 2 * * 1",
      "tags": true,
      "manual": true
    },
    "jobs": {
      "lint": true,
      "typecheck": true,
      "test": {
        "unit": true,
        "integration": true,
        "e2e": false
      },
      "build": true,
      "security": {
        "periderm": true,
        "dependencyAudit": true,
        "sast": false,
        "containerScan": false
      },
      "deploy": {
        "enabled": false,
        "environments": ["staging", "production"],
        "approvalRequired": ["production"],
        "strategy": "rolling"
      }
    },
    "matrix": {
      "os": ["ubuntu-latest"],
      "node": ["20", "22"],
      "python": [],
      "go": [],
      "rust": []
    },
    "caching": {
      "npm": true,
      "pip": false,
      "cargo": false,
      "go": false,
      "maven": false,
      "gradle": false,
      "docker": true
    },
    "notifications": {
      "slack": false,
      "discord": false,
      "email": false,
      "webhook": ""
    }
  }
}
```

### Files

- `scripts/ci-cd.js` — Analyzer, generator, interactive setup, explainer
- `templates/github-actions/` — GitHub Actions workflow templates
- `templates/gitlab-ci/` — GitLab CI templates
- `templates/circleci/` — CircleCI templates
- `config/ci-cd.json` — Default configuration
