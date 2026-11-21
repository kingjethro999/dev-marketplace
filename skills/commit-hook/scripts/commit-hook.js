#!/usr/bin/env node

/**
 * Commit Hook - Install and test Git hooks with Periderm CLI integration
 * Interactive setup mode grills user for their preferences
 */

const fs = require("fs");
const os = require("os");
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

function loadConfig() {
  const configPath = path.join(process.cwd(), "commit-hook.json");
  const defaults = {
    preCommit: {
      enabled: true,
      peridermScan: true,
      peridermArgs: ["--staged", "--json"],
      failOn: ["critical", "high"],
      lint: true,
      typecheck: true,
      tests: ["unit"],
      timeout: 60000,
    },
    prePush: {
      enabled: true,
      peridermScan: true,
      peridermReview: true,
      peridermArgs: ["--json"],
      failOn: ["critical", "high"],
      tests: ["all"],
      build: true,
      timeout: 300000,
    },
    commitMsg: {
      enabled: true,
      requireConventional: true,
      requireSecurityFooter: true,
      securityFooterKeys: ["Security", "CVE", "GHSA", "Periderm"],
      maxLength: 72,
    },
  };

  if (!fs.existsSync(configPath)) return defaults;

  try {
    return deepMerge(defaults, JSON.parse(fs.readFileSync(configPath, "utf8")));
  } catch (e) {
    warn(`Failed to parse commit-hook.json: ${e.message}. Using defaults.`);
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

function writeHook(name, content) {
  const hookDir = path.join(process.cwd(), ".git", "hooks");
  if (!fs.existsSync(hookDir)) {
    error("Not a Git repo");
    process.exit(1);
  }
  const hookPath = path.join(hookDir, name);
  if (fs.existsSync(hookPath)) {
    fs.copyFileSync(hookPath, `${hookPath}.backup-${Date.now()}`);
  }
  fs.writeFileSync(hookPath, content, { mode: 0o755 });
  success(`Installed ${name} hook`);
}

async function cmdSetup() {
  section("Interactive Commit Hook Setup");
  info(
    "I'll ask you a series of questions to configure hooks for your project.\n",
  );

  const config = {
    preCommit: { peridermArgs: ["--staged", "--json"] },
    prePush: { peridermArgs: ["--json"] },
    commitMsg: {},
  };

  // Check periderm CLI
  const ver = spawnSync("periderm", ["--version"], { encoding: "utf8" });
  const hasPeriderm = ver.status === 0;
  if (hasPeriderm) {
    info(`Found Periderm ${ver.stdout.trim()}`);
  } else {
    warn("periderm-cli not found. Install with: npm i -g periderm-cli");
  }

  // Check package.json for scripts
  const pkgPath = path.join(process.cwd(), "package.json");
  const hasPackageJson = fs.existsSync(pkgPath);
  let scripts = {};
  if (hasPackageJson) {
    try {
      scripts = JSON.parse(fs.readFileSync(pkgPath, "utf8")).scripts || {};
    } catch {}
  }

  const hasLint = hasPackageJson && (scripts.lint || scripts["lint:fix"]);
  const hasTypecheck =
    hasPackageJson &&
    (scripts.typecheck || scripts["type-check"] || scripts.tsc);
  const hasTest =
    hasPackageJson &&
    (scripts.test || scripts["test:unit"] || scripts["test:integration"]);
  const hasBuild = hasPackageJson && scripts.build;

  // Pre-commit questions
  section("Pre-commit Hook (runs on every git commit)");

  config.preCommit.enabled = await askYesNo("Enable pre-commit hook?", true);

  if (config.preCommit.enabled) {
    if (hasPeriderm) {
      config.preCommit.peridermScan = await askYesNo(
        "Run Periderm scan on staged files?",
        true,
      );
      if (config.preCommit.peridermScan) {
        const failOnOptions = [
          {
            value: "critical",
            label: "Critical",
            description: "Block on critical findings only",
          },
          {
            value: "high",
            label: "High",
            description: "Block on high and critical findings",
          },
          {
            value: "medium",
            label: "Medium",
            description: "Block on medium, high, critical",
          },
          { value: "low", label: "Low", description: "Block on any finding" },
        ];
        const selected = await askMultiSelect(
          "Fail on which severity levels?",
          failOnOptions,
          ["critical", "high"],
        );
        config.preCommit.failOn = selected.map((s) => s.value);
      }
    } else {
      config.preCommit.peridermScan = false;
      config.preCommit.failOn = ["critical", "high"];
    }

    if (hasLint) {
      config.preCommit.lint = await askYesNo("Run lint (npm run lint)?", true);
    } else {
      config.preCommit.lint = false;
      info("No lint script found in package.json, skipping");
    }

    if (hasTypecheck) {
      config.preCommit.typecheck = await askYesNo(
        "Run typecheck (npm run typecheck)?",
        true,
      );
    } else {
      config.preCommit.typecheck = false;
      info("No typecheck script found in package.json, skipping");
    }

    if (hasTest) {
      const testOptions = [
        {
          value: "unit",
          label: "Unit tests",
          description: "Fast unit tests only",
        },
        {
          value: "integration",
          label: "Integration tests",
          description: "Slower integration tests",
        },
        {
          value: "all",
          label: "All tests",
          description: "Run full test suite",
        },
      ];
      const selected = await askMultiSelect(
        "Which tests to run on pre-commit?",
        testOptions,
        ["unit"],
      );
      config.preCommit.tests = selected.map((s) => s.value);
    } else {
      config.preCommit.tests = [];
      info("No test scripts found in package.json, skipping");
    }

    config.preCommit.timeout = parseInt(
      await ask("Pre-commit timeout (ms)", "60000"),
    );
  }

  // Pre-push questions
  section("Pre-push Hook (runs on every git push)");

  config.prePush.enabled = await askYesNo("Enable pre-push hook?", true);

  if (config.prePush.enabled) {
    if (hasPeriderm) {
      config.prePush.peridermScan = await askYesNo(
        "Run full Periderm scan?",
        true,
      );
      config.prePush.peridermReview = await askYesNo(
        "Run Periderm deep review (--deep)?",
        true,
      );
      if (config.prePush.peridermScan) {
        const failOnOptions = [
          {
            value: "critical",
            label: "Critical",
            description: "Block on critical findings only",
          },
          {
            value: "high",
            label: "High",
            description: "Block on high and critical findings",
          },
          {
            value: "medium",
            label: "Medium",
            description: "Block on medium, high, critical",
          },
          { value: "low", label: "Low", description: "Block on any finding" },
        ];
        const selected = await askMultiSelect(
          "Fail on which severity levels?",
          failOnOptions,
          ["critical", "high"],
        );
        config.prePush.failOn = selected.map((s) => s.value);
      }
    } else {
      config.prePush.peridermScan = false;
      config.prePush.peridermReview = false;
      config.prePush.failOn = ["critical", "high"];
    }

    if (hasBuild) {
      config.prePush.build = await askYesNo("Run build (npm run build)?", true);
    } else {
      config.prePush.build = false;
      info("No build script found in package.json, skipping");
    }

    if (hasTest) {
      const testOptions = [
        {
          value: "unit",
          label: "Unit tests",
          description: "Fast unit tests only",
        },
        {
          value: "integration",
          label: "Integration tests",
          description: "Slower integration tests",
        },
        {
          value: "all",
          label: "All tests",
          description: "Run full test suite",
        },
      ];
      const selected = await askMultiSelect(
        "Which tests to run on pre-push?",
        testOptions,
        ["all"],
      );
      config.prePush.tests = selected.map((s) => s.value);
    } else {
      config.prePush.tests = [];
      info("No test scripts found in package.json, skipping");
    }

    config.prePush.timeout = parseInt(
      await ask("Pre-push timeout (ms)", "300000"),
    );
  }

  // Commit-msg questions
  section("Commit Message Hook (validates every commit message)");

  config.commitMsg.enabled = await askYesNo(
    "Enable commit-msg validation?",
    true,
  );

  if (config.commitMsg.enabled) {
    config.commitMsg.requireConventional = await askYesNo(
      "Enforce conventional commit format?",
      true,
    );
    config.commitMsg.requireSecurityFooter = await askYesNo(
      "Require security footer for security-related commits?",
      true,
    );
    if (config.commitMsg.requireSecurityFooter) {
      const keysInput = await ask(
        "Security footer keys (comma-separated)",
        "Security,CVE,GHSA,Periderm",
      );
      config.commitMsg.securityFooterKeys = keysInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    config.commitMsg.maxLength = parseInt(
      await ask("Max subject line length", "72"),
    );
  }

  // Save config
  const configPath = path.join(process.cwd(), "commit-hook.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  success(`\nConfiguration saved to ${configPath}`);

  // Install hooks
  const installNow = await askYesNo("\nInstall hooks now?", true);
  if (installNow) {
    await cmdInstall(config);
  } else {
    info("Run `node commit-hook.js install` to install hooks later");
  }
}

function renderHook(name, config) {
  if (name === "pre-commit") {
    const c = config.preCommit;
    return readTemplate("pre-commit")
      .replace("{{PERIDERM_SCAN}}", c.peridermScan ? "true" : "false")
      .replace(
        "{{PERIDERM_ARGS}}",
        (c.peridermArgs || ["--staged", "--json"]).join(" "),
      )
      .replace("{{FAIL_ON}}", (c.failOn || ["critical", "high"]).join(","))
      .replace("{{LINT}}", c.lint ? "true" : "false")
      .replace("{{TYPECHECK}}", c.typecheck ? "true" : "false")
      .replace("{{TESTS}}", (c.tests || []).join(","))
      .replace("{{TIMEOUT}}", String(c.timeout || 60000));
  }
  if (name === "pre-push") {
    const c = config.prePush;
    return readTemplate("pre-push")
      .replace("{{PERIDERM_SCAN}}", c.peridermScan ? "true" : "false")
      .replace("{{PERIDERM_REVIEW}}", c.peridermReview ? "true" : "false")
      .replace("{{PERIDERM_ARGS}}", (c.peridermArgs || ["--json"]).join(" "))
      .replace("{{FAIL_ON}}", (c.failOn || ["critical", "high"]).join(","))
      .replace("{{TESTS}}", (c.tests || []).join(","))
      .replace("{{BUILD}}", c.build ? "true" : "false")
      .replace("{{TIMEOUT}}", String(c.timeout || 300000));
  }
  if (name === "commit-msg") {
    const c = config.commitMsg;
    return readTemplate("commit-msg")
      .replace(
        "{{REQUIRE_CONVENTIONAL}}",
        c.requireConventional ? "true" : "false",
      )
      .replace(
        "{{REQUIRE_SECURITY_FOOTER}}",
        c.requireSecurityFooter ? "true" : "false",
      )
      .replace(
        "{{SECURITY_KEYS}}",
        (c.securityFooterKeys || ["Security", "CVE", "GHSA", "Periderm"]).join(
          "|",
        ),
      )
      .replace("{{MAX_LENGTH}}", String(c.maxLength || 72));
  }
  throw new Error(`Unknown hook: ${name}`);
}

async function cmdInstall(configOverride = null) {
  section("Installing Git Hooks");

  if (!fs.existsSync(path.join(process.cwd(), ".git"))) {
    error("Not a Git repository");
    process.exit(1);
  }

  const config = configOverride || loadConfig();

  // Check periderm CLI
  const ver = spawnSync("periderm", ["--version"], { encoding: "utf8" });
  if (ver.status !== 0) {
    warn("periderm-cli not found. Install: npm i -g periderm-cli");
  } else {
    info(`Found Periderm ${ver.stdout.trim()}`);
  }

  if (config.preCommit.enabled) {
    writeHook("pre-commit", renderHook("pre-commit", config));
  }
  if (config.prePush.enabled) {
    writeHook("pre-push", renderHook("pre-push", config));
  }
  if (config.commitMsg.enabled) {
    writeHook("commit-msg", renderHook("commit-msg", config));
  }

  success("\nAll hooks installed!");
  info("Run with --no-verify to skip: git commit --no-verify");
}

function cmdUninstall() {
  section("Uninstalling Git Hooks");

  const hookDir = path.join(process.cwd(), ".git", "hooks");
  if (!fs.existsSync(hookDir)) {
    warn("No .git/hooks directory found");
    return;
  }

  const hooks = ["pre-commit", "pre-push", "commit-msg"];
  for (const hook of hooks) {
    const hookPath = path.join(hookDir, hook);
    if (fs.existsSync(hookPath)) {
      fs.unlinkSync(hookPath);
      success(`Removed ${hook}`);
    }
    const backups = fs
      .readdirSync(hookDir)
      .filter((f) => f.startsWith(`${hook}.backup-`))
      .sort()
      .reverse();
    if (backups.length > 0) {
      fs.copyFileSync(path.join(hookDir, backups[0]), hookPath);
      fs.unlinkSync(path.join(hookDir, backups[0]));
      info(`Restored previous ${hook}`);
    }
  }
  success("Hooks uninstalled");
}

function cmdTest(hookType, extraArg = null) {
  section(`Testing ${hookType} Hook`);

  const config = loadConfig();
  const keyMap = {
    "pre-commit": "preCommit",
    "pre-push": "prePush",
    "commit-msg": "commitMsg",
  };
  const hookConfig = config[keyMap[hookType]];

  if (!hookConfig || !hookConfig.enabled) {
    warn(`${hookType} is disabled in config`);
    return;
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "commit-hook-test-"));
  try {
    const tmpHook = path.join(tmpDir, hookType);
    fs.writeFileSync(tmpHook, renderHook(hookType, config), { mode: 0o755 });

    const shArgs = [tmpHook];
    if (hookType === "commit-msg") {
      const msgFile = path.join(tmpDir, "COMMIT_EDITMSG");
      fs.writeFileSync(
        msgFile,
        extraArg || "feat(core): test commit message\n",
      );
      shArgs.push(msgFile);
    }

    const result = spawnSync("sh", shArgs, {
      cwd: process.cwd(),
      stdio: "inherit",
      timeout: hookConfig.timeout || 60000,
    });

    process.exit(result.status ?? 1);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function cmdStatus() {
  section("Hook Status");

  const hooks = ["pre-commit", "pre-push", "commit-msg"];
  for (const hook of hooks) {
    const hookPath = path.join(process.cwd(), ".git", "hooks", hook);
    if (fs.existsSync(hookPath)) {
      const content = fs.readFileSync(hookPath, "utf8");
      const lines = content
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("#")).length;
      success(`${hook}: installed (${lines} lines)`);
    } else {
      warn(`${hook}: not installed`);
    }
  }

  const configPath = path.join(process.cwd(), "commit-hook.json");
  if (fs.existsSync(configPath)) {
    info(`\nConfig: ${configPath}`);
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    console.log(JSON.stringify(config, null, 2));
  } else {
    warn("No config file found (using defaults)");
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  return args[0] || "help";
}

function showHelp() {
  console.log(`
${COLORS.bold}Commit Hook${COLORS.reset}

Usage:
  node commit-hook.js <command>

Commands:
  setup             Interactive setup - grills you for preferences
  install           Install pre-commit, pre-push, commit-msg hooks
  uninstall         Remove hooks and restore backups
  test-pre-commit   Test pre-commit hook manually
  test-pre-push     Test pre-push hook manually
  status            Show hook installation status and config
  help              Show this help

Config:
  Create commit-hook.json to customize behavior, or run 'setup'.

Examples:
  node commit-hook.js setup        # Interactive configuration
  node commit-hook.js install      # Install with current config
  node commit-hook.js status       # Check what's installed
`);
}

async function main() {
  const cmd = parseArgs();
  switch (cmd) {
    case "setup":
      await cmdSetup();
      break;
    case "install":
      await cmdInstall();
      break;
    case "uninstall":
      cmdUninstall();
      break;
    case "test-pre-commit":
      cmdTest("pre-commit");
      break;
    case "test-pre-push":
      cmdTest("pre-push");
      break;
    case "test-commit-msg":
      cmdTest("commit-msg", process.argv[3]);
      break;
    case "status":
      cmdStatus();
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

if (require.main === module) {
  main();
}

module.exports = {
  loadConfig,
  renderHook,
  cmdInstall,
  cmdUninstall,
  cmdStatus,
};
