---
name: add-game-content
description: "新しいゲームコンテンツ（エネミー、ステージ、メカフォーム）追加時のガイド。変更すべきファイル群と手順をチェックリスト形式で提示する。"
metadata:
  author: project
  version: "1.0.0"
---

# Add Game Content

新しいゲームコンテンツを追加する際に、変更すべきファイルと手順を漏れなく案内するガイドスキル。

## 使い方

1. ユーザーの依頼からコンテンツ種別（enemy / stage / form）を判定する
2. 該当するチェックリストを提示する
3. 実装順序は `git-workflow.md` のレイヤー順（型定義 → データ → エンジン → レンダリング → i18n）に従う
4. 各ファイルの変更完了後、i18n キー同期テスト (`npx jest src/i18n`) を実行して漏れを検出する

---

## 1. エネミー追加チェックリスト

新エネミータイプ（例: dodger, sentinel, carrier）の追加時。

### 必須ファイル（8箇所）

| # | レイヤー | ファイル | 変更内容 |
|---|----------|----------|----------|
| 1 | 型定義 | `src/types/enemies.ts` | `EnemyType` ユニオンに新タイプを追加 |
| 2 | バランス | `src/constants/balance.ts` | `ENEMY_STATS` にHP・攻撃力・スコア等を追加。特殊行動の定数も追加（例: `DODGER_COOLDOWN`） |
| 3 | ヒットボックス | `src/constants/dimensions.ts` | `HITBOX` に幅・高さを追加 |
| 4 | エンティティ生成 | `src/engine/entities/Enemy.ts` | `getEnemyHitbox()` に case 追加 |
| 5 | AI・行動ロジック | `src/engine/systems/EnemyAISystem.ts` | 移動パターンと射撃パターンを追加 |
| 6 | レンダリング | `src/rendering/shapes.ts` | 形状描画関数を追加、`getEntityPath()` に case 追加 |
| 7 | i18n (EN) | `src/i18n/locales/en.ts` | `enemies` オブジェクトにキー追加 |
| 8 | i18n (JA) | `src/i18n/locales/ja.ts` | `enemies` オブジェクトにキー追加 |

### 条件付きファイル

| 条件 | ファイル | 変更内容 |
|------|----------|----------|
| 死亡時に特殊効果（例: splitter） | `src/engine/systems/CollisionSystem.ts` | 死亡処理に分岐追加 |
| ステージで使用する | `src/game/stages/stage[N].ts` | タイムラインに `enemy_spawn` イベント追加 |

### よくある忘れ物

- `dimensions.ts` のヒットボックス登録漏れ（コンパイルは通るが当たり判定がおかしくなる）
- `balance.ts` の特殊行動定数（マジックナンバーでハードコードしがち）
- i18n の片方だけ追加（テストで検出可能）

---

## 2. ステージ追加チェックリスト

新ステージ（例: Stage 16）の追加時。

### 必須ファイル（2箇所）

| # | レイヤー | ファイル | 変更内容 |
|---|----------|----------|----------|
| 1 | データ定義 | `src/game/stages/stage[N].ts` | `StageDefinition` を新規作成。`id`, `name`, `isBossStage`, `duration`, `difficulty`, `timeline` を定義 |
| 2 | レジストリ | `src/game/stages/index.ts` | import 追加 + `STAGES` レコードにエントリ追加 |

### ステージ定義の構造

```typescript
// timeline イベントタイプ
{ time, type: 'enemy_spawn', enemyType, x, count? }
{ time, type: 'gate_spawn', gateConfig }
{ time, type: 'boss_spawn', bossId }
{ time, type: 'debris_spawn', x, count? }
{ time, type: 'boost_lane_start', x, width }
{ time, type: 'boost_lane_end' }
```

### よくある忘れ物

- `stages/index.ts` への登録漏れ（import しただけで `STAGES` に追加していない）
- ステージ名は i18n ではなく `StageDefinition.name` に直接記述（注意: 多言語対応されていない）
- ボスステージの場合 `isBossStage: true` の設定漏れ

---

## 3. メカフォーム追加チェックリスト

新メカフォーム（例: SD_Guardian）の追加時。

### 必須ファイル（7箇所）

| # | レイヤー | ファイル | 変更内容 |
|---|----------|----------|----------|
| 1 | 型定義 | `src/types/forms.ts` | `MechaFormId` ユニオンに新IDを追加 |
| 2 | フォーム設定 | `src/game/forms.ts` | `FORM_DEFINITIONS` にステータス・スプライト・弾設定を追加 |
| 3 | スキルツリー | `src/game/formSkills.ts` | 3レベル × 2選択肢のスキル定義を追加 |
| 4 | レンダリング | `src/rendering/shapes.ts` | プレイヤー形状関数追加、`getEntityPath()` に `'player_[FormId]'` case 追加 |
| 5 | i18n (EN) | `src/i18n/locales/en.ts` | `forms` にフォーム名、`abilities` に特殊能力名を追加 |
| 6 | i18n (JA) | `src/i18n/locales/ja.ts` | `forms` と `abilities` に日本語訳を追加 |
| 7 | 型定義（条件付き） | `src/types/formSkills.ts` | 新しい `FormSkillStatType` や `FormSkillPassiveId` が必要な場合 |

### よくある忘れ物

- `spriteConfig` の色設定（bodyColor, accentColor, glowColor）漏れ
- `bulletConfig`（幅・高さ・速度・色・弾数）漏れ — ゲームプレイに直結
- スキルツリー（3レベル × 2選択肢 = 6エントリ）の不足
- i18n で `forms` だけ追加して `abilities` を忘れる
- レンダリング形状関数を追加したが `getEntityPath()` の switch に登録していない

---

## 共通: i18n 追加ルール

すべてのコンテンツ追加で i18n キーを追加する場合の必須手順。

### 手順

1. `src/i18n/locales/en.ts` にキーと英語値を追加（`as const` で定義）
2. `src/i18n/locales/ja.ts` に同じキーと日本語値を追加
3. `npx jest src/i18n` でキー同期テストを実行

### 仕組み

- `en.ts` は `as const` + `Widen<T>` で `Translations` 型を自動導出
- `ja.ts` は `Translations` 型として定義 → 構造不一致はコンパイルエラー
- `locale-keys.test.ts` がキー数と構造の一致を検証 → CI でブロック

### 複雑なコンテンツ（How to Play 等）

```
src/i18n/content/how-to-play.types.ts  ← 型定義
src/i18n/content/how-to-play.en.ts     ← 英語コンテンツ
src/i18n/content/how-to-play.ja.ts     ← 日本語コンテンツ
```

---

## 実装順序（必ず従う）

```
1. 型定義        → src/types/
2. データ定義     → src/game/, src/constants/
3. エンジンロジック → src/engine/
4. レンダリング    → src/rendering/
5. i18n          → src/i18n/locales/
6. テスト実行     → npx jest src/i18n && npx tsc --noEmit
```

この順序は `git-workflow.md` の機能実装順序に準拠している。
