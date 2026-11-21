#!/usr/bin/env node

/**
 * Commit Hook - Install and test Git hooks with Periderm CLI integration
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SKILL_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(SKILL_DIR, 'templates');

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

function loadConfig() {
  const configPath = path.join(process.cwd(), 'commit-hook.json');
  const defaults = {
    preCommit: {
      enabled: true,
      peridermScan: true,
      peridermArgs: ['--staged', '--json'],
      failOn: ['critical', 'high'],
      lint: true,
      typecheck: true,
      tests: ['unit'],
      timeout: 60000
    },
    prePush: {
      enabled: true,
      peridermScan: true,
      peridermReview: true,
      peridermArgs: ['--json'],
      failOn: ['critical', 'high'],
      tests: ['all'],
      build: true,
      timeout: 300000
    },
    commitMsg: {
      enabled: true,
      requireConventional: true,
      requireSecurityFooter: true,
      securityFooterKeys: ['Security', 'CVE', 'GHSA', 'Periderm'],
      maxLength: 72
    }
  };

  if (!fs.existsSync(configPath)) return defaults;

  try {
    return deepMerge(defaults, JSON.parse(fs.readFileSync(configPath, 'utf8')));
  } catch (e) {
    warn(`Failed to parse commit-hook.json: ${e.message}. Using defaults.`);
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

function readTemplate(name) {
  const p = path.join(TEMPLATES_DIR, name);
  if (!fs.existsSync(p)) { error(`Template not found: ${p}`); process.exit(1); }
  return fs.readFileSync(p, 'utf8');
}

function writeHook(name, content) {
  const hookDir = path.join(process.cwd(), '.git', 'hooks');
  if (!fs.existsSync(hookDir)) { error('Not a Git repo'); process.exit(1); }
  const hookPath = path.join(hookDir, name);
  if (fs.existsSync(hookPath)) {
    fs.copyFileSync(hookPath, `${hookPath}.backup-${Date.now()}`);
  }
  fs.writeFileSync(hookPath, content, { mode: 0o755 });
  success(`Installed ${name} hook`);
}

function cmdInstall() {
  section('Installing Git Hooks');

  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    error('Not a Git repository');
    process.exit(1);
  }

  const config = loadConfig();

  // Check periderm CLI
  const ver = spawnSync('periderm', ['--version'], { encoding: 'utf8' });
  if (ver.status !== 0) {
    warn('periderm-cli not found. Install: npm i -g periderm-cli');
  } else {
    info(`Found Periderm ${ver.stdout.trim()}`);
  }

  // Pre-commit
  if (config.preCommit.enabled) {
    const template = readTemplate('pre-commit')
      .replace('{{PERIDERM_SCAN}}', config.preCommit.peridermScan ? 'true' : 'false')
      .replace('{{PERIDERM_ARGS}}', config.preCommit.peridermArgs.join(' '))
      .replace('{{FAIL_ON}}', config.preCommit.failOn.join(','))
      .replace('{{LINT}}', config.preCommit.lint ? 'true' : 'false')
      .replace('{{TYPECHECK}}', config.preCommit.typecheck ? 'true' : 'false')
      .replace('{{TESTS}}', config.preCommit.tests.join(','))
      .replace('{{TIMEOUT}}', config.preCommit.timeout);
    writeHook('pre-commit', template);
  }

  // Pre-push
  if (config.prePush.enabled) {
    const template = readTemplate('pre-push')
      .replace('{{PERIDERM_SCAN}}', config.prePush.peridermScan ? 'true' : 'false')
      .replace('{{PERIDERM_REVIEW}}', config.prePush.peridermReview ? 'true' : 'false')
      .replace('{{PERIDERM_ARGS}}', config.prePush.peridermArgs.join(' '))
      .replace('{{FAIL_ON}}', config.prePush.failOn.join(','))
      .replace('{{TESTS}}', config.prePush.tests.join(','))
      .replace('{{BUILD}}', config.prePush.build ? 'true' : 'false')
      .replace('{{TIMEOUT}}', config.prePush.timeout);
    writeHook('pre-push', template);
  }

  // Commit-msg
  if (config.commitMsg.enabled) {
    const template = readTemplate('commit-msg')
      .replace('{{REQUIRE_CONVENTIONAL}}', config.commitMsg.requireConventional ? 'true' : 'false')
      .replace('{{REQUIRE_SECURITY_FOOTER}}', config.commitMsg.requireSecurityFooter ? 'true' : 'false')
      .replace('{{SECURITY_KEYS}}', config.commitMsg.securityFooterKeys.join('|'))
      .replace('{{MAX_LENGTH}}', config.commitMsg.maxLength);
    writeHook('commit-msg', template);
  }

  success('\nAll hooks installed!');
  info('Run with --no-verify to skip: git commit --no-verify');
}

function cmdUninstall() {
  section('Uninstalling Git Hooks');

  const hooks = ['pre-commit', 'pre-push', 'commit-msg'];
  for (const hook of hooks) {
    const hookPath = path.join(process.cwd(), '.git', 'hooks', hook);
    if (fs.existsSync(hookPath)) {
      fs.unlinkSync(hookPath);
      success(`Removed ${hook}`);
    }
    // Restore latest backup
    const backups = fs.readdirSync(path.dirname(hookPath))
      .filter(f => f.startsWith(`${hook}.backup-`))
      .sort().reverse();
    if (backups.length > 0) {
      fs.copyFileSync(path.join(path.dirname(hookPath), backups[0]), hookPath);
      fs.unlinkSync(path.join(path.dirname(hookPath), backups[0]));
      info(`Restored previous ${hook}`);
    }
  }
  success('Hooks uninstalled');
}

function cmdTest(hookType) {
  section(`Testing ${hookType} Hook`);

  const config = loadConfig();
  const hookConfig = config[hookType === 'pre-commit' ? 'preCommit' : 'prePush'];

  if (!hookConfig.enabled) {
    warn(`${hookType} is disabled in config`);
    return;
  }

  const scriptPath = path.join(SKILL_DIR, 'scripts', `run-${hookType}.js`);
  if (!fs.existsSync(scriptPath)) {
    error(`Runner not found: ${scriptPath}`);
    process.exit(1);
  }

  const result = spawnSync('node', [scriptPath], {
    stdio: 'inherit',
    env: { ...process.env, HOOK_CONFIG: JSON.stringify(hookConfig) },
    timeout: hookConfig.timeout
  });

  process.exit(result.status);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'help';
  return cmd;
}

function showHelp() {
  console.log(`
${COLORS.bold}Commit Hook${COLORS.reset}

Usage:
  node commit-hook.js <command>

Commands:
  install           Install pre-commit, pre-push, commit-msg hooks
  uninstall         Remove hooks and restore backups
  test-pre-commit   Test pre-commit hook manually
  test-pre-push     Test pre-push hook manually
  help              Show this help

Config:
  Create commit-hook.json to customize behavior.
`);
}

function main() {
  const cmd = parseArgs();
  switch (cmd) {
    case 'install': cmdInstall(); break;
    case 'uninstall': cmdUninstall(); break;
    case 'test-pre-commit': cmdTest('pre-commit'); break;
    case 'test-pre-push': cmdTest('pre-push'); break;
    case 'help': case '--help': case '-h': showHelp(); break;
    default: error(`Unknown: ${cmd}`); showHelp(); process.exit(1);
  }
}

main();