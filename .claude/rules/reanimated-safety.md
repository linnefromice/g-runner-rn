# Reanimated & RNGH 安全パターン

Reanimated 4.x + React Native Gesture Handler v2 の組み合わせで必須のパターン。
ゲームエンティティ（plain JS objects）をワークレットから保護するために適用。

---

## 背景

RNGH v2 は Reanimated がインストールされている場合、`onUpdate` / `onEnd` 等のジェスチャーコールバックを
**デフォルトでワークレット（UI スレッド）** として実行する。

Reanimated 4.x はワークレットに渡された JS オブジェクトを **シリアライズ＆フリーズ（read-only）** する。
`entitiesRef.current` がフリーズされると、ゲームループのシステムが entities を変異できなくなり、
**ゲーム全体が停止する**。

---

## 必須ルール

### 1. ジェスチャーハンドラに `.runOnJS(true)` を付与する

entities にアクセスするすべてのジェスチャーコールバックで必須。

```typescript
// ✅ 正しい: JS スレッドで実行
const pan = Gesture.Pan().runOnJS(true).onUpdate((e) => {
  entities.player.x = e.absoluteX / scale;
});

// ❌ 致命的: ワークレットが entities をフリーズ → ゲーム停止
const pan = Gesture.Pan().onUpdate((e) => {
  entities.player.x = e.absoluteX / scale;
});
```

### 2. SharedValue への書き込みは SyncRenderSystem のみ

```typescript
// ✅ 正しい: システムが新しいプリミティブ配列を生成して代入
renderData.value = entities.enemies
  .filter(e => e.active)
  .map(e => ({ x: e.x, y: e.y, ... }));

// ❌ 禁止: entities オブジェクトへの参照を SharedValue に渡す
renderData.value = entities.enemies; // フリーズされる
```

### 3. ワークレット内で `entitiesRef` を参照しない

```typescript
// ❌ 禁止: useDerivedValue / useAnimatedStyle 内で entities を参照
const style = useAnimatedStyle(() => {
  return { left: entitiesRef.current.player.x }; // フリーズの原因
});

// ✅ 正しい: SharedValue 経由で読み取る
const style = useAnimatedStyle(() => {
  return { left: renderData.value[0]?.x ?? 0 };
});
```

---

## 症状と診断

ワークレットフリーズが発生した場合の典型的な症状:

| 症状 | 原因 |
|------|------|
| ゲーム画面が完全にフリーズ | entities がフリーズされ、システムが変異不可 |
| `Tried to modify key 'x' of an object which has been already passed to a worklet` | Reanimated 4.x の警告ログ |
| タッチに反応しない | ジェスチャーコールバック内でフリーズされたオブジェクトに書き込み |

---

## チェックリスト

新しいジェスチャーハンドラや Reanimated 連携コードを追加する際:

- [ ] `Gesture.Pan()` / `Gesture.Tap()` 等に `.runOnJS(true)` が付いているか
- [ ] ワークレット（`useAnimatedStyle`, `useDerivedValue`, `useFrameCallback`）内で `entitiesRef` を参照していないか
- [ ] SharedValue に entities オブジェクトの参照を直接代入していないか
- [ ] SharedValue に書き込むデータはプリミティブ値のみか
