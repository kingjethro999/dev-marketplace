# 🌐 Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-126%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Compatible with Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-orange?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code)
[![Compatible with Cursor & Antigravity](https://img.shields.io/badge/Agent-Cursor%20%7C%20Antigravity%20%7C%20Codex-purple?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![Vercel Skills Standard](https://img.shields.io/badge/npx%20skills-ready-black?style=flat-square)](https://skills.sh)

An open developer marketplace packed with **126+ curated, battle-tested AI agent skills, language server (LSP) connectors, design engines, code quality verifiers, and video synthesis toolkits**.

Compatible across **Claude Code**, **Cursor**, **Antigravity (`agy`)**, **Codex**, and any agent platform following the standard `SKILL.md` specification.

---

## ⚡ Quickstart

Install any skill directly into your project:

```bash
# Using the built-in marketplace runner:
npx dev-marketplace add <skill-name>

# Or using the open skills.sh standard:
npx skills add kingjethro999/dev-marketplace --skill <skill-name>
```

### Install Examples

```bash
# Install Apple interface design guidelines
npx dev-marketplace add apple-design

# Install code review & test-driven development toolkit
npx dev-marketplace add code-review test-driven-development systematic-debugging

# Install all Video & Motion synthesis skills
npx dev-marketplace add --category "Video & Motion"

# Install all LSP connectors (TypeScript, Python, Rust, Go, C++, Swift...)
npx dev-marketplace add --category "Connectors & LSP"

# Sync the entire marketplace to your project:
npx dev-marketplace add --all

# Or install globally into your home agent directory (~/.agents/skills):
npx dev-marketplace add --all --global
```

---

## 💻 CLI Commands

| Command | Description |
|---|---|
| `npx dev-marketplace list` | Browse and filter all available skills by keyword or category |
| `npx dev-marketplace add <name...>` | Copy specified skill(s) into your current project (`.agents/skills`, `.claude/skills`, or `.gemini/skills`) |
| `npx dev-marketplace add --all` | Install all 126+ marketplace skills at once |
| `npx dev-marketplace add --category "<name>"` | Install all skills belonging to a specific category |
| `npx dev-marketplace info <name>` | Inspect full skill description, frontmatter, and file contents |
| `npx dev-marketplace categories` | List all marketplace categories and counts |

---

## 📚 Marketplace Catalog (126 Skills & Connectors)

### 🧪 Code Review & Quality (10 skills)

| Skill | Description | Install |
|---|---|---|
| [`claude-security`](skills/claude-security) | Put a team of agents to work as security researchers on your codebase: map the architecture,... | `npx dev-marketplace add claude-security` |
| [`pr-review-toolkit`](skills/pr-review-toolkit) | A comprehensive collection of specialized agents for thorough pull request review, covering ... | `npx dev-marketplace add pr-review-toolkit` |
| [`qc-skill`](skills/qc-skill) | Deterministic media quality control / validation. Measures and checks video, audio, subtitle... | `npx dev-marketplace add qc-skill` |
| [`receiving-code-review`](skills/receiving-code-review) | Use when receiving code review feedback, before implementing suggestions, especially if feed... | `npx dev-marketplace add receiving-code-review` |
| [`requesting-code-review`](skills/requesting-code-review) | Use when completing tasks, implementing major features, or before merging to verify work mee... | `npx dev-marketplace add requesting-code-review` |
| [`security`](skills/security) | Review code for security problems; scan for vulnerabilities, secrets, dependency and prompt ... | `npx dev-marketplace add security` |
| [`security-and-hardening`](skills/security-and-hardening) | Hardens code against vulnerabilities. Use when auditing an input handler for vulnerabilities... | `npx dev-marketplace add security-and-hardening` |
| [`systematic-debugging`](skills/systematic-debugging) | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes | `npx dev-marketplace add systematic-debugging` |
| [`test-driven-development`](skills/test-driven-development) | Use when implementing any feature or bugfix, before writing implementation code | `npx dev-marketplace add test-driven-development` |
| [`verification-before-completion`](skills/verification-before-completion) | Use when about to claim work is complete, fixed, or passing, before committing or creating P... | `npx dev-marketplace add verification-before-completion` |

### 🔌 Connectors & LSP (15 skills)

| Skill | Description | Install |
|---|---|---|
| [`clangd-lsp`](skills/clangd-lsp) | C/C++ language server (clangd) for Claude Code, providing code intelligence, diagnostics, an... | `npx dev-marketplace add clangd-lsp` |
| [`context7-mcp`](skills/context7-mcp) | This skill should be used when the user asks about libraries, frameworks, API references, or... | `npx dev-marketplace add context7-mcp` |
| [`csharp-lsp`](skills/csharp-lsp) | C# language server for Claude Code, providing code intelligence and diagnostics. | `npx dev-marketplace add csharp-lsp` |
| [`gopls-lsp`](skills/gopls-lsp) | Go language server for Claude Code, providing code intelligence, refactoring, and analysis. | `npx dev-marketplace add gopls-lsp` |
| [`jdtls-lsp`](skills/jdtls-lsp) | Java language server (Eclipse JDT.LS) for Claude Code, providing code intelligence and refac... | `npx dev-marketplace add jdtls-lsp` |
| [`kotlin-lsp`](skills/kotlin-lsp) | Kotlin language server for Claude Code, providing code intelligence, refactoring, and analysis. | `npx dev-marketplace add kotlin-lsp` |
| [`lua-lsp`](skills/lua-lsp) | Lua language server for Claude Code, providing code intelligence and diagnostics. | `npx dev-marketplace add lua-lsp` |
| [`mcp-server-dev`](skills/mcp-server-dev) | Skills for designing and building MCP servers that work seamlessly with Claude. | `npx dev-marketplace add mcp-server-dev` |
| [`mcp-tunnels`](skills/mcp-tunnels) | Connect Claude to an MCP server running inside your private network through an | `npx dev-marketplace add mcp-tunnels` |
| [`php-lsp`](skills/php-lsp) | PHP language server (Intelephense) for Claude Code, providing code intelligence and diagnost... | `npx dev-marketplace add php-lsp` |
| [`pyright-lsp`](skills/pyright-lsp) | Python language server (Pyright) for Claude Code, providing static type checking and code in... | `npx dev-marketplace add pyright-lsp` |
| [`ruby-lsp`](skills/ruby-lsp) | Ruby language server for Claude Code, providing code intelligence and analysis. | `npx dev-marketplace add ruby-lsp` |
| [`rust-analyzer-lsp`](skills/rust-analyzer-lsp) | Rust language server for Claude Code, providing code intelligence and analysis. | `npx dev-marketplace add rust-analyzer-lsp` |
| [`swift-lsp`](skills/swift-lsp) | Swift language server (SourceKit-LSP) for Claude Code, providing code intelligence for Swift... | `npx dev-marketplace add swift-lsp` |
| [`typescript-lsp`](skills/typescript-lsp) | TypeScript/JavaScript language server for Claude Code, providing code intelligence features ... | `npx dev-marketplace add typescript-lsp` |

### 🎨 Design & UI (14 skills)

| Skill | Description | Install |
|---|---|---|
| [`apple-design`](skills/apple-design) | Apple's approach to interface design and fluid, physical motion, translated for the web. Use... | `npx dev-marketplace add apple-design` |
| [`break-ui`](skills/break-ui) | Try to break a piece of UI by feeding it worst-case data — long names, unbreakable emails, o... | `npx dev-marketplace add break-ui` |
| [`design-mobile-apps`](skills/design-mobile-apps) | Design mobile app screens with Sleek, edit Sleek projects, and implement their designs in Re... | `npx dev-marketplace add design-mobile-apps` |
| [`emil-design-eng`](skills/emil-design-eng) | Emil Kowalski's design-engineering philosophy for UI polish, component design, animation dec... | `npx dev-marketplace add emil-design-eng` |
| [`figma`](skills/figma) | Bring Figma into a HyperFrames video - rendered assets, brand tokens, components, storyboard... | `npx dev-marketplace add figma` |
| [`figma-designer`](skills/figma-designer) | Design inside Figma the way this designer does: real variables, text styles, auto layout and... | `npx dev-marketplace add figma-designer` |
| [`firecrawl-build`](skills/firecrawl-build) | Optional base URL for self-hosted Firecrawl deployments. Only set this when the project is n... | `npx dev-marketplace add firecrawl-build` |
| [`gestures`](skills/gestures) | Build drag, swipe, and sheet interactions that track the finger 1:1 and stay interruptible. ... | `npx dev-marketplace add gestures` |
| [`impeccable`](skills/impeccable) | Use when the user wants to design, redesign, shape, critique, audit, polish, simplify, harde... | `npx dev-marketplace add impeccable` |
| [`improve`](skills/improve) | Survey any codebase as a senior advisor and produce prioritized, self-contained implementati... | `npx dev-marketplace add improve` |
| [`landing-page-design`](skills/landing-page-design) | Complete system for building high converting landing pages: intake questions, page structure... | `npx dev-marketplace add landing-page-design` |
| [`learn-taste`](skills/learn-taste) | Turn a session's design corrections into rules, with their why, in DESIGN.md, a project skil... | `npx dev-marketplace add learn-taste` |
| [`pick-ui-library`](skills/pick-ui-library) | Pick the library for a frontend task from a curated list — primitives, toasts, drawers, comm... | `npx dev-marketplace add pick-ui-library` |
| [`prototype`](skills/prototype) | Build multiple genuinely different versions of a UI piece you describe, rendered behind a vi... | `npx dev-marketplace add prototype` |

### 🛠️ Developer Tools & AI (27 skills)

| Skill | Description | Install |
|---|---|---|
| [`artifacts-skill`](skills/artifacts-skill) | Local-first execution and verification engine for real-world artifacts (PDF, PPTX, DOCX, XLS... | `npx dev-marketplace add artifacts-skill` |
| [`ask-emil`](skills/ask-emil) | Ask which skill or flow fits your situation. A router over the skills in this repo. | `npx dev-marketplace add ask-emil` |
| [`ask-sonner`](skills/ask-sonner) | Guide to Sonner, the React toast library — install and wire up the Toaster, pick the right t... | `npx dev-marketplace add ask-sonner` |
| [`brainstorming`](skills/brainstorming) | You MUST use this before any creative work - creating features, building components, adding ... | `npx dev-marketplace add brainstorming` |
| [`caveman`](skills/caveman) | > | `npx dev-marketplace add caveman` |
| [`choreograph`](skills/choreograph) | Coordinate several elements that animate together — decide what moves, in what order, how mu... | `npx dev-marketplace add choreograph` |
| [`claude-md-management`](skills/claude-md-management) | Tools to maintain and improve CLAUDE.md files - audit quality, capture session learnings, an... | `npx dev-marketplace add claude-md-management` |
| [`color-grading`](skills/color-grading) | Deterministic colour grading / colour correction execution Skill for the AI Video Production... | `npx dev-marketplace add color-grading` |
| [`feature-dev`](skills/feature-dev) | A comprehensive, structured workflow for feature development with specialized agents for cod... | `npx dev-marketplace add feature-dev` |
| [`find-skills`](skills/find-skills) | Helps users discover and install agent skills when they ask questions like "how do I do X", ... | `npx dev-marketplace add find-skills` |
| [`finishing-a-development-branch`](skills/finishing-a-development-branch) | Use when implementation is complete, all tests pass, and you need to decide how to integrate... | `npx dev-marketplace add finishing-a-development-branch` |
| [`html-demo`](skills/html-demo) | Show an app working on a web page by drawing it live in HTML instead of recording it. A Mac-... | `npx dev-marketplace add html-demo` |
| [`imagemagick-skill`](skills/imagemagick-skill) | Local ImageMagick image editing for files that land in a repo - iPhone HEIC/JPEG, screenshot... | `npx dev-marketplace add imagemagick-skill` |
| [`ingest-skill`](skills/ingest-skill) | Offload camera cards and recorders safely - copy a card folder to one or more drives with a ... | `npx dev-marketplace add ingest-skill` |
| [`mobile-native`](skills/mobile-native) | Make a web app feel native on a phone — the small CSS and meta-tag fixes that separate "a we... | `npx dev-marketplace add mobile-native` |
| [`product-demo`](skills/product-demo) | Record a short, polished product demo video of the running app for social media, ScreenStudi... | `npx dev-marketplace add product-demo` |
| [`product-film`](skills/product-film) | Make a short product film (website hero loop, landing section, launch film, feature walkthro... | `npx dev-marketplace add product-film` |
| [`publish-skill`](skills/publish-skill) | Upload a finished, QC-passed deliverable to a delivery platform (YouTube, Vimeo, TikTok, X, ... | `npx dev-marketplace add publish-skill` |
| [`reverse-engineer-anything`](skills/reverse-engineer-anything) | Reverse engineer native, managed, Electron/JavaScript, packaged, firmware, and browser targe... | `npx dev-marketplace add reverse-engineer-anything` |
| [`skillpact`](skills/skillpact) | Write and check SkillPact contracts (skill.contract.json) for Agent Skills with the skillpac... | `npx dev-marketplace add skillpact` |
| [`slide-sync-skill`](skills/slide-sync-skill) | Find where the slides change in a talk, lecture or conference recording and turn that into c... | `npx dev-marketplace add slide-sync-skill` |
| [`stepcap`](skills/stepcap) | Work with a stepcap recording folder (steps.json + annotated screenshots). Use when the user... | `npx dev-marketplace add stepcap` |
| [`style-sampling`](skills/style-sampling) | Make a new episode in a proven video style - Collage Explainer, Finance Explainer, Animated ... | `npx dev-marketplace add style-sampling` |
| [`transcription-skill`](skills/transcription-skill) | Transcribe speech in audio or video files (mp4, mov, mkv, wav, m4a, mp3) into a structured, ... | `npx dev-marketplace add transcription-skill` |
| [`website-scroll`](skills/website-scroll) | Record a top-to-bottom scroll of any web page as a short MP4, the way a reader scrolls it (a... | `npx dev-marketplace add website-scroll` |
| [`write-swift`](skills/write-swift) | How to write modern Swift well — modeling with value types, Swift 6 data-race safety and app... | `npx dev-marketplace add write-swift` |
| [`writing-skills`](skills/writing-skills) | Use when creating new skills, editing existing skills, or verifying skills work before deplo... | `npx dev-marketplace add writing-skills` |

### ⚙️ Engineering & Workflow (12 skills)

| Skill | Description | Install |
|---|---|---|
| [`code-modernization`](skills/code-modernization) | Point Claude at a legacy codebase and get four things: an understanding of what it is and wh... | `npx dev-marketplace add code-modernization` |
| [`commit-commands`](skills/commit-commands) | Streamline your git workflow with simple commands for committing, pushing, and creating pull... | `npx dev-marketplace add commit-commands` |
| [`diagnosing-superpowers`](skills/diagnosing-superpowers) | Use when a superpowers session went wrong and your human partner wants to know why — repeate... | `npx dev-marketplace add diagnosing-superpowers` |
| [`dispatching-parallel-agents`](skills/dispatching-parallel-agents) | Use when facing 2+ independent tasks that can be worked on without shared state or sequentia... | `npx dev-marketplace add dispatching-parallel-agents` |
| [`executing-plans`](skills/executing-plans) | Use when executing an implementation plan in the current session as the implementer yourself... | `npx dev-marketplace add executing-plans` |
| [`hookify`](skills/hookify) | Easily create custom hooks to prevent unwanted behaviors by analyzing conversation patterns ... | `npx dev-marketplace add hookify` |
| [`ralph-loop`](skills/ralph-loop) | Implementation of the Ralph Wiggum technique for iterative, self-referential AI development ... | `npx dev-marketplace add ralph-loop` |
| [`session-report`](skills/session-report) | Connector and tooling for session-report | `npx dev-marketplace add session-report` |
| [`subagent-driven-development`](skills/subagent-driven-development) | Use when executing implementation plans with independent tasks in the current session | `npx dev-marketplace add subagent-driven-development` |
| [`using-git-worktrees`](skills/using-git-worktrees) | Use when starting feature work that needs isolation from current workspace or before executi... | `npx dev-marketplace add using-git-worktrees` |
| [`using-superpowers`](skills/using-superpowers) | Use when starting any conversation - establishes how to find and use skills, requiring skill... | `npx dev-marketplace add using-superpowers` |
| [`writing-plans`](skills/writing-plans) | Use when you have a spec or requirements for a multi-step task, before touching code | `npx dev-marketplace add writing-plans` |

### 🎬 Video & Motion (48 skills)

| Skill | Description | Install |
|---|---|---|
| [`animate`](skills/animate) | Build an animation from scratch, making the decisions in the order that determines whether i... | `npx dev-marketplace add animate` |
| [`animate-expo`](skills/animate-expo) | Build animations in React Native and Expo, making the decisions in the order that determines... | `npx dev-marketplace add animate-expo` |
| [`animation-performance`](skills/animation-performance) | Keep web animations inside the frame budget — animate composite-only properties, keep motion... | `npx dev-marketplace add animation-performance` |
| [`animation-vocabulary`](skills/animation-vocabulary) | Reverse-lookup glossary that turns a vague description of a web animation or motion effect i... | `npx dev-marketplace add animation-vocabulary` |
| [`audio-production`](skills/audio-production) | Deterministic audio production execution Skill for the AI Video Production Ecosystem. Use it... | `npx dev-marketplace add audio-production` |
| [`blender-skill`](skills/blender-skill) | Inspect, convert, optimize, render, bake and validate 3D assets with local, headless Blender... | `npx dev-marketplace add blender-skill` |
| [`diagram-animation`](skills/diagram-animation) | This skill should be used when the user asks to "animate this diagram", "build a flowchart t... | `npx dev-marketplace add diagram-animation` |
| [`dubbing`](skills/dubbing) | Speak text with a local TTS engine and put the speech into a video, timed to the picture. NA... | `npx dev-marketplace add dubbing` |
| [`explainer-video`](skills/explainer-video) | This skill should be used when the user asks to "make an explainer video", "turn this into a... | `npx dev-marketplace add explainer-video` |
| [`ffmpeg-skill`](skills/ffmpeg-skill) | Edit video and audio with local FFmpeg: cut, join, reframe, speed, captions, overlays, silen... | `npx dev-marketplace add ffmpeg-skill` |
| [`find-animation-opportunities`](skills/find-animation-opportunities) | Search a codebase or UI for places that don't animate but should, and reject everything that... | `npx dev-marketplace add find-animation-opportunities` |
| [`hyperframes`](skills/hyperframes) | Read first to make, edit, animate or render any video with HyperFrames (HTML rendered to vid... | `npx dev-marketplace add hyperframes` |
| [`hyperframes-cli`](skills/hyperframes-cli) | HyperFrames CLI - scaffold, check frames, edit timelines, preview, render, share and project... | `npx dev-marketplace add hyperframes-cli` |
| [`hyperframes-registry`](skills/hyperframes-registry) | About 450 ready-made HyperFrames blocks and components installed as editable source - transi... | `npx dev-marketplace add hyperframes-registry` |
| [`hyperframes-skill`](skills/hyperframes-skill) | Render video from HTML scenes with HyperFrames (headless Chrome captures every frame, local ... | `npx dev-marketplace add hyperframes-skill` |
| [`improve-animations`](skills/improve-animations) | Survey a codebase's animation and motion code as a senior motion advisor, then produce a pri... | `npx dev-marketplace add improve-animations` |
| [`isometric-animation`](skills/isometric-animation) | This skill should be used when the user asks to "make an isometric animation", "build a 2.5D... | `npx dev-marketplace add isometric-animation` |
| [`media-analysis`](skills/media-analysis) | Measure deterministic facts about a media file (container, streams, video/audio format, sile... | `npx dev-marketplace add media-analysis` |
| [`media-use`](skills/media-use) | Get or make any media for a HyperFrames video - music, sound effects, images, icons, logos, ... | `npx dev-marketplace add media-use` |
| [`motion-graphics`](skills/motion-graphics) | Deterministic motion-graphics rendering execution Skill for the AI Video Production Ecosyste... | `npx dev-marketplace add motion-graphics` |
| [`nle-bridge-skill`](skills/nle-bridge-skill) | Hand an edit to Premiere Pro or DaVinci Resolve and read the editor's changes back. Writes a... | `npx dev-marketplace add nle-bridge-skill` |
| [`remotion-best-practices`](skills/remotion-best-practices) | Router for all Remotion skills | `npx dev-marketplace add remotion-best-practices` |
| [`remotion-captions`](skills/remotion-captions) | Transcribing, displaying and animating captions | `npx dev-marketplace add remotion-captions` |
| [`remotion-create`](skills/remotion-create) | Create a new Remotion video | `npx dev-marketplace add remotion-create` |
| [`remotion-docs`](skills/remotion-docs) | Search Remotion documentation | `npx dev-marketplace add remotion-docs` |
| [`remotion-ffmpeg-skill`](skills/remotion-ffmpeg-skill) | Make motion graphics on real footage with Remotion, driven by measurements from ffmpeg-skill... | `npx dev-marketplace add remotion-ffmpeg-skill` |
| [`remotion-interactivity`](skills/remotion-interactivity) | Structures Remotion markup so layers, timing and styles are editable in Remotion Studio. Use... | `npx dev-marketplace add remotion-interactivity` |
| [`remotion-license`](skills/remotion-license) | Find Remotion license information, FAQs, terms, and where to buy a license. | `npx dev-marketplace add remotion-license` |
| [`remotion-maps`](skills/remotion-maps) | Remotion Map animation knowledge | `npx dev-marketplace add remotion-maps` |
| [`remotion-markup`](skills/remotion-markup) | Content, animation and effects best practices | `npx dev-marketplace add remotion-markup` |
| [`remotion-multimedia`](skills/remotion-multimedia) | Interacting with Mediabunny | `npx dev-marketplace add remotion-multimedia` |
| [`remotion-render`](skills/remotion-render) | Export a Remotion video, still image, or editable OpenTimelineIO timeline | `npx dev-marketplace add remotion-render` |
| [`remotion-saas`](skills/remotion-saas) | Build an app with Remotion | `npx dev-marketplace add remotion-saas` |
| [`remotion-studio`](skills/remotion-studio) | Preview a Remotion video | `npx dev-marketplace add remotion-studio` |
| [`remotion-to-hyperframes`](skills/remotion-to-hyperframes) | Bring existing video code or footage into HyperFrames and verify it frame by frame against t... | `npx dev-marketplace add remotion-to-hyperframes` |
| [`remotion-upgrade`](skills/remotion-upgrade) | Upgrade Remotion, and related packages | `npx dev-marketplace add remotion-upgrade` |
| [`remove-animations`](skills/remove-animations) | Find the animations an interface doesn't need and remove them — motion on keyboard actions, ... | `npx dev-marketplace add remove-animations` |
| [`reverse-any-video`](skills/reverse-any-video) | Rebuild any video file as an editable HyperFrames project - motion graphics, talking heads, ... | `npx dev-marketplace add reverse-any-video` |
| [`review-animations`](skills/review-animations) | Reviews animation and motion code against a high craft bar derived from Emil Kowalski's desi... | `npx dev-marketplace add review-animations` |
| [`slideshow`](skills/slideshow) | Build a HyperFrames slideshow to present live - slides, fragment reveals, branching hotspots... | `npx dev-marketplace add slideshow` |
| [`sound-design-skill`](skills/sound-design-skill) | Music beds (BGM) and sound effects for a video, as WAV files with full provenance, handed to... | `npx dev-marketplace add sound-design-skill` |
| [`subtitle-skill`](skills/subtitle-skill) | Deterministic subtitle validation, SRT/WebVTT generation, video caption burn-in, machine tra... | `npx dev-marketplace add subtitle-skill` |
| [`thumbnail-skill`](skills/thumbnail-skill) | Deterministic thumbnail rendering execution Skill for the AI Video Production Ecosystem. Use... | `npx dev-marketplace add thumbnail-skill` |
| [`video-editing-skill`](skills/video-editing-skill) | Deterministic video editing from a typed edit request (trim, cut, concat with transitions, s... | `npx dev-marketplace add video-editing-skill` |
| [`video-production-agent`](skills/video-production-agent) | Plan and produce a video from source files - trim silence, normalize loudness, subtitles, co... | `npx dev-marketplace add video-production-agent` |
| [`voice-enhance-skill`](skills/voice-enhance-skill) | Clean up recorded speech with local, offline engines - isolate the voice from noise and back... | `npx dev-marketplace add voice-enhance-skill` |
| [`whiteboard-animation`](skills/whiteboard-animation) | This skill should be used when the user asks to "make a whiteboard animation", "draw-on expl... | `npx dev-marketplace add whiteboard-animation` |
| [`wrapped-video`](skills/wrapped-video) | This skill should be used when the user asks to "make a Spotify Wrapped style video", "build... | `npx dev-marketplace add wrapped-video` |

---

## 🛠️ Repository Layout

```text
dev-marketplace/
├── bin/
│   └── cli.js            # Standalone zero-dependency npx runner
├── skills/               # Standardized skill packages
│   ├── apple-design/
│   │   └── SKILL.md
│   ├── code-review/
│   │   └── SKILL.md
│   ├── remotion-*/
│   │   └── SKILL.md
│   ├── typescript-lsp/
│   │   ├── SKILL.md
│   │   └── .claude-plugin/
│   └── ... (126+ skills)
├── registry.json         # Searchable machine-readable index
└── package.json          # npm bin definition
```

---

## 🤝 Open Source & Licensing

All skills and connectors included in this registry are open-source and freely redistributable under their respective open-source licenses (MIT, Apache-2.0, or compatible).

Contributions, new agent skills, and community connectors are warmly welcomed via Pull Requests!
