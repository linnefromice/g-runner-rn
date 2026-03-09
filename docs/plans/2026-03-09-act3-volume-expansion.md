# Act 3 Volume Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Act 3 (Stages 11-15) with 3 new enemy types, 1 new boss, 1 new form, new gates, and new upgrade categories.

**Architecture:** Fully data-driven — add types to unions, stats to balance constants, definitions to registries. New enemy AI branches in EnemyAISystem, splitter logic in CollisionSystem. Stages are new timeline data files.

**Tech Stack:** TypeScript, React Native, Zustand, expo-router

---

### Task 1: Type Definitions — Enemy, Form, Ability

**Files:**
- Modify: `src/types/enemies.ts`
- Modify: `src/types/forms.ts`

**Step 1: Add new enemy types to union**

In `src/types/enemies.ts`, change the `EnemyType` union to:

```typescript
export type EnemyType = 'stationary' | 'patrol' | 'rush' | 'swarm' | 'phalanx' | 'juggernaut' | 'dodger' | 'splitter' | 'summoner';
```

**Step 2: Add new form and ability to unions**

In `src/types/forms.ts`, change `MechaFormId` to:

```typescript
export type MechaFormId =
  | 'SD_Standard'
  | 'SD_HeavyArtillery'
  | 'SD_HighSpeed'
  | 'SD_Sniper'
  | 'SD_Scatter'
  | 'SD_Awakened'
  | 'SD_Guardian';
```

Change `SpecialAbilityType` to:

```typescript
export type SpecialAbilityType =
  | 'explosion_radius'
  | 'pierce'
  | 'shield_pierce'
  | 'homing_invincible'
  | 'damage_reduce'
  | 'none';
```

**Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: Errors in files that use `ENEMY_STATS`, `FORM_UNLOCK_CONDITIONS`, etc. (expected — we haven't added data yet)

**Step 4: Commit**

```bash
git add src/types/enemies.ts src/types/forms.ts
git commit -m "feat: Add dodger/splitter/summoner enemy types and SD_Guardian form type"
```

---

### Task 2: Balance Constants — Enemy Stats, Hitboxes, AI Constants

**Files:**
- Modify: `src/constants/balance.ts`
- Modify: `src/constants/dimensions.ts`
- Modify: `src/constants/colors.ts`

**Step 1: Add enemy stats**

In `src/constants/balance.ts`, add to the `ENEMY_STATS` object (before `as const`):

```typescript
  dodger:    { hp: 35, attackDamage: 12, attackInterval: 1.8, scoreValue: 250, creditValue: 3 },
  splitter:  { hp: 50, attackDamage: 8,  attackInterval: 2.0, scoreValue: 200, creditValue: 3 },
  summoner:  { hp: 80, attackDamage: 0,  attackInterval: 0,   scoreValue: 400, creditValue: 5 },
```

**Step 2: Add new AI constants**

Append to `src/constants/balance.ts`:

```typescript
/** Dodger AI */
export const DODGER_DETECT_RADIUS = 60;
export const DODGER_SPEED = 120;
export const DODGER_COOLDOWN = 0.8;

/** Summoner AI */
export const SUMMONER_INTERVAL = 3.0;
export const SUMMONER_MAX_SPAWNS = 6;

/** Splitter spawn offsets */
export const SPLITTER_SPAWN_OFFSETS = [-20, 0, 20];

/** Boss 3 scaling */
export const BOSS_DRONE_COUNTS_3 = 5;
export const BOSS_3_LASER_WIDTH = 40;
export const BOSS_3_HOMING_COUNT = 2;
```

**Step 3: Add hitboxes**

In `src/constants/dimensions.ts`, add to the `HITBOX` object:

```typescript
  dodger:    { width: 28, height: 28 },
  splitter:  { width: 32, height: 32 },
  summoner:  { width: 36, height: 36 },
```

**Step 4: Add enemy type colors**

In `src/constants/colors.ts`, add to `ENEMY_TYPE_COLORS`:

```typescript
  dodger: '#44DDFF',     // cyan — evasive
  splitter: '#FF8800',   // orange — splits
  summoner: '#DDAA00',   // gold — commander
```

**Step 5: Update BOSS_DRONE_COUNTS**

In `src/constants/balance.ts`, change `BOSS_DRONE_COUNTS` to:

```typescript
export const BOSS_DRONE_COUNTS = { 1: 3, 2: 4, 3: 5 } as const;
```

**Step 6: Run type check**

Run: `npx tsc --noEmit`

**Step 7: Commit**

```bash
git add src/constants/balance.ts src/constants/dimensions.ts src/constants/colors.ts
git commit -m "feat: Add balance constants for new enemies, boss 3, and dodger/summoner AI"
```

---

### Task 3: Form Definition — SD_Guardian

**Files:**
- Modify: `src/game/forms.ts`
- Modify: `src/game/upgrades.ts`
- Modify: `src/game/formSkills.ts`

**Step 1: Add Guardian form definition**

In `src/game/forms.ts`, add before the closing `}` of `FORM_DEFINITIONS`:

```typescript
  SD_Guardian: {
    id: 'SD_Guardian',
    displayName: 'Guardian',
    moveSpeedMultiplier: 0.7,
    attackMultiplier: 0.8,
    fireRateMultiplier: 0.8,
    specialAbility: 'damage_reduce',
    isTimeLimited: false,
    spriteConfig: { bodyColor: '#4466CC', accentColor: '#6688FF', glowColor: '#4466CC' },
    bulletConfig: { width: 6, height: 10, speed: 400, color: '#44AAFF', count: 1 },
  },
```

**Step 2: Add Guardian unlock condition**

In `src/game/upgrades.ts`, add to `FORM_UNLOCK_CONDITIONS`:

```typescript
  SD_Guardian:       { type: 'unlock', requiredStage: 10, cost: 1000 },
```

**Step 3: Add Guardian skill tree**

In `src/game/formSkills.ts`, add after the SD_Scatter entries:

```typescript
  // === SD_Guardian ===
  {
    formId: 'SD_Guardian', level: 1,
    choiceA: { label: 'HP Regen', effect: { type: 'passive', id: 'hp_regen' } },
    choiceB: { label: 'DMG Reduce +10%', effect: { type: 'stat_multiply', stat: 'damageReduce', value: 1.1 } },
  },
  {
    formId: 'SD_Guardian', level: 2,
    choiceA: { label: 'Counter Shot', effect: { type: 'passive', id: 'counter_shot' } },
    choiceB: { label: 'Shield', effect: { type: 'passive', id: 'shield' } },
  },
  {
    formId: 'SD_Guardian', level: 3,
    choiceA: { label: 'Ally Bullet Speed +20%', effect: { type: 'stat_multiply', stat: 'bulletSpeed', value: 1.2 } },
    choiceB: { label: 'EX on Hit', effect: { type: 'passive', id: 'ex_on_hit' } },
  },
```

**Step 4: Add Guardian to SELECTABLE_FORMS**

In `app/stages/[id]/select-form.tsx`, change `SELECTABLE_FORMS` to:

```typescript
const SELECTABLE_FORMS: MechaFormId[] = [
  'SD_Standard',
  'SD_HeavyArtillery',
  'SD_HighSpeed',
  'SD_Guardian',
];
```

Note: SD_Sniper and SD_Scatter are unlockable but not in the initial selectable list — they are still displayed because the screen iterates `SELECTABLE_FORMS`. Check the existing screen logic: it shows all forms including locked ones. So add `'SD_Guardian'` to the array.

Actually, looking at the code more carefully, `SELECTABLE_FORMS` lists forms that appear on the screen. All 3 existing selectable + Sniper/Scatter + Awakened appear. The array should include all selectable forms:

```typescript
const SELECTABLE_FORMS: MechaFormId[] = [
  'SD_Standard',
  'SD_HeavyArtillery',
  'SD_HighSpeed',
  'SD_Sniper',
  'SD_Scatter',
  'SD_Guardian',
];
```

Wait — check the current code. `SELECTABLE_FORMS` has only 3 entries, but SD_Sniper and SD_Scatter are shown separately. Let me re-check... The current code has `SELECTABLE_FORMS = ['SD_Standard', 'SD_HeavyArtillery', 'SD_HighSpeed']` and shows SD_Awakened as a separate card at the bottom. SD_Sniper and SD_Scatter must also be in the array. Actually looking at the screen code, it only shows forms from SELECTABLE_FORMS + SD_Awakened. So SD_Sniper and SD_Scatter should already be there... but they're not.

**Resolution:** Add all selectable forms including the new one:

```typescript
const SELECTABLE_FORMS: MechaFormId[] = [
  'SD_Standard',
  'SD_HeavyArtillery',
  'SD_HighSpeed',
  'SD_Sniper',
  'SD_Scatter',
  'SD_Guardian',
];
```

**Step 5: Run type check**

Run: `npx tsc --noEmit`

**Step 6: Commit**

```bash
git add src/game/forms.ts src/game/upgrades.ts src/game/formSkills.ts app/stages/[id]/select-form.tsx
git commit -m "feat: Add SD_Guardian form with skill tree and unlock condition"
```

---

### Task 4: Gate Definitions

**Files:**
- Modify: `src/game/gates.ts`

**Step 1: Add new gate definitions**

Append to `src/game/gates.ts` before the gate pair configs section:

```typescript
// === Act 3 Enhance gates ===

export const GATE_ATK_UP_20: GateDefinition = {
  type: 'enhance',
  displayLabel: 'ATK +20',
  effects: [{ kind: 'stat_add', stat: 'atk', value: 20 }],
};

export const GATE_SHIELD: GateDefinition = {
  type: 'enhance',
  displayLabel: 'SHIELD',
  effects: [{ kind: 'stat_add', stat: 'hp', value: 0 }], // Shield handled by special flag
};

// === Act 3 Refit gates ===

export const GATE_REFIT_GUARDIAN: GateDefinition = {
  type: 'refit',
  displayLabel: '→ Guardian',
  effects: [{ kind: 'refit', targetForm: 'SD_Guardian' }],
};

// === Act 3 Tradeoff gates ===

export const GATE_TRADEOFF_BERSERK: GateDefinition = {
  type: 'tradeoff',
  displayLabel: 'ATK×1.5 HP-30',
  effects: [
    { kind: 'stat_multiply', stat: 'atk', value: 1.5 },
    { kind: 'heal', value: -30 },
  ],
};
```

**Step 2: Add new gate pairs**

Append to the gate pair configs section:

```typescript
export const PAIR_REFIT_GUARDIAN: GatePairConfig = {
  layout: 'forced',
  left: GATE_REFIT_GUARDIAN,
  right: GATE_REFIT_SPEED,
};

export const PAIR_ENHANCE_ACT3: GatePairConfig = {
  layout: 'forced',
  left: GATE_ATK_UP_20,
  right: GATE_SHIELD,
};
```

**Step 3: Run type check**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/game/gates.ts
git commit -m "feat: Add Act 3 gate definitions (ATK+20, Shield, Guardian refit, Berserk)"
```

---

### Task 5: Enemy Entity Factory — New Types

**Files:**
- Modify: `src/engine/entities/Enemy.ts`

**Step 1: Add hitbox mapping for new types**

In `getEnemyHitbox()`, add cases:

```typescript
    case 'dodger':     return HITBOX.dodger;
    case 'splitter':   return HITBOX.splitter;
    case 'summoner':   return HITBOX.summoner;
```

No other changes needed — `createEnemy()` already works for any `EnemyType` because it reads from `ENEMY_STATS[enemyType]`.

**Step 2: Run type check**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/engine/entities/Enemy.ts
git commit -m "feat: Add hitbox mappings for dodger, splitter, summoner enemies"
```

---

### Task 6: Enemy AI System — New Behaviors

**Files:**
- Modify: `src/engine/systems/EnemyAISystem.ts`

**Step 1: Add imports**

Add to imports in `EnemyAISystem.ts`:

```typescript
import { DODGER_DETECT_RADIUS, DODGER_SPEED, DODGER_COOLDOWN, SUMMONER_INTERVAL, SUMMONER_MAX_SPAWNS } from '@/constants/balance';
import { createEnemy } from '@/engine/entities/Enemy';
```

**Step 2: Add dodger movement case**

In the movement switch, add before `default`:

```typescript
        case 'dodger': {
          // Detect incoming player bullets and dodge sideways
          let dodging = false;
          if (enemy.moveTimer <= 0) { // moveTimer repurposed as dodge cooldown
            for (const b of entities.playerBullets) {
              if (!b.active) continue;
              const dx = (b.x + b.width / 2) - (enemy.x + enemy.width / 2);
              const dy = (b.y + b.height / 2) - (enemy.y + enemy.height / 2);
              if (Math.abs(dx) < DODGER_DETECT_RADIUS && dy > 0 && dy < DODGER_DETECT_RADIUS * 2) {
                // Dodge away from bullet
                enemy.moveDirection = dx > 0 ? -1 : 1;
                enemy.x += enemy.moveDirection * DODGER_SPEED * dt;
                enemy.moveTimer = DODGER_COOLDOWN;
                dodging = true;
                break;
              }
            }
          } else {
            enemy.moveTimer -= dt;
          }
          // Clamp to screen bounds
          if (enemy.x < 16) enemy.x = 16;
          if (enemy.x + enemy.width > 304) enemy.x = 304 - enemy.width;
          break;
        }
```

**Step 3: Add summoner behavior**

In the movement switch, add:

```typescript
        case 'summoner': {
          // Static position, summon swarms periodically
          enemy.shootTimer += dt;
          if (enemy.shootTimer >= SUMMONER_INTERVAL) {
            enemy.shootTimer = 0;
            // Count active swarm children (rough limit)
            let swarmCount = 0;
            for (const e of entities.enemies) {
              if (e.active && e.enemyType === 'swarm') swarmCount++;
            }
            if (swarmCount < SUMMONER_MAX_SPAWNS) {
              for (let i = 0; i < 2; i++) {
                const spawnX = enemy.x + enemy.width / 2 + (i === 0 ? -20 : 20);
                const swarm = createEnemy('swarm', spawnX, enemy.y + enemy.height, 1.0);
                swarm.spawnTime = entities.stageTime;
                acquireFromPool(entities.enemies, swarm);
              }
            }
          }
          break;
        }
```

Note: splitter has no special movement (uses default, scrolls down via MovementSystem). The splitter behavior is in CollisionSystem (Task 7).

**Step 4: Add dodger shooting case**

In the shooting switch, add before `default`:

```typescript
          case 'dodger': {
            // Aimed shot like patrol
            if (player.active) {
              const dx = (player.x + player.width / 2) - fireX;
              const dy = (player.y + player.height / 2) - fireY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0) {
                const vx = (dx / dist) * baseSpeed;
                const vy = (dy / dist) * baseSpeed;
                const bullet = createEnemyBullet(fireX, fireY, stats.attackDamage, { speed: baseSpeed, vx, vy });
                acquireFromPool(entities.enemyBullets, bullet);
              }
            }
            break;
          }
```

Summoner never shoots (attackInterval = 0, so the shooting block is skipped).

**Step 5: Run type check**

Run: `npx tsc --noEmit`

**Step 6: Commit**

```bash
git add src/engine/systems/EnemyAISystem.ts
git commit -m "feat: Add dodger dodge AI and summoner swarm-spawn AI"
```

---

### Task 7: Collision System — Splitter Death

**Files:**
- Modify: `src/engine/systems/CollisionSystem.ts`

**Step 1: Find the enemy kill section**

Look for where `applyEnemyKillReward` is called in `checkPlayerBulletsVsEnemies`. After the enemy HP reaches 0 and `deactivateEnemy(enemy)` is called, add splitter logic.

Find the code section that calls `deactivateEnemy(enemy)` after `enemy.hp <= 0` in `checkPlayerBulletsVsEnemies`. Add right after:

```typescript
      // Splitter: spawn 3 swarms on death
      if (enemy.enemyType === 'splitter') {
        const cx = enemy.x + enemy.width / 2;
        const cy = enemy.y + enemy.height / 2;
        for (const offset of SPLITTER_SPAWN_OFFSETS) {
          const swarm = createEnemy('swarm', cx + offset, cy, 1.0);
          swarm.spawnTime = entities.stageTime;
          acquireFromPool(entities.enemies, swarm);
        }
      }
```

**Step 2: Add imports**

Add to the imports:

```typescript
import { SPLITTER_SPAWN_OFFSETS } from '@/constants/balance';
import { createEnemy } from '@/engine/entities/Enemy';
import { acquireFromPool } from '@/engine/pool';
```

Check if `acquireFromPool` is already imported. If so, skip.

**Step 3: Run type check**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/engine/systems/CollisionSystem.ts
git commit -m "feat: Add splitter death spawns 3 swarms on kill"
```

---

### Task 8: Damage Reduce Ability

**Files:**
- Modify: `src/engine/systems/CollisionSystem.ts` (or wherever player damage is applied)

**Step 1: Find player damage application**

In `CollisionSystem.ts`, find where `store.takeDamage(damage)` or `store.setHp()` is called when the player takes damage. The `damage_reduce` ability should reduce incoming damage by 30%.

Look for the `onPlayerHit` function call or the damage application. The damage reduction should be applied at the point where damage is calculated, before applying it to the store.

In the `checkDamageToPlayer` function or `onPlayerHit` effect function in `src/engine/effects.ts`, find where damage is applied and wrap it:

```typescript
// Before applying damage, check for damage_reduce ability
const form = getForm(); // need to get current form
let finalDamage = damage;
if (form.specialAbility === 'damage_reduce') {
  finalDamage = Math.round(damage * 0.7);
}
```

The exact location depends on how `onPlayerHit` works. Read `src/engine/effects.ts` to find the damage path.

**Important:** This task requires reading the effects.ts file to understand the exact damage application flow. The implementer should trace from `checkDamageToPlayer` → `onPlayerHit` → store.takeDamage to find the right insertion point.

**Step 2: Run type check**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/engine/systems/CollisionSystem.ts src/engine/effects.ts
git commit -m "feat: Implement damage_reduce special ability (30% damage reduction)"
```

---

### Task 9: Upgrade System Expansion — DEF and Credit Boost

**Files:**
- Modify: `src/game/upgrades.ts`
- Modify: `src/stores/saveDataStore.ts`
- Modify: `app/upgrade.tsx`

**Step 1: Add upgrade configs**

In `src/game/upgrades.ts`, add to `UPGRADE_CONFIG`:

```typescript
  def:         { effect: 0.03, maxLevel: 5, costPerLevel: 150, label: 'DEF' },
  creditBoost: { effect: 0.1,  maxLevel: 5, costPerLevel: 200, label: 'CR' },
```

**Step 2: Update SaveData interface**

In `src/stores/saveDataStore.ts`, add to the `upgrades` type in `SaveData`:

```typescript
  upgrades: {
    baseAtk: number;
    baseHp: number;
    baseSpeed: number;
    baseDef: number;
    baseCreditBoost: number;
  };
```

**Step 3: Update INITIAL_SAVE**

```typescript
  upgrades: { baseAtk: 0, baseHp: 0, baseSpeed: 0, baseDef: 0, baseCreditBoost: 0 },
```

**Step 4: Add upgrade methods**

Add to the store:

```typescript
  upgradeDef: () => {
    const { upgrades } = get();
    if (upgrades.baseDef >= 5) return false;
    const cost = 150 * (upgrades.baseDef + 1);
    if (!get().spendCredits(cost)) return false;
    set((s) => ({ upgrades: { ...s.upgrades, baseDef: s.upgrades.baseDef + 1 } }));
    get().save();
    return true;
  },

  upgradeCreditBoost: () => {
    const { upgrades } = get();
    if (upgrades.baseCreditBoost >= 5) return false;
    const cost = 200 * (upgrades.baseCreditBoost + 1);
    if (!get().spendCredits(cost)) return false;
    set((s) => ({ upgrades: { ...s.upgrades, baseCreditBoost: s.upgrades.baseCreditBoost + 1 } }));
    get().save();
    return true;
  },
```

Also add to the `SaveDataState` interface:

```typescript
  upgradeDef: () => boolean;
  upgradeCreditBoost: () => boolean;
```

**Step 5: Update upgrade screen**

In `app/upgrade.tsx`, change `UpgradeKey` and `UPGRADE_KEYS`:

```typescript
type UpgradeKey = 'atk' | 'hp' | 'speed' | 'def' | 'creditBoost';

const UPGRADE_KEYS: UpgradeKey[] = ['atk', 'hp', 'speed', 'def', 'creditBoost'];
```

Update `UPGRADE_ACTIONS`:

```typescript
const UPGRADE_ACTIONS: Record<UpgradeKey, () => boolean> = {
  atk: () => useSaveDataStore.getState().upgradeAtk(),
  hp: () => useSaveDataStore.getState().upgradeHp(),
  speed: () => useSaveDataStore.getState().upgradeSpeed(),
  def: () => useSaveDataStore.getState().upgradeDef(),
  creditBoost: () => useSaveDataStore.getState().upgradeCreditBoost(),
};
```

Update `getLevelForKey`:

```typescript
  const getLevelForKey = (key: UpgradeKey): number => {
    switch (key) {
      case 'atk': return upgrades.baseAtk;
      case 'hp': return upgrades.baseHp;
      case 'speed': return upgrades.baseSpeed;
      case 'def': return upgrades.baseDef;
      case 'creditBoost': return upgrades.baseCreditBoost;
    }
  };
```

**Step 6: Run type check and tests**

Run: `npx tsc --noEmit && npx jest --passWithNoTests`

**Step 7: Commit**

```bash
git add src/game/upgrades.ts src/stores/saveDataStore.ts app/upgrade.tsx
git commit -m "feat: Add DEF and Credit Boost upgrade categories"
```

---

### Task 10: Rendering — New Enemy Shapes/Colors

**Files:**
- Modify: `src/engine/systems/SyncRenderSystem.ts` (or wherever enemy colors/shapes are mapped)

**Step 1: Check SyncRenderSystem for enemy type dispatch**

The rendering system maps enemy types to visual properties (color, shape). The new enemy types (dodger, splitter, summoner) need entries in `ENEMY_TYPE_COLORS` (already done in Task 2) and may need shape entries in the SyncRenderSystem.

Read the SyncRenderSystem to find where `enemy.enemyType` is used for rendering dispatch. The new types should fall through to default rendering with their colors from `ENEMY_TYPE_COLORS`.

If there's a switch on enemyType for shapes, add cases. Otherwise the default path should handle it via the color map.

**Step 2: Run type check**

Run: `npx tsc --noEmit`

**Step 3: Commit (if changes needed)**

```bash
git add src/engine/systems/SyncRenderSystem.ts
git commit -m "feat: Add rendering support for dodger, splitter, summoner enemies"
```

---

### Task 11: i18n — All New Strings

**Files:**
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/ja.ts`

**Step 1: Add English strings**

In `en.ts`, add to `forms`:

```typescript
    SD_Guardian: 'Guardian',
```

Add to `abilities`:

```typescript
    shield_pierce: 'Shield Pierce',
    damage_reduce: 'Damage Reduce',
```

Note: `shield_pierce` may already exist. Check first. If not, add it.

**Step 2: Add Japanese strings**

In `ja.ts`, add matching keys with Japanese translations:

```typescript
    SD_Guardian: 'ガーディアン',
```

```typescript
    shield_pierce: 'シールド貫通',
    damage_reduce: 'ダメージ軽減',
```

**Step 3: Run type check and i18n key sync test**

Run: `npx tsc --noEmit && npx jest --passWithNoTests`

The i18n key sync test should catch any missing keys.

**Step 4: Commit**

```bash
git add src/i18n/locales/en.ts src/i18n/locales/ja.ts
git commit -m "feat: Add i18n strings for Guardian form and new abilities"
```

---

### Task 12: Stage 11 — Phantom Zone (Dodger Introduction)

**Files:**
- Create: `src/game/stages/stage11.ts`
- Modify: `src/game/stages/index.ts`

**Step 1: Create stage file**

Create `src/game/stages/stage11.ts`:

```typescript
import type { StageDefinition } from '@/types/stages';
import {
  GATE_ATK_UP_15,
  GATE_FR_UP_30,
  GATE_HEAL_20,
  GATE_ATK_UP,
  GATE_SPD_UP,
  GATE_REFIT_HEAVY,
  GATE_REFIT_SPEED,
  GATE_GLASS_CANNON,
  GATE_SPEED_DEMON,
} from '@/game/gates';

/** Stage 11: Phantom Zone — Dodger introduction */
export const STAGE_11: StageDefinition = {
  id: 11,
  name: 'Phantom Zone',
  isBossStage: false,
  duration: 110,
  difficulty: {
    scrollSpeedMultiplier: 1.1,
    enemySpawnInterval: 2.2,
    enemyHpMultiplier: 1.3,
    enemyAtkMultiplier: 1.2,
    maxConcurrentEnemies: 10,
    bulletSpeedMultiplier: 1.1,
    attackIntervalMultiplier: 0.9,
  },
  timeline: [
    // Intro: familiar enemies
    { time: 4, type: 'enemy_spawn', enemyType: 'patrol', x: 100 },
    { time: 6, type: 'enemy_spawn', enemyType: 'patrol', x: 220 },
    // First dodger introduction
    { time: 12, type: 'enemy_spawn', enemyType: 'dodger', x: 160 },
    // Enhance gate
    {
      time: 18,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP_15, right: GATE_FR_UP_30 },
    },
    // Dodger pair
    { time: 24, type: 'enemy_spawn', enemyType: 'dodger', x: 80 },
    { time: 24, type: 'enemy_spawn', enemyType: 'dodger', x: 240 },
    { time: 28, type: 'enemy_spawn', enemyType: 'stationary', x: 160 },
    // Recovery
    {
      time: 34,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_HEAL_20, right: GATE_ATK_UP },
    },
    // Mixed wave: dodgers + patrol
    { time: 40, type: 'enemy_spawn', enemyType: 'dodger', x: 100 },
    { time: 42, type: 'enemy_spawn', enemyType: 'patrol', x: 200 },
    { time: 44, type: 'enemy_spawn', enemyType: 'dodger', x: 260 },
    // Refit gate
    {
      time: 50,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_REFIT_HEAVY, right: GATE_REFIT_SPEED },
    },
    // Dense dodger wave
    { time: 56, type: 'enemy_spawn', enemyType: 'dodger', x: 60 },
    { time: 56, type: 'enemy_spawn', enemyType: 'dodger', x: 160 },
    { time: 56, type: 'enemy_spawn', enemyType: 'dodger', x: 260 },
    // Boost lane
    { time: 62, type: 'boost_lane_start', x: 80, width: 160 },
    { time: 64, type: 'enemy_spawn', enemyType: 'phalanx', x: 160 },
    { time: 66, type: 'enemy_spawn', enemyType: 'dodger', x: 80 },
    { time: 66, type: 'enemy_spawn', enemyType: 'dodger', x: 240 },
    { time: 70, type: 'boost_lane_end' },
    // Tradeoff
    {
      time: 76,
      type: 'gate_spawn',
      gateConfig: { layout: 'optional', left: GATE_GLASS_CANNON, right: GATE_SPEED_DEMON },
    },
    // Final wave
    { time: 82, type: 'enemy_spawn', enemyType: 'juggernaut', x: 160 },
    { time: 84, type: 'enemy_spawn', enemyType: 'dodger', x: 80 },
    { time: 84, type: 'enemy_spawn', enemyType: 'dodger', x: 240 },
    // Enhance for combo
    {
      time: 90,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_SPD_UP },
    },
    { time: 96, type: 'enemy_spawn', enemyType: 'dodger', x: 160 },
    { time: 98, type: 'enemy_spawn', enemyType: 'patrol', x: 100 },
    { time: 98, type: 'enemy_spawn', enemyType: 'patrol', x: 220 },
  ],
};
```

**Step 2: Register in stages index**

In `src/game/stages/index.ts`, add import and registration:

```typescript
import { STAGE_11 } from './stage11';
```

Add `11: STAGE_11,` to the STAGES record.

**Step 3: Run type check**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/game/stages/stage11.ts src/game/stages/index.ts
git commit -m "feat: Add Stage 11 — Phantom Zone (dodger introduction)"
```

