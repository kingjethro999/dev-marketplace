# Dev Marketplace

[![Skills Count](https://img.shields.io/badge/skills-133%20curated-blue.svg?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Compatible with Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-orange?style=flat-square)](https://docs.anthropic.com/en/docs/claude-code)
[![Compatible with Cursor & Antigravity](https://img.shields.io/badge/Agent-Cursor%20%7C%20Antigravity%20%7C%20Codex-purple?style=flat-square)](https://github.com/kingjethro999/dev-marketplace)
[![Vercel Skills Standard](https://img.shields.io/badge/npx%20skills-ready-black?style=flat-square)](https://skills.sh)

**133+ の厳選された実戦テスト済み AI エージェントスキル、言語サーバー (LSP) コネクタ、デザインエンジン、コード品質検証ツール、ビデオ合成ツールキット** を備えたオープンソース開発者マーケットプレイス。

**Claude Code**、**Cursor**、**Antigravity (`agy`)**、**Codex**、および標準 `SKILL.md` 仕様に従うあらゆるエージェントプラットフォームと互換性があります。

---

## クイックスタート

任意のスキルを直接プロジェクトにインストール：

```bash
# 組み込みのマーケットプレイスランナーを使用：
npx dev-marketplace add <skill-name>

# またはオープンな skills.sh 標準を使用：
npx skills add kingjethro999/dev-marketplace --skill <skill-name>
```

### インストール例

```bash
# Apple インターフェースデザインガイドラインをインストール
npx dev-marketplace add apple-design

# コードレビューとテスト駆動開発ツールキットをインストール
npx dev-marketplace add code-review test-driven-development systematic-debugging

# すべての Video & Motion 合成スキルをインストール
npx dev-marketplace add --category "Video & Motion"

# すべての LSP コネクタをインストール (TypeScript, Python, Rust, Go, C++, Swift...)
npx dev-marketplace add --category "Connectors & LSP"

# マーケットプレイス全体をプロジェクトに同期：
npx dev-marketplace add --all

# またはホームエージェントディレクトリ (~/.agents/skills) にグローバルインストール：
npx dev-marketplace add --all --global
```

---

## CLI コマンド

| コマンド                                      | 説明                                                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npx dev-marketplace list`                    | キーワードやカテゴリで利用可能なすべてのスキルを検索・フィルタ                                           |
| `npx dev-marketplace add <name...>`           | 指定したスキルを現在のプロジェクトにコピー (`.agents/skills`, `.claude/skills`, または `.gemini/skills`) |
| `npx dev-marketplace add --all`               | すべての 133+ マーケットプレイススキルを一度にインストール                                               |
| `npx dev-marketplace add --category "<name>"` | 特定のカテゴリに属するすべてのスキルをインストール                                                       |
| `npx dev-marketplace info <name>`             | 完全なスキル説明、フロントマター、ファイル内容を検査                                                     |
| `npx dev-marketplace categories`              | すべてのマーケットプレイスカテゴリとその数を一覧                                                         |

---

## マーケットプレイスカタログ (133 スキル & コネクタ)

### コードレビューと品質 (16 スキル)

| スキル                           | 説明                                                                                           | インストール                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `claude-security`                | エージェントチームをセキュリティ研究者としてコードベースに投入                                 | `npx dev-marketplace add claude-security`                |
| `pr-review-toolkit`              | 徹底的な PR レビューのための専門エージェントの包括的コレクション                               | `npx dev-marketplace add pr-review-toolkit`              |
| `qc-skill`                       | 決定論的メディア品質管理/検証                                                                  | `npx dev-marketplace add qc-skill`                       |
| `receiving-code-review`          | コードレビューフィードバックを受けるときに使用                                                 | `npx dev-marketplace add receiving-code-review`          |
| `requesting-code-review`         | タスク完了時、マージ前に使用                                                                   | `npx dev-marketplace add requesting-code-review`         |
| `security`                       | コードのセキュリティ問題をレビュー                                                             | `npx dev-marketplace add security`                       |
| `security-and-hardening`         | 脆弱性に対してコードを強化                                                                     | `npx dev-marketplace add security-and-hardening`         |
| `systematic-debugging`           | あらゆるバグやテスト失敗に遭遇したときに使用                                                   | `npx dev-marketplace add systematic-debugging`           |
| `test-driven-development`        | あらゆる機能やバグ修正の実装時に使用                                                           | `npx dev-marketplace add test-driven-development`        |
| `verification-before-completion` | 作業完了を主張する前に使用                                                                     | `npx dev-marketplace add verification-before-completion` |
| `leak-spots`                     | Periderm CLI で Git 履歴の漏洩シークレットを検出                                               | `npx dev-marketplace add leak-spots`                     |
| `launch-ready`                   | Periderm CLI スキャン & レビューによる事前検証                                                 | `npx dev-marketplace add launch-ready`                   |
| `branch-sec`                     | ブランチ保護、署名付きコミット、Periderm チェックを強制                                        | `npx dev-marketplace add branch-sec`                     |
| `cyber-sec`                      | サイバーセキュリティツールキット: 脅威モデリング, OWASP, 暗号監査                              | `npx dev-marketplace add cyber-sec`                      |
| `commit-hook`                    | Periderm CLI 統合付き Git フック                                                               | `npx dev-marketplace add commit-hook`                    |
| `repo-sec`                       | リポジトリセキュリティ強化: 署名付きコミット, ブランチ保護, シークレットスキャン, 依存関係監査 | `npx dev-marketplace add repo-sec`                       |

### コネクタと LSP (15 スキル)

| スキル              | 説明                                                      | インストール                                |
| ------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `clangd-lsp`        | Claude Code 用 C/C++ 言語サーバー (clangd)                | `npx dev-marketplace add clangd-lsp`        |
| `context7-mcp`      | ライブラリ/フレームワーク API リファレンスとコード例      | `npx dev-marketplace add context7-mcp`      |
| `csharp-lsp`        | Claude Code 用 C# 言語サーバー                            | `npx dev-marketplace add csharp-lsp`        |
| `gopls-lsp`         | Claude Code 用 Go 言語サーバー                            | `npx dev-marketplace add gopls-lsp`         |
| `jdtls-lsp`         | Claude Code 用 Java 言語サーバー (Eclipse JDT.LS)         | `npx dev-marketplace add jdtls-lsp`         |
| `kotlin-lsp`        | Claude Code 用 Kotlin 言語サーバー                        | `npx dev-marketplace add kotlin-lsp`        |
| `lua-lsp`           | Claude Code 用 Lua 言語サーバー                           | `npx dev-marketplace add lua-lsp`           |
| `mcp-server-dev`    | MCP サーバーの設計と構築のためのスキル                    | `npx dev-marketplace add mcp-server-dev`    |
| `mcp-tunnels`       | プライベートネットワーク内の MCP サーバーに Claude を接続 | `npx dev-marketplace add mcp-tunnels`       |
| `php-lsp`           | Claude Code 用 PHP 言語サーバー (Intelephense)            | `npx dev-marketplace add php-lsp`           |
| `pyright-lsp`       | Claude Code 用 Python 言語サーバー (Pyright)              | `npx dev-marketplace add pyright-lsp`       |
| `ruby-lsp`          | Claude Code 用 Ruby 言語サーバー                          | `npx dev-marketplace add ruby-lsp`          |
| `rust-analyzer-lsp` | Claude Code 用 Rust 言語サーバー                          | `npx dev-marketplace add rust-analyzer-lsp` |
| `swift-lsp`         | Claude Code 用 Swift 言語サーバー (SourceKit-LSP)         | `npx dev-marketplace add swift-lsp`         |
| `typescript-lsp`    | Claude Code 用 TypeScript/JavaScript 言語サーバー         | `npx dev-marketplace add typescript-lsp`    |

### デザインと UI (14 スキル)

| スキル                | 説明                                                             | インストール                                  |
| --------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| `apple-design`        | Apple のインターフェースデザインと流動的なモーションのアプローチ | `npx dev-marketplace add apple-design`        |
| `break-ui`            | 最悪ケースのデータで UI をストレステスト                         | `npx dev-marketplace add break-ui`            |
| `design-mobile-apps`  | Sleek でモバイルアプリ画面をデザイン                             | `npx dev-marketplace add design-mobile-apps`  |
| `emil-design-eng`     | Emil Kowalski のデザインエンジニアリング哲学                     | `npx dev-marketplace add emil-design-eng`     |
| `figma`               | Figma を HyperFrames ビデオに導入                                | `npx dev-marketplace add figma`               |
| `figma-designer`      | 実際の変数とオートレイアウトで Figma 内でデザイン                | `npx dev-marketplace add figma-designer`      |
| `firecrawl-build`     | Web データのための Firecrawl 統合                                | `npx dev-marketplace add firecrawl-build`     |
| `gestures`            | ドラッグ、スワイプ、シートインタラクションを構築                 | `npx dev-marketplace add gestures`            |
| `impeccable`          | フロントエンドインターフェースを設計、批評、監査、磨き上げ       | `npx dev-marketplace add impeccable`          |
| `improve`             | コードベースをシニアアドバイザーとして調査、実装計画を作成       | `npx dev-marketplace add improve`             |
| `landing-page-design` | 高コンバージョンランディングページの完全システム                 | `npx dev-marketplace add landing-page-design` |
| `learn-taste`         | デザイン修正を DESIGN.md のルールに変換                          | `npx dev-marketplace add learn-taste`         |
| `pick-ui-library`     | フロントエンドタスクに適したライブラリを選択                     | `npx dev-marketplace add pick-ui-library`     |
| `prototype`           | ビジュアルピッカーの背後に複数の UI バージョンを構築             | `npx dev-marketplace add prototype`           |

### 開発者ツールと AI (27 スキル)

| スキル                           | 説明                                                                                 | インストール                                             |
| -------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `artifacts-skill`                | 実世界の成果物のためのローカルファースト実行と検証                                   | `npx dev-marketplace add artifacts-skill`                |
| `ask-emil`                       | このリポジトリのスキルのルーター                                                     | `npx dev-marketplace add ask-emil`                       |
| `ask-sonner`                     | React トーストライブラリ Sonner のガイド                                             | `npx dev-marketplace add ask-sonner`                     |
| `brainstorming`                  | あらゆるクリエイティブワークの前に使用                                               | `npx dev-marketplace add brainstorming`                  |
| `caveman`                        | 簡潔な原人ボイスモード                                                               | `npx dev-marketplace add caveman`                        |
| `choreograph`                    | 一緒にアニメートする要素を調整                                                       | `npx dev-marketplace add choreograph`                    |
| `claude-md-management`           | CLAUDE.md ファイルの維持と改善ツール                                                 | `npx dev-marketplace add claude-md-management`           |
| `color-grading`                  | 決定論的カラーグレーディング/カラーコレクション                                      | `npx dev-marketplace add color-grading`                  |
| `feature-dev`                    | 包括的な機能開発ワークフロー                                                         | `npx dev-marketplace add feature-dev`                    |
| `find-skills`                    | エージェントスキルの発見とインストール                                               | `npx dev-marketplace add find-skills`                    |
| `finishing-a-development-branch` | 完了した作業の統合方法を決定                                                         | `npx dev-marketplace add finishing-a-development-branch` |
| `html-demo`                      | HTML シミュレーションで Web ページ上でアプリを動作表示                               | `npx dev-marketplace add html-demo`                      |
| `imagemagick-skill`              | ローカル ImageMagick 画像編集                                                        | `npx dev-marketplace add imagemagick-skill`              |
| `ingest-skill`                   | カメラカードとレコーダーを安全にオフロード                                           | `npx dev-marketplace add ingest-skill`                   |
| `mobile-native`                  | Web アプリをスマホでネイティブのように感じさせる                                     | `npx dev-marketplace add mobile-native`                  |
| `product-demo`                   | 洗練された製品デモビデオを録画                                                       | `npx dev-marketplace add product-demo`                   |
| `product-film`                   | 短い製品フィルムを作成                                                               | `npx dev-marketplace add product-film`                   |
| `publish-skill`                  | 完成した成果物をプラットフォームにアップロード                                       | `npx dev-marketplace add publish-skill`                  |
| `reverse-engineer-anything`      | ネイティブ、マネージド、Electron、ファームウェアターゲットをリバースエンジニアリング | `npx dev-marketplace add reverse-engineer-anything`      |
| `skillpact`                      | SkillPact 契約の作成とチェック                                                       | `npx dev-marketplace add skillpact`                      |
| `slide-sync-skill`               | 録画のスライド変更を見つけ、チャプターを作成                                         | `npx dev-marketplace add slide-sync-skill`               |
| `stepcap`                        | stepcap 録画フォルダで作業                                                           | `npx dev-marketplace add stepcap`                        |
| `style-sampling`                 | 実証済みのビデオスタイルで新しいエピソードを作成                                     | `npx dev-marketplace add style-sampling`                 |
| `transcription-skill`            | 音声/ビデオファイルの音声を文字起こし                                                | `npx dev-marketplace add transcription-skill`            |
| `website-scroll`                 | 任意の Web ページのトップツーボトムスクロールを録画                                  | `npx dev-marketplace add website-scroll`                 |
| `write-swift`                    | モダン Swift を正しく書く方法                                                        | `npx dev-marketplace add write-swift`                    |
| `writing-skills`                 | デプロイ前にスキルを作成、編集、検証                                                 | `npx dev-marketplace add writing-skills`                 |

### エンジニアリングとワークフロー (18 スキル)

| スキル                        | 説明                                                                                                | インストール                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `code-modernization`          | 証拠とともにレガシーコードベースをモダナイズ                                                        | `npx dev-marketplace add code-modernization`          |
| `commit-commands`             | Git ワークフローを効率化                                                                            | `npx dev-marketplace add commit-commands`             |
| `diagnosing-superpowers`      | Superpowers セッションが失敗した理由を診断                                                          | `npx dev-marketplace add diagnosing-superpowers`      |
| `dispatching-parallel-agents` | 2+ の独立したタスクを並列実行                                                                       | `npx dev-marketplace add dispatching-parallel-agents` |
| `executing-plans`             | 実装計画をインラインで実行                                                                          | `npx dev-marketplace add executing-plans`             |
| `hookify`                     | 望ましくない動作を防ぐカスタムフックを作成                                                          | `npx dev-marketplace add hookify`                     |
| `ralph-loop`                  | 反復的 AI 開発のための Ralph Wiggum テクニック                                                      | `npx dev-marketplace add ralph-loop`                  |
| `session-report`              | session-report のコネクタとツール                                                                   | `npx dev-marketplace add session-report`              |
| `subagent-driven-development` | 独立したタスクで実装計画を実行                                                                      | `npx dev-marketplace add subagent-driven-development` |
| `using-git-worktrees`         | 分離で機能作業を開始                                                                                | `npx dev-marketplace add using-git-worktrees`         |
| `using-superpowers`           | スキルの見つけ方と使い方を確立                                                                      | `npx dev-marketplace add using-superpowers`           |
| `writing-plans`               | コードに触れる前に計画を書く                                                                        | `npx dev-marketplace add writing-plans`               |
| `leak-spots`                  | Periderm CLI で Git 履歴の漏洩シークレットを検出                                                    | `npx dev-marketplace add leak-spots`                  |
| `launch-ready`                | Periderm CLI スキャン & レビューによる事前検証                                                      | `npx dev-marketplace add launch-ready`                |
| `branch-sec`                  | ブランチ保護、署名付きコミット、Periderm チェックを強制                                             | `npx dev-marketplace add branch-sec`                  |
| `cyber-sec`                   | サイバーセキュリティツールキット: 脅威モデリング, OWASP, 暗号監査                                   | `npx dev-marketplace add cyber-sec`                   |
| `commit-hook`                 | Periderm CLI 統合付き Git フック                                                                    | `npx dev-marketplace add commit-hook`                 |
| `ci-cd`                       | CI/CD パイプラインアナライザー/ジェネレーター: GitHub Actions, GitLab CI, CircleCI, Azure Pipelines | `npx dev-marketplace add ci-cd`                       |

### ビデオとモーション (48 スキル)

| スキル                         | 説明                                                             | インストール                                           |
| ------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------ |
| `animate`                      | ゼロからアニメーションを構築                                     | `npx dev-marketplace add animate`                      |
| `animate-expo`                 | React Native と Expo でアニメーションを構築                      | `npx dev-marketplace add animate-expo`                 |
| `animation-performance`        | Web アニメーションをフレーム予算内に維持                         | `npx dev-marketplace add animation-performance`        |
| `animation-vocabulary`         | モーションエフェクトの逆引き用語集                               | `npx dev-marketplace add animation-vocabulary`         |
| `audio-production`             | 決定論的オーディオ制作実行                                       | `npx dev-marketplace add audio-production`             |
| `blender-skill`                | 3D アセットの検査、変換、最適化、レンダリング                    | `npx dev-marketplace add blender-skill`                |
| `diagram-animation`            | 図表、フローチャート、チャートをアニメート                       | `npx dev-marketplace add diagram-animation`            |
| `dubbing`                      | ローカル TTS でテキストを読み上げ、ビデオに挿入                  | `npx dev-marketplace add dubbing`                      |
| `explainer-video`              | 説明ビデオを作成                                                 | `npx dev-marketplace add explainer-video`              |
| `ffmpeg-skill`                 | ローカル FFmpeg でビデオ/オーディオを編集                        | `npx dev-marketplace add ffmpeg-skill`                 |
| `find-animation-opportunities` | アニメーションすべき場所を検索                                   | `npx dev-marketplace add find-animation-opportunities` |
| `hyperframes`                  | HyperFrames でビデオを作成、編集、アニメート、レンダリング       | `npx dev-marketplace add hyperframes`                  |
| `hyperframes-cli`              | HyperFrames CLI - スキャフォールド, チェック, 編集, レンダリング | `npx dev-marketplace add hyperframes-cli`              |
| `hyperframes-registry`         | 450+ の即座に使える HyperFrames ブロック                         | `npx dev-marketplace add hyperframes-registry`         |
| `hyperframes-skill`            | HyperFrames で HTML シーンからビデオをレンダリング               | `npx dev-marketplace add hyperframes-skill`            |
| `improve-animations`           | モーションコードを監査、改善計画を作成                           | `npx dev-marketplace add improve-animations`           |
| `isometric-animation`          | アイソメトリックアニメーションを作成                             | `npx dev-marketplace add isometric-animation`          |
| `media-analysis`               | メディアファイルの決定論的事実を測定                             | `npx dev-marketplace add media-analysis`               |
| `media-use`                    | HyperFrames ビデオのメディアを取得または作成                     | `npx dev-marketplace add media-use`                    |
| `motion-graphics`              | 決定論的モーショングラフィックスレンダリング                     | `npx dev-marketplace add motion-graphics`              |
| `nle-bridge-skill`             | Premiere Pro または DaVinci Resolve に編集を渡す                 | `npx dev-marketplace add nle-bridge-skill`             |
| `remotion-best-practices`      | すべての Remotion スキルのルーター                               | `npx dev-marketplace add remotion-best-practices`      |
| `remotion-captions`            | 字幕の文字起こし、表示、アニメーション                           | `npx dev-marketplace add remotion-captions`            |
| `remotion-create`              | 新しい Remotion ビデオを作成                                     | `npx dev-marketplace add remotion-create`              |
| `remotion-docs`                | Remotion ドキュメントを検索                                      | `npx dev-marketplace add remotion-docs`                |
| `remotion-ffmpeg-skill`        | Remotion で実映像上にモーショングラフィックス                    | `npx dev-marketplace add remotion-ffmpeg-skill`        |
| `remotion-interactivity`       | Studio 編集用に Remotion マークアップを構造化                    | `npx dev-marketplace add remotion-interactivity`       |
| `remotion-license`             | Remotion ライセンス情報を検索                                    | `npx dev-marketplace add remotion-license`             |
| `remotion-maps`                | Remotion Map アニメーション知識                                  | `npx dev-marketplace add remotion-maps`                |
| `remotion-markup`              | コンテンツ、アニメーション、エフェクトのベストプラクティス       | `npx dev-marketplace add remotion-markup`              |
| `remotion-multimedia`          | Mediabunny と対話                                                | `npx dev-marketplace add remotion-multimedia`          |
| `remotion-render`              | Remotion ビデオ、静止画、OTIO タイムラインをエクスポート         | `npx dev-marketplace add remotion-render`              |
| `remotion-saas`                | Remotion でアプリを構築                                          | `npx dev-marketplace add remotion-saas`                |
| `remotion-studio`              | Remotion ビデオをプレビュー                                      | `npx dev-marketplace add remotion-studio`              |
| `remotion-to-hyperframes`      | 既存のビデオコードを HyperFrames に導入                          | `npx dev-marketplace add remotion-to-hyperframes`      |
| `remotion-upgrade`             | Remotion と関連パッケージをアップグレード                        | `npx dev-marketplace add remotion-upgrade`             |
| `remove-animations`            | 不要なアニメーションを見つけて削除                               | `npx dev-marketplace add remove-animations`            |
| `reverse-any-video`            | 任意のビデオを編集可能な HyperFrames プロジェクトとして再構築    | `npx dev-marketplace add reverse-any-video`            |
| `review-animations`            | アニメーションとモーションコードをレビュー                       | `npx dev-marketplace add review-animations`            |
| `slideshow`                    | ライブプレゼンテーション用 HyperFrames スライドショーを構築      | `npx dev-marketplace add slideshow`                    |
| `sound-design-skill`           | ビデオ用のミュージックベッドと効果音                             | `npx dev-marketplace add sound-design-skill`           |
| `subtitle-skill`               | 決定論的字幕検証, SRT/VTT 生成                                   | `npx dev-marketplace add subtitle-skill`               |
| `thumbnail-skill`              | 決定論的サムネイルレンダリング                                   | `npx dev-marketplace add thumbnail-skill`              |
| `video-editing-skill`          | 決定論的ビデオ編集                                               | `npx dev-marketplace add video-editing-skill`          |
| `video-production-agent`       | ソースファイルからビデオを計画・制作                             | `npx dev-marketplace add video-production-agent`       |
| `voice-enhance-skill`          | ローカルエンジンで録音音声をクリーンアップ                       | `npx dev-marketplace add voice-enhance-skill`          |
| `whiteboard-animation`         | ホワイトボードアニメーションを作成                               | `npx dev-marketplace add whiteboard-animation`         |
| `wrapped-video`                | Spotify Wrapped スタイルのビデオを作成                           | `npx dev-marketplace add wrapped-video`                |

---

## リポジトリ構造

```text
dev-marketplace/
├── bin/
│   └── cli.js            # スタンドアローン ゼロ依存 npx ランナー
├── skills/               # 標準化されたスキルパッケージ
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
├── registry.json         # 検索可能な機械可読インデックス
└── package.json          # npm bin 定義
```

---

## オープンソースとライセンス

このレジストリに含まれるすべてのスキルとコネクタはオープンソースであり、それぞれのオープンソースライセンス (MIT, Apache-2.0, または互換性のあるもの) の下で自由に再配布可能です。

貢献、新しいエージェントスキル、コミュニティコネクタをプルリクエストで歓迎します！

---

## 翻訳

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
