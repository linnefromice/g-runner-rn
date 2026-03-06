# 推奨スキル・プラグイン活用ルール

本プロジェクトで積極的に活用すべきスキル・プラグインの使用指針。
該当する場面では、手動で同等の作業をするのではなく、スキルを呼び出すこと。

---

## 1. Superpowers

大規模な開発フローを体系化するスキル群。以下の場面で必ず使用する。

| 場面 | スキル | 備考 |
|------|--------|------|
| 新機能の設計 | `superpowers:brainstorming` | コード着手前に必ず設計対話を経る |
| 実装計画の作成 | `superpowers:writing-plans` | 3ステップ以上のタスクは計画ドキュメントを書く |
| 計画の実行 | `superpowers:subagent-driven-development` | タスクごとにサブエージェントを起動し、レビュー付きで実装 |
| バグ調査 | `superpowers:systematic-debugging` | 推測で修正せず、体系的に原因を特定 |
| 実装完了前 | `superpowers:verification-before-completion` | 「完了」と言う前に必ず検証コマンドを実行 |
| ブランチ完了 | `superpowers:finishing-a-development-branch` | マージ / PR / クリーンアップの判断 |

**判断基準**: 「1行の修正」以外のほぼすべての開発タスクで、いずれかの superpowers スキルが該当する。迷ったら使う。

---

## 2. Context7

ライブラリの最新ドキュメント・コード例を取得するスキル。

### 使用タイミング

- **ライブラリの API を使う前**: 記憶に頼らず、最新ドキュメントを確認する
- **エラーが発生した時**: ライブラリのバージョン差異による API 変更を疑う
- **新しいライブラリを導入する時**: 使用例やベストプラクティスを取得する

### 対象ライブラリ（本プロジェクトで頻出）

| ライブラリ | 確認すべき場面 |
|-----------|--------------|
| `@shopify/react-native-skia` | Canvas 描画、エフェクト実装 |
| `react-native-reanimated` | SharedValue、worklet、アニメーション |
| `react-native-gesture-handler` | ジェスチャー設定、v2 API |
| `expo-router` | ルーティング、パラメータ |
| `zustand` | ストア設計、ミドルウェア |
| `expo-av` | 音声再生 API |
| `expo-localization` | ロケール検出 |

### 使用方法

```
1. mcp__context7__resolve-library-id でライブラリIDを解決
2. mcp__context7__query-docs でドキュメントを取得
```

**判断基準**: 「このAPIの使い方は確実に知っている」と断言できない場合は context7 で確認する。

---

## 3. Ralph Loop

反復的な開発サイクル（実装→テスト→修正→テスト→...）を自動化するスキル。

### 使用タイミング

- テストが失敗していて修正が必要な時
- lint / tsc エラーを連続で修正する時
- 複数ファイルに渡る一貫した変更を段階的に適用する時

### 使用方法

`ralph-loop:ralph-loop` で開始。ループ内で自動的にテスト実行→失敗箇所修正→再テストを繰り返す。

**判断基準**: 「テスト/lint を通すまで何回か修正が必要そう」と予想される場面で使用する。

---

## 4. Feature Dev（開発支援系）

コードベースの深い理解に基づく開発支援。3つの専門エージェントから構成。

| エージェント | 用途 | 使用タイミング |
|------------|------|--------------|
| `feature-dev:code-explorer` | 既存コードの実行パス追跡、依存分析 | 新機能追加前にコードベースを理解する時 |
| `feature-dev:code-architect` | 既存パターンに沿った設計提案 | アーキテクチャ判断が必要な時 |
| `feature-dev:code-reviewer` | バグ・ロジックエラー・セキュリティの検出 | 実装完了後、コミット前 |

### 使用タイミング

- **新しいシステム追加時**: `code-explorer` で既存システムのパターンを分析 → `code-architect` で設計
- **既存システムの拡張時**: `code-explorer` で影響範囲を特定
- **PR 作成前**: `code-reviewer` でセルフレビュー

**判断基準**: 「このコードベースのパターンに従っているか自信がない」場面で使用する。

---

## 5. Vercel React Native Skills

React Native / Expo のベストプラクティスを適用するスキル。

### 使用タイミング

- React Native コンポーネントの作成・修正時
- リスト/FlatList のパフォーマンス最適化
- アニメーション実装時
- ネイティブモジュール連携時
- Expo 固有の設定・ビルド設定時

### 本プロジェクトでの適用場面

| 場面 | 確認すべきポイント |
|------|------------------|
| HUD コンポーネント (`src/ui/`) | 再レンダリング最適化、memo 化 |
| Skia Canvas 統合 | ネイティブスレッドとの連携 |
| Gesture Handler 設定 | v2 API のベストプラクティス |
| Expo Router 画面遷移 | ディープリンク、パラメータ |
| EAS Build 設定 | プロファイル、環境変数 |

**判断基準**: React Native / Expo に関わるコードを書く・修正するすべての場面で使用を検討する。

---

## 推奨フロー例

### 新機能開発

```
1. superpowers:brainstorming     ← 設計対話
2. superpowers:writing-plans     ← 実装計画
3. feature-dev:code-explorer     ← 既存コード理解
4. context7                      ← ライブラリ API 確認
5. superpowers:subagent-driven-development ← 実装
6. vercel-react-native-skills    ← RN ベストプラクティス確認
7. feature-dev:code-reviewer     ← セルフレビュー
8. superpowers:finishing-a-development-branch ← 完了
```

### バグ修正

```
1. superpowers:systematic-debugging ← 原因特定
2. context7                         ← API 仕様確認
3. ralph-loop:ralph-loop            ← 修正→テスト反復
4. superpowers:verification-before-completion ← 検証
```
