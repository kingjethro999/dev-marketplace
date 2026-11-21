#!/usr/bin/env node

/**
 * Cyber Security - Deterministic security assessment toolkit
 * Runs Periderm CLI, OWASP Top 10 static checks, headers audit, crypto audit, and STRIDE threat modeling
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const SKILL_DIR = path.resolve(__dirname, "..");
const TEMPLATES_DIR = path.join(SKILL_DIR, "templates");

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

let JSON_MODE = false;

function log(msg, color = "reset") {
  if (JSON_MODE) return;
  console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function error(msg) {
  console.error(`${COLORS.red}✖ ${msg}${COLORS.reset}`);
}

function success(msg) {
  if (JSON_MODE) return;
  console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`);
}

function warn(msg) {
  if (JSON_MODE) return;
  console.log(`${COLORS.yellow}⚠ ${msg}${COLORS.reset}`);
}

function info(msg) {
  if (JSON_MODE) return;
  console.log(`${COLORS.blue}ℹ ${msg}${COLORS.reset}`);
}

function section(title) {
  log(`\n${COLORS.bold}${COLORS.cyan}═══ ${title} ═══${COLORS.reset}\n`);
}

function runCmd(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    stdio: "pipe",
    encoding: "utf8",
    env: { ...process.env, ...opts.env },
    maxBuffer: 1024 * 1024 * 20,
    timeout: opts.timeout || 300000,
  });
}

function loadConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, "cyber-sec.json");
  const defaults = {
    periderm: { enabled: true, scanArgs: ["--json"], reviewDeep: true },
    owasp: {
      enabled: true,
      categories: [
        "A01",
        "A02",
        "A03",
        "A04",
        "A05",
        "A06",
        "A07",
        "A08",
        "A09",
        "A10",
      ],
    },
    headers: {
      enabled: true,
      required: {
        "Content-Security-Policy": true,
        "Strict-Transport-Security": true,
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": true,
      },
    },
    crypto: {
      enabled: true,
      forbidWeak: ["md5", "sha1", "des", "3des", "rc4", "ecb"],
      minKeySize: { rsa: 2048, ec: 256 },
    },
    threatModel: { enabled: true, methodology: "STRIDE" },
  };

  if (!fs.existsSync(configPath)) return defaults;

  try {
    return deepMerge(defaults, JSON.parse(fs.readFileSync(configPath, "utf8")));
  } catch (e) {
    warn(`Failed to parse cyber-sec.json: ${e.message}. Using defaults.`);
    return defaults;
  }
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function parseArgs(argv = process.argv.slice(2)) {
  const o = { command: "assess", feature: null, format: "text", output: null };
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    const eqIdx = raw.indexOf("=");
    const a = eqIdx !== -1 ? raw.slice(0, eqIdx) : raw;
    const eqVal = eqIdx !== -1 ? raw.slice(eqIdx + 1) : null;
    const nextVal = () => (eqVal !== null ? eqVal : argv[++i]);

    if (
      [
        "assess",
        "threat-model",
        "owasp",
        "headers",
        "crypto",
        "incident-plan",
      ].includes(a)
    ) {
      o.command = a;
    } else if (a === "--feature") {
      o.feature = nextVal();
    } else if (a === "--format") {
      o.format = nextVal();
    } else if (a === "--output") {
      o.output = nextVal();
    } else if (a === "--help" || a === "-h") {
      showHelp();
      process.exit(0);
    }
  }
  return o;
}

function showHelp() {
  console.log(`
${COLORS.bold}Cyber Security${COLORS.reset}

Usage:
  node cyber-sec.js <command> [options]

Commands:
  assess          Full security assessment (default)
  threat-model    STRIDE threat modeling for feature
  owasp           OWASP Top 10 deterministic static checks
  headers         Security headers audit
  crypto          Cryptographic audit
  incident-plan   Generate incident response plan

Options:
  --feature <name>    Feature name for threat modeling
  --format <fmt>      Output: text, json (default: text)
  --output <file>     Write report to file
  --help, -h          Show help

Examples:
  node cyber-sec.js assess
  node cyber-sec.js threat-model --feature="payment-api"
  node cyber-sec.js owasp --format=json --output=owasp.json
  node cyber-sec.js headers
  node cyber-sec.js crypto
  node cyber-sec.js incident-plan
`);
}

function findSourceFiles(cwd = process.cwd()) {
  const files = [];
  const exts = [
    ".js",
    ".mjs",
    ".cjs",
    ".ts",
    ".tsx",
    ".jsx",
    ".py",
    ".java",
    ".go",
    ".cs",
    ".php",
    ".rb",
    ".rs",
    ".cpp",
    ".c",
    ".h",
  ];
  const ignored = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
    "vendor",
    "__pycache__",
  ]);

  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!ignored.has(entry.name)) scan(full);
      } else if (entry.isFile() && exts.some((e) => entry.name.endsWith(e))) {
        files.push(full);
      }
    }
  }
  scan(cwd);
  return files.sort();
}

function scanFilesForPatterns(files, cwd, rules) {
  const hits = [];
  for (const file of files) {
    const rel = path.relative(cwd, file);
    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      for (const rule of rules) {
        rule.regex.lastIndex = 0;
        if (rule.regex.test(line)) {
          hits.push({
            check: rule.check,
            file: rel,
            line: idx + 1,
            detail: rule.detail,
          });
        }
      }
    }
  }
  return hits;
}

const WEAK_CRYPTO_RULES = {
  md5: {
    regex:
      /\b(?:createHash|getHashes|hashlib|MessageDigest\.getInstance|crypto\/md5|Digest::MD5|md5_hex|md5\s*\()\b[^;\n]*\bmd5\b|\bhashlib\.md5\b|\bmd5\s*\(/i,
    label: "MD5 weak hash algorithm",
  },
  sha1: {
    regex:
      /\b(?:createHash|hashlib|MessageDigest\.getInstance|crypto\/sha1|Digest::SHA1)\b[^;\n]*\bsha-?1\b|\bhashlib\.sha1\b/i,
    label: "SHA-1 weak hash algorithm",
  },
  des: {
    regex:
      /\b(?:createCipher(?:iv)?|Cipher\.getInstance|crypto\/des)\b[^;\n]*['"`](?:des|des-[a-z0-9-]+)['"`]/i,
    label: "DES weak cipher",
  },
  "3des": {
    regex:
      /\b(?:createCipher(?:iv)?|Cipher\.getInstance)\b[^;\n]*['"`](?:des-ede3|3des|tripledes)[a-z0-9-]*['"`]/i,
    label: "3DES deprecated cipher",
  },
  rc4: {
    regex:
      /\b(?:createCipher(?:iv)?|Cipher\.getInstance|crypto\/rc4)\b[^;\n]*['"`]rc4[a-z0-9-]*['"`]/i,
    label: "RC4 broken stream cipher",
  },
  ecb: {
    regex:
      /\b(?:createCipher(?:iv)?|Cipher\.getInstance)\b[^;\n]*['"`][a-z0-9-]+-ecb['"`]|\/ECB\//i,
    label: "ECB insecure block cipher mode",
  },
};

function auditCrypto(cryptoConfig, cwd = process.cwd()) {
  const findings = [];
  const srcFiles = findSourceFiles(cwd);
  const forbid = (cryptoConfig.forbidWeak || []).map((w) =>
    String(w).toLowerCase(),
  );

  for (const file of srcFiles) {
    const rel = path.relative(cwd, file);
    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      for (const algo of forbid) {
        const rule = WEAK_CRYPTO_RULES[algo];
        if (rule && rule.regex.test(line)) {
          findings.push({
            file: rel,
            line: idx + 1,
            algorithm: algo,
            issue: rule.label,
            severity: "high",
          });
        }
      }

      if (
        /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/.test(line) ||
        /\bprivate[_-]?key\s*[:=]\s*["'][A-Za-z0-9+/=_-]{24,}["']/i.test(line)
      ) {
        findings.push({
          file: rel,
          line: idx + 1,
          issue: "Possible hardcoded private key",
          severity: "critical",
        });
      }

      if (
        /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]0['"]|verify\s*=\s*False/.test(
          line,
        )
      ) {
        findings.push({
          file: rel,
          line: idx + 1,
          issue: "TLS certificate verification disabled",
          severity: "high",
        });
      }
    }
  }

  if (findings.length === 0) {
    success("  No weak crypto or hardcoded keys found");
  } else {
    for (const f of findings) {
      warn(`  ${f.file}:${f.line}: ${f.issue || f.algorithm}`);
    }
  }
  return { findings, scannedFiles: srcFiles.length };
}

function runOwaspChecks(config, cwd = process.cwd()) {
  const srcFiles = findSourceFiles(cwd);
  const cryptoAudit = auditCrypto(config.crypto, cwd);

  const detectors = {
    A01: {
      name: "Broken Access Control",
      run: () =>
        scanFilesForPatterns(srcFiles, cwd, [
          {
            check: "path-traversal",
            regex: /path\.(?:join|resolve)\([^)]*req\.(?:params|query|body)\b/,
            detail: "Unvalidated request input passed to path.join/resolve",
          },
          {
            check: "wildcard-cors-credentials",
            regex: /Access-Control-Allow-Origin['"]?\s*[:,]\s*['"]\*['"]/,
            detail: "Wildcard CORS header detected; verify credentials policy",
          },
        ]),
    },
    A02: {
      name: "Cryptographic Failures",
      run: () =>
        cryptoAudit.findings.map((f) => ({
          check: f.algorithm || "tls-or-key",
          file: f.file,
          line: f.line,
          detail: f.issue,
        })),
    },
    A03: {
      name: "Injection",
      run: () =>
        scanFilesForPatterns(srcFiles, cwd, [
          {
            check: "eval-injection",
            regex: /\b(?:eval|new\s+Function)\s*\(/,
            detail: "Dynamic code execution via eval() or new Function()",
          },
          {
            check: "command-injection",
            regex: /\bexec(?:Sync)?\s*\(\s*`[^`]*\$\{/,
            detail: "Shell command built with template literal interpolation",
          },
          {
            check: "xss-sink",
            regex: /dangerouslySetInnerHTML|\.innerHTML\s*=/,
            detail: "Raw HTML injection sink (verify sanitization)",
          },
          {
            check: "sql-concatenation",
            regex:
              /["'`](?:SELECT|INSERT|UPDATE|DELETE)\b[^"'`]*(\$\{|\+\s*req\.)/i,
            detail:
              "Possible SQL string interpolation instead of parameterized query",
          },
        ]),
    },
    A04: {
      name: "Insecure Design",
      run: () => {
        const hasDesignDoc =
          fs.existsSync(path.join(cwd, "SECURITY.md")) ||
          fs.readdirSync(cwd).some((f) => /^THREAT_MODEL/i.test(f));
        return hasDesignDoc
          ? []
          : [
              {
                check: "threat-model",
                file: ".",
                line: 0,
                detail: "No SECURITY.md or THREAT_MODEL*.md found",
              },
            ];
      },
    },
    A05: {
      name: "Security Misconfiguration",
      run: () =>
        scanFilesForPatterns(srcFiles, cwd, [
          {
            check: "default-credentials",
            regex:
              /(?:password|passwd|pwd)\s*[:=]\s*['"](?:admin|password|123456|password123|root)['"]/i,
            detail: "Hardcoded weak or default credential",
          },
        ]),
    },
    A06: {
      name: "Vulnerable Components",
      run: () => {
        const pkgPath = path.join(cwd, "package.json");
        if (!fs.existsSync(pkgPath)) return [];
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
          const hasDeps =
            Object.keys(pkg.dependencies || {}).length > 0 ||
            Object.keys(pkg.devDependencies || {}).length > 0;
          const hasLock =
            fs.existsSync(path.join(cwd, "package-lock.json")) ||
            fs.existsSync(path.join(cwd, "yarn.lock")) ||
            fs.existsSync(path.join(cwd, "pnpm-lock.yaml"));
          if (hasDeps && !hasLock) {
            return [
              {
                check: "missing-lockfile",
                file: "package.json",
                line: 1,
                detail: "Dependencies declared without a committed lockfile",
              },
            ];
          }
        } catch {
          // Ignore malformed package.json
        }
        return [];
      },
    },
    A07: {
      name: "Auth Failures",
      run: () =>
        scanFilesForPatterns(srcFiles, cwd, [
          {
            check: "insecure-cookie",
            regex: /\b(?:httpOnly|secure)\s*:\s*false\b/,
            detail: "Cookie security flag explicitly disabled",
          },
          {
            check: "unverified-jwt",
            regex: /\bjwt\.decode\s*\(/,
            detail:
              "jwt.decode() skips signature verification; use jwt.verify()",
          },
        ]),
    },
    A08: {
      name: "Software Integrity",
      run: () => {
        const hits = [];
        const wfDir = path.join(cwd, ".github", "workflows");
        if (fs.existsSync(wfDir)) {
          for (const f of fs.readdirSync(wfDir)) {
            if (!/\.(ya?ml)$/.test(f)) continue;
            const full = path.join(wfDir, f);
            const lines = fs.readFileSync(full, "utf8").split(/\r?\n/);
            lines.forEach((line, idx) => {
              if (/uses:\s+\S+@(?:master|main)\b/.test(line)) {
                hits.push({
                  check: "unpinned-action",
                  file: path.join(".github", "workflows", f),
                  line: idx + 1,
                  detail:
                    "GitHub Action pinned to mutable branch (@main/@master)",
                });
              }
            });
          }
        }
        return hits;
      },
    },
    A09: {
      name: "Logging Failures",
      run: () =>
        scanFilesForPatterns(srcFiles, cwd, [
          {
            check: "sensitive-log",
            regex:
              /\b(?:console\.log|logger\.(?:info|debug|warn|error))\s*\([^)]*\b(?:password|passwd|apiKey|api_key|accessToken|secret)\b/i,
            detail: "Potential secret or credential written to logs",
          },
        ]),
    },
    A10: {
      name: "SSRF",
      run: () =>
        scanFilesForPatterns(srcFiles, cwd, [
          {
            check: "unvalidated-fetch",
            regex:
              /\b(?:fetch|axios\.(?:get|post|request)|http\.get|https\.get)\s*\(\s*req\.(?:query|body|params)\b/,
            detail:
              "User-controlled URL passed directly to outbound HTTP request",
          },
        ]),
    },
  };

  const results = {};
  for (const [id, detector] of Object.entries(detectors)) {
    if (!config.owasp.categories.includes(id)) continue;
    log(`\n  ${COLORS.bold}${id}: ${detector.name}${COLORS.reset}`);
    const findings = detector.run();
    if (findings.length === 0) {
      success(`    No static findings detected`);
    } else {
      for (const f of findings) {
        warn(`    [${f.check}] ${f.file}:${f.line} — ${f.detail}`);
      }
    }
    results[id] = {
      name: detector.name,
      findings,
      passed: findings.length === 0,
    };
  }
  return results;
}

function checkHeaderInCodebase(header, cwd = process.cwd()) {
  const configFiles = [
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "next.config.cjs",
    "vercel.json",
    "netlify.toml",
    "nginx.conf",
    "_headers",
    "public/_headers",
    ".htaccess",
    "web.config",
  ];
  const needle = header.toLowerCase();

  for (const f of configFiles) {
    const p = path.join(cwd, f);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf8").toLowerCase();
      if (content.includes(needle)) return true;
    }
  }

  // Also inspect source files for explicit header setters or helmet()
  const helmetCovered = new Set([
    "content-security-policy",
    "strict-transport-security",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
  ]);
  for (const file of findSourceFiles(cwd)) {
    let content;
    try {
      content = fs.readFileSync(file, "utf8").toLowerCase();
    } catch {
      continue;
    }
    if (content.includes(needle)) return true;
    if (helmetCovered.has(needle) && /\bhelmet\s*\(/.test(content)) return true;
  }

  return false;
}

function auditHeaders(required, cwd = process.cwd()) {
  log("  Checking for security headers in codebase...");
  const results = {};
  for (const [header, value] of Object.entries(required)) {
    const found = checkHeaderInCodebase(header, cwd);
    results[header] = {
      required: value,
      found,
      status: found ? "present" : "missing",
    };
    if (found) success(`  ${header}`);
    else warn(`  ${header} - MISSING`);
  }
  return results;
}

function generateThreatModel(feature, cwd = process.cwd()) {
  const featureName = feature || "unnamed-feature";
  const model = {
    feature: featureName,
    methodology: "STRIDE",
    threats: [
      {
        category: "Spoofing",
        threats: [
          "Impersonation via stolen tokens",
          "Session hijacking",
          "Credential stuffing",
        ],
        mitigations: [
          "MFA",
          "Short-lived tokens",
          "Device fingerprinting",
          "Rate limiting",
        ],
      },
      {
        category: "Tampering",
        threats: [
          "Parameter manipulation",
          "Data integrity violation",
          "API request forgery",
        ],
        mitigations: [
          "Input validation",
          "HMAC signatures",
          "Immutable logs",
          "WAF rules",
        ],
      },
      {
        category: "Repudiation",
        threats: [
          "Action denial",
          "Audit log tampering",
          "Non-repudiation bypass",
        ],
        mitigations: [
          "Immutable audit logs",
          "Digital signatures",
          "Tamper-evident log chaining",
          "WORM storage",
        ],
      },
      {
        category: "Information Disclosure",
        threats: [
          "Sensitive data in logs",
          "Error message leakage",
          "Directory traversal",
          "Excessive API responses",
        ],
        mitigations: [
          "Data classification",
          "Generic error handling",
          "Output encoding",
          "Field-level encryption",
        ],
      },
      {
        category: "Denial of Service",
        threats: [
          "Resource exhaustion",
          "Algorithmic complexity attacks",
          "Quota bypass",
        ],
        mitigations: [
          "Rate limiting",
          "Circuit breakers",
          "Request size validation",
          "Auto-scaling",
        ],
      },
      {
        category: "Elevation of Privilege",
        threats: ["Privilege escalation", "Role confusion", "Admin bypass"],
        mitigations: [
          "Least privilege",
          "RBAC",
          "Privilege separation",
          "Regular audits",
        ],
      },
    ],
  };

  const md = renderThreatModel(model);
  const filename = `THREAT_MODEL_${featureName.toUpperCase().replace(/[^A-Z0-9]/g, "_")}.md`;
  fs.writeFileSync(path.join(cwd, filename), md);
  success(`Threat model written to ${filename}`);

  return model;
}

function renderThreatModel(model) {
  let md = `# Threat Model: ${model.feature}\n\n`;
  md += `**Methodology:** ${model.methodology}\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;

  for (const t of model.threats) {
    md += `## ${t.category}\n\n`;
    for (let i = 0; i < t.threats.length; i++) {
      md += `### ${t.threats[i]}\n`;
      md += `**Mitigations:**\n`;
      for (const m of t.mitigations) md += `- ${m}\n`;
      md += `\n`;
    }
  }
  return md;
}

function generateIncidentPlan(cwd = process.cwd()) {
  const template = fs.readFileSync(
    path.join(TEMPLATES_DIR, "incident-response.md"),
    "utf8",
  );
  fs.writeFileSync(path.join(cwd, "INCIDENT_RESPONSE.md"), template);
  success("Incident response plan written to INCIDENT_RESPONSE.md");
}

function printSummary(report) {
  log(
    `\n${COLORS.bold}${COLORS.cyan}═══ SECURITY ASSESSMENT SUMMARY ═══${COLORS.reset}\n`,
  );
  if (report.periderm) {
    log(`Periderm: ${report.periderm.status === 0 ? "PASS" : "FINDINGS"}`);
  }
  if (report.owasp) {
    const passed = Object.values(report.owasp).filter((r) => r.passed).length;
    const total = Object.keys(report.owasp).length;
    log(`OWASP Top 10: ${passed}/${total} categories clean`);
  }
  if (report.headers) {
    const present = Object.values(report.headers).filter((h) => h.found).length;
    const total = Object.keys(report.headers).length;
    log(`Security Headers: ${present}/${total} present`);
  }
  if (report.crypto) {
    log(
      `Crypto Audit: ${report.crypto.findings.length} findings in ${report.crypto.scannedFiles} files`,
    );
  }
  if (report.threatModel) {
    log(`Threat Model: Generated for ${report.threatModel.feature}`);
  }
}

async function main() {
  const options = parseArgs();
  JSON_MODE = options.format === "json";
  const config = loadConfig();

  const report = {
    timestamp: new Date().toISOString(),
    periderm: null,
    owasp: null,
    headers: null,
    crypto: null,
    threatModel: null,
  };

  // Periderm integration
  if (config.periderm.enabled && ["assess"].includes(options.command)) {
    section("Periderm Security Scan");
    const scan = runCmd("periderm", ["scan", ...config.periderm.scanArgs]);
    if (scan.status === 0 || scan.status === 1) {
      report.periderm = { output: scan.stdout, status: scan.status };
      if (!JSON_MODE) console.log(scan.stdout);
    }

    if (config.periderm.reviewDeep) {
      section("Periderm Deep AI Review");
      const review = runCmd("periderm", ["review", "--deep", "--json"]);
      if (review.status === 0 || review.status === 1) {
        report.periderm = { ...report.periderm, review: review.stdout };
        if (!JSON_MODE) console.log(review.stdout);
      }
    }
  }

  // OWASP Top 10
  if (config.owasp.enabled && ["assess", "owasp"].includes(options.command)) {
    section("OWASP Top 10 Validation");
    report.owasp = runOwaspChecks(config);
  }

  // Security Headers
  if (
    config.headers.enabled &&
    ["assess", "headers"].includes(options.command)
  ) {
    section("Security Headers Audit");
    report.headers = auditHeaders(config.headers.required);
  }

  // Crypto Audit
  if (config.crypto.enabled && ["assess", "crypto"].includes(options.command)) {
    section("Cryptographic Audit");
    report.crypto = auditCrypto(config.crypto);
  }

  // Threat Modeling
  if (
    config.threatModel.enabled &&
    ["assess", "threat-model"].includes(options.command)
  ) {
    section("STRIDE Threat Modeling");
    report.threatModel = generateThreatModel(options.feature);
  }

  // Incident Plan
  if (options.command === "incident-plan") {
    section("Incident Response Plan");
    generateIncidentPlan();
  }

  // Output
  if (options.format === "json" || options.output) {
    const json = JSON.stringify(report, null, 2);
    if (options.output) {
      fs.writeFileSync(options.output, json);
      success(`Report written to ${options.output}`);
    }
    if (options.format === "json") console.log(json);
  }

  if (options.format !== "json") {
    printSummary(report);
  }
}

if (require.main === module) {
  main().catch((e) => {
    error(`Error: ${e.message}`);
    console.error(e.stack);
    process.exit(2);
  });
}

module.exports = {
  loadConfig,
  parseArgs,
  runOwaspChecks,
  auditHeaders,
  auditCrypto,
  checkHeaderInCodebase,
  generateThreatModel,
  generateIncidentPlan,
};
