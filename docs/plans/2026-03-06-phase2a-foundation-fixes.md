# Phase 2-A: 基礎修正 — スコープ詳細

## 目的

v0.1.0 で「定義済みだが実装が欠けている」5つの機能を完成させる。
これにより各形態の差別化が実際にゲームプレイで体感でき、Phase 2-B 以降の拡張の土台が整う。

---

## 1. 爆発弾 (explosion_radius)

### 現状
- `Heavy Artillery` の `specialAbility` に `'explosion_radius'` が定義済み
- `CollisionSystem` で弾が敵に当たると弾が消えるだけ — 範囲ダメージなし

### 要件
- Heavy Artillery の弾が敵またはボスに着弾した時、着弾点を中心に円形範囲ダメージを発生させる
- 範囲内の他の敵にもダメージが入る（1発で複数撃破可能）
- 弾自体は着弾で消滅（貫通はしない）

### 設計パラメータ（仮）
| パラメータ | 値 | 備考 |
|-----------|-----|------|
| 爆発半径 | 40px (論理座標) | 敵ヒットボックス28pxの約1.5倍 |
| ダメージ | 弾ダメージの100% | 中心でも端でも同ダメージ（簡略化） |
| 対象 | 全アクティブ敵 + ボス | 味方・ゲートには影響なし |

### 変更対象ファイル
- `src/engine/systems/CollisionSystem.ts` — 着弾時に爆発判定追加
- `src/constants/balance.ts` — `EXPLOSION_RADIUS` 定数追加

---

## 2. 貫通弾 (pierce)

### 現状
- `High Speed` の `specialAbility` に `'pierce'` が定義済み
- `CollisionSystem` で弾が敵に当たると `bullet.active = false` で消滅 — 貫通しない

### 要件
- High Speed の弾は敵に当たってもダメージを与えた上で弾が消えず、そのまま飛び続ける
- 同じ弾が同一フレームで複数の敵にダメージを与えられる
- 1発の弾が同じ敵に2回ダメージを与えないようにする（貫通後の再ヒット防止）

### 設計パラメータ（仮）
| パラメータ | 値 | 備考 |
|-----------|-----|------|
| 貫通数上限 | 無制限 | 画面外に出るまで飛び続ける |
| ダメージ | 弾ダメージの100% | 貫通しても減衰なし |
| 再ヒット防止 | 弾ごとにヒット済み敵IDリスト | フレーム跨ぎでリセットしない |

### 変更対象ファイル
- `src/types/entities.ts` — `BulletEntity` に `piercedEnemyIds?: Set<string>` 追加
- `src/engine/entities/Bullet.ts` — pierce フラグ付き弾生成
- `src/engine/systems/CollisionSystem.ts` — pierce 弾の消滅スキップ + ヒット済みチェック

---

## 3. ボス laser 攻撃

### 現状
- `BossSystem` の Phase 2 (HP 50-25%) でコメントに「laser」と記載あり
- 実際のレーザー生成・判定ロジックは未実装（spread shot のみ動作）

### 要件
- ボスが HP 50% 以下になると、spread shot に加えて laser 攻撃を使用
- laser は予告表示（警告線）→ 照射（ダメージ判定）の2段階
- 照射中は縦方向の直線範囲にダメージ

### 設計パラメータ（仮）
| パラメータ | 値 | 備考 |
|-----------|-----|------|
| 警告時間 | 1.0秒 | 赤い細線で照射位置を予告 |
| 照射時間 | 1.5秒 | 照射中に判定あり |
| 照射幅 | 30px | 論理座標 |
| ダメージ | 20/hit | 0.3秒ごとに判定（最大5hit） |
| 照射間隔 | 4秒ごと | spread shot と交互に使用 |
| 照射パターン | ボスX座標に直下 | ボスの水平移動に追従しない（固定位置） |

