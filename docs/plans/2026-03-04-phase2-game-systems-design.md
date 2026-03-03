# Phase 2: ゲームシステム拡充 — 設計ドキュメント

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** コンボ・覚醒、EXバースト、追加ゲート/敵タイプ、難易度カーブ + ステージ 2-5 を一括実装する

**Approach:** レイヤー別積み上げ（Phase 1 と同一パターン）

---

## 背景

Phase 1 で全ゲームプレイ基盤が完成（型定義、11 エンジンシステム、ストア、HUD、ゲーム画面）。
Phase 2 では既存の骨組みに肉付けし、ゲームとしての深みを加える。

## 既存資産の活用

Phase 1 で先行実装済みの Phase 2 関連コード:

| 資産 | ファイル | 状態 |
|------|---------|------|
| コンボフィールド (comboCount, isAwakened, awakenedTimer) | gameSessionStore.ts | ✅ フィールド + 基本 action あり |
| EX ゲージ蓄積 (+5, +10, +2) | CollisionSystem, GateSystem | ✅ 動作済み |
| EX バースト発動 | game/[stageId]/index.tsx | ✅ handleEXBurst 実装済み |
| ゲート効果処理 (heal, heal_percent, stat_add, stat_multiply, refit) | GateSystem.ts | ✅ 全効果実装済み |
| コンボ増減 (enhance → +1, tradeoff/refit/damage → reset) | GateSystem.ts, CollisionSystem.ts | ✅ 基本ロジック実装済み |
| 巡回型 AI (左右往復 + 射撃) | EnemyAISystem.ts | ✅ 動作済み |
| 巡回型バランス (HP40, 間隔1.5s, スコア200pt) | balance.ts | ✅ 定義済み |
| 難易度スケーリング計算式 | difficulty.ts | ✅ 実装 + テスト済み |
| Awakened フォーム定義 (200%ATK, 120%速度, ホーミング) | forms.ts | ✅ 定義済み |

## 新規実装

### 1. AwakenedSystem (新エンジンシステム)

- 毎フレーム `awakenedTimer` を delta 分 decrement
- 残り 3000ms で `awakenedWarning: true` をストアにセット
- 0 到達で `deactivateAwakened()` → 前フォームに戻す

### 2. CollisionSystem 拡張

- `isAwakened && specialAbility === 'homing_invincible'` 時、敵/ボス本体との接触ダメージを無効化
- 弾ダメージは通常通り（覚醒中もダメージを受ける → コンボリセット無し、既にリセット済みのため）

### 3. ShootingSystem 拡張

- Awakened フォーム: `bulletConfig.count = 3` で 3 発同時射撃（扇状）
- ホーミング弾: `bullet.homing = true` フラグ + MovementSystem で最寄り敵を追尾

### 4. ゲートプリセットデータ (src/game/gates.ts)

- 回復ゲート: `{ type: 'recovery', effects: [{ type: 'heal', value: 20 }] }` 等
- トレードオフゲート: `{ type: 'tradeoff', effects: [{ type: 'stat_add', stat: 'atk', value: 50 }, { type: 'stat_multiply', stat: 'speed', value: 0.8 }] }`

### 5. ステージ 2-5 タイムラインデータ

| ステージ | 特徴 | 敵タイプ | ゲート |
|---------|------|---------|--------|
| 2 | 回復ゲート初登場 | stationary + patrol | enhance, recovery |
| 3 | トレードオフゲート + optional レイアウト | stationary + patrol | enhance, recovery, tradeoff (optional) |
| 4 | 高密度、全ゲートタイプ | patrol 多め | 全タイプ |
| 5 | ボスステージ | stationary → ボス | enhance のみ (ボス前) |

### 6. SpawnSystem 拡張

- `enemyType: 'patrol'` の処理追加
- `difficulty` パラメータを敵 HP に適用

### 7. ストア拡張

- `awakenedWarning: boolean` フィールド追加
- `setAwakenedWarning(v: boolean)` アクション追加

### 8. HUD 調整

- EX ボタン: `exGauge < 100` で `disabled` スタイル適用（既存の EXButton コンポーネント）
- コンボゲージ: 点灯状態の `neonGreen` カラー強調（既存 ComboGauge コンポーネント修正）

## 実装レイヤー順序

| レイヤー | 内容 |
|---------|------|
| L1: データ | ゲートプリセット + ステージ 2-5 タイムライン |
| L2: エンジン | AwakenedSystem, CollisionSystem拡張, ShootingSystem拡張, SpawnSystem拡張, MovementSystem拡張(ホーミング) |
| L3: ストア | awakenedWarning フィールド |
| L4: UI | HUD 微調整 (EX disabled, コンボゲージ強調) |
| L5: 画面 | ゲーム画面に AwakenedSystem 追加 |
| L6: テスト | コンボロジック, 覚醒タイマー, ステージデータ検証 |

## スコープ外

- レンダリング（個別レンダラー、エフェクト）→ 別タスク
- 音声ファイル追加 → 別タスク
- ボスレーザーパターン → Phase 1 残りとして別途対応
