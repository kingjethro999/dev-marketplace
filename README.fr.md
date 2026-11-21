# Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-133%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Compatible with Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-orange?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code)
[![Compatible with Cursor & Antigravity](https://img.shields.io/badge/Agent-Cursor%20%7C%20Antigravity%20%7C%20Codex-purple?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![Vercel Skills Standard](https://img.shields.io/badge/npx%20skills-ready-black?style=flat-square)](https://skills.sh)

Une marketplace open source pour développeurs avec **133+ compétences curatées et testées en production, connecteurs de serveurs de langage (LSP), moteurs de design, vérificateurs de qualité de code et boîtes à outils de synthèse vidéo**.

Compatible avec **Claude Code**, **Cursor**, **Antigravity (`agy`)**, **Codex**, et toute plateforme d'agents suivant la spécification standard `SKILL.md`.

---

## Démarrage Rapide

Installez n'importe quelle compétence directement dans votre projet :

```bash
# En utilisant le runner marketplace intégré :
npx dev-marketplace add <nom-competence>

# Ou en utilisant le standard ouvert skills.sh :
npx skills add kingjethro999/dev-marketplace --skill <nom-competence>
```

### Exemples d'Installation

```bash
# Installer les guidelines de design d'interface Apple
npx dev-marketplace add apple-design

# Installer le toolkit de code review et test-driven development
npx dev-marketplace add code-review test-driven-development systematic-debugging

# Installer toutes les compétences Video & Motion
npx dev-marketplace add --category "Video & Motion"

# Installer tous les connecteurs LSP (TypeScript, Python, Rust, Go, C++, Swift...)
npx dev-marketplace add --category "Connectors & LSP"

# Synchroniser tout le marketplace vers votre projet :
npx dev-marketplace add --all

# Ou installer globalement dans votre répertoire d'agents (~/.agents/skills) :
npx dev-marketplace add --all --global
```

---

## Commandes CLI

| Commande | Description |
|---|---|
| `npx dev-marketplace list` | Parcourir et filtrer toutes les compétences disponibles par mot-clé ou catégorie |
| `npx dev-marketplace add <nom...>` | Copier les compétences spécifiées dans votre projet actuel (`.agents/skills`, `.claude/skills`, ou `.gemini/skills`) |
| `npx dev-marketplace add --all` | Installer toutes les 133+ compétences du marketplace d'un coup |
| `npx dev-marketplace add --category "<nom>"` | Installer toutes les compétences d'une catégorie spécifique |
| `npx dev-marketplace info <nom>` | Inspecter la description complète, frontmatter et contenu des fichiers |
| `npx dev-marketplace categories` | Lister toutes les catégories du marketplace et leurs compteurs |

---

## Catalogue du Marketplace (133 Compétences et Connecteurs)

### Revue de Code et Qualité (16 compétences)

| Compétence | Description | Installation |
|---|---|---|
| `claude-security` | Mettre une équipe d'agents au travail comme chercheurs en sécurité | `npx dev-marketplace add claude-security` |
| `pr-review-toolkit` | Collection complète d'agents spécialisés pour revue PR approfondie | `npx dev-marketplace add pr-review-toolkit` |
| `qc-skill` | Contrôle qualité déterministe / validation média | `npx dev-marketplace add qc-skill` |
| `receiving-code-review` | Utiliser lors de la réception de feedback de code review | `npx dev-marketplace add receiving-code-review` |
| `requesting-code-review` | Utiliser à la completion des tâches, avant merge | `npx dev-marketplace add requesting-code-review` |
| `security` | Réviser le code pour problèmes de sécurité | `npx dev-marketplace add security` |
| `security-and-hardening` | Durcir le code contre les vulnérabilités | `npx dev-marketplace add security-and-hardening` |
| `systematic-debugging` | Utiliser face à tout bug ou échec de test | `npx dev-marketplace add systematic-debugging` |
| `test-driven-development` | Utiliser lors de l'implémentation de fonctionnalité ou fix | `npx dev-marketplace add test-driven-development` |
| `verification-before-completion` | Utiliser avant de revendiquer que le travail est terminé | `npx dev-marketplace add verification-before-completion` |
| `leak-spots` | Détecter secrets fuites dans l'historique Git via Periderm CLI | `npx dev-marketplace add leak-spots` |
| `launch-ready` | Vérification pré-lancement avec scan et review Periderm CLI | `npx dev-marketplace add launch-ready` |
| `branch-sec` | Forcer protection branches, commits signés, checks Periderm | `npx dev-marketplace add branch-sec` |
| `cyber-sec` | Toolkit cybersécurité: modélisation menaces, OWASP, audit crypto | `npx dev-marketplace add cyber-sec` |
| `commit-hook` | Git hooks avec intégration Periderm CLI | `npx dev-marketplace add commit-hook` |
| `repo-sec` | Durcissement sécurité repo: commits signés, protection branches, scan secrets, audit dépendances | `npx dev-marketplace add repo-sec` |

### Connecteurs et LSP (15 compétences)

| Compétence | Description | Installation |
|---|---|---|
| `clangd-lsp` | Serveur de langage C/C++ (clangd) pour Claude Code | `npx dev-marketplace add clangd-lsp` |
| `context7-mcp` | Références API librairies/frameworks et exemples de code | `npx dev-marketplace add context7-mcp` |
| `csharp-lsp` | Serveur de langage C# pour Claude Code | `npx dev-marketplace add csharp-lsp` |
| `gopls-lsp` | Serveur de langage Go pour Claude Code | `npx dev-marketplace add gopls-lsp` |
| `jdtls-lsp` | Serveur de langage Java (Eclipse JDT.LS) pour Claude Code | `npx dev-marketplace add jdtls-lsp` |
| `kotlin-lsp` | Serveur de langage Kotlin pour Claude Code | `npx dev-marketplace add kotlin-lsp` |
| `lua-lsp` | Serveur de langage Lua pour Claude Code | `npx dev-marketplace add lua-lsp` |
| `mcp-server-dev` | Compétences pour concevoir et construire serveurs MCP | `npx dev-marketplace add mcp-server-dev` |
| `mcp-tunnels` | Connecter Claude à un serveur MCP dans votre réseau privé | `npx dev-marketplace add mcp-tunnels` |
| `php-lsp` | Serveur de langage PHP (Intelephense) pour Claude Code | `npx dev-marketplace add php-lsp` |
| `pyright-lsp` | Serveur de langage Python (Pyright) pour Claude Code | `npx dev-marketplace add pyright-lsp` |
| `ruby-lsp` | Serveur de langage Ruby pour Claude Code | `npx dev-marketplace add ruby-lsp` |
| `rust-analyzer-lsp` | Serveur de langage Rust pour Claude Code | `npx dev-marketplace add rust-analyzer-lsp` |
| `swift-lsp` | Serveur de langage Swift (SourceKit-LSP) pour Claude Code | `npx dev-marketplace add swift-lsp` |
| `typescript-lsp` | Serveur de langage TypeScript/JavaScript pour Claude Code | `npx dev-marketplace add typescript-lsp` |

### Design et UI (14 compétences)

| Compétence | Description | Installation |
|---|---|---|
| `apple-design` | Approche Apple pour design d'interface et mouvement fluide | `npx dev-marketplace add apple-design` |
| `break-ui` | Stress-test UI avec données pire cas | `npx dev-marketplace add break-ui` |
| `design-mobile-apps` | Designer écrans apps mobile avec Sleek | `npx dev-marketplace add design-mobile-apps` |
| `emil-design-eng` | Philosophie design-engineering d'Emil Kowalski | `npx dev-marketplace add emil-design-eng` |
| `figma` | Intégrer Figma dans vidéo HyperFrames | `npx dev-marketplace add figma` |
| `figma-designer` | Designer dans Figma avec vraies variables et auto layout | `npx dev-marketplace add figma-designer` |
| `firecrawl-build` | Intégration Firecrawl pour données web | `npx dev-marketplace add firecrawl-build` |
| `gestures` | Construire interactions drag, swipe, sheet | `npx dev-marketplace add gestures` |
| `impeccable` | Designer, critiquer, auditer, polir interfaces frontend | `npx dev-marketplace add impeccable` |
| `improve` | Auditer codebase comme conseiller senior, produire plans implémentation | `npx dev-marketplace add improve` |
| `landing-page-design` | Système complet pour landing pages haute conversion | `npx dev-marketplace add landing-page-design` |
| `learn-taste` | Transformer corrections design en règles dans DESIGN.md | `npx dev-marketplace add learn-taste` |
| `pick-ui-library` | Choisir la bonne librairie pour tâches frontend | `npx dev-marketplace add pick-ui-library` |
| `prototype` | Construire multiples versions UI derrière sélecteur visuel | `npx dev-marketplace add prototype` |

### Outils Développement et IA (27 compétences)

| Compétence | Description | Installation |
|---|---|---|
| `artifacts-skill` | Exécution et vérification local-first pour artefacts réels | `npx dev-marketplace add artifacts-skill` |
| `ask-emil` | Router sur les compétences de ce repo | `npx dev-marketplace add ask-emil` |
| `ask-sonner` | Guide de Sonner, la librairie React toast | `npx dev-marketplace add ask-sonner` |
| `brainstorming` | Utiliser avant tout travail créatif | `npx dev-marketplace add brainstorming` |
| `caveman` | Mode voix cavernicole concis | `npx dev-marketplace add caveman` |
| `choreograph` | Coordonner éléments qui s'animent ensemble | `npx dev-marketplace add choreograph` |
| `claude-md-management` | Outils pour maintenir et améliorer fichiers CLAUDE.md | `npx dev-marketplace add claude-md-management` |
| `color-grading` | Grading/correction couleur déterministe | `npx dev-marketplace add color-grading` |
| `feature-dev` | Workflow complet développement fonctionnalité | `npx dev-marketplace add feature-dev` |
| `find-skills` | Découvrir et installer compétences agents | `npx dev-marketplace add find-skills` |
| `finishing-a-development-branch` | Décider comment intégrer travail complété | `npx dev-marketplace add finishing-a-development-branch` |
| `html-demo` | Montrer app fonctionnant sur page web via simulation HTML | `npx dev-marketplace add html-demo` |
| `imagemagick-skill` | Édition d'images locale ImageMagick | `npx dev-marketplace add imagemagick-skill` |
| `ingest-skill` | Décharger cartes caméra et enregistreurs sûrement | `npx dev-marketplace add ingest-skill` |
| `mobile-native` | Faire app web feel native sur mobile | `npx dev-marketplace add mobile-native` |
| `product-demo` | Enregistrer vidéos demo produit polies | `npx dev-marketplace add product-demo` |
| `product-film` | Faire courts métrages produit | `npx dev-marketplace add product-film` |
| `publish-skill` | Uploader livrables finis vers plateformes | `npx dev-marketplace add publish-skill` |
| `reverse-engineer-anything` | Reverse engineer native, managed, Electron, firmware | `npx dev-marketplace add reverse-engineer-anything` |
| `skillpact` | Écrire et vérifier contrats SkillPact | `npx dev-marketplace add skillpact` |
| `slide-sync-skill` | Trouver changements diapositives dans enregistrements, créer chapitres | `npx dev-marketplace add slide-sync-skill` |
| `stepcap` | Travailler avec dossiers d'enregistrement stepcap | `npx dev-marketplace add stepcap` |
| `style-sampling` | Faire nouveaux épisodes dans styles vidéo prouvés | `npx dev-marketplace add style-sampling` |
| `transcription-skill` | Transcrire parole dans fichiers audio/video | `npx dev-marketplace add transcription-skill` |
| `website-scroll` | Enregistrer scroll haut-bas de toute page web | `npx dev-marketplace add website-scroll` |
| `write-swift` | Comment écrire du Swift moderne correctement | `npx dev-marketplace add write-swift` |
| `writing-skills` | Créer, éditer, vérifier compétences avant déploiement | `npx dev-marketplace add writing-skills` |

### Ingénierie et Workflow (18 compétences)

| Compétence | Description | Installation |
|---|---|---|
| `code-modernization` | Moderniser codebases legacy avec preuve | `npx dev-marketplace add code-modernization` |
| `commit-commands` | Streamliner workflow git | `npx dev-marketplace add commit-commands` |
| `diagnosing-superpowers` | Diagnostiquer pourquoi session superpowers a échoué | `npx dev-marketplace add diagnosing-superpowers` |
| `dispatching-parallel-agents` | Exécuter 2+ tâches indépendantes en parallèle | `npx dev-marketplace add dispatching-parallel-agents` |
| `executing-plans` | Exécuter plans implémentation inline | `npx dev-marketplace add executing-plans` |
| `hookify` | Créer hooks personnalisés pour prévenir comportements indésirables | `npx dev-marketplace add hookify` |
| `ralph-loop` | Technique Ralph Wiggum pour développement AI itératif | `npx dev-marketplace add ralph-loop` |
| `session-report` | Connecteur et tooling pour session-report | `npx dev-marketplace add session-report` |
| `subagent-driven-development` | Exécuter plans implémentation avec tâches indépendantes | `npx dev-marketplace add subagent-driven-development` |
| `using-git-worktrees` | Commencer travail fonctionnalité avec isolation | `npx dev-marketplace add using-git-worktrees` |
| `using-superpowers` | Établir comment trouver et utiliser compétences | `npx dev-marketplace add using-superpowers` |
| `writing-plans` | Écrire plans avant de toucher au code | `npx dev-marketplace add writing-plans` |
| `leak-spots` | Détecter secrets fuites dans historique Git via Periderm CLI | `npx dev-marketplace add leak-spots` |
| `launch-ready` | Vérification pré-lancement avec scan et review Periderm CLI | `npx dev-marketplace add launch-ready` |
| `branch-sec` | Forcer protection branches, commits signés, checks Periderm | `npx dev-marketplace add branch-sec` |
| `cyber-sec` | Toolkit cybersécurité: modélisation menaces, OWASP, audit crypto | `npx dev-marketplace add cyber-sec` |
| `commit-hook` | Git hooks avec intégration Periderm CLI | `npx dev-marketplace add commit-hook` |
| `ci-cd` | Analyseur/générateur pipelines CI/CD: GitHub Actions, GitLab CI, CircleCI, Azure Pipelines | `npx dev-marketplace add ci-cd` |

### Vidéo et Mouvement (48 compétences)

| Compétence | Description | Installation |
|---|---|---|
| `animate` | Construire animations depuis zéro | `npx dev-marketplace add animate` |
| `animate-expo` | Construire animations dans React Native et Expo | `npx dev-marketplace add animate-expo` |
| `animation-performance` | Garder animations web dans budget frames | `npx dev-marketplace add animation-performance` |
| `animation-vocabulary` | Glossaire inverse pour effets de mouvement | `npx dev-marketplace add animation-vocabulary` |
| `audio-production` | Exécution déterministe production audio | `npx dev-marketplace add audio-production` |
| `blender-skill` | Inspecter, convertir, optimiser, rendre assets 3D | `npx dev-marketplace add blender-skill` |
| `diagram-animation` | Animater diagrammes, flowcharts, charts | `npx dev-marketplace add diagram-animation` |
| `dubbing` | Parler texte avec TTS local, mettre en vidéo | `npx dev-marketplace add dubbing` |
| `explainer-video` | Faire vidéos explicatives | `npx dev-marketplace add explainer-video` |
| `ffmpeg-skill` | Éditer video/audio avec FFmpeg local | `npx dev-marketplace add ffmpeg-skill` |
| `find-animation-opportunities` | Chercher endroits qui devraient animer | `npx dev-marketplace add find-animation-opportunities` |
| `hyperframes` | Faire, éditer, animer ou rendre vidéo avec HyperFrames | `npx dev-marketplace add hyperframes` |
| `hyperframes-cli` | HyperFrames CLI - scaffold, check, edit, render | `npx dev-marketplace add hyperframes-cli` |
| `hyperframes-registry` | 450+ blocs HyperFrames prêts | `npx dev-marketplace add hyperframes-registry` |
| `hyperframes-skill` | Rendre vidéo depuis scènes HTML avec HyperFrames | `npx dev-marketplace add hyperframes-skill` |
| `improve-animations` | Auditer code mouvement, produire plans amélioration | `npx dev-marketplace add improve-animations` |
| `isometric-animation` | Faire animations isométriques | `npx dev-marketplace add isometric-animation` |
| `media-analysis` | Mesurer faits déterministes sur fichiers média | `npx dev-marketplace add media-analysis` |
| `media-use` | Obtenir ou créer média pour vidéos HyperFrames | `npx dev-marketplace add media-use` |
| `motion-graphics` | Rendu déterministe motion graphics | `npx dev-marketplace add motion-graphics` |
| `nle-bridge-skill` | Passer éditions à Premiere Pro ou DaVinci Resolve | `npx dev-marketplace add nle-bridge-skill` |
| `remotion-best-practices` | Router pour toutes compétences Remotion | `npx dev-marketplace add remotion-best-practices` |
| `remotion-captions` | Transcription, affichage, animation sous-titres | `npx dev-marketplace add remotion-captions` |
| `remotion-create` | Créer nouveau vidéo Remotion | `npx dev-marketplace add remotion-create` |
| `remotion-docs` | Chercher documentation Remotion | `npx dev-marketplace add remotion-docs` |
| `remotion-ffmpeg-skill` | Motion graphics sur footage réel avec Remotion | `npx dev-marketplace add remotion-ffmpeg-skill` |
| `remotion-interactivity` | Structurer markup Remotion pour édition Studio | `npx dev-marketplace add remotion-interactivity` |
| `remotion-license` | Trouver info licence Remotion | `npx dev-marketplace add remotion-license` |
| `remotion-maps` | Connaissance animation Remotion Map | `npx dev-marketplace add remotion-maps` |
| `remotion-markup` | Meilleures pratiques contenu, animation, effets | `npx dev-marketplace add remotion-markup` |
| `remotion-multimedia` | Interagir avec Mediabunny | `npx dev-marketplace add remotion-multimedia` |
| `remotion-render` | Exporter vidéo Remotion, image fixe, ou timeline OTIO | `npx dev-marketplace add remotion-render` |
| `remotion-saas` | Construire app avec Remotion | `npx dev-marketplace add remotion-saas` |
| `remotion-studio` | Prévisualiser vidéo Remotion | `npx dev-marketplace add remotion-studio` |
| `remotion-to-hyperframes` | Apporter code vidéo existant vers HyperFrames | `npx dev-marketplace add remotion-to-hyperframes` |
| `remotion-upgrade` | Mettre à jour Remotion et packages liés | `npx dev-marketplace add remotion-upgrade` |
| `remove-animations` | Trouver et supprimer animations inutiles | `npx dev-marketplace add remove-animations` |
| `reverse-any-video` | Reconstruire toute vidéo comme projet HyperFrames editable | `npx dev-marketplace add reverse-any-video` |
| `review-animations` | Réviser code animation et mouvement | `npx dev-marketplace add review-animations` |
| `slideshow` | Construire slideshow HyperFrames pour présenter en direct | `npx dev-marketplace add slideshow` |
| `sound-design-skill` | Lits musicaux et effets sonores pour vidéo | `npx dev-marketplace add sound-design-skill` |
| `subtitle-skill` | Validation déterministe sous-titres, génération SRT/VTT | `npx dev-marketplace add subtitle-skill` |
| `thumbnail-skill` | Rendu déterministe thumbnails | `npx dev-marketplace add thumbnail-skill` |
| `video-editing-skill` | Édition vidéo déterministe | `npx dev-marketplace add video-editing-skill` |
| `video-production-agent` | Planifier et produire vidéo depuis fichiers sources | `npx dev-marketplace add video-production-agent` |
| `voice-enhance-skill` | Nettoyer voix enregistrée avec engines locaux | `npx dev-marketplace add voice-enhance-skill` |
| `whiteboard-animation` | Faire animations tableau blanc | `npx dev-marketplace add whiteboard-animation` |
| `wrapped-video` | Faire vidéos style Spotify Wrapped | `npx dev-marketplace add wrapped-video` |

---

## Structure du Répertoire

```text
dev-marketplace/
├── bin/
│   └── cli.js            # Exécuteur standalone zero-dependency npx
├── skills/               # Paquets de compétences standardisés
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
├── registry.json         # Index machine-readable searchable
└── package.json          # Définition npm bin
```

---

## Open Source et Licences

Toutes les compétences et connecteurs inclus dans ce registre sont open source et librement redistribuables sous leurs licences open source respectives (MIT, Apache-2.0, ou compatibles).

Les contributions, nouvelles compétences d'agents et connecteurs communautaires sont les bienvenus via Pull Requests !

---

## Traductions

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