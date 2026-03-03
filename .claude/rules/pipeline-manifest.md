# パイプラインマニフェスト仕様

`/pipeline` コマンドで使用するタスクマニフェストの YAML 形式定義。

---

## ファイル配置

マニフェストファイルは `.ai/tasks/` 配下に配置:

```
.ai/tasks/
├── design/
│   └── 20260210-feature-spec.md        # 設計ドキュメント
├── prompts/
│   └── pipeline-boss-encounter.yml     # パイプラインマニフェスト
└── records/
    └── 20260210-investigation.md       # 調査記録
```

---

## YAML スキーマ

```yaml
# 必須フィールド
name: string          # パイプライン名（kebab-case）
branch: string        # 作成するブランチ名
tasks: Task[]         # タスクリスト（1つ以上）

# オプションフィールド
base: string          # ベースブランチ（デフォルト: main）
pr:                   # PR設定
  title: string       # PRタイトル
  labels: string[]    # ラベル
commit_strategy: "layered" | "per-task"  # コミット戦略（デフォルト: layered）
```

### Task スキーマ

```yaml
# 必須フィールド
id: string # タスクID（一意、英数字+ハイフン）
description: string # タスクの説明（実行指示として十分な詳細さ）

# オプションフィールド
files: string[] # 変更対象ファイル（コンフリクト検出に使用）
depends_on: string[] # 依存タスクID
command: string # 実行するシェルコマンド（定型処理用）
agent: string # 使用するエージェント名（planner, code-reviewer 等）
skip_on_fail: boolean # 失敗時にスキップするか（デフォルト: false）
```

---

## 依存関係のルール

1. **循環依存は禁止**: `A → B → A` のような循環は検出時にエラー
2. **暗黙的依存**: 同じファイルを変更するタスクは宣言がなくても順次実行
3. **依存なしタスク**: `depends_on` がないタスクは他のタスクと並列実行可能

### 依存グラフの例

```yaml
tasks:
    - id: types # 依存なし → 最初に実行
      description: "..."
    - id: engine # types に依存
      depends_on: [types]
    - id: rendering # types に依存（engine と並列実行可能）
      depends_on: [types]
    - id: screen # engine, rendering の両方に依存
      depends_on: [engine, rendering]
```

実行順序:

```
[types] → [engine, rendering]（並列） → [screen]
```

---

## コミット戦略

### `layered`（デフォルト）

git-workflow.md の実装順序に従い、レイヤーごとにコミット:

```
1. データ定義   → "feat: Add boss phase data definitions"
2. エンジン     → "feat: Add boss encounter system"
3. レンダリング → "feat: Add boss rendering with Skia"
4. UI           → "feat: Add boss HP bar HUD"
```

### `per-task`

タスクごとに1コミット:

```
1. types       → "feat: Define boss entity types"
2. engine      → "feat: Implement boss AI system"
3. rendering   → "feat: Add boss sprite rendering"
4. hud         → "feat: Add boss HP bar to HUD"
```

---

## 完全なマニフェスト例

```yaml
name: boss-encounter-system
branch: feature/boss-encounter
base: main
commit_strategy: layered
pr:
    title: "feat: ボスエンカウントシステムの追加"
    labels: [feature, game-engine]

tasks:
    - id: types
      description: |
          BossEntity, BossPhaseState, BossAttackPattern の
          型定義を src/types/ に追加する
      files:
          - src/types/boss.ts

    - id: data
      description: |
          ボスの攻撃パターン、HP、フェーズ遷移の
          データ定義を src/game/bosses/ に追加する
      files:
          - src/game/bosses/stage1-boss.ts
      depends_on: [types]

    - id: engine
      description: |
          BossSystem（AI、攻撃パターン、フェーズ遷移）を
          src/engine/systems/ に追加する。
          RNGE system として実装し、エンティティを直接変異させる。
      files:
          - src/engine/systems/boss-system.ts
      depends_on: [data]

    - id: rendering
      description: |
          Skia で Boss エンティティを描画する関数を追加。
          グロー・ネオンエフェクトを含む。
      files:
          - src/rendering/boss-renderer.ts
      depends_on: [types]

    - id: hud
      description: |
          ボスHP バーのHUDコンポーネントを追加。
          Zustand gameSessionStore から HP を取得して表示。
      files:
          - src/ui/boss-hp-bar.tsx
      depends_on: [engine]
```

---

## バリデーション

マニフェスト読み込み時に以下を検証:

| チェック                          | エラー時の挙動                       |
| --------------------------------- | ------------------------------------ |
| `name` が kebab-case か           | エラーで停止                         |
| `tasks` が1つ以上あるか           | エラーで停止                         |
| `id` がユニークか                 | エラーで停止                         |
| `depends_on` の参照先が存在するか | エラーで停止                         |
| 循環依存がないか                  | エラーで停止                         |
| `files` の重複（タスク間）        | 警告を表示、順次実行にフォールバック |
