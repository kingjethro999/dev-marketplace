# Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-131%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Un mercado de desarrolladores abierto con **131+ skills curados y probados en batalla para agentes de IA, conectores de servidor de lenguaje (LSP), motores de diseño, verificadores de calidad de código y toolkits de síntesis de video**.

Compatible con **Claude Code**, **Cursor**, **Antigravity (`agy`)**, **Codex**, y cualquier plataforma de agentes que siga la especificación estándar `SKILL.md`.

---

## ⚡ Inicio Rápido

Instala cualquier skill directamente en tu proyecto:

```bash
# Usando el runner integrado del marketplace:
npx dev-marketplace add <skill-name>

# O usando el estándar abierto skills.sh:
npx skills add kingjethro999/dev-marketplace --skill <skill-name>
```

### Ejemplos de Instalación

```bash
# Instalar guías de diseño de interfaz de Apple
npx dev-marketplace add apple-design

# Instalar toolkit de revisión de código y TDD
npx dev-marketplace add code-review test-driven-development systematic-debugging

# Instalar todos los skills de Video & Motion
npx dev-marketplace add --category "Video & Motion"

# Instalar todos los conectores LSP (TypeScript, Python, Rust, Go, C++, Swift...)
npx dev-marketplace add --category "Connectors & LSP"

# Sincronizar todo el marketplace a tu proyecto:
npx dev-marketplace add --all

# O instalar globalmente en tu directorio de agentes (~/.agents/skills):
npx dev-marketplace add --all --global
```

---

## 💻 Comandos CLI

| Comando | Descripción |
|---|---|
| `npx dev-marketplace list` | Navegar y filtrar todos los skills disponibles |
| `npx dev-marketplace add <name...>` | Instalar skill(s) especificados en tu proyecto |
| `npx dev-marketplace add --all` | Instalar todos los 131+ skills de una vez |
| `npx dev-marketplace add --category "<name>"` | Instalar todos los skills de una categoría |
| `npx dev-marketplace info <name>` | Ver descripción completa y archivos del skill |
| `npx dev-marketplace categories` | Listar todas las categorías y conteos |

---

## 📚 Catálogo del Marketplace (131 Skills y Conectores)

### 🧪 Code Review & Quality (15 skills)

| Skill | Descripción | Instalar |
|---|---|---|
| `claude-security` | Equipo de agentes como investigadores de seguridad | `npx dev-marketplace add claude-security` |
| `pr-review-toolkit` | Agentes especializados para revisión exhaustiva de PRs | `npx dev-marketplace add pr-review-toolkit` |
| `qc-skill` | Control de calidad determinista para medios | `npx dev-marketplace add qc-skill` |
| `leak-spots` | Detectar secretos filtrados en historial Git con Periderm CLI | `npx dev-marketplace add leak-spots` |
| `launch-ready` | Verificación pre-lanzamiento con Periderm CLI | `npx dev-marketplace add launch-ready` |
| `branch-sec` | Protección de ramas, commits firmados, checks de Periderm | `npx dev-marketplace add branch-sec` |
| `cyber-sec` | Toolkit de ciberseguridad: threat modeling, OWASP, auditoría crypto | `npx dev-marketplace add cyber-sec` |
| `commit-hook` | Git hooks con integración Periderm CLI | `npx dev-marketplace add commit-hook` |

### 🔌 Connectors & LSP (15 skills)

| Skill | Descripción | Instalar |
|---|---|---|
| `clangd-lsp` | Servidor de lenguaje C/C++ (clangd) para Claude Code | `npx dev-marketplace add clangd-lsp` |
| `context7-mcp` | Referencias de API de librerías/frameworks y ejemplos | `npx dev-marketplace add context7-mcp` |
| `csharp-lsp` | Servidor de lenguaje C# para Claude Code | `npx dev-marketplace add csharp-lsp` |
| `gopls-lsp` | Servidor de lenguaje Go para Claude Code | `npx dev-marketplace add gopls-lsp` |
| `jdtls-lsp` | Servidor de lenguaje Java (Eclipse JDT.LS) para Claude Code | `npx dev-marketplace add jdtls-lsp` |
| `kotlin-lsp` | Servidor de lenguaje Kotlin para Claude Code | `npx dev-marketplace add kotlin-lsp` |
| `lua-lsp` | Servidor de lenguaje Lua para Claude Code | `npx dev-marketplace add lua-lsp` |
| `mcp-server-dev` | Skills para diseñar y construir servidores MCP | `npx dev-marketplace add mcp-server-dev` |
| `mcp-tunnels` | Conectar Claude a servidor MCP en red privada | `npx dev-marketplace add mcp-tunnels` |
| `php-lsp` | Servidor de lenguaje PHP (Intelephense) para Claude Code | `npx dev-marketplace add php-lsp` |
| `pyright-lsp` | Servidor de lenguaje Python (Pyright) para Claude Code | `npx dev-marketplace add pyright-lsp` |
| `ruby-lsp` | Servidor de lenguaje Ruby para Claude Code | `npx dev-marketplace add ruby-lsp` |
| `rust-analyzer-lsp` | Servidor de lenguaje Rust para Claude Code | `npx dev-marketplace add rust-analyzer-lsp` |
| `swift-lsp` | Servidor de lenguaje Swift (SourceKit-LSP) para Claude Code | `npx dev-marketplace add swift-lsp` |
| `typescript-lsp` | Servidor de lenguaje TypeScript/JavaScript para Claude Code | `npx dev-marketplace add typescript-lsp` |

