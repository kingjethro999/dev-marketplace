# Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-133%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Compatible with Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-orange?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code)
[![Compatible with Cursor & Antigravity](https://img.shields.io/badge/Agent-Cursor%20%7C%20Antigravity%20%7C%20Codex-purple?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![Vercel Skills Standard](https://img.shields.io/badge/npx%20skills-ready-black?style=flat-square)](https://skills.sh)

**133+ 개의 선별되고 실전 테스트를 거친 AI 에이전트 스킬, 언어 서버 (LSP) 커넥터, 디자인 엔진, 코드 품질 검증 도구, 비디오 합성 툴킷**을 갖춘 오픈 소스 개발자 마켓플레이스.

**Claude Code**, **Cursor**, **Antigravity (`agy`)**, **Codex** 및 표준 `SKILL.md` 사양을 따르는 모든 에이전트 플랫폼과 호환됩니다.

---

## 빠른 시작

모든 스킬을 직접 프로젝트에 설치하세요:

```bash
# 내장 마켓플레이스 러너 사용:
npx dev-marketplace add <skill-name>

# 또는 오픈 skills.sh 표준 사용:
npx skills add kingjethro999/dev-marketplace --skill <skill-name>
```

### 설치 예시

```bash
# Apple 인터페이스 디자인 가이드라인 설치
npx dev-marketplace add apple-design

# 코드 리뷰 및 테스트 주도 개발 툴킷 설치
npx dev-marketplace add code-review test-driven-development systematic-debugging

# 모든 Video & Motion 합성 스킬 설치
npx dev-marketplace add --category "Video & Motion"

# 모든 LSP 커넥터 설치 (TypeScript, Python, Rust, Go, C++, Swift...)
npx dev-marketplace add --category "Connectors & LSP"

# 전체 마켓플레이스를 프로젝트에 동기화:
npx dev-marketplace add --all

# 또는 홈 에이전트 디렉토리 (~/.agents/skills)에 전역 설치:
npx dev-marketplace add --all --global
```

---

## CLI 명령어

| 명령어                                        | 설명                                                                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `npx dev-marketplace list`                    | 키워드나 카테고리로 사용 가능한 모든 스킬 탐색 및 필터링                                       |
| `npx dev-marketplace add <name...>`           | 지정된 스킬을 현재 프로젝트에 복사 (`.agents/skills`, `.claude/skills`, 또는 `.gemini/skills`) |
| `npx dev-marketplace add --all`               | 모든 133+ 마켓플레이스 스킬을 한 번에 설치                                                     |
| `npx dev-marketplace add --category "<name>"` | 특정 카테고리의 모든 스킬 설치                                                                 |
| `npx dev-marketplace info <name>`             | 전체 스킬 설명, 프론트매터, 파일 내용 검사                                                     |
| `npx dev-marketplace categories`              | 모든 마켓플레이스 카테고리와 개수 나열                                                         |

---

## 마켓플레이스 카탈로그 (133 스킬 & 커넥터)

### 코드 리뷰 및 품질 (16 스킬)

| 스킬                             | 설명                                                                 | 설치                                                     |
| -------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------- |
| `claude-security`                | 에이전트 팀을 보안 연구원으로 코드베이스에 투입                      | `npx dev-marketplace add claude-security`                |
| `pr-review-toolkit`              | 철저한 PR 리뷰를 위한 전문 에이전트 종합 컬렉션                      | `npx dev-marketplace add pr-review-toolkit`              |
| `qc-skill`                       | 결정론적 미디어 품질 관리/검증                                       | `npx dev-marketplace add qc-skill`                       |
| `receiving-code-review`          | 코드 리뷰 피드백 수신 시 사용                                        | `npx dev-marketplace add receiving-code-review`          |
| `requesting-code-review`         | 작업 완료 시, 병합 전 사용                                           | `npx dev-marketplace add requesting-code-review`         |
| `security`                       | 코드 보안 문제 검토                                                  | `npx dev-marketplace add security`                       |
| `security-and-hardening`         | 취약점에 대한 코드 강화                                              | `npx dev-marketplace add security-and-hardening`         |
| `systematic-debugging`           | 버그나 테스트 실패 발생 시 사용                                      | `npx dev-marketplace add systematic-debugging`           |
| `test-driven-development`        | 기능 구현이나 버그 수정 시 사용                                      | `npx dev-marketplace add test-driven-development`        |
| `verification-before-completion` | 작업 완료 주장 전 사용                                               | `npx dev-marketplace add verification-before-completion` |
| `leak-spots`                     | Periderm CLI로 Git 히스토리의 유출 시크릿 탐지                       | `npx dev-marketplace add leak-spots`                     |
| `launch-ready`                   | Periderm CLI 스캔 & 리뷰로 출시 전 검증                              | `npx dev-marketplace add launch-ready`                   |
| `branch-sec`                     | 브랜치 보호, 서명된 커밋, Periderm 체크 강제                         | `npx dev-marketplace add branch-sec`                     |
| `cyber-sec`                      | 사이버 보안 툴킷: 위협 모델링, OWASP, 암호화 감사                    | `npx dev-marketplace add cyber-sec`                      |
| `commit-hook`                    | Periderm CLI 통합 Git 훅                                             | `npx dev-marketplace add commit-hook`                    |
| `repo-sec`                       | 저장소 보안 강화: 서명된 커밋, 브랜치 보호, 시크릿 스캔, 의존성 감사 | `npx dev-marketplace add repo-sec`                       |

### 커넥터 및 LSP (15 스킬)

| 스킬                | 설명                                            | 설치                                        |
| ------------------- | ----------------------------------------------- | ------------------------------------------- |
| `clangd-lsp`        | Claude Code용 C/C++ 언어 서버 (clangd)          | `npx dev-marketplace add clangd-lsp`        |
| `context7-mcp`      | 라이브러리/프레임워크 API 레퍼런스 및 코드 예제 | `npx dev-marketplace add context7-mcp`      |
| `csharp-lsp`        | Claude Code용 C# 언어 서버                      | `npx dev-marketplace add csharp-lsp`        |
| `gopls-lsp`         | Claude Code용 Go 언어 서버                      | `npx dev-marketplace add gopls-lsp`         |
| `jdtls-lsp`         | Claude Code용 Java 언어 서버 (Eclipse JDT.LS)   | `npx dev-marketplace add jdtls-lsp`         |
| `kotlin-lsp`        | Claude Code용 Kotlin 언어 서버                  | `npx dev-marketplace add kotlin-lsp`        |
| `lua-lsp`           | Claude Code용 Lua 언어 서버                     | `npx dev-marketplace add lua-lsp`           |
| `mcp-server-dev`    | MCP 서버 설계 및 구축용 스킬                    | `npx dev-marketplace add mcp-server-dev`    |
| `mcp-tunnels`       | 프라이빗 네트워크의 MCP 서버에 Claude 연결      | `npx dev-marketplace add mcp-tunnels`       |
| `php-lsp`           | Claude Code용 PHP 언어 서버 (Intelephense)      | `npx dev-marketplace add php-lsp`           |
| `pyright-lsp`       | Claude Code용 Python 언어 서버 (Pyright)        | `npx dev-marketplace add pyright-lsp`       |
| `ruby-lsp`          | Claude Code용 Ruby 언어 서버                    | `npx dev-marketplace add ruby-lsp`          |
| `rust-analyzer-lsp` | Claude Code용 Rust 언어 서버                    | `npx dev-marketplace add rust-analyzer-lsp` |
| `swift-lsp`         | Claude Code용 Swift 언어 서버 (SourceKit-LSP)   | `npx dev-marketplace add swift-lsp`         |
| `typescript-lsp`    | Claude Code용 TypeScript/JavaScript 언어 서버   | `npx dev-marketplace add typescript-lsp`    |

### 디자인 및 UI (14 스킬)

| 스킬                  | 설명                                                | 설치                                          |
| --------------------- | --------------------------------------------------- | --------------------------------------------- |
| `apple-design`        | Apple의 인터페이스 디자인 및 유동적 모션 접근법     | `npx dev-marketplace add apple-design`        |
| `break-ui`            | 최악의 케이스 데이터로 UI 스트레스 테스트           | `npx dev-marketplace add break-ui`            |
| `design-mobile-apps`  | Sleek로 모바일 앱 화면 디자인                       | `npx dev-marketplace add design-mobile-apps`  |
| `emil-design-eng`     | Emil Kowalski의 디자인 엔지니어링 철학              | `npx dev-marketplace add emil-design-eng`     |
| `figma`               | Figma를 HyperFrames 비디오로 가져오기               | `npx dev-marketplace add figma`               |
| `figma-designer`      | 실제 변수와 자동 레이아웃으로 Figma에서 디자인      | `npx dev-marketplace add figma-designer`      |
| `firecrawl-build`     | 웹 데이터를 위한 Firecrawl 통합                     | `npx dev-marketplace add firecrawl-build`     |
| `gestures`            | 드래그, 스와이프, 시트 인터랙션 구축                | `npx dev-marketplace add gestures`            |
| `impeccable`          | 프론트엔드 인터페이스 디자인, 비평, 감사, 다듬기    | `npx dev-marketplace add impeccable`          |
| `improve`             | 시니어 어드바이저로 코드베이스 조사, 구현 계획 생성 | `npx dev-marketplace add improve`             |
| `landing-page-design` | 고전환 랜딩 페이지를 위한 완전한 시스템             | `npx dev-marketplace add landing-page-design` |
| `learn-taste`         | 디자인 수정을 DESIGN.md의 규칙으로 변환             | `npx dev-marketplace add learn-taste`         |
| `pick-ui-library`     | 프론트엔드 작업에 적합한 라이브러리 선택            | `npx dev-marketplace add pick-ui-library`     |
| `prototype`           | 비주얼 피커 뒤에 여러 UI 버전 구축                  | `npx dev-marketplace add prototype`           |

### 개발자 도구 및 AI (27 스킬)

| 스킬                             | 설명                                                        | 설치                                                     |
| -------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| `artifacts-skill`                | 실제 아티팩트를 위한 로컬 퍼스트 실행 및 검증               | `npx dev-marketplace add artifacts-skill`                |
| `ask-emil`                       | 이 저장소의 스킬 라우터                                     | `npx dev-marketplace add ask-emil`                       |
| `ask-sonner`                     | React 토스트 라이브러리 Sonner 가이드                       | `npx dev-marketplace add ask-sonner`                     |
| `brainstorming`                  | 모든 창작 작업 전에 사용                                    | `npx dev-marketplace add brainstorming`                  |
| `caveman`                        | 간결한 원시인 보이스 모드                                   | `npx dev-marketplace add caveman`                        |
| `choreograph`                    | 함께 애니메이션하는 요소 조정                               | `npx dev-marketplace add choreograph`                    |
| `claude-md-management`           | CLAUDE.md 파일 유지 및 개선 도구                            | `npx dev-marketplace add claude-md-management`           |
| `color-grading`                  | 결정론적 컬러 그레이딩/보정                                 | `npx dev-marketplace add color-grading`                  |
| `feature-dev`                    | 포괄적 기능 개발 워크플로                                   | `npx dev-marketplace add feature-dev`                    |
| `find-skills`                    | 에이전트 스킬 발견 및 설치                                  | `npx dev-marketplace add find-skills`                    |
| `finishing-a-development-branch` | 완료된 작업 통합 방법 결정                                  | `npx dev-marketplace add finishing-a-development-branch` |
| `html-demo`                      | HTML 시뮬레이션으로 웹 페이지에서 앱 작동 표시              | `npx dev-marketplace add html-demo`                      |
| `imagemagick-skill`              | 로컬 ImageMagick 이미지 편집                                | `npx dev-marketplace add imagemagick-skill`              |
| `ingest-skill`                   | 카메라 카드 및 레코더 안전하게 오프로드                     | `npx dev-marketplace add ingest-skill`                   |
| `mobile-native`                  | 웹 앱을 모바일에서 네이티브처럼 느끼게 함                   | `npx dev-marketplace add mobile-native`                  |
| `product-demo`                   | 세련된 제품 데모 비디오 녹화                                | `npx dev-marketplace add product-demo`                   |
| `product-film`                   | 짧은 제품 필름 제작                                         | `npx dev-marketplace add product-film`                   |
| `publish-skill`                  | 완성된 결과물을 플랫폼에 업로드                             | `npx dev-marketplace add publish-skill`                  |
| `reverse-engineer-anything`      | 네이티브, 매니지드, Electron, 펌웨어 타겟 리버스 엔지니어링 | `npx dev-marketplace add reverse-engineer-anything`      |
| `skillpact`                      | SkillPact 계약 작성 및 검사                                 | `npx dev-marketplace add skillpact`                      |
| `slide-sync-skill`               | 녹화에서 슬라이드 변경 찾기, 챕터 생성                      | `npx dev-marketplace add slide-sync-skill`               |
| `stepcap`                        | stepcap 녹화 폴더로 작업                                    | `npx dev-marketplace add stepcap`                        |
| `style-sampling`                 | 검증된 비디오 스타일로 새 에피소드 제작                     | `npx dev-marketplace add style-sampling`                 |
| `transcription-skill`            | 오디오/비디오 파일의 음성 전사                              | `npx dev-marketplace add transcription-skill`            |
| `website-scroll`                 | 모든 웹 페이지의 상단에서 하단으로 스크롤 녹화              | `npx dev-marketplace add website-scroll`                 |
| `write-swift`                    | 모던 Swift 올바르게 작성하는 방법                           | `npx dev-marketplace add write-swift`                    |
| `writing-skills`                 | 배포 전 스킬 생성, 편집, 검증                               | `npx dev-marketplace add writing-skills`                 |

### 엔지니어링 및 워크플로 (18 스킬)

| 스킬                          | 설명                                                                                 | 설치                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `code-modernization`          | 증거와 함께 레거시 코드베이스 현대화                                                 | `npx dev-marketplace add code-modernization`          |
| `commit-commands`             | Git 워크플로 간소화                                                                  | `npx dev-marketplace add commit-commands`             |
| `diagnosing-superpowers`      | Superpowers 세션 실패 원인 진단                                                      | `npx dev-marketplace add diagnosing-superpowers`      |
| `dispatching-parallel-agents` | 2+ 독립적 태스크 병렬 실행                                                           | `npx dev-marketplace add dispatching-parallel-agents` |
| `executing-plans`             | 구현 계획 인라인 실행                                                                | `npx dev-marketplace add executing-plans`             |
| `hookify`                     | 원치 않는 동작 방지 커스텀 훅 생성                                                   | `npx dev-marketplace add hookify`                     |
| `ralph-loop`                  | 반복적 AI 개발을 위한 Ralph Wiggum 기법                                              | `npx dev-marketplace add ralph-loop`                  |
| `session-report`              | session-report 커넥터 및 툴링                                                        | `npx dev-marketplace add session-report`              |
| `subagent-driven-development` | 독립적 태스크로 구현 계획 실행                                                       | `npx dev-marketplace add subagent-driven-development` |
| `using-git-worktrees`         | 격리로 기능 작업 시작                                                                | `npx dev-marketplace add using-git-worktrees`         |
| `using-superpowers`           | 스킬 찾기 및 사용 방법 확립                                                          | `npx dev-marketplace add using-superpowers`           |
| `writing-plans`               | 코드 작성 전 계획 수립                                                               | `npx dev-marketplace add writing-plans`               |
| `leak-spots`                  | Periderm CLI로 Git 히스토리의 유출 시크릿 탐지                                       | `npx dev-marketplace add leak-spots`                  |
| `launch-ready`                | Periderm CLI 스캔 & 리뷰로 출시 전 검증                                              | `npx dev-marketplace add launch-ready`                |
| `branch-sec`                  | 브랜치 보호, 서명된 커밋, Periderm 체크 강제                                         | `npx dev-marketplace add branch-sec`                  |
| `cyber-sec`                   | 사이버 보안 툴킷: 위협 모델링, OWASP, 암호화 감사                                    | `npx dev-marketplace add cyber-sec`                   |
| `commit-hook`                 | Periderm CLI 통합 Git 훅                                                             | `npx dev-marketplace add commit-hook`                 |
| `ci-cd`                       | CI/CD 파이프라인 분석기/생성기: GitHub Actions, GitLab CI, CircleCI, Azure Pipelines | `npx dev-marketplace add ci-cd`                       |

### 비디오 및 모션 (48 스킬)

| 스킬                           | 설명                                                    | 설치                                                   |
| ------------------------------ | ------------------------------------------------------- | ------------------------------------------------------ |
| `animate`                      | 처음부터 애니메이션 구축                                | `npx dev-marketplace add animate`                      |
| `animate-expo`                 | React Native와 Expo에서 애니메이션 구축                 | `npx dev-marketplace add animate-expo`                 |
| `animation-performance`        | 웹 애니메이션을 프레임 예산 내 유지                     | `npx dev-marketplace add animation-performance`        |
| `animation-vocabulary`         | 모션 효과 역참조 용어집                                 | `npx dev-marketplace add animation-vocabulary`         |
| `audio-production`             | 결정론적 오디오 제작 실행                               | `npx dev-marketplace add audio-production`             |
| `blender-skill`                | 3D 에셋 검사, 변환, 최적화, 렌더링                      | `npx dev-marketplace add blender-skill`                |
| `diagram-animation`            | 다이어그램, 순서도, 차트 애니메이션                     | `npx dev-marketplace add diagram-animation`            |
| `dubbing`                      | 로컬 TTS로 텍스트 음성 변환, 비디오에 삽입              | `npx dev-marketplace add dubbing`                      |
| `explainer-video`              | 설명 비디오 제작                                        | `npx dev-marketplace add explainer-video`              |
| `ffmpeg-skill`                 | 로컬 FFmpeg로 비디오/오디오 편집                        | `npx dev-marketplace add ffmpeg-skill`                 |
| `find-animation-opportunities` | 애니메이션이 필요한 곳 검색                             | `npx dev-marketplace add find-animation-opportunities` |
| `hyperframes`                  | HyperFrames로 비디오 생성, 편집, 애니메이션, 렌더링     | `npx dev-marketplace add hyperframes`                  |
| `hyperframes-cli`              | HyperFrames CLI - 스캐폴드, 체크, 편집, 렌더링          | `npx dev-marketplace add hyperframes-cli`              |
| `hyperframes-registry`         | 450+ 즉시 사용 가능한 HyperFrames 블록                  | `npx dev-marketplace add hyperframes-registry`         |
| `hyperframes-skill`            | HyperFrames로 HTML 씬에서 비디오 렌더링                 | `npx dev-marketplace add hyperframes-skill`            |
| `improve-animations`           | 모션 코드 감사, 개선 계획 생성                          | `npx dev-marketplace add improve-animations`           |
| `isometric-animation`          | 아이소메트릭 애니메이션 제작                            | `npx dev-marketplace add isometric-animation`          |
| `media-analysis`               | 미디어 파일의 결정론적 사실 측정                        | `npx dev-marketplace add media-analysis`               |
| `media-use`                    | HyperFrames 비디오용 미디어 가져오기 또는 제작          | `npx dev-marketplace add media-use`                    |
| `motion-graphics`              | 결정론적 모션 그래픽 렌더링                             | `npx dev-marketplace add motion-graphics`              |
| `nle-bridge-skill`             | Premiere Pro 또는 DaVinci Resolve로 편집 전달           | `npx dev-marketplace add nle-bridge-skill`             |
| `remotion-best-practices`      | 모든 Remotion 스킬 라우터                               | `npx dev-marketplace add remotion-best-practices`      |
| `remotion-captions`            | 자막 전사, 표시, 애니메이션                             | `npx dev-marketplace add remotion-captions`            |
| `remotion-create`              | 새 Remotion 비디오 생성                                 | `npx dev-marketplace add remotion-create`              |
| `remotion-docs`                | Remotion 문서 검색                                      | `npx dev-marketplace add remotion-docs`                |
| `remotion-ffmpeg-skill`        | Remotion으로 실사 푸티지에 모션 그래픽                  | `npx dev-marketplace add remotion-ffmpeg-skill`        |
| `remotion-interactivity`       | Studio 편집을 위한 Remotion 마크업 구조화               | `npx dev-marketplace add remotion-interactivity`       |
| `remotion-license`             | Remotion 라이선스 정보 찾기                             | `npx dev-marketplace add remotion-license`             |
| `remotion-maps`                | Remotion Map 애니메이션 지식                            | `npx dev-marketplace add remotion-maps`                |
| `remotion-markup`              | 콘텐츠, 애니메이션, 효과 모범 사례                      | `npx dev-marketplace add remotion-markup`              |
| `remotion-multimedia`          | Mediabunny와 상호작용                                   | `npx dev-marketplace add remotion-multimedia`          |
| `remotion-render`              | Remotion 비디오, 정지 이미지, OTIO 타임라인 내보내기    | `npx dev-marketplace add remotion-render`              |
| `remotion-saas`                | Remotion으로 앱 구축                                    | `npx dev-marketplace add remotion-saas`                |
| `remotion-studio`              | Remotion 비디오 미리보기                                | `npx dev-marketplace add remotion-studio`              |
| `remotion-to-hyperframes`      | 기존 비디오 코드를 HyperFrames로 가져오기               | `npx dev-marketplace add remotion-to-hyperframes`      |
| `remotion-upgrade`             | Remotion 및 관련 패키지 업그레이드                      | `npx dev-marketplace add remotion-upgrade`             |
| `remove-animations`            | 불필요한 애니메이션 찾아 제거                           | `npx dev-marketplace add remove-animations`            |
| `reverse-any-video`            | 모든 비디오를 편집 가능한 HyperFrames 프로젝트로 재구축 | `npx dev-marketplace add reverse-any-video`            |
| `review-animations`            | 애니메이션 및 모션 코드 리뷰                            | `npx dev-marketplace add review-animations`            |
| `slideshow`                    | 라이브 프레젠테이션용 HyperFrames 슬라이드쇼 구축       | `npx dev-marketplace add slideshow`                    |
| `sound-design-skill`           | 비디오용 음악 베드 및 효과음                            | `npx dev-marketplace add sound-design-skill`           |
| `subtitle-skill`               | 결정론적 자막 검증, SRT/VTT 생성                        | `npx dev-marketplace add subtitle-skill`               |
| `thumbnail-skill`              | 결정론적 썸네일 렌더링                                  | `npx dev-marketplace add thumbnail-skill`              |
| `video-editing-skill`          | 결정론적 비디오 편집                                    | `npx dev-marketplace add video-editing-skill`          |
| `video-production-agent`       | 소스 파일에서 비디오 계획 및 제작                       | `npx dev-marketplace add video-production-agent`       |
| `voice-enhance-skill`          | 로컬 엔진으로 녹음된 음성 정리                          | `npx dev-marketplace add voice-enhance-skill`          |
| `whiteboard-animation`         | 화이트보드 애니메이션 제작                              | `npx dev-marketplace add whiteboard-animation`         |
| `wrapped-video`                | Spotify Wrapped 스타일 비디오 제작                      | `npx dev-marketplace add wrapped-video`                |

---

## 저장소 구조

```text
dev-marketplace/
├── bin/
│   └── cli.js            # 독립형 제로 의존성 npx 러너
├── skills/               # 표준화된 스킬 패키지
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
├── registry.json         # 검색 가능한 기계 판독 인덱스
└── package.json          # npm bin 정의
```

---

## 오픈 소스 및 라이선스

이 레지스트리에 포함된 모든 스킬과 커넥터는 오픈 소스이며, 각자의 오픈 소스 라이선스 (MIT, Apache-2.0 또는 호환) 하에 자유롭게 재배포 가능합니다.

기여, 새로운 에이전트 스킬, 커뮤니티 커넥터를 풀 리퀘스트로 환영합니다!

---

## 번역

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
