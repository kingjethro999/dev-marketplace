#!/usr/bin/env node

/**
 * Dev Marketplace CLI
 * Installs, upgrades, audits, and manages agent skills and connectors
 * for Claude Code, Cursor, Antigravity, and Codex.
 */

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const {
  parseFrontmatter,
  hashDirectory,
  resolveSafeChildPath,
  copyDirClean,
  isSafeSkillName,
} = require("../lib/skill-utils");
const {
  readLockfile,
  writeLockfile,
  inspectInstalledSkills,
  scoreSkillMatch,
} = require("../lib/lockfile");

const PKG = require("../package.json");

const USE_COLOR = !process.env.NO_COLOR;
const c = USE_COLOR
  ? {
      reset: "\x1b[0m",
      bold: "\x1b[1m",
      dim: "\x1b[2m",
      italic: "\x1b[3m",
      underline: "\x1b[4m",
      cyan: "\x1b[36m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      red: "\x1b[31m",
      gray: "\x1b[90m",
    }
  : {
      reset: "",
      bold: "",
      dim: "",
      italic: "",
      underline: "",
      cyan: "",
      green: "",
      yellow: "",
      blue: "",
      magenta: "",
      red: "",
      gray: "",
    };

const ROOT_DIR = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(ROOT_DIR, "skills");

const SUPPORTED_TYPES = new Set([
  "agents",
  "claude",
  "gemini",
  "cursor",
  "codex",
  "antigravity",
]);

function loadRegistry(rootDir = ROOT_DIR) {
  const registryPath = path.join(rootDir, "registry.json");
  const skillsDir = path.join(rootDir, "skills");

  if (fs.existsSync(registryPath)) {
    try {
      return JSON.parse(fs.readFileSync(registryPath, "utf8"));
    } catch {
      // Fallback to scanning skills directory
    }
  }

  const skills = [];
  if (fs.existsSync(skillsDir)) {
    for (const name of fs.readdirSync(skillsDir).sort()) {
      const skillPath = path.join(skillsDir, name);
      if (fs.statSync(skillPath).isDirectory()) {
        const skillMd = path.join(skillPath, "SKILL.md");
        let fm = null;
        if (fs.existsSync(skillMd)) {
          fm = parseFrontmatter(fs.readFileSync(skillMd, "utf8"));
        }
        skills.push({
          name,
          category: fm?.category || "General",
          description: fm?.description || "Agent skill",
          path: `skills/${name}`,
          hash: hashDirectory(skillPath),
        });
      }
    }
  }
  return skills;
}

function resolveDestination(options = {}, env = {}) {
  const cwd = env.cwd || process.cwd();
  const home = env.home || os.homedir();

  if (options.dest) {
    return path.resolve(cwd, options.dest);
  }

  const isGlobal = Boolean(options.global);
  const type = options.type ? String(options.type).toLowerCase() : null;

  if (type) {
    if (!SUPPORTED_TYPES.has(type)) {
      throw new Error(
        `Unsupported --type "${options.type}". Supported: ${[...SUPPORTED_TYPES].join(", ")}`,
      );
    }
    if (isGlobal) {
      if (type === "claude") return path.join(home, ".claude", "skills");
      if (type === "gemini") return path.join(home, ".gemini", "skills");
      if (type === "cursor") return path.join(home, ".cursor", "skills");
      if (type === "codex") return path.join(home, ".codex", "skills");
      if (type === "antigravity") {
        return path.join(home, ".gemini", "antigravity", "skills");
      }
      return path.join(home, ".agents", "skills");
    }

    if (type === "claude") return path.join(cwd, ".claude", "skills");
    if (type === "gemini") return path.join(cwd, ".gemini", "skills");
    if (type === "cursor") return path.join(cwd, ".cursor", "skills");
    if (type === "codex") return path.join(cwd, ".codex", "skills");
    if (type === "antigravity") return path.join(cwd, ".agent", "skills");
    return path.join(cwd, ".agents", "skills");
  }

  if (isGlobal) {
    return path.join(home, ".agents", "skills");
  }

  // Auto-detect existing local agent directory
  if (fs.existsSync(path.join(cwd, ".agents", "skills"))) {
    return path.join(cwd, ".agents", "skills");
  }
  if (fs.existsSync(path.join(cwd, ".claude"))) {
    return path.join(cwd, ".claude", "skills");
  }
  if (fs.existsSync(path.join(cwd, ".gemini"))) {
    return path.join(cwd, ".gemini", "skills");
  }
  if (fs.existsSync(path.join(cwd, ".cursor"))) {
    return path.join(cwd, ".cursor", "skills");
  }
  if (fs.existsSync(path.join(cwd, ".codex"))) {
    return path.join(cwd, ".codex", "skills");
  }
  if (fs.existsSync(path.join(cwd, ".agent"))) {
    return path.join(cwd, ".agent", "skills");
  }

  return path.join(cwd, ".agents", "skills");
}

function parseCommonOptions(args) {
  const options = {
    all: false,
    global: false,
    dest: null,
    category: null,
    type: null,
    dryRun: false,
    force: false,
    check: false,
    json: false,
    positionals: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--all" || arg === "-a") {
      options.all = true;
    } else if (arg === "-g" || arg === "--global") {
      options.global = true;
    } else if (arg === "--dest" || arg === "-d") {
      options.dest = args[++i];
    } else if (arg === "--category" || arg === "-c") {
      options.category = args[++i];
    } else if (arg === "--type" || arg === "-t") {
      options.type = args[++i];
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force" || arg === "-f") {
      options.force = true;
    } else if (arg === "--check") {
      options.check = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (!arg.startsWith("-")) {
      options.positionals.push(arg);
    }
  }

  return options;
}

function installSkillClean(src, dest) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  copyDirClean(src, dest);
}

