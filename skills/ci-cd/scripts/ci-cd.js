#!/usr/bin/env node

/**
 * CI/CD Pipeline Analyzer & Generator
 * Interactive mode: create new, edit existing, or understand workflow
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const readline = require('readline');

const SKILL_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(SKILL_DIR, 'templates');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

function log(msg, color = 'reset') {
  console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function error(msg) {
  console.error(`${COLORS.red}✖ ${msg}${COLORS.reset}`);
}

function success(msg) {
  console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`);
}

function warn(msg) {
  console.log(`${COLORS.yellow}⚠ ${msg}${COLORS.reset}`);
}

function info(msg) {
  console.log(`${COLORS.blue}ℹ ${msg}${COLORS.reset}`);
}

function section(title) {
  log(`\n${COLORS.bold}${COLORS.cyan}═══ ${title} ═══${COLORS.reset}\n`);
}

function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

function askYesNo(question, defaultValue = true) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const defaultStr = defaultValue ? 'Y/n' : 'y/N';
    rl.question(`${question} [${defaultStr}]: `, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      if (!normalized) resolve(defaultValue);
      else resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

function askMultiSelect(question, options, defaultSelection = []) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log(`${question}`);
    options.forEach((opt, i) => {
      const checked = defaultSelection.includes(opt.value) ? 'x' : ' ';
      console.log(`  [${checked}] ${i + 1}. ${opt.label} - ${opt.description}`);
    });
    rl.question('Select numbers (comma-separated) or press Enter for defaults: ', (answer) => {
      rl.close();
      if (!answer.trim()) {
        resolve(defaultSelection.map(v => options.find(o => o.value === v)).filter(Boolean));
        return;
      }
      const indices = answer.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < options.length);
      resolve(indices.map(i => options[i]));
    });
  });
}

function askSelect(question, options, defaultValue) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log(`${question}`);
    options.forEach((opt, i) => {
      const marker = opt.value === defaultValue ? '>' : ' ';
      console.log(`  ${marker} ${i + 1}. ${opt.label} - ${opt.description}`);
    });
    rl.question(`Select [1-${options.length}] (default: ${defaultValue}): `, (answer) => {
      rl.close();
      const idx = parseInt(answer.trim()) - 1;
      if (isNaN(idx) || idx < 0 || idx >= options.length) {
        resolve(options.find(o => o.value === defaultValue));
      } else {
        resolve(options[idx]);
      }
    });
  });
}

function loadConfig() {
  const configPath = path.join(process.cwd(), 'ci-cd.json');
  const defaults = {
    provider: 'github-actions',
    projectType: 'node',
    mode: 'create',
    pipeline: {
      name: 'CI/CD',
      triggers: {
        push: ['main', 'develop'],
        pullRequest: ['main'],
        schedule: '0 2 * * 1',
        tags: true,
        manual: true
      },
      jobs: {
        lint: true,
        typecheck: true,
        test: { unit: true, integration: true, e2e: false },
        build: true,
        security: { periderm: true, dependencyAudit: true, sast: false, containerScan: false },
        deploy: { enabled: false, environments: ['staging', 'production'], approvalRequired: ['production'], strategy: 'rolling' }
      },
      matrix: { os: ['ubuntu-latest'], node: ['20', '22'], python: [], go: [], rust: [] },
      caching: { npm: true, pip: false, cargo: false, go: false, maven: false, gradle: false, docker: true },
      notifications: { slack: false, discord: false, email: false, webhook: '' }
    }
  };

  if (!fs.existsSync(configPath)) return defaults;

  try {
    return deepMerge(defaults, JSON.parse(fs.readFileSync(configPath, 'utf8')));
  } catch (e) {
    warn(`Failed to parse ci-cd.json: ${e.message}. Using defaults.`);
    return defaults;
  }
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function detectProjectType() {
  const files = {
    'package.json': 'node',
    'requirements.txt': 'python',
    'pyproject.toml': 'python',
    'Cargo.toml': 'rust',
    'go.mod': 'go',
    'pom.xml': 'java',
    'build.gradle': 'java',
    'build.gradle.kts': 'java',
    '*.csproj': 'dotnet',
    '*.sln': 'dotnet',
    'Dockerfile': 'docker',
    'composer.json': 'php',
    'Gemfile': 'ruby',
    'mix.exs': 'elixir',
    'rebar.config': 'erlang',
    'pubspec.yaml': 'flutter',
    'pubspec.yml': 'flutter'
  };

  for (const [file, type] of Object.entries(files)) {
    if (file.includes('*')) {
      const matches = glob(file);
      if (matches.length > 0) return type;
    } else if (fs.existsSync(path.join(process.cwd(), file))) {
      return type;
    }
  }
  return 'unknown';
}

function glob(pattern) {
  // Simple glob for detection
  const files = fs.readdirSync(process.cwd());
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  return files.filter(f => regex.test(f));
}

function detectExistingCI() {
  const ciFiles = [
    { path: '.github/workflows', provider: 'github-actions' },
    { path: '.gitlab-ci.yml', provider: 'gitlab-ci' },
    { path: '.circleci/config.yml', provider: 'circleci' },
    { path: 'azure-pipelines.yml', provider: 'azure-pipelines' },
    { path: '.buildkite/pipeline.yml', provider: 'buildkite' },
    { path: 'Jenkinsfile', provider: 'jenkins' },
    { path: '.drone.yml', provider: 'drone' },
    { path: '.woodpecker.yml', provider: 'woodpecker' }
  ];

  const found = [];
  for (const ci of ciFiles) {
    const fullPath = path.join(process.cwd(), ci.path);
    if (fs.existsSync(fullPath)) {
      found.push({ provider: ci.provider, path: ci.path });
    }
  }
  return found;
}

async function cmdSetup() {
  section('Interactive CI/CD Setup');
  info('I\'ll help you create, edit, or understand CI/CD pipelines.\n');

  // Detect project
  const projectType = detectProjectType();
  const existingCI = detectExistingCI();

  if (projectType !== 'unknown') {
    info(`Detected project type: ${projectType}`);
  }
  if (existingCI.length > 0) {
    info(`Found existing CI: ${existingCI.map(c => c.provider).join(', ')}`);
  }

  const config = { provider: '', projectType, mode: '', pipeline: {} };

  // Mode selection
  section('Mode Selection');
  const modes = [
    { value: 'create', label: 'Create New Pipeline', description: 'Generate a complete pipeline from scratch' },
    { value: 'edit', label: 'Edit Existing', description: 'Modify an existing workflow file' },
    { value: 'understand', label: 'Understand Workflow', description: 'Explain what a workflow does in plain English' }
  ];
  const mode = await askSelect('What do you want to do?', modes, 'create');
  config.mode = mode.value;

  if (mode.value === 'edit' || mode.value === 'understand') {
    // Select workflow file
    const workflowFiles = [];
    if (existingCI.some(c => c.provider === 'github-actions')) {
      const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
      if (fs.existsSync(workflowsDir)) {
        const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
        files.forEach(f => workflowFiles.push({ provider: 'github-actions', file: f, path: path.join('.github', 'workflows', f) }));
      }
    }
    if (existingCI.some(c => c.provider === 'gitlab-ci')) {
      workflowFiles.push({ provider: 'gitlab-ci', file: '.gitlab-ci.yml', path: '.gitlab-ci.yml' });
    }
    if (existingCI.some(c => c.provider === 'circleci')) {
      workflowFiles.push({ provider: 'circleci', file: 'config.yml', path: '.circleci/config.yml' });
    }

    if (workflowFiles.length === 0) {
      error('No workflow files found to edit/understand');
      process.exit(1);
    }

    const selected = await askSelect('Select workflow file:', workflowFiles.map(w => ({
      value: w.path,
      label: `${w.provider}: ${w.file}`,
      description: w.path
    })), workflowFiles[0].path);

    if (mode.value === 'edit') {
      return await cmdEdit(selected);
    } else {
      return await cmdExplain(selected);
    }
  }

  // Create new pipeline
  section('Create New Pipeline');

  // Provider selection
  const providers = [
    { value: 'github-actions', label: 'GitHub Actions', description: 'Most popular, free for public repos, great ecosystem' },
    { value: 'gitlab-ci', label: 'GitLab CI', description: 'Built into GitLab, good for self-hosted' },
    { value: 'circleci', label: 'CircleCI', description: 'Fast, good Docker support, generous free tier' },
    { value: 'azure-pipelines', label: 'Azure Pipelines', description: 'Microsoft, good for Azure deployments' }
  ];
  const provider = await askSelect('CI Provider:', providers, 'github-actions');
  config.provider = provider.value;

  // Pipeline configuration
  config.pipeline.name = await ask('Pipeline name', 'CI/CD');

  // Triggers
  section('Triggers');
  config.pipeline.triggers = {};
  
  const pushBranches = await ask('Push branches (comma-separated)', 'main,develop');
  config.pipeline.triggers.push = pushBranches.split(',').map(s => s.trim()).filter(Boolean);
  
  const prBranches = await ask('Pull request target branches (comma-separated)', 'main');
  config.pipeline.triggers.pullRequest = prBranches.split(',').map(s => s.trim()).filter(Boolean);
  
  config.pipeline.triggers.tags = await askYesNo('Trigger on tags?', true);
  config.pipeline.triggers.manual = await askYesNo('Allow manual trigger (workflow_dispatch)?', true);
  
  const schedule = await ask('Schedule (cron, empty to disable)', '0 2 * * 1');
  config.pipeline.triggers.schedule = schedule || null;

  // Jobs
  section('Jobs');
  config.pipeline.jobs = {};
  
  config.pipeline.jobs.lint = await askYesNo('Lint job?', true);
  config.pipeline.jobs.typecheck = await askYesNo('Typecheck job?', projectType === 'node' || projectType === 'python' || projectType === 'go' || projectType === 'rust');
  
  // Tests
  const testTypes = await askMultiSelect('Test types:', [
    { value: 'unit', label: 'Unit tests', description: 'Fast isolated tests' },
    { value: 'integration', label: 'Integration tests', description: 'Service/API tests' },
    { value: 'e2e', label: 'E2E tests', description: 'Full browser/app tests' }
  ], ['unit', 'integration']);
  config.pipeline.jobs.test = { unit: testTypes.some(t => t.value === 'unit'), integration: testTypes.some(t => t.value === 'integration'), e2e: testTypes.some(t => t.value === 'e2e') };
  
  config.pipeline.jobs.build = await askYesNo('Build job?', true);
  
  // Security
  section('Security Jobs');
  const securityJobs = await askMultiSelect('Security scanning:', [
    { value: 'periderm', label: 'Periderm scan', description: 'Secret scanning + deep review' },
    { value: 'dependencyAudit', label: 'Dependency audit', description: 'npm audit, OSV, Snyk' },
    { value: 'sast', label: 'SAST', description: 'Static analysis (CodeQL, Semgrep)' },
    { value: 'containerScan', label: 'Container scan', description: 'Trivy, Grype for Docker images' }
  ], ['periderm', 'dependencyAudit']);
  config.pipeline.jobs.security = {
    periderm: securityJobs.some(s => s.value === 'periderm'),
    dependencyAudit: securityJobs.some(s => s.value === 'dependencyAudit'),
    sast: securityJobs.some(s => s.value === 'sast'),
    containerScan: securityJobs.some(s => s.value === 'containerScan')
  };

  // Deployment
  section('Deployment');
  config.pipeline.jobs.deploy = { enabled: false };
  if (await askYesNo('Add deployment job?', false)) {
    config.pipeline.jobs.deploy.enabled = true;
    const envs = await ask('Environments (comma-separated)', 'staging,production');
    config.pipeline.jobs.deploy.environments = envs.split(',').map(s => s.trim()).filter(Boolean);
    
    const approval = await askMultiSelect('Require approval for:', 
      config.pipeline.jobs.deploy.environments.map(e => ({ value: e, label: e, description: 'Manual approval before deploy' })),
      ['production']
    );
    config.pipeline.jobs.deploy.approvalRequired = approval.map(a => a.value);
    
    const strategies = [
      { value: 'rolling', label: 'Rolling', description: 'Update instances gradually' },
      { value: 'blue-green', label: 'Blue-Green', description: 'Swap entire environments' },
      { value: 'canary', label: 'Canary', description: 'Route small % traffic to new version' },
      { value: 'recreate', label: 'Recreate', description: 'Stop old, start new (downtime)' }
    ];
    const strat = await askSelect('Deployment strategy:', strategies, 'rolling');
    config.pipeline.jobs.deploy.strategy = strat.value;
  }

  // Matrix
  section('Matrix Testing');
  const matrixOs = await askMultiSelect('Operating systems:', [
    { value: 'ubuntu-latest', label: 'Ubuntu (Linux)', description: 'Fastest, most common' },
    { value: 'macos-latest', label: 'macOS', description: 'Required for iOS/macOS builds' },
    { value: 'windows-latest', label: 'Windows', description: 'Required for Windows builds' }
  ], ['ubuntu-latest']);
  config.pipeline.matrix.os = matrixOs.map(m => m.value);

  if (projectType === 'node' || projectType === 'unknown') {
    const nodeVersions = await askMultiSelect('Node.js versions:', [
      { value: '18', label: '18 (LTS)', description: 'Maintenance LTS' },
      { value: '20', label: '20 (LTS)', description: 'Active LTS' },
      { value: '22', label: '22 (Current)', description: 'Latest features' }
    ], ['20', '22']);
    config.pipeline.matrix.node = nodeVersions.map(v => v.value);
  }

  if (projectType === 'python' || projectType === 'unknown') {
    const pythonVersions = await askMultiSelect('Python versions:', [
      { value: '3.9', label: '3.9', description: 'Security fixes only' },
      { value: '3.10', label: '3.10', description: 'Security fixes' },
      { value: '3.11', label: '3.11', description: 'Active support' },
      { value: '3.12', label: '3.12', description: 'Latest' }
    ], ['3.11', '3.12']);
    config.pipeline.matrix.python = pythonVersions.map(v => v.value);
  }

  if (projectType === 'go' || projectType === 'unknown') {
    const goVersions = await askMultiSelect('Go versions:', [
      { value: '1.21', label: '1.21', description: 'Older stable' },
      { value: '1.22', label: '1.22', description: 'Current' },
      { value: '1.23', label: '1.23', description: 'Latest' }
    ], ['1.22', '1.23']);
    config.pipeline.matrix.go = goVersions.map(v => v.value);
  }

  if (projectType === 'rust' || projectType === 'unknown') {
    const rustVersions = await askMultiSelect('Rust versions:', [
      { value: 'stable', label: 'Stable', description: 'Latest stable' },
      { value: 'beta', label: 'Beta', description: 'Next stable' },
      { value: 'nightly', label: 'Nightly', description: 'Cutting edge' }
    ], ['stable']);
    config.pipeline.matrix.rust = rustVersions.map(v => v.value);
  }

  // Caching
  section('Caching');
  const cacheOptions = [];
  if (projectType === 'node' || fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    cacheOptions.push({ value: 'npm', label: 'npm', description: 'node_modules cache' });
  }
  if (projectType === 'python' || fs.existsSync(path.join(process.cwd(), 'requirements.txt')) || fs.existsSync(path.join(process.cwd(), 'pyproject.toml'))) {
    cacheOptions.push({ value: 'pip', label: 'pip', description: 'pip cache' });
  }
  if (projectType === 'rust' || fs.existsSync(path.join(process.cwd(), 'Cargo.toml'))) {
    cacheOptions.push({ value: 'cargo', label: 'cargo', description: 'Cargo registry cache' });
  }
  if (projectType === 'go' || fs.existsSync(path.join(process.cwd(), 'go.mod'))) {
    cacheOptions.push({ value: 'go', label: 'Go', description: 'Go module cache' });
  }
  if (projectType === 'java' || fs.existsSync(path.join(process.cwd(), 'pom.xml')) || fs.existsSync(path.join(process.cwd(), 'build.gradle'))) {
    cacheOptions.push({ value: 'maven', label: 'Maven', description: 'Maven repository cache' });
    cacheOptions.push({ value: 'gradle', label: 'Gradle', description: 'Gradle cache' });
  }
  cacheOptions.push({ value: 'docker', label: 'Docker layers', description: 'Docker layer cache' });

  if (cacheOptions.length > 0) {
    const selectedCache = await askMultiSelect('Enable caching:', cacheOptions, cacheOptions.filter(c => c.value === 'npm' || c.value === 'docker').map(c => c.value));
    config.pipeline.caching = {};
    for (const opt of cacheOptions) {
      config.pipeline.caching[opt.value] = selectedCache.some(s => s.value === opt.value);
    }
  }

  // Notifications
  section('Notifications');
  const notifOptions = await askMultiSelect('Notifications:', [
    { value: 'slack', label: 'Slack', description: 'Post to Slack channel' },
    { value: 'discord', label: 'Discord', description: 'Post to Discord channel' },
    { value: 'email', label: 'Email', description: 'Send email on failure' },
    { value: 'webhook', label: 'Webhook', description: 'Custom HTTP webhook' }
  ], []);
  config.pipeline.notifications = {
    slack: notifOptions.some(n => n.value === 'slack'),
    discord: notifOptions.some(n => n.value === 'discord'),
    email: notifOptions.some(n => n.value === 'email'),
    webhook: notifOptions.some(n => n.value === 'webhook') ? await ask('Webhook URL', '') : ''
  };

  // Save config
  const configPath = path.join(process.cwd(), 'ci-cd.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  success(`\nConfiguration saved to ${configPath}`);

  // Generate
  const generateNow = await askYesNo('\nGenerate pipeline now?', true);
  if (generateNow) {
    await cmdGenerate(config);
  } else {
    info('Run `node ci-cd.js generate` to generate later');
  }
}

async function cmdGenerate(configOverride = null) {
  section('Generating CI/CD Pipeline');

  const config = configOverride || loadConfig();
  const provider = config.provider;

  if (provider === 'github-actions') {
    await generateGitHubActions(config);
  } else if (provider === 'gitlab-ci') {
    await generateGitLabCI(config);
  } else if (provider === 'circleci') {
    await generateCircleCI(config);
  } else if (provider === 'azure-pipelines') {
    await generateAzurePipelines(config);
  } else {
    error(`Unknown provider: ${provider}`);
    process.exit(1);
  }

  success('Pipeline generated successfully!');
}

async function generateGitHubActions(config) {
  const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
  }

  const pipeline = config.pipeline;
  let yaml = `# ${pipeline.name}
# Auto-generated by ci-cd skill
# DO NOT EDIT DIRECTLY - run "node ci-cd.js setup" to modify

name: ${pipeline.name}

on:`;

  // Triggers
  const triggers = [];
  if (pipeline.triggers.push && pipeline.triggers.push.length > 0) {
    triggers.push(`  push:
    branches: [${pipeline.triggers.push.map(b => `'${b}'`).join(', ')}]`);
  }
  if (pipeline.triggers.pullRequest && pipeline.triggers.pullRequest.length > 0) {
    triggers.push(`  pull_request:
    branches: [${pipeline.triggers.pullRequest.map(b => `'${b}'`).join(', ')}]`);
  }
  if (pipeline.triggers.tags) {
    triggers.push(`  push:
    tags: ['*']`);
  }
  if (pipeline.triggers.schedule) {
    triggers.push(`  schedule:
    - cron: '${pipeline.triggers.schedule}'`);
  }
  if (pipeline.triggers.manual) {
    triggers.push(`  workflow_dispatch:`);
  }
  yaml += '\n' + triggers.join('\n') + '\n';

  // Permissions
  yaml += `
permissions:
  contents: read
  security-events: write
  actions: read
  checks: write`;

  // Jobs
  yaml += '\n\njobs:';

  // Lint job
  if (pipeline.jobs.lint) {
    yaml += generateJob('lint', 'Lint', pipeline, config);
  }

  // Typecheck job
  if (pipeline.jobs.typecheck) {
    yaml += generateJob('typecheck', 'Typecheck', pipeline, config);
  }

  // Test jobs
  if (pipeline.jobs.test.unit || pipeline.jobs.test.integration || pipeline.jobs.test.e2e) {
    yaml += generateTestJobs(pipeline, config);
  }

  // Build job
  if (pipeline.jobs.build) {
    yaml += generateJob('build', 'Build', pipeline, config);
  }

  // Security jobs
  if (pipeline.jobs.security.periderm || pipeline.jobs.security.dependencyAudit || pipeline.jobs.security.sast || pipeline.jobs.security.containerScan) {
    yaml += generateSecurityJobs(pipeline, config);
  }

  // Deploy jobs
  if (pipeline.jobs.deploy.enabled) {
    yaml += generateDeployJobs(pipeline, config);
  }

  // Notifications
  if (pipeline.notifications.slack || pipeline.notifications.discord || pipeline.notifications.email || pipeline.notifications.webhook) {
    yaml += generateNotificationJob(pipeline, config);
  }

  const fileName = 'ci.yml';
  const filePath = path.join(workflowsDir, fileName);
  fs.writeFileSync(filePath, yaml);
  success(`Generated ${filePath}`);
}

function generateJob(id, name, pipeline, config) {
  const projectType = config.projectType;
  const matrix = buildMatrix(pipeline.matrix);
  const cache = buildCacheSteps(pipeline.caching, projectType);
  
  let job = `
  ${id}:
    name: ${name}
    runs-on: ${{ matrix.os }}`;
  
  if (matrix.length > 0) {
    job += `
    strategy:
      matrix:`;
    for (const [key, values] of Object.entries(matrix)) {
      job += `
        ${key}: [${values.map(v => `'${v}'`).join(', ')}]`;
    }
    job += `
      fail-fast: false`;
  }
  
  job += `
    steps:
      - name: Checkout
        uses: actions/checkout@v4`;
  
  // Setup language
  if (projectType === 'node') {
    job += `
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'`;
  } else if (projectType === 'python') {
    job += `
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python }}
          cache: 'pip'`;
  } else if (projectType === 'go') {
    job += `
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ matrix.go }}
          cache: true`;
  } else if (projectType === 'rust') {
    job += `
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          toolchain: ${{ matrix.rust }}
      - name: Cache Cargo
        uses: actions/cache@v4
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            target
          key: cargo-${{ runner.os }}-${{ hashFiles('**/Cargo.lock') }}`;
  }
  
  // Cache steps
  for (const step of cache) {
    job += step;
  }
  
  // Install
  if (projectType === 'node') {
    job += `
      - name: Install dependencies
        run: npm ci`;
  } else if (projectType === 'python') {
    job += `
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
          if [ -f pyproject.toml ]; then pip install -e .; fi`;
  } else if (projectType === 'go') {
    job += `
      - name: Download dependencies
        run: go mod download`;
  } else if (projectType === 'rust') {
    job += `
      - name: Install dependencies
        run: cargo fetch`;
  }
  
  // Run command
  const commands = getJobCommands(id, projectType);
  if (commands.length > 0) {
    job += `
      - name: Run ${name.toLowerCase()}
        run: |`;
    for (const cmd of commands) {
      job += `
          ${cmd}`;
    }
  }
  
  return job;
}

