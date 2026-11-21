const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const CLI_PATH = path.resolve(__dirname, "../bin/cli.js");
const LOCKFILE_NAME = ".dev-marketplace.lock.json";

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runCli(args, opts = {}) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    cwd: opts.cwd || process.cwd(),
    env: { ...process.env, NO_COLOR: "1", ...(opts.env || {}) },
    encoding: "utf8",
  });
}

test("add writes lockfile entry and status reports up-to-date", () => {
  const cwd = makeTempDir("dm-life-add-");
  const dest = path.join(cwd, "skills");
  try {
    const addRes = runCli(["add", "apple-design", "--dest", dest], { cwd });
    assert.equal(addRes.status, 0);

    const lockPath = path.join(dest, LOCKFILE_NAME);
    assert.equal(fs.existsSync(lockPath), true);
    const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    assert.equal(lock.lockfileVersion, 1);
    assert.match(lock.skills["apple-design"].hash, /^[a-f0-9]{64}$/);

    const statusRes = runCli(["status", "--dest", dest, "--json"], { cwd });
    assert.equal(statusRes.status, 0);
    const status = JSON.parse(statusRes.stdout);
    assert.equal(status.skills.length, 1);
    assert.equal(status.skills[0].name, "apple-design");
    assert.equal(status.skills[0].state, "up-to-date");
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("status detects outdated skills and upgrade brings them up to date", () => {
  const cwd = makeTempDir("dm-life-upg-");
  const dest = path.join(cwd, "skills");
  try {
    assert.equal(
      runCli(["add", "apple-design", "--dest", dest], { cwd }).status,
      0,
    );

    // Simulate an older installed version: mutate installed file and record that older hash in lockfile
    const installedMd = path.join(dest, "apple-design", "SKILL.md");
    const originalContent = fs.readFileSync(installedMd, "utf8");
    fs.writeFileSync(installedMd, originalContent + "\n<!-- older-v1 -->\n");
    const { hashDirectory } = require("../lib/skill-utils");
    const oldHash = hashDirectory(path.join(dest, "apple-design"));

    const lockPath = path.join(dest, LOCKFILE_NAME);
    const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    lock.skills["apple-design"].hash = oldHash;
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));

    // status --check should exit 1 when outdated skills exist
    const checkRes = runCli(["status", "--dest", dest, "--check", "--json"], {
      cwd,
    });
    assert.equal(checkRes.status, 1);
    const report = JSON.parse(checkRes.stdout);
    assert.equal(report.skills[0].state, "outdated");

    // upgrade --dry-run must NOT modify files
    const dryRes = runCli(["upgrade", "--dest", dest, "--dry-run", "--json"], {
      cwd,
    });
    assert.equal(dryRes.status, 0);
    assert.equal(
      fs.readFileSync(installedMd, "utf8").includes("older-v1"),
      true,
    );

    // Real upgrade restores latest marketplace copy and updates lockfile
    const upgRes = runCli(["upgrade", "--dest", dest, "--json"], { cwd });
    assert.equal(upgRes.status, 0);
    const upgData = JSON.parse(upgRes.stdout);
    assert.deepEqual(
      upgData.upgraded.map((u) => u.name),
      ["apple-design"],
    );
    assert.equal(fs.readFileSync(installedMd, "utf8"), originalContent);

    // status --check now exits 0
    const afterRes = runCli(["status", "--dest", dest, "--check"], { cwd });
    assert.equal(afterRes.status, 0);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("upgrade protects locally modified skills unless --force is provided", () => {
  const cwd = makeTempDir("dm-life-mod-");
  const dest = path.join(cwd, "skills");
  try {
    assert.equal(
      runCli(["add", "apple-design", "--dest", dest], { cwd }).status,
      0,
    );

    const installedMd = path.join(dest, "apple-design", "SKILL.md");
    const originalContent = fs.readFileSync(installedMd, "utf8");
    fs.writeFileSync(installedMd, originalContent + "\n<!-- local edit -->\n");

    const statusRes = runCli(["status", "--dest", dest, "--json"], { cwd });
    const status = JSON.parse(statusRes.stdout);
    assert.equal(status.skills[0].state, "modified");

    // Without --force: must skip and preserve local edit
    const skipRes = runCli(
      ["upgrade", "apple-design", "--dest", dest, "--json"],
      {
        cwd,
      },
    );
    const skipData = JSON.parse(skipRes.stdout);
    assert.equal(skipData.skipped.length, 1);
    assert.equal(skipData.upgraded.length, 0);
    assert.equal(
      fs.readFileSync(installedMd, "utf8").includes("local edit"),
      true,
    );

    // With --force: overwrites local edit
    const forceRes = runCli(
      ["upgrade", "apple-design", "--dest", dest, "--force", "--json"],
      { cwd },
    );
    assert.equal(forceRes.status, 0);
    const forceData = JSON.parse(forceRes.stdout);
    assert.equal(forceData.upgraded.length, 1);
    assert.equal(fs.readFileSync(installedMd, "utf8"), originalContent);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("remove deletes installed skill, updates lockfile, and blocks traversal", () => {
  const cwd = makeTempDir("dm-life-rm-");
  const dest = path.join(cwd, "skills");
  try {
    assert.equal(
      runCli(["add", "apple-design", "caveman", "--dest", dest], { cwd })
        .status,
      0,
    );

    // Traversal must fail
    const badRes = runCli(["remove", "../outside", "--dest", dest], { cwd });
    assert.notEqual(badRes.status, 0);

    // Remove apple-design
    const rmRes = runCli(["remove", "apple-design", "--dest", dest, "--json"], {
      cwd,
    });
    assert.equal(rmRes.status, 0);
    assert.equal(fs.existsSync(path.join(dest, "apple-design")), false);
    assert.equal(fs.existsSync(path.join(dest, "caveman")), true);

    const lock = JSON.parse(
      fs.readFileSync(path.join(dest, LOCKFILE_NAME), "utf8"),
    );
    assert.equal(lock.skills["apple-design"], undefined);
    assert.ok(lock.skills["caveman"]);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("search returns ranked JSON results prioritizing exact and name matches", () => {
  const res = runCli(["search", "security", "--json"]);
  assert.equal(res.status, 0);
  const results = JSON.parse(res.stdout);
  assert.ok(results.length >= 3);
  assert.equal(results[0].name, "security");
  assert.equal(typeof results[0].score, "number");
  assert.ok(results[0].score > results[results.length - 1].score);
});

test("doctor detects broken skill missing SKILL.md and passes on healthy installs", () => {
  const cwd = makeTempDir("dm-life-doc-");
  const dest = path.join(cwd, "skills");
  try {
    assert.equal(
      runCli(["add", "apple-design", "--dest", dest], { cwd }).status,
      0,
    );

    const healthyRes = runCli(["doctor", "--dest", dest, "--json"], { cwd });
    assert.equal(healthyRes.status, 0);
    const healthy = JSON.parse(healthyRes.stdout);
    assert.equal(healthy.ok, true);

    // Break an installed skill by removing SKILL.md
    fs.mkdirSync(path.join(dest, "broken-skill"), { recursive: true });
    const brokenRes = runCli(["doctor", "--dest", dest, "--json"], { cwd });
    assert.equal(brokenRes.status, 1);
    const broken = JSON.parse(brokenRes.stdout);
    assert.equal(broken.ok, false);
    assert.ok(broken.issues.some((i) => i.skill === "broken-skill"));
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