function cmdList(args, registry) {
  const opts = parseCommonOptions(args);
  const searchTerm = opts.positionals[0]
    ? opts.positionals[0].toLowerCase()
    : null;

  let filtered = registry;
  if (opts.category) {
    filtered = filtered.filter((s) =>
      (s.category || "").toLowerCase().includes(opts.category.toLowerCase()),
    );
  }
  if (searchTerm) {
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm) ||
        (s.description && s.description.toLowerCase().includes(searchTerm)) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(searchTerm))),
    );
  }

  if (opts.json) {
    console.log(JSON.stringify(filtered, null, 2));
    return 0;
  }

  console.log(
    `\n${c.bold}${c.cyan}Dev Marketplace${c.reset} — ${c.yellow}${filtered.length}${c.reset} skills available\n`,
  );

  const categories = {};
  for (const skill of filtered) {
    const cat = skill.category || "Other";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(skill);
  }

  for (const [cat, items] of Object.entries(categories)) {
    console.log(
      `${c.bold}${c.magenta}▶ ${cat}${c.reset} ${c.gray}(${items.length})${c.reset}`,
    );
    for (const item of items) {
      const name = `${c.green}${item.name.padEnd(28)}${c.reset}`;
      let desc = item.description || "";
      if (desc.length > 70) desc = desc.slice(0, 67) + "...";
      console.log(`  ${name} ${c.dim}${desc}${c.reset}`);
    }
    console.log("");
  }

  console.log(
    `${c.dim}Run ${c.cyan}npx dev-marketplace add <skill-name>${c.dim} to install into your project.${c.reset}\n`,
  );
  return 0;
}

