# Act 3 Volume Expansion Design

## Goal

ゲームに第3幕（Act 3: Stage 11-15）を追加し、全カテゴリのコンテンツを拡張する。

## Architecture

既存のデータ駆動アーキテクチャを活用。ステージは新規タイムラインファイル、敵・フォーム・ゲートは既存レジストリへのデータ追加、新敵AIはEnemyAISystemへの分岐追加で実装。

## Content Additions

### 1. New Enemy Types (+3)

既存の `EnemyType` union に3タイプ追加。

| タイプ | HP | ATK | 間隔 | Score | Credits | 行動パターン |
|--------|-----|------|------|-------|---------|-------------|
| **dodger** | 35 | 12 | 1.8s | 250 | 3 | プレイヤー弾を検知して横移動で回避。通常時はslow_descent |
| **splitter** | 50 | 8 | 2.0s | 200 | 3 | 撃破時にHP1のswarm×3に分裂。本体はslow_descent |
| **summoner** | 80 | 0 | 0s | 400 | 5 | 攻撃せず、3秒ごとにswarm×2を生成。static配置 |

#### dodger AI
- 毎フレーム、自身に向かう playerBullet を走査（半径60以内）
- 検知時、弾の反対方向に DODGE_SPEED (120) で横移動
- 回避クールダウン 0.8s（連続回避防止）
- 回避中以外は slow_descent (scrollSpeed のみ)

#### splitter 分裂ロジック
- CollisionSystem の敵撃破時に `enemy.enemyType === 'splitter'` を判定
- 撃破位置から左(-20px)・中央・右(+20px) に swarm を3体生成
- 分裂した swarm は通常の swarm と同じ挙動

#### summoner 召喚ロジック
- EnemyAISystem で `summonTimer` をデクリメント（初期値3.0s）
- タイマー0到達時にswarm×2を敵プールから取得・配置
- 召喚上限: 最大6体（画面内の召喚済みswarm数を追跡）
- 本体は攻撃しない（attackInterval: 0）

### 2. New Stages (+5)

Act 3 のステージ構成:

| Stage | Name | Duration | 特徴 |
|-------|------|----------|------|
| 11 | Phantom Zone | 110s | dodger 導入。回避する敵への対処を学ぶ |
| 12 | Hive Cluster | 120s | splitter + swarm の組み合わせ。殲滅力が試される |
| 13 | Command Nexus | 120s | summoner 導入 + phalanx 護衛。召喚元を優先撃破する判断力 |
| 14 | Chaos Corridor | 130s | 全9敵タイプ混在。高密度・高難度。最終準備 |
| 15 | Terminus Core | 180s | Boss 3 ステージ。短い前哨戦 → ボス戦 |

#### Difficulty Params (Act 3)

```
Stage 11: { scrollSpeed: 1.1, spawnInterval: 2.2, hpMul: 1.3, atkMul: 1.2, maxEnemies: 10, bulletSpeedMul: 1.1, atkIntervalMul: 0.9 }
Stage 12: { scrollSpeed: 1.1, spawnInterval: 2.0, hpMul: 1.4, atkMul: 1.3, maxEnemies: 14, bulletSpeedMul: 1.2, atkIntervalMul: 0.85 }
Stage 13: { scrollSpeed: 1.2, spawnInterval: 2.0, hpMul: 1.5, atkMul: 1.3, maxEnemies: 12, bulletSpeedMul: 1.2, atkIntervalMul: 0.85 }
Stage 14: { scrollSpeed: 1.3, spawnInterval: 1.6, hpMul: 1.6, atkMul: 1.4, maxEnemies: 16, bulletSpeedMul: 1.3, atkIntervalMul: 0.8 }
Stage 15: { scrollSpeed: 1.0, spawnInterval: 2.5, hpMul: 1.5, atkMul: 1.3, maxEnemies: 8,  bulletSpeedMul: 1.2, atkIntervalMul: 0.85 }
```

### 3. New Boss (+1)

**Boss 3 — Terminus Core** (Stage 15, bossIndex=3)

- HP: 500 × 2.0 = 1000
- 3フェーズ構成（既存と同じ `spread | laser | all`）
- 新攻撃パターン: **追尾弾幕 (homing spread)**
  - spread フェーズで5発中2発がhoming属性
  - `laser` フェーズのレーザー幅が40px（既存30px）
  - `all` フェーズでドローン5体召喚（既存3-4体）

Boss 3 は既存の BossSystem / BossPhaseSystem のデータ駆動部分（`bossIndex` による分岐）で対応。新しいシステムは不要。

### 4. New Form (+1)

**SD_Guardian（防御型）**

```
id: 'SD_Guardian'
moveSpeedMultiplier: 0.7
attackMultiplier: 0.8
fireRateMultiplier: 0.8
specialAbility: 'damage_reduce'
isTimeLimited: false
bulletConfig: { count: 1, width: 6, height: 10, speed: 400, color: '#44AAFF' }
spriteConfig: { bodyColor: '#4466CC', accentColor: '#6688FF', glowColor: '#4466CC88' }
```