function generateTestJobs(pipeline, config) {
  let jobs = '';
  const testTypes = [];
  if (pipeline.jobs.test.unit) testTypes.push({ id: 'test-unit', name: 'Unit Tests', cmd: getTestCommand('unit', config.projectType) });
  if (pipeline.jobs.test.integration) testTypes.push({ id: 'test-integration', name: 'Integration Tests', cmd: getTestCommand('integration', config.projectType) });
  if (pipeline.jobs.test.e2e) testTypes.push({ id: 'test-e2e', name: 'E2E Tests', cmd: getTestCommand('e2e', config.projectType) });
  
  for (const test of testTypes) {
    jobs += `
  ${test.id}:
    name: ${test.name}
    runs-on: \${{ matrix.os }}`;
    
    const matrix = buildMatrix(pipeline.matrix);
    if (matrix.length > 0) {
      jobs += `
    strategy:
      matrix:`;
      for (const [key, values] of Object.entries(matrix)) {
        jobs += `
        ${key}: [${values.map(v => `'${v}'`).join(', ')}]`;
      }
      jobs += `
      fail-fast: false`;
    }
    
    jobs += `
    steps:
      - name: Checkout
        uses: actions/checkout@v4`;
    
    // Setup (same as other jobs)
    if (config.projectType === 'node') {
      jobs += `
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: 'npm'
      - name: Install dependencies
        run: npm ci`;
    } else if (config.projectType === 'python') {
      jobs += `
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python }}
          cache: 'pip'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
          if [ -f pyproject.toml ]; then pip install -e .; fi`;
    } else if (config.projectType === 'go') {
      jobs += `
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: \${{ matrix.go }}
          cache: true
      - name: Download dependencies
        run: go mod download`;
    } else if (config.projectType === 'rust') {
      jobs += `
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          toolchain: \${{ matrix.rust }}
      - name: Cache Cargo
        uses: actions/cache@v4
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            target
          key: cargo-\${{ runner.os }}-\${{ hashFiles('**/Cargo.lock') }}
      - name: Install dependencies
        run: cargo fetch`;
    }
    
    jobs += `
      - name: Run ${test.name}
        run: ${test.cmd}`;
  }
  
  return jobs;
}