function cmdSearch(args, registry) {
  const opts = parseCommonOptions(args);
  const query = opts.positionals.join(" ").trim();

  if (!query) {
    console.error(
      `${c.yellow}Please provide a search query:${c.reset} npx dev-marketplace search <query>`,
    );
    return 1;
  }

  let pool = registry;
  if (opts.category) {
    pool = pool.filter((s) =>
      (s.category || "").toLowerCase().includes(opts.category.toLowerCase()),
    );
  }

  const ranked = pool
    .map((skill) => ({
      ...skill,
      score: scoreSkillMatch(skill, query),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  if (opts.json) {
    console.log(JSON.stringify(ranked, null, 2));
    return 0;
  }

  console.log(
    `\n${c.bold}${c.cyan}Search results for "${query}"${c.reset} — ${c.yellow}${ranked.length}${c.reset} match(es)\n`,
  );

  if (ranked.length === 0) {
    console.log(`  ${c.dim}No matching skills found.${c.reset}\n`);
    return 0;
  }

  for (const item of ranked) {
    let desc = item.description || "";
    if (desc.length > 68) desc = desc.slice(0, 65) + "...";
    console.log(
      `  ${c.green}${item.name.padEnd(28)}${c.reset} ${c.dim}[${item.category}]${c.reset}`,
    );
    console.log(`    ${c.dim}${desc}${c.reset}`);
  }
  console.log("");
  return 0;
}

function cmdAdd(args, registry) {
  const options = parseCommonOptions(args);
  const skillsToInstall = options.positionals;

  let destBase;
  try {
    destBase = resolveDestination(options);
  } catch (err) {
    console.error(`${c.red}✖ ${err.message}${c.reset}`);
    return 1;
  }

  let targetSkills = [];
  let hasErrors = false;

  if (options.all) {
    targetSkills = registry;
  } else if (options.category) {
    targetSkills = registry.filter((s) =>
      (s.category || "").toLowerCase().includes(options.category.toLowerCase()),
    );
  } else if (skillsToInstall.length > 0) {
    for (const name of skillsToInstall) {
      if (!isSafeSkillName(name)) {
        console.error(
          `${c.red}✖ Invalid skill name (path traversal or illegal characters):${c.reset} ${name}`,
        );
        hasErrors = true;
        continue;
      }

      const match = registry.find(
        (s) => s.name.toLowerCase() === name.toLowerCase(),
      );
      if (match) {
        targetSkills.push(match);
      } else {
        const customDir = resolveSafeChildPath(SKILLS_DIR, name);
        if (
          customDir &&
          fs.existsSync(customDir) &&
          fs.statSync(customDir).isDirectory()
        ) {
          targetSkills.push({
            name,
            path: `skills/${name}`,
            hash: hashDirectory(customDir),
          });
        } else {
          console.error(`${c.red}✖ Skill not found:${c.reset} ${name}`);
          hasErrors = true;
        }
      }
    }
  } else {
    console.log(
      `${c.yellow}No skills specified.${c.reset} Use ${c.cyan}npx dev-marketplace add <skill-name>${c.reset} or ${c.cyan}--all${c.reset}`,
    );
    return 1;
  }

  if (targetSkills.length === 0) {
    if (!hasErrors) {
      console.log(`${c.yellow}No matching skills found to install.${c.reset}`);
    }
    return 1;
  }

  if (options.dryRun) {
    const plan = targetSkills.map((skill) => ({
      name: skill.name,
      destination: resolveSafeChildPath(destBase, skill.name),
      action: "install",
    }));
    if (options.json) {
      console.log(
        JSON.stringify(
          { dryRun: true, destination: destBase, skills: plan },
          null,
          2,
        ),
      );
    } else {
      console.log(
        `\n${c.bold}[dry-run] Would install ${c.cyan}${plan.length}${c.reset} skill(s) to: ${c.green}${destBase}${c.reset}\n`,
      );
      for (const item of plan) {
        console.log(
          `  ${c.cyan}•${c.reset} ${item.name} -> ${item.destination}`,
        );
      }
      console.log("");
    }
    return hasErrors ? 1 : 0;
  }

  if (!options.json) {
    console.log(
      `\n${c.bold}Installing ${c.cyan}${targetSkills.length}${c.reset} skill(s) to: ${c.green}${destBase}${c.reset}\n`,
    );
  }

  const lockState = readLockfile(destBase).data;
  const now = new Date().toISOString();
  const installed = [];
  const failed = [];

  for (const skill of targetSkills) {
    const src = resolveSafeChildPath(SKILLS_DIR, skill.name);
    const dest = resolveSafeChildPath(destBase, skill.name);

    if (!src || !dest || !fs.existsSync(src)) {
      const msg = `Source missing or invalid for ${skill.name}`;
      failed.push({ name: skill.name, error: msg });
      if (!options.json) {
        console.warn(`${c.yellow}⚠ ${msg}${c.reset}`);
      }
      hasErrors = true;
      continue;
    }

    try {
      installSkillClean(src, dest);
      const installedHash = skill.hash || hashDirectory(dest);
      const prev = lockState.skills[skill.name];
      lockState.skills[skill.name] = {
        hash: installedHash,
        category: skill.category || "General",
        installedAt: prev?.installedAt || now,
        updatedAt: now,
      };
      installed.push({
        name: skill.name,
        destination: dest,
        hash: installedHash,
      });
      if (!options.json) {
        console.log(
          `  ${c.green}✓${c.reset} Installed ${c.bold}${skill.name}${c.reset}`,
        );
      }
    } catch (err) {
      failed.push({ name: skill.name, error: err.message });
      if (!options.json) {
        console.error(
          `  ${c.red}✖ Failed to install ${skill.name}:${c.reset} ${err.message}`,
        );
      }
      hasErrors = true;
    }
  }

  if (installed.length > 0) {
    writeLockfile(destBase, lockState, PKG.version);
  }

  if (options.json) {
    console.log(
      JSON.stringify({ destination: destBase, installed, failed }, null, 2),
    );
  } else {
    console.log(
      `\n${c.bold}${c.green}✨ Successfully installed ${installed.length} skill(s)!${c.reset}\n`,
    );
  }

  return hasErrors ? 1 : 0;
}

function cmdStatus(args, registry) {
  const options = parseCommonOptions(args);

  let destBase;
  try {
    destBase = resolveDestination(options);
  } catch (err) {
    console.error(`${c.red}✖ ${err.message}${c.reset}`);
    return 1;
  }

  const inspection = inspectInstalledSkills(destBase, registry, SKILLS_DIR);
  const summary = {
    total: inspection.skills.length,
    upToDate: inspection.skills.filter((s) => s.state === "up-to-date").length,
    outdated: inspection.skills.filter((s) => s.state === "outdated").length,
    modified: inspection.skills.filter((s) => s.state === "modified").length,
    untracked: inspection.skills.filter((s) => s.state === "untracked").length,
    custom: inspection.skills.filter((s) => s.state === "custom").length,
  };

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          destination: destBase,
          exists: inspection.exists,
          summary,
          skills: inspection.skills,
          orphanedLockEntries: inspection.orphanedLockEntries,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(
      `\n${c.bold}${c.cyan}Installed Skills Status${c.reset} ${c.dim}(${destBase})${c.reset}\n`,
    );
    if (inspection.skills.length === 0) {
      console.log(
        `  ${c.dim}No skills installed in this directory.${c.reset}\n`,
      );
    } else {
      const badge = {
        "up-to-date": `${c.green}up-to-date${c.reset}`,
        outdated: `${c.yellow}outdated${c.reset}`,
        modified: `${c.magenta}modified${c.reset}`,
        untracked: `${c.blue}untracked${c.reset}`,
        custom: `${c.gray}custom${c.reset}`,
      };
      for (const s of inspection.skills) {
        const hashInfo =
          s.state === "outdated" && s.registryHash
            ? ` ${c.dim}(${s.localHash.slice(0, 8)} → ${s.registryHash.slice(0, 8)})${c.reset}`
            : ` ${c.dim}(${s.localHash.slice(0, 8)})${c.reset}`;
        console.log(
          `  ${c.bold}${s.name.padEnd(28)}${c.reset} ${badge[s.state] || s.state}${hashInfo}`,
        );
      }
      console.log(
        `\n${c.dim}Total: ${summary.total} | Up to date: ${summary.upToDate} | Outdated: ${summary.outdated} | Modified: ${summary.modified}${c.reset}\n`,
      );
      if (summary.outdated > 0) {
        console.log(
          `Run ${c.cyan}npx dev-marketplace upgrade${c.reset} to update outdated skills.\n`,
        );
      }
    }
  }

  if (options.check && summary.outdated > 0) {
    return 1;
  }
  return 0;
}

function cmdUpgrade(args, registry) {
  const options = parseCommonOptions(args);
  const requestedNames = options.positionals;

  let destBase;
  try {
    destBase = resolveDestination(options);
  } catch (err) {
    console.error(`${c.red}✖ ${err.message}${c.reset}`);
    return 1;
  }

  const inspection = inspectInstalledSkills(destBase, registry, SKILLS_DIR);
  const installedMap = new Map(inspection.skills.map((s) => [s.name, s]));
  const registryMap = new Map(registry.map((s) => [s.name, s]));

  let candidates = [];
  let hasErrors = false;

  if (requestedNames.length > 0 && !options.all) {
    for (const name of requestedNames) {
      if (!isSafeSkillName(name)) {
        console.error(`${c.red}✖ Invalid skill name:${c.reset} ${name}`);
        hasErrors = true;
        continue;
      }
      const inst = installedMap.get(name);
      if (!inst) {
        console.error(`${c.red}✖ Skill is not installed:${c.reset} ${name}`);
        hasErrors = true;
        continue;
      }
      candidates.push(inst);
    }
  } else {
    candidates = inspection.skills.filter((s) => s.state !== "custom");
  }

  const upgraded = [];
  const skipped = [];
  const upToDate = [];
  const failed = [];

  const lockState = readLockfile(destBase).data;
  const now = new Date().toISOString();

  for (const item of candidates) {
    const regEntry = registryMap.get(item.name);
    if (!regEntry) {
      skipped.push({ name: item.name, reason: "not-in-registry" });
      continue;
    }

    if (item.state === "up-to-date") {
      upToDate.push({ name: item.name, hash: item.localHash });
      continue;
    }

    if (
      (item.state === "modified" || item.state === "untracked") &&
      !options.force
    ) {
      skipped.push({
        name: item.name,
        reason: item.state,
        message: "Local changes detected; re-run with --force to overwrite",
      });
      continue;
    }

    const src = resolveSafeChildPath(SKILLS_DIR, item.name);
    const dest = resolveSafeChildPath(destBase, item.name);
    if (!src || !dest || !fs.existsSync(src)) {
      failed.push({ name: item.name, error: "Source skill missing" });
      hasErrors = true;
      continue;
    }

    if (options.dryRun) {
      upgraded.push({
        name: item.name,
        fromHash: item.localHash,
        toHash: regEntry.hash || null,
        dryRun: true,
      });
      continue;
    }

    try {
      installSkillClean(src, dest);
      const newHash = regEntry.hash || hashDirectory(dest);
      const prev = lockState.skills[item.name];
      lockState.skills[item.name] = {
        hash: newHash,
        category: regEntry.category || "General",
        installedAt: prev?.installedAt || now,
        updatedAt: now,
      };
      upgraded.push({
        name: item.name,
        fromHash: item.localHash,
        toHash: newHash,
      });
    } catch (err) {
      failed.push({ name: item.name, error: err.message });
      hasErrors = true;
    }
  }

  if (!options.dryRun && upgraded.length > 0) {
    writeLockfile(destBase, lockState, PKG.version);
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          destination: destBase,
          dryRun: options.dryRun,
          upgraded,
          upToDate,
          skipped,
          failed,
        },
        null,
        2,
      ),
    );
  } else {
    const prefix = options.dryRun ? "[dry-run] " : "";
    console.log(
      `\n${c.bold}${c.cyan}${prefix}Skill Upgrade${c.reset} ${c.dim}(${destBase})${c.reset}\n`,
    );
    for (const u of upgraded) {
      console.log(
        `  ${c.green}↑${c.reset} ${options.dryRun ? "Would upgrade" : "Upgraded"} ${c.bold}${u.name}${c.reset} ${c.dim}(${u.fromHash.slice(0, 8)} → ${(u.toHash || "").slice(0, 8)})${c.reset}`,
      );
    }
    for (const s of skipped) {
      console.log(
        `  ${c.yellow}⚠${c.reset} Skipped ${c.bold}${s.name}${c.reset} (${s.reason}): ${s.message || "not eligible"}`,
      );
    }
    for (const f of failed) {
      console.error(
        `  ${c.red}✖${c.reset} Failed ${c.bold}${f.name}${c.reset}: ${f.error}`,
      );
    }
    if (upgraded.length === 0 && skipped.length === 0 && failed.length === 0) {
      console.log(
        `  ${c.green}✓ All installed skills are up to date.${c.reset}`,
      );
    }
    console.log("");
  }

  return hasErrors ? 1 : 0;
}

