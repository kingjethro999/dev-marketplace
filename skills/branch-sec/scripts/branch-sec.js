#!/usr/bin/env node

/**
 * Branch Security - Configure GitHub branch protection
 * Uses gh CLI to apply protection rules, requires Periderm status checks,
 * and supports --dry-run and --json inspection.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

let JSON_MODE = false;

function log(msg, color = "reset") {
  if (JSON_MODE) return;
  console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function error(msg) {
  console.error(`${COLORS.red}✖ ${msg}${COLORS.reset}`);
}

function success(msg) {
  if (JSON_MODE) return;
  console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`);
}

function warn(msg) {
  if (JSON_MODE) return;
  console.log(`${COLORS.yellow}⚠ ${msg}${COLORS.reset}`);
}

function info(msg) {
  if (JSON_MODE) return;
  console.log(`${COLORS.blue}ℹ ${msg}${COLORS.reset}`);
}

function section(title) {
  log(`\n${COLORS.bold}${COLORS.cyan}═══ ${title} ═══${COLORS.reset}\n`);
}

function loadConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, "branch-sec.json");
  const defaults = {
    branchProtection: {
      enabled: true,
      branches: ["main", "release/**", "production"],
      requireReviews: 2,
      requireStatusChecks: ["periderm-scan", "build", "test", "lint"],
      requireSignedCommits: true,
      requireLinearHistory: true,
      dismissStaleReviews: true,
      restrictPushes: true,
      requireConversationResolution: true,
    },
    peridermCheck: {
      enabled: true,
      contextName: "periderm-scan",
      failOnCritical: true,
      failOnHigh: true,
    },
    commitTemplate: {
      enabled: true,
      requireConventional: true,
      requireSecurityFooter: true,
      securityFooterKeys: ["Security", "CVE", "GHSA", "Periderm"],
    },
    github: { owner: "", repo: "" },
  };

  if (!fs.existsSync(configPath)) return defaults;

  try {
    return deepMerge(defaults, JSON.parse(fs.readFileSync(configPath, "utf8")));
  } catch (e) {
    warn(`Failed to parse branch-sec.json: ${e.message}. Using defaults.`);
    return defaults;
  }
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function isWildcardBranch(branch) {
  return /[*?\[]/.test(String(branch || ""));
}

function checkGhCli() {
  const r = spawnSync("gh", ["--version"], { encoding: "utf8" });
  return r.status === 0;
}

function getRepo() {
  const r = spawnSync("gh", ["repo", "view", "--json", "nameWithOwner"], {
    encoding: "utf8",
  });
  if (r.status !== 0) return null;
  try {
    return JSON.parse(r.stdout).nameWithOwner;
  } catch {
    return null;
  }
}

function checkGitConfig(key) {
  const r = spawnSync("git", ["config", "--get", key], { encoding: "utf8" });
  return r.status === 0 && r.stdout.trim() !== "";
}

function checkStatusCheck(context) {
  const workflowPath = ".github/workflows/periderm-pr.yml";
  if (!fs.existsSync(workflowPath)) return false;
  const content = fs.readFileSync(workflowPath, "utf8");
  return content.includes(context);
}

function buildProtectionPayload(config) {
  const bp = config.branchProtection;
  return {
    required_status_checks: {
      strict: true,
      contexts: bp.requireStatusChecks,
    },
    enforce_admins: bp.restrictPushes,
    required_pull_request_reviews: {
      required_approving_review_count: bp.requireReviews,
      dismiss_stale_reviews: bp.dismissStaleReviews,
      require_code_owner_reviews: false,
    },
    restrictions: null,
    required_linear_history: bp.requireLinearHistory,
    allow_force_pushes: false,
    allow_deletions: false,
    required_signatures: bp.requireSignedCommits,
    required_conversation_resolution: bp.requireConversationResolution,
  };
}

function cmdAudit(options) {
  section("Branch Security Audit");

  const config = loadConfig();
  const report = {
    repo: null,
    checks: [],
    branches: [],
    wildcardBranches: [],
    score: 0,
    max: 0,
  };

  const localChecks = [
    {
      name: "Commit template configured",
      passed: checkGitConfig("commit.template"),
    },
    {
      name: "Signed commits enforced",
      passed: checkGitConfig("commit.gpgsign"),
    },
    {
      name: "Periderm workflow exists",
      passed: fs.existsSync(".github/workflows/periderm-pr.yml"),
    },
    {
      name: "Periderm status check configured",
      passed: checkStatusCheck(
        config.peridermCheck.contextName || "periderm-scan",
      ),
    },
  ];

  for (const c of localChecks) {
    report.max++;
    report.checks.push(c);
    if (c.passed) {
      success(c.name);
      report.score++;
    } else {
      warn(`${c.name} - MISSING`);
    }
  }

  if (checkGhCli()) {
    const repo = getRepo();
    report.repo = repo;
    if (repo) {
      info(`Repository: ${repo}`);
      for (const branch of config.branchProtection.branches) {
        if (isWildcardBranch(branch)) {
          report.wildcardBranches.push(branch);
          warn(
            `Wildcard pattern "${branch}" requires GitHub Rulesets (classic branch protection API takes concrete branch names)`,
          );
          continue;
        }
        report.max++;
        const r = spawnSync(
          "gh",
          [
            "api",
            `repos/${repo}/branches/${encodeURIComponent(branch)}/protection`,
          ],
          { encoding: "utf8" },
        );
        const protectedOk = r.status === 0;
        report.branches.push({ branch, protected: protectedOk });
        if (protectedOk) {
          success(`Branch protection: ${branch}`);
          report.score++;
        } else {
          warn(`Branch protection: ${branch} - NOT CONFIGURED`);
        }
      }
    } else {
      warn("Not authenticated with GitHub CLI; skipping remote branch checks");
    }
  } else {
    warn("GitHub CLI (gh) not installed; skipping remote branch checks");
  }

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  log(
    `\n${COLORS.bold}Score: ${report.score}/${report.max} (${Math.round((report.score / Math.max(report.max, 1)) * 100)}%)${COLORS.reset}`,
  );
  if (report.score < report.max) {
    info("Run `node branch-sec.js apply` to configure missing items");
  }
}

function cmdApply(options) {
  section("Applying Branch Security Configuration");

  const config = loadConfig();

  if (options.dryRun) {
    return cmdProtectBranches(options);
  }

  if (!checkGhCli()) {
    error("GitHub CLI (gh) not installed. Install: https://cli.github.com/");
    process.exit(1);
  }

  const repo = getRepo();
  if (!repo) {
    error("Not authenticated. Run: gh auth login");
    process.exit(1);
  }

  // 1. Generate commit template
  if (config.commitTemplate.enabled) {
    section("1/4 Commit Template");
    const template = generateCommitTemplate(config);
    fs.writeFileSync(".gitmessage", template);
    spawnSync("git", ["config", "commit.template", ".gitmessage"], {
      encoding: "utf8",
    });
    if (
      config.commitTemplate.requireSignedCommits ??
      config.branchProtection.requireSignedCommits
    ) {
      spawnSync("git", ["config", "commit.gpgsign", "true"], {
        encoding: "utf8",
      });
      spawnSync("git", ["config", "tag.gpgsign", "true"], { encoding: "utf8" });
    }
    success("Commit template configured");
  }

  // 2. Generate Periderm workflow for status checks
  if (config.peridermCheck.enabled) {
    section("2/4 Periderm Status Check Workflow");
    const workflow = generatePeridermWorkflow(config);
    fs.mkdirSync(".github/workflows", { recursive: true });
    fs.writeFileSync(".github/workflows/periderm-pr.yml", workflow);
    success("Periderm PR workflow created");
  }

  // 3. Apply branch protection via GitHub API
  if (config.branchProtection.enabled) {
    section("3/4 Branch Protection Rules");
    const targets =
      options.branches.length > 0
        ? options.branches
        : config.branchProtection.branches;
    for (const branch of targets) {
      applyBranchProtection(repo, branch, config);
    }
  }

  // 4. Local git config
  section("4/4 Local Git Config");
  spawnSync("git", ["config", "receive.denyNonFastForwards", "true"], {
    encoding: "utf8",
  });
  success("Local git configured");

  success("\nAll configurations applied!");
  info("Run `node branch-sec.js audit` to verify");
}

function generateCommitTemplate(config) {
  const c = config.commitTemplate;
  let t = `# Conventional Commits
# <type>(<scope>): <subject>
# Types: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert
# Subject: imperative, lowercase, no period
#
# Examples:
# feat(auth): add OAuth2 login
# fix(api): handle timeout errors
# docs(readme): update install steps
#
# Body: explain WHAT and WHY (not HOW)
`;

  if (c.requireSecurityFooter) {
    t += `# Security Footer (required for security changes):
# ${c.securityFooterKeys.join(" / ")}: <value>
# Example: Security: CVE-2024-XXXX / Periderm: scan-abc123
#
`;
  }

  t += `# ------------------------ >8 ------------------------
# Do not modify or remove the line above
`;
  return t;
}

function generatePeridermWorkflow(config) {
  const p = config.peridermCheck;
  const bp = config.branchProtection;
  return `# Periderm PR Scan - Required Status Check
# Auto-generated by branch-sec skill

name: Periderm Security Scan
on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [${bp.branches.join(", ")}]

permissions:
  contents: read
  security-events: write
  pull-requests: write
  statuses: write

env:
  PERIDERM_API_KEY: \${{ secrets.PERIDERM_API_KEY }}

jobs:
  periderm-scan:
    name: Periderm Security Scan
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Periderm CLI
        run: npm i -g periderm-cli@latest

      - name: Authenticate
        if: env.PERIDERM_API_KEY != ''
        run: periderm auth login --token \$PERIDERM_API_KEY

      - name: Run Periderm Scan
        id: scan
        run: |
          periderm scan --json > periderm-results.json || true
          periderm scan --sarif > periderm.sarif || true
          cat periderm-results.json

      - name: Check Thresholds
        run: |
          node -e "
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('periderm-results.json', 'utf8'));
            const critical = (data.findings || []).filter(f => f.severity === 'critical').length;
            const high = (data.findings || []).filter(f => f.severity === 'high').length;
            console.log('Critical:', critical, 'High:', high);
            if (${p.failOnCritical} && critical > 0) process.exit(1);
            if (${p.failOnHigh} && high > 0) process.exit(1);
          "

      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        if: always() && hashFiles('periderm.sarif') != ''
        with:
          sarif_file: periderm.sarif
          category: periderm

      - name: Comment on PR
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        with:
          script: |
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('periderm-results.json', 'utf8'));
            const critical = (data.findings || []).filter(f => f.severity === 'critical').length;
            const high = (data.findings || []).filter(f => f.severity === 'high').length;
            const launch = data.launchConfidence || 0;
            const reality = data.realityScore || 0;
            const perf = data.perceivedPerformance || 0;
            const body = \`## Periderm Scan Results
            - **Launch Confidence:** \${launch}/100
            - **Reality Score:** \${reality}/100
            - **Perceived Performance:** \${perf}/100
            - **Critical:** \${critical} | **High:** \${high}
            \${critical > 0 || high > 0 ? '⚠️ **Threshold exceeded**' : '✅ **All thresholds passed**'}\`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });
`;
}

function applyBranchProtection(repo, branchPattern, config) {
  if (isWildcardBranch(branchPattern)) {
    warn(
      `Skipping wildcard pattern "${branchPattern}" — classic Branch Protection API only accepts concrete branch names. Configure a GitHub Ruleset for wildcard patterns.`,
    );
    return { skipped: true, reason: "wildcard", branch: branchPattern };
  }

  log(`\nApplying protection to ${branchPattern}...`);
  const rules = buildProtectionPayload(config);
  const rulesJson = JSON.stringify(rules);
  const result = spawnSync(
    "gh",
    [
      "api",
      "-X",
      "PUT",
      "--input=-",
      `repos/${repo}/branches/${encodeURIComponent(branchPattern)}/protection`,
    ],
    {
      encoding: "utf8",
      input: rulesJson,
    },
  );

  if (result.status === 0) {
    success(`Branch protection applied to ${branchPattern}`);
    return { applied: true, branch: branchPattern };
  } else {
    warn(`Failed for ${branchPattern}: ${result.stderr}`);
    return { applied: false, branch: branchPattern, error: result.stderr };
  }
}

function cmdGenTemplate() {
  section("Generating Commit Template");
  const config = loadConfig();
  const template = generateCommitTemplate(config);
  fs.writeFileSync(".gitmessage", template);
  spawnSync("git", ["config", "commit.template", ".gitmessage"], {
    encoding: "utf8",
  });
  if (
    config.commitTemplate.requireSignedCommits ??
    config.branchProtection.requireSignedCommits
  ) {
    spawnSync("git", ["config", "commit.gpgsign", "true"], {
      encoding: "utf8",
    });
  }
  success("Commit template created at .gitmessage");
}

function cmdProtectBranches(options) {
  section("Applying Branch Protection");
  const config = loadConfig();
  const targets =
    options.branches.length > 0
      ? options.branches
      : config.branchProtection.branches;

  const concrete = targets.filter((b) => !isWildcardBranch(b));
  const wildcards = targets.filter((b) => isWildcardBranch(b));

  if (options.dryRun) {
    const payload = buildProtectionPayload(config);
    const plan = {
      dryRun: true,
      branches: concrete.map((branch) => ({ branch, payload })),
      wildcardBranches: wildcards,
    };
    if (options.json) {
      console.log(JSON.stringify(plan, null, 2));
    } else {
      for (const b of concrete) {
        info(`[dry-run] Would protect branch "${b}" with:`);
        console.log(JSON.stringify(payload, null, 2));
      }
      for (const w of wildcards) {
        warn(
          `[dry-run] Wildcard "${w}" skipped — use GitHub Rulesets for branch patterns`,
        );
      }
    }
    return;
  }

  if (!checkGhCli()) {
    error("gh CLI required");
    process.exit(1);
  }
  const repo = getRepo();
  if (!repo) {
    error("Not authenticated");
    process.exit(1);
  }
  for (const branch of targets) {
    applyBranchProtection(repo, branch, config);
  }
}

function cmdAddPeridermCheck() {
  section("Adding Periderm Status Check");
  const config = loadConfig();
  const workflow = generatePeridermWorkflow(config);
  fs.mkdirSync(".github/workflows", { recursive: true });
  fs.writeFileSync(".github/workflows/periderm-pr.yml", workflow);
  success("Periderm workflow created at .github/workflows/periderm-pr.yml");
}

function parseArgs(argv = process.argv.slice(2)) {
  const opts = {
    command: "help",
    dryRun: false,
    json: false,
    branches: [],
  };

  let cmdSeen = false;
  for (const arg of argv) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--help" || arg === "-h") {
      opts.command = "help";
      cmdSeen = true;
    } else if (!arg.startsWith("-")) {
      if (!cmdSeen) {
        opts.command = arg;
        cmdSeen = true;
      } else {
        opts.branches.push(arg);
      }
    }
  }
  return opts;
}

function showHelp() {
  console.log(`
${COLORS.bold}Branch Security${COLORS.reset}

Usage:
  node branch-sec.js <command> [branches...] [options]

Commands:
  audit                         Check current branch protection status
  apply                         Apply all branch protections
  gen-template                  Generate commit template with security footer
  protect, protect-branches     Apply branch protection rules to configured or listed branches
  add-periderm-check            Add Periderm required status check workflow
  help                          Show this help

Options:
  --dry-run                     Preview API payloads without modifying GitHub/Git settings
  --json                        Output machine-readable JSON

Requires:
  - GitHub CLI (gh) authenticated: gh auth login
  - Admin access to repository
`);
}

function main() {
  const options = parseArgs();
  JSON_MODE = options.json;

  switch (options.command) {
    case "audit":
      cmdAudit(options);
      break;
    case "apply":
      cmdApply(options);
      break;
    case "gen-template":
      cmdGenTemplate();
      break;
    case "protect":
    case "protect-branches":
      cmdProtectBranches(options);
      break;
    case "add-periderm-check":
      cmdAddPeridermCheck();
      break;
    case "help":
      showHelp();
      break;
    default:
      error(`Unknown: ${options.command}`);
      showHelp();
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadConfig,
  parseArgs,
  isWildcardBranch,
  buildProtectionPayload,
  generateCommitTemplate,
  generatePeridermWorkflow,
};