---

### Task 13: Stage 12 — Hive Cluster (Splitter Introduction)

**Files:**
- Create: `src/game/stages/stage12.ts`
- Modify: `src/game/stages/index.ts`

**Step 1: Create stage file**

Create `src/game/stages/stage12.ts` following the same pattern as stage11. Key characteristics:
- Duration: 120s
- Difficulty: `{ scrollSpeed: 1.1, spawnInterval: 2.0, hpMul: 1.4, atkMul: 1.3, maxEnemies: 14, bulletSpeedMul: 1.2, atkIntervalMul: 0.85 }`
- Theme: Splitter + swarm swarms. Multiple splitters that create chain reactions of swarms.
- Import gates: `GATE_ATK_UP_10, GATE_FR_UP, GATE_HEAL_30, GATE_GROWTH_ATK, GATE_GROWTH_SPD, GATE_RAPID_FIRE, GATE_TANK`
- Timeline:
  - 0-20s: Swarm groups + first splitter
  - 20-40s: Multiple splitters with enhance gates
  - 40-60s: Splitter + swarm combo with debris
  - 60-80s: Growth gates + dense splitter wave
  - 80-100s: Tradeoff options + mixed enemies
  - 100-120s: Final wave with multiple splitters

**Step 2: Register in index**

Add import and `12: STAGE_12` to STAGES.

