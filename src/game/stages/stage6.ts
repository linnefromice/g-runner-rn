import type { StageDefinition } from '@/types/stages';
import { getDifficultyForStage } from '@/game/difficulty';
import {
  GATE_ATK_UP,
  GATE_SPD_UP,
  GATE_FR_UP,
  GATE_ATK_UP_10,
  GATE_HEAL_20,
  GATE_GLASS_CANNON,
  GATE_SPEED_DEMON,
  GATE_REFIT_HEAVY,
  GATE_REFIT_SPEED,
} from '@/game/gates';

/** Stage 6: Scrap Yard — Swarm introduction, debris field */
export const STAGE_6: StageDefinition = {
  id: 6,
  name: 'Scrap Yard',
  isBossStage: false,
  duration: 100,
  difficulty: getDifficultyForStage(6),
  timeline: [
    // Wave 1: patrol scouts
    { time: 3, type: 'enemy_spawn', enemyType: 'patrol', x: 120 },
    { time: 5, type: 'enemy_spawn', enemyType: 'patrol', x: 200 },
    // First swarm wave
    { time: 10, type: 'enemy_spawn', enemyType: 'swarm', x: 80, count: 4 },
    // Enhance gate (only one pure enhance this stage)
    {
      time: 16,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP_10, right: GATE_SPD_UP },
    },
    // Wave 2: stationary + swarm + debris field
    { time: 22, type: 'enemy_spawn', enemyType: 'stationary', x: 60 },
    { time: 22, type: 'enemy_spawn', enemyType: 'stationary', x: 260 },
    { time: 24, type: 'debris_spawn', x: 150, count: 2 },
    { time: 26, type: 'enemy_spawn', enemyType: 'swarm', x: 160, count: 6 },
    // Tradeoff gate (optional) — replaced recovery
    {
      time: 32,
      type: 'gate_spawn',
      gateConfig: { layout: 'optional', left: GATE_GLASS_CANNON, right: GATE_SPEED_DEMON },
    },
    // Wave 3: patrol + swarm escort
    { time: 38, type: 'enemy_spawn', enemyType: 'patrol', x: 100 },
    { time: 38, type: 'enemy_spawn', enemyType: 'patrol', x: 220 },
    { time: 42, type: 'enemy_spawn', enemyType: 'swarm', x: 160, count: 5 },
    // Refit gate — forces form change
    {
      time: 48,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_REFIT_HEAVY, right: GATE_REFIT_SPEED },
    },
    // Wave 4: big swarm + debris
    { time: 53, type: 'debris_spawn', x: 80, count: 2 },
    { time: 55, type: 'enemy_spawn', enemyType: 'swarm', x: 80, count: 8 },
    { time: 58, type: 'enemy_spawn', enemyType: 'patrol', x: 160 },
    // Enhance gate
    {
      time: 64,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_FR_UP },
    },
    // Wave 5: mixed density
    { time: 70, type: 'enemy_spawn', enemyType: 'stationary', x: 80 },
    { time: 70, type: 'enemy_spawn', enemyType: 'stationary', x: 240 },
    { time: 74, type: 'enemy_spawn', enemyType: 'swarm', x: 200, count: 6 },
    { time: 76, type: 'enemy_spawn', enemyType: 'patrol', x: 120 },
    // Minimal recovery (HP+20 paired with enhance, not standalone heal)
    {
      time: 82,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_HEAL_20, right: GATE_ATK_UP },
    },
    // Final wave: swarm + patrol + debris
    { time: 86, type: 'debris_spawn', x: 200, count: 2 },
    { time: 88, type: 'enemy_spawn', enemyType: 'swarm', x: 160, count: 8 },
    { time: 90, type: 'enemy_spawn', enemyType: 'patrol', x: 80 },
    { time: 90, type: 'enemy_spawn', enemyType: 'patrol', x: 240 },
    // Enhance gate for combo
    {
      time: 94,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_SPD_UP },
    },
  ],
};
