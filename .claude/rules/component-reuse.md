# コンポーネント・モジュール共通化ルール

UI要素やゲームロジックを作成・編集する際の必須ルール。

---

## 3つ以上ルール

**同じ形・フォーマットの要素が3つ以上あるなら、必ず共通化すること。**

コンポーネントやモジュールを作成・編集する前に確認:

1. 同じ構造のUI/ロジックが他にもあるか？
2. パラメータだけ違う同じパターンが3つ以上あるか？
3. あるなら → 共通モジュールを作成

---

## 配置場所

| スコープ                       | 配置場所              |
| ------------------------------ | --------------------- |
| HUD / メニュー等の UI         | `src/ui/`             |
| ゲームエンジンの共通ロジック   | `src/engine/`         |
| レンダリングユーティリティ     | `src/rendering/`      |
| データ定義（フォーム、ステージ等） | `src/game/`       |
| 共通型定義                     | `src/types/`          |

---

## ゲーム固有の共通化パターン

### エンティティ描画

```typescript
// ❌ Bad: エンティティごとに個別の描画関数をハードコード
function drawEnemy1(canvas, entity) { /* ... */ }
function drawEnemy2(canvas, entity) { /* ... */ }
function drawEnemy3(canvas, entity) { /* ... */ }

// ✅ Good: データ駆動の描画関数
function drawEntity(canvas: SkCanvas, entity: GameEntity, sprite: SpriteDefinition) {
    // sprite定義に基づいて描画
}
```

### ECS システム

```typescript
// ❌ Bad: システムごとに似たフィルタリングロジック
function movementSystem(entities) {
    Object.values(entities).filter(e => e.position && e.velocity).forEach(/* ... */);
}
function renderSystem(entities) {
    Object.values(entities).filter(e => e.position && e.sprite).forEach(/* ... */);
}

// ✅ Good: 共通のエンティティクエリユーティリティ
function queryEntities<T>(entities: Entities, ...components: string[]): T[] {
    return Object.values(entities).filter(e =>
        components.every(c => c in e)
    ) as T[];
}
```

### ゲーム定数

```typescript
// ❌ Bad: マジックナンバーの散在
if (entity.x > 320) { /* ... */ }
if (combo >= 3) { /* ... */ }

// ✅ Good: 定数定義を集約
// src/game/constants.ts
export const LOGICAL_WIDTH = 320;
export const COMBO_THRESHOLD = 3;
```