**Step 3: Run type check and commit**

```bash
git add src/game/stages/stage12.ts src/game/stages/index.ts
git commit -m "feat: Add Stage 12 — Hive Cluster (splitter introduction)"
```

---

### Task 14: Stage 13 — Command Nexus (Summoner Introduction)

**Files:**
- Create: `src/game/stages/stage13.ts`
- Modify: `src/game/stages/index.ts`

**Step 1: Create stage file**

Key characteristics:
- Duration: 120s
- Difficulty: `{ scrollSpeed: 1.2, spawnInterval: 2.0, hpMul: 1.5, atkMul: 1.3, maxEnemies: 12, bulletSpeedMul: 1.2, atkIntervalMul: 0.85 }`
- Theme: Summoner protected by phalanx escorts. Prioritize the summoner before it floods the screen with swarms.
- Import gates: `GATE_ATK_UP_15, GATE_FR_UP_30, GATE_HEAL_20, GATE_REFIT_GUARDIAN, GATE_REFIT_SPEED, PAIR_ENHANCE_ACT3`
- Timeline:
  - 0-25s: Phalanx pair → summoner introduction (behind phalanx)
  - 25-45s: Summoner + dodger combination
  - 45-65s: Refit gate (Guardian introduction), summoner + splitter combo
  - 65-85s: Boost lane with summoner, high-density wave
  - 85-120s: Double summoner + phalanx wall, enhance gates for combo

