const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SKILL_DIR = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(SKILL_DIR, "scripts", "ci-cd.js");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runScript(args, cwd) {
  return spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    cwd,
    encoding: "utf8",
  });
}

test("generate GitHub Actions merges push branches+tags, emits matrix, and adds SAST language matrix", () => {
  const cwd = makeTempDir("cicd-gha-");
  try {
    fs.writeFileSync(
      path.join(cwd, "ci-cd.json"),
      JSON.stringify({
        provider: "github-actions",
        projectType: "node",
        pipeline: {
          jobs: {
            security: {
              periderm: true,
              dependencyAudit: true,
              sast: true,
              containerScan: false,
            },
            deploy: {
              enabled: true,
              environments: ["staging", "production"],
              approvalRequired: ["production"],
            },
          },
        },
      }),
    );

    const res = runScript(["generate"], cwd);
    assert.equal(res.status, 0, res.stderr);

    const yaml = fs.readFileSync(
      path.join(cwd, ".github", "workflows", "ci.yml"),
      "utf8",
    );

    // Must not emit duplicate top-level `  push:` keys under `on:`
    const pushKeys = yaml.match(/^  push:/gm) || [];
    assert.equal(pushKeys.length, 1, "Expected single merged push: trigger");
    assert.match(yaml, /tags: \['\*'\]/);

    // Matrix block must be emitted
    assert.match(yaml, /strategy:\n\s+matrix:/);

    // SAST job must define its own matrix.language
    assert.match(
      yaml,
      /security-sast:[\s\S]*?strategy:\n\s+matrix:\n\s+language:/,
    );

    // Approval comment should be on deploy-production, NOT duplicated onto deploy-staging
    const stagingBlock = yaml.match(
      /deploy-staging:[\s\S]*?(?=\n  deploy-production:)/,
    )[0];
    assert.equal(stagingBlock.includes("Requires manual approval"), false);
    const prodBlock = yaml.slice(yaml.indexOf("deploy-production:"));
    assert.equal(prodBlock.includes("Requires manual approval"), true);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("generate GitLab CI succeeds without ReferenceError and preserves CI_COMMIT_REF_SLUG", () => {
  const cwd = makeTempDir("cicd-gl-");
  try {
    fs.writeFileSync(
      path.join(cwd, "ci-cd.json"),
      JSON.stringify({ provider: "gitlab-ci", projectType: "node" }),
    );
    const res = runScript(["generate"], cwd);
    assert.equal(res.status, 0, res.stderr);

    const yaml = fs.readFileSync(path.join(cwd, ".gitlab-ci.yml"), "utf8");
    assert.match(yaml, /key:\s*\$\{?CI_COMMIT_REF_SLUG\}?/);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("explain succeeds on workflows with hyphenated job names", () => {
  const cwd = makeTempDir("cicd-exp-");
  try {
    const wfDir = path.join(cwd, ".github", "workflows");
    fs.mkdirSync(wfDir, { recursive: true });
    fs.writeFileSync(
      path.join(wfDir, "ci.yml"),
      `name: Sample CI
on:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
  security-scan:
    needs: [test-unit]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
`,
    );

    const res = runScript(["explain", ".github/workflows/ci.yml"], cwd);
    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, /test-unit/);
    assert.match(res.stdout, /security-scan/);
    assert.match(res.stdout, /Depends on: test-unit/);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("validate exits non-zero on tabs or missing required workflow keys and passes on valid workflows", () => {
  const cwd = makeTempDir("cicd-val-");
  try {
    const wfDir = path.join(cwd, ".github", "workflows");
    fs.mkdirSync(wfDir, { recursive: true });
    fs.writeFileSync(path.join(wfDir, "bad.yml"), "name: Bad\non:\n\tpush:\n");
    const badRes = runScript(["validate", ".github/workflows/bad.yml"], cwd);
    assert.notEqual(badRes.status, 0);

    fs.writeFileSync(
      path.join(wfDir, "good.yml"),
      `name: Good
on:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
`,
    );
    const goodRes = runScript(["validate", ".github/workflows/good.yml"], cwd);
    assert.equal(goodRes.status, 0, goodRes.stderr);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("ci-cd skill includes starter templates for github-actions, gitlab-ci, and circleci", () => {
  assert.equal(
    fs.existsSync(path.join(SKILL_DIR, "templates/github-actions/ci.yml")),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(SKILL_DIR, "templates/gitlab-ci/.gitlab-ci.yml")),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(SKILL_DIR, "templates/circleci/config.yml")),
    true,
  );
});