### 🎨 Design & UI (14 skills)

| Skill | Descripción | Instalar |
|---|---|---|
| `apple-design` | Enfoque de Apple para diseño de interfaz y movimiento fluido | `npx dev-marketplace add apple-design` |
| `break-ui` | Stress-test de UI con datos edge-case | `npx dev-marketplace add break-ui` |
| `design-mobile-apps` | Diseñar pantallas de apps móviles con Sleek | `npx dev-marketplace add design-mobile-apps` |
| `emil-design-eng` | Filosofía design-engineering de Emil Kowalski | `npx dev-marketplace add emil-design-eng` |
| `figma` | Traer Figma a video HyperFrames | `npx dev-marketplace add figma` |
| `figma-designer` | Diseñar en Figma con variables reales y auto layout | `npx dev-marketplace add figma-designer` |
| `gestures` | Construir interacciones drag, swipe, sheet | `npx dev-marketplace add gestures` |
| `impeccable` | Diseñar, criticar, auditar, pulir interfaces frontend | `npx dev-marketplace add impeccable` |
| `improve` | Auditar codebase como advisor senior, producir planes | `npx dev-marketplace add improve` |
| `landing-page-design` | Sistema completo para landing pages de alta conversión | `npx dev-marketplace add landing-page-design` |
| `learn-taste` | Convertir correcciones de diseño en reglas en DESIGN.md | `npx dev-marketplace add learn-taste` |
| `pick-ui-library` | Elegir la librería correcta para tareas frontend | `npx dev-marketplace add pick-ui-library` |
| `prototype` | Construir múltiples versiones de UI detrás de un picker visual | `npx dev-marketplace add prototype` |

### 🛠️ Developer Tools & AI (27 skills)

| Skill | Descripción | Instalar |
|---|---|---|
| `artifacts-skill` | Ejecución y verificación local-first para artefactos reales | `npx dev-marketplace add artifacts-skill` |
| `ask-emil` | Router sobre los skills en este repo | `npx dev-marketplace add ask-emil` |
| `ask-sonner` | Guía de Sonner, la librería React toast | `npx dev-marketplace add ask-sonner` |
| `brainstorming` | Usar antes de cualquier trabajo creativo | `npx dev-marketplace add brainstorming` |
| `caveman` | Modo voz cavernícola concisa | `npx dev-marketplace add caveman` |
| `choreograph` | Coordinar elementos que animan juntos | `npx dev-marketplace add choreograph` |
| `claude-md-management` | Herramientas para mantener y mejorar CLAUDE.md | `npx dev-marketplace add claude-md-management` |
| `color-grading` | Color grading/corrección determinista | `npx dev-marketplace add color-grading` |
| `feature-dev` | Workflow comprehensivo de desarrollo de features | `npx dev-marketplace add feature-dev` |
| `find-skills` | Descubrir e instalar skills de agentes | `npx dev-marketplace add find-skills` |
| `html-demo` | Mostrar app funcionando en página web via simulación HTML | `npx dev-marketplace add html-demo` |
| `imagemagick-skill` | Edición de imágenes local con ImageMagick | `npx dev-marketplace add imagemagick-skill` |
| `ingest-skill` | Descargar tarjetas de cámara y grabadoras de forma segura | `npx dev-marketplace add ingest-skill` |
| `mobile-native` | Hacer que web app se sienta nativa en móvil | `npx dev-marketplace add mobile-native` |
| `product-demo` | Grabar demos de producto pulidos | `npx dev-marketplace add product-demo` |
| `product-film` | Hacer cortometrajes de producto | `npx dev-marketplace add product-film` |
| `publish-skill` | Subir deliverables terminados a plataformas | `npx dev-marketplace add publish-skill` |
| `reverse-engineer-anything` | Reverse engineering de native, managed, Electron, firmware | `npx dev-marketplace add reverse-engineer-anything` |
| `skillpact` | Escribir y verificar contratos SkillPact | `npx dev-marketplace add skillpact` |
| `slide-sync-skill` | Encontrar cambios de slides en grabaciones, crear capítulos | `npx dev-marketplace add slide-sync-skill` |
| `stepcap` | Trabajar con carpetas de grabación stepcap | `npx dev-marketplace add stepcap` |
| `style-sampling` | Hacer nuevos episodios en estilos de video probados | `npx dev-marketplace add style-sampling` |
| `transcription-skill` | Transcribir voz en archivos audio/video | `npx dev-marketplace add transcription-skill` |
| `website-scroll` | Grabar scroll top-to-bottom de cualquier página web | `npx dev-marketplace add website-scroll` |
| `write-swift` | Cómo escribir Swift moderno correctamente | `npx dev-marketplace add write-swift` |
| `writing-skills` | Crear, editar, verificar skills antes de deploy | `npx dev-marketplace add writing-skills` |

