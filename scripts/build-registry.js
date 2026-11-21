#!/usr/bin/env node

/**
 * Generates or verifies registry.json from the skills/ directory.
 *
 * Usage:
 *   node scripts/build-registry.js           # Write registry.json
 *   node scripts/build-registry.js --check   # Exit 1 if registry.json is out of sync
 *   node scripts/build-registry.js --root <dir>
 */

const fs = require("node:fs");
const path = require("node:path");
const {
  parseFrontmatter,
  hashDirectory,
  titleFromSlug,
  categoryToTag,
  listTopLevelFiles,
  asciiSort,
} = require("../lib/skill-utils");

const DEFAULT_ROOT = path.resolve(__dirname, "..");

function loadExistingRegistryMap(registryPath) {
  const map = new Map();
  if (!registryPath || !fs.existsSync(registryPath)) return map;
  try {
    const parsed = JSON.parse(fs.readFileSync(registryPath, "utf8"));
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item && item.name) map.set(item.name, item);
      }
    }
  } catch {
    // Ignore malformed existing registry and rebuild cleanly
  }
  return map;
}

function buildRegistry(options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const skillsDir = options.skillsDir || path.join(rootDir, "skills");
  const existingRegistryPath =
    options.existingRegistryPath !== undefined
      ? options.existingRegistryPath
      : path.join(rootDir, "registry.json");

  const existingMap = loadExistingRegistryMap(existingRegistryPath);

  if (!fs.existsSync(skillsDir)) {
    return [];
  }

  const dirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort(asciiSort);

  const entries = [];
  for (const dirName of dirs) {
    const skillDir = path.join(skillsDir, dirName);
    const skillMdPath = path.join(skillDir, "SKILL.md");
    const existing = existingMap.get(dirName) || {};

    let fm = null;
    if (fs.existsSync(skillMdPath)) {
      fm = parseFrontmatter(fs.readFileSync(skillMdPath, "utf8"));
    }

    const name = dirName;
    const title = fm?.title || existing.title || titleFromSlug(name);
    const description =
      fm?.description || existing.description || "AI agent skill";
    const category =
      fm?.category || existing.category || "Developer Tools & AI";

    let tags;
    if (Array.isArray(fm?.tags) && fm.tags.length > 0) {
      tags = [...new Set(fm.tags.map((t) => String(t).trim()).filter(Boolean))];
    } else if (Array.isArray(existing.tags) && existing.tags.length > 0) {
      tags = [...existing.tags];
    } else {
      tags = [...new Set([name, categoryToTag(category)])];
    }

    const files = listTopLevelFiles(skillDir);
    const hash = hashDirectory(skillDir);

    const entry = {
      name,
      title,
      description,
      category,
      path: `skills/${name}`,
      tags,
      files,
      hash,
    };

    if (fm?.version) {
      entry.version = String(fm.version);
    }

    entries.push(entry);
  }

  return entries;
}

function serializeRegistry(entries) {
  return JSON.stringify(entries, null, 2) + "\n";
}

const CLAUDE_PLUGIN_NAME_OVERRIDES = {
  "claude-md-management": "md-management",
  "claude-security": "code-security",
};

function toClaudePluginName(skillName) {
  if (CLAUDE_PLUGIN_NAME_OVERRIDES[skillName]) {
    return CLAUDE_PLUGIN_NAME_OVERRIDES[skillName];
  }
  return skillName.replace(/^(claude-|anthropic-|anthropics-|cc-plugin-)/i, "");
}

function buildClaudeMarketplace(entries) {
  const plugins = entries.map((entry) => {
    const plugin = {
      name: toClaudePluginName(entry.name),
      source: `./skills/${entry.name}`,
      description: entry.description || "AI agent skill",
    };
    if (entry.version) {
      plugin.version = String(entry.version);
    }
    if (entry.category) {
      plugin.category = entry.category;
    }
    if (Array.isArray(entry.tags) && entry.tags.length > 0) {
      plugin.keywords = [...entry.tags];
    }
    return plugin;
  });

  return {
    $schema: "https://anthropic.com/claude-code/marketplace.schema.json",
    name: "dev-marketplace",
    description:
      "Curated marketplace of 133+ AI agent skills, security auditors, architecture blueprints, and automated engineering workflows for Claude Code and AI coding assistants.",
    owner: {
      name: "kingjethro999",
    },
    plugins,
  };
}

function serializeClaudeMarketplace(manifest) {
  return JSON.stringify(manifest, null, 2) + "\n";
}

function main() {
  const args = process.argv.slice(2);
  let checkOnly = false;
  let rootDir = DEFAULT_ROOT;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--check") {
      checkOnly = true;
    } else if (args[i] === "--root" && args[i + 1]) {
      rootDir = path.resolve(args[++i]);
    }
  }

  const registryPath = path.join(rootDir, "registry.json");
  const claudeMarketplacePath = path.join(
    rootDir,
    ".claude-plugin",
    "marketplace.json",
  );
  const entries = buildRegistry({ rootDir });
  const serialized = serializeRegistry(entries);
  const claudeManifest = buildClaudeMarketplace(entries);
  const serializedClaude = serializeClaudeMarketplace(claudeManifest);

  if (checkOnly) {
    let regMatches = false;
    if (fs.existsSync(registryPath)) {
      try {
        const parsedCurrent = JSON.parse(fs.readFileSync(registryPath, "utf8"));
        regMatches = JSON.stringify(parsedCurrent) === JSON.stringify(entries);
      } catch {
        regMatches = false;
      }
    }
    let claudeMatches = false;
    if (fs.existsSync(claudeMarketplacePath)) {
      try {
        const parsedClaude = JSON.parse(
          fs.readFileSync(claudeMarketplacePath, "utf8"),
        );
        claudeMatches =
          JSON.stringify(parsedClaude) === JSON.stringify(claudeManifest);
      } catch {
        claudeMatches = false;
      }
    }
    if (!regMatches || !claudeMatches) {
      if (!regMatches) {
        console.error(
          `✖ registry.json is out of sync with skills/ (${entries.length} skills discovered). Run: npm run build-registry`,
        );
      }
      if (!claudeMatches) {
        console.error(
          `✖ .claude-plugin/marketplace.json is out of sync with skills/ (${entries.length} skills discovered). Run: npm run build-registry`,
        );
      }
      process.exit(1);
    }
    console.log(
      `✓ registry.json and .claude-plugin/marketplace.json are up to date (${entries.length} skills).`,
    );
    return;
  }

  fs.writeFileSync(registryPath, serialized, "utf8");
  fs.mkdirSync(path.dirname(claudeMarketplacePath), { recursive: true });
  fs.writeFileSync(claudeMarketplacePath, serializedClaude, "utf8");
  console.log(
    `✓ Built registry.json and .claude-plugin/marketplace.json with ${entries.length} skills`,
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  buildRegistry,
  serializeRegistry,
  buildClaudeMarketplace,
  serializeClaudeMarketplace,
};
