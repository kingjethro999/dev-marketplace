# Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-133%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Compatible with Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-orange?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code)
[![Compatible with Cursor & Antigravity](https://img.shields.io/badge/Agent-Cursor%20%7C%20Antigravity%20%7C%20Codex-purple?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![Vercel Skills Standard](https://img.shields.io/badge/npx%20skills-ready-black?style=flat-square)](https://skills.sh)

Открытый маркетплейс для разработчиков с **133+ отобранных и проверенных в продакшене AI-агентских навыков, коннекторов Language Server (LSP), дизайн-движков, верификаторов качества кода и тулкитов для видеосинтеза**.

Совместим с **Claude Code**, **Cursor**, **Antigravity (`agy`)**, **Codex** и любой агентской платформой, следующей стандартной спецификации `SKILL.md`.

---

## Быстрый старт

Установите любой навык непосредственно в свой проект:

```bash
# Используя встроенный раннер маркетплейса:
npx dev-marketplace add <skill-name>

# Или используя открытый стандарт skills.sh:
npx skills add kingjethro999/dev-marketplace --skill <skill-name>
```

### Примеры установки

```bash
# Установить гайдлайны Apple по дизайну интерфейсов
npx dev-marketplace add apple-design

# Установить инструментарий для code review и test-driven development
npx dev-marketplace add requesting-code-review test-driven-development systematic-debugging

# Установить все навыки Video & Motion
npx dev-marketplace add --category "Video & Motion"

# Установить все LSP-коннекторы (TypeScript, Python, Rust, Go, C++, Swift...)
npx dev-marketplace add --category "Connectors & LSP"

# Синхронизировать весь маркетплейс с вашим проектом:
npx dev-marketplace add --all

# Или установить глобально в директорию агентов (~/.agents/skills):
npx dev-marketplace add --all --global
```

---

## CLI команды

| Команда                                       | Описание                                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `npx dev-marketplace list`                    | Просмотр и фильтрация всех доступных навыков по ключевому слову или категории                             |
| `npx dev-marketplace add <name...>`           | Копирование указанных навыков в текущий проект (`.agents/skills`, `.claude/skills`, или `.gemini/skills`) |
| `npx dev-marketplace add --all`               | Установка всех 133+ навыков маркетплейса сразу                                                            |
| `npx dev-marketplace add --category "<name>"` | Установка всех навыков определенной категории                                                             |
| `npx dev-marketplace info <name>`             | Инспекция полного описания, frontmatter и содержимого файлов                                              |
| `npx dev-marketplace categories`              | Список всех категорий маркетплейса и их счетчиков                                                         |

---

## Каталог маркетплейса (133 навыка и коннектора)

### Code Review & Quality (14 навыков)

| Навык                            | Описание                                                                                           | Установка                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `claude-security`                | Запустить команду агентов как исследователей безопасности над вашей кодовой базой                  | `npx dev-marketplace add claude-security`                |
| `pr-review-toolkit`              | Полная коллекция специализированных агентов для глубокого PR review                                | `npx dev-marketplace add pr-review-toolkit`              |
| `qc-skill`                       | Детерминистический контроль качества медиа / валидация                                             | `npx dev-marketplace add qc-skill`                       |
| `receiving-code-review`          | Использовать при получении фидбэка от code review                                                  | `npx dev-marketplace add receiving-code-review`          |
| `requesting-code-review`         | Использовать при завершении задач, перед мерджем                                                   | `npx dev-marketplace add requesting-code-review`         |
| `security`                       | Проверять код на проблемы безопасности                                                             | `npx dev-marketplace add security`                       |
| `security-and-hardening`         | Укреплять код против уязвимостей                                                                   | `npx dev-marketplace add security-and-hardening`         |
| `systematic-debugging`           | Использовать при столкновении с любым багом или падением теста                                     | `npx dev-marketplace add systematic-debugging`           |
| `test-driven-development`        | Использовать при реализации любой фичи или багфикса                                                | `npx dev-marketplace add test-driven-development`        |
| `verification-before-completion` | Использовать перед заявкой на завершение работы                                                    | `npx dev-marketplace add verification-before-completion` |
| `leak-spots`                     | Обнаружить утечки секретов в Git-истории через Periderm CLI                                        | `npx dev-marketplace add leak-spots`                     |
| `branch-sec`                     | Навязать branch protection, signed commits, Periderm checks                                        | `npx dev-marketplace add branch-sec`                     |
| `cyber-sec`                      | Кибербезопасность тулкит: threat modeling, OWASP, crypto audit                                     | `npx dev-marketplace add cyber-sec`                      |
| `repo-sec`                       | Укрепление безопасности репо: signed commits, branch protection, secret scanning, dependency audit | `npx dev-marketplace add repo-sec`                       |

### Connectors & LSP (15 навыков)

| Навык               | Описание                                               | Установка                                   |
| ------------------- | ------------------------------------------------------ | ------------------------------------------- |
| `clangd-lsp`        | C/C++ Language Server (clangd) для Claude Code         | `npx dev-marketplace add clangd-lsp`        |
| `context7-mcp`      | API-референсы библиотек/фреймворков и примеры кода     | `npx dev-marketplace add context7-mcp`      |
| `csharp-lsp`        | C# Language Server для Claude Code                     | `npx dev-marketplace add csharp-lsp`        |
| `gopls-lsp`         | Go Language Server для Claude Code                     | `npx dev-marketplace add gopls-lsp`         |
| `jdtls-lsp`         | Java Language Server (Eclipse JDT.LS) для Claude Code  | `npx dev-marketplace add jdtls-lsp`         |
| `kotlin-lsp`        | Kotlin Language Server для Claude Code                 | `npx dev-marketplace add kotlin-lsp`        |
| `lua-lsp`           | Lua Language Server для Claude Code                    | `npx dev-marketplace add lua-lsp`           |
| `mcp-server-dev`    | Навыки для проектирования и построения MCP-серверов    | `npx dev-marketplace add mcp-server-dev`    |
| `mcp-tunnels`       | Подключить Claude к MCP-серверу в вашей приватной сети | `npx dev-marketplace add mcp-tunnels`       |
| `php-lsp`           | PHP Language Server (Intelephense) для Claude Code     | `npx dev-marketplace add php-lsp`           |
| `pyright-lsp`       | Python Language Server (Pyright) для Claude Code       | `npx dev-marketplace add pyright-lsp`       |
| `ruby-lsp`          | Ruby Language Server для Claude Code                   | `npx dev-marketplace add ruby-lsp`          |
| `rust-analyzer-lsp` | Rust Language Server для Claude Code                   | `npx dev-marketplace add rust-analyzer-lsp` |
| `swift-lsp`         | Swift Language Server (SourceKit-LSP) для Claude Code  | `npx dev-marketplace add swift-lsp`         |
| `typescript-lsp`    | TypeScript/JavaScript Language Server для Claude Code  | `npx dev-marketplace add typescript-lsp`    |

### Design & UI (14 навыков)

| Навык                 | Описание                                                             | Установка                                     |
| --------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| `apple-design`        | Подход Apple к дизайну интерфейсов и плавному движению               | `npx dev-marketplace add apple-design`        |
| `break-ui`            | Стресс-тест UI с worst-case данными                                  | `npx dev-marketplace add break-ui`            |
| `design-mobile-apps`  | Дизайн мобильных экранов с Sleek                                     | `npx dev-marketplace add design-mobile-apps`  |
| `emil-design-eng`     | Философия дизайн-инженерии Эмила Ковальски                           | `npx dev-marketplace add emil-design-eng`     |
| `figma`               | Принести Figma в HyperFrames видео                                   | `npx dev-marketplace add figma`               |
| `figma-designer`      | Дизайн в Figma с реальными переменными и auto layout                 | `npx dev-marketplace add figma-designer`      |
| `firecrawl-build`     | Интеграция Firecrawl для веб-данных                                  | `npx dev-marketplace add firecrawl-build`     |
| `gestures`            | Построение drag, swipe, sheet интеракций                             | `npx dev-marketplace add gestures`            |
| `impeccable`          | Дизайн, критика, аудит, полировка frontend интерфейсов               | `npx dev-marketplace add impeccable`          |
| `improve`             | Аудит кодовой базы как senior advisor, создание implementation plans | `npx dev-marketplace add improve`             |
| `landing-page-design` | Полная система для high-converting landing pages                     | `npx dev-marketplace add landing-page-design` |
| `learn-taste`         | Превращение дизайн-коррекций в правила в DESIGN.md                   | `npx dev-marketplace add learn-taste`         |
| `pick-ui-library`     | Выбор правильной библиотеки для frontend задач                       | `npx dev-marketplace add pick-ui-library`     |
| `prototype`           | Построение множества UI-версий за визуальным пикером                 | `npx dev-marketplace add prototype`           |

### Developer Tools & AI (27 навыков)

| Навык                            | Описание                                                          | Установка                                                |
| -------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| `artifacts-skill`                | Local-first исполнение и верификация для реальных артефактов      | `npx dev-marketplace add artifacts-skill`                |
| `ask-emil`                       | Роутер по навыкам в этом репо                                     | `npx dev-marketplace add ask-emil`                       |
| `ask-sonner`                     | Гайд по Sonner, React toast библиотеке                            | `npx dev-marketplace add ask-sonner`                     |
| `brainstorming`                  | Использовать перед любой творческой работой                       | `npx dev-marketplace add brainstorming`                  |
| `caveman`                        | Лаконичный caveman voice режим                                    | `npx dev-marketplace add caveman`                        |
| `choreograph`                    | Координация элементов, анимирующихся вместе                       | `npx dev-marketplace add choreograph`                    |
| `claude-md-management`           | Инструменты для поддержки и улучшения CLAUDE.md                   | `npx dev-marketplace add claude-md-management`           |
| `color-grading`                  | Детерминистический color grading / correction                     | `npx dev-marketplace add color-grading`                  |
| `feature-dev`                    | Комплексный feature development workflow                          | `npx dev-marketplace add feature-dev`                    |
| `find-skills`                    | Обнаружение и установка agent skills                              | `npx dev-marketplace add find-skills`                    |
| `finishing-a-development-branch` | Решение о том, как интегрировать завершенную работу               | `npx dev-marketplace add finishing-a-development-branch` |
| `html-demo`                      | Показ работающего приложения на веб-странице через HTML-симуляцию | `npx dev-marketplace add html-demo`                      |
| `imagemagick-skill`              | Локальный ImageMagick image editing                               | `npx dev-marketplace add imagemagick-skill`              |
| `ingest-skill`                   | Безопасный оффлоад камерных карт и рекордеров                     | `npx dev-marketplace add ingest-skill`                   |
| `mobile-native`                  | Сделать web app нативным на телефоне                              | `npx dev-marketplace add mobile-native`                  |
| `product-demo`                   | Запись полированных product demo видео                            | `npx dev-marketplace add product-demo`                   |
| `product-film`                   | Создание коротких product films                                   | `npx dev-marketplace add product-film`                   |
| `publish-skill`                  | Загрузка готовых deliverables на платформы                        | `npx dev-marketplace add publish-skill`                  |
| `reverse-engineer-anything`      | Reverse engineer native, managed, Electron, firmware targets      | `npx dev-marketplace add reverse-engineer-anything`      |
| `skillpact`                      | Написание и проверка SkillPact контрактов                         | `npx dev-marketplace add skillpact`                      |
| `slide-sync-skill`               | Поиск смены слайдов в записях, создание глав                      | `npx dev-marketplace add slide-sync-skill`               |
| `stepcap`                        | Работа с папками stepcap-записей                                  | `npx dev-marketplace add stepcap`                        |
| `style-sampling`                 | Создание новых эпизодов в проверенных видео-стилях                | `npx dev-marketplace add style-sampling`                 |
| `transcription-skill`            | Транскрибация речи в аудио/видео файлах                           | `npx dev-marketplace add transcription-skill`            |
| `website-scroll`                 | Запись top-to-bottom скролла любой веб-страницы                   | `npx dev-marketplace add website-scroll`                 |
| `write-swift`                    | Как писать современный Swift правильно                            | `npx dev-marketplace add write-swift`                    |
| `writing-skills`                 | Создание, редактирование, верификация навыков перед деплоем       | `npx dev-marketplace add writing-skills`                 |

### Engineering & Workflow (15 навыков)

| Навык                         | Описание                                                                                | Установка                                             |
| ----------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `code-modernization`          | Модернизация legacy кодовых баз с доказательствами                                      | `npx dev-marketplace add code-modernization`          |
| `commit-commands`             | Оптимизация git workflow                                                                | `npx dev-marketplace add commit-commands`             |
| `diagnosing-superpowers`      | Диагностика неудачной superpowers сессии                                                | `npx dev-marketplace add diagnosing-superpowers`      |
| `dispatching-parallel-agents` | Запуск 2+ независимых задач параллельно                                                 | `npx dev-marketplace add dispatching-parallel-agents` |
| `executing-plans`             | Инлайн-исполнение implementation plans                                                  | `npx dev-marketplace add executing-plans`             |
| `hookify`                     | Создание custom hooks для предотвращения unwanted behaviors                             | `npx dev-marketplace add hookify`                     |
| `ralph-loop`                  | Техника Ralph Wiggum для итеративной AI-разработки                                      | `npx dev-marketplace add ralph-loop`                  |
| `session-report`              | Коннектор и тулинг для session-report                                                   | `npx dev-marketplace add session-report`              |
| `subagent-driven-development` | Исполнение implementation plans с independent tasks                                     | `npx dev-marketplace add subagent-driven-development` |
| `using-git-worktrees`         | Начало feature work с изоляцией                                                         | `npx dev-marketplace add using-git-worktrees`         |
| `using-superpowers`           | Установление того, как находить и использовать skills                                   | `npx dev-marketplace add using-superpowers`           |
| `writing-plans`               | Написание планов перед тем, как трогать код                                             | `npx dev-marketplace add writing-plans`               |
| `launch-ready`                | Pre-launch верификация с Periderm CLI scan & review                                     | `npx dev-marketplace add launch-ready`                |
| `commit-hook`                 | Git hooks с интеграцией Periderm CLI                                                    | `npx dev-marketplace add commit-hook`                 |
| `ci-cd`                       | CI/CD pipeline analyzer/generator: GitHub Actions, GitLab CI, CircleCI, Azure Pipelines | `npx dev-marketplace add ci-cd`                       |

### Video & Motion (48 навыков)

| Навык                          | Описание                                                             | Установка                                              |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------ |
| `animate`                      | Построение анимаций с нуля                                           | `npx dev-marketplace add animate`                      |
| `animate-expo`                 | Построение анимаций в React Native и Expo                            | `npx dev-marketplace add animate-expo`                 |
| `animation-performance`        | Удержание web animations в пределах frame budget                     | `npx dev-marketplace add animation-performance`        |
| `animation-vocabulary`         | Reverse-lookup глоссарий для motion effects                          | `npx dev-marketplace add animation-vocabulary`         |
| `audio-production`             | Детерминистическое audio production execution                        | `npx dev-marketplace add audio-production`             |
| `blender-skill`                | Инспекция, конвертация, оптимизация, рендеринг 3D assets             | `npx dev-marketplace add blender-skill`                |
| `diagram-animation`            | Анимация диаграмм, flowcharts, charts                                | `npx dev-marketplace add diagram-animation`            |
| `dubbing`                      | Озвучка текста локальным TTS, вставка в видео                        | `npx dev-marketplace add dubbing`                      |
| `explainer-video`              | Создание explainer videos                                            | `npx dev-marketplace add explainer-video`              |
| `ffmpeg-skill`                 | Редактирование video/audio с локальным FFmpeg                        | `npx dev-marketplace add ffmpeg-skill`                 |
| `find-animation-opportunities` | Поиск мест, которые должны анимироваться                             | `npx dev-marketplace add find-animation-opportunities` |
| `hyperframes`                  | Создание, редактирование, анимация или рендеринг видео с HyperFrames | `npx dev-marketplace add hyperframes`                  |
| `hyperframes-cli`              | HyperFrames CLI - scaffold, check, edit, render                      | `npx dev-marketplace add hyperframes-cli`              |
| `hyperframes-registry`         | 450+ готовых HyperFrames блоков                                      | `npx dev-marketplace add hyperframes-registry`         |
| `hyperframes-skill`            | Рендеринг видео из HTML сцен с HyperFrames                           | `npx dev-marketplace add hyperframes-skill`            |
| `improve-animations`           | Аудит motion кода, создание improvement plans                        | `npx dev-marketplace add improve-animations`           |
| `isometric-animation`          | Создание изометрических анимаций                                     | `npx dev-marketplace add isometric-animation`          |
| `media-analysis`               | Измерение детерминистических фактов о медиа-файлах                   | `npx dev-marketplace add media-analysis`               |
| `media-use`                    | Получение или создание медиа для HyperFrames видео                   | `npx dev-marketplace add media-use`                    |
| `motion-graphics`              | Детерминистическое motion-graphics рендеринг                         | `npx dev-marketplace add motion-graphics`              |
| `nle-bridge-skill`             | Передача эдитов в Premiere Pro или DaVinci Resolve                   | `npx dev-marketplace add nle-bridge-skill`             |
| `remotion-best-practices`      | Роутер для всех Remotion skills                                      | `npx dev-marketplace add remotion-best-practices`      |
| `remotion-captions`            | Транскрипция, отображение, анимация субтитров                        | `npx dev-marketplace add remotion-captions`            |
| `remotion-create`              | Создание нового Remotion видео                                       | `npx dev-marketplace add remotion-create`              |
| `remotion-docs`                | Поиск Remotion документации                                          | `npx dev-marketplace add remotion-docs`                |
| `remotion-ffmpeg-skill`        | Motion graphics на real footage с Remotion                           | `npx dev-marketplace add remotion-ffmpeg-skill`        |
| `remotion-interactivity`       | Структурирование Remotion markup для Studio editing                  | `npx dev-marketplace add remotion-interactivity`       |
| `remotion-license`             | Поиск Remotion license information                                   | `npx dev-marketplace add remotion-license`             |
| `remotion-maps`                | Remotion Map animation knowledge                                     | `npx dev-marketplace add remotion-maps`                |
| `remotion-markup`              | Content, animation и effects best practices                          | `npx dev-marketplace add remotion-markup`              |
| `remotion-multimedia`          | Взаимодействие с Mediabunny                                          | `npx dev-marketplace add remotion-multimedia`          |
| `remotion-render`              | Экспорт Remotion видео, still image, или OTIO timeline               | `npx dev-marketplace add remotion-render`              |
| `remotion-saas`                | Построение app с Remotion                                            | `npx dev-marketplace add remotion-saas`                |
| `remotion-studio`              | Preview Remotion видео                                               | `npx dev-marketplace add remotion-studio`              |
| `remotion-to-hyperframes`      | Перенос existing video code в HyperFrames                            | `npx dev-marketplace add remotion-to-hyperframes`      |
| `remotion-upgrade`             | Апгрейд Remotion и related packages                                  | `npx dev-marketplace add remotion-upgrade`             |
| `remove-animations`            | Поиск и удаление unnecessary animations                              | `npx dev-marketplace add remove-animations`            |
| `reverse-any-video`            | Перестройка любого видео как editable HyperFrames project            | `npx dev-marketplace add reverse-any-video`            |
| `review-animations`            | Review animation и motion кода                                       | `npx dev-marketplace add review-animations`            |
| `slideshow`                    | Построение HyperFrames slideshow для live презентации                | `npx dev-marketplace add slideshow`                    |
| `sound-design-skill`           | Music beds и sound effects для видео                                 | `npx dev-marketplace add sound-design-skill`           |
| `subtitle-skill`               | Детерминистическая subtitle validation, SRT/VTT generation           | `npx dev-marketplace add subtitle-skill`               |
| `thumbnail-skill`              | Детерминистическое thumbnail rendering                               | `npx dev-marketplace add thumbnail-skill`              |
| `video-editing-skill`          | Детерминистическое video editing                                     | `npx dev-marketplace add video-editing-skill`          |
| `video-production-agent`       | Планирование и производство видео из source files                    | `npx dev-marketplace add video-production-agent`       |
| `voice-enhance-skill`          | Очистка записанной речи локальными engines                           | `npx dev-marketplace add voice-enhance-skill`          |
| `whiteboard-animation`         | Создание whiteboard animations                                       | `npx dev-marketplace add whiteboard-animation`         |
| `wrapped-video`                | Создание Spotify Wrapped style видео                                 | `npx dev-marketplace add wrapped-video`                |

---

## Структура репозитория

```text
dev-marketplace/
├── bin/
│   └── cli.js            # Standalone zero-dependency npx runner
├── skills/               # Стандартизированные пакеты навыков
│   ├── apple-design/
│   │   └── SKILL.md
│   ├── requesting-code-review/
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

Все навыки и коннекторы, включенные в этот реестр, являются открытым исходным кодом и свободно перераспространяемы под соответствующими открытыми лицензиями (MIT, Apache-2.0, или совместимые).

Вклады, новые агентские навыки и комьюнити-коннекторы приветствуются через Pull Requests!

---

## Переводы

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
