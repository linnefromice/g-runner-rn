import type { StageDefinition } from '@/types/stages';
import { getDifficultyForStage } from '@/game/difficulty';
import {
  GATE_ATK_UP,
  GATE_SPD_UP,
  GATE_FR_UP,
  GATE_ATK_UP_10,
  GATE_HEAL_30,
  GATE_HEAL_50P,
  GATE_GLASS_CANNON,
  GATE_RAPID_FIRE,
  GATE_REFIT_HEAVY,
  GATE_REFIT_SPEED,
} from '@/game/gates';

/** Stage 4: Gravity Well — High density, all gate types */
export const STAGE_4: StageDefinition = {
  id: 4,
  name: 'Gravity Well',
  isBossStage: false,
  duration: 120,
  difficulty: getDifficultyForStage(4),
  timeline: [
    // Wave 1: aggressive opening
    { time: 3, type: 'enemy_spawn', enemyType: 'patrol', x: 100 },
    { time: 3, type: 'enemy_spawn', enemyType: 'patrol', x: 220 },
    { time: 6, type: 'enemy_spawn', enemyType: 'stationary', x: 160 },
    // Enhance
    {
      time: 12,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP_10, right: GATE_SPD_UP },
    },
    // Wave 2
    { time: 18, type: 'enemy_spawn', enemyType: 'patrol', x: 80 },
    { time: 20, type: 'enemy_spawn', enemyType: 'patrol', x: 240 },
    { time: 22, type: 'enemy_spawn', enemyType: 'stationary', x: 160 },
    { time: 22, type: 'enemy_spawn', enemyType: 'stationary', x: 60 },
    // Recovery (big heal)
    {
      time: 28,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_HEAL_50P, right: GATE_HEAL_30 },
    },
    // Wave 3: patrol swarm
    { time: 35, type: 'enemy_spawn', enemyType: 'patrol', x: 100 },
    { time: 36, type: 'enemy_spawn', enemyType: 'patrol', x: 200 },
    { time: 38, type: 'enemy_spawn', enemyType: 'patrol', x: 160 },
    // Refit gate
    {
      time: 44,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_REFIT_HEAVY, right: GATE_REFIT_SPEED },
    },
    // Wave 4
    { time: 50, type: 'enemy_spawn', enemyType: 'patrol', x: 120 },
    { time: 52, type: 'enemy_spawn', enemyType: 'stationary', x: 260 },
    { time: 54, type: 'enemy_spawn', enemyType: 'patrol', x: 60 },
    // Tradeoff gate (optional)
    {
      time: 60,
      type: 'gate_spawn',
      gateConfig: { layout: 'optional', left: GATE_GLASS_CANNON, right: GATE_RAPID_FIRE },
    },
    // Wave 5: dense mixed
    { time: 66, type: 'enemy_spawn', enemyType: 'patrol', x: 80 },
    { time: 66, type: 'enemy_spawn', enemyType: 'patrol', x: 240 },
    { time: 68, type: 'enemy_spawn', enemyType: 'stationary', x: 160 },
    { time: 70, type: 'enemy_spawn', enemyType: 'patrol', x: 140 },
    // Enhance (combo buildup)
    {
      time: 76,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_FR_UP },
    },
    // Wave 6
    { time: 82, type: 'enemy_spawn', enemyType: 'patrol', x: 100 },
    { time: 84, type: 'enemy_spawn', enemyType: 'patrol', x: 200 },
    { time: 86, type: 'enemy_spawn', enemyType: 'stationary', x: 160 },
    // Enhance gate (3rd → can trigger awakening)
    {
      time: 92,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_SPD_UP },
    },
    // Recovery before finale
    {
      time: 100,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_HEAL_30, right: GATE_ATK_UP_10 },
    },
    // Final wave
    { time: 105, type: 'enemy_spawn', enemyType: 'patrol', x: 80 },
    { time: 105, type: 'enemy_spawn', enemyType: 'patrol', x: 160 },
    { time: 105, type: 'enemy_spawn', enemyType: 'patrol', x: 240 },
  ],
};
