# Phase 2-A: 基礎修正 — 設計書

## 概要

v0.1.0 で定義済みだが実装が欠けている5機能を完成させる。

---

## 1. HighSpeed 解放条件修正

`src/game/upgrades.ts` の `SD_HighSpeed` の `requiredStage` を `7` → `5` に変更。

---

## 2. 貫通弾 (pierce)

### エンティティ変更
- `BulletEntity` に `specialAbility?: SpecialAbilityType` を追加
- `BulletEntity` に `piercedEnemyIds?: Set<string>` を追加

### ShootingSystem 変更
- 弾生成時に form の `specialAbility` を弾エンティティに転写
- pierce 弾の場合 `piercedEnemyIds = new Set()` で初期化

### CollisionSystem 変更（弾→敵判定）
```
if (bullet.specialAbility === 'pierce') {
  if (bullet.piercedEnemyIds.has(enemy.id)) → skip
  enemy にダメージ
  bullet.piercedEnemyIds.add(enemy.id)
  // bullet.active = false をスキップ
} else {
  通常処理（弾消滅）
}
```

---

## 3. 爆発弾 (explosion_radius)

### 定数
- `EXPLOSION_RADIUS = 40`（balance.ts）

### CollisionSystem 変更（弾→敵判定）
```
if (bullet.specialAbility === 'explosion_radius') {
  通常ダメージ処理（着弾敵）
  bullet.active = false
  // 爆発: 着弾点を中心に半径内の全敵にダメージ
  for each active enemy (着弾敵以外):
    distance(着弾点, enemy中心) <= EXPLOSION_RADIUS → 同ダメージ
}
```

---

## 4. ボス laser 攻撃

### BossEntity 追加フィールド
```typescript
laserState: 'idle' | 'warning' | 'firing'
laserTimer: number
laserX: number
```

### 定数（balance.ts）
```
BOSS_LASER_WARNING_DURATION = 1000  // 1秒
BOSS_LASER_FIRE_DURATION = 1500     // 1.5秒
BOSS_LASER_WIDTH = 30               // 判定幅
BOSS_LASER_DAMAGE = 20              // 1tick のダメージ
BOSS_LASER_TICK_INTERVAL = 300      // 0.3秒ごとに判定
BOSS_LASER_COOLDOWN = 4000          // 4秒間隔
```

### BossSystem 変更
- Phase 2 (HP 50-25%) で spread と laser を交互に使用
- `laserState` の状態遷移: idle → warning → firing → idle
- warning 開始時に `laserX = boss の中心X` で固定
- firing 中: `laserTickTimer` で 0.3秒ごとにプレイヤー位置チェック
  - `|player.x - laserX| <= BOSS_LASER_WIDTH / 2` → ダメージ

---

## 5. EX Burst（極太ビーム）

### 定数（balance.ts）
```
EX_BURST_DURATION = 2000            // 2秒
EX_BURST_WIDTH = 80                 // 論理座標幅
EX_BURST_DAMAGE = 50                // 0.1秒ごとのダメージ
EX_BURST_TICK_INTERVAL = 100        // ダメージ判定間隔
```

### gameSessionStore 追加
```typescript
isEXBurstActive: boolean
exBurstTimer: number
exBurstTickTimer: number

activateEXBurst(): void   // ゲージ消費、状態セット
deactivateEXBurst(): void // 状態リセット
```

### EXBurstSystem.ts（新規）
- 毎フレーム `exBurstTimer` 減算
- `exBurstTickTimer` で 0.1秒ごとにダメージ tick:
  - ビーム範囲: `playerX ± 40`, `0 ～ playerY`
  - 範囲内の敵に 50 ダメージ
  - 範囲内の敵弾を `active = false`
  - 範囲内の Tradeoff ゲートを `active = false`
- timer ≤ 0 → `deactivateEXBurst()`

### app/game/[stageId]/index.tsx 変更
- EXBurstSystem をシステムリストに登録
- EX ボタンの `onEXBurst` で `activateEXBurst()` 呼び出し

---

## 実装順序

1. HighSpeed 解放条件修正（1行）
2. BulletEntity に specialAbility + piercedEnemyIds 追加
3. ShootingSystem で specialAbility を弾に転写
4. 貫通弾の CollisionSystem 分岐
5. 爆発弾の CollisionSystem 分岐
6. ボス laser（BossSystem 拡張）
7. EX Burst（新システム + ストア + 画面登録）
