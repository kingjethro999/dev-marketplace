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
  const entries = buildRegistry({ rootDir });
  const serialized = serializeRegistry(entries);

  if (checkOnly) {
    let matches = false;
    if (fs.existsSync(registryPath)) {
      try {
        const parsedCurrent = JSON.parse(fs.readFileSync(registryPath, "utf8"));
        matches = JSON.stringify(parsedCurrent) === JSON.stringify(entries);
      } catch {
        matches = false;
      }
    }
    if (!matches) {
      console.error(
        `✖ registry.json is out of sync with skills/ (${entries.length} skills discovered). Run: npm run build-registry`,
      );
      process.exit(1);
    }
    console.log(`✓ registry.json is up to date (${entries.length} skills).`);
    return;
  }

  fs.writeFileSync(registryPath, serialized, "utf8");
  console.log(
    `✓ Built registry.json with ${entries.length} skills at ${registryPath}`,
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  buildRegistry,
  serializeRegistry,
};
