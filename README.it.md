# Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-133%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Compatible with Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-orange?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code)
[![Compatible with Cursor & Antigravity](https://img.shields.io/badge/Agent-Cursor%20%7C%20Antigravity%20%7C%20Codex-purple?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![Vercel Skills Standard](https://img.shields.io/badge/npx%20skills-ready-black?style=flat-square)](https://skills.sh)

Un marketplace open source per sviluppatori con **133+ skill curate e testate in produzione, connettori Language Server (LSP), design engine, verificatori di qualità del codice e toolkit per la sintesi video**.

Compatibile con **Claude Code**, **Cursor**, **Antigravity (`agy`)**, **Codex**, e qualsiasi piattaforma agent che segue la specifica standard `SKILL.md`.

---

## Avvio Rapido

Installa qualsiasi skill direttamente nel tuo progetto:

```bash
# Usando il runner integrato del marketplace:
npx dev-marketplace add <skill-name>

# Oppure usando lo standard aperto skills.sh:
npx skills add kingjethro999/dev-marketplace --skill <skill-name>
```

### Esempi di Installazione

```bash
# Installare le guideline di design interfaccia Apple
npx dev-marketplace add apple-design

# Installare toolkit code review e test-driven development
npx dev-marketplace add code-review test-driven-development systematic-debugging

# Installare tutte le skill Video & Motion
npx dev-marketplace add --category "Video & Motion"

# Installare tutti i connettori LSP (TypeScript, Python, Rust, Go, C++, Swift...)
npx dev-marketplace add --category "Connectors & LSP"

# Sincronizzare tutto il marketplace al tuo progetto:
npx dev-marketplace add --all

# Oppure installare globalmente nella tua directory agent (~/.agents/skills):
npx dev-marketplace add --all --global
```

---

## Comandi CLI

| Comando                                       | Descrizione                                                                                                 |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npx dev-marketplace list`                    | Sfogliare e filtrare tutte le skill disponibili per parola chiave o categoria                               |
| `npx dev-marketplace add <nome...>`           | Copiare le skill specificate nel progetto corrente (`.agents/skills`, `.claude/skills`, o `.gemini/skills`) |
| `npx dev-marketplace add --all`               | Installare tutte le 133+ skill del marketplace in una volta                                                 |
| `npx dev-marketplace add --category "<nome>"` | Installare tutte le skill di una categoria specifica                                                        |
| `npx dev-marketplace info <nome>`             | Ispezionare descrizione completa, frontmatter e contenuto file                                              |
| `npx dev-marketplace categories`              | Elencare tutte le categorie del marketplace e i loro conteggi                                               |

---

## Catalogo Marketplace (133 Skill & Connettori)

### Code Review & Qualità (16 skill)

| Skill                            | Descrizione                                                                                    | Installazione                                            |
| -------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `claude-security`                | Mettere un team di agenti al lavoro come ricercatori di sicurezza                              | `npx dev-marketplace add claude-security`                |
| `pr-review-toolkit`              | Collezione completa di agenti specializzati per PR review approfondite                         | `npx dev-marketplace add pr-review-toolkit`              |
| `qc-skill`                       | Controllo qualità deterministico / validazione media                                           | `npx dev-marketplace add qc-skill`                       |
| `receiving-code-review`          | Usare quando si riceve feedback di code review                                                 | `npx dev-marketplace add receiving-code-review`          |
| `requesting-code-review`         | Usare al completamento task, prima del merge                                                   | `npx dev-marketplace add requesting-code-review`         |
| `security`                       | Revisionare codice per problemi di sicurezza                                                   | `npx dev-marketplace add security`                       |
| `security-and-hardening`         | Irrobustire codice contro vulnerabilità                                                        | `npx dev-marketplace add security-and-hardening`         |
| `systematic-debugging`           | Usare incontrando qualsiasi bug o test failure                                                 | `npx dev-marketplace add systematic-debugging`           |
| `test-driven-development`        | Usare implementando qualsiasi feature o bugfix                                                 | `npx dev-marketplace add test-driven-development`        |
| `verification-before-completion` | Usare prima di rivendicare lavoro completato                                                   | `npx dev-marketplace add verification-before-completion` |
| `leak-spots`                     | Rilevare secret trapelati in cronologia Git con Periderm CLI                                   | `npx dev-marketplace add leak-spots`                     |
| `launch-ready`                   | Verifica pre-lancio con scan e review Periderm CLI                                             | `npx dev-marketplace add launch-ready`                   |
| `branch-sec`                     | Forzare branch protection, signed commits, Periderm checks                                     | `npx dev-marketplace add branch-sec`                     |
| `cyber-sec`                      | Toolkit cybersecurity: threat modeling, OWASP, crypto audit                                    | `npx dev-marketplace add cyber-sec`                      |
| `commit-hook`                    | Git hooks con integrazione Periderm CLI                                                        | `npx dev-marketplace add commit-hook`                    |
| `repo-sec`                       | Hardening sicurezza repo: signed commits, branch protection, secret scanning, dependency audit | `npx dev-marketplace add repo-sec`                       |

### Connettori & LSP (15 skill)

| Skill               | Descrizione                                           | Installazione                               |
| ------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `clangd-lsp`        | C/C++ Language Server (clangd) per Claude Code        | `npx dev-marketplace add clangd-lsp`        |
| `context7-mcp`      | Riferimenti API librerie/framework ed esempi codice   | `npx dev-marketplace add context7-mcp`      |
| `csharp-lsp`        | C# Language Server per Claude Code                    | `npx dev-marketplace add csharp-lsp`        |
| `gopls-lsp`         | Go Language Server per Claude Code                    | `npx dev-marketplace add gopls-lsp`         |
| `jdtls-lsp`         | Java Language Server (Eclipse JDT.LS) per Claude Code | `npx dev-marketplace add jdtls-lsp`         |
| `kotlin-lsp`        | Kotlin Language Server per Claude Code                | `npx dev-marketplace add kotlin-lsp`        |
| `lua-lsp`           | Lua Language Server per Claude Code                   | `npx dev-marketplace add lua-lsp`           |
| `mcp-server-dev`    | Skill per design e costruzione server MCP             | `npx dev-marketplace add mcp-server-dev`    |
| `mcp-tunnels`       | Connettere Claude a server MCP in rete privata        | `npx dev-marketplace add mcp-tunnels`       |
| `php-lsp`           | PHP Language Server (Intelephense) per Claude Code    | `npx dev-marketplace add php-lsp`           |
| `pyright-lsp`       | Python Language Server (Pyright) per Claude Code      | `npx dev-marketplace add pyright-lsp`       |
| `ruby-lsp`          | Ruby Language Server per Claude Code                  | `npx dev-marketplace add ruby-lsp`          |
| `rust-analyzer-lsp` | Rust Language Server per Claude Code                  | `npx dev-marketplace add rust-analyzer-lsp` |
| `swift-lsp`         | Swift Language Server (SourceKit-LSP) per Claude Code | `npx dev-marketplace add swift-lsp`         |
| `typescript-lsp`    | TypeScript/JavaScript Language Server per Claude Code | `npx dev-marketplace add typescript-lsp`    |

### Design & UI (14 skill)

| Skill                 | Descrizione                                                        | Installazione                                 |
| --------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| `apple-design`        | Approccio Apple a interface design e fluid motion                  | `npx dev-marketplace add apple-design`        |
| `break-ui`            | Stress-test UI con dati worst-case                                 | `npx dev-marketplace add break-ui`            |
| `design-mobile-apps`  | Design screen app mobile con Sleek                                 | `npx dev-marketplace add design-mobile-apps`  |
| `emil-design-eng`     | Filosofia design-engineering di Emil Kowalski                      | `npx dev-marketplace add emil-design-eng`     |
| `figma`               | Portare Figma in video HyperFrames                                 | `npx dev-marketplace add figma`               |
| `figma-designer`      | Design in Figma con variabili reali e auto layout                  | `npx dev-marketplace add figma-designer`      |
| `firecrawl-build`     | Integrazione Firecrawl per dati web                                | `npx dev-marketplace add firecrawl-build`     |
| `gestures`            | Costruire interazioni drag, swipe, sheet                           | `npx dev-marketplace add gestures`            |
| `impeccable`          | Design, critique, audit, polish interfacce frontend                | `npx dev-marketplace add impeccable`          |
| `improve`             | Survey codebase come senior advisor, produrre implementation plans | `npx dev-marketplace add improve`             |
| `landing-page-design` | Sistema completo per landing page high-converting                  | `npx dev-marketplace add landing-page-design` |
| `learn-taste`         | Trasformare correzioni design in regole in DESIGN.md               | `npx dev-marketplace add learn-taste`         |
| `pick-ui-library`     | Scegliere la libreria giusta per task frontend                     | `npx dev-marketplace add pick-ui-library`     |
| `prototype`           | Costruire multiple versioni UI dietro visual picker                | `npx dev-marketplace add prototype`           |

### Developer Tools & AI (27 skill)

| Skill                            | Descrizione                                                 | Installazione                                            |
| -------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| `artifacts-skill`                | Esecuzione e verifica local-first per artifact reali        | `npx dev-marketplace add artifacts-skill`                |
| `ask-emil`                       | Router sulle skill in questo repo                           | `npx dev-marketplace add ask-emil`                       |
| `ask-sonner`                     | Guida a Sonner, la libreria React toast                     | `npx dev-marketplace add ask-sonner`                     |
| `brainstorming`                  | Usare prima di qualsiasi lavoro creativo                    | `npx dev-marketplace add brainstorming`                  |
| `caveman`                        | Modalità voce cavernicolo concisa                           | `npx dev-marketplace add caveman`                        |
| `choreograph`                    | Coordinare elementi che animano insieme                     | `npx dev-marketplace add choreograph`                    |
| `claude-md-management`           | Tool per mantenere e migliorare file CLAUDE.md              | `npx dev-marketplace add claude-md-management`           |
| `color-grading`                  | Color grading/correction deterministico                     | `npx dev-marketplace add color-grading`                  |
| `feature-dev`                    | Workflow completo sviluppo feature                          | `npx dev-marketplace add feature-dev`                    |
| `find-skills`                    | Scoprire e installare agent skills                          | `npx dev-marketplace add find-skills`                    |
| `finishing-a-development-branch` | Decidere come integrare lavoro completato                   | `npx dev-marketplace add finishing-a-development-branch` |
| `html-demo`                      | Mostrare app funzionante su pagina web via simulazione HTML | `npx dev-marketplace add html-demo`                      |
| `imagemagick-skill`              | Editing immagini locale ImageMagick                         | `npx dev-marketplace add imagemagick-skill`              |
| `ingest-skill`                   | Offload camera cards e recorders safely                     | `npx dev-marketplace add ingest-skill`                   |
| `mobile-native`                  | Far sentire web app nativa su mobile                        | `npx dev-marketplace add mobile-native`                  |
| `product-demo`                   | Registrare video demo prodotto polished                     | `npx dev-marketplace add product-demo`                   |
| `product-film`                   | Fare short product films                                    | `npx dev-marketplace add product-film`                   |
| `publish-skill`                  | Upload deliverables finiti a piattaforme                    | `npx dev-marketplace add publish-skill`                  |
| `reverse-engineer-anything`      | Reverse engineer native, managed, Electron, firmware        | `npx dev-marketplace add reverse-engineer-anything`      |
| `skillpact`                      | Scrivere e verificare contratti SkillPact                   | `npx dev-marketplace add skillpact`                      |
| `slide-sync-skill`               | Trovare slide changes in registrazioni, creare capitoli     | `npx dev-marketplace add slide-sync-skill`               |
| `stepcap`                        | Lavorare con cartelle registrazione stepcap                 | `npx dev-marketplace add stepcap`                        |
| `style-sampling`                 | Fare nuovi episodi in stili video provati                   | `npx dev-marketplace add style-sampling`                 |
| `transcription-skill`            | Trascrivere speech in file audio/video                      | `npx dev-marketplace add transcription-skill`            |
| `website-scroll`                 | Registrare scroll top-to-bottom di qualsiasi pagina web     | `npx dev-marketplace add website-scroll`                 |
| `write-swift`                    | Come scrivere modern Swift bene                             | `npx dev-marketplace add write-swift`                    |
| `writing-skills`                 | Creare, editare, verificare skill prima del deploy          | `npx dev-marketplace add writing-skills`                 |

### Engineering & Workflow (18 skill)

| Skill                         | Descrizione                                                                             | Installazione                                         |
| ----------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `code-modernization`          | Modernizzare codebases legacy con proof                                                 | `npx dev-marketplace add code-modernization`          |
| `commit-commands`             | Streamline git workflow                                                                 | `npx dev-marketplace add commit-commands`             |
| `diagnosing-superpowers`      | Diagnosticare perché sessione superpowers fallita                                       | `npx dev-marketplace add diagnosing-superpowers`      |
| `dispatching-parallel-agents` | Eseguire 2+ task indipendenti in parallelo                                              | `npx dev-marketplace add dispatching-parallel-agents` |
| `executing-plans`             | Eseguire implementation plans inline                                                    | `npx dev-marketplace add executing-plans`             |
| `hookify`                     | Creare custom hooks per prevenire unwanted behaviors                                    | `npx dev-marketplace add hookify`                     |
| `ralph-loop`                  | Tecnica Ralph Wiggum per iterative AI development                                       | `npx dev-marketplace add ralph-loop`                  |
| `session-report`              | Connector e tooling per session-report                                                  | `npx dev-marketplace add session-report`              |
| `subagent-driven-development` | Eseguire implementation plans con independent tasks                                     | `npx dev-marketplace add subagent-driven-development` |
| `using-git-worktrees`         | Iniziare feature work con isolation                                                     | `npx dev-marketplace add using-git-worktrees`         |
| `using-superpowers`           | Stabilire come trovare e usare skills                                                   | `npx dev-marketplace add using-superpowers`           |
| `writing-plans`               | Scrivere plans prima di toccare codice                                                  | `npx dev-marketplace add writing-plans`               |
| `leak-spots`                  | Rilevare secret trapelati in cronologia Git con Periderm CLI                            | `npx dev-marketplace add leak-spots`                  |
| `launch-ready`                | Verifica pre-lancio con scan e review Periderm CLI                                      | `npx dev-marketplace add launch-ready`                |
| `branch-sec`                  | Forzare branch protection, signed commits, Periderm checks                              | `npx dev-marketplace add branch-sec`                  |
| `cyber-sec`                   | Toolkit cybersecurity: threat modeling, OWASP, crypto audit                             | `npx dev-marketplace add cyber-sec`                   |
| `commit-hook`                 | Git hooks con integrazione Periderm CLI                                                 | `npx dev-marketplace add commit-hook`                 |
| `ci-cd`                       | CI/CD pipeline analyzer/generator: GitHub Actions, GitLab CI, CircleCI, Azure Pipelines | `npx dev-marketplace add ci-cd`                       |

### Video & Motion (48 skill)

| Skill                          | Descrizione                                                    | Installazione                                          |
| ------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------ |
| `animate`                      | Costruire animazioni da zero                                   | `npx dev-marketplace add animate`                      |
| `animate-expo`                 | Costruire animazioni in React Native e Expo                    | `npx dev-marketplace add animate-expo`                 |
| `animation-performance`        | Mantenere web animations dentro frame budget                   | `npx dev-marketplace add animation-performance`        |
| `animation-vocabulary`         | Glossario reverse-lookup per motion effects                    | `npx dev-marketplace add animation-vocabulary`         |
| `audio-production`             | Deterministic audio production execution                       | `npx dev-marketplace add audio-production`             |
| `blender-skill`                | Inspect, convert, optimize, render 3D assets                   | `npx dev-marketplace add blender-skill`                |
| `diagram-animation`            | Animare diagrammi, flowchart, charts                           | `npx dev-marketplace add diagram-animation`            |
| `dubbing`                      | Parlare testo con TTS locale, mettere in video                 | `npx dev-marketplace add dubbing`                      |
| `explainer-video`              | Fare explainer video                                           | `npx dev-marketplace add explainer-video`              |
| `ffmpeg-skill`                 | Edit video/audio con FFmpeg locale                             | `npx dev-marketplace add ffmpeg-skill`                 |
| `find-animation-opportunities` | Cercare posti che dovrebbero animare                           | `npx dev-marketplace add find-animation-opportunities` |
| `hyperframes`                  | Fare, editare, animare o rendere video con HyperFrames         | `npx dev-marketplace add hyperframes`                  |
| `hyperframes-cli`              | HyperFrames CLI - scaffold, check, edit, render                | `npx dev-marketplace add hyperframes-cli`              |
| `hyperframes-registry`         | 450+ blocchi HyperFrames ready-made                            | `npx dev-marketplace add hyperframes-registry`         |
| `hyperframes-skill`            | Render video da HTML scenes con HyperFrames                    | `npx dev-marketplace add hyperframes-skill`            |
| `improve-animations`           | Audit motion code, produrre improvement plans                  | `npx dev-marketplace add improve-animations`           |
| `isometric-animation`          | Fare animazioni isometriche                                    | `npx dev-marketplace add isometric-animation`          |
| `media-analysis`               | Misurare deterministic facts su media files                    | `npx dev-marketplace add media-analysis`               |
| `media-use`                    | Ottenere o creare media per HyperFrames videos                 | `npx dev-marketplace add media-use`                    |
| `motion-graphics`              | Deterministic motion-graphics rendering                        | `npx dev-marketplace add motion-graphics`              |
| `nle-bridge-skill`             | Passare edits a Premiere Pro o DaVinci Resolve                 | `npx dev-marketplace add nle-bridge-skill`             |
| `remotion-best-practices`      | Router per tutte le Remotion skills                            | `npx dev-marketplace add remotion-best-practices`      |
| `remotion-captions`            | Transcribing, displaying, animating captions                   | `npx dev-marketplace add remotion-captions`            |
| `remotion-create`              | Creare nuovo Remotion video                                    | `npx dev-marketplace add remotion-create`              |
| `remotion-docs`                | Cercare Remotion documentation                                 | `npx dev-marketplace add remotion-docs`                |
| `remotion-ffmpeg-skill`        | Motion graphics su real footage con Remotion                   | `npx dev-marketplace add remotion-ffmpeg-skill`        |
| `remotion-interactivity`       | Strutturare Remotion markup per Studio editing                 | `npx dev-marketplace add remotion-interactivity`       |
| `remotion-license`             | Trovare Remotion license information                           | `npx dev-marketplace add remotion-license`             |
| `remotion-maps`                | Remotion Map animation knowledge                               | `npx dev-marketplace add remotion-maps`                |
| `remotion-markup`              | Content, animation e effects best practices                    | `npx dev-marketplace add remotion-markup`              |
| `remotion-multimedia`          | Interagire con Mediabunny                                      | `npx dev-marketplace add remotion-multimedia`          |
| `remotion-render`              | Export Remotion video, still image, o OTIO timeline            | `npx dev-marketplace add remotion-render`              |
| `remotion-saas`                | Costruire app con Remotion                                     | `npx dev-marketplace add remotion-saas`                |
| `remotion-studio`              | Preview Remotion video                                         | `npx dev-marketplace add remotion-studio`              |
| `remotion-to-hyperframes`      | Portare existing video code in HyperFrames                     | `npx dev-marketplace add remotion-to-hyperframes`      |
| `remotion-upgrade`             | Upgrade Remotion e related packages                            | `npx dev-marketplace add remotion-upgrade`             |
| `remove-animations`            | Trovare e rimuovere unnecessary animations                     | `npx dev-marketplace add remove-animations`            |
| `reverse-any-video`            | Ricostruire qualsiasi video come progetto HyperFrames editable | `npx dev-marketplace add reverse-any-video`            |
| `review-animations`            | Review animation e motion code                                 | `npx dev-marketplace add review-animations`            |
| `slideshow`                    | Costruire HyperFrames slideshow per present live               | `npx dev-marketplace add slideshow`                    |
| `sound-design-skill`           | Music beds e sound effects per video                           | `npx dev-marketplace add sound-design-skill`           |
| `subtitle-skill`               | Deterministic subtitle validation, SRT/VTT generation          | `npx dev-marketplace add subtitle-skill`               |
| `thumbnail-skill`              | Deterministic thumbnail rendering                              | `npx dev-marketplace add thumbnail-skill`              |
| `video-editing-skill`          | Deterministic video editing                                    | `npx dev-marketplace add video-editing-skill`          |
| `video-production-agent`       | Plan e produce video da source files                           | `npx dev-marketplace add video-production-agent`       |
| `voice-enhance-skill`          | Clean up recorded speech con local engines                     | `npx dev-marketplace add voice-enhance-skill`          |
| `whiteboard-animation`         | Fare whiteboard animations                                     | `npx dev-marketplace add whiteboard-animation`         |
| `wrapped-video`                | Fare Spotify Wrapped style videos                              | `npx dev-marketplace add wrapped-video`                |

---

## Struttura Repository

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
│   └── ... (133+ skills)
├── registry.json         # Searchable machine-readable index
└── package.json          # npm bin definition
```

---

## Open Source & Licensing

Tutte le skill e connettori inclusi in questo registry sono open source e liberamente redistribuibili sotto le rispettive licenze open source (MIT, Apache-2.0, o compatibili).

Contributi, nuove agent skill e community connector sono benvenuti via Pull Request!

---

## Traduzioni

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