**Step 2: Register and commit**

```bash
git add src/game/stages/stage13.ts src/game/stages/index.ts
git commit -m "feat: Add Stage 13 — Command Nexus (summoner introduction)"
```

---

### Task 15: Stage 14 — Chaos Corridor (All Enemy Types)

**Files:**
- Create: `src/game/stages/stage14.ts`
- Modify: `src/game/stages/index.ts`

**Step 1: Create stage file**

Key characteristics:
- Duration: 130s
- Difficulty: `{ scrollSpeed: 1.3, spawnInterval: 1.6, hpMul: 1.6, atkMul: 1.4, maxEnemies: 16, bulletSpeedMul: 1.3, atkIntervalMul: 0.8 }`
- Theme: All 9 enemy types in high-density combinations. Multiple boss-prep tradeoffs.
- Import gates: `GATE_ATK_UP_20, GATE_SHIELD, GATE_HEAL_FULL, GATE_TRADEOFF_BERSERK, GATE_RAPID_GLASS, GATE_TANK, PAIR_ENHANCE_ACT3, PAIR_ROULETTE_ATK`
- Timeline: Dense, varied waves mixing all 9 enemy types with aggressive gate options

**Step 2: Register and commit**

```bash
git add src/game/stages/stage14.ts src/game/stages/index.ts
git commit -m "feat: Add Stage 14 — Chaos Corridor (all enemy types, high density)"
```