function generateSecurityJobs(pipeline, config) {
  let jobs = '';
  
  if (pipeline.jobs.security.periderm) {
    jobs += `
  security-periderm:
    name: Periderm Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Install Periderm
        run: npm i -g periderm-cli
      - name: Run Periderm Scan
        run: periderm scan --json --sarif > periderm.sarif
      - name: Run Periderm Deep Review
        run: periderm review --deep --json
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: periderm.sarif
          category: periderm`;
  }
  
  if (pipeline.jobs.security.dependencyAudit) {
    jobs += `
  security-deps:
    name: Dependency Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Audit dependencies
        run: |
          npm audit --json > audit.json || true
          cat audit.json
      - name: Upload audit results
        uses: actions/upload-artifact@v4
        with:
          name: dependency-audit
          path: audit.json`;
  }
  
  if (pipeline.jobs.security.sast) {
    jobs += `
  security-sast:
    name: SAST (CodeQL)
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: /language:\${{matrix.language}}`;
  }
  
  if (pipeline.jobs.security.containerScan) {
    jobs += `
  security-container:
    name: Container Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t app .
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'image'
          scan-ref: 'app'
          format: 'sarif'
          output: 'trivy.sarif'
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: trivy.sarif
          category: container`;
  }
  
  return jobs;
}

function generateDeployJobs(pipeline, config) {
  let jobs = '';
  
  for (const env of pipeline.jobs.deploy.environments) {
    const needsApproval = pipeline.jobs.deploy.approvalRequired?.includes(env) || false;
    const envName = env.charAt(0).toUpperCase() + env.slice(1);
    
    jobs += `
  deploy-${env}:
    name: Deploy to ${envName}
    runs-on: ubuntu-latest
    environment: ${env}
    needs: [build${pipeline.jobs.security.periderm ? ', security-periderm' : ''}${pipeline.jobs.security.dependencyAudit ? ', security-deps' : ''}]
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy to ${envName}
        run: echo "Deploy to ${env} - implement your deployment here"
        env:
          ENVIRONMENT: ${env}`;
    
    if (needsApproval) {
      jobs = jobs.replace('needs: [', 'needs: [\n      # Requires manual approval via environment protection rules\n      ');
    }
  }
  
  return jobs;
}

