import type { StageDefinition } from '@/types/stages';
import { getDifficultyForStage } from '@/game/difficulty';
import {
  GATE_ATK_UP,
  GATE_SPD_UP,
  GATE_HEAL_20,
  GATE_FR_UP,
  GATE_GLASS_CANNON,
  GATE_SPEED_DEMON,
} from '@/game/gates';

/** Stage 3: Nebula Corridor — Tradeoff gate + optional layout */
export const STAGE_3: StageDefinition = {
  id: 3,
  name: 'Nebula Corridor',
  isBossStage: false,
  duration: 110,
  difficulty: getDifficultyForStage(3),
  timeline: [
    // Wave 1
    { time: 3, type: 'enemy_spawn', enemyType: 'patrol', x: 160 },
    { time: 6, type: 'enemy_spawn', enemyType: 'stationary', x: 80 },
    { time: 6, type: 'enemy_spawn', enemyType: 'stationary', x: 240 },
    // Enhance gate
    {
      time: 14,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_SPD_UP },
    },
    // Wave 2: patrol heavy
    { time: 22, type: 'enemy_spawn', enemyType: 'patrol', x: 100 },
    { time: 24, type: 'enemy_spawn', enemyType: 'patrol', x: 220 },
    { time: 28, type: 'enemy_spawn', enemyType: 'stationary', x: 160 },
    // Recovery
    {
      time: 35,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_HEAL_20, right: GATE_FR_UP },
    },
    // Wave 3
    { time: 42, type: 'enemy_spawn', enemyType: 'patrol', x: 140 },
    { time: 44, type: 'enemy_spawn', enemyType: 'stationary', x: 60 },
    { time: 44, type: 'enemy_spawn', enemyType: 'stationary', x: 260 },
    // Tradeoff gate — optional layout (can be dodged)
    {
      time: 52,
      type: 'gate_spawn',
      gateConfig: { layout: 'optional', left: GATE_GLASS_CANNON, right: GATE_SPEED_DEMON },
    },
    // Wave 4
    { time: 60, type: 'enemy_spawn', enemyType: 'patrol', x: 160 },
    { time: 62, type: 'enemy_spawn', enemyType: 'patrol', x: 80 },
    // Enhance gate
    {
      time: 70,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_FR_UP },
    },
    // Wave 5: dense
    { time: 78, type: 'enemy_spawn', enemyType: 'patrol', x: 120 },
    { time: 78, type: 'enemy_spawn', enemyType: 'stationary', x: 240 },
    { time: 82, type: 'enemy_spawn', enemyType: 'patrol', x: 200 },
    // Enhance gate for combo buildup
    {
      time: 90,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_SPD_UP },
    },
    // Final wave
    { time: 96, type: 'enemy_spawn', enemyType: 'patrol', x: 160 },
    { time: 98, type: 'enemy_spawn', enemyType: 'stationary', x: 100 },
    { time: 98, type: 'enemy_spawn', enemyType: 'stationary', x: 220 },
  ],
};
