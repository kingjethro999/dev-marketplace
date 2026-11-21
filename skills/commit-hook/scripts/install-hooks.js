#!/usr/bin/env node

/**
 * Commit Hook Installer
 * Installs Git hooks for pre-commit, pre-push, and commit-msg
 * Zero dependencies - uses only Node.js built-ins
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SKILL_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(SKILL_DIR, 'templates');
const PROJECT_ROOT = process.cwd();
const GIT_DIR = path.join(PROJECT_ROOT, '.git');
const HOOKS_DIR = path.join(GIT_DIR, 'hooks');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
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

function info(msg) {
  console.log(`${COLORS.blue}ℹ ${msg}${COLORS.reset}`);
}

function warn(msg) {
  console.log(`${COLORS.yellow}⚠ ${msg}${COLORS.reset}`);
}

function checkGitRepo() {
  if (!fs.existsSync(GIT_DIR)) {
    error('Not a Git repository. Run `git init` first.');
    process.exit(1);
  }
  if (!fs.existsSync(HOOKS_DIR)) {
    fs.mkdirSync(HOOKS_DIR, { recursive: true });
  }
}

function readTemplate(name) {
  const templatePath = path.join(TEMPLATES_DIR, name);
  if (!fs.existsSync(templatePath)) {
    error(`Template not found: ${templatePath}`);
    process.exit(1);
  }
  return fs.readFileSync(templatePath, 'utf8');
}

function writeHook(name, content) {
  const hookPath = path.join(HOOKS_DIR, name);
  const backupPath = `${hookPath}.backup-${Date.now()}`;

  if (fs.existsSync(hookPath)) {
    fs.copyFileSync(hookPath, backupPath);
    log(`  Backed up existing ${name} to ${path.basename(backupPath)}`, 'gray');
  }

  fs.writeFileSync(hookPath, content, { mode: 0o755 });
  success(`Installed ${name} hook`);
}

function createHookrc() {
  const hookrcPath = path.join(PROJECT_ROOT, '.hookrc.json');
  if (fs.existsSync(hookrcPath)) {
    info('.hookrc.json already exists, skipping');
    return;
  }

  const defaultConfig = {
    preCommit: {
      commands: [
        "npm run lint --if-present",
        "npm run typecheck --if-present",
        "npm run format:check --if-present",
        "npm run test:unit --if-present -- --passWithNoTests"
      ],
      timeout: 60000,
      skipOnNoChanges: true
    },
    prePush: {
      commands: [
        "npm run test --if-present",
        "npm run build --if-present"
      ],
      timeout: 180000
    },
    commitMsg: {
      pattern: "^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\\(.+\\))?: .+",
      maxLength: 72
    }
  };

  fs.writeFileSync(hookrcPath, JSON.stringify(defaultConfig, null, 2));
  success('Created .hookrc.json with default configuration');
}

function installHooks() {
  log(`\n${COLORS.bold}${COLORS.cyan}Installing Git Hooks${COLORS.reset}\n`);

  checkGitRepo();

  // Pre-commit hook
  const preCommitTemplate = readTemplate('pre-commit');
  writeHook('pre-commit', preCommitTemplate);

  // Pre-push hook
  const prePushTemplate = readTemplate('pre-push');
  writeHook('pre-push', prePushTemplate);

  // Commit-msg hook
  const commitMsgTemplate = readTemplate('commit-msg');
  writeHook('commit-msg', commitMsgTemplate);

  // Create .hookrc.json if not exists
  createHookrc();

  log(`\n${COLORS.green}✨ All hooks installed successfully!${COLORS.reset}`);
  log(`\n${COLORS.dim}Configure hooks by editing .hookrc.json${COLORS.reset}`);
  log(`${COLORS.dim}Skip hooks with: git commit --no-verify${COLORS.reset}\n`);
}

function uninstallHooks() {
  log(`\n${COLORS.bold}${COLORS.cyan}Uninstalling Git Hooks${COLORS.reset}\n`);

  checkGitRepo();

  const hooks = ['pre-commit', 'pre-push', 'commit-msg'];
  let removed = 0;

  for (const hook of hooks) {
    const hookPath = path.join(HOOKS_DIR, hook);
    const backupPattern = `${hook}.backup-`;

    if (fs.existsSync(hookPath)) {
      fs.unlinkSync(hookPath);
      success(`Removed ${hook} hook`);
      removed++;
    }

    // Restore latest backup if exists
    const backups = fs.readdirSync(HOOKS_DIR)
      .filter(f => f.startsWith(backupPattern))
      .sort()
      .reverse();

    if (backups.length > 0) {
      const latestBackup = backups[0];
      fs.copyFileSync(path.join(HOOKS_DIR, latestBackup), hookPath);
      fs.unlinkSync(path.join(HOOKS_DIR, latestBackup));
      info(`Restored previous ${hook} from backup`);
    }
  }

  if (removed === 0) {
    info('No hooks to remove');
  } else {
    log(`\n${COLORS.green}✨ Hooks uninstalled${COLORS.reset}\n`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'install';

  switch (command) {
    case 'install':
      installHooks();
      break;
    case 'uninstall':
      uninstallHooks();
      break;
    case '--help':
    case '-h':
      console.log(`
${COLORS.bold}Commit Hook Installer${COLORS.reset}

Usage:
  node scripts/install-hooks.js [command]

Commands:
  install      Install pre-commit, pre-push, and commit-msg hooks (default)
  uninstall    Remove hooks and restore backups
  --help       Show this help

Configuration:
  Edit .hookrc.json in your project root to customize commands.
`);
      break;
    default:
      error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main();