### ⚙️ Engineering & Workflow (17 skills)

| Skill | Descripción | Instalar |
|---|---|---|
| `code-modernization` | Modernizar codebases legacy con prueba | `npx dev-marketplace add code-modernization` |
| `commit-commands` | Optimizar workflow de git | `npx dev-marketplace add commit-commands` |
| `diagnosing-superpowers` | Diagnosticar por qué una sesión superpowers falló | `npx dev-marketplace add diagnosing-superpowers` |
| `dispatching-parallel-agents` | Ejecutar 2+ tareas independientes en paralelo | `npx dev-marketplace add dispatching-parallel-agents` |
| `executing-plans` | Ejecutar planes de implementación inline | `npx dev-marketplace add executing-plans` |
| `hookify` | Crear hooks personalizados para prevenir comportamientos no deseados | `npx dev-marketplace add hookify` |
| `ralph-loop` | Técnica Ralph Wiggum para desarrollo AI iterativo | `npx dev-marketplace add ralph-loop` |
| `subagent-driven-development` | Ejecutar planes con tareas independientes | `npx dev-marketplace add subagent-driven-development` |
| `using-git-worktrees` | Iniciar trabajo de feature con aislamiento | `npx dev-marketplace add using-git-worktrees` |
| `using-superpowers` | Establecer cómo encontrar y usar skills | `npx dev-marketplace add using-superpowers` |
| `writing-plans` | Escribir planes antes de tocar código | `npx dev-marketplace add writing-plans` |

### 🎬 Video & Motion (48 skills)

