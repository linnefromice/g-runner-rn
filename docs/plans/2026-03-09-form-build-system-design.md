# フォーム特化ビルドシステム + グレイズ段階報酬 設計書

## 目的

プレイヤーの戦略的判断を増やし、ランごとのリプレイ性を高める。
具体的には「フォーム経験値によるビルド分岐」と「グレイズのリスク＆リワード強化」の2軸で改善する。

## 1. フォーム経験値（Form XP）

### 概要

- 敵撃破・グレイズ・ゲート通過でフォーム XP が蓄積
- **現在アクティブなフォーム**に XP が入る（TF切替で蓄積先も変わる）
- 閾値到達で成長段階が進む（3段階: Lv1 → Lv2 → Lv3）
- 閾値到達時にゲームが一瞬スローになり、HUD上で二択が提示される
- Awakened フォームは独立（XP蓄積なし。発動中はプライマリ/セカンダリのXPも停止）

### XP 獲得ソース

| ソース | XP量 |
|--------|------|
| 通常敵撃破（stationary, patrol, swarm） | 5 |
| 強敵撃破（phalanx, juggernaut） | 10 |
| ボスダメージ（1ヒット） | 2 |
| グレイズ（かすり） | 3 |
| グレイズ（接近） | 6 |
| グレイズ（極限） | 15 |
| Enhance ゲート通過 | 8 |

### Lv 閾値

| レベル | 必要累積XP |
|--------|-----------|
| Lv1 | 50 |
| Lv2 | 150 |
| Lv3 | 300 |

## 2. 成長ツリー（各フォーム3段階 × 二択）

### SD_Standard

| Lv | 選択A | 選択B |
|----|-------|-------|
| 1 | 弾速+20% | 弾サイズ+30% |
| 2 | 射撃間隔-15% | ダメージ+20% |
| 3 | 2連射 | 貫通弾 |

### SD_HeavyArtillery

| Lv | 選択A | 選択B |
|----|-------|-------|
| 1 | AoE範囲+40% | 爆発ダメージ+30% |
| 2 | 装甲(被ダメ-20%) | 弾速+25% |
| 3 | 着弾時スロー | 2連爆発 |

### SD_HighSpeed

| Lv | 選択A | 選択B |
|----|-------|-------|
| 1 | 移動速度+20% | グレイズ判定拡大 |
| 2 | 貫通数+1 | 射撃間隔-20% |
| 3 | 残像弾(移動中に追加弾) | 高速時ATK+50% |

### SD_Sniper

| Lv | 選択A | 選択B |
|----|-------|-------|
| 1 | 射程無限+弾速+30% | クリティカル15% |
| 2 | 連射-だが2発同時 | 貫通+シールド無視 |
| 3 | チャージ自動化 | 弱点ヒット時XP2倍 |

### SD_Scatter

| Lv | 選択A | 選択B |
|----|-------|-------|
| 1 | 弾数+2 | 拡散角縮小(集弾) |
| 2 | 近距離ダメ+40% | 弾が敵追尾(弱) |
| 3 | 全方位射撃 | ヒット時HP微回復 |

### 設計判断

- 数値は仮。実装後にバランス調整する
- Lv3 はラン後半でのみ到達想定。強力な効果を許容する
- Awakened フォームにはスキルツリーなし（時限フォームのため）
- TF 切替時、両フォームのスキルは独立して保持される（切り替えても失わない）

## 3. グレイズ段階報酬

### 概要

現在の一律報酬を、弾との距離に応じた3段階に拡張する。

### 段階定義

| 段階 | 判定距離（プレイヤーヒットボックスからの余白） | XP倍率 | ゲージ回収 | スコア |
|------|----------------------------------------------|--------|-----------|--------|
| かすり（graze） | ビジュアルHB内 かつ 実HB外（現行と同じ） | ×1 | EX+3, TF+2 | 20 |
| 接近（close） | 実HB + 4px 以内 | ×2 | EX+6, TF+4 | 50 |
| 極限（extreme） | 実HB + 1px 以内 | ×5 | EX+12, TF+8 | 150 |

### 判定ロジック

