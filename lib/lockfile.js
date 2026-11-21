const fs = require("node:fs");
const path = require("node:path");
const {
  hashDirectory,
  resolveSafeChildPath,
  asciiSort,
} = require("./skill-utils");

const LOCKFILE_NAME = ".dev-marketplace.lock.json";
const LOCKFILE_VERSION = 1;

function getLockfilePath(destBase) {
  return path.join(destBase, LOCKFILE_NAME);
}

function readLockfile(destBase) {
  const lockPath = getLockfilePath(destBase);
  if (!fs.existsSync(lockPath)) {
    return {
      valid: true,
      exists: false,
      data: {
        lockfileVersion: LOCKFILE_VERSION,
        skills: {},
      },
    };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.skills !== "object" ||
      Array.isArray(parsed.skills)
    ) {
      return {
        valid: false,
        exists: true,
        error: "Invalid lockfile schema",
        data: { lockfileVersion: LOCKFILE_VERSION, skills: {} },
      };
    }
    return {
      valid: true,
      exists: true,
      data: {
        lockfileVersion: parsed.lockfileVersion || LOCKFILE_VERSION,
        cliVersion: parsed.cliVersion,
        skills: { ...parsed.skills },
      },
    };
  } catch (err) {
    return {
      valid: false,
      exists: true,
      error: `Failed to parse lockfile: ${err.message}`,
      data: { lockfileVersion: LOCKFILE_VERSION, skills: {} },
    };
  }
}

function writeLockfile(destBase, lockData, cliVersion) {
  if (!fs.existsSync(destBase)) {
    fs.mkdirSync(destBase, { recursive: true });
  }
  const sortedSkills = {};
  for (const name of Object.keys(lockData.skills || {}).sort(asciiSort)) {
    sortedSkills[name] = lockData.skills[name];
  }
  const payload = {
    lockfileVersion: LOCKFILE_VERSION,
    cliVersion: cliVersion || lockData.cliVersion || "1.0.0",
    skills: sortedSkills,
  };
  fs.writeFileSync(
    getLockfilePath(destBase),
    JSON.stringify(payload, null, 2) + "\n",
    "utf8",
  );
  return payload;
}

function inspectInstalledSkills(destBase, registry, skillsDir) {
  const registryMap = new Map(registry.map((s) => [s.name, s]));
  const lockResult = readLockfile(destBase);
  const lockSkills = lockResult.data.skills || {};

  if (!fs.existsSync(destBase)) {
    return {
      destination: destBase,
      exists: false,
      lockfile: lockResult,
      skills: [],
      orphanedLockEntries: Object.keys(lockSkills).sort(asciiSort),
    };
  }

  const installedDirs = fs
    .readdirSync(destBase, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort(asciiSort);

  const installedSet = new Set(installedDirs);
  const orphanedLockEntries = Object.keys(lockSkills)
    .filter((name) => !installedSet.has(name))
    .sort(asciiSort);

  const skills = [];
  for (const name of installedDirs) {
    const installedPath = path.join(destBase, name);
    const localHash = hashDirectory(installedPath);
    const lockEntry = lockSkills[name] || null;
    const regEntry = registryMap.get(name) || null;

    let registryHash = regEntry?.hash || null;
    if (!registryHash && regEntry && skillsDir) {
      const srcPath = resolveSafeChildPath(skillsDir, name);
      if (srcPath && fs.existsSync(srcPath)) {
        registryHash = hashDirectory(srcPath);
      }
    }

    let state;
    if (!regEntry) {
      state = "custom";
    } else if (registryHash && localHash === registryHash) {
      state = "up-to-date";
    } else if (lockEntry) {
      if (localHash === lockEntry.hash) {
        state = "outdated";
      } else {
        state = "modified";
      }
    } else {
      state = "untracked";
    }

    skills.push({
      name,
      category: regEntry?.category || lockEntry?.category || "Custom",
      state,
      localHash,
      lockedHash: lockEntry?.hash || null,
      registryHash,
      installedAt: lockEntry?.installedAt || null,
      updatedAt: lockEntry?.updatedAt || null,
      path: installedPath,
    });
  }

  return {
    destination: destBase,
    exists: true,
    lockfile: lockResult,
    skills,
    orphanedLockEntries,
  };
}

function scoreSkillMatch(skill, rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return 0;
  const tokens = query.split(/\s+/).filter(Boolean);

  const name = (skill.name || "").toLowerCase();
  const title = (skill.title || "").toLowerCase();
  const category = (skill.category || "").toLowerCase();
  const desc = (skill.description || "").toLowerCase();
  const tags = (skill.tags || []).map((t) => String(t).toLowerCase());

  let score = 0;

  if (name === query) score += 100;
  else if (name.startsWith(query)) score += 60;
  else if (name.includes(query)) score += 40;

  if (title === query) score += 50;
  else if (title.includes(query)) score += 25;

  if (tags.includes(query)) score += 35;
  else if (tags.some((t) => t.includes(query))) score += 20;

  if (category.includes(query)) score += 15;
  if (desc.includes(query)) score += 10;

  if (tokens.length > 1) {
    let matchedTokens = 0;
    for (const token of tokens) {
      const hit =
        name.includes(token) ||
        title.includes(token) ||
        tags.some((t) => t.includes(token)) ||
        category.includes(token) ||
        desc.includes(token);
      if (hit) {
        matchedTokens++;
        if (name.includes(token)) score += 15;
        else if (tags.some((t) => t.includes(token))) score += 10;
        else score += 5;
      }
    }
    if (matchedTokens === tokens.length) {
      score += 20;
    }
  }

  return score;
}

module.exports = {
  LOCKFILE_NAME,
  LOCKFILE_VERSION,
  getLockfilePath,
  readLockfile,
  writeLockfile,
  inspectInstalledSkills,
  scoreSkillMatch,
};
