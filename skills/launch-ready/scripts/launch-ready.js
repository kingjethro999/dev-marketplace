#!/usr/bin/env node

/**
 * Launch Ready - Pre-launch verification using Periderm CLI
 * Runs: npm i -g periderm-cli, periderm --help, periderm --version, periderm scan, periderm review --deep
 * AI takes over from results to decide LAUNCH/BLOCK/LAUNCH_WITH_CONDITIONS
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

function loadConfig() {
  const configPath = path.join(process.cwd(), "launch-ready.json");
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
    const text = output;
    return {
      launchConfidence: parseInt(
        text.match(/Launch Confidence:\s*(\d+)/)?.[1] || "0",
      ),
      realityScore: parseInt(text.match(/Reality Score:\s*(\d+)/)?.[1] || "0"),
      perceivedPerformance: parseInt(
        text.match(/Perceived Performance:\s*(\d+)/)?.[1] || "0",
      ),
      findings: [],
      verdict: text.includes("DO NOT LAUNCH") ? "FAIL" : "PASS",
    };
  }
}

function countSeverity(findings) {
  const c = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings || []) {
    const s = (f.severity || "").toLowerCase();
    if (c.hasOwnProperty(s)) c[s]++;
  }
  return c;
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
  return lines.join("\n");
}

function printAiHandoff(report) {
  log(
    `\n${COLORS.bold}${COLORS.magenta}═══ AI HANDOFF - LAUNCH DECISION REQUIRED ═══${COLORS.reset}\n`,
  );
  const s = report.scan,
    t = report.thresholds,
    f = report.findingCounts;
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
  if (report.decision === "BLOCK")
    console.log("If BLOCK: List blocking issues and remediation steps.");
  else
    console.log(
      "If LAUNCH_WITH_CONDITIONS: List conditions and monitoring plan.",
    );
}

function parseArgs() {
  const args = process.argv.slice(2);
  const o = {
    skipInstall: false,
    minLaunch: null,
    minReality: null,
    minPerf: null,
    format: "text",
    output: null,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const [flag, eqVal] = a.includes("=")
      ? [a.slice(0, a.indexOf("=")), a.slice(a.indexOf("=") + 1)]
      : [a, null];
    const nextVal = () => (eqVal !== null ? eqVal : args[++i]);
    if (flag === "--skip-install") o.skipInstall = true;
    else if (flag === "--min-launch") o.minLaunch = parseInt(nextVal(), 10);
    else if (flag === "--min-reality") o.minReality = parseInt(nextVal(), 10);
    else if (flag === "--min-perf") o.minPerf = parseInt(nextVal(), 10);
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
${COLORS.bold}Launch Ready${COLORS.reset} - Pre-launch with Periderm CLI

Usage:
  node launch-ready.js [options]

Options:
  --skip-install          Skip periderm-cli install
  --min-launch <n>        Min launch confidence (default: 60)
  --min-reality <n>       Min reality score (default: 50)
  --min-perf <n>          Min perceived performance (default: 70)
  --format <fmt>          Output: text, json (default: text)
  --output <file>         Write report to file
  --help, -h              Show help

Examples:
  node launch-ready.js
  node launch-ready.js --min-launch=70 --min-reality=60
  node launch-ready.js --format=json --output=launch-report.json
`);
}

const config = loadConfig();

async function main() {
  const options = parseArgs();
  if (options.minLaunch !== null)
    config.thresholds.minLaunchConfidence = options.minLaunch;
  if (options.minReality !== null)
    config.thresholds.minRealityScore = options.minReality;
  if (options.minPerf !== null)
    config.thresholds.minPerceivedPerformance = options.minPerf;

  section("LAUNCH READY - Pre-launch Verification (Periderm CLI)");

  const results = {
    peridermInstall: { passed: true },
    buildCheck: { passed: true, output: "" },
    testCheck: { passed: true, output: "" },
    scanResult: {
      passed: true,
      launchConfidence: 0,
      realityScore: 0,
      perceivedPerformance: 0,
      verdict: "UNKNOWN",
      findings: [],
    },
    reviewResult: { passed: true, summary: "Not run" },
  };

  // 1. Install periderm-cli
  if (config.checks.peridermInstall && !options.skipInstall) {
    section("1/7 Install Periderm CLI");
    const r = runCmd("npm", ["i", "-g", "periderm-cli@latest"], {
      timeout: 120000,
    });
    results.peridermInstall.passed = r.status === 0;
    if (!results.peridermInstall.passed) {
      error("Install failed");
      console.error(r.stderr);
    } else success("Periderm CLI installed");
  } else {
    info("Skipping periderm-cli install");
  }

  // 2. Verify CLI
  section("2/7 Verify Periderm CLI");
  const help = runCmd("periderm", ["--help"]);
  if (help.status !== 0) {
    error("Periderm not working");
    results.peridermInstall.passed = false;
  } else success("Periderm CLI responsive");
  const ver = runCmd("periderm", ["--version"]);
  if (ver.status === 0) info(`Version: ${ver.stdout.trim()}`);

  // 3. Auth status
  section("3/7 Check Authentication");
  const auth = runCmd("periderm", ["auth", "status"]);
  if (auth.status === 0) {
    success("Authenticated");
    console.log(auth.stdout);
  } else warn("Not authenticated (set PERIDERM_API_KEY for full scans)");

  // 4. Build
  if (config.checks.buildVerification && config.buildCommand) {
    section("4/7 Build Verification");
    const cmd = config.buildCommand.split(" ");
    const r = runCmd(cmd[0], cmd.slice(1), { timeout: 180000 });
    results.buildCheck.passed = r.status === 0;
    results.buildCheck.output = r.stdout.slice(-2000);
    if (results.buildCheck.passed) success("Build passed");
    else {
      error("Build failed");
      console.error(r.stderr);
    }
  }

  // 5. Tests
  if (config.checks.testSuite && config.testCommand) {
    section("5/7 Test Suite");
    const cmd = config.testCommand.split(" ");
    const r = runCmd(cmd[0], cmd.slice(1), { timeout: 300000 });
    results.testCheck.passed = r.status === 0;
    results.testCheck.output = r.stdout.slice(-2000);
    if (results.testCheck.passed) success("Tests passed");
    else {
      error("Tests failed");
      console.error(r.stderr);
    }
  }

  // 6. Periderm Scan
  if (config.checks.peridermScan) {
    section("6/7 Periderm Security & Quality Scan");
    const r = runCmd("periderm", ["scan", "--json"], { timeout: 300000 });
    results.scanResult = parseScanOutput(r.stdout);
    results.scanResult.passed = r.status === 0 || r.status === 1;
    console.log(r.stdout);
    const fc = countSeverity(results.scanResult.findings);
    log(
      `Findings: Critical=${fc.critical}, High=${fc.high}, Medium=${fc.medium}, Low=${fc.low}`,
    );
  }

  // 7. Periderm Deep Review
  if (config.checks.peridermReview) {
    section("7/7 Periderm Deep AI Review");
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
    console.log(r.stdout);
  }

  // Generate Report
  const fc = countSeverity(results.scanResult.findings);
  const checks = [
    {
      name: "Periderm Install",
      passed: results.peridermInstall.passed,
      required: true,
    },
    {
      name: "Build Verification",
      passed: results.buildCheck.passed,
      required: config.checks.buildVerification,
    },
    {
      name: "Test Suite",
      passed: results.testCheck.passed,
      required: config.checks.testSuite,
    },
    {
      name: "Periderm Scan",
      passed: results.scanResult.passed,
      required: true,
    },
    {
      name: "Periderm Deep Review",
      passed: results.reviewResult.passed,
      required: true,
    },
    {
      name: "Launch Confidence",
      passed:
        results.scanResult.launchConfidence >=
        config.thresholds.minLaunchConfidence,
      required: true,
    },
    {
      name: "Reality Score",
      passed:
        results.scanResult.realityScore >= config.thresholds.minRealityScore,
      required: true,
    },
    {
      name: "Perceived Performance",
      passed:
        results.scanResult.perceivedPerformance >=
        config.thresholds.minPerceivedPerformance,
      required: true,
    },
    {
      name: "Critical Findings",
      passed: fc.critical <= config.thresholds.maxCriticalFindings,
      required: true,
    },
    {
      name: "High Findings",
      passed: fc.high <= config.thresholds.maxHighFindings,
      required: true,
    },
    {
      name: "Medium Findings",
      passed: fc.medium <= config.thresholds.maxMediumFindings,
      required: true,
    },
  ];

  const required = checks.filter((c) => c.required);
  const passed = required.filter((c) => c.passed).length;
  const decision = passed === required.length ? "LAUNCH" : "BLOCK";

  const report = {
    timestamp: new Date().toISOString(),
    decision,
    summary: `${passed}/${required.length} required checks passed`,
    thresholds: config.thresholds,
    findingCounts: fc,
    scan: {
      launchConfidence: results.scanResult.launchConfidence,
      realityScore: results.scanResult.realityScore,
      perceivedPerformance: results.scanResult.perceivedPerformance,
      verdict: results.scanResult.verdict,
    },
    review: results.reviewResult.summary,
    checks,
  };

  // Output
  if (options.format === "json") {
    console.log(JSON.stringify(report, null, 2));
  } else {
    log(
      `\n${COLORS.bold}${COLORS.cyan}═══ LAUNCH READINESS REPORT ═══${COLORS.reset}`,
    );
    log(`Time: ${report.timestamp}`);
    log(
      `Decision: ${decision === "LAUNCH" ? COLORS.green + "LAUNCH ✓" : COLORS.red + "BLOCK ✗"}${COLORS.reset}`,
    );
    log(`Summary: ${report.summary}\n`);
    log(`${COLORS.bold}Thresholds:${COLORS.reset}`);
    log(
      `  Launch Confidence:     ${report.scan.launchConfidence}/100 (min: ${report.thresholds.minLaunchConfidence}) ${report.scan.launchConfidence >= report.thresholds.minLaunchConfidence ? COLORS.green + "✓" : COLORS.red + "✗"}${COLORS.reset}`,
    );
    log(
      `  Reality Score:         ${report.scan.realityScore}/100 (min: ${report.thresholds.minRealityScore}) ${report.scan.realityScore >= report.thresholds.minRealityScore ? COLORS.green + "✓" : COLORS.red + "✗"}${COLORS.reset}`,
    );
    log(
      `  Perceived Performance: ${report.scan.perceivedPerformance}/100 (min: ${report.thresholds.minPerceivedPerformance}) ${report.scan.perceivedPerformance >= report.thresholds.minPerceivedPerformance ? COLORS.green + "✓" : COLORS.red + "✗"}${COLORS.reset}`,
    );
    log(`\n${COLORS.bold}Findings:${COLORS.reset}`);
    log(
      `  Critical: ${fc.critical} (max: ${config.thresholds.maxCriticalFindings}) ${fc.critical <= config.thresholds.maxCriticalFindings ? COLORS.green + "✓" : COLORS.red + "✗"}${COLORS.reset}`,
    );
    log(
      `  High:     ${fc.high} (max: ${config.thresholds.maxHighFindings}) ${fc.high <= config.thresholds.maxHighFindings ? COLORS.green + "✓" : COLORS.red + "✗"}${COLORS.reset}`,
    );
    log(
      `  Medium:   ${fc.medium} (max: ${config.thresholds.maxMediumFindings}) ${fc.medium <= config.thresholds.maxMediumFindings ? COLORS.green + "✓" : COLORS.red + "✗"}${COLORS.reset}`,
    );
    log(`\n${COLORS.bold}Checks:${COLORS.reset}`);
    for (const c of checks) {
      const icon = c.passed ? COLORS.green + "✓" : COLORS.red + "✗";
      log(
        `  ${icon}${COLORS.reset} ${c.name}${c.required ? "" : COLORS.dim + " (optional)" + COLORS.reset}`,
      );
    }
    if (config.aiHandoff) printAiHandoff(report);
  }

  // Write files
  if (options.output) {
    fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
    success(`Report written to ${options.output}`);
  }
  fs.writeFileSync("LAUNCH_CHECKLIST.md", generateChecklist(report));
  success("Checklist written to LAUNCH_CHECKLIST.md");

  process.exit(decision === "LAUNCH" ? 0 : 1);
}

main().catch((e) => {
  error(`Error: ${e.message}`);
  console.error(e.stack);
  process.exit(2);
});