```
visualHB = getPlayerVisualHitbox(player)   // 32×40
actualHB = getPlayerHitbox(player)         // 16×16
closeHB  = expand(actualHB, 4)             // 24×24
extremeHB = expand(actualHB, 1)            // 18×18

if overlapVisual && !overlapActual:
  if overlapExtreme:
    → 極限グレイズ
  elif overlapClose:
    → 接近グレイズ
  else:
    → 通常グレイズ
```

### ビジュアルフィードバック

- かすり: 現行通り（スコアポップアップ）
- 接近: ポップアップ色変更（黄色）+ 小さいパーティクル
- 極限: ポップアップ色変更（赤）+ 大きいパーティクル + 短い画面フラッシュ

## 4. HUD 表示

### 常時表示（画面左上、HPバーの下）

- **フォームアイコン**: 現在のアクティブフォーム名の短縮表記（例: "STD", "HVY"）
- **XP ゲージバー**: 次の Lv までの進捗を横バーで表示。色はフォームの spriteConfig.bodyColor
- **取得済みスキルアイコン**: 小さいドットまたはアイコンで横並び（最大3個）

### 二択提示（Lv アップ時）

- ゲームを一瞬スロー（0.3x 速度、1〜2秒間）
- XP ゲージ位置から2つの選択肢がポップアップ表示
- プレイヤーが左右タップで選択（左エリアタップ = 選択A、右エリアタップ = 選択B）
- 選択後、通常速度に復帰

## 5. データ構造

### FormXPState（gameSessionStore に追加）

```typescript
interface FormSkillChoice {
  level: number;      // 1, 2, 3
  choice: 'A' | 'B';  // どちらを選んだか
}

interface FormXPState {
  xp: number;
  level: number;                  // 0, 1, 2, 3
  skills: FormSkillChoice[];      // 取得済みスキル
}

// gameSessionStore に追加
formXP: Record<MechaFormId, FormXPState>;
```

### FormSkillDefinition（src/game/formSkills.ts 新規）

```typescript
interface FormSkillDefinition {
  formId: MechaFormId;
  level: number;
  choiceA: { label: string; effect: FormSkillEffect };
  choiceB: { label: string; effect: FormSkillEffect };
}

type FormSkillEffect =
  | { type: 'stat_multiply'; stat: 'bulletSpeed' | 'bulletSize' | 'fireRate' | 'damage' | 'moveSpeed' | 'aoeRadius'; value: number }
  | { type: 'stat_add'; stat: 'bulletCount' | 'pierceCount'; value: number }
  | { type: 'passive'; id: 'pierce' | 'double_shot' | 'slow_on_hit' | 'double_explosion' | 'afterimage' | 'speed_atk_bonus' | 'auto_charge' | 'xp_on_crit' | 'omnidirectional' | 'heal_on_hit' | 'armor' | 'graze_expand' | 'critical_chance' };
```

## 6. システム構成

### 新規システム

| システム | 責務 |
|---------|------|
| FormXPSystem | XP蓄積の管理。閾値到達時にストアの状態を更新しスロー開始 |

### 既存システム変更

| システム | 変更内容 |
|---------|---------|
| CollisionSystem | グレイズ段階判定（3段階分岐）、XP付与呼び出し |
| ShootingSystem | フォームスキルによるパラメータ変更の適用 |
| MovementSystem | 移動速度スキルの適用 |
| EnemyAISystem | スロー効果の適用 |
| SyncRenderSystem | グレイズ段階別パーティクルの出力 |

### HUD 変更

| コンポーネント | 変更内容 |
|--------------|---------|
| HUD.tsx | XP ゲージバー + スキルアイコン表示追加 |
| 新規: SkillChoiceOverlay.tsx | 二択選択 UI オーバーレイ |

## 7. 性能への影響

- FormXPSystem: 軽量。XP加算とレベル比較のみ
- グレイズ3段階判定: AABB チェック2回追加（expand済みHBとの比較）。弾数 × 2回の追加比較だが、既存のグレイズ判定内の分岐なので影響は最小
- HUD: React コンポーネント。event-driven 更新のため60fps影響なし
- スキル効果: ShootingSystem/MovementSystem でのパラメータ参照。フレームごとの getState() 呼び出し1回追加程度
