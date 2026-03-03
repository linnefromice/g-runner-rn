# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project G-Runner** — a 2D vertical-scrolling SF gate runner game (hyper-casual) built with React Native.
Full requirements: `docs/v1/REQUIREMENTS-r3.md` (v3.1, authoritative spec)

## Tech Stack

- **Framework:** Expo (Managed Workflow) with `expo-router` (file-based routing)
- **Game Loop / ECS:** `react-native-game-engine` (RNGE) — 60fps update loop
- **Rendering:** `@shopify/react-native-skia` — GPU-accelerated 2D drawing (glow, particles, neon effects)
- **Collision:** Custom AABB (no matter-js / no physics engine)
- **State:** `zustand` (game session + persistent data)
- **Sound:** `expo-av`
- **Storage:** `AsyncStorage`

## Commands

```bash
# Development
npx expo start                  # Start dev server
npx expo start --ios            # iOS simulator
npx expo start --android        # Android emulator

# Type checking & linting
npx tsc --noEmit                # TypeScript check
npx expo lint                   # ESLint

# Build
npx expo prebuild               # Generate native projects
eas build --profile development # EAS dev build
```

## Architecture (Critical)

### Three-Layer Separation

```
app/          → expo-router pages (screens, navigation)
src/engine/   → Game logic (RNGE systems, entities, collision) — pure TS, no React
src/rendering/→ Skia drawing (reads engine state, renders to Canvas) — no game logic
src/stores/   → Zustand stores bridging engine↔UI
src/game/     → Data definitions (forms, stages, difficulty, scoring)
src/ui/       → React Native HUD components (HP bar, EX button, combo gauge)
```

### RNGE + Skia Integration (MUST follow)

**Entity coordinates must NEVER use `useState`/`setState`.** This causes 60fps re-render storms.

The correct pattern:
1. RNGE `systems` mutate `entities` (plain JS objects) directly each frame
2. Skia `GameCanvas` reads entities via `useFrameCallback` — bypasses React render cycle
3. Only HUD elements (HP, score, EX gauge) use Zustand/React state — event-driven updates only

```
RNGE Systems → entities (plain object mutation) → Skia useFrameCallback reads & draws
                                                → Zustand setState (event-driven, for HUD only)
```

**Banned:** Individual React components per entity (`<Enemy />` × 100). All entities draw on a single Skia Canvas.

### Coordinate System

Logical coordinates: X `0–320` (fixed width), Y dynamic based on aspect ratio.
Scale: `screenWidth / 320`. Player hitbox (16×16) is smaller than visual (32×40).

### State Architecture

| Layer | Storage | Purpose |
|-------|---------|---------|
| Game entities | RNGE entities (plain JS) | Positions, bullets, enemies — mutated by systems |
| Session UI | Zustand `gameSessionStore` | HP display, score, combo, EX gauge — React-connected |
| Persistent | Zustand `saveDataStore` + AsyncStorage | High scores, unlocks, credits, upgrades |

Systems bridge game→UI: e.g., `CollisionSystem` calls `gameSessionStore.getState().setHp(newHp)`.

## Game-Specific Conventions

- **Stages** are data-driven: timeline-based JSON definitions in `src/game/stages/`
- **Forms** (mecha types) are extensible via `MechaFormId` union type + `MechaFormDefinition` config objects
- **Gates** come in 4 types: `enhance`, `refit`, `tradeoff`, `recovery`
- **Boss phase** differs from normal: background slows to 0.5x, enemy/gate spawning stops, boss hovers at top
- **Combo** uses 3-segment gauge (not a number). Resets on damage/tradeoff/refit gates. 3 consecutive enhance gates → Awakened form (10s)
- **i-frame:** 1.5s invincibility after hit, with blink animation

## Performance Targets

- 60fps stable on iPhone SE 2nd gen
- 50+ simultaneous entities (bullets + enemies + effects)
- Touch input latency ≤ 33ms (2 frames)
- System update budget: ≤ 16ms per frame on JS thread