---

### Task 16: Stage 15 — Terminus Core (Boss 3)

**Files:**
- Create: `src/game/stages/stage15.ts`
- Modify: `src/game/stages/index.ts`

**Step 1: Create stage file**

Key characteristics:
- Duration: 180s
- isBossStage: true
- Difficulty: `{ scrollSpeed: 1.0, spawnInterval: 2.5, hpMul: 1.5, atkMul: 1.3, maxEnemies: 8, bulletSpeedMul: 1.2, atkIntervalMul: 0.85 }`
- Theme: Short intense pre-boss gauntlet → boss_3 spawn at ~65s
- Import gates: Full heal, strong enhance, refit options
- Timeline similar to Stage 10 pattern but with new enemy types in pre-boss section
- Boss spawn: `{ time: 65, type: 'boss_spawn', bossId: 'boss_3' }`

**Step 2: Register and commit**

```bash
git add src/game/stages/stage15.ts src/game/stages/index.ts
git commit -m "feat: Add Stage 15 — Terminus Core (Boss 3 stage)"
```

---

### Task 17: Boss 3 — Data Scaling

**Files:**
- Modify: `src/engine/entities/Boss.ts` (if bossIndex-based scaling exists)
- Modify: `src/engine/systems/BossSystem.ts` or `bossPhase.ts` (for Boss 3 attack pattern differences)