function generateNotificationJob(pipeline, config) {
  let job = `
  notify:
    name: Notifications
    runs-on: ubuntu-latest
    needs: [${getAllJobNames(pipeline).join(', ')}]
    if: always()
    steps:`;
  
  if (pipeline.notifications.slack) {
    job += `
      - name: Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          channel: '#ci-cd'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
        if: always()`;
  }
  
  if (pipeline.notifications.discord) {
    job += `
      - name: Discord notification
        uses: Ilshidur/action-discord@master
        with:
          webhook_url: \${{ secrets.DISCORD_WEBHOOK }}
          status: \${{ job.status }}
        if: always()`;
  }
  
  if (pipeline.notifications.email) {
    job += `
      - name: Email notification
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 465
          username: \${{ secrets.EMAIL_USERNAME }}
          password: \${{ secrets.EMAIL_PASSWORD }}
          subject: "CI/CD \${{ job.status }} - \${{ github.repository }}"
          to: \${{ secrets.NOTIFICATION_EMAIL }}
          from: CI/CD Bot
          body: "Workflow \${{ github.workflow }} \${{ job.status }}. Run: \${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}"
        if: always()`;
  }
  
  if (pipeline.notifications.webhook) {
    job += `
      - name: Webhook notification
        run: |
          curl -X POST -H "Content-Type: application/json" \\
            -d '{"workflow":"${{ github.workflow }}","status":"${{ job.status }}","run":"${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}' \\
            ${pipeline.notifications.webhook}
        if: always()`;
  }
  
  return job;
}

