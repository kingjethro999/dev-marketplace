#!/usr/bin/env node

/**
 * Commit Hook Uninstaller
 * Removes Git hooks and restores backups
 */

const fs = require('fs');
const path = require('path');

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

function success(msg) {
  console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`);
}

function info(msg) {
  console.log(`${COLORS.blue}ℹ ${msg}${COLORS.reset}`);
}

function warn(msg) {
  console.log(`${COLORS.yellow}⚠ ${msg}${COLORS.reset}`);
}

function main() {
  log(`\n${COLORS.bold}${COLORS.cyan}Uninstalling Git Hooks${COLORS.reset}\n`);

  if (!fs.existsSync(GIT_DIR)) {
    log('Not a Git repository', 'yellow');
    return;
  }

  if (!fs.existsSync(HOOKS_DIR)) {
    log('No hooks directory', 'yellow');
    return;
  }

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

  // Optionally remove .hookrc.json
  const hookrcPath = path.join(PROJECT_ROOT, '.hookrc.json');
  if (fs.existsSync(hookrcPath)) {
    const shouldRemove = process.argv.includes('--remove-config');
    if (shouldRemove) {
      fs.unlinkSync(hookrcPath);
      success('Removed .hookrc.json');
    } else {
      info('Kept .hookrc.json (use --remove-config to delete)');
    }
  }

  if (removed === 0) {
    info('No hooks to remove');
  } else {
    log(`\n${COLORS.green}✨ Hooks uninstalled${COLORS.reset}\n`);
  }
}

main();