**Step 1: Check boss entity creation**

Read `src/engine/entities/Boss.ts` to see how `bossIndex` is used. The HP is calculated by `getBossHp(bossIndex)` which already scales: `500 * (1 + (3-1) * 0.5) = 1000 HP`.

**Step 2: Update Boss drone counts**

The `BOSS_DRONE_COUNTS` already updated in Task 2 to include `3: 5`.

**Step 3: Adjust Boss 3 specific behaviors**

In the boss attack system, check if `bossIndex` is used for attack pattern branching. Boss 3 differences:
- spread phase: 2 of 5 bullets are homing (check `BOSS_3_HOMING_COUNT`)
- laser width: 40px instead of 30px (check `BOSS_3_LASER_WIDTH`)
- drone count: 5 (already in `BOSS_DRONE_COUNTS`)

Add bossIndex-based branching where needed. Read the BossSystem to find exact insertion points.

**Step 4: Run type check and commit**

```bash
git add src/engine/entities/Boss.ts src/engine/systems/BossSystem.ts
git commit -m "feat: Add Boss 3 scaling — homing spread, wider laser, more drones"
```

---

### Task 18: Stage Unlock Progression

**Files:**
- Modify: `src/engine/systems/GameOverSystem.ts` (or wherever stage unlock happens)

