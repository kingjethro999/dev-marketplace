const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SKILL_DIR = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(SKILL_DIR, "scripts", "cyber-sec.js");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runScript(args, cwd) {
  return spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    cwd,
    encoding: "utf8",
  });
}

test("owasp --format=json is deterministic, valid JSON, and detects real A02/A03 issues", () => {
  const cwd = makeTempDir("cyber-owasp-");
  try {
    fs.mkdirSync(path.join(cwd, ".git"));
    fs.writeFileSync(
      path.join(cwd, "app.js"),
      `const cp = require('child_process');
function run(userInput) {
  eval(userInput);
  cp.execSync(\`ls \${userInput}\`);
}
const tls = { rejectUnauthorized: false };
`,
    );

    const run1 = runScript(["owasp", "--format=json"], cwd);
    const run2 = runScript(["owasp", "--format=json"], cwd);
    assert.equal(run1.status, 0, run1.stderr);
    assert.equal(run2.status, 0, run2.stderr);

    const r1 = JSON.parse(run1.stdout);
    const r2 = JSON.parse(run2.stdout);

    // Must be deterministic (no Math.random())
    assert.deepEqual(r1.owasp, r2.owasp);
    assert.equal(r1.owasp.A03.passed, false);
    assert.equal(r1.owasp.A02.passed, false);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("crypto --format=json avoids false positives on English words and flags real weak crypto", () => {
  const cwd = makeTempDir("cyber-crypto-");
  try {
    fs.mkdirSync(path.join(cwd, ".git"));
    // Clean file containing words with 'des', 'ecb', 'md5'-free prose
    fs.writeFileSync(
      path.join(cwd, "clean.js"),
      `const description = "Design destination for codebase";\nmodule.exports = { description };\n`,
    );

    const cleanRes = runScript(["crypto", "--format=json"], cwd);
    assert.equal(cleanRes.status, 0, cleanRes.stderr);
    const cleanReport = JSON.parse(cleanRes.stdout);
    assert.equal(cleanReport.crypto.findings.length, 0);

    // Add real weak crypto usage
    fs.writeFileSync(
      path.join(cwd, "weak.js"),
      `const crypto = require('crypto');\nconst h = crypto.createHash('md5').update('x').digest('hex');\n`,
    );

    const weakRes = runScript(["crypto", "--format=json"], cwd);
    assert.equal(weakRes.status, 0, weakRes.stderr);
    const weakReport = JSON.parse(weakRes.stdout);
    assert.ok(weakReport.crypto.findings.length >= 1);
    assert.ok(
      weakReport.crypto.findings.some((f) =>
        String(f.algorithm || f.issue)
          .toLowerCase()
          .includes("md5"),
      ),
    );
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("headers --format=json detects headers in next.config.mjs and app middleware", () => {
  const cwd = makeTempDir("cyber-hdr-");
  try {
    fs.mkdirSync(path.join(cwd, ".git"));
    fs.writeFileSync(
      path.join(cwd, "next.config.mjs"),
      `export default {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: "default-src 'self'" },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    }];
  }
};
`,
    );

    const res = runScript(["headers", "--format=json"], cwd);
    assert.equal(res.status, 0, res.stderr);
    const report = JSON.parse(res.stdout);
    assert.equal(report.headers["Content-Security-Policy"].found, true);
    assert.equal(report.headers["Strict-Transport-Security"].found, true);
    assert.equal(report.headers["X-Frame-Options"].found, true);
    assert.equal(report.headers["X-Content-Type-Options"].found, true);
    assert.equal(report.headers["Permissions-Policy"].found, false);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("threat-model supports --feature=value syntax and incident-plan writes INCIDENT_RESPONSE.md", () => {
  const cwd = makeTempDir("cyber-tm-");
  try {
    fs.mkdirSync(path.join(cwd, ".git"));
    const tmRes = runScript(["threat-model", "--feature=payment-api"], cwd);
    assert.equal(tmRes.status, 0, tmRes.stderr);
    assert.equal(
      fs.existsSync(path.join(cwd, "THREAT_MODEL_PAYMENT_API.md")),
      true,
    );

    const irRes = runScript(["incident-plan"], cwd);
    assert.equal(irRes.status, 0, irRes.stderr);
    assert.equal(fs.existsSync(path.join(cwd, "INCIDENT_RESPONSE.md")), true);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
