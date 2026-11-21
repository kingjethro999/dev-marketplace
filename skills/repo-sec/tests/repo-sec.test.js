const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SKILL_DIR = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(SKILL_DIR, "scripts", "repo-sec.js");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runScript(args, cwd) {
  return spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    cwd,
    encoding: "utf8",
  });
}

test("audit --json --offline detects .github/CODEOWNERS and outputs pure valid JSON", () => {
  const cwd = makeTempDir("rsec-audit-");
  try {
    spawnSync("git", ["init"], { cwd });
    fs.mkdirSync(path.join(cwd, ".github"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".github", "CODEOWNERS"), "* @security\n");
    fs.writeFileSync(path.join(cwd, "SECURITY.md"), "# Security\n");

    const res = runScript(["audit", "--json", "--offline"], cwd);
    assert.equal(res.status, 0, res.stderr + res.stdout);
    const data = JSON.parse(res.stdout);
    assert.equal(Array.isArray(data.findings), true);
    // CODEOWNERS in .github/CODEOWNERS must be recognized (not flagged as missing)
    assert.equal(
      data.findings.some((f) => f.control === "Code owners"),
      false,
    );
    // Missing dependabot.yml should be flagged
    assert.equal(
      data.findings.some((f) => f.control === "Dependabot config"),
      true,
    );
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("harden --dry-run --json previews changes without writing files", () => {
  const cwd = makeTempDir("rsec-dry-");
  try {
    spawnSync("git", ["init"], { cwd });
    const res = runScript(["harden", "--dry-run", "--json"], cwd);
    assert.equal(res.status, 0, res.stderr + res.stdout);
    const data = JSON.parse(res.stdout);
    assert.equal(data.dryRun, true);
    assert.ok(Array.isArray(data.plannedControls));
    assert.ok(data.plannedControls.length > 0);
    assert.equal(fs.existsSync(path.join(cwd, "SECURITY.md")), false);
    assert.equal(
      fs.existsSync(path.join(cwd, ".github", "dependabot.yml")),
      false,
    );
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("exported buildDependabotConfig, yamlStringify, and parseNpmAudit produce valid output", () => {
  const {
    buildDependabotConfig,
    yamlStringify,
    parseNpmAudit,
    loadConfig,
  } = require(SCRIPT_PATH);

  const cwd = makeTempDir("rsec-dep-");
  try {
    fs.writeFileSync(path.join(cwd, "package.json"), "{}");
    fs.writeFileSync(path.join(cwd, "go.mod"), "module example.com/app\n");
    fs.mkdirSync(path.join(cwd, ".github", "workflows"), { recursive: true });

    const cfg = loadConfig(cwd);
    const dep = buildDependabotConfig(cfg, cwd);
    const ecosystems = dep.updates.map((u) => u["package-ecosystem"]);
    assert.ok(ecosystems.includes("npm"));
    assert.ok(ecosystems.includes("gomod"));
    assert.ok(ecosystems.includes("github-actions"));

    const yaml = yamlStringify(dep);
    assert.match(yaml, /- package-ecosystem:/);
    // Dependabot v2 allow: does not accept update-type
    assert.equal(yaml.includes("update-type"), false);

    // parseNpmAudit must parse vulnerabilities even on non-zero exit code
    const parsed = parseNpmAudit({
      status: 1,
      stdout: JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 1, high: 2, moderate: 0, low: 0 },
        },
      }),
    });
    assert.equal(parsed.total, 3);
    assert.equal(parsed.critical, 1);
    assert.equal(parsed.high, 2);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("repo-sec uses PATCH (not PUT) for GitHub repository security settings API", () => {
  const src = fs.readFileSync(SCRIPT_PATH, "utf8");
  assert.equal(
    /["']PUT["'],\s*`repos\/\$\{repo\}`/.test(src),
    false,
    "GitHub Update Repository API requires PATCH, not PUT",
  );
  assert.equal(/["']PATCH["'],\s*`repos\/\$\{repo\}`/.test(src), true);
});
