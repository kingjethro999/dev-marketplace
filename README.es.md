# Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-133%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Compatible with Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-orange?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code)
[![Compatible with Cursor & Antigravity](https://img.shields.io/badge/Agent-Cursor%20%7C%20Antigravity%20%7C%20Codex-purple?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![Vercel Skills Standard](https://img.shields.io/badge/npx%20skills-ready-black?style=flat-square)](https://skills.sh)

Un mercado de desarrolladores de código abierto con **133+ habilidades curadas y probadas en batalla, conectores de servidores de lenguaje (LSP), motores de diseño, verificadores de calidad de código y kits de herramientas de síntesis de video**.

Compatible con **Claude Code**, **Cursor**, **Antigravity (`agy`)**, **Codex**, y cualquier plataforma de agentes que siga la especificación estándar `SKILL.md`.

---

## Inicio Rápido

Instala cualquier habilidad directamente en tu proyecto:

```bash
# Usando el ejecutor integrado del marketplace:
npx dev-marketplace add <nombre-habilidad>

# O usando el estándar abierto skills.sh:
npx skills add kingjethro999/dev-marketplace --skill <nombre-habilidad>
```

### Ejemplos de Instalación

```bash
# Instalar guías de diseño de interfaz de Apple
npx dev-marketplace add apple-design

# Instalar kit de revisión de código y desarrollo dirigido por pruebas
npx dev-marketplace add requesting-code-review test-driven-development systematic-debugging

# Instalar todas las habilidades de Video y Movimiento
npx dev-marketplace add --category "Video & Motion"

# Instalar todos los conectores LSP (TypeScript, Python, Rust, Go, C++, Swift...)
npx dev-marketplace add --category "Connectors & LSP"

# Sincronizar todo el marketplace a tu proyecto:
npx dev-marketplace add --all

# O instalar globalmente en tu directorio de agentes (~/.agents/skills):
npx dev-marketplace add --all --global
```

---

## Comandos CLI

| Comando                                         | Descripción                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npx dev-marketplace list`                      | Explorar y filtrar todas las habilidades disponibles por palabra clave o categoría                           |
| `npx dev-marketplace add <nombre...>`           | Copiar habilidades específicas a tu proyecto actual (`.agents/skills`, `.claude/skills`, o `.gemini/skills`) |
| `npx dev-marketplace add --all`                 | Instalar todas las 133+ habilidades del marketplace de una vez                                               |
| `npx dev-marketplace add --category "<nombre>"` | Instalar todas las habilidades de una categoría específica                                                   |
| `npx dev-marketplace info <nombre>`             | Inspeccionar descripción completa, frontmatter y contenido de archivos                                       |
| `npx dev-marketplace categories`                | Listar todas las categorías del marketplace y sus conteos                                                    |

---

## Catálogo del Marketplace (133 Habilidades y Conectores)

### Revisión de Código y Calidad (14 habilidades)

| Habilidad                        | Descripción                                                                                                                       | Instalación                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `claude-security`                | Poner un equipo de agentes a trabajar como investigadores de seguridad                                                            | `npx dev-marketplace add claude-security`                |
| `pr-review-toolkit`              | Colección completa de agentes especializados para revisión exhaustiva de PR                                                       | `npx dev-marketplace add pr-review-toolkit`              |
| `qc-skill`                       | Control de calidad determinista / validación de medios                                                                            | `npx dev-marketplace add qc-skill`                       |
| `receiving-code-review`          | Usar al recibir retroalimentación de revisión de código                                                                           | `npx dev-marketplace add receiving-code-review`          |
| `requesting-code-review`         | Usar al completar tareas, antes de fusionar                                                                                       | `npx dev-marketplace add requesting-code-review`         |
| `security`                       | Revisar código para problemas de seguridad                                                                                        | `npx dev-marketplace add security`                       |
| `security-and-hardening`         | Endurece código contra vulnerabilidades                                                                                           | `npx dev-marketplace add security-and-hardening`         |
| `systematic-debugging`           | Usar al encontrar cualquier error o fallo de prueba                                                                               | `npx dev-marketplace add systematic-debugging`           |
| `test-driven-development`        | Usar al implementar cualquier característica o corrección                                                                         | `npx dev-marketplace add test-driven-development`        |
| `verification-before-completion` | Usar antes de reclamar que el trabajo está completo                                                                               | `npx dev-marketplace add verification-before-completion` |
| `leak-spots`                     | Detectar secretos filtrados en historial Git usando Periderm CLI                                                                  | `npx dev-marketplace add leak-spots`                     |
| `branch-sec`                     | Forzar protección de ramas, commits firmados, checks Periderm                                                                     | `npx dev-marketplace add branch-sec`                     |
| `cyber-sec`                      | Kit de ciberseguridad: modelado de amenazas, OWASP, auditoría cripto                                                              | `npx dev-marketplace add cyber-sec`                      |
| `repo-sec`                       | Endurecimiento de seguridad de repositorio: commits firmados, protección de ramas, escaneo de secretos, auditoría de dependencias | `npx dev-marketplace add repo-sec`                       |

### Conectores y LSP (15 habilidades)

| Habilidad           | Descripción                                                     | Instalación                                 |
| ------------------- | --------------------------------------------------------------- | ------------------------------------------- |
| `clangd-lsp`        | Servidor de lenguaje C/C++ (clangd) para Claude Code            | `npx dev-marketplace add clangd-lsp`        |
| `context7-mcp`      | Referencias de API de librerías/frameworks y ejemplos de código | `npx dev-marketplace add context7-mcp`      |
| `csharp-lsp`        | Servidor de lenguaje C# para Claude Code                        | `npx dev-marketplace add csharp-lsp`        |
| `gopls-lsp`         | Servidor de lenguaje Go para Claude Code                        | `npx dev-marketplace add gopls-lsp`         |
| `jdtls-lsp`         | Servidor de lenguaje Java (Eclipse JDT.LS) para Claude Code     | `npx dev-marketplace add jdtls-lsp`         |
| `kotlin-lsp`        | Servidor de lenguaje Kotlin para Claude Code                    | `npx dev-marketplace add kotlin-lsp`        |
| `lua-lsp`           | Servidor de lenguaje Lua para Claude Code                       | `npx dev-marketplace add lua-lsp`           |
| `mcp-server-dev`    | Habilidades para diseñar y construir servidores MCP             | `npx dev-marketplace add mcp-server-dev`    |
| `mcp-tunnels`       | Conectar Claude a un servidor MCP en tu red privada             | `npx dev-marketplace add mcp-tunnels`       |
| `php-lsp`           | Servidor de lenguaje PHP (Intelephense) para Claude Code        | `npx dev-marketplace add php-lsp`           |
| `pyright-lsp`       | Servidor de lenguaje Python (Pyright) para Claude Code          | `npx dev-marketplace add pyright-lsp`       |
| `ruby-lsp`          | Servidor de lenguaje Ruby para Claude Code                      | `npx dev-marketplace add ruby-lsp`          |
| `rust-analyzer-lsp` | Servidor de lenguaje Rust para Claude Code                      | `npx dev-marketplace add rust-analyzer-lsp` |
| `swift-lsp`         | Servidor de lenguaje Swift (SourceKit-LSP) para Claude Code     | `npx dev-marketplace add swift-lsp`         |
| `typescript-lsp`    | Servidor de lenguaje TypeScript/JavaScript para Claude Code     | `npx dev-marketplace add typescript-lsp`    |

### Diseño y UI (14 habilidades)

| Habilidad             | Descripción                                                                 | Instalación                                   |
| --------------------- | --------------------------------------------------------------------------- | --------------------------------------------- |
| `apple-design`        | Enfoque de Apple para diseño de interfaz y movimiento fluido                | `npx dev-marketplace add apple-design`        |
| `break-ui`            | Probar UI con datos de peor caso                                            | `npx dev-marketplace add break-ui`            |
| `design-mobile-apps`  | Diseñar pantallas de apps móviles con Sleek                                 | `npx dev-marketplace add design-mobile-apps`  |
| `emil-design-eng`     | Filosofía de ingeniería de diseño de Emil Kowalski                          | `npx dev-marketplace add emil-design-eng`     |
| `figma`               | Traer Figma a video HyperFrames                                             | `npx dev-marketplace add figma`               |
| `figma-designer`      | Diseñar en Figma con variables reales y auto layout                         | `npx dev-marketplace add figma-designer`      |
| `firecrawl-build`     | Integración Firecrawl para datos web                                        | `npx dev-marketplace add firecrawl-build`     |
| `gestures`            | Construir interacciones drag, swipe y sheet                                 | `npx dev-marketplace add gestures`            |
| `impeccable`          | Diseñar, criticar, auditar, pulir interfaces frontend                       | `npx dev-marketplace add impeccable`          |
| `improve`             | Inspeccionar codebase como asesor senior, producir planes de implementación | `npx dev-marketplace add improve`             |
| `landing-page-design` | Sistema completo para landing pages de alta conversión                      | `npx dev-marketplace add landing-page-design` |
| `learn-taste`         | Convertir correcciones de diseño en reglas en DESIGN.md                     | `npx dev-marketplace add learn-taste`         |
| `pick-ui-library`     | Elegir la librería correcta para tareas frontend                            | `npx dev-marketplace add pick-ui-library`     |
| `prototype`           | Construir múltiples versiones de UI detrás de un selector visual            | `npx dev-marketplace add prototype`           |

### Herramientas de Desarrollo e IA (27 habilidades)

| Habilidad                        | Descripción                                                       | Instalación                                              |
| -------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| `artifacts-skill`                | Ejecución y verificación local-first para artefactos reales       | `npx dev-marketplace add artifacts-skill`                |
| `ask-emil`                       | Router sobre las habilidades en este repo                         | `npx dev-marketplace add ask-emil`                       |
| `ask-sonner`                     | Guía de Sonner, la librería React toast                           | `npx dev-marketplace add ask-sonner`                     |
| `brainstorming`                  | Usar antes de cualquier trabajo creativo                          | `npx dev-marketplace add brainstorming`                  |
| `caveman`                        | Modo voz cavernícola conciso                                      | `npx dev-marketplace add caveman`                        |
| `choreograph`                    | Coordinar elementos que animan juntos                             | `npx dev-marketplace add choreograph`                    |
| `claude-md-management`           | Herramientas para mantener y mejorar archivos CLAUDE.md           | `npx dev-marketplace add claude-md-management`           |
| `color-grading`                  | Corrección/grading de color determinista                          | `npx dev-marketplace add color-grading`                  |
| `feature-dev`                    | Flujo de trabajo completo de desarrollo de características        | `npx dev-marketplace add feature-dev`                    |
| `find-skills`                    | Descubrir e instalar habilidades de agentes                       | `npx dev-marketplace add find-skills`                    |
| `finishing-a-development-branch` | Decidir cómo integrar trabajo completado                          | `npx dev-marketplace add finishing-a-development-branch` |
| `html-demo`                      | Mostrar app funcionando en página web via simulación HTML         | `npx dev-marketplace add html-demo`                      |
| `imagemagick-skill`              | Edición de imágenes local con ImageMagick                         | `npx dev-marketplace add imagemagick-skill`              |
| `ingest-skill`                   | Descargar tarjetas de cámara y grabadoras de forma segura         | `npx dev-marketplace add ingest-skill`                   |
| `mobile-native`                  | Hacer que app web se sienta nativa en móvil                       | `npx dev-marketplace add mobile-native`                  |
| `product-demo`                   | Grabar videos demo de producto pulidos                            | `npx dev-marketplace add product-demo`                   |
| `product-film`                   | Hacer cortometrajes de producto                                   | `npx dev-marketplace add product-film`                   |
| `publish-skill`                  | Subir entregables terminados a plataformas                        | `npx dev-marketplace add publish-skill`                  |
| `reverse-engineer-anything`      | Ingeniería inversa de native, managed, Electron, firmware         | `npx dev-marketplace add reverse-engineer-anything`      |
| `skillpact`                      | Escribir y verificar contratos SkillPact                          | `npx dev-marketplace add skillpact`                      |
| `slide-sync-skill`               | Encontrar cambios de diapositivas en grabaciones, crear capítulos | `npx dev-marketplace add slide-sync-skill`               |
| `stepcap`                        | Trabajar con carpetas de grabación stepcap                        | `npx dev-marketplace add stepcap`                        |
| `style-sampling`                 | Hacer nuevos episodios en estilos de video probados               | `npx dev-marketplace add style-sampling`                 |
| `transcription-skill`            | Transcribir voz en archivos audio/video                           | `npx dev-marketplace add transcription-skill`            |
| `website-scroll`                 | Grabar scroll de arriba a abajo de cualquier página web           | `npx dev-marketplace add website-scroll`                 |
| `write-swift`                    | Cómo escribir Swift moderno bien                                  | `npx dev-marketplace add write-swift`                    |
| `writing-skills`                 | Crear, editar, verificar habilidades antes de despliegue          | `npx dev-marketplace add writing-skills`                 |

### Ingeniería y Flujo de Trabajo (15 habilidades)

| Habilidad                     | Descripción                                                                                   | Instalación                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `code-modernization`          | Modernizar codebases legacy con prueba                                                        | `npx dev-marketplace add code-modernization`          |
| `commit-commands`             | Optimizar flujo de trabajo git                                                                | `npx dev-marketplace add commit-commands`             |
| `diagnosing-superpowers`      | Diagnosticar por qué una sesión superpowers falló                                             | `npx dev-marketplace add diagnosing-superpowers`      |
| `dispatching-parallel-agents` | Ejecutar 2+ tareas independientes en paralelo                                                 | `npx dev-marketplace add dispatching-parallel-agents` |
| `executing-plans`             | Ejecutar planes de implementación inline                                                      | `npx dev-marketplace add executing-plans`             |
| `hookify`                     | Crear hooks personalizados para prevenir comportamientos no deseados                          | `npx dev-marketplace add hookify`                     |
| `ralph-loop`                  | Técnica Ralph Wiggum para desarrollo AI iterativo                                             | `npx dev-marketplace add ralph-loop`                  |
| `session-report`              | Conector y herramientas para session-report                                                   | `npx dev-marketplace add session-report`              |
| `subagent-driven-development` | Ejecutar planes de implementación con tareas independientes                                   | `npx dev-marketplace add subagent-driven-development` |
| `using-git-worktrees`         | Iniciar trabajo de característica con aislamiento                                             | `npx dev-marketplace add using-git-worktrees`         |
| `using-superpowers`           | Establecer cómo encontrar y usar habilidades                                                  | `npx dev-marketplace add using-superpowers`           |
| `writing-plans`               | Escribir planes antes de tocar código                                                         | `npx dev-marketplace add writing-plans`               |
| `launch-ready`                | Verificación pre-lanzamiento con escaneo y revisión Periderm CLI                              | `npx dev-marketplace add launch-ready`                |
| `commit-hook`                 | Git hooks con integración Periderm CLI                                                        | `npx dev-marketplace add commit-hook`                 |
| `ci-cd`                       | Analizador/generador de pipelines CI/CD: GitHub Actions, GitLab CI, CircleCI, Azure Pipelines | `npx dev-marketplace add ci-cd`                       |

### Video y Movimiento (48 habilidades)

| Habilidad                      | Descripción                                                    | Instalación                                            |
| ------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------ |
| `animate`                      | Construir animaciones desde cero                               | `npx dev-marketplace add animate`                      |
| `animate-expo`                 | Construir animaciones en React Native y Expo                   | `npx dev-marketplace add animate-expo`                 |
| `animation-performance`        | Mantener animaciones web dentro del presupuesto de frames      | `npx dev-marketplace add animation-performance`        |
| `animation-vocabulary`         | Glosario inverso para efectos de movimiento                    | `npx dev-marketplace add animation-vocabulary`         |
| `audio-production`             | Ejecución determinista de producción de audio                  | `npx dev-marketplace add audio-production`             |
| `blender-skill`                | Inspeccionar, convertir, optimizar, renderizar assets 3D       | `npx dev-marketplace add blender-skill`                |
| `diagram-animation`            | Animar diagramas, flowcharts, charts                           | `npx dev-marketplace add diagram-animation`            |
| `dubbing`                      | Hablar texto con TTS local, poner en video                     | `npx dev-marketplace add dubbing`                      |
| `explainer-video`              | Hacer videos explicativos                                      | `npx dev-marketplace add explainer-video`              |
| `ffmpeg-skill`                 | Editar video/audio con FFmpeg local                            | `npx dev-marketplace add ffmpeg-skill`                 |
| `find-animation-opportunities` | Buscar lugares que deberían animar                             | `npx dev-marketplace add find-animation-opportunities` |
| `hyperframes`                  | Hacer, editar, animar o renderizar video con HyperFrames       | `npx dev-marketplace add hyperframes`                  |
| `hyperframes-cli`              | HyperFrames CLI - scaffold, check, edit, render                | `npx dev-marketplace add hyperframes-cli`              |
| `hyperframes-registry`         | 450+ bloques HyperFrames listos                                | `npx dev-marketplace add hyperframes-registry`         |
| `hyperframes-skill`            | Renderizar video desde escenas HTML con HyperFrames            | `npx dev-marketplace add hyperframes-skill`            |
| `improve-animations`           | Auditar código de movimiento, producir planes de mejora        | `npx dev-marketplace add improve-animations`           |
| `isometric-animation`          | Hacer animaciones isométricas                                  | `npx dev-marketplace add isometric-animation`          |
| `media-analysis`               | Medir hechos deterministas sobre archivos multimedia           | `npx dev-marketplace add media-analysis`               |
| `media-use`                    | Obtener o crear media para videos HyperFrames                  | `npx dev-marketplace add media-use`                    |
| `motion-graphics`              | Renderizado determinista de motion graphics                    | `npx dev-marketplace add motion-graphics`              |
| `nle-bridge-skill`             | Pasar ediciones a Premiere Pro o DaVinci Resolve               | `npx dev-marketplace add nle-bridge-skill`             |
| `remotion-best-practices`      | Router para todas las habilidades Remotion                     | `npx dev-marketplace add remotion-best-practices`      |
| `remotion-captions`            | Transcripción, visualización, animación de subtítulos          | `npx dev-marketplace add remotion-captions`            |
| `remotion-create`              | Crear un nuevo video Remotion                                  | `npx dev-marketplace add remotion-create`              |
| `remotion-docs`                | Buscar documentación Remotion                                  | `npx dev-marketplace add remotion-docs`                |
| `remotion-ffmpeg-skill`        | Motion graphics en footage real con Remotion                   | `npx dev-marketplace add remotion-ffmpeg-skill`        |
| `remotion-interactivity`       | Estructurar markup Remotion para edición en Studio             | `npx dev-marketplace add remotion-interactivity`       |
| `remotion-license`             | Encontrar información de licencia Remotion                     | `npx dev-marketplace add remotion-license`             |
| `remotion-maps`                | Conocimiento de animación Remotion Map                         | `npx dev-marketplace add remotion-maps`                |
| `remotion-markup`              | Mejores prácticas de contenido, animación y efectos            | `npx dev-marketplace add remotion-markup`              |
| `remotion-multimedia`          | Interactuar con Mediabunny                                     | `npx dev-marketplace add remotion-multimedia`          |
| `remotion-render`              | Exportar video Remotion, imagen fija, o timeline OTIO          | `npx dev-marketplace add remotion-render`              |
| `remotion-saas`                | Construir una app con Remotion                                 | `npx dev-marketplace add remotion-saas`                |
| `remotion-studio`              | Previsualizar un video Remotion                                | `npx dev-marketplace add remotion-studio`              |
| `remotion-to-hyperframes`      | Traer código de video existente a HyperFrames                  | `npx dev-marketplace add remotion-to-hyperframes`      |
| `remotion-upgrade`             | Actualizar Remotion y paquetes relacionados                    | `npx dev-marketplace add remotion-upgrade`             |
| `remove-animations`            | Encontrar y eliminar animaciones innecesarias                  | `npx dev-marketplace add remove-animations`            |
| `reverse-any-video`            | Reconstruir cualquier video como proyecto HyperFrames editable | `npx dev-marketplace add reverse-any-video`            |
| `review-animations`            | Revisar código de animación y movimiento                       | `npx dev-marketplace add review-animations`            |
| `slideshow`                    | Construir slideshow HyperFrames para presentar en vivo         | `npx dev-marketplace add slideshow`                    |
| `sound-design-skill`           | Camas de música y efectos de sonido para video                 | `npx dev-marketplace add sound-design-skill`           |
| `subtitle-skill`               | Validación determinista de subtítulos, generación SRT/VTT      | `npx dev-marketplace add subtitle-skill`               |
| `thumbnail-skill`              | Renderizado determinista de thumbnails                         | `npx dev-marketplace add thumbnail-skill`              |
| `video-editing-skill`          | Edición de video determinista                                  | `npx dev-marketplace add video-editing-skill`          |
| `video-production-agent`       | Planificar y producir video desde archivos fuente              | `npx dev-marketplace add video-production-agent`       |
| `voice-enhance-skill`          | Limpiar voz grabada con engines locales                        | `npx dev-marketplace add voice-enhance-skill`          |
| `whiteboard-animation`         | Hacer animaciones de pizarra                                   | `npx dev-marketplace add whiteboard-animation`         |
| `wrapped-video`                | Hacer videos estilo Spotify Wrapped                            | `npx dev-marketplace add wrapped-video`                |

---

## Estructura del Repositorio

```text
dev-marketplace/
├── bin/
│   └── cli.js            # Ejecutor standalone zero-dependency npx
├── skills/               # Paquetes de habilidades estandarizados
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
├── registry.json         # Índice machine-readable buscable
└── package.json          # Definición npm bin
```

---

## Código Abierto y Licencias

Todas las habilidades y conectores incluidos en este registro son de código abierto y libremente redistribuibles bajo sus respectivas licencias de código abierto (MIT, Apache-2.0, o compatibles).

¡Contribuciones, nuevas habilidades de agentes y conectores de la comunidad son bienvenidos via Pull Requests!

---

## Traducciones

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