function cmdRemove(args, registry) {
  const options = parseCommonOptions(args);
  const requested = options.positionals;

  let destBase;
  try {
    destBase = resolveDestination(options);
  } catch (err) {
    console.error(`${c.red}✖ ${err.message}${c.reset}`);
    return 1;
  }

  const inspection = inspectInstalledSkills(destBase, registry, SKILLS_DIR);
  const lockState = readLockfile(destBase).data;

  let targets = [];
  let hasErrors = false;

  if (options.all) {
    const regNames = new Set(registry.map((s) => s.name));
    targets = inspection.skills
      .filter((s) => regNames.has(s.name) || Boolean(lockState.skills[s.name]))
      .map((s) => s.name);
  } else if (requested.length > 0) {
    for (const name of requested) {
      if (!isSafeSkillName(name)) {
        console.error(`${c.red}✖ Invalid skill name:${c.reset} ${name}`);
        hasErrors = true;
        continue;
      }
      const targetDir = resolveSafeChildPath(destBase, name);
      if (!targetDir || !fs.existsSync(targetDir)) {
        console.error(`${c.red}✖ Skill is not installed:${c.reset} ${name}`);
        hasErrors = true;
        continue;
      }
      targets.push(name);
    }
  } else {
    console.error(
      `${c.yellow}Specify skill name(s) to remove or pass --all.${c.reset}`,
    );
    return 1;
  }

  const removed = [];
  for (const name of targets) {
    const targetDir = resolveSafeChildPath(destBase, name);
    if (!targetDir) {
      hasErrors = true;
      continue;
    }
    if (!options.dryRun) {
      fs.rmSync(targetDir, { recursive: true, force: true });
      delete lockState.skills[name];
    }
    removed.push({ name, path: targetDir });
  }

  if (!options.dryRun && removed.length > 0 && fs.existsSync(destBase)) {
    writeLockfile(destBase, lockState, PKG.version);
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        { destination: destBase, dryRun: options.dryRun, removed },
        null,
        2,
      ),
    );
  } else {
    for (const item of removed) {
      console.log(
        `  ${c.green}✓${c.reset} ${options.dryRun ? "[dry-run] Would remove" : "Removed"} ${c.bold}${item.name}${c.reset}`,
      );
    }
  }

  return hasErrors ? 1 : 0;
}

