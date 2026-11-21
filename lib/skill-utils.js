const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const IGNORED_ENTRIES = new Set([
  "node_modules",
  ".git",
  "__pycache__",
  ".DS_Store",
  ".dev-marketplace.lock.json",
]);

function unquoteYaml(val) {
  const trimmed = val.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "\n")
      .replace(/\\\\/g, "\\");
  }
  if (trimmed.length >= 2 && trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  return trimmed;
}

/**
 * Parse YAML frontmatter at the top of a SKILL.md document without external deps.
 */
function parseFrontmatter(markdown) {
  if (typeof markdown !== "string") return null;
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;

  const raw = match[1];
  const lines = raw.split(/\r?\n/);
  const data = {};

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) {
      i++;
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) {
      i++;
      continue;
    }

    const key = keyMatch[1];
    const rest = keyMatch[2].trim();

    // Block scalar (>, >-, >+, |, |-, |+)
    if (/^[>|][+-]?$/.test(rest)) {
      const isFolded = rest.startsWith(">");
      const blockLines = [];
      i++;
      let baseIndent = null;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (!nextLine.trim()) {
          blockLines.push("");
          i++;
          continue;
        }
        const indentMatch = nextLine.match(/^(\s+)/);
        if (!indentMatch) break;
        if (baseIndent === null) baseIndent = indentMatch[1].length;
        if (indentMatch[1].length < baseIndent) break;
        blockLines.push(nextLine.slice(baseIndent));
        i++;
      }
      // Trim trailing empty lines
      while (
        blockLines.length > 0 &&
        blockLines[blockLines.length - 1] === ""
      ) {
        blockLines.pop();
      }
      data[key] = isFolded
        ? blockLines
            .join("\n")
            .replace(/([^\n])\n([^\n])/g, "$1 $2")
            .trim()
        : blockLines.join("\n").trim();
      continue;
    }

    // Empty value -> check for YAML list or nested map
    if (rest === "") {
      const listItems = [];
      let j = i + 1;
      while (j < lines.length) {
        const sub = lines[j];
        if (!sub.trim() || /^\s*#/.test(sub)) {
          j++;
          continue;
        }
        const itemMatch = sub.match(/^\s+-\s+(.*)$/);
        if (itemMatch) {
          listItems.push(unquoteYaml(itemMatch[1]));
          j++;
          continue;
        }
        if (/^\s+/.test(sub)) {
          // Nested map line (skip cleanly)
          j++;
          continue;
        }
        break;
      }
      if (listItems.length > 0) {
        data[key] = listItems;
      }
      i = j;
      continue;
    }

    // Inline flow array: [a, b, c]
    if (rest.startsWith("[") && rest.endsWith("]")) {
      const inner = rest.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(",").map((item) => unquoteYaml(item))
        : [];
      i++;
      continue;
    }

    // Scalar value (with possible indented plain continuation lines)
    let value = rest;
    i++;
    const isQuoted =
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2);
    if (!isQuoted) {
      while (
        i < lines.length &&
        /^\s+\S/.test(lines[i]) &&
        !/^\s+-/.test(lines[i])
      ) {
        value += " " + lines[i].trim();
        i++;
      }
    }
    data[key] = unquoteYaml(value);
  }

  return data;
}

function asciiSort(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Deterministically SHA-256 hash all non-ignored files in a directory.
 */
function hashDirectory(dirPath) {
  const hash = crypto.createHash("sha256");

  function walk(currentDir, relPrefix) {
    const entries = fs
      .readdirSync(currentDir, { withFileTypes: true })
      .filter((entry) => !IGNORED_ENTRIES.has(entry.name))
      .sort((a, b) => asciiSort(a.name, b.name));

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;

      if (entry.isSymbolicLink()) {
        const target = fs.readlinkSync(fullPath);
        hash.update(`L:${relPath}\0${target}\0`);
      } else if (entry.isDirectory()) {
        hash.update(`D:${relPath}\0`);
        walk(fullPath, relPath);
      } else if (entry.isFile()) {
        const content = fs.readFileSync(fullPath);
        hash.update(`F:${relPath}\0${content.length}\0`);
        hash.update(content);
        hash.update("\0");
      }
    }
  }

  walk(dirPath, "");
  return hash.digest("hex");
}

function titleFromSlug(slug) {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function categoryToTag(category) {
  return String(category || "general")
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isSafeSkillName(name) {
  if (typeof name !== "string" || name.length === 0 || name.length > 128) {
    return false;
  }
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    return false;
  }
  return /^[a-z0-9][a-z0-9._-]*$/i.test(name);
}

function resolveSafeChildPath(baseDir, childName) {
  if (!isSafeSkillName(childName)) return null;
  const resolvedBase = path.resolve(baseDir);
  const resolvedChild = path.resolve(resolvedBase, childName);
  const rel = path.relative(resolvedBase, resolvedChild);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }
  return resolvedChild;
}

function listTopLevelFiles(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((e) => !IGNORED_ENTRIES.has(e.name))
    .map((e) => e.name)
    .sort(asciiSort);
}

function copyDirClean(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_ENTRIES.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirClean(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const target = fs.readlinkSync(srcPath);
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      fs.symlinkSync(target, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = {
  IGNORED_ENTRIES,
  parseFrontmatter,
  hashDirectory,
  titleFromSlug,
  categoryToTag,
  isSafeSkillName,
  resolveSafeChildPath,
  listTopLevelFiles,
  copyDirClean,
  asciiSort,
};