function buildMatrix(matrix) {
  const result = {};
  if (matrix.os && matrix.os.length > 0) result.os = matrix.os;
  if (matrix.node && matrix.node.length > 0) result.node = matrix.node;
  if (matrix.python && matrix.python.length > 0) result.python = matrix.python;
  if (matrix.go && matrix.go.length > 0) result.go = matrix.go;
  if (matrix.rust && matrix.rust.length > 0) result.rust = matrix.rust;
  return result;
}

function buildCacheSteps(caching, projectType) {
  const steps = [];
  if (caching.npm && projectType === 'node') {
    steps.push(`
      - name: Cache node_modules
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
          restore-keys: npm-${{ runner.os }}-`);
  }
  if (caching.pip && projectType === 'python') {
    steps.push(`
      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: pip-${{ runner.os }}-${{ hashFiles('**/requirements.txt', '**/pyproject.toml') }}
          restore-keys: pip-${{ runner.os }}-`);
  }
  if (caching.cargo && projectType === 'rust') {
    steps.push(`
      - name: Cache Cargo
        uses: actions/cache@v4
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            target
          key: cargo-${{ runner.os }}-${{ hashFiles('**/Cargo.lock') }}
          restore-keys: cargo-${{ runner.os }}-`);
  }
  if (caching.go && projectType === 'go') {
    steps.push(`
      - name: Cache Go modules
        uses: actions/cache@v4
        with:
          path: ~/go/pkg/mod
          key: go-${{ runner.os }}-${{ hashFiles('**/go.sum') }}
          restore-keys: go-${{ runner.os }}-`);
  }
  if (caching.maven && projectType === 'java') {
    steps.push(`
      - name: Cache Maven
        uses: actions/cache@v4
        with:
          path: ~/.m2/repository
          key: maven-${{ runner.os }}-${{ hashFiles('**/pom.xml') }}
          restore-keys: maven-${{ runner.os }}-`);
  }
  if (caching.gradle && projectType === 'java') {
    steps.push(`
      - name: Cache Gradle
        uses: actions/cache@v4
        with:
          path: ~/.gradle/caches
          key: gradle-${{ runner.os }}-${{ hashFiles('**/build.gradle*') }}
          restore-keys: gradle-${{ runner.os }}-`);
  }
  if (caching.docker) {
    steps.push(`
      - name: Cache Docker layers
        uses: actions/cache@v4
        with:
          path: /tmp/.buildx-cache
          key: docker-${{ runner.os }}-${{ hashFiles('**/Dockerfile') }}
          restore-keys: docker-${{ runner.os }}-`);
  }
  return steps;
}

