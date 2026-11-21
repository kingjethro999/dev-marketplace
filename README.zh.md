# Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-133%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Compatible with Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-orange?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code)
[![Compatible with Cursor & Antigravity](https://img.shields.io/badge/Agent-Cursor%20%7C%20Antigravity%20%7C%20Codex-purple?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![Vercel Skills Standard](https://img.shields.io/badge/npx%20skills-ready-black?style=flat-square)](https://skills.sh)

一个开源开发者市场，拥有 **133+ 经过策划和实战测试的 AI 代理技能、语言服务器 (LSP) 连接器、设计引擎、代码质量验证器和视频合成工具包**。

兼容 **Claude Code**、**Cursor**、**Antigravity (`agy`)**、**Codex**，以及任何遵循标准 `SKILL.md` 规范的代理平台。

---

## 快速开始

直接将任何技能安装到您的项目中：

```bash
# 使用内置的 marketplace 运行器：
npx dev-marketplace add <skill-name>

# 或使用开放的 skills.sh 标准：
npx skills add kingjethro999/dev-marketplace --skill <skill-name>
```

### 安装示例

```bash
# 安装 Apple 界面设计指南
npx dev-marketplace add apple-design

# 安装代码审查和测试驱动开发工具包
npx dev-marketplace add code-review test-driven-development systematic-debugging

# 安装所有 Video & Motion 合成技能
npx dev-marketplace add --category "Video & Motion"

# 安装所有 LSP 连接器 (TypeScript, Python, Rust, Go, C++, Swift...)
npx dev-marketplace add --category "Connectors & LSP"

# 将整个 marketplace 同步到您的项目：
npx dev-marketplace add --all

# 或全局安装到您的主代理目录 (~/.agents/skills)：
npx dev-marketplace add --all --global
```

---

## CLI 命令

| 命令                                          | 说明                                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `npx dev-marketplace list`                    | 按关键词或类别浏览和筛选所有可用技能                                               |
| `npx dev-marketplace add <name...>`           | 将指定技能复制到当前项目 (`.agents/skills`, `.claude/skills`, 或 `.gemini/skills`) |
| `npx dev-marketplace add --all`               | 一次性安装所有 133+ 个 marketplace 技能                                            |
| `npx dev-marketplace add --category "<name>"` | 安装特定类别的所有技能                                                             |
| `npx dev-marketplace info <name>`             | 检查完整的技能描述、前置元数据和文件内容                                           |
| `npx dev-marketplace categories`              | 列出所有 marketplace 类别及其数量                                                  |

---

## Marketplace 目录 (133 技能和连接器)

### 代码审查和质量 (16 技能)

| 技能                             | 说明                                                 | 安装                                                     |
| -------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| `claude-security`                | 让一组代理作为安全研究员工作在您的代码库上           | `npx dev-marketplace add claude-security`                |
| `pr-review-toolkit`              | 用于彻底 PR 审查的专业代理综合集合                   | `npx dev-marketplace add pr-review-toolkit`              |
| `qc-skill`                       | 确定性媒体质量控制/验证                              | `npx dev-marketplace add qc-skill`                       |
| `receiving-code-review`          | 接收代码审查反馈时使用                               | `npx dev-marketplace add receiving-code-review`          |
| `requesting-code-review`         | 完成任务前，合并前使用                               | `npx dev-marketplace add requesting-code-review`         |
| `security`                       | 审查代码的安全问题                                   | `npx dev-marketplace add security`                       |
| `security-and-hardening`         | 加固代码以防漏洞                                     | `npx dev-marketplace add security-and-hardening`         |
| `systematic-debugging`           | 遇到任何 bug 或测试失败时使用                        | `npx dev-marketplace add systematic-debugging`           |
| `test-driven-development`        | 实现任何功能或修复 bug 时使用                        | `npx dev-marketplace add test-driven-development`        |
| `verification-before-completion` | 声称工作完成前使用                                   | `npx dev-marketplace add verification-before-completion` |
| `leak-spots`                     | 使用 Periderm CLI 检测 Git 历史中的泄露密钥          | `npx dev-marketplace add leak-spots`                     |
| `launch-ready`                   | 使用 Periderm CLI 扫描和审查进行发布前验证           | `npx dev-marketplace add launch-ready`                   |
| `branch-sec`                     | 强制分支保护、签名提交、Periderm 检查                | `npx dev-marketplace add branch-sec`                     |
| `cyber-sec`                      | 网络安全工具包：威胁建模、OWASP、加密审计            | `npx dev-marketplace add cyber-sec`                      |
| `commit-hook`                    | 带有 Periderm CLI 集成的 Git hooks                   | `npx dev-marketplace add commit-hook`                    |
| `repo-sec`                       | 仓库安全加固：签名提交、分支保护、密钥扫描、依赖审计 | `npx dev-marketplace add repo-sec`                       |

### 连接器和 LSP (15 技能)

| 技能                | 说明                                                   | 安装                                        |
| ------------------- | ------------------------------------------------------ | ------------------------------------------- |
| `clangd-lsp`        | 适用于 Claude Code 的 C/C++ 语言服务器 (clangd)        | `npx dev-marketplace add clangd-lsp`        |
| `context7-mcp`      | 库/框架 API 参考和代码示例                             | `npx dev-marketplace add context7-mcp`      |
| `csharp-lsp`        | 适用于 Claude Code 的 C# 语言服务器                    | `npx dev-marketplace add csharp-lsp`        |
| `gopls-lsp`         | 适用于 Claude Code 的 Go 语言服务器                    | `npx dev-marketplace add gopls-lsp`         |
| `jdtls-lsp`         | 适用于 Claude Code 的 Java 语言服务器 (Eclipse JDT.LS) | `npx dev-marketplace add jdtls-lsp`         |
| `kotlin-lsp`        | 适用于 Claude Code 的 Kotlin 语言服务器                | `npx dev-marketplace add kotlin-lsp`        |
| `lua-lsp`           | 适用于 Claude Code 的 Lua 语言服务器                   | `npx dev-marketplace add lua-lsp`           |
| `mcp-server-dev`    | 用于设计和构建 MCP 服务器的技能                        | `npx dev-marketplace add mcp-server-dev`    |
| `mcp-tunnels`       | 将 Claude 连接到您私有网络中的 MCP 服务器              | `npx dev-marketplace add mcp-tunnels`       |
| `php-lsp`           | 适用于 Claude Code 的 PHP 语言服务器 (Intelephense)    | `npx dev-marketplace add php-lsp`           |
| `pyright-lsp`       | 适用于 Claude Code 的 Python 语言服务器 (Pyright)      | `npx dev-marketplace add pyright-lsp`       |
| `ruby-lsp`          | 适用于 Claude Code 的 Ruby 语言服务器                  | `npx dev-marketplace add ruby-lsp`          |
| `rust-analyzer-lsp` | 适用于 Claude Code 的 Rust 语言服务器                  | `npx dev-marketplace add rust-analyzer-lsp` |
| `swift-lsp`         | 适用于 Claude Code 的 Swift 语言服务器 (SourceKit-LSP) | `npx dev-marketplace add swift-lsp`         |
| `typescript-lsp`    | 适用于 Claude Code 的 TypeScript/JavaScript 语言服务器 | `npx dev-marketplace add typescript-lsp`    |

### 设计和 UI (14 技能)

| 技能                  | 说明                                      | 安装                                          |
| --------------------- | ----------------------------------------- | --------------------------------------------- |
| `apple-design`        | Apple 的界面设计和流畅动效方法            | `npx dev-marketplace add apple-design`        |
| `break-ui`            | 使用最坏情况数据压力测试 UI               | `npx dev-marketplace add break-ui`            |
| `design-mobile-apps`  | 使用 Sleek 设计移动应用屏幕               | `npx dev-marketplace add design-mobile-apps`  |
| `emil-design-eng`     | Emil Kowalski 的设计工程理念              | `npx dev-marketplace add emil-design-eng`     |
| `figma`               | 将 Figma 引入 HyperFrames 视频            | `npx dev-marketplace add figma`               |
| `figma-designer`      | 在 Figma 中使用真实变量和自动布局进行设计 | `npx dev-marketplace add figma-designer`      |
| `firecrawl-build`     | 用于 Web 数据的 Firecrawl 集成            | `npx dev-marketplace add firecrawl-build`     |
| `gestures`            | 构建拖拽、滑动和面板交互                  | `npx dev-marketplace add gestures`            |
| `impeccable`          | 设计、批评、审计、润色前端界面            | `npx dev-marketplace add impeccable`          |
| `improve`             | 作为高级顾问调查代码库，生成实施计划      | `npx dev-marketplace add improve`             |
| `landing-page-design` | 高转化着陆页的完整系统                    | `npx dev-marketplace add landing-page-design` |
| `learn-taste`         | 将设计修正转化为 DESIGN.md 中的规则       | `npx dev-marketplace add learn-taste`         |
| `pick-ui-library`     | 为前端任务选择合适的库                    | `npx dev-marketplace add pick-ui-library`     |
| `prototype`           | 在视觉选择器后构建多个 UI 版本            | `npx dev-marketplace add prototype`           |

### 开发工具和 AI (27 技能)

| 技能                             | 说明                                   | 安装                                                     |
| -------------------------------- | -------------------------------------- | -------------------------------------------------------- |
| `artifacts-skill`                | 面向真实工件的本地优先执行和验证       | `npx dev-marketplace add artifacts-skill`                |
| `ask-emil`                       | 本仓库技能的路由器                     | `npx dev-marketplace add ask-emil`                       |
| `ask-sonner`                     | Sonner (React toast 库) 指南           | `npx dev-marketplace add ask-sonner`                     |
| `brainstorming`                  | 任何创意工作前使用                     | `npx dev-marketplace add brainstorming`                  |
| `caveman`                        | 简洁的原始人语音模式                   | `npx dev-marketplace add caveman`                        |
| `choreograph`                    | 协调一起动画的元素                     | `npx dev-marketplace add choreograph`                    |
| `claude-md-management`           | 维护和改进 CLAUDE.md 文件的工具        | `npx dev-marketplace add claude-md-management`           |
| `color-grading`                  | 确定性调色/色彩校正                    | `npx dev-marketplace add color-grading`                  |
| `feature-dev`                    | 全面的功能开发工作流                   | `npx dev-marketplace add feature-dev`                    |
| `find-skills`                    | 发现和安装代理技能                     | `npx dev-marketplace add find-skills`                    |
| `finishing-a-development-branch` | 决定如何整合已完成的工作               | `npx dev-marketplace add finishing-a-development-branch` |
| `html-demo`                      | 通过 HTML 模拟在网页上展示应用运行     | `npx dev-marketplace add html-demo`                      |
| `imagemagick-skill`              | 本地 ImageMagick 图像编辑              | `npx dev-marketplace add imagemagick-skill`              |
| `ingest-skill`                   | 安全卸载相机卡和录像机                 | `npx dev-marketplace add ingest-skill`                   |
| `mobile-native`                  | 让 Web 应用在手机上感觉像原生应用      | `npx dev-marketplace add mobile-native`                  |
| `product-demo`                   | 录制精美的产品演示视频                 | `npx dev-marketplace add product-demo`                   |
| `product-film`                   | 制作短产品影片                         | `npx dev-marketplace add product-film`                   |
| `publish-skill`                  | 将完成的交付物上传到平台               | `npx dev-marketplace add publish-skill`                  |
| `reverse-engineer-anything`      | 逆向工程原生、托管、Electron、固件目标 | `npx dev-marketplace add reverse-engineer-anything`      |
| `skillpact`                      | 编写和检查 SkillPact 契约              | `npx dev-marketplace add skillpact`                      |
| `slide-sync-skill`               | 在录像中查找幻灯片变化，创建章节       | `npx dev-marketplace add slide-sync-skill`               |
| `stepcap`                        | 处理 stepcap 录制文件夹                | `npx dev-marketplace add stepcap`                        |
| `style-sampling`                 | 在经过验证的视频风格中制作新剧集       | `npx dev-marketplace add style-sampling`                 |
| `transcription-skill`            | 转录音频/视频文件中的语音              | `npx dev-marketplace add transcription-skill`            |
| `website-scroll`                 | 录制任何网页的自顶向下滚动             | `npx dev-marketplace add website-scroll`                 |
| `write-swift`                    | 如何编写现代 Swift 的最佳实践          | `npx dev-marketplace add write-swift`                    |
| `writing-skills`                 | 部署前创建、编辑、验证技能             | `npx dev-marketplace add writing-skills`                 |

### 工程和工作流 (18 技能)

| 技能                          | 说明                                                                          | 安装                                                  |
| ----------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| `code-modernization`          | 用证据现代化遗留代码库                                                        | `npx dev-marketplace add code-modernization`          |
| `commit-commands`             | 简化 git 工作流                                                               | `npx dev-marketplace add commit-commands`             |
| `diagnosing-superpowers`      | 诊断为什么 superpowers 会话失败                                               | `npx dev-marketplace add diagnosing-superpowers`      |
| `dispatching-parallel-agents` | 并行运行 2+ 独立任务                                                          | `npx dev-marketplace add dispatching-parallel-agents` |
| `executing-plans`             | 内联执行实施计划                                                              | `npx dev-marketplace add executing-plans`             |
| `hookify`                     | 创建自定义 hooks 防止不需要的行为                                             | `npx dev-marketplace add hookify`                     |
| `ralph-loop`                  | 用于迭代 AI 开发的 Ralph Wiggum 技术                                          | `npx dev-marketplace add ralph-loop`                  |
| `session-report`              | session-report 的连接器和工具                                                 | `npx dev-marketplace add session-report`              |
| `subagent-driven-development` | 使用独立任务执行实施计划                                                      | `npx dev-marketplace add subagent-driven-development` |
| `using-git-worktrees`         | 使用隔离开始特性工作                                                          | `npx dev-marketplace add using-git-worktrees`         |
| `using-superpowers`           | 建立如何查找和使用技能                                                        | `npx dev-marketplace add using-superpowers`           |
| `writing-plans`               | 在动手写代码前编写计划                                                        | `npx dev-marketplace add writing-plans`               |
| `leak-spots`                  | 使用 Periderm CLI 检测 Git 历史中的泄露密钥                                   | `npx dev-marketplace add leak-spots`                  |
| `launch-ready`                | 使用 Periderm CLI 扫描和审查进行发布前验证                                    | `npx dev-marketplace add launch-ready`                |
| `branch-sec`                  | 强制分支保护、签名提交、Periderm 检查                                         | `npx dev-marketplace add branch-sec`                  |
| `cyber-sec`                   | 网络安全工具包：威胁建模、OWASP、加密审计                                     | `npx dev-marketplace add cyber-sec`                   |
| `commit-hook`                 | 带有 Periderm CLI 集成的 Git hooks                                            | `npx dev-marketplace add commit-hook`                 |
| `ci-cd`                       | CI/CD 管道分析器/生成器：GitHub Actions, GitLab CI, CircleCI, Azure Pipelines | `npx dev-marketplace add ci-cd`                       |

### 视频和动效 (48 技能)

| 技能                           | 说明                                          | 安装                                                   |
| ------------------------------ | --------------------------------------------- | ------------------------------------------------------ |
| `animate`                      | 从零构建动画                                  | `npx dev-marketplace add animate`                      |
| `animate-expo`                 | 在 React Native 和 Expo 中构建动画            | `npx dev-marketplace add animate-expo`                 |
| `animation-performance`        | 将 Web 动画保持在帧预算内                     | `npx dev-marketplace add animation-performance`        |
| `animation-vocabulary`         | 动效的反向查找词汇表                          | `npx dev-marketplace add animation-vocabulary`         |
| `audio-production`             | 确定性音频制作执行                            | `npx dev-marketplace add audio-production`             |
| `blender-skill`                | 检查、转换、优化、渲染 3D 资产                | `npx dev-marketplace add blender-skill`                |
| `diagram-animation`            | 为图表、流程图、图表制作动画                  | `npx dev-marketplace add diagram-animation`            |
| `dubbing`                      | 使用本地 TTS 朗读文本，放入视频               | `npx dev-marketplace add dubbing`                      |
| `explainer-video`              | 制作解释视频                                  | `npx dev-marketplace add explainer-video`              |
| `ffmpeg-skill`                 | 使用本地 FFmpeg 编辑视频/音频                 | `npx dev-marketplace add ffmpeg-skill`                 |
| `find-animation-opportunities` | 搜索应该添加动画的地方                        | `npx dev-marketplace add find-animation-opportunities` |
| `hyperframes`                  | 使用 HyperFrames 制作、编辑、动画化或渲染视频 | `npx dev-marketplace add hyperframes`                  |
| `hyperframes-cli`              | HyperFrames CLI - 脚手架、检查、编辑、渲染    | `npx dev-marketplace add hyperframes-cli`              |
| `hyperframes-registry`         | 450+ 个现成的 HyperFrames 模块                | `npx dev-marketplace add hyperframes-registry`         |
| `hyperframes-skill`            | 使用 HyperFrames 从 HTML 场景渲染视频         | `npx dev-marketplace add hyperframes-skill`            |
| `improve-animations`           | 审计动效代码，生成改进计划                    | `npx dev-marketplace add improve-animations`           |
| `isometric-animation`          | 制作等轴测动画                                | `npx dev-marketplace add isometric-animation`          |
| `media-analysis`               | 测量媒体文件的确定性事实                      | `npx dev-marketplace add media-analysis`               |
| `media-use`                    | 为 HyperFrames 视频获取或制作媒体             | `npx dev-marketplace add media-use`                    |
| `motion-graphics`              | 确定性动态图形渲染                            | `npx dev-marketplace add motion-graphics`              |
| `nle-bridge-skill`             | 将编辑移交给 Premiere Pro 或 DaVinci Resolve  | `npx dev-marketplace add nle-bridge-skill`             |
| `remotion-best-practices`      | 所有 Remotion 技能的路由器                    | `npx dev-marketplace add remotion-best-practices`      |
| `remotion-captions`            | 转录、显示、动画化字幕                        | `npx dev-marketplace add remotion-captions`            |
| `remotion-create`              | 创建新的 Remotion 视频                        | `npx dev-marketplace add remotion-create`              |
| `remotion-docs`                | 搜索 Remotion 文档                            | `npx dev-marketplace add remotion-docs`                |
| `remotion-ffmpeg-skill`        | 使用 Remotion 在真实素材上制作动态图形        | `npx dev-marketplace add remotion-ffmpeg-skill`        |
| `remotion-interactivity`       | 构建 Remotion 标记以便在 Studio 中编辑        | `npx dev-marketplace add remotion-interactivity`       |
| `remotion-license`             | 查找 Remotion 许可证信息                      | `npx dev-marketplace add remotion-license`             |
| `remotion-maps`                | Remotion Map 动画知识                         | `npx dev-marketplace add remotion-maps`                |
| `remotion-markup`              | 内容、动画和效果的最佳实践                    | `npx dev-marketplace add remotion-markup`              |
| `remotion-multimedia`          | 与 Mediabunny 交互                            | `npx dev-marketplace add remotion-multimedia`          |
| `remotion-render`              | 导出 Remotion 视频、静止图像或 OTIO 时间轴    | `npx dev-marketplace add remotion-render`              |
| `remotion-saas`                | 使用 Remotion 构建应用                        | `npx dev-marketplace add remotion-saas`                |
| `remotion-studio`              | 预览 Remotion 视频                            | `npx dev-marketplace add remotion-studio`              |
| `remotion-to-hyperframes`      | 将现有视频代码引入 HyperFrames                | `npx dev-marketplace add remotion-to-hyperframes`      |
| `remotion-upgrade`             | 升级 Remotion 和相关包                        | `npx dev-marketplace add remotion-upgrade`             |
| `remove-animations`            | 找到并移除不必要的动画                        | `npx dev-marketplace add remove-animations`            |
| `reverse-any-video`            | 将任何视频重建为可编辑的 HyperFrames 项目     | `npx dev-marketplace add reverse-any-video`            |
| `review-animations`            | 审查动画和动效代码                            | `npx dev-marketplace add review-animations`            |
| `slideshow`                    | 构建 HyperFrames 幻灯片进行现场演示           | `npx dev-marketplace add slideshow`                    |
| `sound-design-skill`           | 视频的音乐床和音效                            | `npx dev-marketplace add sound-design-skill`           |
| `subtitle-skill`               | 确定性字幕验证、SRT/VTT 生成                  | `npx dev-marketplace add subtitle-skill`               |
| `thumbnail-skill`              | 确定性缩略图渲染                              | `npx dev-marketplace add thumbnail-skill`              |
| `video-editing-skill`          | 确定性视频编辑                                | `npx dev-marketplace add video-editing-skill`          |
| `video-production-agent`       | 从源文件规划和制作视频                        | `npx dev-marketplace add video-production-agent`       |
| `voice-enhance-skill`          | 使用本地引擎清理录制的语音                    | `npx dev-marketplace add voice-enhance-skill`          |
| `whiteboard-animation`         | 制作白板动画                                  | `npx dev-marketplace add whiteboard-animation`         |
| `wrapped-video`                | 制作 Spotify Wrapped 风格视频                 | `npx dev-marketplace add wrapped-video`                |

---

## 仓库结构

```text
dev-marketplace/
├── bin/
│   └── cli.js            # 独立零依赖 npx 运行器
├── skills/               # 标准化技能包
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
├── registry.json         # 可搜索的机器可读索引
└── package.json          # npm bin 定义
```

---

## 开源和许可

本注册表中包含的所有技能和连接器均为开源，并可在其各自的开源许可证 (MIT、Apache-2.0 或兼容许可证) 下自由重新分发。

欢迎通过 Pull Requests 贡献新的代理技能和社区连接器！

---

## 翻译

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
