#!/usr/bin/env node

/**
 * Launch Ready - Pre-launch verification using Periderm CLI, build, and test gates
 * Supports --dry-run, --skip-periderm, --skip-install, and clean --format=json output.
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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

function runCmd(cmd, args, opts = {}) {
  const full = `${cmd} ${args.join(" ")}`;
  log(`  ${COLORS.dim}$ ${full}${COLORS.reset}`);
  return spawnSync(cmd, args, {
    stdio: "pipe",
    encoding: "utf8",
    env: { ...process.env, ...opts.env },
    maxBuffer: 1024 * 1024 * 20,
    timeout: opts.timeout || 300000,
  });
}

function loadConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, "launch-ready.json");
  const defaults = {
    thresholds: {
      minLaunchConfidence: 60,
      minRealityScore: 50,
      minPerceivedPerformance: 70,
      maxCriticalFindings: 0,
      maxHighFindings: 0,
      maxMediumFindings: 5,
    },
    checks: {
      peridermInstall: true,
      peridermScan: true,
      peridermReview: true,
      buildVerification: true,
      testSuite: true,
    },
    buildCommand: "npm run build",
    testCommand: "npm test",
    aiHandoff: true,
    outputFormat: "text",
  };

  if (!fs.existsSync(configPath)) return defaults;

  try {
    return deepMerge(defaults, JSON.parse(fs.readFileSync(configPath, "utf8")));
  } catch (e) {
    warn(`Failed to parse launch-ready.json: ${e.message}. Using defaults.`);
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

function parseScanOutput(output) {
  try {
    return JSON.parse(output);
  } catch {
    const text = output || "";
    return {
      launchConfidence: parseInt(
        text.match(/Launch Confidence:\s*(\d+)/)?.[1] || "0",
        10,
      ),
      realityScore: parseInt(
        text.match(/Reality Score:\s*(\d+)/)?.[1] || "0",
        10,
      ),
      perceivedPerformance: parseInt(
        text.match(/Perceived Performance:\s*(\d+)/)?.[1] || "0",
        10,
      ),
      findings: [],
      verdict: text.includes("DO NOT LAUNCH") ? "FAIL" : "PASS",
    };
  }
}

function countSeverity(findings) {
  const c = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings || []) {
    const s = String(f.severity || "").toLowerCase();
    if (Object.prototype.hasOwnProperty.call(c, s)) c[s]++;
  }
  return c;
}

function evaluateLaunchReadiness(results, config, options = {}) {
  const skipPeriderm = Boolean(options.skipPeriderm);
  const fc = countSeverity(results.scanResult?.findings);
  const scanEnabled = !skipPeriderm && Boolean(config.checks.peridermScan);
  const reviewEnabled = !skipPeriderm && Boolean(config.checks.peridermReview);

  const checks = [
    {
      name: "Build Verification",
      passed: results.buildCheck.passed,
      required: Boolean(config.checks.buildVerification),
    },
    {
      name: "Test Suite",
      passed: results.testCheck.passed,
      required: Boolean(config.checks.testSuite),
    },
  ];

  if (!skipPeriderm) {
    checks.unshift({
      name: "Periderm Install",
      passed: results.peridermInstall.passed,
      required: true,
    });
    checks.push(
      {
        name: "Periderm Scan",
        passed: results.scanResult.passed,
        required: scanEnabled,
      },
      {
        name: "Periderm Deep Review",
        passed: results.reviewResult.passed,
        required: reviewEnabled,
      },
      {
        name: "Launch Confidence",
        passed:
          results.scanResult.launchConfidence >=
          config.thresholds.minLaunchConfidence,
        required: scanEnabled,
      },
      {
        name: "Reality Score",
        passed:
          results.scanResult.realityScore >= config.thresholds.minRealityScore,
        required: scanEnabled,
      },
      {
        name: "Perceived Performance",
        passed:
          results.scanResult.perceivedPerformance >=
          config.thresholds.minPerceivedPerformance,
        required: scanEnabled,
      },
      {
        name: "Critical Findings",
        passed: fc.critical <= config.thresholds.maxCriticalFindings,
        required: scanEnabled,
      },
      {
        name: "High Findings",
        passed: fc.high <= config.thresholds.maxHighFindings,
        required: scanEnabled,
      },
      {
        name: "Medium Findings",
        passed: fc.medium <= config.thresholds.maxMediumFindings,
        required: scanEnabled,
      },
    );
  }

  const required = checks.filter((c) => c.required);
  const passed = required.filter((c) => c.passed).length;
  const decision = passed === required.length ? "LAUNCH" : "BLOCK";

  return {
    timestamp: new Date().toISOString(),
    decision,
    summary: `${passed}/${required.length} required checks passed`,
    thresholds: config.thresholds,
    findingCounts: fc,
    scan: {
      launchConfidence: results.scanResult?.launchConfidence ?? 0,
      realityScore: results.scanResult?.realityScore ?? 0,
      perceivedPerformance: results.scanResult?.perceivedPerformance ?? 0,
      verdict:
        results.scanResult?.verdict ?? (skipPeriderm ? "SKIPPED" : "UNKNOWN"),
    },
    review: results.reviewResult?.summary ?? "Not run",
    checks,
  };
}

function generateChecklist(report) {
  const lines = [
    "# Launch Checklist",
    "",
    `Generated: ${report.timestamp}`,
    `Decision: **${report.decision}**`,
    `Summary: ${report.summary}`,
    "",
    "## Checks",
    "",
  ];
  for (const c of report.checks) {
    lines.push(
      `- [${c.passed ? "x" : " "}] ${c.name}${c.required ? " (required)" : " (optional)"}`,
    );
  }
  lines.push("", "## Thresholds", "");
  lines.push(
    `- Launch Confidence: ${report.scan.launchConfidence}/100 (min: ${report.thresholds.minLaunchConfidence})`,
  );
  lines.push(
    `- Reality Score: ${report.scan.realityScore}/100 (min: ${report.thresholds.minRealityScore})`,
  );
  lines.push(
    `- Perceived Performance: ${report.scan.perceivedPerformance}/100 (min: ${report.thresholds.minPerceivedPerformance})`,
  );
  lines.push("", "## Findings", "");
  lines.push(
    `- Critical: ${report.findingCounts.critical} (max: ${report.thresholds.maxCriticalFindings})`,
  );
  lines.push(
    `- High: ${report.findingCounts.high} (max: ${report.thresholds.maxHighFindings})`,
  );
  lines.push(
    `- Medium: ${report.findingCounts.medium} (max: ${report.thresholds.maxMediumFindings})`,
  );
  return lines.join("\n") + "\n";
}

function printAiHandoff(report) {
  if (JSON_MODE) return;
  log(
    `\n${COLORS.bold}${COLORS.magenta}═══ AI HANDOFF - LAUNCH DECISION REQUIRED ═══${COLORS.reset}\n`,
  );
  const s = report.scan;
  const t = report.thresholds;
  const f = report.findingCounts;
  console.log(`## LAUNCH DECISION REQUIRED\n`);
  console.log(`Periderm Results:`);
  console.log(
    `- Launch Confidence: ${s.launchConfidence}/100 (threshold: ${t.minLaunchConfidence}) ${s.launchConfidence >= t.minLaunchConfidence ? "✓" : "✗"}`,
  );
  console.log(
    `- Reality Score: ${s.realityScore}/100 (threshold: ${t.minRealityScore}) ${s.realityScore >= t.minRealityScore ? "✓" : "✗"}`,
  );
  console.log(
    `- Perceived Performance: ${s.perceivedPerformance}/100 (threshold: ${t.minPerceivedPerformance}) ${s.perceivedPerformance >= t.minPerceivedPerformance ? "✓" : "✗"}`,
  );
  console.log(
    `- Critical Findings: ${f.critical} (max: ${t.maxCriticalFindings}) ${f.critical <= t.maxCriticalFindings ? "✓" : "✗"}`,
  );
  console.log(
    `- High Findings: ${f.high} (max: ${t.maxHighFindings}) ${f.high <= t.maxHighFindings ? "✓" : "✗"}`,
  );
  console.log(
    `- Medium Findings: ${f.medium} (max: ${t.maxMediumFindings}) ${f.medium <= t.maxMediumFindings ? "✓" : "✗"}\n`,
  );
  console.log(`Review Summary:\n- ${report.review}\n`);
  console.log(
    `DECISION: ${report.decision === "LAUNCH" ? "LAUNCH" : "BLOCK"} / LAUNCH_WITH_CONDITIONS\n`,
  );
  if (report.decision === "BLOCK") {
    console.log("If BLOCK: List blocking issues and remediation steps.");
  } else {
    console.log(
      "If LAUNCH_WITH_CONDITIONS: List conditions and monitoring plan.",
    );
  }
}

function parseNumericThreshold(flag, rawVal) {
  const n = Number(rawVal);
  if (!Number.isFinite(n) || n < 0 || n > 100 || rawVal === "") {
    throw new Error(
      `Invalid value for ${flag}: "${rawVal}" (expected integer 0-100)`,
    );
  }
  return Math.round(n);
}

function parseArgs(argv = process.argv.slice(2)) {
  const o = {
    skipInstall: false,
    skipPeriderm: false,
    dryRun: false,
    minLaunch: null,
    minReality: null,
    minPerf: null,
    format: null,
    output: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const [flag, eqVal] = a.includes("=")
      ? [a.slice(0, a.indexOf("=")), a.slice(a.indexOf("=") + 1)]
      : [a, null];
    const nextVal = () => (eqVal !== null ? eqVal : argv[++i]);
    if (flag === "--skip-install") o.skipInstall = true;
    else if (flag === "--skip-periderm") o.skipPeriderm = true;
    else if (flag === "--dry-run") o.dryRun = true;
    else if (flag === "--min-launch")
      o.minLaunch = parseNumericThreshold(flag, nextVal());
    else if (flag === "--min-reality")
      o.minReality = parseNumericThreshold(flag, nextVal());
    else if (flag === "--min-perf")
      o.minPerf = parseNumericThreshold(flag, nextVal());
    else if (flag === "--format") o.format = nextVal();
    else if (flag === "--output") o.output = nextVal();
    else if (flag === "--help" || flag === "-h") {
      showHelp();
      process.exit(0);
    }
  }
  return o;
}

function showHelp() {
  console.log(`
${COLORS.bold}Launch Ready${COLORS.reset} - Pre-launch verification gate

Usage:
  node launch-ready.js [options]

Options:
  --skip-install          Skip periderm-cli global install
  --skip-periderm         Run build & test gates only (offline)
  --dry-run               Preview configured gates & thresholds without executing
  --min-launch <n>        Min launch confidence 0-100 (default: 60)
  --min-reality <n>       Min reality score 0-100 (default: 50)
  --min-perf <n>          Min perceived performance 0-100 (default: 70)
  --format <fmt>          Output: text, json (default: text)
  --output <file>         Write JSON report to file
  --help, -h              Show help

Examples:
  node launch-ready.js
  node launch-ready.js --dry-run --format=json
  node launch-ready.js --skip-periderm --format=json
  node launch-ready.js --min-launch=70 --min-reality=60
  node launch-ready.js --format=json --output=launch-report.json
`);
}

async function main() {
  let options;
  try {
    options = parseArgs();
  } catch (err) {
    error(err.message);
    process.exit(1);
  }

  const config = loadConfig();
  const format = options.format || config.outputFormat || "text";
  JSON_MODE = format === "json";

  if (options.minLaunch !== null)
    config.thresholds.minLaunchConfidence = options.minLaunch;
  if (options.minReality !== null)
    config.thresholds.minRealityScore = options.minReality;
  if (options.minPerf !== null)
    config.thresholds.minPerceivedPerformance = options.minPerf;

  if (options.dryRun) {
    const plan = {
      dryRun: true,
      skipInstall: options.skipInstall,
      skipPeriderm: options.skipPeriderm,
      thresholds: config.thresholds,
      checks: config.checks,
      buildCommand: config.buildCommand,
      testCommand: config.testCommand,
    };
    if (format === "json") {
      console.log(JSON.stringify(plan, null, 2));
    } else {
      section("LAUNCH READY [dry-run]");
      console.log(JSON.stringify(plan, null, 2));
    }
    process.exit(0);
  }

  section("LAUNCH READY - Pre-launch Verification");

  const results = {
    peridermInstall: { passed: true },
    buildCheck: { passed: true, output: "" },
    testCheck: { passed: true, output: "" },
    scanResult: {
      passed: true,
      launchConfidence: 0,
      realityScore: 0,
      perceivedPerformance: 0,
      verdict: options.skipPeriderm ? "SKIPPED" : "UNKNOWN",
      findings: [],
    },
    reviewResult: { passed: true, summary: "Not run" },
  };

  if (!options.skipPeriderm) {
    if (config.checks.peridermInstall && !options.skipInstall) {
      section("1/7 Install Periderm CLI");
      const r = runCmd("npm", ["i", "-g", "periderm-cli@latest"], {
        timeout: 120000,
      });
      results.peridermInstall.passed = r.status === 0;
      if (!results.peridermInstall.passed) {
        error("Install failed");
        if (!JSON_MODE) console.error(r.stderr);
      } else {
        success("Periderm CLI installed");
      }
    } else {
      info("Skipping periderm-cli install");
    }

    section("2/7 Verify Periderm CLI");
    const help = runCmd("periderm", ["--help"]);
    if (help.status !== 0) {
      error("Periderm not working");
      results.peridermInstall.passed = false;
    } else {
      success("Periderm CLI responsive");
    }
    const ver = runCmd("periderm", ["--version"]);
    if (ver.status === 0) info(`Version: ${ver.stdout.trim()}`);

    section("3/7 Check Authentication");
    const auth = runCmd("periderm", ["auth", "status"]);
    if (auth.status === 0) {
      success("Authenticated");
      if (!JSON_MODE) console.log(auth.stdout);
    } else {
      warn("Not authenticated (set PERIDERM_API_KEY for full scans)");
    }
  }

  // Build
  if (config.checks.buildVerification && config.buildCommand) {
    section("Build Verification");
    const cmd = config.buildCommand.trim().split(/\s+/);
    const r = runCmd(cmd[0], cmd.slice(1), { timeout: 180000 });
    results.buildCheck.passed = r.status === 0;
    results.buildCheck.output = (r.stdout || "").slice(-2000);
    if (results.buildCheck.passed) success("Build passed");
    else {
      if (!JSON_MODE) {
        error("Build failed");
        console.error(r.stderr);
      }
    }
  }

  // Tests
  if (config.checks.testSuite && config.testCommand) {
    section("Test Suite");
    const cmd = config.testCommand.trim().split(/\s+/);
    const r = runCmd(cmd[0], cmd.slice(1), { timeout: 300000 });
    results.testCheck.passed = r.status === 0;
    results.testCheck.output = (r.stdout || "").slice(-2000);
    if (results.testCheck.passed) success("Tests passed");
    else {
      if (!JSON_MODE) {
        error("Tests failed");
        console.error(r.stderr);
      }
    }
  }

  if (!options.skipPeriderm && config.checks.peridermScan) {
    section("Periderm Security & Quality Scan");
    const r = runCmd("periderm", ["scan", "--json"], { timeout: 300000 });
    results.scanResult = parseScanOutput(r.stdout);
    results.scanResult.passed = r.status === 0 || r.status === 1;
    if (!JSON_MODE) console.log(r.stdout);
    const fc = countSeverity(results.scanResult.findings);
    log(
      `Findings: Critical=${fc.critical}, High=${fc.high}, Medium=${fc.medium}, Low=${fc.low}`,
    );
  }

  if (!options.skipPeriderm && config.checks.peridermReview) {
    section("Periderm Deep AI Review");
    const r = runCmd("periderm", ["review", "--deep", "--json"], {
      timeout: 300000,
    });
    results.reviewResult.passed = r.status === 0 || r.status === 1;
    try {
      const data = JSON.parse(r.stdout);
      results.reviewResult.summary = data.summary || "Review completed";
    } catch {
      results.reviewResult.summary = "Review completed (text output)";
    }
    if (!JSON_MODE) console.log(r.stdout);
  }

  const report = evaluateLaunchReadiness(results, config, {
    skipPeriderm: options.skipPeriderm,
  });

  if (format === "json") {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const fc = report.findingCounts;
    log(
      `\n${COLORS.bold}${COLORS.cyan}═══ LAUNCH READINESS REPORT ═══${COLORS.reset}`,
    );
    log(`Time: ${report.timestamp}`);
    log(
      `Decision: ${report.decision === "LAUNCH" ? COLORS.green + "LAUNCH ✓" : COLORS.red + "BLOCK ✗"}${COLORS.reset}`,
    );
    log(`Summary: ${report.summary}\n`);
    log(`${COLORS.bold}Checks:${COLORS.reset}`);
    for (const c of report.checks) {
      const icon = c.passed ? COLORS.green + "✓" : COLORS.red + "✗";
      log(
        `  ${icon}${COLORS.reset} ${c.name}${c.required ? "" : COLORS.dim + " (optional)" + COLORS.reset}`,
      );
    }
    if (!options.skipPeriderm) {
      log(`\n${COLORS.bold}Findings:${COLORS.reset}`);
      log(
        `  Critical: ${fc.critical} | High: ${fc.high} | Medium: ${fc.medium}`,
      );
      if (config.aiHandoff) printAiHandoff(report);
    }
  }

  if (options.output) {
    fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
    success(`Report written to ${options.output}`);
  }
  fs.writeFileSync("LAUNCH_CHECKLIST.md", generateChecklist(report));
  success("Checklist written to LAUNCH_CHECKLIST.md");

  process.exit(report.decision === "LAUNCH" ? 0 : 1);
}

if (require.main === module) {
  main().catch((e) => {
    error(`Error: ${e.message}`);
    console.error(e.stack);
    process.exit(2);
  });
}

module.exports = {
  loadConfig,
  parseArgs,
  parseScanOutput,
  countSeverity,
  evaluateLaunchReadiness,
  generateChecklist,
};
