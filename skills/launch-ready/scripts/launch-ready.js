#!/usr/bin/env node

/**
 * Launch Ready - Pre-launch verification with Periderm CLI
 * Runs: npm i -g periderm-cli, periderm --help, periderm --version, periderm scan, periderm review --deep
 * AI takes over from results to decide launch/block
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

function runCmd(cmd, args, options = {}) {
  const fullCmd = `${cmd} ${args.join(' ')}`;
  log(`  ${COLORS.dim}$ ${fullCmd}${COLORS.reset}`);
  const result = spawnSync(cmd, args, {
    stdio: 'pipe',
    encoding: 'utf8',
    env: { ...process.env, ...options.env },
    maxBuffer: 1024 * 1024 * 20,
    timeout: options.timeout || 300000
  });
  return { cmd: fullCmd, ...result };
}

function loadConfig() {
  const configPath = path.join(process.cwd(), 'launch-ready.json');
  const defaults = {
    thresholds: {
      minLaunchConfidence: 60,
      minRealityScore: 50,
      minPerceivedPerformance: 70,
      maxCriticalFindings: 0,
      maxHighFindings: 0,
      maxMediumFindings: 5
    },
    checks: {
      peridermInstall: true,
      peridermScan: true,
      peridermReview: true,
      dependencyAudit: true,
      envValidation: true,
      buildVerification: true
    },
    envRequired: ['PERIDERM_API_KEY', 'NODE_ENV'],
    buildCommand: 'npm run build',
    testCommand: 'npm test',
    aiHandoff: true,
    outputFormat: 'text'
  };

  if (!fs.existsSync(configPath)) return defaults;

  try {
    const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return deepMerge(defaults, userConfig);
  } catch (e) {
    warn(`Failed to parse launch-ready.json: ${e.message}. Using defaults.`);
    return defaults;
  }
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
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

function countFindingsBySeverity(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) {
    const sev = (f.severity || '').toLowerCase();
    if (counts.hasOwnProperty(sev)) counts[sev]++;
  }
  return counts;
}

function checkEnvVars(required) {
  const missing = [];
  for (const v of required) {
    if (!process.env[v]) missing.push(v);
  }
  return missing;
}

function generateReport(results, config) {
  const { scanResult, reviewResult, envCheck, buildCheck, testCheck, thresholds } = results;
  const findingCounts = countFindingsBySeverity(scanResult.findings || []);

  const checks = [
    { name: 'Periderm Install', passed: results.peridermInstall, required: config.checks.peridermInstall },
    { name: 'Environment Variables', passed: envCheck.passed, required: config.checks.envValidation },
    { name: 'Build Verification', passed: buildCheck.passed, required: config.checks.buildVerification },
    { name: 'Test Suite', passed: testCheck.passed, required: config.checks.dependencyAudit },
    { name: 'Periderm Scan', passed: scanResult.passed, required: config.checks.peridermScan },
    { name: 'Periderm Deep Review', passed: reviewResult.passed, required: config.checks.peridermReview },
    { name: 'Launch Confidence', passed: scanResult.launchConfidence >= thresholds.minLaunchConfidence, required: true },
    { name: 'Reality Score', passed: scanResult.realityScore >= thresholds.minRealityScore, required: true },
    { name: 'Perceived Performance', passed: scanResult.perceivedPerformance >= thresholds.minPerceivedPerformance, required: true },
    { name: 'Critical Findings', passed: findingCounts.critical <= thresholds.maxCriticalFindings, required: true },
    { name: 'High Findings', passed: findingCounts.high <= thresholds.maxHighFindings, required: true },
    { name: 'Medium Findings', passed: findingCounts.medium <= thresholds.maxMediumFindings, required: true }
  ];

  const requiredChecks = checks.filter(c => c.required);
  const passedRequired = requiredChecks.filter(c => c.passed).length;
  const totalRequired = requiredChecks.length;

  const decision = passedRequired === totalRequired ? 'LAUNCH' : 'BLOCK';

  return {
    timestamp: new Date().toISOString(),
    decision,
    summary: `${passedRequired}/${totalRequired} required checks passed`,
    thresholds,
    findingCounts,
    scan: {
      launchConfidence: scanResult.launchConfidence,
      realityScore: scanResult.realityScore,
      perceivedPerformance: scanResult.perceivedPerformance,
      verdict: scanResult.verdict
    },
    review: reviewResult.summary || 'Not run',
    checks: checks.map(c => ({ name: c.name, passed: c.passed, required: c.required })),
    envMissing: envCheck.missing,
    buildOutput: buildCheck.output,
    testOutput: testCheck.output
  };
}

function printReport(report, format) {
  if (format === 'json') {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  log(`\n${COLORS.bold}${COLORS.cyan}═══ LAUNCH READINESS REPORT ═══${COLORS.reset}`);
  log(`Time: ${report.timestamp}`);
  log(`Decision: ${report.decision === 'LAUNCH' ? COLORS.green + 'LAUNCH ✓' : COLORS.red + 'BLOCK ✗'}${COLORS.reset}`);
  log(`Summary: ${report.summary}\n`);

  log(`${COLORS.bold}Thresholds:${COLORS.reset}`);
  log(`  Launch Confidence:     ${report.scan.launchConfidence}/100 (min: ${report.thresholds.minLaunchConfidence}) ${report.scan.launchConfidence >= report.thresholds.minLaunchConfidence ? COLORS.green+'✓' : COLORS.red+'✗'}${COLORS.reset}`);
  log(`  Reality Score:         ${report.scan.realityScore}/100 (min: ${report.thresholds.minRealityScore}) ${report.scan.realityScore >= report.thresholds.minRealityScore ? COLORS.green+'✓' : COLORS.red+'✗'}${COLORS.reset}`);
  log(`  Perceived Performance: ${report.scan.perceivedPerformance}/100 (min: ${report.thresholds.minPerceivedPerformance}) ${report.scan.perceivedPerformance >= report.thresholds.minPerceivedPerformance ? COLORS.green+'✓' : COLORS.red+'✗'}${COLORS.reset}`);

  log(`\n${COLORS.bold}Findings:${COLORS.reset}`);
  log(`  Critical: ${report.findingCounts.critical} (max: ${report.thresholds.maxCriticalFindings}) ${report.findingCounts.critical <= report.thresholds.maxCriticalFindings ? COLORS.green+'✓' : COLORS.red+'✗'}${COLORS.reset}`);
  log(`  High:     ${report.findingCounts.high} (max: ${report.thresholds.maxHighFindings}) ${report.findingCounts.high <= report.thresholds.maxHighFindings ? COLORS.green+'✓' : COLORS.red+'✗'}${COLORS.reset}`);
  log(`  Medium:   ${report.findingCounts.medium} (max: ${report.thresholds.maxMediumFindings}) ${report.findingCounts.medium <= report.thresholds.maxMediumFindings ? COLORS.green+'✓' : COLORS.red+'✗'}${COLORS.reset}`);

  log(`\n${COLORS.bold}Checks:${COLORS.reset}`);
  for (const c of report.checks) {
    const icon = c.passed ? COLORS.green+'✓' : COLORS.red+'✗';
    const req = c.required ? '' : COLORS.dim+' (optional)'+COLORS.reset;
    log(`  ${icon}${COLORS.reset} ${c.name}${req}`);
  }

  if (report.envMissing.length > 0) {
    log(`\n${COLORS.yellow}Missing env vars: ${report.envMissing.join(', ')}${COLORS.reset}`);
  }

  if (config.aiHandoff) {
    printAiHandoff(report);
  }
}

function printAiHandoff(report) {
  log(`\n${COLORS.bold}${COLORS.magenta}═══ AI HANDOFF - LAUNCH DECISION REQUIRED ═══${COLORS.reset}\n`);

  const findingCounts = report.findingCounts;
  const scan = report.scan;

  console.log(`## LAUNCH DECISION REQUIRED\n`);
  console.log(`Periderm Results:`);
  console.log(`- Launch Confidence: ${scan.launchConfidence}/100 (threshold: ${report.thresholds.minLaunchConfidence}) ${scan.launchConfidence >= report.thresholds.minLaunchConfidence ? '✓' : '✗'}`);
  console.log(`- Reality Score: ${scan.realityScore}/100 (threshold: ${report.thresholds.minRealityScore}) ${scan.realityScore >= report.thresholds.minRealityScore ? '✓' : '✗'}`);
  console.log(`- Perceived Performance: ${scan.perceivedPerformance}/100 (threshold: ${report.thresholds.minPerceivedPerformance}) ${scan.perceivedPerformance >= report.thresholds.minPerceivedPerformance ? '✓' : '✗'}`);
  console.log(`- Critical Findings: ${findingCounts.critical} (max: ${report.thresholds.maxCriticalFindings}) ${findingCounts.critical <= report.thresholds.maxCriticalFindings ? '✓' : '✗'}`);
  console.log(`- High Findings: ${findingCounts.high} (max: ${report.thresholds.maxHighFindings}) ${findingCounts.high <= report.thresholds.maxHighFindings ? '✓' : '✗'}`);
  console.log(`- Medium Findings: ${findingCounts.medium} (max: ${report.thresholds.maxMediumFindings}) ${findingCounts.medium <= report.thresholds.maxMediumFindings ? '✓' : '✗'}\n`);

  console.log(`Review Summary:`);
  console.log(`- ${report.review}\n`);

  console.log(`DECISION: ${report.decision === 'LAUNCH' ? 'LAUNCH' : 'BLOCK'} / LAUNCH_WITH_CONDITIONS\n`);

  if (report.decision === 'BLOCK') {
    console.log(`If BLOCK: List blocking issues and remediation steps.`);
  } else {
    console.log(`If LAUNCH_WITH_CONDITIONS: List conditions and monitoring plan.`);
  }
}

function generateChecklist(report) {
  const lines = [
    '# Launch Checklist',
    '',
    `Generated: ${report.timestamp}`,
    `Decision: **${report.decision}**',
    `Summary: ${report.summary}`,
    '',
    '## Checks',
    ''
  ];

  for (const c of report.checks) {
    const status = c.passed ? '✅' : '❌';
    const req = c.required ? ' (required)' : ' (optional)';
    lines.push(`- [${c.passed ? 'x' : ' '}] ${c.name}${req}`);
  }

  if (report.envMissing.length > 0) {
    lines.push('', '## Missing Environment Variables', '');
    for (const v of report.envMissing) {
      lines.push(`- [ ] ${v}`);
    }
  }

  lines.push('', '## Thresholds', '');
  lines.push(`- Launch Confidence: ${report.scan.launchConfidence}/100 (min: ${report.thresholds.minLaunchConfidence})`);
  lines.push(`- Reality Score: ${report.scan.realityScore}/100 (min: ${report.thresholds.minRealityScore})`);
  lines.push(`- Perceived Performance: ${report.scan.perceivedPerformance}/100 (min: ${report.thresholds.minPerceivedPerformance})`);

  lines.push('', '## Findings', '');
  lines.push(`- Critical: ${report.findingCounts.critical} (max: ${report.thresholds.maxCriticalFindings})`);
  lines.push(`- High: ${report.findingCounts.high} (max: ${report.thresholds.maxHighFindings})`);
  lines.push(`- Medium: ${report.findingCounts.medium} (max: ${report.thresholds.maxMediumFindings})`);

  return lines.join('\n');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    skipInstall: false,
    minLaunch: null,
    minReality: null,
    minPerf: null,
    format: 'text',
    output: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--skip-install') options.skipInstall = true;
    else if (arg === '--min-launch') options.minLaunch = parseInt(args[++i]);
    else if (arg === '--min-reality') options.minReality = parseInt(args[++i]);
    else if (arg === '--min-perf') options.minPerf = parseInt(args[++i]);
    else if (arg === '--format') options.format = args[++i];
    else if (arg === '--output') options.output = args[++i];
    else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }
  return options;
}

function showHelp() {
  console.log(`
${COLORS.bold}Launch Ready${COLORS.reset}

Usage:
  node launch-ready.js [options]

Options:
  --skip-install          Skip periderm-cli installation
  --min-launch <n>        Minimum launch confidence (default: 60)
  --min-reality <n>       Minimum reality score (default: 50)
  --min-perf <n>          Minimum perceived performance (default: 70)
  --format <fmt>          Output format: text, json (default: text)
  --output <file>         Write report to file
  --help, -h              Show this help

Examples:
  node launch-ready.js
  node launch-ready.js --min-launch=70 --min-reality=60
  node launch-ready.js --format=json --output launch-report.json
`);
}

const config = loadConfig();

async function main() {
  const options = parseArgs();

  // Override thresholds from CLI
  if (options.minLaunch !== null) config.thresholds.minLaunchConfidence = options.minLaunch;
  if (options.minReality !== null) config.thresholds.minRealityScore = options.minReality;
  if (options.minPerf !== null) config.thresholds.minPerceivedPerformance = options.minPerf;

  section('LAUNCH READY - Pre-launch Verification');

  const results = {
    peridermInstall: { passed: true },
    envCheck: { passed: true, missing: [] },
    buildCheck: { passed: true, output: '' },
    testCheck: { passed: true, output: '' },
    scanResult: { passed: true, launchConfidence: 0, realityScore: 0, perceivedPerformance: 0, verdict: 'UNKNOWN', findings: [] },
    reviewResult: { passed: true, summary: 'Not run' }
  };

  // 1. Install periderm-cli
  if (config.checks.peridermInstall && !options.skipInstall) {
    section('1/7 Installing Periderm CLI');
    const installResult = runCmd('npm', ['i', '-g', 'periderm-cli@latest'], { timeout: 120000 });
    results.peridermInstall.passed = installResult.status === 0;
    if (!results.peridermInstall.passed) {
      error('Periderm installation failed');
      console.error(installResult.stderr);
    } else {
      success('Periderm CLI installed');
    }
  } else {
    info('Skipping periderm-cli install');
  }

  // 2. Verify periderm --help
  section('2/7 Verifying Periderm CLI');
  const helpResult = runCmd('periderm', ['--help']);
  if (helpResult.status !== 0) {
    error('Periderm CLI not working');
    results.peridermInstall.passed = false;
  } else {
    success('Periderm CLI responsive');
  }

  // 3. Version
  const versionResult = runCmd('periderm', ['--version']);
  if (versionResult.status === 0) {
    info(`Version: ${versionResult.stdout.trim()}`);
  }

  // 4. Auth status
  section('3/7 Checking Authentication');
  const authResult = runCmd('periderm', ['auth', 'status']);
  if (authResult.status === 0) {
    success('Authenticated');
    console.log(authResult.stdout);
  } else {
    warn('Not authenticated (set PERIDERM_API_KEY for full scans)');
  }

  // 5. Environment validation
  if (config.checks.envValidation) {
    section('4/7 Validating Environment');
    results.envCheck.missing = checkEnvVars(config.envRequired);
    results.envCheck.passed = results.envCheck.missing.length === 0;
    if (results.envCheck.passed) {
      success('All required env vars present');
    } else {
      warn(`Missing: ${results.envCheck.missing.join(', ')}`);
    }
  }

  // 6. Build verification
  if (config.checks.buildVerification && config.buildCommand) {
    section('5/7 Build Verification');
    const buildCmd = config.buildCommand.split(' ');
    const buildResult = runCmd(buildCmd[0], buildCmd.slice(1), { timeout: 180000 });
    results.buildCheck.passed = buildResult.status === 0;
    results.buildCheck.output = buildResult.stdout.slice(-2000);
    if (results.buildCheck.passed) {
      success('Build passed');
    } else {
      error('Build failed');
      console.error(buildResult.stderr);
    }
  }

  // 7. Test suite
  if (config.checks.dependencyAudit && config.testCommand) {
    section('6/7 Test Suite');
    const testCmd = config.testCommand.split(' ');
    const testResult = runCmd(testCmd[0], testCmd.slice(1), { timeout: 300000 });
    results.testCheck.passed = testResult.status === 0;
    results.testCheck.output = testResult.stdout.slice(-2000);
    if (results.testCheck.passed) {
      success('Tests passed');
    } else {
      error('Tests failed');
      console.error(testResult.stderr);
    }
  }

  // 8. Periderm scan
  if (config.checks.peridermScan) {
    section('7/7 Periderm Security & Quality Scan');
    const scanResult = runCmd('periderm', ['scan', '--json'], { timeout: 300000 });
    results.scanResult = parseScanOutput(scanResult.stdout);
    results.scanResult.rawOutput = scanResult.stdout;
    results.scanResult.passed = scanResult.status === 0 || scanResult.status === 1;

    console.log(scanResult.stdout);

    const findingCounts = countFindingsBySeverity(results.scanResult.findings || []);
    log(`Findings: Critical=${findingCounts.critical}, High=${findingCounts.high}, Medium=${findingCounts.medium}, Low=${findingCounts.low}`);
  }

  // 9. Periderm deep review
  if (config.checks.peridermReview) {
    section('Periderm Deep AI Review');
    const reviewResult = runCmd('periderm', ['review', '--deep', '--json'], { timeout: 300000 });
    results.reviewResult.passed = reviewResult.status === 0 || reviewResult.status === 1;
    results.reviewResult.rawOutput = reviewResult.stdout;

    try {
      const data = JSON.parse(reviewResult.stdout);
      results.reviewResult.summary = data.summary || 'Review completed';
      console.log(reviewResult.stdout);
    } catch {
      results.reviewResult.summary = 'Review completed (text output)';
      console.log(reviewResult.stdout);
    }
  }

  // Generate report
  const report = generateReport(results, config);

  // Output
  printReport(report, options.format);

  // Write files
  if (options.output) {
    fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
    success(`Report written to ${options.output}`);
  }

  // Always write launch checklist
  const checklist = generateChecklist(report);
  fs.writeFileSync('LAUNCH_CHECKLIST.md', checklist);
  success('Checklist written to LAUNCH_CHECKLIST.md');

  // Exit code
  process.exit(report.decision === 'LAUNCH' ? 0 : 1);
}

main().catch(e => {
  error(`Unexpected error: ${e.message}`);
  console.error(e.stack);
  process.exit(2);
});