### 変更対象ファイル
- `src/types/entities.ts` — `BossEntity` に laser 状態フィールド追加
- `src/engine/systems/BossSystem.ts` — laser 攻撃パターン追加
- `src/constants/balance.ts` — laser 関連定数追加

---

## 4. EX Burst（極太ビーム）

### 現状
- EX ゲージ（上限100）と EX ボタンが HUD に存在
- ゲージは敵撃破(+5)、ゲート通過(+10)、ボスヒット(+2)で蓄積
- ボタン押下時の効果が未実装（何も起きない）

### 要件
- EX ゲージ MAX 時にボタン押下で極太ビームを照射
- 自機位置から画面上端まで、幅の広い直線ビームを一定時間照射
- ビーム内の敵・敵弾を破壊/消滅させる
- **マイナス効果のゲート（Tradeoff）もビームで破壊可能**
- 照射中もプレイヤーは移動可能（ビームはプレイヤーに追従）

### 設計パラメータ（仮）
| パラメータ | 値 | 備考 |
|-----------|-----|------|
| ビーム幅 | 80px (論理座標) | プレイヤー中心から左右40px |
| 照射時間 | 2.0秒 | |
| ダメージ | 50/tick | 0.1秒ごとに判定（合計1000ダメージ） |
| 敵弾消滅 | ビーム範囲内の敵弾を全消去 | |
| ゲート破壊 | Tradeoff ゲートのみ | Enhance/Recovery は破壊しない |
| ゲージ消費 | 全消費（0に戻る） | |
| 無敵付与 | なし | ビーム中も被弾する |
| EX ゲージ蓄積 | 照射中は停止 | |

### 変更対象ファイル
- `src/types/entities.ts` — EX Burst 状態フィールド追加
- `src/engine/systems/EXBurstSystem.ts` — **新規**: ビーム判定システム
- `src/engine/systems/CollisionSystem.ts` — ビーム判定との連携
- `src/stores/gameSessionStore.ts` — `activateEXBurst()` / `deactivateEXBurst()`
- `src/constants/balance.ts` — EX Burst 関連定数追加
- `app/game/[stageId]/index.tsx` — EX Burst システム登録

---

## 5. HighSpeed 解放条件修正

### 現状
- `FORM_UNLOCK_CONDITIONS` で `SD_HighSpeed` の解放条件が `requiredStage: 7`
- ゲームには Stage 5 までしか存在しないため、永久にアンロックできない

### 要件
- 実在するステージに変更して解放可能にする

### 設計パラメータ
| パラメータ | 変更前 | 変更後 | 備考 |
|-----------|--------|--------|------|
| requiredStage | 7 | 4 | Stage 4 クリアで解放可能 |
| cost | 500 | 500 | 据え置き |

### 変更対象ファイル
- `src/game/upgrades.ts` — `requiredStage` を 7 → 4 に変更

---

## 実装順序

```
1. HighSpeed 解放条件修正     ← 1行変更、即完了
2. 貫通弾 (pierce)           ← CollisionSystem の分岐追加
3. 爆発弾 (explosion_radius) ← CollisionSystem に範囲判定追加
4. ボス laser 攻撃           ← BossSystem に新攻撃パターン
5. EX Burst                  ← 新システム作成
```

順序の理由:
- 1 は1行の修正で即完了
- 2, 3 は CollisionSystem の変更で、貫通のほうがシンプル（弾を消さないだけ）なので先
- 4 はボス固有の追加で独立性が高い
- 5 は最も規模が大きく、新システムファイルの作成を含む

---

## 完了条件

- [ ] Heavy Artillery の弾が着弾時に周囲の敵にもダメージを与える
- [ ] High Speed の弾が敵を貫通して複数ヒットする
- [ ] ボスが HP 50% 以下で laser 攻撃を使用する
- [ ] EX ゲージ MAX で極太ビームが照射され、敵・敵弾・Tradeoff ゲートを破壊する
- [ ] High Speed 形態が実際にアンロック可能
- [ ] 全テスト通過、型チェック通過
