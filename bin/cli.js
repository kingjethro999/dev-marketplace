#!/usr/bin/env node

/**
 * Dev Marketplace CLI
 * Installs and manages agent skills and connectors for Claude Code, Cursor, Antigravity, and Codex.
 */

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const {
  parseFrontmatter,
  resolveSafeChildPath,
  copyDirClean,
  isSafeSkillName,
} = require("../lib/skill-utils");

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
const REGISTRY_PATH = path.join(ROOT_DIR, "registry.json");

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

function cmdList(args, registry) {
  let categoryFilter = null;
  let searchTerm = null;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--category" || args[i] === "-c") {
      categoryFilter = args[++i];
    } else if (args[i] === "--json") {
      jsonOutput = true;
    } else if (!args[i].startsWith("-")) {
      searchTerm = args[i].toLowerCase();
    }
  }

  let filtered = registry;
  if (categoryFilter) {
    filtered = filtered.filter((s) =>
      (s.category || "").toLowerCase().includes(categoryFilter.toLowerCase()),
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

  if (jsonOutput) {
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

function cmdAdd(args, registry) {
  const options = {
    all: false,
    global: false,
    dest: null,
    category: null,
    type: null,
    dryRun: false,
    json: false,
  };

  const skillsToInstall = [];

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
    } else if (arg === "--json") {
      options.json = true;
    } else if (!arg.startsWith("-")) {
      skillsToInstall.push(arg);
    }
  }

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
          targetSkills.push({ name, path: `skills/${name}` });
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
      copyDirClean(src, dest);
      installed.push({ name: skill.name, destination: dest });
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
${c.bold}${c.cyan}Dev Marketplace CLI${c.reset}
${countLabel} Curated AI Agent Skills & Connectors for Developers

${c.bold}USAGE:${c.reset}
  npx dev-marketplace <command> [options]
  npx skills add kingjethro999/dev-marketplace --skill <skill-name>

${c.bold}COMMANDS:${c.reset}
  ${c.green}list, ls${c.reset} [filter]         List all skills (optionally filter by name/category)
  ${c.green}add, install${c.reset} <names...>   Install one or more skills to local/global agents
  ${c.green}info${c.reset} <name>               Show detailed information and files for a skill
  ${c.green}categories${c.reset}                List all available skill categories
  ${c.green}help${c.reset}                      Show this help message

${c.bold}OPTIONS:${c.reset}
  ${c.cyan}--all, -a${c.reset}                 Select ALL skills from the marketplace
  ${c.cyan}--category, -c <name>${c.reset}     Filter or install skills in a specific category
  ${c.cyan}-g, --global${c.reset}              Target global agent skills directory
  ${c.cyan}--dest, -d <path>${c.reset}         Target a specific custom directory
  ${c.cyan}--type, -t <agent>${c.reset}        Target agent: agents, claude, gemini, cursor, codex, antigravity
  ${c.cyan}--dry-run${c.reset}                 Preview changes without modifying files
  ${c.cyan}--json${c.reset}                    Output machine-readable JSON

${c.bold}EXAMPLES:${c.reset}
  ${c.gray}# Install a single skill into current project:${c.reset}
  npx dev-marketplace add apple-design

  ${c.gray}# Install multiple design & review skills:${c.reset}
  npx dev-marketplace add impeccable improve requesting-code-review

  ${c.gray}# Install all video & animation skills:${c.reset}
  npx dev-marketplace add --category "Video & Motion"

  ${c.gray}# Install the entire marketplace globally:${c.reset}
  npx dev-marketplace add --all --global

  ${c.gray}# Using the official skills.sh CLI convention:${c.reset}
  npx skills add kingjethro999/dev-marketplace --skill apple-design
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
    case "add":
    case "install":
      exitCode = cmdAdd(rest, registry);
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
