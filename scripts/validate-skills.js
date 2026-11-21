#!/usr/bin/env node

/**
 * Validates all marketplace skills, registry.json integrity, JSON configs,
 * and JavaScript syntax across the repository.
 *
 * Usage:
 *   node scripts/validate-skills.js [--root <dir>] [--json]
 */

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
  IGNORED_ENTRIES,
  parseFrontmatter,
  hashDirectory,
  isSafeSkillName,
  asciiSort,
} = require("../lib/skill-utils");

const DEFAULT_ROOT = path.resolve(__dirname, "..");

function walkFiles(dirPath, predicate, acc = []) {
  if (!fs.existsSync(dirPath)) return acc;
  const entries = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .sort((a, b) => asciiSort(a.name, b.name));

  for (const entry of entries) {
    if (IGNORED_ENTRIES.has(entry.name)) continue;
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "fixtures" || entry.name === "vendor") continue;
      walkFiles(full, predicate, acc);
    } else if (entry.isFile() && predicate(full, entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function validateMarketplace(options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const skillsDir = path.join(rootDir, "skills");
  const registryPath = path.join(rootDir, "registry.json");

  const errors = [];
  const warnings = [];

  if (!fs.existsSync(skillsDir)) {
    return {
      ok: false,
      skillCount: 0,
      errors: [`Missing skills/ directory at ${skillsDir}`],
      warnings,
    };
  }

  const skillDirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort(asciiSort);

  // 1. Validate each skill's SKILL.md, declared files, JSON files, and JS scripts
  const actualHashes = new Map();
  for (const name of skillDirs) {
    if (!isSafeSkillName(name)) {
      errors.push(`Skill directory has unsafe name: ${name}`);
      continue;
    }

    const skillPath = path.join(skillsDir, name);
    const skillMdPath = path.join(skillPath, "SKILL.md");

    if (!fs.existsSync(skillMdPath)) {
      errors.push(`skills/${name}: missing required SKILL.md`);
      continue;
    }

    const mdContent = fs.readFileSync(skillMdPath, "utf8");
    const fm = parseFrontmatter(mdContent);
    if (!fm) {
      errors.push(`skills/${name}/SKILL.md: missing YAML frontmatter`);
    } else {
      if (!fm.name) {
        errors.push(`skills/${name}/SKILL.md: frontmatter missing "name"`);
      }
      if (!fm.description) {
        errors.push(
          `skills/${name}/SKILL.md: frontmatter missing "description"`,
        );
      }
      if (Array.isArray(fm.files)) {
        for (const declared of fm.files) {
          const declaredPath = path.join(skillPath, declared);
          if (!fs.existsSync(declaredPath)) {
            errors.push(
              `skills/${name}/SKILL.md: declared file "${declared}" does not exist`,
            );
          }
        }
      }
    }

    // Validate JSON files inside skill (excluding fixtures/node_modules)
    const jsonFiles = walkFiles(skillPath, (_full, fname) =>
      fname.endsWith(".json"),
    );
    for (const jf of jsonFiles) {
      try {
        JSON.parse(fs.readFileSync(jf, "utf8"));
      } catch (err) {
        const rel = path.relative(rootDir, jf);
        errors.push(`${rel}: Invalid JSON (${err.message})`);
      }
    }

    // Syntax-check JS scripts inside skill (excluding workflow runner snippets)
    const jsFiles = walkFiles(skillPath, (full, fname) => {
      if (!/\.(js|mjs|cjs)$/.test(fname)) return false;
      const rel = path.relative(skillPath, full).split(path.sep);
      if (rel.includes("workflows")) return false;
      return true;
    });

    for (const jsf of jsFiles) {
      const check = spawnSync(process.execPath, ["--check", jsf], {
        encoding: "utf8",
      });
      if (check.status !== 0) {
        const rel = path.relative(rootDir, jsf);
        const firstLine = (check.stderr || "")
          .trim()
          .split("\n")
          .slice(0, 3)
          .join(" | ");
        errors.push(`${rel}: JS syntax error (${firstLine})`);
      }
    }

    actualHashes.set(name, hashDirectory(skillPath));
  }

  // 2. Validate core repo JS files if present
  for (const dirName of ["bin", "lib", "scripts"]) {
    const coreDir = path.join(rootDir, dirName);
    const coreJs = walkFiles(coreDir, (_full, fname) =>
      /\.(js|mjs|cjs)$/.test(fname),
    );
    for (const jsf of coreJs) {
      const check = spawnSync(process.execPath, ["--check", jsf], {
        encoding: "utf8",
      });
      if (check.status !== 0) {
        const rel = path.relative(rootDir, jsf);
        errors.push(`${rel}: JS syntax error (${(check.stderr || "").trim()})`);
      }
    }
  }

  // 3. Validate registry.json matches skills/ 1-to-1 and hashes are current
  if (!fs.existsSync(registryPath)) {
    errors.push(`Missing registry.json at ${registryPath}`);
  } else {
    try {
      const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
      if (!Array.isArray(registry)) {
        errors.push("registry.json must be a JSON array");
      } else {
        const seen = new Set();
        const regMap = new Map();
        for (const entry of registry) {
          if (!entry || !entry.name) {
            errors.push("registry.json contains entry without a name");
            continue;
          }
          if (seen.has(entry.name)) {
            errors.push(
              `registry.json contains duplicate entry: ${entry.name}`,
            );
          }
          seen.add(entry.name);
          regMap.set(entry.name, entry);
        }

        for (const name of skillDirs) {
          const entry = regMap.get(name);
          if (!entry) {
            errors.push(`registry.json is missing skill: ${name}`);
          } else {
            const actualHash = actualHashes.get(name);
            if (!entry.hash) {
              errors.push(`registry.json entry "${name}" is missing hash`);
            } else if (actualHash && entry.hash !== actualHash) {
              errors.push(
                `registry.json entry "${name}" has hash mismatch (stale registry; run npm run build-registry)`,
              );
            }
          }
        }

        const dirSet = new Set(skillDirs);
        for (const name of regMap.keys()) {
          if (!dirSet.has(name)) {
            errors.push(
              `registry.json references nonexistent skill directory: ${name}`,
            );
          }
        }
      }
    } catch (err) {
      errors.push(`registry.json: Invalid JSON (${err.message})`);
    }
  }

  // 4. Validate .claude-plugin/marketplace.json exists and matches skills/ 1-to-1
  const claudeMarketplacePath = path.join(
    rootDir,
    ".claude-plugin",
    "marketplace.json",
  );
  if (!fs.existsSync(claudeMarketplacePath)) {
    errors.push(
      `Missing .claude-plugin/marketplace.json at ${claudeMarketplacePath}`,
    );
  } else {
    try {
      const manifest = JSON.parse(
        fs.readFileSync(claudeMarketplacePath, "utf8"),
      );
      if (!manifest || typeof manifest !== "object") {
        errors.push(".claude-plugin/marketplace.json must be a JSON object");
      } else {
        if (!manifest.name) {
          errors.push('.claude-plugin/marketplace.json is missing "name"');
        }
        if (!manifest.owner || !manifest.owner.name) {
          errors.push(
            '.claude-plugin/marketplace.json is missing "owner.name"',
          );
        }
        if (!Array.isArray(manifest.plugins)) {
          errors.push(
            '.claude-plugin/marketplace.json "plugins" must be an array',
          );
        } else {
          const sourceMap = new Map();
          const seenPluginNames = new Set();
          for (const plugin of manifest.plugins) {
            if (!plugin || !plugin.name) {
              errors.push(
                ".claude-plugin/marketplace.json contains plugin entry without a name",
              );
              continue;
            }
            if (seenPluginNames.has(plugin.name)) {
              errors.push(
                `.claude-plugin/marketplace.json contains duplicate plugin name: ${plugin.name}`,
              );
            }
            seenPluginNames.add(plugin.name);
            if (
              /^(claude-|anthropic-|anthropics-|cc-plugin-)/i.test(plugin.name)
            ) {
              errors.push(
                `.claude-plugin/marketplace.json contains reserved third-party plugin name: ${plugin.name}`,
              );
            }
            if (plugin.source) {
              sourceMap.set(plugin.source, plugin);
            }
          }

          for (const name of skillDirs) {
            const expectedSource = `./skills/${name}`;
            const p = sourceMap.get(expectedSource);
            if (!p) {
              errors.push(
                `.claude-plugin/marketplace.json is missing plugin for source: ${expectedSource}`,
              );
            }
          }

          const dirSet = new Set(skillDirs.map((n) => `./skills/${n}`));
          for (const src of sourceMap.keys()) {
            if (!dirSet.has(src)) {
              errors.push(
                `.claude-plugin/marketplace.json references nonexistent skill source: ${src}`,
              );
            }
          }
        }
      }
    } catch (err) {
      errors.push(
        `.claude-plugin/marketplace.json: Invalid JSON (${err.message})`,
      );
    }
  }

  return {
    ok: errors.length === 0,
    skillCount: skillDirs.length,
    errors,
    warnings,
  };
}

function main() {
  const args = process.argv.slice(2);
  let rootDir = DEFAULT_ROOT;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--root" && args[i + 1]) {
      rootDir = path.resolve(args[++i]);
    } else if (args[i] === "--json") {
      jsonOutput = true;
    }
  }

  const result = validateMarketplace({ rootDir });

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(
      `✓ All ${result.skillCount} skills, configs, scripts, and registry.json passed validation!`,
    );
  } else {
    console.error(
      `✖ Validation failed with ${result.errors.length} error(s) across ${result.skillCount} skills:`,
    );
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
  }

  if (!result.ok) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateMarketplace,
};
