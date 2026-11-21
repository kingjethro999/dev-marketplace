const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SKILL_DIR = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(SKILL_DIR, "scripts", "commit-hook.js");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function initGitRepo(cwd) {
  spawnSync("git", ["init"], { cwd, encoding: "utf8" });
}

function runScript(args, cwd) {
  return spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    cwd,
    encoding: "utf8",
  });
}

test("install backs up existing hooks and uninstall restores backup cleanly", () => {
  const cwd = makeTempDir("ch-inst-");
  try {
    initGitRepo(cwd);
    const preCommitPath = path.join(cwd, ".git", "hooks", "pre-commit");
    fs.writeFileSync(preCommitPath, "#!/bin/sh\necho original-hook\n", {
      mode: 0o755,
    });

    const installRes = runScript(["install"], cwd);
    assert.equal(installRes.status, 0, installRes.stderr);

    const installed = fs.readFileSync(preCommitPath, "utf8");
    assert.equal(installed.includes("original-hook"), false);
    assert.equal(installed.includes("/tmp/periderm-pre-commit.json"), false);
    assert.equal(
      fs.existsSync(path.join(cwd, ".git", "hooks", "commit-msg")),
      true,
    );
    assert.equal(
      fs.existsSync(path.join(cwd, ".git", "hooks", "pre-push")),
      true,
    );

    const uninstallRes = runScript(["uninstall"], cwd);
    assert.equal(uninstallRes.status, 0, uninstallRes.stderr);
    assert.equal(
      fs.readFileSync(preCommitPath, "utf8").includes("original-hook"),
      true,
    );
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("installed commit-msg hook enforces conventional format, trailers, and merge commits standalone", () => {
  const cwd = makeTempDir("ch-msg-");
  try {
    initGitRepo(cwd);
    assert.equal(runScript(["install"], cwd).status, 0);

    const hook = path.join(cwd, ".git", "hooks", "commit-msg");
    const msgFile = path.join(cwd, "MSG");

    const checkMsg = (msg) => {
      fs.writeFileSync(msgFile, msg);
      return spawnSync("sh", [hook, msgFile], { cwd, encoding: "utf8" });
    };

    assert.equal(checkMsg("feat(cli): add upgrade command\n").status, 0);
    assert.equal(checkMsg("feat(api)!: breaking change\n").status, 0);
    assert.equal(checkMsg("Merge branch 'main' into dev\n").status, 0);
    assert.notEqual(checkMsg("wip broken message\n").status, 0);

    // Mentioning 'security' in subject WITHOUT a Security:/CVE:/GHSA:/Periderm: trailer must fail
    assert.notEqual(checkMsg("fix(security): patch auth bypass\n").status, 0);

    // Adding a real trailer must pass
    assert.equal(
      checkMsg("fix(security): patch auth bypass\n\nSecurity: CVE-2026-1234\n")
        .status,
      0,
    );
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("test-pre-commit executes hook logic without missing run-pre-commit.js error", () => {
  const cwd = makeTempDir("ch-test-");
  try {
    initGitRepo(cwd);
    fs.writeFileSync(
      path.join(cwd, "commit-hook.json"),
      JSON.stringify({
        preCommit: {
          enabled: true,
          peridermScan: false,
          peridermArgs: ["--staged", "--json"],
          failOn: ["critical", "high"],
          lint: false,
          typecheck: false,
          tests: [],
          timeout: 30000,
        },
      }),
    );

    const res = runScript(["test-pre-commit"], cwd);
    assert.equal(res.status, 0, res.stderr + res.stdout);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
