const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SKILL_DIR = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(SKILL_DIR, "scripts", "leak-spots.js");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runScript(args, cwd) {
  return spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    cwd,
    encoding: "utf8",
  });
}

function initGitRepo(cwd) {
  spawnSync("git", ["init"], { cwd, encoding: "utf8" });
  spawnSync("git", ["config", "user.name", "Test User"], {
    cwd,
    encoding: "utf8",
  });
  spawnSync("git", ["config", "user.email", "test@example.com"], {
    cwd,
    encoding: "utf8",
  });
}

test("working-tree offline scan detects secrets, redacts them, and respects allowList/ignorePaths", () => {
  const cwd = makeTempDir("leak-wt-");
  try {
    initGitRepo(cwd);
    const fakeAws = "AKIA" + "IOSFODNN7EXAMPLE";
    const fakeGhp = "ghp_" + "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8";

    fs.writeFileSync(
      path.join(cwd, "app.js"),
      `const a = "${fakeAws}";\nconst b = "${fakeGhp}";\nconst ok = "EXAMPLE_KEY_1234567890";\n`,
    );
    // Ignored path must not be flagged
    fs.writeFileSync(
      path.join(cwd, "package-lock.json"),
      JSON.stringify({ integrity: fakeGhp }),
    );

    const res = runScript(
      [
        "scan",
        "--working-tree",
        "--offline",
        "--format=json",
        "--fail-on-leak",
      ],
      cwd,
    );
    assert.equal(res.status, 1);

    const report = JSON.parse(res.stdout);
    assert.ok(report.findings.length >= 2);
    // Must not flag package-lock.json
    assert.equal(
      report.findings.some((f) => f.file.includes("package-lock.json")),
      false,
    );
    // Must redact raw secret values in output
    assert.equal(res.stdout.includes(fakeGhp), false);
    assert.equal(res.stdout.includes(fakeAws), false);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("git history scan detects secrets deleted in later commits", () => {
  const cwd = makeTempDir("leak-hist-");
  try {
    initGitRepo(cwd);
    const fakeStripe = "sk_live_" + "51H9xK2L3mN4oP5qR6sT7uV8wX9yZ0aB";

    // Commit 1: accidentally commit a secret
    fs.writeFileSync(
      path.join(cwd, "config.js"),
      `const k = "${fakeStripe}";\n`,
    );
    spawnSync("git", ["add", "."], { cwd });
    spawnSync("git", ["commit", "-m", "initial"], { cwd });

    // Commit 2: remove the secret from working tree
    fs.writeFileSync(
      path.join(cwd, "config.js"),
      `const k = process.env.STRIPE_KEY;\n`,
    );
    spawnSync("git", ["add", "."], { cwd });
    spawnSync("git", ["commit", "-m", "remove key"], { cwd });

    // Working-tree scan should be clean (exit 0)
    const wtRes = runScript(
      [
        "scan",
        "--working-tree",
        "--offline",
        "--format=json",
        "--fail-on-leak",
      ],
      cwd,
    );
    assert.equal(wtRes.status, 0, wtRes.stderr);
    const wtData = JSON.parse(wtRes.stdout);
    assert.equal(wtData.findings.length, 0);

    // Full history scan MUST still catch the deleted secret from commit 1!
    const histRes = runScript(
      ["scan", "--offline", "--format=json", "--fail-on-leak"],
      cwd,
    );
    assert.equal(histRes.status, 1);
    const histData = JSON.parse(histRes.stdout);
    assert.ok(histData.findings.length >= 1);
    assert.ok(histData.findings.some((f) => f.commit));
    assert.equal(histRes.stdout.includes(fakeStripe), false);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("exported helpers compute Shannon entropy and redact secrets safely", () => {
  const { shannonEntropy, redactSecret } = require(SCRIPT_PATH);
  assert.ok(shannonEntropy("aaaaaaaaaaaa") < 0.5);
  assert.ok(shannonEntropy("aB3$xY9!kL2@mN7#pQ4%") > 4.0);
  const masked = redactSecret("ghp_1234567890abcdef1234567890");
  assert.equal(masked.includes("1234567890abcdef"), false);
  assert.match(masked, /^ghp_.*\.\.\..{4}$/);
});