function cmdDoctor(args, registry) {
  const options = parseCommonOptions(args);

  let destBase;
  try {
    destBase = resolveDestination(options);
  } catch (err) {
    console.error(`${c.red}✖ ${err.message}${c.reset}`);
    return 1;
  }

  const inspection = inspectInstalledSkills(destBase, registry, SKILLS_DIR);
  const issues = [];
  const warnings = [];

  if (!inspection.exists) {
    warnings.push({
      type: "not-initialized",
      message: `Skills directory does not exist yet: ${destBase}`,
    });
  }

  if (inspection.lockfile.exists && !inspection.lockfile.valid) {
    issues.push({
      type: "invalid-lockfile",
      message: inspection.lockfile.error,
    });
  }

  for (const orphan of inspection.orphanedLockEntries) {
    warnings.push({
      type: "orphaned-lock-entry",
      skill: orphan,
      message: `Lockfile tracks "${orphan}" but directory is missing`,
    });
  }

  for (const skill of inspection.skills) {
    const skillMdPath = path.join(skill.path, "SKILL.md");
    if (!fs.existsSync(skillMdPath)) {
      issues.push({
        type: "missing-skill-md",
        skill: skill.name,
        message: `Missing SKILL.md in ${skill.name}`,
      });
      continue;
    }

    const content = fs.readFileSync(skillMdPath, "utf8");
    const fm = parseFrontmatter(content);
    if (!fm) {
      issues.push({
        type: "missing-frontmatter",
        skill: skill.name,
        message: `SKILL.md in ${skill.name} is missing YAML frontmatter`,
      });
    } else if (!fm.name || !fm.description) {
      warnings.push({
        type: "incomplete-frontmatter",
        skill: skill.name,
        message: `SKILL.md in ${skill.name} is missing required name or description frontmatter`,
      });
    }

    if (skill.state === "outdated") {
      warnings.push({
        type: "outdated",
        skill: skill.name,
        message: `${skill.name} has an update available`,
      });
    } else if (skill.state === "modified") {
      warnings.push({
        type: "modified",
        skill: skill.name,
        message: `${skill.name} has local modifications`,
      });
    }
  }

  const ok = issues.length === 0;

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          ok,
          destination: destBase,
          installedCount: inspection.skills.length,
          issues,
          warnings,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(
      `\n${c.bold}${c.cyan}Dev Marketplace Doctor${c.reset} ${c.dim}(${destBase})${c.reset}\n`,
    );
    console.log(`  Installed skills: ${inspection.skills.length}`);
    for (const issue of issues) {
      console.error(`  ${c.red}✖${c.reset} ${issue.message}`);
    }
    for (const warn of warnings) {
      console.log(`  ${c.yellow}⚠${c.reset} ${warn.message}`);
    }
    if (ok && warnings.length === 0) {
      console.log(`  ${c.green}✓ Everything looks healthy!${c.reset}`);
    }
    console.log("");
  }

  return ok ? 0 : 1;
}