**Step 1: Check existing unlock logic**

Read `GameOverSystem.ts` to find where `unlockStage(nextStageId)` is called. The existing pattern should already handle sequential unlock (clear stage N → unlock stage N+1). If so, stages 11-15 should auto-unlock as the player clears stages 10-14.

Verify the unlock logic works for stages > 10. If there's a hardcoded max, update it.

**Step 2: Run tests**

Run: `npx jest --passWithNoTests`

**Step 3: Commit (if changes needed)**

```bash
git add src/engine/systems/GameOverSystem.ts
git commit -m "feat: Ensure stage unlock progression works for stages 11-15"
```

---

### Task 19: Tests — Update Existing, Add Stage Validation

**Files:**
- Modify: `src/game/__tests__/stages.test.ts`
- Modify: `src/game/__tests__/upgrades.test.ts`
- Modify: `src/game/__tests__/difficulty.test.ts`

**Step 1: Update stage tests**

The stages test should validate all 15 stages load correctly. Check existing test patterns and extend to cover stages 11-15.

**Step 2: Update upgrade tests**

Add test cases for DEF and CR upgrades.

**Step 3: Run all tests**

Run: `npx jest --passWithNoTests`

**Step 4: Commit**

```bash
git add src/game/__tests__/
git commit -m "test: Update tests for Act 3 stages, upgrades, and new enemy types"
```

---

### Task 20: Final Quality Checks

**Step 1: Run full quality suite**

```bash
npx expo lint
npx tsc --noEmit
npx jest --passWithNoTests
```

Fix any errors.

**Step 2: Final commit if fixes needed**

```bash
git add -u
git commit -m "fix: Address lint/type/test issues from Act 3 expansion"
```
