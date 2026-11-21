const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SKILL_DIR = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(SKILL_DIR, "scripts", "branch-sec.js");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runScript(args, cwd) {
  return spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    cwd,
    encoding: "utf8",
  });
}

test("protect alias supports explicit branch args, --dry-run, --json, and flags wildcard patterns", () => {
  const cwd = makeTempDir("bsec-dry-");
  try {
    const res = runScript(
      ["protect", "main", "release/*", "--dry-run", "--json"],
      cwd,
    );
    assert.equal(res.status, 0, res.stderr + res.stdout);
    const data = JSON.parse(res.stdout);
    assert.equal(data.dryRun, true);
    assert.equal(data.branches.length, 1);
    assert.equal(data.branches[0].branch, "main");
    assert.equal(data.branches[0].payload.required_signatures, true);
    assert.equal(data.branches[0].payload.required_linear_history, true);
    assert.ok(
      data.branches[0].payload.required_status_checks.contexts.includes(
        "periderm-scan",
      ),
    );
    assert.deepEqual(data.wildcardBranches, ["release/*"]);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("gen-template writes .gitmessage with conventional commits and security footer", () => {
  const cwd = makeTempDir("bsec-tpl-");
  try {
    spawnSync("git", ["init"], { cwd });
    const res = runScript(["gen-template"], cwd);
    assert.equal(res.status, 0, res.stderr);
    const msg = fs.readFileSync(path.join(cwd, ".gitmessage"), "utf8");
    assert.match(msg, /Conventional Commits/);
    assert.match(msg, /Security \/ CVE \/ GHSA \/ Periderm/);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("add-periderm-check generates valid workflow with periderm.sarif upload", () => {
  const cwd = makeTempDir("bsec-wf-");
  try {
    const res = runScript(["add-periderm-check"], cwd);
    assert.equal(res.status, 0, res.stderr);
    const wf = fs.readFileSync(
      path.join(cwd, ".github", "workflows", "periderm-pr.yml"),
      "utf8",
    );
    assert.match(wf, /periderm-scan:/);
    assert.match(wf, /sarif_file:\s*periderm\.sarif/);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
