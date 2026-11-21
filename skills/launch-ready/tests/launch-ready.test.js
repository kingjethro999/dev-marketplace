const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SKILL_DIR = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(SKILL_DIR, "scripts", "launch-ready.js");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runScript(args, cwd) {
  return spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    cwd,
    encoding: "utf8",
  });
}

test("--dry-run --format=json outputs pure JSON with custom thresholds without writing files", () => {
  const cwd = makeTempDir("lr-dry-");
  try {
    const res = runScript(
      [
        "--dry-run",
        "--min-launch=80",
        "--min-reality=70",
        "--min-perf=75",
        "--format=json",
      ],
      cwd,
    );
    assert.equal(res.status, 0, res.stderr + res.stdout);
    const data = JSON.parse(res.stdout);
    assert.equal(data.dryRun, true);
    assert.equal(data.thresholds.minLaunchConfidence, 80);
    assert.equal(data.thresholds.minRealityScore, 70);
    assert.equal(data.thresholds.minPerceivedPerformance, 75);
    assert.equal(fs.existsSync(path.join(cwd, "LAUNCH_CHECKLIST.md")), false);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("rejects invalid non-numeric threshold values", () => {
  const cwd = makeTempDir("lr-nan-");
  try {
    const res = runScript(["--min-launch=notanumber", "--dry-run"], cwd);
    assert.notEqual(res.status, 0);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("--skip-periderm --format=json runs build/test checks cleanly and writes LAUNCH_CHECKLIST.md", () => {
  const cwd = makeTempDir("lr-run-");
  try {
    fs.writeFileSync(
      path.join(cwd, "launch-ready.json"),
      JSON.stringify({
        buildCommand: "node -e process.exit(0)",
        testCommand: "node -e process.exit(0)",
      }),
    );

    const passRes = runScript(["--skip-periderm", "--format=json"], cwd);
    assert.equal(passRes.status, 0, passRes.stderr + passRes.stdout);
    const report = JSON.parse(passRes.stdout);
    assert.equal(report.decision, "LAUNCH");
    assert.equal(fs.existsSync(path.join(cwd, "LAUNCH_CHECKLIST.md")), true);

    // Failing test must produce BLOCK and exit 1
    fs.writeFileSync(
      path.join(cwd, "launch-ready.json"),
      JSON.stringify({
        buildCommand: "node -e process.exit(0)",
        testCommand: "node -e process.exit(1)",
      }),
    );
    const failRes = runScript(["--skip-periderm", "--format=json"], cwd);
    assert.equal(failRes.status, 1);
    const failReport = JSON.parse(failRes.stdout);
    assert.equal(failReport.decision, "BLOCK");
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("exported evaluateLaunchReadiness and generateChecklist compute decisions accurately", () => {
  const {
    evaluateLaunchReadiness,
    parseScanOutput,
    generateChecklist,
  } = require(SCRIPT_PATH);

  const parsed = parseScanOutput(
    "Launch Confidence: 85\nReality Score: 75\nPerceived Performance: 90\n",
  );
  assert.equal(parsed.launchConfidence, 85);
  assert.equal(parsed.realityScore, 75);
  assert.equal(parsed.perceivedPerformance, 90);

  const report = evaluateLaunchReadiness(
    {
      peridermInstall: { passed: true },
      buildCheck: { passed: true },
      testCheck: { passed: true },
      scanResult: { ...parsed, passed: true, findings: [] },
      reviewResult: { passed: true, summary: "All good" },
    },
    {
      thresholds: {
        minLaunchConfidence: 60,
        minRealityScore: 50,
        minPerceivedPerformance: 70,
        maxCriticalFindings: 0,
        maxHighFindings: 0,
        maxMediumFindings: 5,
      },
      checks: {
        peridermInstall: true,
        peridermScan: true,
        peridermReview: true,
        buildVerification: true,
        testSuite: true,
      },
    },
  );

  assert.equal(report.decision, "LAUNCH");
  const md = generateChecklist(report);
  assert.match(md, /Decision: \*\*LAUNCH\*\*/);
});
