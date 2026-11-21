#!/usr/bin/env node

/**
 * Periderm CI Wrapper
 * Runs periderm-cli commands with CI-friendly options, thresholds, and SARIF output
 * Zero dependencies - uses only Node.js built-ins
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

function runPeriderm(args, env = {}) {
  const mergedEnv = { ...process.env, ...env };
  const result = spawnSync('periderm', args, {
    stdio: 'pipe',
    encoding: 'utf8',
    env: mergedEnv,
    maxBuffer: 1024 * 1024 * 10
  });
  return result;
}

function loadConfig() {
  const configPath = path.join(process.cwd(), 'periderm-ci.json');
  if (!fs.existsSync(configPath)) {
    return getDefaultConfig();
  }
  try {
    return { ...getDefaultConfig(), ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
  } catch (e) {
    warn(`Failed to parse periderm-ci.json: ${e.message}. Using defaults.`);
    return getDefaultConfig();
  }
}

function getDefaultConfig() {
  return {
    scan: {
      args: ['--json'],
      failOn: ['critical', 'high'],
      minLaunchConfidence: 0,
      minRealityScore: 0,
      minPerceivedPerformance: 0
    },
    review: {
      deep: false,
      failOn: ['critical', 'high', 'medium']
    },
    ready: {
      minLaunchConfidence: 60,
      minRealityScore: 50,
      minPerceivedPerformance: 70,
      allowWarnings: true
    },
    sarif: {
      enabled: true,
      outputFile: 'periderm-results.sarif',
      category: 'periderm'
    },
    github: {
      uploadSarif: true,
      tokenEnv: 'GITHUB_TOKEN'
    }
  };
}

function parseScanOutput(output) {
  try {
    const data = JSON.parse(output);
    return {
      launchConfidence: data.launchConfidence || 0,
      realityScore: data.realityScore || 0,
      perceivedPerformance: data.perceivedPerformance || 0,
      findings: data.findings || [],
      verdict: data.verdict || 'UNKNOWN'
    };
  } catch (e) {
    // Try to parse text output
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

function checkThresholds(scanResult, config) {
  const failures = [];

  if (scanResult.launchConfidence < config.scan.minLaunchConfidence) {
    failures.push(`Launch Confidence ${scanResult.launchConfidence} < ${config.scan.minLaunchConfidence}`);
  }
  if (scanResult.realityScore < config.scan.minRealityScore) {
    failures.push(`Reality Score ${scanResult.realityScore} < ${config.scan.minRealityScore}`);
  }
  if (scanResult.perceivedPerformance < config.scan.minPerceivedPerformance) {
    failures.push(`Perceived Performance ${scanResult.perceivedPerformance} < ${config.scan.minPerceivedPerformance}`);
  }

  // Count findings by severity
  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of scanResult.findings) {
    const sev = (f.severity || '').toLowerCase();
    if (severityCounts.hasOwnProperty(sev)) severityCounts[sev]++;
  }

  for (const sev of config.scan.failOn) {
    if (severityCounts[sev] > 0) {
      failures.push(`${sev.toUpperCase()} findings: ${severityCounts[sev]}`);
    }
  }

  return failures;
}

function generateSarif(scanResult, config) {
  const results = scanResult.findings.map(f => ({
    ruleId: f.type || 'periderm-finding',
    level: f.severity === 'critical' ? 'error' : f.severity === 'high' ? 'error' : 'warning',
    message: { text: `${f.message || f.description || 'Periderm finding'}` },
    locations: f.file ? [{
      physicalLocation: {
        artifactLocation: { uri: f.file },
        region: f.line ? { startLine: f.line } : {}
      }
    }] : []
  }));

  return JSON.stringify({
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [{
      tool: {
        driver: {
          name: 'Periderm',
          version: '1.0.0',
          informationUri: 'https://periderm-cli.vercel.app'
        }
      },
      results,
      columnKind: 'utf16CodeUnits'
    }]
  }, null, 2);
}

function cmdScan(args) {
  const config = loadConfig();
  const scanArgs = [...config.scan.args];

  // Override from CLI args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format') scanArgs.push('--json', args[++i]);
    else if (args[i] === '--fail-on') config.scan.failOn = args[++i].split(',');
    else if (args[i] === '--min-launch') config.scan.minLaunchConfidence = parseInt(args[++i]);
    else if (args[i] === '--min-reality') config.scan.minRealityScore = parseInt(args[++i]);
    else if (args[i] === '--min-perf') config.scan.minPerceivedPerformance = parseInt(args[++i]);
    else scanArgs.push(args[i]);
  }

  log(`\n${COLORS.bold}${COLORS.cyan}Running Periderm Scan${COLORS.reset}\n`);
  info(`Command: periderm ${scanArgs.join(' ')}`);

  const result = runPeriderm(['scan', ...scanArgs]);

  if (result.status !== 0 && result.status !== 1) {
    error(`Periderm scan failed (exit ${result.status})`);
    console.error(result.stderr);
    process.exit(2);
  }

  const scanResult = parseScanOutput(result.stdout);
  console.log(result.stdout);

  // Check thresholds
  const failures = checkThresholds(scanResult, config);

  if (config.sarif.enabled) {
    const sarif = generateSarif(scanResult, config);
    fs.writeFileSync(config.sarif.outputFile, sarif);
    success(`SARIF written to ${config.sarif.outputFile}`);
  }

  if (failures.length > 0) {
    log(`\n${COLORS.red}Threshold failures:${COLORS.reset}`);
    for (const f of failures) log(`  - ${f}`, 'red');
    process.exit(1);
  }

  success('All thresholds passed');
}

function cmdReview(args) {
  const config = loadConfig();
  const reviewArgs = ['review'];

  if (config.review.deep || args.includes('--deep')) reviewArgs.push('--deep');
  if (args.includes('--json')) reviewArgs.push('--json');

  log(`\n${COLORS.bold}${COLORS.cyan}Running Periderm AI Review${COLORS.reset}\n`);
  info(`Command: periderm ${reviewArgs.join(' ')}`);

  const result = runPeriderm(reviewArgs);

  if (result.status !== 0 && result.status !== 1) {
    error(`Periderm review failed (exit ${result.status})`);
    console.error(result.stderr);
    process.exit(2);
  }

  console.log(result.stdout);

  // Check for failures if JSON output
  if (args.includes('--json')) {
    try {
      const data = JSON.parse(result.stdout);
      const failOn = config.review.failOn;
      // Add failure checking logic here based on review output
    } catch (e) {
      // Ignore parse errors
    }
  }
}

function cmdReady(args) {
  const config = loadConfig();

  // Override from CLI
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--min-launch') config.ready.minLaunchConfidence = parseInt(args[++i]);
    else if (args[i] === '--min-reality') config.ready.minRealityScore = parseInt(args[++i]);
    else if (args[i] === '--min-perf') config.ready.minPerceivedPerformance = parseInt(args[++i]);
  }

  log(`\n${COLORS.bold}${COLORS.cyan}Checking Launch Readiness${COLORS.reset}\n`);

  const result = runPeriderm(['scan', '--json']);
  if (result.status !== 0 && result.status !== 1) {
    error(`Periderm scan failed`);
    process.exit(2);
  }

  const scanResult = parseScanOutput(result.stdout);

  log(`  Launch Confidence:     ${scanResult.launchConfidence} / 100 (min: ${config.ready.minLaunchConfidence})`);
  log(`  Reality Score:         ${scanResult.realityScore} / 100 (min: ${config.ready.minRealityScore})`);
  log(`  Perceived Performance: ${scanResult.perceivedPerformance} / 100 (min: ${config.ready.minPerceivedPerformance})`);

  const failures = [];
  if (scanResult.launchConfidence < config.ready.minLaunchConfidence) failures.push('Launch Confidence');
  if (scanResult.realityScore < config.ready.minRealityScore) failures.push('Reality Score');
  if (scanResult.perceivedPerformance < config.ready.minPerceivedPerformance) failures.push('Perceived Performance');

  if (failures.length > 0) {
    log(`\n${COLORS.red}✖ NOT READY TO LAUNCH${COLORS.reset}`);
    log(`Failed checks: ${failures.join(', ')}`);
    process.exit(1);
  }

  log(`\n${COLORS.green}✓ READY TO LAUNCH${COLORS.reset}`);
}

function cmdAuth(args) {
  const token = process.env.PERIDERM_API_KEY || process.env.PERIDERM_TOKEN;
  if (!token) {
    error('PERIDERM_API_KEY or PERIDERM_TOKEN environment variable not set');
    process.exit(3);
  }

  log(`\n${COLORS.bold}${COLORS.cyan}Authenticating with Periderm${COLORS.reset}\n`);
  const result = runPeriderm(['auth', 'login', '--token', token]);

  if (result.status !== 0) {
    error('Authentication failed');
    console.error(result.stderr);
    process.exit(2);
  }

  console.log(result.stdout);
  success('Authenticated successfully');
}

function showHelp() {
  console.log(`
${COLORS.bold}Periderm CI Wrapper${COLORS.reset}

Usage:
  node periderm-ci.js <command> [options]

Commands:
  scan                    Run periderm scan with CI thresholds
  review                  Run periderm review --deep
  ready                   Check launch readiness thresholds
  auth                    Authenticate with Periderm (uses PERIDERM_API_KEY)

Scan Options:
  --format <fmt>          Output format (json, text)
  --fail-on <levels>      Comma-separated: critical,high,medium,low
  --min-launch <n>        Minimum launch confidence (0-100)
  --min-reality <n>       Minimum reality score (0-100)
  --min-perf <n>          Minimum perceived performance (0-100)

Ready Options:
  --min-launch <n>        Minimum launch confidence (default: 60)
  --min-reality <n>       Minimum reality score (default: 50)
  --min-perf <n>          Minimum perceived performance (default: 70)

Review Options:
  --deep                  Run deep AI review
  --json                  Output JSON

Config:
  Create periderm-ci.json in project root to customize defaults.

Examples:
  node periderm-ci.js scan --fail-on=critical,high --min-launch=50
  node periderm-ci.js review --deep
  node periderm-ci.js ready --min-launch=70 --min-reality=60
  PERIDERM_API_KEY=xxx node periderm-ci.js auth
`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const rest = args.slice(1);

  switch (command) {
    case 'scan':
      cmdScan(rest);
      break;
    case 'review':
      cmdReview(rest);
      break;
    case 'ready':
      cmdReady(rest);
      break;
    case 'auth':
      cmdAuth(rest);
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      error(`Unknown command: ${command}`);
      showHelp();
      process.exit(3);
  }
}

main();