function getJobCommands(jobId, projectType) {
  const commands = {
    node: {
      lint: ['npm run lint --if-present'],
      typecheck: ['npm run typecheck --if-present'],
      build: ['npm run build --if-present'],
      'test-unit': ['npm run test:unit --if-present || npm test --if-present'],
      'test-integration': ['npm run test:integration --if-present'],
      'test-e2e': ['npm run test:e2e --if-present']
    },
    python: {
      lint: ['ruff check .', 'black --check .'],
      typecheck: ['mypy .'],
      build: ['python -m build'],
      'test-unit': ['pytest tests/unit -v'],
      'test-integration': ['pytest tests/integration -v'],
      'test-e2e': ['pytest tests/e2e -v']
    },
    go: {
      lint: ['golangci-lint run'],
      typecheck: ['go vet ./...'],
      build: ['go build ./...'],
      'test-unit': ['go test ./... -short'],
      'test-integration': ['go test ./... -tags=integration'],
      'test-e2e': ['go test ./... -tags=e2e']
    },
    rust: {
      lint: ['cargo clippy -- -D warnings'],
      typecheck: ['cargo check'],
      build: ['cargo build --release'],
      'test-unit': ['cargo test --lib'],
      'test-integration': ['cargo test --test integration'],
      'test-e2e': ['cargo test --test e2e']
    },
    java: {
      lint: ['./gradlew checkstyleMain || mvn checkstyle:check'],
      typecheck: ['./gradlew compileJava || mvn compile'],
      build: ['./gradlew build || mvn package'],
      'test-unit': ['./gradlew test || mvn test'],
      'test-integration': ['./gradlew integrationTest || mvn failsafe:integration-test'],
      'test-e2e': ['./gradlew e2eTest || mvn failsafe:verify']
    }
  };
  
  return commands[projectType]?.[jobId] || [];
}

function getTestCommand(type, projectType) {
  const cmds = getJobCommands(`test-${type}`, projectType);
  return cmds.join(' && ') || 'echo "No test command configured"';
}

function getAllJobNames(pipeline) {
  const names = [];
  if (pipeline.jobs.lint) names.push('lint');
  if (pipeline.jobs.typecheck) names.push('typecheck');
  if (pipeline.jobs.test.unit) names.push('test-unit');
  if (pipeline.jobs.test.integration) names.push('test-integration');
  if (pipeline.jobs.test.e2e) names.push('test-e2e');
  if (pipeline.jobs.build) names.push('build');
  if (pipeline.jobs.security.periderm) names.push('security-periderm');
  if (pipeline.jobs.security.dependencyAudit) names.push('security-deps');
  if (pipeline.jobs.security.sast) names.push('security-sast');
  if (pipeline.jobs.security.containerScan) names.push('security-container');
  return names;
}

async function generateGitLabCI(config) {
  const filePath = path.join(process.cwd(), '.gitlab-ci.yml');
  let yaml = `# ${config.pipeline.name}
# Auto-generated by ci-cd skill

stages:
  - lint
  - test
  - build
  - security
  - deploy
  - notify

variables:
  NODE_VERSION: "20"
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"
  CARGO_HOME: "$CI_PROJECT_DIR/.cargo"
  GO_MODULE_CACHE: "$CI_PROJECT_DIR/.go/pkg/mod"

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .npm/
    - .cache/pip/
    - .cargo/
    - .go/pkg/mod/
    - target/
    - ~/.m2/repository/
    - ~/.gradle/caches/
`;

  // Add jobs similar to GitHub Actions but in GitLab CI format
  // Simplified for brevity
  yaml += `
lint:
  stage: lint
  image: node:20
  script:
    - npm ci
    - npm run lint --if-present
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm test
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"

build:
  stage: build
  image: node:20
  script:
    - npm ci
    - npm run build --if-present
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_COMMIT_TAG

security_periderm:
  stage: security
  image: node:20
  script:
    - npm i -g periderm-cli
    - periderm scan --json
    - periderm review --deep --json
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

deploy_staging:
  stage: deploy
  image: alpine
  script:
    - echo "Deploy to staging"
  environment:
    name: staging
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"

deploy_production:
  stage: deploy
  image: alpine
  script:
    - echo "Deploy to production"
  environment:
    name: production
  when: manual
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
`;

  fs.writeFileSync(filePath, yaml);
  success(`Generated ${filePath}`);
}