function cmdInfo(args, registry) {
  let jsonOutput = false;
  let name = null;

  for (const arg of args) {
    if (arg === "--json") jsonOutput = true;
    else if (!arg.startsWith("-") && !name) name = arg;
  }

  if (!name) {
    console.log(
      `${c.yellow}Please provide a skill name:${c.reset} npx dev-marketplace info <skill-name>`,
    );
    return 1;
  }

  const skill = registry.find(
    (s) => s.name.toLowerCase() === name.toLowerCase(),
  );
  if (!skill) {
    console.error(`${c.red}✖ Skill not found:${c.reset} ${name}`);
    return 1;
  }

  if (jsonOutput) {
    console.log(JSON.stringify(skill, null, 2));
    return 0;
  }

  console.log(
    `\n${c.bold}${c.cyan}${skill.name}${c.reset} ${c.dim}[${skill.category}]${c.reset}`,
  );
  console.log(
    `\n${c.bold}Description:${c.reset}\n  ${skill.description || "No description provided."}\n`,
  );

  if (skill.tags && skill.tags.length > 0) {
    console.log(
      `${c.bold}Tags:${c.reset} ${skill.tags.map((t) => `${c.blue}#${t}${c.reset}`).join(" ")}`,
    );
  }

  if (skill.hash) {
    console.log(
      `${c.bold}Hash:${c.reset} ${c.dim}${skill.hash.slice(0, 12)}${c.reset}`,
    );
  }

  const skillPath = resolveSafeChildPath(SKILLS_DIR, skill.name);
  if (skillPath && fs.existsSync(skillPath)) {
    console.log(`\n${c.bold}Files:${c.reset}`);
    const files = skill.files || fs.readdirSync(skillPath);
    for (const f of files) {
      console.log(`  - ${f}`);
    }
  }

  console.log(`\n${c.bold}Install Command:${c.reset}`);
  console.log(`  ${c.green}npx dev-marketplace add ${skill.name}${c.reset}\n`);
  return 0;
}

