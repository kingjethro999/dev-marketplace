const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { validateMarketplace } = require("../scripts/validate-skills");
const {
  buildRegistry,
  serializeRegistry,
} = require("../scripts/build-registry");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function createValidTempMarketplace() {
  const root = makeTempDir("dm-val-");
  const skillDir = path.join(root, "skills", "good-skill");
  fs.mkdirSync(path.join(skillDir, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(skillDir, "config"), { recursive: true });
  fs.writeFileSync(
    path.join(skillDir, "SKILL.md"),
    `---
name: good-skill
description: A valid test skill
category: Developer Tools & AI
files:
  - SKILL.md
  - scripts/run.js
  - config/default.json
---
# Good Skill
`,
  );
  fs.writeFileSync(
    path.join(skillDir, "scripts", "run.js"),
    "console.log('ok');\n",
  );
  fs.writeFileSync(
    path.join(skillDir, "config", "default.json"),
    '{"enabled": true}\n',
  );
  const reg = buildRegistry({ rootDir: root });
  fs.writeFileSync(path.join(root, "registry.json"), serializeRegistry(reg));
  return root;
}

test("validateMarketplace passes on a valid marketplace", () => {
  const root = createValidTempMarketplace();
  try {
    const res = validateMarketplace({ rootDir: root });
    assert.equal(res.ok, true);
    assert.deepEqual(res.errors, []);
    assert.equal(res.skillCount, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("validateMarketplace flags missing SKILL.md and missing declared files", () => {
  const root = createValidTempMarketplace();
  try {
    fs.mkdirSync(path.join(root, "skills", "broken-no-md"), {
      recursive: true,
    });
    fs.unlinkSync(
      path.join(root, "skills", "good-skill", "config", "default.json"),
    );

    const res = validateMarketplace({ rootDir: root });
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => e.includes("broken-no-md")));
    assert.ok(res.errors.some((e) => e.includes("config/default.json")));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("validateMarketplace flags invalid JSON, JS syntax errors, and registry hash drift", () => {
  const root = createValidTempMarketplace();
  try {
    fs.writeFileSync(
      path.join(root, "skills", "good-skill", "config", "default.json"),
      "{ invalid json",
    );
    fs.writeFileSync(
      path.join(root, "skills", "good-skill", "scripts", "run.js"),
      "function broken( {\n",
    );

    const res = validateMarketplace({ rootDir: root });
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => e.includes("Invalid JSON")));
    assert.ok(res.errors.some((e) => e.includes("JS syntax error")));
    assert.ok(res.errors.some((e) => e.includes("hash mismatch")));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