async function generateCircleCI(config) {
  const dir = path.join(process.cwd(), '.circleci');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const filePath = path.join(dir, 'config.yml');
  let yaml = `# ${config.pipeline.name}
# Auto-generated by ci-cd skill

version: 2.1

orbs:
  node: circleci/node@5.0
  python: circleci/python@2.1
  go: circleci/go@2.1

jobs:
  lint:
    executor: node/default
    steps:
      - checkout
      - node/install-packages
      - run: npm run lint --if-present

  test:
    executor: node/default
    steps:
      - checkout
      - node/install-packages
      - run: npm test

  build:
    executor: node/default
    steps:
      - checkout
      - node/install-packages
      - run: npm run build --if-present

  security_periderm:
    executor: node/default
    steps:
      - checkout
      - run: npm i -g periderm-cli
      - run: periderm scan --json
      - run: periderm review --deep --json

workflows:
  ci-cd:
    jobs:
      - lint
      - test:
          requires: [lint]
      - build:
          requires: [test]
      - security_periderm:
          requires: [build]
          filters:
            branches:
              only: main
`;

  fs.writeFileSync(filePath, yaml);
  success(`Generated ${filePath}`);
}

async function generateAzurePipelines(config) {
  const filePath = path.join(process.cwd(), 'azure-pipelines.yml');
  let yaml = `# ${config.pipeline.name}
# Auto-generated by ci-cd skill

trigger:
  branches:
    include:
      - main
      - develop

pr:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  NODE_VERSION: '20'

stages:
- stage: Lint
  jobs:
  - job: Lint
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '$(NODE_VERSION)'
    - script: npm ci
    - script: npm run lint --if-present

- stage: Test
  jobs:
  - job: Test
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '$(NODE_VERSION)'
    - script: npm ci
    - script: npm test

- stage: Build
  jobs:
  - job: Build
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '$(NODE_VERSION)'
    - script: npm ci
    - script: npm run build --if-present

- stage: Security
  jobs:
  - job: Periderm
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '$(NODE_VERSION)'
    - script: npm i -g periderm-cli
    - script: periderm scan --json
    - script: periderm review --deep --json
`;

  fs.writeFileSync(filePath, yaml);
  success(`Generated ${filePath}`);
}

async function cmdAnalyze() {
  section('Analyzing Existing CI/CD');
  
  const existingCI = detectExistingCI();
  if (existingCI.length === 0) {
    warn('No CI/CD configuration found');
    return;
  }
  
  for (const ci of existingCI) {
    info(`\n${ci.provider.toUpperCase()}: ${ci.path}`);
    const fullPath = path.join(process.cwd(), ci.path);
    
    if (ci.provider === 'github-actions') {
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(fullPath, file), 'utf8');
        analyzeGitHubActions(file, content);
      }
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      analyzeGeneric(ci.provider, content);
    }
  }
}

function analyzeGitHubActions(fileName, content) {
  info(`\n  Workflow: ${fileName}`);
  
  // Parse basic info
  const nameMatch = content.match(/^name:\s*(.+)$/m);
  if (nameMatch) info(`    Name: ${nameMatch[1].trim()}`);
  
  // Triggers
  const onMatch = content.match(/on:\s*([\s\S]*?)(?:\n\w+:|\n$)/);
  if (onMatch) {
    info(`    Triggers: ${onMatch[1].trim().split('\n').map(l => l.trim()).filter(l => l).join(', ')}`);
  }
  
  // Jobs
  const jobsMatch = content.match(/jobs:\s*([\s\S]*?)(?:\n\w+:|\n$)/);
  if (jobsMatch) {
    const jobNames = jobsMatch[1].match(/^\s{2}(\w+):/gm);
    if (jobNames) {
      info(`    Jobs: ${jobNames.map(j => j.trim()).join(', ')}`);
    }
  }
  
  // Check for common issues
  const issues = [];
  if (!content.includes('actions/checkout@v4')) issues.push('Using outdated checkout action');
  if (!content.includes('cache:')) issues.push('No caching configured');
  if (!content.includes('strategy:') && !content.includes('matrix:')) issues.push('No matrix testing');
  if (!content.includes('permissions:')) issues.push('No explicit permissions');
  if (content.includes('ubuntu-latest') && !content.includes('macos') && !content.includes('windows')) issues.push('Single OS only');
  
  if (issues.length > 0) {
    warn('    Issues found:');
    for (const issue of issues) {
      warn(`      - ${issue}`);
    }
  } else {
    success('    No obvious issues found');
  }
}

function analyzeGeneric(provider, content) {
  info(`\n  ${provider.toUpperCase()} configuration`);
  const lines = content.split('\n').length;
  info(`    Lines: ${lines}`);
  
  // Basic checks
  if (provider === 'gitlab-ci') {
    if (!content.includes('cache:')) warn('    No cache configuration');
    if (!content.includes('stage')) warn('    No stages defined');
    if (!content.includes('rules:')) warn('    No rules for conditional execution');
  }
}

