#!/usr/bin/env node

/**
 * Repository Security - Audit and harden repository security posture
 * Interactive setup grills user for threat model
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const readline = require("readline");

const SKILL_DIR = path.resolve(__dirname, "..");
const TEMPLATES_DIR = path.join(SKILL_DIR, "templates");

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

function log(msg, color = "reset") {
  console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function error(msg) {
  console.error(`${COLORS.red}✖ ${msg}${COLORS.reset}`);
}

function success(msg) {
  console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`);
}

function warn(msg) {
  console.log(`${COLORS.yellow}⚠ ${msg}${COLORS.reset}`);
}

function info(msg) {
  console.log(`${COLORS.blue}ℹ ${msg}${COLORS.reset}`);
}

function section(title) {
  log(`\n${COLORS.bold}${COLORS.cyan}═══ ${title} ═══${COLORS.reset}\n`);
}

function ask(question, defaultValue = "") {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const prompt = defaultValue
      ? `${question} [${defaultValue}]: `
      : `${question}: `;
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

function askYesNo(question, defaultValue = true) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const defaultStr = defaultValue ? "Y/n" : "y/N";
    rl.question(`${question} [${defaultStr}]: `, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      if (!normalized) resolve(defaultValue);
      else resolve(normalized === "y" || normalized === "yes");
    });
  });
}

function askMultiSelect(question, options, defaultSelection = []) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log(`${question}`);
    options.forEach((opt, i) => {
      const checked = defaultSelection.includes(opt.value) ? "x" : " ";
      console.log(`  [${checked}] ${i + 1}. ${opt.label} - ${opt.description}`);
    });
    rl.question(
      "Select numbers (comma-separated) or press Enter for defaults: ",
      (answer) => {
        rl.close();
        if (!answer.trim()) {
          resolve(
            defaultSelection
              .map((v) => options.find((o) => o.value === v))
              .filter(Boolean),
          );
          return;
        }
        const indices = answer
          .split(",")
          .map((s) => parseInt(s.trim()) - 1)
          .filter((n) => !isNaN(n) && n >= 0 && n < options.length);
        resolve(indices.map((i) => options[i]));
      },
    );
  });
}

function askSelect(question, options, defaultValue) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log(`${question}`);
    options.forEach((opt, i) => {
      const marker = opt.value === defaultValue ? ">" : " ";
      console.log(`  ${marker} ${i + 1}. ${opt.label} - ${opt.description}`);
    });
    rl.question(
      `Select [1-${options.length}] (default: ${defaultValue}): `,
      (answer) => {
        rl.close();
        const idx = parseInt(answer.trim()) - 1;
        if (isNaN(idx) || idx < 0 || idx >= options.length) {
          resolve(options.find((o) => o.value === defaultValue));
        } else {
          resolve(options[idx]);
        }
      },
    );
  });
}

function loadConfig() {
  const configPath = path.join(process.cwd(), "repo-sec.json");
  const defaults = {
    threatModel: {
      projectType: "private",
      pushAccess: "core-team",
      blastRadius: "medium",
      compliance: ["none"],
    },
    gitConfig: {
      requireSignedCommits: true,
      requireSignedTags: true,
      enforceConventionalCommits: true,
      disableForcePush: true,
      requireLinearHistory: true,
      followTags: true,
    },
    branchProtection: {
      protectedBranches: ["main", "release/*"],
      requiredReviews: 2,
      dismissStaleReviews: true,
      requireConversationResolution: true,
      requiredStatusChecks: ["ci/lint", "ci/test", "ci/periderm"],
      requireUpToDateBranch: true,
      lockBranch: true,
    },
    secretScanning: {
      enabled: true,
      pushProtection: true,
      customPatterns: [],
      scanHistory: true,
      usePeriderm: true,
    },
    dependencies: {
      dependabotAlerts: true,
      dependabotAutoFix: true,
      schedule: "weekly",
      autoMerge: ["patch", "minor"],
      pinVersions: false,
      auditSources: ["npm", "osv", "snyk"],
    },
    supplyChain: {
      verifySignatures: true,
      generateSBOM: true,
      signReleases: true,
      slsaProvenance: false,
      reproducibleBuilds: false,
    },
    governance: {
      securityPolicy: true,
      codeowners: true,
      contributingSecurity: true,
      gitignoreSecrets: true,
      securityAdvisories: true,
    },
  };

  if (!fs.existsSync(configPath)) return defaults;

  try {
    return deepMerge(defaults, JSON.parse(fs.readFileSync(configPath, "utf8")));
  } catch (e) {
    warn(`Failed to parse repo-sec.json: ${e.message}. Using defaults.`);
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

function readTemplate(name) {
  const p = path.join(TEMPLATES_DIR, name);
  if (!fs.existsSync(p)) {
    error(`Template not found: ${p}`);
    process.exit(1);
  }
  return fs.readFileSync(p, "utf8");
}

async function cmdSetup() {
  section("Interactive Repository Security Setup");
  info("I'll ask about your threat model and apply tailored hardening.\n");

  const config = {
    threatModel: {},
    gitConfig: {},
    branchProtection: {},
    secretScanning: {},
    dependencies: {},
    supplyChain: {},
    governance: {},
  };

  // Threat Model
  section("Threat Model & Scope");

  const projectTypes = [
    {
      value: "open-source",
      label: "Open Source",
      description: "Public repo, many contributors, public packages",
    },
    {
      value: "private",
      label: "Private / Internal",
      description: "Private repo, limited team access",
    },
    {
      value: "internal-tool",
      label: "Internal Tool",
      description: "Internal use only, not distributed",
    },
    {
      value: "compliance",
      label: "Compliance Required",
      description: "SOC2, HIPAA, PCI, GDPR, etc.",
    },
  ];
  const pt = await askSelect("What type of project?", projectTypes, "private");
  config.threatModel.projectType = pt.value;

  const pushAccessOptions = [
    {
      value: "core-team",
      label: "Core Team Only",
      description: "Small trusted team with push access",
    },
    {
      value: "many-contributors",
      label: "Many Contributors",
      description: "Many external contributors, PR-based",
    },
    {
      value: "bots",
      label: "Bots / Automation",
      description: "Primarily bots, CI/CD, release automation",
    },
  ];
  const pa = await askSelect(
    "Who has push access?",
    pushAccessOptions,
    "core-team",
  );
  config.threatModel.pushAccess = pa.value;

  const blastOptions = [
    {
      value: "low",
      label: "Low",
      description: "Compromise affects only this repo",
    },
    {
      value: "medium",
      label: "Medium",
      description: "Compromise affects downstream users/consumers",
    },
    {
      value: "high",
      label: "High",
      description: "Compromise affects production systems",
    },
    {
      value: "critical",
      label: "Critical",
      description: "Compromise affects critical infrastructure/data",
    },
  ];
  const br = await askSelect(
    "Blast radius if compromised?",
    blastOptions,
    "medium",
  );
  config.threatModel.blastRadius = br.value;

  const complianceOptions = [
    {
      value: "none",
      label: "None",
      description: "No specific compliance requirements",
    },
    { value: "soc2", label: "SOC 2", description: "SOC 2 Type II compliance" },
    {
      value: "hipaa",
      label: "HIPAA",
      description: "Healthcare data protection",
    },
    { value: "pci", label: "PCI DSS", description: "Payment card industry" },
    { value: "gdpr", label: "GDPR", description: "EU data protection" },
    {
      value: "iso27001",
      label: "ISO 27001",
      description: "Information security management",
    },
    {
      value: "fedramp",
      label: "FedRAMP",
      description: "US federal cloud authorization",
    },
  ];
  const comp = await askMultiSelect(
    "Compliance requirements?",
    complianceOptions,
    ["none"],
  );
  config.threatModel.compliance = comp.map((c) => c.value);

  // Git Config
  section("Git Configuration Hardening");

  config.gitConfig.requireSignedCommits = await askYesNo(
    "Require signed commits (GPG/SSH)?",
    true,
  );
  config.gitConfig.requireSignedTags = await askYesNo(
    "Require signed tags?",
    true,
  );
  config.gitConfig.enforceConventionalCommits = await askYesNo(
    "Enforce conventional commit format?",
    true,
  );
  config.gitConfig.disableForcePush = await askYesNo(
    "Disable force push to protected branches?",
    true,
  );
  config.gitConfig.requireLinearHistory = await askYesNo(
    "Require linear history (no merge commits)?",
    true,
  );
  config.gitConfig.followTags = await askYesNo(
    "Enable push --follow-tags by default?",
    true,
  );

  // Branch Protection
  section("Branch Protection");

  const branchInput = await ask(
    "Branches to protect (comma-separated)",
    "main,release/*",
  );
  config.branchProtection.protectedBranches = branchInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  config.branchProtection.requiredReviews = parseInt(
    await ask("Required PR reviews", "2"),
  );
  config.branchProtection.dismissStaleReviews = await askYesNo(
    "Dismiss stale reviews on new pushes?",
    true,
  );
  config.branchProtection.requireConversationResolution = await askYesNo(
    "Require conversation resolution before merge?",
    true,
  );
  config.branchProtection.requireUpToDateBranch = await askYesNo(
    "Require branches up-to-date before merge?",
    true,
  );
  config.branchProtection.lockBranch = await askYesNo(
    "Lock branch from force push?",
    true,
  );

  const checkInput = await ask(
    "Required status checks (comma-separated)",
    "ci/lint,ci/test,ci/periderm",
  );
  config.branchProtection.requiredStatusChecks = checkInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Secret Scanning
  section("Secret Scanning");

  config.secretScanning.enabled = await askYesNo(
    "Enable secret scanning?",
    true,
  );
  config.secretScanning.pushProtection = await askYesNo(
    "Enable push protection (block pushes with secrets)?",
    true,
  );
  config.secretScanning.scanHistory = await askYesNo(
    "Scan git history for leaked secrets?",
    true,
  );

  const hasPeriderm =
    spawnSync("periderm", ["--version"], { encoding: "utf8" }).status === 0;
  if (hasPeriderm) {
    config.secretScanning.usePeriderm = await askYesNo(
      "Use Periderm CLI for deep scans?",
      true,
    );
  } else {
    config.secretScanning.usePeriderm = false;
    info("Periderm CLI not found, skipping Periderm integration");
  }

  const customPatterns = await ask(
    "Custom secret patterns (comma-separated, optional)",
    "",
  );
  config.secretScanning.customPatterns = customPatterns
    ? customPatterns
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Dependencies
  section("Dependency Security");

  config.dependencies.dependabotAlerts = await askYesNo(
    "Enable Dependabot alerts?",
    true,
  );
  config.dependencies.dependabotAutoFix = await askYesNo(
    "Enable Dependabot auto-fix PRs?",
    true,
  );

  const scheduleOptions = [
    { value: "daily", label: "Daily", description: "Check daily" },
    {
      value: "weekly",
      label: "Weekly",
      description: "Check weekly (recommended)",
    },
    { value: "monthly", label: "Monthly", description: "Check monthly" },
  ];
  const sched = await askSelect(
    "Dependabot schedule",
    scheduleOptions,
    "weekly",
  );
  config.dependencies.schedule = sched.value;

  const autoMergeOptions = [
    {
      value: "patch",
      label: "Patch",
      description: "Auto-merge patch versions (x.y.Z)",
    },
    {
      value: "minor",
      label: "Minor",
      description: "Auto-merge minor versions (x.Y.z)",
    },
    {
      value: "major",
      label: "Major",
      description: "Auto-merge major versions (X.y.z)",
    },
    { value: "none", label: "None", description: "No auto-merge" },
  ];
  const am = await askMultiSelect(
    "Auto-merge for which version bumps?",
    autoMergeOptions,
    ["patch", "minor"],
  );
  config.dependencies.autoMerge = am.map((a) => a.value);

  config.dependencies.pinVersions = await askYesNo(
    "Pin dependencies to exact versions in lockfile?",
    false,
  );

  const auditOptions = [
    { value: "npm", label: "npm audit", description: "Built-in npm audit" },
    {
      value: "osv",
      label: "OSV.dev",
      description: "Open Source Vulnerabilities database",
    },
    {
      value: "snyk",
      label: "Snyk",
      description: "Snyk vulnerability database",
    },
    {
      value: "github",
      label: "GitHub Advisory",
      description: "GitHub Security Advisories",
    },
  ];
  const aud = await askMultiSelect("Audit sources", auditOptions, [
    "npm",
    "osv",
    "snyk",
  ]);
  config.dependencies.auditSources = aud.map((a) => a.value);

  // Supply Chain
  section("Supply Chain Security");

  config.supplyChain.verifySignatures = await askYesNo(
    "Verify commit signatures on merge?",
    true,
  );
  config.supplyChain.generateSBOM = await askYesNo(
    "Generate SBOM (Software Bill of Materials)?",
    true,
  );
  config.supplyChain.signReleases = await askYesNo(
    "Sign releases/artifacts?",
    true,
  );
  config.supplyChain.slsaProvenance = await askYesNo(
    "Generate SLSA provenance?",
    false,
  );
  config.supplyChain.reproducibleBuilds = await askYesNo(
    "Enforce reproducible builds?",
    false,
  );

  // Governance
  section("Security Policy & Governance");

  config.governance.securityPolicy = await askYesNo(
    "Create SECURITY.md with vulnerability disclosure?",
    true,
  );
  config.governance.codeowners = await askYesNo(
    "Create CODEOWNERS for security-sensitive paths?",
    true,
  );
  config.governance.contributingSecurity = await askYesNo(
    "Add security guidelines to CONTRIBUTING.md?",
    true,
  );
  config.governance.gitignoreSecrets = await askYesNo(
    "Add secret patterns to .gitignore?",
    true,
  );
  config.governance.securityAdvisories = await askYesNo(
    "Enable GitHub Security Advisories?",
    true,
  );

  // Save config
  const configPath = path.join(process.cwd(), "repo-sec.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  success(`\nConfiguration saved to ${configPath}`);

  // Apply hardening
  const applyNow = await askYesNo("\nApply hardening now?", true);
  if (applyNow) {
    await cmdHarden(config);
  } else {
    info("Run `node repo-sec.js harden` to apply later");
  }
}

async function cmdAudit(configOverride = null) {
  section("Repository Security Audit");

  const config = configOverride || loadConfig();
  const findings = [];

  // Check git config
  section("Git Configuration");
  const gitChecks = [
    {
      key: "commit.gpgSign",
      expected: "true",
      desc: "Signed commits required",
    },
    { key: "tag.gpgSign", expected: "true", desc: "Signed tags required" },
    {
      key: "push.autoSetupRemote",
      expected: "true",
      desc: "Auto-setup remote on push",
    },
  ];

  for (const check of gitChecks) {
    const result = spawnSync("git", ["config", "--get", check.key], {
      encoding: "utf8",
    });
    const value = result.stdout.trim();
    if (value === check.expected) {
      success(`${check.desc}: ${value}`);
    } else {
      warn(`${check.desc}: ${value || "not set"} (expected ${check.expected})`);
      findings.push({
        control: check.desc,
        status: "fail",
        current: value,
        expected: check.expected,
      });
    }
  }

  // Check branch protection (requires GitHub CLI)
  section("Branch Protection");
  const gh = spawnSync("gh", ["--version"], { encoding: "utf8" });
  if (gh.status === 0) {
    try {
      const repoInfo = spawnSync(
        "gh",
        ["repo", "view", "--json", "nameWithOwner"],
        { encoding: "utf8" },
      );
      if (repoInfo.status === 0) {
        const repo = JSON.parse(repoInfo.stdout).nameWithOwner;
        for (const branch of config.branchProtection.protectedBranches) {
          const bp = spawnSync(
            "gh",
            ["api", `repos/${repo}/branches/${branch}/protection`],
            { encoding: "utf8" },
          );
          if (bp.status === 0) {
            const protection = JSON.parse(bp.stdout);
            success(`Branch ${branch}: protected`);
            if (protection.required_pull_request_reviews) {
              success(
                `  Required reviews: ${protection.required_pull_request_reviews.required_approving_review_count || "not set"}`,
              );
            }
            if (protection.required_status_checks) {
              success(
                `  Required checks: ${protection.required_status_checks.contexts?.join(", ") || "none"}`,
              );
            }
          } else {
            warn(`Branch ${branch}: NOT protected`);
            findings.push({
              control: `Branch protection: ${branch}`,
              status: "fail",
              current: "unprotected",
              expected: "protected",
            });
          }
        }
      }
    } catch (e) {
      warn("Could not check branch protection via GitHub API");
    }
  } else {
    info("GitHub CLI not found, skipping branch protection checks");
  }

  // Check secret scanning
  section("Secret Scanning");
  if (config.secretScanning.enabled) {
    if (config.secretScanning.usePeriderm) {
      const periderm = spawnSync("periderm", ["scan", "--json"], {
        encoding: "utf8",
        timeout: 60000,
      });
      if (periderm.status === 0) {
        try {
          const data = JSON.parse(periderm.stdout);
          const findings_count = data.findings?.length || 0;
          if (findings_count === 0) {
            success("Periderm scan: no findings");
          } else {
            warn(`Periderm scan: ${findings_count} finding(s)`);
            findings.push({
              control: "Periderm secret scan",
              status: "warn",
              current: `${findings_count} findings`,
              expected: "0 findings",
            });
          }
        } catch {
          warn("Periderm scan completed but output not JSON");
        }
      } else {
        warn("Periderm scan failed or not installed");
      }
    }
  } else {
    info("Secret scanning disabled in config");
  }

  // Check dependencies
  section("Dependencies");
  const pkgPath = path.join(process.cwd(), "package.json");
  if (fs.existsSync(pkgPath)) {
    const audit = spawnSync("npm", ["audit", "--json"], {
      encoding: "utf8",
      timeout: 120000,
    });
    if (audit.status === 0) {
      try {
        const data = JSON.parse(audit.stdout);
        const vulns = data.metadata?.vulnerabilities || {};
        const total = Object.values(vulns).reduce((a, b) => a + b, 0);
        if (total === 0) {
          success("npm audit: no vulnerabilities");
        } else {
          warn(
            `npm audit: ${total} vulnerabilities (${vulns.critical || 0} critical, ${vulns.high || 0} high, ${vulns.moderate || 0} moderate, ${vulns.low || 0} low)`,
          );
          findings.push({
            control: "npm audit",
            status: "warn",
            current: `${total} vulns`,
            expected: "0 vulns",
          });
        }
      } catch {
        warn("npm audit output not JSON");
      }
    } else {
      warn("npm audit failed");
    }
  }

  // Check governance files
  section("Governance Files");
  const govFiles = [
    {
      file: "SECURITY.md",
      enabled: config.governance.securityPolicy,
      desc: "Security policy",
    },
    {
      file: "CODEOWNERS",
      enabled: config.governance.codeowners,
      desc: "Code owners",
    },
    {
      file: "CONTRIBUTING.md",
      enabled: config.governance.contributingSecurity,
      desc: "Contributing guidelines",
    },
    {
      file: ".github/dependabot.yml",
      enabled: config.dependencies.dependabotAutoFix,
      desc: "Dependabot config",
    },
  ];

  for (const gf of govFiles) {
    const fullPath = path.join(process.cwd(), gf.file);
    if (gf.enabled) {
      if (fs.existsSync(fullPath)) {
        success(`${gf.desc}: ${gf.file} exists`);
      } else {
        warn(`${gf.desc}: ${gf.file} MISSING`);
        findings.push({
          control: gf.desc,
          status: "fail",
          current: "missing",
          expected: "present",
        });
      }
    } else {
      info(`${gf.desc}: disabled in config`);
    }
  }

  // Check .gitignore for secrets
  const gitignorePath = path.join(process.cwd(), ".gitignore");
  if (config.governance.gitignoreSecrets && fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, "utf8");
    const secretPatterns = [
      "*.key",
      "*.pem",
      "*.p12",
      "*.pfx",
      ".env",
      "*.secret",
      "*.token",
      "id_rsa",
      "id_ed25519",
    ];
    const missing = secretPatterns.filter((p) => !gitignore.includes(p));
    if (missing.length === 0) {
      success(".gitignore: contains secret patterns");
    } else {
      warn(`.gitignore: missing patterns: ${missing.join(", ")}`);
      findings.push({
        control: ".gitignore secrets",
        status: "warn",
        current: "partial",
        expected: "complete",
      });
    }
  }

  // Summary
  section("Audit Summary");
  const fails = findings.filter((f) => f.status === "fail").length;
  const warns = findings.filter((f) => f.status === "warn").length;

  if (fails === 0 && warns === 0) {
    success("All checks passed!");
  } else {
    warn(`${fails} failed, ${warns} warnings`);
    for (const f of findings) {
      const icon = f.status === "fail" ? "✖" : "⚠";
      console.log(
        `  ${icon} ${f.control}: ${f.current} (expected: ${f.expected})`,
      );
    }
  }

  return findings;
}

async function cmdHarden(configOverride = null) {
  section("Applying Security Hardening");

  const config = configOverride || loadConfig();
  let applied = 0;

  // Git config
  section("Git Configuration");
  if (config.gitConfig.requireSignedCommits) {
    spawnSync("git", ["config", "--local", "commit.gpgSign", "true"]);
    success("Set commit.gpgSign=true");
    applied++;
  }
  if (config.gitConfig.requireSignedTags) {
    spawnSync("git", ["config", "--local", "tag.gpgSign", "true"]);
    success("Set tag.gpgSign=true");
    applied++;
  }
  if (config.gitConfig.enforceConventionalCommits) {
    spawnSync("git", ["config", "--local", "commit.template", ".gitmessage"]);
    // Create commit template
    const template = `# <type>(<scope>): <subject>
# Types: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert
# Example: feat(auth): add OAuth2 login
#
# Security footer for security changes:
# Security: CVE-XXXX / Periderm: scan-xxx
`;
    fs.writeFileSync(path.join(process.cwd(), ".gitmessage"), template);
    success("Created .gitmessage template for conventional commits");
    applied++;
  }
  if (config.gitConfig.disableForcePush) {
    spawnSync("git", ["config", "--local", "receive.denyForcePush", "true"]);
    success("Set receive.denyForcePush=true");
    applied++;
  }
  if (config.gitConfig.requireLinearHistory) {
    spawnSync("git", ["config", "--local", "merge.ff", "only"]);
    success("Set merge.ff=only (linear history)");
    applied++;
  }
  if (config.gitConfig.followTags) {
    spawnSync("git", ["config", "--local", "push.followTags", "true"]);
    success("Set push.followTags=true");
    applied++;
  }

  // Branch protection - requires GitHub CLI
  section("Branch Protection");
  const gh = spawnSync("gh", ["--version"], { encoding: "utf8" });
  if (gh.status === 0) {
    try {
      const repoInfo = spawnSync(
        "gh",
        ["repo", "view", "--json", "nameWithOwner"],
        { encoding: "utf8" },
      );
      if (repoInfo.status === 0) {
        const repo = JSON.parse(repoInfo.stdout).nameWithOwner;
        for (const branch of config.branchProtection.protectedBranches) {
          const protection = {
            required_pull_request_reviews: {
              required_approving_review_count:
                config.branchProtection.requiredReviews,
              dismiss_stale_reviews:
                config.branchProtection.dismissStaleReviews,
              require_code_owner_reviews: false,
            },
            required_status_checks: {
              strict: config.branchProtection.requireUpToDateBranch,
              contexts: config.branchProtection.requiredStatusChecks,
            },
            enforce_admins: false,
            restrictions: null,
            required_conversation_resolution:
              config.branchProtection.requireConversationResolution,
            lock_branch: config.branchProtection.lockBranch,
            allow_force_pushes: false,
            allow_deletions: false,
          };

          const result = spawnSync(
            "gh",
            [
              "api",
              "--method",
              "PUT",
              `repos/${repo}/branches/${branch}/protection`,
              "--input",
              "-",
            ],
            {
              encoding: "utf8",
              input: JSON.stringify(protection),
            },
          );

          if (result.status === 0) {
            success(`Branch ${branch}: protection applied`);
            applied++;
          } else {
            warn(
              `Branch ${branch}: failed to apply protection: ${result.stderr}`,
            );
          }
        }
      }
    } catch (e) {
      warn("Could not apply branch protection via GitHub API");
    }
  } else {
    info(
      "GitHub CLI not found, skipping branch protection (configure manually)",
    );
  }

  // Secret scanning - GitHub settings
  section("Secret Scanning");
  if (gh.status === 0) {
    try {
      const repoInfo = spawnSync(
        "gh",
        ["repo", "view", "--json", "nameWithOwner"],
        { encoding: "utf8" },
      );
      if (repoInfo.status === 0) {
        const repo = JSON.parse(repoInfo.stdout).nameWithOwner;

        // Enable secret scanning
        if (config.secretScanning.enabled) {
          const result = spawnSync(
            "gh",
            [
              "api",
              "--method",
              "PUT",
              `repos/${repo}`,
              "-f",
              "security_and_analysis[secret_scanning][status]=enabled",
            ],
            { encoding: "utf8" },
          );
          if (result.status === 0) success("Enabled secret scanning");
          else warn("Failed to enable secret scanning");
        }

        // Enable push protection
        if (config.secretScanning.pushProtection) {
          const result = spawnSync(
            "gh",
            [
              "api",
              "--method",
              "PUT",
              `repos/${repo}`,
              "-f",
              "security_and_analysis[secret_scanning_push_protection][status]=enabled",
            ],
            { encoding: "utf8" },
          );
          if (result.status === 0) success("Enabled push protection");
          else warn("Failed to enable push protection");
        }
      }
    } catch (e) {
      warn("Could not configure secret scanning via GitHub API");
    }
  }

  // Dependabot
  section("Dependabot Configuration");
  if (config.dependencies.dependabotAutoFix) {
    const dependabotDir = path.join(process.cwd(), ".github");
    if (!fs.existsSync(dependabotDir))
      fs.mkdirSync(dependabotDir, { recursive: true });

    const dependabotConfig = {
      version: 2,
      updates: [
        {
          "package-ecosystem": "npm",
          directory: "/",
          schedule: { interval: config.dependencies.schedule },
          allow: config.dependencies.autoMerge.map((v) => ({
            "dependency-type": "direct",
            "update-type": v,
          })),
          "commit-message": { prefix: "deps" },
          labels: ["dependencies", "automerge"],
        },
      ],
    };

    // Add more ecosystems if detected
    if (
      fs.existsSync(path.join(process.cwd(), "requirements.txt")) ||
      fs.existsSync(path.join(process.cwd(), "pyproject.toml"))
    ) {
      dependabotConfig.updates.push({
        "package-ecosystem": "pip",
        directory: "/",
        schedule: { interval: config.dependencies.schedule },
        allow: config.dependencies.autoMerge.map((v) => ({
          "dependency-type": "direct",
          "update-type": v,
        })),
        labels: ["dependencies", "automerge"],
      });
    }

    fs.writeFileSync(
      path.join(dependabotDir, "dependabot.yml"),
      yamlStringify(dependabotConfig),
    );
    success("Created .github/dependabot.yml");
    applied++;
  }

  // Governance files
  section("Governance Files");

  if (config.governance.securityPolicy) {
    const policy = readTemplate("security-policy.md");
    fs.writeFileSync(path.join(process.cwd(), "SECURITY.md"), policy);
    success("Created SECURITY.md");
    applied++;
  }

  if (config.governance.codeowners) {
    const codeowners = readTemplate("codeowners");
    fs.writeFileSync(path.join(process.cwd(), "CODEOWNERS"), codeowners);
    success("Created CODEOWNERS");
    applied++;
  }

  if (config.governance.contributingSecurity) {
    const contributingPath = path.join(process.cwd(), "CONTRIBUTING.md");
    let contributing = "";
    if (fs.existsSync(contributingPath)) {
      contributing = fs.readFileSync(contributingPath, "utf8");
    }
    const securitySection = `\n## Security Guidelines\n\n- All security-related changes must include a Security footer in commit messages\n- Run \`periderm scan\` before pushing security changes\n- Report vulnerabilities via SECURITY.md process\n- Dependencies are audited weekly via Dependabot\n- Signed commits required for all contributions\n`;

    if (!contributing.includes("Security Guidelines")) {
      fs.writeFileSync(contributingPath, contributing + securitySection);
      success("Updated CONTRIBUTING.md with security guidelines");
      applied++;
    } else {
      info("CONTRIBUTING.md already has security guidelines");
    }
  }

  if (config.governance.gitignoreSecrets) {
    const gitignorePath = path.join(process.cwd(), ".gitignore");
    const securityPatterns = readTemplate(".gitignore.security");
    let gitignore = "";
    if (fs.existsSync(gitignorePath)) {
      gitignore = fs.readFileSync(gitignorePath, "utf8");
    }

    const missing = securityPatterns
      .split("\n")
      .filter((line) => line.trim() && !gitignore.includes(line.trim()));
    if (missing.length > 0) {
      fs.writeFileSync(
        gitignorePath,
        gitignore +
          "\n# Security patterns added by repo-sec\n" +
          missing.join("\n") +
          "\n",
      );
      success(`Added ${missing.length} secret patterns to .gitignore`);
      applied++;
    } else {
      info(".gitignore already has secret patterns");
    }
  }

  // Summary
  section("Hardening Complete");
  success(`Applied ${applied} security controls`);
  info("Run `node repo-sec.js audit` to verify");
}

function yamlStringify(obj, indent = 0) {
  const spaces = "  ".repeat(indent);
  let result = "";

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        result += `${spaces}${key}: []\n`;
      } else if (typeof value[0] === "object") {
        result += `${spaces}${key}:\n`;
        for (const item of value) {
          result += `${spaces}  -\n`;
          result += yamlStringify(item, indent + 2);
        }
      } else {
        result += `${spaces}${key}: [${value.map((v) => (typeof v === "string" ? `'${v}'` : v)).join(", ")}]\n`;
      }
    } else if (value && typeof value === "object") {
      result += `${spaces}${key}:\n`;
      result += yamlStringify(value, indent + 1);
    } else {
      const valStr = typeof value === "string" ? `'${value}'` : value;
      result += `${spaces}${key}: ${valStr}\n`;
    }
  }

  return result;
}

function cmdStatus() {
  section("Repository Security Status");

  // Git config
  const gitConfigs = [
    "commit.gpgSign",
    "tag.gpgSign",
    "commit.template",
    "receive.denyForcePush",
    "merge.ff",
    "push.followTags",
  ];
  for (const gc of gitConfigs) {
    const result = spawnSync("git", ["config", "--get", gc], {
      encoding: "utf8",
    });
    const value = result.stdout.trim() || "not set";
    console.log(`  git config ${gc}: ${value}`);
  }

  // Check for governance files
  const files = [
    "SECURITY.md",
    "CODEOWNERS",
    "CONTRIBUTING.md",
    ".github/dependabot.yml",
  ];
  for (const f of files) {
    const fullPath = path.join(process.cwd(), f);
    if (fs.existsSync(fullPath)) {
      success(`${f}: exists`);
    } else {
      warn(`${f}: missing`);
    }
  }

  // Config
  const configPath = path.join(process.cwd(), "repo-sec.json");
  if (fs.existsSync(configPath)) {
    info(`\nConfig: ${configPath}`);
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    console.log(JSON.stringify(config, null, 2));
  }
}

function cmdPolicy() {
  section("Generating Security Policy");
  const policy = readTemplate("security-policy.md");
  const outPath = path.join(process.cwd(), "SECURITY.md");
  fs.writeFileSync(outPath, policy);
  success(`Created ${outPath}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  return args[0] || "help";
}

function showHelp() {
  console.log(`
${COLORS.bold}Repository Security${COLORS.reset}

Usage:
  node repo-sec.js <command>

Commands:
  setup             Interactive setup - grills you for threat model
  audit             Run security audit only
  harden            Apply all recommended hardening
  status            Show security controls status
  policy            Generate SECURITY.md template
  help              Show this help

Examples:
  node repo-sec.js setup        # Interactive configuration
  node repo-sec.js audit        # Check current posture
  node repo-sec.js harden       # Apply hardening
  node repo-sec.js status       # Show status
`);
}

async function main() {
  const cmd = parseArgs();
  switch (cmd) {
    case "setup":
      await cmdSetup();
      break;
    case "audit":
      await cmdAudit();
      break;
    case "harden":
      await cmdHarden();
      break;
    case "status":
      cmdStatus();
      break;
    case "policy":
      cmdPolicy();
      break;
    case "help":
    case "--help":
    case "-h":
      showHelp();
      break;
    default:
      error(`Unknown: ${cmd}`);
      showHelp();
      process.exit(1);
  }
}

main();