function cmdCategories(args, registry) {
  const jsonOutput = args.includes("--json");
  const categories = {};
  for (const s of registry) {
    const cat = s.category || "Other";
    categories[cat] = (categories[cat] || 0) + 1;
  }

  if (jsonOutput) {
    console.log(JSON.stringify(categories, null, 2));
    return 0;
  }

  console.log(`\n${c.bold}${c.cyan}Marketplace Categories${c.reset}\n`);
  for (const [cat, count] of Object.entries(categories)) {
    console.log(
      `  ${c.magenta}•${c.reset} ${c.bold}${cat.padEnd(25)}${c.reset} ${c.green}${count} skills${c.reset}`,
    );
  }
  console.log(
    `\nFilter skills using: ${c.cyan}npx dev-marketplace list --category "<name>"${c.reset}\n`,
  );
  return 0;
}

function cmdHelp(registry = []) {
  const countLabel = registry.length > 0 ? `${registry.length}` : "133+";
  console.log(`
${c.bold}${c.cyan}Dev Marketplace CLI${c.reset} ${c.dim}v${PKG.version}${c.reset}
${countLabel} Curated AI Agent Skills & Connectors for Developers

${c.bold}USAGE:${c.reset}
  npx dev-marketplace <command> [options]
  npx skills add kingjethro999/dev-marketplace --skill <skill-name>

${c.bold}COMMANDS:${c.reset}
  ${c.green}list, ls${c.reset} [filter]         List all skills (optionally filter by name/category)
  ${c.green}search${c.reset} <query>            Ranked search across skill names, tags, and descriptions
  ${c.green}add, install${c.reset} <names...>   Install one or more skills (tracks hashes in lockfile)
  ${c.green}upgrade, update${c.reset} [names]   Upgrade outdated installed skills (protects local edits)
  ${c.green}remove, rm${c.reset} <names...>     Uninstall one or more skills and clean up lockfile
  ${c.green}status, outdated${c.reset}          Inspect installed skills for updates or local modifications
  ${c.green}doctor${c.reset}                    Verify installed skill integrity and SKILL.md frontmatter
  ${c.green}info${c.reset} <name>               Show detailed information and files for a skill
  ${c.green}categories${c.reset}                List all available skill categories
  ${c.green}help${c.reset}                      Show this help message

${c.bold}OPTIONS:${c.reset}
  ${c.cyan}--all, -a${c.reset}                 Select ALL skills
  ${c.cyan}--category, -c <name>${c.reset}     Filter or install skills in a specific category
  ${c.cyan}-g, --global${c.reset}              Target global agent skills directory
  ${c.cyan}--dest, -d <path>${c.reset}         Target a specific custom directory
  ${c.cyan}--type, -t <agent>${c.reset}        Target agent: agents, claude, gemini, cursor, codex, antigravity
  ${c.cyan}--force, -f${c.reset}               Overwrite locally modified skills during upgrade
  ${c.cyan}--check${c.reset}                   Exit with code 1 if outdated skills exist (for CI)
  ${c.cyan}--dry-run${c.reset}                 Preview changes without modifying files
  ${c.cyan}--json${c.reset}                    Output machine-readable JSON

${c.bold}EXAMPLES:${c.reset}
  ${c.gray}# Install a single skill into current project:${c.reset}
  npx dev-marketplace add apple-design

  ${c.gray}# Install multiple design & review skills:${c.reset}
  npx dev-marketplace add impeccable improve requesting-code-review

  ${c.gray}# Check for updates and upgrade installed skills:${c.reset}
  npx dev-marketplace status
  npx dev-marketplace upgrade

  ${c.gray}# Remove an installed skill or audit health:${c.reset}
  npx dev-marketplace remove apple-design
  npx dev-marketplace doctor
`);
  return 0;
}

