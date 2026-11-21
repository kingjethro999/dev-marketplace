#!/usr/bin/env node

/**
 * Leak Spots - Secret & high-entropy credential scanner for Git history and working tree
 * Runs built-in pattern + entropy detection alongside Periderm CLI when available.
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

function runPeriderm(args, cwd = process.cwd()) {
  return spawnSync("periderm", args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8",
    env: process.env,
    maxBuffer: 1024 * 1024 * 20,
    timeout: 300000,
  });
}

function loadConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, "leak-spots.json");
  const defaults = {
    scan: {
      args: ["--json"],
      failOn: ["critical", "high"],
      entropyThreshold: 4.5,
    },
    review: { deep: true },
    allowList: ["EXAMPLE_KEY", "test-key-123", "placeholder", "dummy"],
    ignorePaths: [
      "*.lock",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "dist/",
      "build/",
      "node_modules/",
      ".git/",
    ],
    outputFormat: "text",
  };

  if (!fs.existsSync(configPath)) return defaults;

  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return {
      ...defaults,
      ...parsed,
      scan: { ...defaults.scan, ...(parsed.scan || {}) },
      review: { ...defaults.review, ...(parsed.review || {}) },
    };
  } catch (e) {
    warn(`Failed to parse leak-spots.json: ${e.message}. Using defaults.`);
    return defaults;
  }
}

function shannonEntropy(str) {
  if (!str || str.length === 0) return 0;
  const freq = new Map();
  for (const ch of str) {
    freq.set(ch, (freq.get(ch) || 0) + 1);
  }
  let entropy = 0;
  const len = str.length;
  for (const count of freq.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function redactSecret(secret) {
  const s = String(secret || "");
  if (s.length <= 8) return "****";
  const prefixLen = Math.min(4, Math.floor(s.length / 4));
  const suffixLen = Math.min(4, Math.floor(s.length / 4));
  return `${s.slice(0, prefixLen)}****...${s.slice(-suffixLen)}`;
}

function isIgnoredPath(relPath, ignorePaths = []) {
  const norm = relPath.replace(/\\/g, "/").replace(/^\.\//, "");
  for (const pattern of ignorePaths) {
    const p = String(pattern).trim();
    if (!p) continue;
    if (p.endsWith("/")) {
      const dir = p.slice(0, -1);
      if (
        norm === dir ||
        norm.startsWith(`${dir}/`) ||
        norm.includes(`/${dir}/`)
      ) {
        return true;
      }
    } else if (p.startsWith("*.")) {
      const ext = p.slice(1);
      if (norm.endsWith(ext)) return true;
    } else if (norm === p || norm.endsWith(`/${p}`)) {
      return true;
    }
  }
  return false;
}

const SECRET_PATTERNS = [
  {
    type: "aws-access-key",
    severity: "critical",
    regex: /\b((?:AKIA|ASIA)[0-9A-Z]{16})\b/g,
  },
  {
    type: "github-token",
    severity: "critical",
    regex:
      /\b((?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{22,})\b/g,
  },
  {
    type: "stripe-live-key",
    severity: "critical",
    regex: /\b(sk_live_[0-9a-zA-Z]{20,})\b/g,
  },
  {
    type: "slack-token",
    severity: "high",
    regex: /\b(xox[baprs]-[0-9A-Za-z-]{10,})\b/g,
  },
  {
    type: "google-api-key",
    severity: "high",
    regex: /\b(AIza[0-9A-Za-z_-]{35})\b/g,
  },
  {
    type: "private-key-block",
    severity: "critical",
    regex: /(-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----)/g,
  },
];

const GENERIC_ASSIGN_REGEX =
  /\b(?:api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key|client[_-]?secret|password|passwd)\b\s*[:=]\s*["'`]([A-Za-z0-9+/=_-]{16,})["'`]/gi;

function scanLineForSecrets(line, meta, config) {
  const findings = [];
  const threshold = config.scan?.entropyThreshold ?? 4.5;
  const allowList = config.allowList || [];

  for (const pat of SECRET_PATTERNS) {
    pat.regex.lastIndex = 0;
    let m;
    while ((m = pat.regex.exec(line)) !== null) {
      const raw = m[1] || m[0];
      if (isAllowed(raw, allowList)) continue;
      findings.push({
        ...meta,
        type: pat.type,
        severity: pat.severity,
        match: redactSecret(raw),
      });
    }
  }

  if (findings.length === 0) {
    GENERIC_ASSIGN_REGEX.lastIndex = 0;
    let m;
    while ((m = GENERIC_ASSIGN_REGEX.exec(line)) !== null) {
      const candidate = m[1];
      if (isAllowed(candidate, allowList)) continue;
      if (shannonEntropy(candidate) >= threshold) {
        findings.push({
          ...meta,
          type: "high-entropy-secret",
          severity: "high",
          match: redactSecret(candidate),
          entropy: Number(shannonEntropy(candidate).toFixed(2)),
        });
      }
    }
  }

  return findings;
}

function scanWorkingTree(cwd, config) {
  const findings = [];
  const ignorePaths = config.ignorePaths || [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(cwd, full);
      if (isIgnoredPath(rel + (entry.isDirectory() ? "/" : ""), ignorePaths)) {
        continue;
      }
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const stat = fs.statSync(full);
        if (stat.size > 2 * 1024 * 1024) continue;
        let buf;
        try {
          buf = fs.readFileSync(full);
        } catch {
          continue;
        }
        // Skip binary files
        if (buf.includes(0)) continue;
        const lines = buf.toString("utf8").split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          findings.push(
            ...scanLineForSecrets(lines[i], { file: rel, line: i + 1 }, config),
          );
        }
      }
    }
  }

  walk(cwd);
  return findings;
}

function scanGitHistory(cwd, config, options = {}) {
  const gitArgs = ["log", "-p", "--no-color", "--format=COMMIT:%H"];
  if (options.since && options.until) {
    gitArgs.push(`${options.since}..${options.until}`);
  } else if (options.since) {
    gitArgs.push(`${options.since}..HEAD`);
  } else if (options.until) {
    gitArgs.push(options.until);
  } else {
    gitArgs.push("--all");
  }

  const res = spawnSync("git", gitArgs, {
    cwd,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 50,
  });

  if (res.status !== 0 || !res.stdout) return [];

  const ignorePaths = config.ignorePaths || [];
  const findings = [];
  let currentCommit = null;
  let currentFile = null;
  let lineNum = 0;

  for (const rawLine of res.stdout.split(/\r?\n/)) {
    if (rawLine.startsWith("COMMIT:")) {
      currentCommit = rawLine.slice("COMMIT:".length).trim();
      currentFile = null;
      continue;
    }
    if (rawLine.startsWith("+++ b/")) {
      currentFile = rawLine.slice("+++ b/".length).trim();
      continue;
    }
    if (rawLine.startsWith("@@ ")) {
      const m = rawLine.match(/\+(\d+)/);
      lineNum = m ? parseInt(m[1], 10) : 1;
      continue;
    }
    if (!currentFile || isIgnoredPath(currentFile, ignorePaths)) continue;

    if (rawLine.startsWith("+") && !rawLine.startsWith("+++")) {
      const content = rawLine.slice(1);
      findings.push(
        ...scanLineForSecrets(
          content,
          { file: currentFile, line: lineNum, commit: currentCommit },
          config,
        ),
      );
      lineNum++;
    } else if (!rawLine.startsWith("-")) {
      lineNum++;
    }
  }

  return findings;
}

function parseScanOutput(output) {
  try {
    return JSON.parse(output);
  } catch {
    const text = output || "";
    const launchMatch = text.match(/Launch Confidence:\s*(\d+)/);
    const realityMatch = text.match(/Reality Score:\s*(\d+)/);
    const perfMatch = text.match(/Perceived Performance:\s*(\d+)/);
    return {
      launchConfidence: launchMatch ? parseInt(launchMatch[1], 10) : 0,
      realityScore: realityMatch ? parseInt(realityMatch[1], 10) : 0,
      perceivedPerformance: perfMatch ? parseInt(perfMatch[1], 10) : 0,
      findings: [],
      verdict: text.includes("DO NOT LAUNCH") ? "FAIL" : "PASS",
    };
  }
}

function normalizeSeverity(sev) {
  const s = String(sev || "low").toLowerCase();
  if (["critical", "high", "medium", "low"].includes(s)) return s;
  if (s === "error") return "high";
  if (s === "warning" || s === "warn") return "medium";
  return "low";
}

function countBySeverity(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings || []) {
    counts[normalizeSeverity(f.severity)]++;
  }
  return counts;
}

function isAllowed(match, allowList) {
  const lower = String(match || "").toLowerCase();
  return (allowList || []).some((a) => lower.includes(String(a).toLowerCase()));
}

function filterFindings(findings, allowList) {
  return (findings || [])
    .filter((f) => !isAllowed(f.match || f.secret || "", allowList))
    .map((f) => ({
      ...f,
      severity: normalizeSeverity(f.severity),
      match: f.match
        ? f.match.includes("****")
          ? f.match
          : redactSecret(f.match)
        : f.secret
          ? redactSecret(f.secret)
          : "redacted",
    }));
}

function printFindings(findings, format) {
  if (format === "json") return;

  if (!findings || findings.length === 0) {
    success("No secrets found!");
    return;
  }

  const counts = countBySeverity(findings);
  log(`\n${COLORS.bold}Findings Summary:${COLORS.reset}`);
  log(
    `  Critical: ${counts.critical}  High: ${counts.high}  Medium: ${counts.medium}  Low: ${counts.low}`,
  );

  const bySeverity = { critical: [], high: [], medium: [], low: [] };
  for (const f of findings) {
    bySeverity[normalizeSeverity(f.severity)].push(f);
  }

  for (const severity of ["critical", "high", "medium", "low"]) {
    const items = bySeverity[severity];
    if (!items.length) continue;
    const color =
      severity === "critical"
        ? "red"
        : severity === "high"
          ? "magenta"
          : severity === "medium"
            ? "yellow"
            : "blue";
    log(
      `\n${COLORS.bold}${COLORS[color]}${severity.toUpperCase()} (${items.length})${COLORS.reset}`,
    );
    for (const f of items.slice(0, 10)) {
      const commitTag = f.commit ? ` @${f.commit.slice(0, 7)}` : "";
      log(
        `  ${COLORS.cyan}${f.file || "unknown"}${COLORS.reset}:${f.line || "?"}${commitTag}  [${f.type || f.severity}]`,
      );
      log(`    ${COLORS.yellow}${f.match || "redacted"}${COLORS.reset}`);
    }
    if (items.length > 10) log(`  ... and ${items.length - 10} more`);
  }
}

function aiAnalysis(scanResult, reviewResult, config) {
  const findings = filterFindings(scanResult.findings, config.allowList);
  const counts = countBySeverity(findings);

  log(
    `\n${COLORS.bold}${COLORS.magenta}═══ AI ANALYSIS & REMEDIATION ═══${COLORS.reset}\n`,
  );

  if (findings.length === 0) {
    success("No leaks detected after allowlist filtering.");
    return { decision: "CLEAN", actions: [], findings: [], counts };
  }

  log(`Scan Results:`);
  log(
    `  Total Findings: ${findings.length} (Critical: ${counts.critical}, High: ${counts.high}, Medium: ${counts.medium}, Low: ${counts.low})`,
  );

  if (reviewResult.rawOutput) {
    log(`\nDeep Review: ${reviewResult.summary || "Completed"}`);
  }

  const failSeverities = new Set(
    (config.scan?.failOn || ["critical", "high"]).map((s) => s.toLowerCase()),
  );
  const blocking = Object.entries(counts).some(
    ([sev, count]) => failSeverities.has(sev) && count > 0,
  );
  const decision = blocking ? "BLOCK" : "REVIEW_REQUIRED";

  log(
    `\n${COLORS.bold}DECISION: ${decision === "BLOCK" ? COLORS.red + "BLOCK" : COLORS.yellow + "REVIEW_REQUIRED"}${COLORS.reset}`,
  );

  const actions = blocking
    ? [
        "1. ROTATE all compromised credentials immediately",
        "2. REMOVE from Git history using git filter-repo or BFG Repo-Cleaner",
        "3. FORCE PUSH cleaned history",
        "4. RE-RUN scan to verify clean",
      ]
    : [
        "1. Review each finding for false positives",
        "2. Add legitimate patterns to allowList in leak-spots.json",
        "3. Rotate any real credentials found",
      ];

  for (const a of actions) log(`  ${a}`);

  return { decision, actions, findings, counts };
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    command: "scan",
    workingTree: false,
    offline: false,
    since: null,
    until: null,
    format: "text",
    failOnLeak: false,
    output: null,
  };

  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    const eqIdx = raw.indexOf("=");
    const arg = eqIdx !== -1 ? raw.slice(0, eqIdx) : raw;
    const eqVal = eqIdx !== -1 ? raw.slice(eqIdx + 1) : null;
    const nextVal = () => (eqVal !== null ? eqVal : argv[++i]);

    if (arg === "scan" || arg === "audit") options.command = arg;
    else if (arg === "--working-tree") options.workingTree = true;
    else if (arg === "--offline") options.offline = true;
    else if (arg === "--since") options.since = nextVal();
    else if (arg === "--until") options.until = nextVal();
    else if (arg === "--format") options.format = nextVal();
    else if (arg === "--fail-on-leak") options.failOnLeak = true;
    else if (arg === "--output") options.output = nextVal();
    else if (arg === "--help" || arg === "-h") {
      showHelp();
      process.exit(0);
    }
  }
  return options;
}

function showHelp() {
  console.log(`
${COLORS.bold}Leak Spots${COLORS.reset} - Secret scanner for Git history & working tree

Usage:
  node leak-spots.js <command> [options]

Commands:
  scan                    Scan for secrets (default)
  audit                   Full audit with AI remediation summary

Options:
  --working-tree          Scan only working tree (faster)
  --offline               Use built-in scanner only (skip Periderm CLI)
  --since <ref>           Scan from commit/branch
  --until <ref>           Scan until commit/branch
  --format <fmt>          Output: text, json (default: text)
  --fail-on-leak          Exit 1 if any leaks found
  --output <file>         Write JSON results to file
  --help, -h              Show help

Config:
  Create leak-spots.json to customize allowList, ignorePaths, entropyThreshold.

Examples:
  node leak-spots.js scan
  node leak-spots.js scan --working-tree --fail-on-leak
  node leak-spots.js scan --since=main --format=json --output=leaks.json
  node leak-spots.js scan --offline --format=json
  node leak-spots.js audit
`);
}

async function main() {
  const options = parseArgs();
  JSON_MODE = options.format === "json";
  const cwd = process.cwd();
  const config = loadConfig(cwd);

  const isGitRepo = fs.existsSync(path.join(cwd, ".git"));
  if (!isGitRepo && !options.workingTree) {
    error("Not a Git repository (pass --working-tree to scan files directly)");
    process.exit(1);
  }

  const builtinFindings = options.workingTree
    ? scanWorkingTree(cwd, config)
    : scanGitHistory(cwd, config, options);

  let peridermFindings = [];
  let peridermMeta = {
    launchConfidence: 100,
    realityScore: 100,
    perceivedPerformance: 100,
  };
  let reviewResult = { summary: "Not run", rawOutput: "" };

  if (!options.offline) {
    const versionCheck = runPeriderm(["--version"], cwd);
    if (versionCheck.status === 0) {
      info(`Using Periderm ${versionCheck.stdout.trim()}`);
      section("Periderm Secret Scan");
      const scanArgs = [...(config.scan?.args || ["--json"])];
      const scanRes = runPeriderm(["scan", ...scanArgs], cwd);
      if (scanRes.status === 0 || scanRes.status === 1) {
        const parsed = parseScanOutput(scanRes.stdout);
        peridermMeta = parsed;
        peridermFindings = parsed.findings || [];
      }

      if (config.review?.deep && options.command === "audit") {
        section("Periderm Deep AI Review");
        const review = runPeriderm(["review", "--deep", "--json"], cwd);
        reviewResult.rawOutput = review.stdout;
        try {
          const data = JSON.parse(review.stdout);
          reviewResult.summary = data.summary || "Review completed";
        } catch {
          reviewResult.summary = "Review completed (text output)";
        }
      }
    } else {
      warn(
        "periderm-cli not found; using built-in secret & entropy scanner only",
      );
    }
  }

  const combined = {
    ...peridermMeta,
    findings: [...builtinFindings, ...peridermFindings],
  };

  const analysis = aiAnalysis(combined, reviewResult, config);
  printFindings(analysis.findings, options.format);

  const outputPayload = {
    timestamp: new Date().toISOString(),
    mode: options.workingTree ? "working-tree" : "git-history",
    offline: options.offline,
    decision: analysis.decision,
    counts: analysis.counts,
    findings: analysis.findings,
    actions: analysis.actions,
  };

  if (options.output) {
    fs.writeFileSync(options.output, JSON.stringify(outputPayload, null, 2));
    success(`Results written to ${options.output}`);
  }
  if (options.format === "json") {
    console.log(JSON.stringify(outputPayload, null, 2));
  }

  if (options.failOnLeak && analysis.findings.length > 0) {
    process.exit(1);
  }
  process.exit(analysis.decision === "BLOCK" ? 1 : 0);
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
  shannonEntropy,
  redactSecret,
  isIgnoredPath,
  scanWorkingTree,
  scanGitHistory,
  filterFindings,
  countBySeverity,
  aiAnalysis,
};