| Skill | Descripción | Instalar |
|---|---|---|
| `animate` | Construir animaciones desde cero | `npx dev-marketplace add animate` |
| `animate-expo` | Construir animaciones en React Native y Expo | `npx dev-marketplace add animate-expo` |
| `animation-performance` | Mantener animaciones web dentro del frame budget | `npx dev-marketplace add animation-performance` |
| `animation-vocabulary` | Glosario reverse-lookup para efectos de movimiento | `npx dev-marketplace add animation-vocabulary` |
| `audio-production` | Ejecución determinista de producción de audio | `npx dev-marketplace add audio-production` |
| `blender-skill` | Inspeccionar, convertir, optimizar, renderizar assets 3D | `npx dev-marketplace add blender-skill` |
| `diagram-animation` | Animar diagramas, flowcharts, charts | `npx dev-marketplace add diagram-animation` |
| `dubbing` | Hablar texto con TTS local, poner en video | `npx dev-marketplace add dubbing` |
| `explainer-video` | Hacer videos explicativos | `npx dev-marketplace add explainer-video` |
| `ffmpeg-skill` | Editar video/audio con FFmpeg local | `npx dev-marketplace add ffmpeg-skill` |
| `find-animation-opportunities` | Buscar lugares que deberían animar | `npx dev-marketplace add find-animation-opportunities` |
| `hyperframes` | Hacer, editar, animar o renderizar video con HyperFrames | `npx dev-marketplace add hyperframes` |
| `hyperframes-cli` | HyperFrames CLI - scaffold, check, edit, render | `npx dev-marketplace add hyperframes-cli` |
| `hyperframes-registry` | 450+ bloques HyperFrames listos para usar | `npx dev-marketplace add hyperframes-registry` |
| `hyperframes-skill` | Renderizar video desde escenas HTML con HyperFrames | `npx dev-marketplace add hyperframes-skill` |
| `improve-animations` | Auditar código de movimiento, producir planes de mejora | `npx dev-marketplace add improve-animations` |
| `isometric-animation` | Hacer animaciones isométricas | `npx dev-marketplace add isometric-animation` |
| `media-analysis` | Medir hechos deterministas sobre archivos multimedia | `npx dev-marketplace add media-analysis` |
| `media-use` | Obtener o crear media para videos HyperFrames | `npx dev-marketplace add media-use` |
| `motion-graphics` | Renderizado determinista de motion-graphics | `npx dev-marketplace add motion-graphics` |
| `nle-bridge-skill` | Pasar ediciones a Premiere Pro o DaVinci Resolve | `npx dev-marketplace add nle-bridge-skill` |
| `remotion-best-practices` | Router para todos los skills de Remotion | `npx dev-marketplace add remotion-best-practices` |
| `remotion-captions` | Transcribir, mostrar, animar captions | `npx dev-marketplace add remotion-captions` |
| `remotion-create` | Crear nuevo video Remotion | `npx dev-marketplace add remotion-create` |
| `remotion-docs` | Buscar documentación de Remotion | `npx dev-marketplace add remotion-docs` |
| `remotion-ffmpeg-skill` | Motion graphics en footage real con Remotion | `npx dev-marketplace add remotion-ffmpeg-skill` |
| `remotion-interactivity` | Estructurar markup Remotion para edición en Studio | `npx dev-marketplace add remotion-interactivity` |
| `remotion-license` | Encontrar info de licencia Remotion | `npx dev-marketplace add remotion-license` |
| `remotion-markup` | Mejores prácticas de contenido, animación y efectos | `npx dev-marketplace add remotion-markup` |
| `remotion-render` | Exportar video Remotion, imagen still, o timeline OTIO | `npx dev-marketplace add remotion-render` |
| `remotion-saas` | Construir una app con Remotion | `npx dev-marketplace add remotion-saas` |
| `remotion-studio` | Previsualizar un video Remotion | `npx dev-marketplace add remotion-studio` |
| `remotion-to-hyperframes` | Traer código de video existente a HyperFrames | `npx dev-marketplace add remotion-to-hyperframes` |
| `remotion-upgrade` | Actualizar Remotion y paquetes relacionados | `npx dev-marketplace add remotion-upgrade` |
| `remove-animations` | Encontrar y remover animaciones innecesarias | `npx dev-marketplace add remove-animations` |
| `reverse-any-video` | Reconstruir cualquier video como proyecto HyperFrames editable | `npx dev-marketplace add reverse-any-video` |
| `review-animations` | Revisar código de animación y movimiento | `npx dev-marketplace add review-animations` |
| `slideshow` | Construir slideshow HyperFrames para presentar en vivo | `npx dev-marketplace add slideshow` |
| `sound-design-skill` | Music beds y sound effects para video | `npx dev-marketplace add sound-design-skill` |
| `subtitle-skill` | Validación determinista de subtítulos, generación SRT/VTT | `npx dev-marketplace add subtitle-skill` |
| `thumbnail-skill` | Renderizado determinista de thumbnails | `npx dev-marketplace add thumbnail-skill` |
| `video-editing-skill` | Edición de video determinista | `npx dev-marketplace add video-editing-skill` |
| `video-production-agent` | Planificar y producir video desde archivos fuente | `npx dev-marketplace add video-production-agent` |
| `voice-enhance-skill` | Limpiar voz grabada con engines locales | `npx dev-marketplace add voice-enhance-skill` |
| `whiteboard-animation` | Hacer animaciones estilo whiteboard | `npx dev-marketplace add whiteboard-animation` |
| `wrapped-video` | Hacer videos estilo Spotify Wrapped | `npx dev-marketplace add wrapped-video` |

---

## 🤝 Open Source & Licensing

Todos los skills y conectores incluidos en este registro son open-source y libremente redistribuibles bajo sus respectivas licencias open-source (MIT, Apache-2.0, o compatibles).

¡Contribuciones, nuevos skills de agentes, y conectores comunitarios son bienvenidos via Pull Requests!