function main(argv = process.argv.slice(2)) {
  const command = argv[0] ? argv[0].toLowerCase() : "help";
  const rest = argv.slice(1);
  const registry = loadRegistry();

  let exitCode = 0;
  switch (command) {
    case "list":
    case "ls":
      exitCode = cmdList(rest, registry);
      break;
    case "search":
    case "find":
      exitCode = cmdSearch(rest, registry);
      break;
    case "add":
    case "install":
      exitCode = cmdAdd(rest, registry);
      break;
    case "upgrade":
    case "update":
      exitCode = cmdUpgrade(rest, registry);
      break;
    case "remove":
    case "uninstall":
    case "rm":
      exitCode = cmdRemove(rest, registry);
      break;
    case "status":
    case "outdated":
      exitCode = cmdStatus(rest, registry);
      break;
    case "doctor":
      exitCode = cmdDoctor(rest, registry);
      break;
    case "info":
      exitCode = cmdInfo(rest, registry);
      break;
    case "categories":
    case "cats":
      exitCode = cmdCategories(rest, registry);
      break;
    case "help":
    case "--help":
    case "-h":
      exitCode = cmdHelp(registry);
      break;
    case "--version":
    case "-v":
    case "version":
      console.log(PKG.version);
      exitCode = 0;
      break;
    default: {
      const match = registry.find((s) => s.name.toLowerCase() === command);
      if (match) {
        exitCode = cmdAdd([command, ...rest], registry);
      } else {
        exitCode = cmdList(argv, registry);
      }
      break;
    }
  }

  if (exitCode !== 0) {
    process.exitCode = exitCode;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadRegistry,
  resolveDestination,
  SUPPORTED_TYPES,
  main,
};
