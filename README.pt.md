# Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-133%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Compatible with Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-orange?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code)
[![Compatible with Cursor & Antigravity](https://img.shields.io/badge/Agent-Cursor%20%7C%20Antigravity%20%7C%20Codex-purple?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![Vercel Skills Standard](https://img.shields.io/badge/npx%20skills-ready-black?style=flat-square)](https://skills.sh)

Um marketplace open source para desenvolvedores com **133+ skills curadas e testadas em produção, conectores de Language Server (LSP), engines de design, verificadores de qualidade de código e toolkits de síntese de vídeo**.

Compatível com **Claude Code**, **Cursor**, **Antigravity (`agy`)**, **Codex**, e qualquer plataforma de agentes que siga a especificação padrão `SKILL.md`.

---

## Início Rápido

Instale qualquer skill diretamente no seu projeto:

```bash
# Usando o runner integrado do marketplace:
npx dev-marketplace add <skill-name>

# Ou usando o padrão aberto skills.sh:
npx skills add kingjethro999/dev-marketplace --skill <skill-name>
```

### Exemplos de Instalação

```bash
# Instalar guidelines de design de interface da Apple
npx dev-marketplace add apple-design

# Instalar toolkit de code review e test-driven development
npx dev-marketplace add requesting-code-review test-driven-development systematic-debugging

# Instalar todas as skills de Video & Motion
npx dev-marketplace add --category "Video & Motion"

# Instalar todos os conectores LSP (TypeScript, Python, Rust, Go, C++, Swift...)
npx dev-marketplace add --category "Connectors & LSP"

# Sincronizar todo o marketplace ao seu projeto:
npx dev-marketplace add --all

# Ou instalar globalmente no seu diretório de agents (~/.agents/skills):
npx dev-marketplace add --all --global
```

---

## Comandos CLI

| Comando                                       | Descrição                                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npx dev-marketplace list`                    | Navegar e filtrar todas as skills disponíveis por palavra-chave ou categoria                             |
| `npx dev-marketplace add <nome...>`           | Copiar skills específicas para o projeto atual (`.agents/skills`, `.claude/skills`, ou `.gemini/skills`) |
| `npx dev-marketplace add --all`               | Instalar todas as 133+ skills do marketplace de uma vez                                                  |
| `npx dev-marketplace add --category "<nome>"` | Instalar todas as skills de uma categoria específica                                                     |
| `npx dev-marketplace info <nome>`             | Inspecionar descrição completa, frontmatter e conteúdo dos arquivos                                      |
| `npx dev-marketplace categories`              | Listar todas as categorias do marketplace e suas contagens                                               |

---

## Catálogo do Marketplace (133 Skills & Conectores)

### Code Review & Qualidade (14 skills)

| Skill                            | Descrição                                                                                                         | Instalação                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `claude-security`                | Colocar uma equipe de agents para trabalhar como pesquisadores de segurança                                       | `npx dev-marketplace add claude-security`                |
| `pr-review-toolkit`              | Coleção completa de agents especializados para PR review thorough                                                 | `npx dev-marketplace add pr-review-toolkit`              |
| `qc-skill`                       | Controle de qualidade determinístico / validação de mídia                                                         | `npx dev-marketplace add qc-skill`                       |
| `receiving-code-review`          | Usar ao receber feedback de code review                                                                           | `npx dev-marketplace add receiving-code-review`          |
| `requesting-code-review`         | Usar ao completar tarefas, antes de merge                                                                         | `npx dev-marketplace add requesting-code-review`         |
| `security`                       | Revisar código para problemas de segurança                                                                        | `npx dev-marketplace add security`                       |
| `security-and-hardening`         | Endurecer código contra vulnerabilidades                                                                          | `npx dev-marketplace add security-and-hardening`         |
| `systematic-debugging`           | Usar ao encontrar qualquer bug ou falha de teste                                                                  | `npx dev-marketplace add systematic-debugging`           |
| `test-driven-development`        | Usar ao implementar qualquer feature ou bugfix                                                                    | `npx dev-marketplace add test-driven-development`        |
| `verification-before-completion` | Usar antes de reivindicar que o trabalho está completo                                                            | `npx dev-marketplace add verification-before-completion` |
| `leak-spots`                     | Detectar secrets vazados no histórico Git usando Periderm CLI                                                     | `npx dev-marketplace add leak-spots`                     |
| `branch-sec`                     | Forçar proteção de branches, commits assinados, checks Periderm                                                   | `npx dev-marketplace add branch-sec`                     |
| `cyber-sec`                      | Toolkit de cibersegurança: threat modeling, OWASP, crypto audit                                                   | `npx dev-marketplace add cyber-sec`                      |
| `repo-sec`                       | Hardening de segurança de repositório: commits assinados, proteção de branches, secret scanning, dependency audit | `npx dev-marketplace add repo-sec`                       |

### Conectores & LSP (15 skills)

| Skill               | Descrição                                                         | Instalação                                  |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| `clangd-lsp`        | Language Server C/C++ (clangd) para Claude Code                   | `npx dev-marketplace add clangd-lsp`        |
| `context7-mcp`      | Referências de API de bibliotecas/frameworks e exemplos de código | `npx dev-marketplace add context7-mcp`      |
| `csharp-lsp`        | Language Server C# para Claude Code                               | `npx dev-marketplace add csharp-lsp`        |
| `gopls-lsp`         | Language Server Go para Claude Code                               | `npx dev-marketplace add gopls-lsp`         |
| `jdtls-lsp`         | Language Server Java (Eclipse JDT.LS) para Claude Code            | `npx dev-marketplace add jdtls-lsp`         |
| `kotlin-lsp`        | Language Server Kotlin para Claude Code                           | `npx dev-marketplace add kotlin-lsp`        |
| `lua-lsp`           | Language Server Lua para Claude Code                              | `npx dev-marketplace add lua-lsp`           |
| `mcp-server-dev`    | Skills para design e construção de servidores MCP                 | `npx dev-marketplace add mcp-server-dev`    |
| `mcp-tunnels`       | Conectar Claude a um servidor MCP na sua rede privada             | `npx dev-marketplace add mcp-tunnels`       |
| `php-lsp`           | Language Server PHP (Intelephense) para Claude Code               | `npx dev-marketplace add php-lsp`           |
| `pyright-lsp`       | Language Server Python (Pyright) para Claude Code                 | `npx dev-marketplace add pyright-lsp`       |
| `ruby-lsp`          | Language Server Ruby para Claude Code                             | `npx dev-marketplace add ruby-lsp`          |
| `rust-analyzer-lsp` | Language Server Rust para Claude Code                             | `npx dev-marketplace add rust-analyzer-lsp` |
| `swift-lsp`         | Language Server Swift (SourceKit-LSP) para Claude Code            | `npx dev-marketplace add swift-lsp`         |
| `typescript-lsp`    | Language Server TypeScript/JavaScript para Claude Code            | `npx dev-marketplace add typescript-lsp`    |

### Design & UI (14 skills)

| Skill                 | Descrição                                                             | Instalação                                    |
| --------------------- | --------------------------------------------------------------------- | --------------------------------------------- |
| `apple-design`        | Abordagem da Apple para design de interface e motion fluido           | `npx dev-marketplace add apple-design`        |
| `break-ui`            | Stress-test UI com dados de pior caso                                 | `npx dev-marketplace add break-ui`            |
| `design-mobile-apps`  | Design de telas de apps mobile com Sleek                              | `npx dev-marketplace add design-mobile-apps`  |
| `emil-design-eng`     | Filosofia de design-engineering de Emil Kowalski                      | `npx dev-marketplace add emil-design-eng`     |
| `figma`               | Trazer Figma para vídeo HyperFrames                                   | `npx dev-marketplace add figma`               |
| `figma-designer`      | Design no Figma com variáveis reais e auto layout                     | `npx dev-marketplace add figma-designer`      |
| `firecrawl-build`     | Integração Firecrawl para dados web                                   | `npx dev-marketplace add firecrawl-build`     |
| `gestures`            | Construir interações drag, swipe e sheet                              | `npx dev-marketplace add gestures`            |
| `impeccable`          | Design, crítica, auditoria, polimento de interfaces frontend          | `npx dev-marketplace add impeccable`          |
| `improve`             | Survey codebase como advisor sênior, produzir planos de implementação | `npx dev-marketplace add improve`             |
| `landing-page-design` | Sistema completo para landing pages de alta conversão                 | `npx dev-marketplace add landing-page-design` |
| `learn-taste`         | Transformar correções de design em regras no DESIGN.md                | `npx dev-marketplace add learn-taste`         |
| `pick-ui-library`     | Escolher a biblioteca certa para tarefas frontend                     | `npx dev-marketplace add pick-ui-library`     |
| `prototype`           | Construir múltiplas versões de UI atrás de um picker visual           | `npx dev-marketplace add prototype`           |

### Developer Tools & AI (27 skills)

| Skill                            | Descrição                                                    | Instalação                                               |
| -------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| `artifacts-skill`                | Execução e verificação local-first para artefatos reais      | `npx dev-marketplace add artifacts-skill`                |
| `ask-emil`                       | Router sobre as skills neste repo                            | `npx dev-marketplace add ask-emil`                       |
| `ask-sonner`                     | Guia do Sonner, a biblioteca React toast                     | `npx dev-marketplace add ask-sonner`                     |
| `brainstorming`                  | Usar antes de qualquer trabalho criativo                     | `npx dev-marketplace add brainstorming`                  |
| `caveman`                        | Modo voz cavernícola conciso                                 | `npx dev-marketplace add caveman`                        |
| `choreograph`                    | Coordenar elementos que animam juntos                        | `npx dev-marketplace add choreograph`                    |
| `claude-md-management`           | Ferramentas para manter e melhorar arquivos CLAUDE.md        | `npx dev-marketplace add claude-md-management`           |
| `color-grading`                  | Color grading/correção determinística                        | `npx dev-marketplace add color-grading`                  |
| `feature-dev`                    | Workflow abrangente de desenvolvimento de feature            | `npx dev-marketplace add feature-dev`                    |
| `find-skills`                    | Descobrir e instalar skills de agents                        | `npx dev-marketplace add find-skills`                    |
| `finishing-a-development-branch` | Decidir como integrar trabalho completado                    | `npx dev-marketplace add finishing-a-development-branch` |
| `html-demo`                      | Mostrar app funcionando em página web via simulação HTML     | `npx dev-marketplace add html-demo`                      |
| `imagemagick-skill`              | Edição de imagem local com ImageMagick                       | `npx dev-marketplace add imagemagick-skill`              |
| `ingest-skill`                   | Offload de cartões de câmera e recorders com segurança       | `npx dev-marketplace add ingest-skill`                   |
| `mobile-native`                  | Fazer web app sentir nativo no celular                       | `npx dev-marketplace add mobile-native`                  |
| `product-demo`                   | Gravar videos demo de produto polidos                        | `npx dev-marketplace add product-demo`                   |
| `product-film`                   | Fazer curtas-metragens de produto                            | `npx dev-marketplace add product-film`                   |
| `publish-skill`                  | Upload de deliverables finalizados para plataformas          | `npx dev-marketplace add publish-skill`                  |
| `reverse-engineer-anything`      | Reverse engineer native, managed, Electron, firmware targets | `npx dev-marketplace add reverse-engineer-anything`      |
| `skillpact`                      | Escrever e verificar contratos SkillPact                     | `npx dev-marketplace add skillpact`                      |
| `slide-sync-skill`               | Encontrar mudanças de slides em gravações, criar capítulos   | `npx dev-marketplace add slide-sync-skill`               |
| `stepcap`                        | Trabalhar com pastas de gravação stepcap                     | `npx dev-marketplace add stepcap`                        |
| `style-sampling`                 | Fazer novos episódios em estilos de vídeo comprovados        | `npx dev-marketplace add style-sampling`                 |
| `transcription-skill`            | Transcrever fala em arquivos audio/video                     | `npx dev-marketplace add transcription-skill`            |
| `website-scroll`                 | Gravar scroll top-to-bottom de qualquer página web           | `npx dev-marketplace add website-scroll`                 |
| `write-swift`                    | Como escrever Swift moderno corretamente                     | `npx dev-marketplace add write-swift`                    |
| `writing-skills`                 | Criar, editar, verificar skills antes do deploy              | `npx dev-marketplace add writing-skills`                 |

### Engineering & Workflow (15 skills)

| Skill                         | Descrição                                                                                  | Instalação                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `code-modernization`          | Modernizar codebases legados com prova                                                     | `npx dev-marketplace add code-modernization`          |
| `commit-commands`             | Simplificar workflow git                                                                   | `npx dev-marketplace add commit-commands`             |
| `diagnosing-superpowers`      | Diagnosticar por que uma sessão superpowers falhou                                         | `npx dev-marketplace add diagnosing-superpowers`      |
| `dispatching-parallel-agents` | Executar 2+ tasks independentes em paralelo                                                | `npx dev-marketplace add dispatching-parallel-agents` |
| `executing-plans`             | Executar planos de implementação inline                                                    | `npx dev-marketplace add executing-plans`             |
| `hookify`                     | Criar hooks customizados para prevenir comportamentos indesejados                          | `npx dev-marketplace add hookify`                     |
| `ralph-loop`                  | Técnica Ralph Wiggum para desenvolvimento AI iterativo                                     | `npx dev-marketplace add ralph-loop`                  |
| `session-report`              | Connector e tooling para session-report                                                    | `npx dev-marketplace add session-report`              |
| `subagent-driven-development` | Executar planos de implementação com tasks independentes                                   | `npx dev-marketplace add subagent-driven-development` |
| `using-git-worktrees`         | Iniciar trabalho de feature com isolamento                                                 | `npx dev-marketplace add using-git-worktrees`         |
| `using-superpowers`           | Estabelecer como encontrar e usar skills                                                   | `npx dev-marketplace add using-superpowers`           |
| `writing-plans`               | Escrever planos antes de tocar código                                                      | `npx dev-marketplace add writing-plans`               |
| `launch-ready`                | Verificação pré-lançamento com scan e review Periderm CLI                                  | `npx dev-marketplace add launch-ready`                |
| `commit-hook`                 | Git hooks com integração Periderm CLI                                                      | `npx dev-marketplace add commit-hook`                 |
| `ci-cd`                       | Analisador/gerador de pipeline CI/CD: GitHub Actions, GitLab CI, CircleCI, Azure Pipelines | `npx dev-marketplace add ci-cd`                       |

### Video & Motion (48 skills)

| Skill                          | Descrição                                                    | Instalação                                             |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------ |
| `animate`                      | Construir animações do zero                                  | `npx dev-marketplace add animate`                      |
| `animate-expo`                 | Construir animações no React Native e Expo                   | `npx dev-marketplace add animate-expo`                 |
| `animation-performance`        | Manter animações web dentro do orçamento de frames           | `npx dev-marketplace add animation-performance`        |
| `animation-vocabulary`         | Glossário reverso para efeitos de motion                     | `npx dev-marketplace add animation-vocabulary`         |
| `audio-production`             | Execução determinística de produção de áudio                 | `npx dev-marketplace add audio-production`             |
| `blender-skill`                | Inspecionar, converter, otimizar, renderizar assets 3D       | `npx dev-marketplace add blender-skill`                |
| `diagram-animation`            | Animar diagramas, flowcharts, charts                         | `npx dev-marketplace add diagram-animation`            |
| `dubbing`                      | Falar texto com TTS local, colocar no vídeo                  | `npx dev-marketplace add dubbing`                      |
| `explainer-video`              | Fazer vídeos explicativos                                    | `npx dev-marketplace add explainer-video`              |
| `ffmpeg-skill`                 | Editar vídeo/áudio com FFmpeg local                          | `npx dev-marketplace add ffmpeg-skill`                 |
| `find-animation-opportunities` | Buscar lugares que deveriam animar                           | `npx dev-marketplace add find-animation-opportunities` |
| `hyperframes`                  | Fazer, editar, animar ou renderizar vídeo com HyperFrames    | `npx dev-marketplace add hyperframes`                  |
| `hyperframes-cli`              | HyperFrames CLI - scaffold, check, edit, render              | `npx dev-marketplace add hyperframes-cli`              |
| `hyperframes-registry`         | 450+ blocos HyperFrames prontos                              | `npx dev-marketplace add hyperframes-registry`         |
| `hyperframes-skill`            | Renderizar vídeo de cenas HTML com HyperFrames               | `npx dev-marketplace add hyperframes-skill`            |
| `improve-animations`           | Auditar código de motion, produzir planos de melhoria        | `npx dev-marketplace add improve-animations`           |
| `isometric-animation`          | Fazer animações isométricas                                  | `npx dev-marketplace add isometric-animation`          |
| `media-analysis`               | Medir fatos determinísticos sobre arquivos de mídia          | `npx dev-marketplace add media-analysis`               |
| `media-use`                    | Obter ou criar mídia para vídeos HyperFrames                 | `npx dev-marketplace add media-use`                    |
| `motion-graphics`              | Renderização determinística de motion graphics               | `npx dev-marketplace add motion-graphics`              |
| `nle-bridge-skill`             | Passar edições para Premiere Pro ou DaVinci Resolve          | `npx dev-marketplace add nle-bridge-skill`             |
| `remotion-best-practices`      | Router para todas as skills Remotion                         | `npx dev-marketplace add remotion-best-practices`      |
| `remotion-captions`            | Transcrição, exibição, animação de legendas                  | `npx dev-marketplace add remotion-captions`            |
| `remotion-create`              | Criar novo vídeo Remotion                                    | `npx dev-marketplace add remotion-create`              |
| `remotion-docs`                | Buscar documentação Remotion                                 | `npx dev-marketplace add remotion-docs`                |
| `remotion-ffmpeg-skill`        | Motion graphics em footage real com Remotion                 | `npx dev-marketplace add remotion-ffmpeg-skill`        |
| `remotion-interactivity`       | Estruturar markup Remotion para edição no Studio             | `npx dev-marketplace add remotion-interactivity`       |
| `remotion-license`             | Encontrar informações de licença Remotion                    | `npx dev-marketplace add remotion-license`             |
| `remotion-maps`                | Conhecimento de animação Remotion Map                        | `npx dev-marketplace add remotion-maps`                |
| `remotion-markup`              | Melhores práticas de conteúdo, animação e efeitos            | `npx dev-marketplace add remotion-markup`              |
| `remotion-multimedia`          | Interagir com Mediabunny                                     | `npx dev-marketplace add remotion-multimedia`          |
| `remotion-render`              | Exportar vídeo Remotion, imagem estática, ou timeline OTIO   | `npx dev-marketplace add remotion-render`              |
| `remotion-saas`                | Construir app com Remotion                                   | `npx dev-marketplace add remotion-saas`                |
| `remotion-studio`              | Preview de vídeo Remotion                                    | `npx dev-marketplace add remotion-studio`              |
| `remotion-to-hyperframes`      | Trazer código de vídeo existente para HyperFrames            | `npx dev-marketplace add remotion-to-hyperframes`      |
| `remotion-upgrade`             | Atualizar Remotion e pacotes relacionados                    | `npx dev-marketplace add remotion-upgrade`             |
| `remove-animations`            | Encontrar e remover animações desnecessárias                 | `npx dev-marketplace add remove-animations`            |
| `reverse-any-video`            | Reconstruir qualquer vídeo como projeto HyperFrames editável | `npx dev-marketplace add reverse-any-video`            |
| `review-animations`            | Revisar código de animação e motion                          | `npx dev-marketplace add review-animations`            |
| `slideshow`                    | Construir slideshow HyperFrames para apresentar ao vivo      | `npx dev-marketplace add slideshow`                    |
| `sound-design-skill`           | Music beds e sound effects para vídeo                        | `npx dev-marketplace add sound-design-skill`           |
| `subtitle-skill`               | Validação determinística de legendas, geração SRT/VTT        | `npx dev-marketplace add subtitle-skill`               |
| `thumbnail-skill`              | Renderização determinística de thumbnails                    | `npx dev-marketplace add thumbnail-skill`              |
| `video-editing-skill`          | Edição de vídeo determinística                               | `npx dev-marketplace add video-editing-skill`          |
| `video-production-agent`       | Planejar e produzir vídeo a partir de arquivos fonte         | `npx dev-marketplace add video-production-agent`       |
| `voice-enhance-skill`          | Limpar voz gravada com engines locais                        | `npx dev-marketplace add voice-enhance-skill`          |
| `whiteboard-animation`         | Fazer animações de whiteboard                                | `npx dev-marketplace add whiteboard-animation`         |
| `wrapped-video`                | Fazer vídeos estilo Spotify Wrapped                          | `npx dev-marketplace add wrapped-video`                |

---

## Estrutura do Repositório

```text
dev-marketplace/
├── bin/
│   └── cli.js            # Runner standalone zero-dependency npx
├── skills/               # Pacotes de skills padronizados
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
├── registry.json         # Índice machine-readable pesquisável
└── package.json          # Definição npm bin
```

---

## Open Source & Licenciamento

Todas as skills e conectores incluídos neste registry são open source e livremente redistribuíveis sob suas respectivas licenças open source (MIT, Apache-2.0, ou compatíveis).

Contribuições, novas skills de agents e conectores da comunidade são bem-vindos via Pull Requests!

---

## Traduções

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
