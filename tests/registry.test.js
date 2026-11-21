const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const {
  parseFrontmatter,
  hashDirectory,
  isSafeSkillName,
} = require("../lib/skill-utils");
const { buildRegistry } = require("../scripts/build-registry");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test("parseFrontmatter parses scalar, quoted, folded multiline, and list fields", () => {
  const md = `---
name: sample-skill
title: "Sample Skill"
description: >
  First line of description
  second line of description.
category: Engineering & Workflow
version: 1.2.0
tags:
  - alpha
  - beta-tag
files:
  - SKILL.md
  - scripts/run.js
---

# Body
`;
  const fm = parseFrontmatter(md);
  assert.equal(fm.name, "sample-skill");
  assert.equal(fm.title, "Sample Skill");
  assert.equal(
    fm.description,
    "First line of description second line of description.",
  );
  assert.equal(fm.category, "Engineering & Workflow");
  assert.equal(fm.version, "1.2.0");
  assert.deepEqual(fm.tags, ["alpha", "beta-tag"]);
  assert.deepEqual(fm.files, ["SKILL.md", "scripts/run.js"]);
});

test("parseFrontmatter returns null when no frontmatter block is present", () => {
  assert.equal(parseFrontmatter("# No Frontmatter\nHello"), null);
});

test("hashDirectory produces deterministic SHA-256 and detects content edits while ignoring node_modules", () => {
  const dir = makeTempDir("dm-hash-");
  try {
    fs.writeFileSync(path.join(dir, "SKILL.md"), "---\nname: a\n---\nhello\n");
    fs.mkdirSync(path.join(dir, "node_modules", "pkg"), { recursive: true });
    fs.writeFileSync(
      path.join(dir, "node_modules", "pkg", "index.js"),
      "module.exports = 1;\n",
    );

    const h1 = hashDirectory(dir);
    assert.match(h1, /^[a-f0-9]{64}$/);

    // Modifying node_modules should NOT change hash
    fs.writeFileSync(
      path.join(dir, "node_modules", "pkg", "index.js"),
      "module.exports = 2;\n",
    );
    assert.equal(hashDirectory(dir), h1);

    // Modifying real skill file MUST change hash
    fs.writeFileSync(path.join(dir, "SKILL.md"), "---\nname: a\n---\nworld\n");
    assert.notEqual(hashDirectory(dir), h1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("isSafeSkillName rejects path traversal and invalid names", () => {
  assert.equal(isSafeSkillName("apple-design"), true);
  assert.equal(isSafeSkillName("ci-cd"), true);
  assert.equal(isSafeSkillName("skill_v2.1"), true);
  assert.equal(isSafeSkillName("../package.json"), false);
  assert.equal(isSafeSkillName(".."), false);
  assert.equal(isSafeSkillName("foo/bar"), false);
  assert.equal(isSafeSkillName("foo\\bar"), false);
  assert.equal(isSafeSkillName(""), false);
  assert.equal(isSafeSkillName(".hidden"), false);
});

test("buildRegistry merges existing categories, indexes new skills, and computes hashes", () => {
  const root = makeTempDir("dm-reg-");
  try {
    const skillsDir = path.join(root, "skills");
    fs.mkdirSync(path.join(skillsDir, "alpha-skill"), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, "beta-skill", "scripts"), {
      recursive: true,
    });

    // alpha-skill omits category in SKILL.md -> should inherit from existing registry
    fs.writeFileSync(
      path.join(skillsDir, "alpha-skill", "SKILL.md"),
      "---\nname: alpha-skill\ndescription: Alpha description\n---\n# Alpha\n",
    );
    // beta-skill is brand new and specifies category & tags in SKILL.md
    fs.writeFileSync(
      path.join(skillsDir, "beta-skill", "SKILL.md"),
      "---\nname: beta-skill\ntitle: Beta Tool\ndescription: Beta description\ncategory: Code Review & Quality\ntags:\n  - beta\n  - security\n---\n# Beta\n",
    );
    fs.writeFileSync(
      path.join(skillsDir, "beta-skill", "scripts", "run.js"),
      "console.log('ok');\n",
    );

    const existingRegPath = path.join(root, "registry.json");
    fs.writeFileSync(
      existingRegPath,
      JSON.stringify([
        {
          name: "alpha-skill",
          title: "Alpha Custom Title",
          description: "Old desc",
          category: "Design & UI",
          path: "skills/alpha-skill",
          tags: ["alpha-skill", "design-ui"],
          files: ["SKILL.md"],
        },
      ]),
    );

    const entries = buildRegistry({
      rootDir: root,
      skillsDir,
      existingRegistryPath: existingRegPath,
    });

    assert.equal(entries.length, 2);
    assert.equal(entries[0].name, "alpha-skill");
    assert.equal(entries[0].category, "Design & UI");
    assert.equal(entries[0].title, "Alpha Custom Title");
    assert.equal(entries[0].description, "Alpha description");
    assert.match(entries[0].hash, /^[a-f0-9]{64}$/);

    assert.equal(entries[1].name, "beta-skill");
    assert.equal(entries[1].title, "Beta Tool");
    assert.equal(entries[1].category, "Code Review & Quality");
    assert.deepEqual(entries[1].tags, ["beta", "security"]);
    assert.deepEqual(entries[1].files, ["SKILL.md", "scripts"]);
    assert.match(entries[1].hash, /^[a-f0-9]{64}$/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("build-registry CLI --check detects drift and exits 0 once synced", () => {
  const root = makeTempDir("dm-reg-cli-");
  try {
    const skillsDir = path.join(root, "skills", "demo");
    fs.mkdirSync(skillsDir, { recursive: true });
    fs.writeFileSync(
      path.join(skillsDir, "SKILL.md"),
      "---\nname: demo\ndescription: Demo skill\ncategory: Developer Tools & AI\n---\n",
    );
    const regPath = path.join(root, "registry.json");
    fs.writeFileSync(regPath, "[]\n");

    const scriptPath = path.resolve(__dirname, "../scripts/build-registry.js");
    const checkDrift = spawnSync(
      process.execPath,
      [scriptPath, "--root", root, "--check"],
      { encoding: "utf8" },
    );
    assert.equal(checkDrift.status, 1);

    const writeRun = spawnSync(process.execPath, [scriptPath, "--root", root], {
      encoding: "utf8",
    });
    assert.equal(writeRun.status, 0);

    const checkSynced = spawnSync(
      process.execPath,
      [scriptPath, "--root", root, "--check"],
      { encoding: "utf8" },
    );
    assert.equal(checkSynced.status, 0);

    // Prettier-style compact JSON formatting should still pass --check
    const parsed = JSON.parse(fs.readFileSync(regPath, "utf8"));
    fs.writeFileSync(regPath, JSON.stringify(parsed) + "\n");
    const checkReformatted = spawnSync(
      process.execPath,
      [scriptPath, "--root", root, "--check"],
      { encoding: "utf8" },
    );
    assert.equal(checkReformatted.status, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