- **Special Ability: damage_reduce** — 被ダメージ 30% 軽減
- アンロック条件: Stage 10 クリア + 1000 Credits
- フォームスキルツリー (3レベル × 2択 = 6スキル):
  - L1: HP回復速度 / ダメージ軽減強化
  - L2: 反撃弾（被弾時に全方位弾） / シールド（5秒ごとに1回ダメージ無効）
  - L3: 味方弾速度バフ / 被弾時EXゲージ増加

### 5. New Gates (+4 definitions, +2 pairs)

| Gate | Type | 効果 |
|------|------|------|
| GATE_SHIELD | enhance | 次の1回ダメージを無効化（i-frame とは別） |
| GATE_REFIT_GUARDIAN | refit | フォームをSD_Guardianに変更 |
| GATE_ATK_UP_20 | enhance | ATK +20（Act3向け高効果） |
| GATE_TRADEOFF_BERSERK | tradeoff | ATK×1.5 + maxHP-30 |

| Pair | Left | Right | Layout |
|------|------|-------|--------|
| PAIR_REFIT_GUARDIAN | GATE_REFIT_GUARDIAN | GATE_REFIT_SPEED | forced |
| PAIR_ENHANCE_ACT3 | GATE_ATK_UP_20 | GATE_SHIELD | forced |

### 6. New Upgrades (+2 categories)

```
def: { effect: 0.03, maxLevel: 5, costPerLevel: 150, label: 'DEF' }
  → 被ダメージ 3% 軽減/レベル（最大15%）

creditBoost: { effect: 0.1, maxLevel: 5, costPerLevel: 200, label: 'CR' }
  → クレジット獲得 10% 増/レベル（最大50%）
```

### 7. i18n Updates

`en.ts` / `ja.ts` に以下を追加:
- 敵タイプ名 3件
- ステージ名 5件
- フォーム名 1件（SD_Guardian）
- アビリティ名 1件（damage_reduce）
- ゲートラベル 4件
- アップグレードラベル 2件

### 8. Stage Unlock Progression

Act 3 のアンロック条件は既存と同じ段階的アンロック:
- Stage 11: Stage 10 クリアでアンロック
- Stage 12-14: 前ステージクリアで順次アンロック
- Stage 15: Stage 14 クリアでアンロック

## Files to Modify

| Category | Files | Action |
|----------|-------|--------|
| Types | `src/types/enemies.ts` | Add 3 enemy types to union |
| Types | `src/types/forms.ts` | Add `SD_Guardian` to MechaFormId, `damage_reduce` to SpecialAbilityType |
| Balance | `src/constants/balance.ts` | Add enemy stats, boss scaling, dodge/summon constants |
| Colors | `src/constants/colors.ts` | Add enemy type colors for dodger/splitter/summoner |
| Enemies | `src/game/enemies.ts` | Add 3 enemy definitions |
| Forms | `src/game/forms.ts` | Add SD_Guardian definition |
| Form Skills | `src/game/formSkills.ts` | Add Guardian skill tree (6 skills) |
| Gates | `src/game/gates.ts` | Add 4 gate definitions + 2 pairs |
| Upgrades | `src/game/upgrades.ts` | Add DEF/CR upgrade configs, Guardian unlock condition |
| Stages | `src/game/stages/stage11.ts` (NEW) | Stage 11 timeline |
| Stages | `src/game/stages/stage12.ts` (NEW) | Stage 12 timeline |
| Stages | `src/game/stages/stage13.ts` (NEW) | Stage 13 timeline |
| Stages | `src/game/stages/stage14.ts` (NEW) | Stage 14 timeline |
| Stages | `src/game/stages/stage15.ts` (NEW) | Stage 15 timeline |
| Stages | `src/game/stages/index.ts` | Register stages 11-15 |
| Engine | `src/engine/systems/EnemyAISystem.ts` | Add dodger/summoner AI branches |
| Engine | `src/engine/systems/CollisionSystem.ts` | Add splitter death → swarm spawn |
| Engine | `src/engine/systems/ShootingSystem.ts` | Add damage_reduce ability handling |
| Engine | `src/engine/entities/Enemy.ts` | Support new enemy types in factory |
| Rendering | `src/rendering/GameCanvas.tsx` or `SyncRenderSystem.ts` | Add new enemy type shapes/colors |
| i18n | `src/i18n/locales/en.ts` | Add English strings |
| i18n | `src/i18n/locales/ja.ts` | Add Japanese strings |
| Stores | `src/stores/saveDataStore.ts` | Support DEF/CR upgrades in persistent state |
| UI | `app/upgrade.tsx` | Display new upgrade categories |
