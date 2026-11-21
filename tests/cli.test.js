const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const CLI_PATH = path.resolve(__dirname, "../bin/cli.js");

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

test("resolveDestination honors explicit --type agents even when .claude exists in cwd", () => {
  const { resolveDestination } = require("../bin/cli");
  const cwd = makeTempDir("dm-dest-");
  try {
    fs.mkdirSync(path.join(cwd, ".claude"), { recursive: true });
    const dest = resolveDestination({ type: "agents" }, { cwd, home: cwd });
    assert.equal(dest, path.join(cwd, ".agents", "skills"));
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("resolveDestination supports cursor, codex, and antigravity targets locally and globally", () => {
  const { resolveDestination } = require("../bin/cli");
  const cwd = "/tmp/project";
  const home = "/tmp/home";

  assert.equal(
    resolveDestination({ type: "cursor" }, { cwd, home }),
    path.join(cwd, ".cursor", "skills"),
  );
  assert.equal(
    resolveDestination({ type: "codex" }, { cwd, home }),
    path.join(cwd, ".codex", "skills"),
  );
  assert.equal(
    resolveDestination({ type: "antigravity" }, { cwd, home }),
    path.join(cwd, ".agent", "skills"),
  );
  assert.equal(
    resolveDestination({ type: "cursor", global: true }, { cwd, home }),
    path.join(home, ".cursor", "skills"),
  );
  assert.equal(
    resolveDestination({ type: "codex", global: true }, { cwd, home }),
    path.join(home, ".codex", "skills"),
  );
  assert.equal(
    resolveDestination({ type: "antigravity", global: true }, { cwd, home }),
    path.join(home, ".gemini", "antigravity", "skills"),
  );
});

test("CLI add rejects path traversal names with non-zero exit code", () => {
  const cwd = makeTempDir("dm-trav-");
  try {
    const res = runCli(
      ["add", "../package.json", "--dest", path.join(cwd, "out")],
      {
        cwd,
      },
    );
    assert.notEqual(res.status, 0);
    assert.equal(fs.existsSync(path.join(cwd, "out")), false);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("CLI add --dry-run previews installation without writing files", () => {
  const cwd = makeTempDir("dm-dry-");
  try {
    const dest = path.join(cwd, "skills-out");
    const res = runCli(["add", "apple-design", "--dest", dest, "--dry-run"], {
      cwd,
    });
    assert.equal(res.status, 0);
    assert.match(res.stdout, /apple-design/i);
    assert.equal(fs.existsSync(dest), false);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("CLI list --json and categories --json output valid JSON containing all 133 skills", () => {
  const listRes = runCli(["list", "--json"]);
  assert.equal(listRes.status, 0);
  const skills = JSON.parse(listRes.stdout);
  assert.equal(Array.isArray(skills), true);
  assert.equal(skills.length, 133);

  const catRes = runCli(["categories", "--json"]);
  assert.equal(catRes.status, 0);
  const cats = JSON.parse(catRes.stdout);
  const total = Object.values(cats).reduce((a, b) => a + b, 0);
  assert.equal(total, 133);
});

test("CLI help does not reference nonexistent code-review skill or stale 120+ count", () => {
  const res = runCli(["help"]);
  assert.equal(res.status, 0);
  assert.equal(res.stdout.includes("120+"), false);
  assert.equal(
    res.stdout.includes("add impeccable improve code-review"),
    false,
  );
});
