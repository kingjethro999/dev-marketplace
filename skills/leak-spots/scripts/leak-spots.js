#!/usr/bin/env node

/**
 * Leak Spots - Secret scanner using Periderm CLI
 * Runs: periderm scan, periderm review --deep
 * AI analyzes results and provides remediation
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

function log(msg, color = 'reset') {
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

function runPeriderm(args) {
  const result = spawnSync('periderm', args, {
    stdio: 'pipe',
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 1024 * 1024 * 20,
    timeout: 300000
  });
  return result;
}

function loadConfig() {
  const configPath = path.join(process.cwd(), 'leak-spots.json');
  const defaults = {
    scan: { args: ['--json'], failOn: ['critical', 'high'], entropyThreshold: 4.5 },
    review: { deep: true },
    allowList: ['EXAMPLE_KEY', 'test-key-123', 'placeholder', 'dummy'],
    ignorePaths: ['*.lock', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'dist/', 'build/', 'node_modules/', '.git/'],
    outputFormat: 'text'
  };

  if (!fs.existsSync(configPath)) return defaults;

  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
  } catch (e) {
    warn(`Failed to parse leak-spots.json: ${e.message}. Using defaults.`);
    return defaults;
  }
}

function parseScanOutput(output) {
  try {
    return JSON.parse(output);
  } catch {
    const text = output;
    const launchMatch = text.match(/Launch Confidence:\s*(\d+)/);
    const realityMatch = text.match(/Reality Score:\s*(\d+)/);
    const perfMatch = text.match(/Perceived Performance:\s*(\d+)/);
    return {
      launchConfidence: launchMatch ? parseInt(launchMatch[1]) : 0,
      realityScore: realityMatch ? parseInt(realityMatch[1]) : 0,
      perceivedPerformance: perfMatch ? parseInt(perfMatch[1]) : 0,
      findings: [],
      verdict: text.includes('DO NOT LAUNCH') ? 'FAIL' : 'PASS'
    };
  }
}

function countBySeverity(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings || []) {
    const sev = (f.severity || '').toLowerCase();
    if (counts.hasOwnProperty(sev)) counts[sev]++;
  }
  return counts;
}

function isAllowed(match, allowList) {
  const lower = match.toLowerCase();
  return allowList.some(a => lower.includes(a.toLowerCase()));
}

function filterFindings(findings, allowList) {
  return (findings || []).filter(f => !isAllowed(f.match || f.secret || '', allowList));
}

function printFindings(findings, format) {
  if (format === 'json') {
    console.log(JSON.stringify(findings, null, 2));
    return;
  }

  if (!findings || findings.length === 0) {
    success('No secrets found!');
    return;
  }

  const counts = countBySeverity(findings);
  log(`\n${COLORS.bold}Findings Summary:${COLORS.reset}`);
  log(`  Critical: ${counts.critical}  High: ${counts.high}  Medium: ${counts.medium}  Low: ${counts.low}`);

  const bySeverity = { critical: [], high: [], medium: [], low: [] };
  for (const f of findings) {
    bySeverity[f.severity?.toLowerCase() || 'low'].push(f);
  }

  for (const severity of ['critical', 'high', 'medium', 'low']) {
    const items = bySeverity[severity];
    if (!items.length) continue;
    const color = severity === 'critical' ? 'red' : severity === 'high' ? 'magenta' : severity === 'medium' ? 'yellow' : 'blue';
    log(`\n${COLORS.bold}${COLORS[color]}${severity.toUpperCase()} (${items.length})${COLORS.reset}`);
    for (const f of items.slice(0, 10)) {
      log(`  ${COLORS.cyan}${f.file || 'unknown'}${COLORS.reset}:${f.line || '?'}  [${f.type || f.severity}]`);
      log(`    ${COLORS.yellow}${f.match || f.secret || 'hidden'}${COLORS.reset}`);
    }
    if (items.length > 10) log(`  ... and ${items.length - 10} more`);
  }
}

function aiAnalysis(scanResult, reviewResult, config) {
  const findings = filterFindings(scanResult.findings, config.allowList);
  const counts = countBySeverity(findings);

  log(`\n${COLORS.bold}${COLORS.magenta}═══ AI ANALYSIS & REMEDIATION ═══${COLORS.reset}\n`);

  if (findings.length === 0) {
    success('No leaks detected after allowlist filtering.');
    return { decision: 'CLEAN', actions: [] };
  }

  log(`Scan Results:`);
  log(`  Launch Confidence: ${scanResult.launchConfidence}/100`);
  log(`  Reality Score: ${scanResult.realityScore}/100`);
  log(`  Perceived Performance: ${scanResult.perceivedPerformance}/100`);
  log(`  Total Findings: ${findings.length} (Critical: ${counts.critical}, High: ${counts.high}, Medium: ${counts.medium}, Low: ${counts.low})`);

  if (reviewResult.rawOutput) {
    log(`\nDeep Review: ${reviewResult.summary || 'Completed'}`);
  }

  const blocking = counts.critical > 0 || counts.high > 0;
  const decision = blocking ? 'BLOCK' : 'REVIEW_REQUIRED';

  log(`\n${COLORS.bold}DECISION: ${decision === 'BLOCK' ? COLORS.red + 'BLOCK' : COLORS.yellow + 'REVIEW_REQUIRED'}${COLORS.reset}`);

  const actions = [];
  if (blocking) {
    actions.push('1. ROTATE all compromised credentials immediately');
    actions.push('2. REMOVE from Git history using git filter-repo or BFG Repo-Cleaner');
    actions.push('3. FORCE PUSH cleaned history');
    actions.push('4. RE-RUN scan to verify clean');
  } else {
    actions.push('1. Review each finding for false positives');
    actions.push('2. Add legitimate patterns to allowList in leak-spots.json');
    actions.push('3. Rotate any real credentials found');
  }

  for (const a of actions) log(`  ${a}`);

  return { decision, actions, findings };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { command: 'scan', workingTree: false, since: null, until: null, format: 'text', failOnLeak: false, output: null };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === 'scan' || arg === 'audit') options.command = arg;
    else if (arg === '--working-tree') options.workingTree = true;
    else if (arg === '--since') options.since = args[++i];
    else if (arg === '--until') options.until = args[++i];
    else if (arg === '--format') options.format = args[++i];
    else if (arg === '--fail-on-leak') options.failOnLeak = true;
    else if (arg === '--output') options.output = args[++i];
    else if (arg === '--help' || arg === '-h') { showHelp(); process.exit(0); }
  }
  return options;
}

function showHelp() {
  console.log(`
${COLORS.bold}Leak Spots${COLORS.reset} - Secret scanner using Periderm CLI

Usage:
  node leak-spots.js <command> [options]

Commands:
  scan                    Scan for secrets (default)
  audit                   Full audit with AI analysis

Options:
  --working-tree          Scan only working tree (faster)
  --since <ref>           Scan from commit/branch
  --until <ref>           Scan until commit/branch
  --format <fmt>          Output: text, json (default: text)
  --fail-on-leak          Exit 1 if leaks found
  --output <file>         Write results to file
  --help, -h              Show help

Config:
  Create leak-spots.json to customize allowList, ignorePaths, thresholds.

Examples:
  node leak-spots.js scan
  node leak-spots.js scan --working-tree --fail-on-leak
  node leak-spots.js scan --since=main --format=json --output=leaks.json
  node leak-spots.js audit
`);
}

async function main() {
  const options = parseArgs();
  const config = loadConfig();

  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    error('Not a Git repository');
    process.exit(1);
  }

  // Check periderm CLI
  const versionCheck = runPeriderm(['--version']);
  if (versionCheck.status !== 0) {
    error('periderm-cli not found. Run: npm i -g periderm-cli');
    process.exit(1);
  }
  info(`Using Periderm ${versionCheck.stdout.trim()}`);

  if (options.command === 'scan' || options.command === 'audit') {
    section('Periderm Secret Scan');

    const scanArgs = [...config.scan.args];
    const scanResult = runPeriderm(['scan', ...scanArgs]);

    if (scanResult.status !== 0 && scanResult.status !== 1) {
      error('Periderm scan failed');
      console.error(scanResult.stderr);
      process.exit(2);
    }

    const parsed = parseScanOutput(scanResult.stdout);

    if (options.format === 'json' || options.output) {
      if (options.output) {
        fs.writeFileSync(options.output, scanResult.stdout);
        success(`Results written to ${options.output}`);
      }
      if (options.format === 'json') console.log(scanResult.stdout);
    } else {
      console.log(scanResult.stdout);
    }

    // Deep review
    let reviewResult = { summary: 'Not run', rawOutput: '' };
    if (config.review.deep) {
      section('Periderm Deep AI Review');
      const review = runPeriderm(['review', '--deep', '--json']);
      reviewResult.rawOutput = review.stdout;
      try {
        const data = JSON.parse(review.stdout);
        reviewResult.summary = data.summary || 'Review completed';
      } catch {
        reviewResult.summary = 'Review completed (text output)';
      }
      console.log(review.stdout);
    }

    // AI Analysis
    const analysis = aiAnalysis(parsed, reviewResult, config);

    if (options.failOnLeak && analysis.findings?.length > 0) {
      process.exit(1);
    }

    process.exit(analysis.decision === 'BLOCK' ? 1 : 0);
  }
}

main().catch(e => {
  error(`Error: ${e.message}`);
  console.error(e.stack);
  process.exit(2);
});