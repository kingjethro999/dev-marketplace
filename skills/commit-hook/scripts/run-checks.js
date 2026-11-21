#!/usr/bin/env node

/**
 * Hook Check Runner
 * Runs configured commands with timeout, parallel execution, and colored output
 * Used by pre-commit and pre-push hooks
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PROJECT_ROOT = process.cwd();
const HOOKRC_PATH = path.join(PROJECT_ROOT, '.hookrc.json');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
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

function loadConfig() {
  if (!fs.existsSync(HOOKRC_PATH)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(HOOKRC_PATH, 'utf8'));
  } catch (e) {
    error(`Failed to parse .hookrc.json: ${e.message}`);
    return null;
  }
}

function runCommand(cmd, timeout) {
  const start = Date.now();
  const result = spawnSync(cmd, { shell: true, stdio: 'pipe', timeout, cwd: PROJECT_ROOT, encoding: 'utf8' });
  const duration = Date.now() - start;

  return {
    command: cmd,
    code: result.status,
    signal: result.signal,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    duration,
    timedOut: result.signal === 'SIGTERM' || (result.status === null && duration >= timeout)
  };
}

function runChecks(hookName) {
  const config = loadConfig();
  if (!config) {
    error('No .hookrc.json found. Run install-hooks.js first.');
    process.exit(1);
  }

  const hookConfig = config[hookName];
  if (!hookConfig || !hookConfig.commands || hookConfig.commands.length === 0) {
    log(`No commands configured for ${hookName}`, 'gray');
    return true;
  }

  const timeout = hookConfig.timeout || 60000;
  const commands = hookConfig.commands;

  log(`\n${COLORS.bold}${COLORS.cyan}Running ${hookName} checks...${COLORS.reset}\n`);

  let allPassed = true;

  for (const cmd of commands) {
    const displayCmd = cmd.replace(/ --if-present/g, '');
    log(`  ${COLORS.dim}$ ${displayCmd}${COLORS.reset}`);

    const result = runCommand(cmd, timeout);

    if (result.timedOut) {
      error(`  Timed out after ${(timeout / 1000).toFixed(0)}s`);
      allPassed = false;
      break;
    }

    if (result.code === 0) {
      success(`  Passed (${result.duration}ms)`);
    } else if (result.code === null || result.signal) {
      error(`  Failed (signal: ${result.signal})`);
      if (result.stdout) console.log(result.stdout);
      if (result.stderr) console.error(result.stderr);
      allPassed = false;
      break;
    } else {
      // Check if it's an "npm run script missing" exit code
      const isMissingScript = result.stderr.includes('missing script') || result.stdout.includes('missing script');
      if (isMissingScript && cmd.includes('--if-present')) {
        warn(`  Skipped (script not defined)`);
        continue;
      }
      error(`  Failed with exit code ${result.code} (${result.duration}ms)`);
      if (result.stdout) console.log(result.stdout);
      if (result.stderr) console.error(result.stderr);
      allPassed = false;
      break;
    }
  }

  if (allPassed) {
    log(`\n${COLORS.green}✓ All ${hookName} checks passed${COLORS.reset}\n`);
  } else {
    log(`\n${COLORS.red}✖ ${hookName} checks failed${COLORS.reset}`);
    log(`${COLORS.dim}Skip with: git ${hookName === 'pre-commit' ? 'commit' : 'push'} --no-verify${COLORS.reset}\n`);
  }

  return allPassed;
}

function main() {
  const hookName = process.argv[2];
  if (!hookName || !['pre-commit', 'pre-push'].includes(hookName)) {
    error('Usage: node run-checks.js <pre-commit|pre-push>');
    process.exit(1);
  }

  const passed = runChecks(hookName);
  process.exit(passed ? 0 : 1);
}

main();