#!/usr/bin/env node

/**
 * Dev Marketplace CLI
 * Installs and manages agent skills and connectors for Claude Code, Cursor, Antigravity, and Codex.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");

// ANSI Colors
const c = {
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
};

const ROOT_DIR = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(ROOT_DIR, "skills");
const REGISTRY_PATH = path.join(ROOT_DIR, "registry.json");

// Load registry
function loadRegistry() {
  if (fs.existsSync(REGISTRY_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
    } catch (e) {
      // Fallback to scanning skills directory
    }
  }

  // Scan skills directory
  const skills = [];
  if (fs.existsSync(SKILLS_DIR)) {
    for (const name of fs.readdirSync(SKILLS_DIR)) {
      const skillPath = path.join(SKILLS_DIR, name);
      if (fs.statSync(skillPath).isDirectory()) {
        const skillMd = path.join(skillPath, "SKILL.md");
        let desc = "";
        if (fs.existsSync(skillMd)) {
          const content = fs.readFileSync(skillMd, "utf8");
          const m = content.match(/description:\s*["']?([^"'\n\r]+)["']?/i);
          if (m) desc = m[1].trim();
        }
        skills.push({
          name,
          category: "General",
          description: desc || "Agent skill",
          path: `skills/${name}`,
        });
      }
    }
  }
  return skills;
}

// Destination path resolver
function resolveDestination(options) {
  if (options.dest) {
    return path.resolve(process.cwd(), options.dest);
  }

  const isGlobal = options.global;
  const home = os.homedir();

  if (isGlobal) {
    if (options.type === "claude") return path.join(home, ".claude", "skills");
    if (options.type === "gemini") return path.join(home, ".gemini", "skills");
    return path.join(home, ".agents", "skills");
  }

  // Local detection
  const cwd = process.cwd();
  if (options.type === "claude" || fs.existsSync(path.join(cwd, ".claude"))) {
    return path.join(cwd, ".claude", "skills");
  }
  if (options.type === "gemini" || fs.existsSync(path.join(cwd, ".gemini"))) {
    return path.join(cwd, ".gemini", "skills");
  }
  if (fs.existsSync(path.join(cwd, ".agents", "skills"))) {
    return path.join(cwd, ".agents", "skills");
  }

  // Default to .agents/skills (cross-agent open standard)
  return path.join(cwd, ".agents", "skills");
}

// Copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Command: List
function cmdList(args, registry) {
  let categoryFilter = null;
  let searchTerm = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--category" || args[i] === "-c") {
      categoryFilter = args[++i];
    } else if (!args[i].startsWith("-")) {
      searchTerm = args[i].toLowerCase();
    }
  }

  let filtered = registry;
  if (categoryFilter) {
    filtered = filtered.filter((s) =>
      s.category.toLowerCase().includes(categoryFilter.toLowerCase()),
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

  console.log(
    `\n${c.bold}${c.cyan}Dev Marketplace${c.reset} — ${c.yellow}${filtered.length}${c.reset} skills available\n`,
  );

  // Group by category
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
}

// Command: Add / Install
function cmdAdd(args, registry) {
  const options = {
    all: false,
    global: false,
    dest: null,
    category: null,
    type: null,
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
    } else if (!arg.startsWith("-")) {
      skillsToInstall.push(arg);
    }
  }

  let targetSkills = [];

  if (options.all) {
    targetSkills = registry;
  } else if (options.category) {
    targetSkills = registry.filter((s) =>
      s.category.toLowerCase().includes(options.category.toLowerCase()),
    );
  } else if (skillsToInstall.length > 0) {
    for (const name of skillsToInstall) {
      const match = registry.find(
        (s) => s.name.toLowerCase() === name.toLowerCase(),
      );
      if (match) {
        targetSkills.push(match);
      } else {
        // Check if directory exists even if not in registry
        const customDir = path.join(SKILLS_DIR, name);
        if (fs.existsSync(customDir)) {
          targetSkills.push({ name, path: `skills/${name}` });
        } else {
          console.error(`${c.red}✖ Skill not found:${c.reset} ${name}`);
        }
      }
    }
  } else {
    console.log(
      `${c.yellow}No skills specified.${c.reset} Use ${c.cyan}npx dev-marketplace add <skill-name>${c.reset} or ${c.cyan}--all${c.reset}`,
    );
    return;
  }

  if (targetSkills.length === 0) {
    console.log(`${c.yellow}No matching skills found to install.${c.reset}`);
    return;
  }

  const destBase = resolveDestination(options);
  console.log(
    `\n${c.bold}Installing ${c.cyan}${targetSkills.length}${c.reset} skill(s) to: ${c.green}${destBase}${c.reset}\n`,
  );

  let count = 0;
  for (const skill of targetSkills) {
    const src = path.join(ROOT_DIR, skill.path || `skills/${skill.name}`);
    const dest = path.join(destBase, skill.name);

    if (!fs.existsSync(src)) {
      console.warn(`${c.yellow}⚠ Source missing:${c.reset} ${src}`);
      continue;
    }

    try {
      copyDir(src, dest);
      console.log(
        `  ${c.green}✓${c.reset} Installed ${c.bold}${skill.name}${c.reset}`,
      );
      count++;
    } catch (err) {
      console.error(
        `  ${c.red}✖ Failed to install ${skill.name}:${c.reset} ${err.message}`,
      );
    }
  }

  console.log(
    `\n${c.bold}${c.green}✨ Successfully installed ${count} skill(s)!${c.reset}\n`,
  );
}

// Command: Info
function cmdInfo(args, registry) {
  const name = args[0];
  if (!name) {
    console.log(
      `${c.yellow}Please provide a skill name:${c.reset} npx dev-marketplace info <skill-name>`,
    );
    return;
  }

  const skill = registry.find(
    (s) => s.name.toLowerCase() === name.toLowerCase(),
  );
  if (!skill) {
    console.error(`${c.red}✖ Skill not found:${c.reset} ${name}`);
    return;
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

  const skillPath = path.join(ROOT_DIR, skill.path || `skills/${skill.name}`);
  if (fs.existsSync(skillPath)) {
    console.log(`\n${c.bold}Files:${c.reset}`);
    const files = fs.readdirSync(skillPath);
    for (const f of files) {
      console.log(`  - ${f}`);
    }
  }

  console.log(`\n${c.bold}Install Command:${c.reset}`);
  console.log(`  ${c.green}npx dev-marketplace add ${skill.name}${c.reset}\n`);
}

// Command: Categories
function cmdCategories(registry) {
  const categories = {};
  for (const s of registry) {
    const cat = s.category || "Other";
    categories[cat] = (categories[cat] || 0) + 1;
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
}

// Command: Help
function cmdHelp() {
  console.log(`
${c.bold}${c.cyan}Dev Marketplace CLI${c.reset}
120+ Curated AI Agent Skills & Connectors for Developers

${c.bold}USAGE:${c.reset}
  npx dev-marketplace <command> [options]
  npx skills add <skill-name>

${c.bold}COMMANDS:${c.reset}
  ${c.green}list, ls${c.reset} [filter]           List all skills (optionally filter by name/category)
  ${c.green}add, install${c.reset} <names...>   Install one or more skills to local/global agents
  ${c.green}info${c.reset} <name>              Show detailed information and files for a skill
  ${c.green}categories${c.reset}                 List all available skill categories
  ${c.green}help${c.reset}                       Show this help message

${c.bold}OPTIONS FOR 'add':${c.reset}
  ${c.cyan}--all, -a${c.reset}               Install ALL skills from the marketplace
  ${c.cyan}--category, -c <name>${c.reset}   Install all skills in a specific category
  ${c.cyan}-g, --global${c.reset}            Install globally to ~/.agents/skills or ~/.claude/skills
  ${c.cyan}--dest, -d <path>${c.reset}       Install to a specific custom directory
  ${c.cyan}--type, -t <agent>${c.reset}      Target specific agent format: agents, claude, or gemini

${c.bold}EXAMPLES:${c.reset}
  ${c.gray}# Install a single skill into current project:${c.reset}
  npx dev-marketplace add apple-design

  ${c.gray}# Install multiple design & review skills:${c.reset}
  npx dev-marketplace add impeccable improve code-review

  ${c.gray}# Install all video & animation skills:${c.reset}
  npx dev-marketplace add --category "Video & Motion"

  ${c.gray}# Install the entire marketplace globally:${c.reset}
  npx dev-marketplace add --all --global

  ${c.gray}# Using the official skills.sh CLI convention:${c.reset}
  npx skills add kingjethro999/dev-marketplace --skill apple-design
`);
}

// Main Runner
function main() {
  const args = process.argv.slice(2);
  const command = args[0] ? args[0].toLowerCase() : "help";
  const rest = args.slice(1);

  const registry = loadRegistry();

  switch (command) {
    case "list":
    case "ls":
      cmdList(rest, registry);
      break;
    case "add":
    case "install":
      cmdAdd(rest, registry);
      break;
    case "info":
      cmdInfo(rest, registry);
      break;
    case "categories":
    case "cats":
      cmdCategories(registry);
      break;
    case "help":
    case "--help":
    case "-h":
      cmdHelp();
      break;
    default:
      // If user typed: npx dev-marketplace <skill-name>
      const match = registry.find((s) => s.name.toLowerCase() === command);
      if (match) {
        cmdAdd([command, ...rest], registry);
      } else {
        cmdList(args, registry);
      }
      break;
  }
}

main();