async function cmdEdit(workflowPath) {
  section(`Editing ${workflowPath}`);
  info('Edit mode - showing current workflow for reference');
  
  const fullPath = path.join(process.cwd(), workflowPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  console.log('\n' + content);
  
  info('\nEdit functionality:');
  info('  - Use your editor to modify the file directly');
  info('  - Run `node ci-cd.js validate` to check syntax');
  info('  - Run `node ci-cd.js explain` to understand changes');
}

async function cmdExplain(workflowPath) {
  section(`Explaining ${workflowPath}`);
  
  const fullPath = path.join(process.cwd(), workflowPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  info('\nWORKFLOW EXPLANATION');
  info('====================\n');
  
  // Parse and explain
  const nameMatch = content.match(/^name:\s*(.+)$/m);
  if (nameMatch) {
    console.log(`Name: ${nameMatch[1].trim()}`);
  }
  
  console.log('\nThis workflow runs on:');
  if (content.includes('push:')) console.log('  - Push events');
  if (content.includes('pull_request:')) console.log('  - Pull request events');
  if (content.includes('schedule:')) console.log('  - Scheduled (cron)');
  if (content.includes('workflow_dispatch:')) console.log('  - Manual trigger');
  if (content.includes('tags:')) console.log('  - Tag pushes');
  
  console.log('\nJobs:');
  const jobMatches = content.match(/^\s{2}(\w+):/gm);
  if (jobNames) {
    for (const job of jobNames) {
      const jobName = job.trim();
      console.log(`  - ${jobName}`);
      
      // Extract job details
      const jobRegex = new RegExp(`${jobName}:[\\s\\S]*?(?=\\n\\s{2}\\w+:|\\n\\w+:|$)`, 'm');
      const jobContent = content.match(jobRegex);
      if (jobContent) {
        const jobText = jobContent[0];
        if (jobText.includes('runs-on:')) {
          const osMatch = jobText.match(/runs-on:\s*(.+)/);
          if (osMatch) console.log(`    Runs on: ${osMatch[1].trim()}`);
        }
        if (jobText.includes('matrix:')) {
          console.log(`    Uses matrix strategy`);
        }
        if (jobText.includes('needs:')) {
          const needsMatch = jobText.match(/needs:\s*\[([^\]]+)\]/);
          if (needsMatch) console.log(`    Depends on: ${needsMatch[1]}`);
        }
      }
    }
  }
  
  console.log('\nKey Features:');
  if (content.includes('actions/cache')) console.log('  ✓ Caching enabled');
  if (content.includes('strategy:') || content.includes('matrix:')) console.log('  ✓ Matrix testing');
  if (content.includes('permissions:')) console.log('  ✓ Explicit permissions');
  if (content.includes('codeql-action') || content.includes('sast')) console.log('  ✓ SAST scanning');
  if (content.includes('periderm')) console.log('  ✓ Periderm security scanning');
  if (content.includes('environment:')) console.log('  ✓ Deployment environments');
  if (content.includes('workflow_call:')) console.log('  ✓ Reusable workflow');
  
  console.log('\nPotential Improvements:');
  if (!content.includes('actions/cache')) console.log('  - Add caching for faster builds');
  if (!content.includes('matrix:')) console.log('  - Add matrix for multi-version/OS testing');
  if (!content.includes('permissions:')) console.log('  - Add explicit permissions for least privilege');
  if (!content.includes('periderm')) console.log('  - Add Periderm for secret scanning');
}

async function cmdValidate(workflowPath) {
  section(`Validating ${workflowPath}`);
  
  const fullPath = path.join(process.cwd(), workflowPath);
  if (!fs.existsSync(fullPath)) {
    error(`File not found: ${workflowPath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Basic YAML validation
  try {
    // Try to parse as YAML (basic check)
    const lines = content.split('\n');
    let indent = 0;
    let valid = true;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() && !line.startsWith('#')) {
        const currentIndent = line.match(/^(\s*)/)[1].length;
        if (currentIndent % 2 !== 0) {
          warn(`Line ${i + 1}: Odd indentation (${currentIndent} spaces)`);
          valid = false;
        }
      }
    }
    if (valid) {
      success('YAML syntax appears valid');
    }
  } catch (e) {
    error(`YAML parse error: ${e.message}`);
  }
  
  // GitHub Actions specific validation
  if (workflowPath.includes('.github/workflows')) {
    const required = ['name', 'on', 'jobs'];
    for (const req of required) {
      if (!content.includes(`${req}:`)) {
        warn(`Missing required field: ${req}`);
      } else {
        success(`Has required field: ${req}`);
      }
    }
    
    // Check for common best practices
    const checks = [
      { pattern: 'actions/checkout@v4', msg: 'Uses latest checkout' },
      { pattern: 'actions/cache', msg: 'Has caching' },
      { pattern: 'strategy:', msg: 'Has matrix strategy' },
      { pattern: 'permissions:', msg: 'Has explicit permissions' },
      { pattern: 'fail-fast: false', msg: 'Matrix fail-fast disabled' }
    ];
    
    for (const check of checks) {
      if (content.includes(check.pattern)) {
        success(check.msg);
      } else {
        warn(`Missing: ${check.msg}`);
      }
    }
  }
  
  success('\nValidation complete');
}

function cmdStatus() {
  section('CI/CD Status');
  
  const existingCI = detectExistingCI();
  if (existingCI.length === 0) {
    warn('No CI/CD configuration found');
  } else {
    for (const ci of existingCI) {
      success(`${ci.provider}: ${ci.path}`);
      const fullPath = path.join(process.cwd(), ci.path);
      if (fs.statSync(fullPath).isDirectory()) {
        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
        for (const file of files) {
          info(`  - ${file}`);
        }
      }
    }
  }
  
  const configPath = path.join(process.cwd(), 'ci-cd.json');
  if (fs.existsSync(configPath)) {
    info(`\nConfig: ${configPath}`);
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(JSON.stringify(config, null, 2));
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  return args[0] || 'help';
}

function showHelp() {
  console.log(`
${COLORS.bold}CI/CD Pipeline Analyzer & Generator${COLORS.reset}

Usage:
  node ci-cd.js <command> [args]

Commands:
  setup             Interactive setup - grills you: create, edit, or understand
  analyze           Analyze existing CI/CD configurations
  generate          Generate new pipeline from config
  explain <file>    Explain a workflow in plain English
  edit <file>       Show workflow for manual editing
  validate <file>   Validate workflow syntax and best practices
  status            Show CI/CD configuration status
  help              Show this help

Examples:
  node ci-cd.js setup                    # Interactive mode
  node ci-cd.js analyze                  # Analyze existing
  node ci-cd.js generate                 # Generate from config
  node ci-cd.js explain .github/workflows/ci.yml
  node ci-cd.js validate .github/workflows/ci.yml
  node ci-cd.js status
`);
}

async function main() {
  const cmd = parseArgs();
  const arg = process.argv[3];
  
  switch (cmd) {
    case 'setup': await cmdSetup(); break;
    case 'analyze': await cmdAnalyze(); break;
    case 'generate': await cmdGenerate(); break;
    case 'explain': 
      if (!arg) { error('Specify workflow file to explain'); process.exit(1); }
      await cmdExplain(arg); 
      break;
    case 'edit': 
      if (!arg) { error('Specify workflow file to edit'); process.exit(1); }
      await cmdEdit(arg); 
      break;
    case 'validate': 
      if (!arg) { error('Specify workflow file to validate'); process.exit(1); }
      await cmdValidate(arg); 
      break;
    case 'status': cmdStatus(); break;
    case 'help': case '--help': case '-h': showHelp(); break;
    default: error(`Unknown: ${cmd}`); showHelp(); process.exit(1);
  }
}

main();