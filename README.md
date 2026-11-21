# Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-131%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Compatible with Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-orange?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code)
[![Compatible with Cursor & Antigravity](https://img.shields.io/badge/Agent-Cursor%20%7C%20Antigravity%20%7C%20Codex-purple?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![Vercel Skills Standard](https://img.shields.io/badge/npx%20skills-ready-black?style=flat-square)](https://skills.sh)

An open developer marketplace packed with **131+ curated, battle-tested AI agent skills, language server (LSP) connectors, design engines, code quality verifiers, and video synthesis toolkits**.

Compatible across **Claude Code**, **Cursor**, **Antigravity (`agy`)**, **Codex**, and any agent platform following the standard `SKILL.md` specification.

---

## Quickstart

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

## CLI Commands

| Command | Description |
|---|---|
| `npx dev-marketplace list` | Browse and filter all available skills by keyword or category |
| `npx dev-marketplace add <name...>` | Copy specified skill(s) into your current project (`.agents/skills`, `.claude/skills`, or `.gemini/skills`) |
| `npx dev-marketplace add --all` | Install all 131+ marketplace skills at once |
| `npx dev-marketplace add --category "<name>"` | Install all skills belonging to a specific category |
| `npx dev-marketplace info <name>` | Inspect full skill description, frontmatter, and file contents |
| `npx dev-marketplace categories` | List all marketplace categories and counts |

---

## Marketplace Catalog (131 Skills & Connectors)

### Code Review & Quality (15 skills)

| Skill | Description | Install |
|---|---|---|
| `claude-security` | Put a team of agents to work as security researchers on your codebase | `npx dev-marketplace add claude-security` |
| `pr-review-toolkit` | Comprehensive collection of specialized agents for thorough PR review | `npx dev-marketplace add pr-review-toolkit` |
| `qc-skill` | Deterministic media quality control / validation | `npx dev-marketplace add qc-skill` |
| `receiving-code-review` | Use when receiving code review feedback | `npx dev-marketplace add receiving-code-review` |
| `requesting-code-review` | Use when completing tasks, before merging | `npx dev-marketplace add requesting-code-review` |
| `security` | Review code for security problems | `npx dev-marketplace add security` |
| `security-and-hardening` | Hardens code against vulnerabilities | `npx dev-marketplace add security-and-hardening` |
| `systematic-debugging` | Use when encountering any bug or test failure | `npx dev-marketplace add systematic-debugging` |
| `test-driven-development` | Use when implementing any feature or bugfix | `npx dev-marketplace add test-driven-development` |
| `verification-before-completion` | Use before claiming work is complete | `npx dev-marketplace add verification-before-completion` |
| `leak-spots` | Detect leaked secrets in Git history using Periderm CLI | `npx dev-marketplace add leak-spots` |
| `launch-ready` | Pre-launch verification with Periderm CLI scan & review | `npx dev-marketplace add launch-ready` |
| `branch-sec` | Enforce branch protection, signed commits, Periderm checks | `npx dev-marketplace add branch-sec` |
| `cyber-sec` | Cybersecurity toolkit: threat modeling, OWASP, crypto audit | `npx dev-marketplace add cyber-sec` |
| `commit-hook` | Git hooks with Periderm CLI integration | `npx dev-marketplace add commit-hook` |

### Connectors & LSP (15 skills)

| Skill | Description | Install |
|---|---|---|
| `clangd-lsp` | C/C++ language server (clangd) for Claude Code | `npx dev-marketplace add clangd-lsp` |
| `context7-mcp` | Library/framework API references and code examples | `npx dev-marketplace add context7-mcp` |
| `csharp-lsp` | C# language server for Claude Code | `npx dev-marketplace add csharp-lsp` |
| `gopls-lsp` | Go language server for Claude Code | `npx dev-marketplace add gopls-lsp` |
| `jdtls-lsp` | Java language server (Eclipse JDT.LS) for Claude Code | `npx dev-marketplace add jdtls-lsp` |
| `kotlin-lsp` | Kotlin language server for Claude Code | `npx dev-marketplace add kotlin-lsp` |
| `lua-lsp` | Lua language server for Claude Code | `npx dev-marketplace add lua-lsp` |
| `mcp-server-dev` | Skills for designing and building MCP servers | `npx dev-marketplace add mcp-server-dev` |
| `mcp-tunnels` | Connect Claude to an MCP server in your private network | `npx dev-marketplace add mcp-tunnels` |
| `php-lsp` | PHP language server (Intelephense) for Claude Code | `npx dev-marketplace add php-lsp` |
| `pyright-lsp` | Python language server (Pyright) for Claude Code | `npx dev-marketplace add pyright-lsp` |
| `ruby-lsp` | Ruby language server for Claude Code | `npx dev-marketplace add ruby-lsp` |
| `rust-analyzer-lsp` | Rust language server for Claude Code | `npx dev-marketplace add rust-analyzer-lsp` |
| `swift-lsp` | Swift language server (SourceKit-LSP) for Claude Code | `npx dev-marketplace add swift-lsp` |
| `typescript-lsp` | TypeScript/JavaScript language server for Claude Code | `npx dev-marketplace add typescript-lsp` |

### Design & UI (14 skills)

| Skill | Description | Install |
|---|---|---|
| `apple-design` | Apple's approach to interface design and fluid motion | `npx dev-marketplace add apple-design` |
| `break-ui` | Stress-test UI with worst-case data | `npx dev-marketplace add break-ui` |
| `design-mobile-apps` | Design mobile app screens with Sleek | `npx dev-marketplace add design-mobile-apps` |
| `emil-design-eng` | Emil Kowalski's design-engineering philosophy | `npx dev-marketplace add emil-design-eng` |
| `figma` | Bring Figma into HyperFrames video | `npx dev-marketplace add figma` |
| `figma-designer` | Design inside Figma with real variables and auto layout | `npx dev-marketplace add figma-designer` |
| `firecrawl-build` | Firecrawl integration for web data | `npx dev-marketplace add firecrawl-build` |
| `gestures` | Build drag, swipe, and sheet interactions | `npx dev-marketplace add gestures` |
| `impeccable` | Design, critique, audit, polish frontend interfaces | `npx dev-marketplace add impeccable` |
| `improve` | Survey codebase as senior advisor, produce implementation plans | `npx dev-marketplace add improve` |
| `landing-page-design` | Complete system for high-converting landing pages | `npx dev-marketplace add landing-page-design` |
| `learn-taste` | Turn design corrections into rules in DESIGN.md | `npx dev-marketplace add learn-taste` |
| `pick-ui-library` | Pick the right library for frontend tasks | `npx dev-marketplace add pick-ui-library` |
| `prototype` | Build multiple UI versions behind a visual picker | `npx dev-marketplace add prototype` |

### Developer Tools & AI (27 skills)

| Skill | Description | Install |
|---|---|---|
| `artifacts-skill` | Local-first execution and verification for real-world artifacts | `npx dev-marketplace add artifacts-skill` |
| `ask-emil` | Router over the skills in this repo | `npx dev-marketplace add ask-emil` |
| `ask-sonner` | Guide to Sonner, the React toast library | `npx dev-marketplace add ask-sonner` |
| `brainstorming` | Use before any creative work | `npx dev-marketplace add brainstorming` |
| `caveman` | Terse caveman voice mode | `npx dev-marketplace add caveman` |
| `choreograph` | Coordinate elements that animate together | `npx dev-marketplace add choreograph` |
| `claude-md-management` | Tools to maintain and improve CLAUDE.md files | `npx dev-marketplace add claude-md-management` |
| `color-grading` | Deterministic colour grading / correction | `npx dev-marketplace add color-grading` |
| `feature-dev` | Comprehensive feature development workflow | `npx dev-marketplace add feature-dev` |
| `find-skills` | Discover and install agent skills | `npx dev-marketplace add find-skills` |
| `finishing-a-development-branch` | Decide how to integrate completed work | `npx dev-marketplace add finishing-a-development-branch` |
| `html-demo` | Show app working on web page via HTML simulation | `npx dev-marketplace add html-demo` |
| `imagemagick-skill` | Local ImageMagick image editing | `npx dev-marketplace add imagemagick-skill` |
| `ingest-skill` | Offload camera cards and recorders safely | `npx dev-marketplace add ingest-skill` |
| `mobile-native` | Make web app feel native on phone | `npx dev-marketplace add mobile-native` |
| `product-demo` | Record polished product demo videos | `npx dev-marketplace add product-demo` |
| `product-film` | Make short product films | `npx dev-marketplace add product-film` |
| `publish-skill` | Upload finished deliverables to platforms | `npx dev-marketplace add publish-skill` |
| `reverse-engineer-anything` | Reverse engineer native, managed, Electron, firmware targets | `npx dev-marketplace add reverse-engineer-anything` |
| `skillpact` | Write and check SkillPact contracts | `npx dev-marketplace add skillpact` |
| `slide-sync-skill` | Find slide changes in recordings, create chapters | `npx dev-marketplace add slide-sync-skill` |
| `stepcap` | Work with stepcap recording folders | `npx dev-marketplace add stepcap` |
| `style-sampling` | Make new episodes in proven video styles | `npx dev-marketplace add style-sampling` |
| `transcription-skill` | Transcribe speech in audio/video files | `npx dev-marketplace add transcription-skill` |
| `website-scroll` | Record top-to-bottom scroll of any web page | `npx dev-marketplace add website-scroll` |
| `write-swift` | How to write modern Swift well | `npx dev-marketplace add write-swift` |
| `writing-skills` | Create, edit, verify skills before deployment | `npx dev-marketplace add writing-skills` |

### Engineering & Workflow (17 skills)

| Skill | Description | Install |
|---|---|---|
| `code-modernization` | Modernize legacy codebases with proof | `npx dev-marketplace add code-modernization` |
| `commit-commands` | Streamline git workflow | `npx dev-marketplace add commit-commands` |
| `diagnosing-superpowers` | Diagnose why a superpowers session went wrong | `npx dev-marketplace add diagnosing-superpowers` |
| `dispatching-parallel-agents` | Run 2+ independent tasks in parallel | `npx dev-marketplace add dispatching-parallel-agents` |
| `executing-plans` | Execute implementation plans inline | `npx dev-marketplace add executing-plans` |
| `hookify` | Create custom hooks to prevent unwanted behaviors | `npx dev-marketplace add hookify` |
| `ralph-loop` | Ralph Wiggum technique for iterative AI development | `npx dev-marketplace add ralph-loop` |
| `session-report` | Connector and tooling for session-report | `npx dev-marketplace add session-report` |
| `subagent-driven-development` | Execute implementation plans with independent tasks | `npx dev-marketplace add subagent-driven-development` |
| `using-git-worktrees` | Start feature work with isolation | `npx dev-marketplace add using-git-worktrees` |
| `using-superpowers` | Establish how to find and use skills | `npx dev-marketplace add using-superpowers` |
| `writing-plans` | Write plans before touching code | `npx dev-marketplace add writing-plans` |
| `leak-spots` | Detect leaked secrets in Git history using Periderm CLI | `npx dev-marketplace add leak-spots` |
| `launch-ready` | Pre-launch verification with Periderm CLI scan & review | `npx dev-marketplace add launch-ready` |
| `branch-sec` | Enforce branch protection, signed commits, Periderm checks | `npx dev-marketplace add branch-sec` |
| `cyber-sec` | Cybersecurity toolkit: threat modeling, OWASP, crypto audit | `npx dev-marketplace add cyber-sec` |
| `commit-hook` | Git hooks with Periderm CLI integration | `npx dev-marketplace add commit-hook` |

### Video & Motion (48 skills)

| Skill | Description | Install |
|---|---|---|
| `animate` | Build animations from scratch | `npx dev-marketplace add animate` |
| `animate-expo` | Build animations in React Native and Expo | `npx dev-marketplace add animate-expo` |
| `animation-performance` | Keep web animations inside frame budget | `npx dev-marketplace add animation-performance` |
| `animation-vocabulary` | Reverse-lookup glossary for motion effects | `npx dev-marketplace add animation-vocabulary` |
| `audio-production` | Deterministic audio production execution | `npx dev-marketplace add audio-production` |
| `blender-skill` | Inspect, convert, optimize, render 3D assets | `npx dev-marketplace add blender-skill` |
| `diagram-animation` | Animate diagrams, flowcharts, charts | `npx dev-marketplace add diagram-animation` |
| `dubbing` | Speak text with local TTS, put into video | `npx dev-marketplace add dubbing` |
| `explainer-video` | Make explainer videos | `npx dev-marketplace add explainer-video` |
| `ffmpeg-skill` | Edit video/audio with local FFmpeg | `npx dev-marketplace add ffmpeg-skill` |
| `find-animation-opportunities` | Search for places that should animate | `npx dev-marketplace add find-animation-opportunities` |
| `hyperframes` | Make, edit, animate or render video with HyperFrames | `npx dev-marketplace add hyperframes` |
| `hyperframes-cli` | HyperFrames CLI - scaffold, check, edit, render | `npx dev-marketplace add hyperframes-cli` |
| `hyperframes-registry` | 450+ ready-made HyperFrames blocks | `npx dev-marketplace add hyperframes-registry` |
| `hyperframes-skill` | Render video from HTML scenes with HyperFrames | `npx dev-marketplace add hyperframes-skill` |
| `improve-animations` | Audit motion code, produce improvement plans | `npx dev-marketplace add improve-animations` |
| `isometric-animation` | Make isometric animations | `npx dev-marketplace add isometric-animation` |
| `media-analysis` | Measure deterministic facts about media files | `npx dev-marketplace add media-analysis` |
| `media-use` | Get or make media for HyperFrames videos | `npx dev-marketplace add media-use` |
| `motion-graphics` | Deterministic motion-graphics rendering | `npx dev-marketplace add motion-graphics` |
| `nle-bridge-skill` | Hand edits to Premiere Pro or DaVinci Resolve | `npx dev-marketplace add nle-bridge-skill` |
| `remotion-best-practices` | Router for all Remotion skills | `npx dev-marketplace add remotion-best-practices` |
| `remotion-captions` | Transcribing, displaying, animating captions | `npx dev-marketplace add remotion-captions` |
| `remotion-create` | Create a new Remotion video | `npx dev-marketplace add remotion-create` |
| `remotion-docs` | Search Remotion documentation | `npx dev-marketplace add remotion-docs` |
| `remotion-ffmpeg-skill` | Motion graphics on real footage with Remotion | `npx dev-marketplace add remotion-ffmpeg-skill` |
| `remotion-interactivity` | Structure Remotion markup for Studio editing | `npx dev-marketplace add remotion-interactivity` |
| `remotion-license` | Find Remotion license information | `npx dev-marketplace add remotion-license` |
| `remotion-maps` | Remotion Map animation knowledge | `npx dev-marketplace add remotion-maps` |
| `remotion-markup` | Content, animation and effects best practices | `npx dev-marketplace add remotion-markup` |
| `remotion-multimedia` | Interacting with Mediabunny | `npx dev-marketplace add remotion-multimedia` |
| `remotion-render` | Export Remotion video, still image, or OTIO timeline | `npx dev-marketplace add remotion-render` |
| `remotion-saas` | Build an app with Remotion | `npx dev-marketplace add remotion-saas` |
| `remotion-studio` | Preview a Remotion video | `npx dev-marketplace add remotion-studio` |
| `remotion-to-hyperframes` | Bring existing video code into HyperFrames | `npx dev-marketplace add remotion-to-hyperframes` |
| `remotion-upgrade` | Upgrade Remotion and related packages | `npx dev-marketplace add remotion-upgrade` |
| `remove-animations` | Find and remove unnecessary animations | `npx dev-marketplace add remove-animations` |
| `reverse-any-video` | Rebuild any video as editable HyperFrames project | `npx dev-marketplace add reverse-any-video` |
| `review-animations` | Review animation and motion code | `npx dev-marketplace add review-animations` |
| `slideshow` | Build HyperFrames slideshow to present live | `npx dev-marketplace add slideshow` |
| `sound-design-skill` | Music beds and sound effects for video | `npx dev-marketplace add sound-design-skill` |
| `subtitle-skill` | Deterministic subtitle validation, SRT/VTT generation | `npx dev-marketplace add subtitle-skill` |
| `thumbnail-skill` | Deterministic thumbnail rendering | `npx dev-marketplace add thumbnail-skill` |
| `video-editing-skill` | Deterministic video editing | `npx dev-marketplace add video-editing-skill` |
| `video-production-agent` | Plan and produce video from source files | `npx dev-marketplace add video-production-agent` |
| `voice-enhance-skill` | Clean up recorded speech with local engines | `npx dev-marketplace add voice-enhance-skill` |
| `whiteboard-animation` | Make whiteboard animations | `npx dev-marketplace add whiteboard-animation` |
| `wrapped-video` | Make Spotify Wrapped style videos | `npx dev-marketplace add wrapped-video` |

---

## Repository Layout

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
│   └── ... (131+ skills)
├── registry.json         # Searchable machine-readable index
└── package.json          # npm bin definition
```

---

## Open Source & Licensing

All skills and connectors included in this registry are open-source and freely redistributable under their respective open-source licenses (MIT, Apache-2.0, or compatible).

Contributions, new agent skills, and community connectors are warmly welcomed via Pull Requests!

---

## Translations

- [English](README.md) (this file)
- [Espanol](README.es.md)
- [Francais](README.fr.md)
- [Deutsch](README.de.md)
- [Chinese](README.zh.md)
- [Japanese](README.ja.md)
- [Korean](README.ko.md)
- [Portuguese](README.pt.md)
- [Italian](README.it.md)
- [Russian](README.ru.md)