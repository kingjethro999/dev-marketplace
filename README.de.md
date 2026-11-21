# Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-133%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Compatible with Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-orange?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code)
[![Compatible with Cursor & Antigravity](https://img.shields.io/badge/Agent-Cursor%20%7C%20Antigravity%20%7C%20Codex-purple?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![Vercel Skills Standard](https://img.shields.io/badge/npx%20skills-ready-black?style=flat-square)](https://skills.sh)

Ein Open-Source-Entwickler-Marktplatz mit **133+ kuratierten, produktionserprobten KI-Agenten-Fähigkeiten, Language-Server-(LSP)-Connectoren, Design-Engines, Code-Qualitäts-Prüfern und Video-Synthese-Toolkits**.

Kompatibel mit **Claude Code**, **Cursor**, **Antigravity (`agy`)**, **Codex** und jeder Agenten-Plattform, der der Standard-`SKILL.md`-Spezifikation folgt.

---

## Schnellstart

Installieren Sie jede Fähigkeit direkt in Ihr Projekt:

```bash
# Mit dem integrierten Marketplace-Runner:
npx dev-marketplace add <skill-name>

# Oder mit dem offenen skills.sh-Standard:
npx skills add kingjethro999/dev-marketplace --skill <skill-name>
```

### Installationsbeispiele

```bash
# Apple Interface-Design-Richtlinien installieren
npx dev-marketplace add apple-design

# Code-Review- und Test-Driven-Development-Toolkit installieren
npx dev-marketplace add code-review test-driven-development systematic-debugging

# Alle Video & Motion Synthesis Skills installieren
npx dev-marketplace add --category "Video & Motion"

# Alle LSP-Connectors installieren (TypeScript, Python, Rust, Go, C++, Swift...)
npx dev-marketplace add --category "Connectors & LSP"

# Den gesamten Marketplace mit Ihrem Projekt synchronisieren:
npx dev-marketplace add --all

# Oder global in Ihr Home-Agent-Verzeichnis (~/.agents/skills) installieren:
npx dev-marketplace add --all --global
```

---

## CLI-Befehle

| Befehl                                        | Beschreibung                                                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npx dev-marketplace list`                    | Alle verfügbaren Skills nach Schlüsselwort oder Kategorie durchsuchen und filtern                                |
| `npx dev-marketplace add <name...>`           | Angegebene Skill(s) in das aktuelle Projekt kopieren (`.agents/skills`, `.claude/skills`, oder `.gemini/skills`) |
| `npx dev-marketplace add --all`               | Alle 133+ Marketplace-Skills auf einmal installieren                                                             |
| `npx dev-marketplace add --category "<name>"` | Alle Skills einer bestimmten Kategorie installieren                                                              |
| `npx dev-marketplace info <name>`             | Vollständige Skill-Beschreibung, Frontmatter und Dateiinhalte inspizieren                                        |
| `npx dev-marketplace categories`              | Alle Marketplace-Kategorien und ihre Anzahlen auflisten                                                          |

---

## Marketplace-Katalog (133 Skills & Connectors)

### Code Review & Qualität (16 Skills)

| Skill                            | Beschreibung                                                                                       | Installation                                             |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `claude-security`                | Ein Team von Agenten als Sicherheitsforscher für Ihren Codebase einsetzen                          | `npx dev-marketplace add claude-security`                |
| `pr-review-toolkit`              | Umfassende Sammlung spezialisierter Agenten für gründliche PR-Reviews                              | `npx dev-marketplace add pr-review-toolkit`              |
| `qc-skill`                       | Deterministisches Medien-Qualitätskontroll-/Validierungstool                                       | `npx dev-marketplace add qc-skill`                       |
| `receiving-code-review`          | Verwenden beim Empfangen von Code-Review-Feedback                                                  | `npx dev-marketplace add receiving-code-review`          |
| `requesting-code-review`         | Verwenden bei Aufgabenabschluss, vor dem Mergen                                                    | `npx dev-marketplace add requesting-code-review`         |
| `security`                       | Code auf Sicherheitsprobleme prüfen                                                                | `npx dev-marketplace add security`                       |
| `security-and-hardening`         | Code gegen Schwachstellen härten                                                                   | `npx dev-marketplace add security-and-hardening`         |
| `systematic-debugging`           | Verwenden bei jedem Bug oder Testfehler                                                            | `npx dev-marketplace add systematic-debugging`           |
| `test-driven-development`        | Verwenden bei Implementierung jedes Features oder Bugfixes                                         | `npx dev-marketplace add test-driven-development`        |
| `verification-before-completion` | Verwenden bevor Arbeit als abgeschlossen beansprucht wird                                          | `npx dev-marketplace add verification-before-completion` |
| `leak-spots`                     | Durchgesickerte Secrets in Git-Historie mit Periderm CLI erkennen                                  | `npx dev-marketplace add leak-spots`                     |
| `launch-ready`                   | Pre-Launch-Verifikation mit Periderm CLI Scan & Review                                             | `npx dev-marketplace add launch-ready`                   |
| `branch-sec`                     | Branch-Schutz, signierte Commits, Periderm-Checks erzwingen                                        | `npx dev-marketplace add branch-sec`                     |
| `cyber-sec`                      | Cybersicherheit-Toolkit: Bedrohungsmodellierung, OWASP, Krypto-Audit                               | `npx dev-marketplace add cyber-sec`                      |
| `commit-hook`                    | Git Hooks mit Periderm CLI Integration                                                             | `npx dev-marketplace add commit-hook`                    |
| `repo-sec`                       | Repository-Sicherheitshärtung: signierte Commits, Branch-Schutz, Secret-Scanning, Dependency-Audit | `npx dev-marketplace add repo-sec`                       |

### Connectors & LSP (15 Skills)

| Skill               | Beschreibung                                                     | Installation                                |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------- |
| `clangd-lsp`        | C/C++ Language Server (clangd) für Claude Code                   | `npx dev-marketplace add clangd-lsp`        |
| `context7-mcp`      | Bibliotheks-/Framework-API-Referenzen und Code-Beispiele         | `npx dev-marketplace add context7-mcp`      |
| `csharp-lsp`        | C# Language Server für Claude Code                               | `npx dev-marketplace add csharp-lsp`        |
| `gopls-lsp`         | Go Language Server für Claude Code                               | `npx dev-marketplace add gopls-lsp`         |
| `jdtls-lsp`         | Java Language Server (Eclipse JDT.LS) für Claude Code            | `npx dev-marketplace add jdtls-lsp`         |
| `kotlin-lsp`        | Kotlin Language Server für Claude Code                           | `npx dev-marketplace add kotlin-lsp`        |
| `lua-lsp`           | Lua Language Server für Claude Code                              | `npx dev-marketplace add lua-lsp`           |
| `mcp-server-dev`    | Skills für Design und Bau von MCP-Servern                        | `npx dev-marketplace add mcp-server-dev`    |
| `mcp-tunnels`       | Claude mit einem MCP-Server in Ihrem privaten Netzwerk verbinden | `npx dev-marketplace add mcp-tunnels`       |
| `php-lsp`           | PHP Language Server (Intelephense) für Claude Code               | `npx dev-marketplace add php-lsp`           |
| `pyright-lsp`       | Python Language Server (Pyright) für Claude Code                 | `npx dev-marketplace add pyright-lsp`       |
| `ruby-lsp`          | Ruby Language Server für Claude Code                             | `npx dev-marketplace add ruby-lsp`          |
| `rust-analyzer-lsp` | Rust Language Server für Claude Code                             | `npx dev-marketplace add rust-analyzer-lsp` |
| `swift-lsp`         | Swift Language Server (SourceKit-LSP) für Claude Code            | `npx dev-marketplace add swift-lsp`         |
| `typescript-lsp`    | TypeScript/JavaScript Language Server für Claude Code            | `npx dev-marketplace add typescript-lsp`    |

### Design & UI (14 Skills)

| Skill                 | Beschreibung                                                        | Installation                                  |
| --------------------- | ------------------------------------------------------------------- | --------------------------------------------- |
| `apple-design`        | Apples Ansatz für Interface-Design und flüssige Bewegung            | `npx dev-marketplace add apple-design`        |
| `break-ui`            | UI mit Worst-Case-Daten stress-testen                               | `npx dev-marketplace add break-ui`            |
| `design-mobile-apps`  | Mobile App-Screens mit Sleek designen                               | `npx dev-marketplace add design-mobile-apps`  |
| `emil-design-eng`     | Emil Kowalskis Design-Engineering-Philosophie                       | `npx dev-marketplace add emil-design-eng`     |
| `figma`               | Figma in HyperFrames-Video einbringen                               | `npx dev-marketplace add figma`               |
| `figma-designer`      | In Figma mit echten Variablen und Auto-Layout designen              | `npx dev-marketplace add figma-designer`      |
| `firecrawl-build`     | Firecrawl-Integration für Web-Daten                                 | `npx dev-marketplace add firecrawl-build`     |
| `gestures`            | Drag-, Swipe- und Sheet-Interaktionen bauen                         | `npx dev-marketplace add gestures`            |
| `impeccable`          | Frontend-Interfaces designen, kritisieren, auditieren, polieren     | `npx dev-marketplace add impeccable`          |
| `improve`             | Codebase als Senior-Berater prüfen, Implementierungspläne erstellen | `npx dev-marketplace add improve`             |
| `landing-page-design` | Komplettes System für hochkonvertierende Landing Pages              | `npx dev-marketplace add landing-page-design` |
| `learn-taste`         | Design-Korrekturen in Regeln in DESIGN.md umwandeln                 | `npx dev-marketplace add learn-taste`         |
| `pick-ui-library`     | Die richtige Bibliothek für Frontend-Aufgaben wählen                | `npx dev-marketplace add pick-ui-library`     |
| `prototype`           | Mehrere UI-Versionen hinter einem visuellen Picker bauen            | `npx dev-marketplace add prototype`           |

### Entwickler-Tools & KI (27 Skills)

| Skill                            | Beschreibung                                                   | Installation                                             |
| -------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| `artifacts-skill`                | Lokale Ausführung und Verifikation für reale Artefakte         | `npx dev-marketplace add artifacts-skill`                |
| `ask-emil`                       | Router über die Skills in diesem Repo                          | `npx dev-marketplace add ask-emil`                       |
| `ask-sonner`                     | Leitfaden zu Sonner, der React Toast Library                   | `npx dev-marketplace add ask-sonner`                     |
| `brainstorming`                  | Vor jeder kreativen Arbeit verwenden                           | `npx dev-marketplace add brainstorming`                  |
| `caveman`                        | Knapper Caveman-Voice-Modus                                    | `npx dev-marketplace add caveman`                        |
| `choreograph`                    | Elemente koordinieren, die zusammen animieren                  | `npx dev-marketplace add choreograph`                    |
| `claude-md-management`           | Tools zur Wartung und Verbesserung von CLAUDE.md-Dateien       | `npx dev-marketplace add claude-md-management`           |
| `color-grading`                  | Deterministisches Color Grading / Color Correction             | `npx dev-marketplace add color-grading`                  |
| `feature-dev`                    | Umfassender Feature-Entwicklungs-Workflow                      | `npx dev-marketplace add feature-dev`                    |
| `find-skills`                    | Agenten-Skills entdecken und installieren                      | `npx dev-marketplace add find-skills`                    |
| `finishing-a-development-branch` | Entscheiden, wie abgeschlossene Arbeit integriert wird         | `npx dev-marketplace add finishing-a-development-branch` |
| `html-demo`                      | App auf Webseite via HTML-Simulation zeigen                    | `npx dev-marketplace add html-demo`                      |
| `imagemagick-skill`              | Lokale ImageMagick-Bildbearbeitung                             | `npx dev-marketplace add imagemagick-skill`              |
| `ingest-skill`                   | Kamerakarten und Recorder sicher entladen                      | `npx dev-marketplace add ingest-skill`                   |
| `mobile-native`                  | Web-App auf dem Handy nativ anfühlen lassen                    | `npx dev-marketplace add mobile-native`                  |
| `product-demo`                   | Polierte Produkt-Demo-Videos aufnehmen                         | `npx dev-marketplace add product-demo`                   |
| `product-film`                   | Kurze Produktfilme erstellen                                   | `npx dev-marketplace add product-film`                   |
| `publish-skill`                  | Fertige Deliverables auf Plattformen hochladen                 | `npx dev-marketplace add publish-skill`                  |
| `reverse-engineer-anything`      | Native, Managed, Electron, Firmware Targets reverse-engineeren | `npx dev-marketplace add reverse-engineer-anything`      |
| `skillpact`                      | SkillPact-Verträge schreiben und prüfen                        | `npx dev-marketplace add skillpact`                      |
| `slide-sync-skill`               | Folienwechsel in Aufnahmen finden, Kapitel erstellen           | `npx dev-marketplace add slide-sync-skill`               |
| `stepcap`                        | Mit stepcap-Aufzeichnungsordnern arbeiten                      | `npx dev-marketplace add stepcap`                        |
| `style-sampling`                 | Neue Episoden in bewährten Video-Stilen erstellen              | `npx dev-marketplace add style-sampling`                 |
| `transcription-skill`            | Sprache in Audio/Video-Dateien transkribieren                  | `npx dev-marketplace add transcription-skill`            |
| `website-scroll`                 | Top-to-Bottom-Scroll jeder Webseite aufnehmen                  | `npx dev-marketplace add website-scroll`                 |
| `write-swift`                    | Wie man modernes Swift richtig schreibt                        | `npx dev-marketplace add write-swift`                    |
| `writing-skills`                 | Skills erstellen, bearbeiten, verifizieren vor Deployment      | `npx dev-marketplace add writing-skills`                 |

### Engineering & Workflow (18 Skills)

| Skill                         | Beschreibung                                                                            | Installation                                          |
| ----------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `code-modernization`          | Legacy-Codebasen mit Beweis modernisieren                                               | `npx dev-marketplace add code-modernization`          |
| `commit-commands`             | Git-Workflow optimieren                                                                 | `npx dev-marketplace add commit-commands`             |
| `diagnosing-superpowers`      | Diagnostizieren, warum eine Superpowers-Session schiefging                              | `npx dev-marketplace add diagnosing-superpowers`      |
| `dispatching-parallel-agents` | 2+ unabhängige Tasks parallel ausführen                                                 | `npx dev-marketplace add dispatching-parallel-agents` |
| `executing-plans`             | Implementierungspläne inline ausführen                                                  | `npx dev-marketplace add executing-plans`             |
| `hookify`                     | Benutzerdefinierte Hooks erstellen um unerwünschtes Verhalten zu verhindern             | `npx dev-marketplace add hookify`                     |
| `ralph-loop`                  | Ralph-Wiggum-Technik für iterativen KI-Entwicklung                                      | `npx dev-marketplace add ralph-loop`                  |
| `session-report`              | Connector und Tooling für session-report                                                | `npx dev-marketplace add session-report`              |
| `subagent-driven-development` | Implementierungspläne mit unabhängigen Tasks ausführen                                  | `npx dev-marketplace add subagent-driven-development` |
| `using-git-worktrees`         | Feature-Arbeit mit Isolation starten                                                    | `npx dev-marketplace add using-git-worktrees`         |
| `using-superpowers`           | Festlegen, wie Skills gefunden und verwendet werden                                     | `npx dev-marketplace add using-superpowers`           |
| `writing-plans`               | Pläne schreiben bevor Code angefasst wird                                               | `npx dev-marketplace add writing-plans`               |
| `leak-spots`                  | Durchgesickerte Secrets in Git-Historie mit Periderm CLI erkennen                       | `npx dev-marketplace add leak-spots`                  |
| `launch-ready`                | Pre-Launch-Verifikation mit Periderm CLI Scan & Review                                  | `npx dev-marketplace add launch-ready`                |
| `branch-sec`                  | Branch-Schutz, signierte Commits, Periderm-Checks erzwingen                             | `npx dev-marketplace add branch-sec`                  |
| `cyber-sec`                   | Cybersicherheit-Toolkit: Bedrohungsmodellierung, OWASP, Krypto-Audit                    | `npx dev-marketplace add cyber-sec`                   |
| `commit-hook`                 | Git Hooks mit Periderm CLI Integration                                                  | `npx dev-marketplace add commit-hook`                 |
| `ci-cd`                       | CI/CD Pipeline Analyzer/Generator: GitHub Actions, GitLab CI, CircleCI, Azure Pipelines | `npx dev-marketplace add ci-cd`                       |

### Video & Motion (48 Skills)

| Skill                          | Beschreibung                                                     | Installation                                           |
| ------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------ |
| `animate`                      | Animationen von Grund auf bauen                                  | `npx dev-marketplace add animate`                      |
| `animate-expo`                 | Animationen in React Native und Expo bauen                       | `npx dev-marketplace add animate-expo`                 |
| `animation-performance`        | Web-Animationen im Frame-Budget halten                           | `npx dev-marketplace add animation-performance`        |
| `animation-vocabulary`         | Reverse-Lookup-Glossar für Motion-Effekte                        | `npx dev-marketplace add animation-vocabulary`         |
| `audio-production`             | Deterministisches Audio-Produktions-Execution                    | `npx dev-marketplace add audio-production`             |
| `blender-skill`                | 3D-Assets inspizieren, konvertieren, optimieren, rendern         | `npx dev-marketplace add blender-skill`                |
| `diagram-animation`            | Diagramme, Flowcharts, Charts animieren                          | `npx dev-marketplace add diagram-animation`            |
| `dubbing`                      | Text mit lokalem TTS sprechen, in Video einfügen                 | `npx dev-marketplace add dubbing`                      |
| `explainer-video`              | Erklärvideos erstellen                                           | `npx dev-marketplace add explainer-video`              |
| `ffmpeg-skill`                 | Video/Audio mit lokalem FFmpeg bearbeiten                        | `npx dev-marketplace add ffmpeg-skill`                 |
| `find-animation-opportunities` | Nach Orten suchen, die animieren sollten                         | `npx dev-marketplace add find-animation-opportunities` |
| `hyperframes`                  | Videos mit HyperFrames erstellen, bearbeiten, animieren, rendern | `npx dev-marketplace add hyperframes`                  |
| `hyperframes-cli`              | HyperFrames CLI - scaffold, check, edit, render                  | `npx dev-marketplace add hyperframes-cli`              |
| `hyperframes-registry`         | 450+ fertige HyperFrames-Blöcke                                  | `npx dev-marketplace add hyperframes-registry`         |
| `hyperframes-skill`            | Video aus HTML-Szenen mit HyperFrames rendern                    | `npx dev-marketplace add hyperframes-skill`            |
| `improve-animations`           | Motion-Code auditieren, Verbesserungspläne erstellen             | `npx dev-marketplace add improve-animations`           |
| `isometric-animation`          | Isometrische Animationen erstellen                               | `npx dev-marketplace add isometric-animation`          |
| `media-analysis`               | Deterministische Fakten über Mediendateien messen                | `npx dev-marketplace add media-analysis`               |
| `media-use`                    | Medien für HyperFrames-Videos beschaffen oder erstellen          | `npx dev-marketplace add media-use`                    |
| `motion-graphics`              | Deterministisches Motion-Graphics-Rendering                      | `npx dev-marketplace add motion-graphics`              |
| `nle-bridge-skill`             | Edits an Premiere Pro oder DaVinci Resolve übergeben             | `npx dev-marketplace add nle-bridge-skill`             |
| `remotion-best-practices`      | Router für alle Remotion-Skills                                  | `npx dev-marketplace add remotion-best-practices`      |
| `remotion-captions`            | Transkription, Anzeige, Animation von Untertiteln                | `npx dev-marketplace add remotion-captions`            |
| `remotion-create`              | Neues Remotion-Video erstellen                                   | `npx dev-marketplace add remotion-create`              |
| `remotion-docs`                | Remotion-Dokumentation suchen                                    | `npx dev-marketplace add remotion-docs`                |
| `remotion-ffmpeg-skill`        | Motion Graphics auf echtem Footage mit Remotion                  | `npx dev-marketplace add remotion-ffmpeg-skill`        |
| `remotion-interactivity`       | Remotion-Markup für Studio-Editierung strukturieren              | `npx dev-marketplace add remotion-interactivity`       |
| `remotion-license`             | Remotion-Lizenzinformationen finden                              | `npx dev-marketplace add remotion-license`             |
| `remotion-maps`                | Remotion Map Animationswissen                                    | `npx dev-marketplace add remotion-maps`                |
| `remotion-markup`              | Best Practices für Inhalt, Animation, Effekte                    | `npx dev-marketplace add remotion-markup`              |
| `remotion-multimedia`          | Mit Mediabunny interagieren                                      | `npx dev-marketplace add remotion-multimedia`          |
| `remotion-render`              | Remotion-Video, Standbild oder OTIO-Timeline exportieren         | `npx dev-marketplace add remotion-render`              |
| `remotion-saas`                | App mit Remotion bauen                                           | `npx dev-marketplace add remotion-saas`                |
| `remotion-studio`              | Remotion-Video previewen                                         | `npx dev-marketplace add remotion-studio`              |
| `remotion-to-hyperframes`      | Bestehenden Video-Code in HyperFrames bringen                    | `npx dev-marketplace add remotion-to-hyperframes`      |
| `remotion-upgrade`             | Remotion und verwandte Pakete aktualisieren                      | `npx dev-marketplace add remotion-upgrade`             |
| `remove-animations`            | Unnötige Animationen finden und entfernen                        | `npx dev-marketplace add remove-animations`            |
| `reverse-any-video`            | Jedes Video als editierbares HyperFrames-Projekt neu aufbauen    | `npx dev-marketplace add reverse-any-video`            |
| `review-animations`            | Animations- und Motion-Code reviewen                             | `npx dev-marketplace add review-animations`            |
| `slideshow`                    | HyperFrames-Slideshow für Live-Präsentation bauen                | `npx dev-marketplace add slideshow`                    |
| `sound-design-skill`           | Musik-Betten und Sound-Effekte für Video                         | `npx dev-marketplace add sound-design-skill`           |
| `subtitle-skill`               | Deterministische Untertitel-Validierung, SRT/VTT-Generierung     | `npx dev-marketplace add subtitle-skill`               |
| `thumbnail-skill`              | Deterministisches Thumbnail-Rendering                            | `npx dev-marketplace add thumbnail-skill`              |
| `video-editing-skill`          | Deterministisches Video-Editing                                  | `npx dev-marketplace add video-editing-skill`          |
| `video-production-agent`       | Video aus Quelldateien planen und produzieren                    | `npx dev-marketplace add video-production-agent`       |
| `voice-enhance-skill`          | Aufgenommene Sprache mit lokalen Engines bereinigen              | `npx dev-marketplace add voice-enhance-skill`          |
| `whiteboard-animation`         | Whiteboard-Animationen erstellen                                 | `npx dev-marketplace add whiteboard-animation`         |
| `wrapped-video`                | Spotify-Wrapped-Style-Videos erstellen                           | `npx dev-marketplace add wrapped-video`                |

---

## Repository-Layout

```text
dev-marketplace/
├── bin/
│   └── cli.js            # Standalone zero-dependency npx runner
├── skills/               # Standardisierte Skill-Pakete
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
├── registry.json         # Durchsuchbarer machine-readable Index
└── package.json          # npm bin Definition
```

---

## Open Source & Lizenzierung

Alle in dieser Registry enthaltenen Skills und Connectors sind Open Source und unter ihren jeweiligen Open-Source-Lizenzen (MIT, Apache-2.0 oder kompatibel) frei weiterverteilbar.

Beiträge, neue Agenten-Skills und Community-Connectors sind via Pull Requests herzlich willkommen!

---

## Übersetzungen

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
