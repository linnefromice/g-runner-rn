import type { StageDefinition } from '@/types/stages';
import { getDifficultyForStage } from '@/game/difficulty';
import {
  GATE_ATK_UP,
  GATE_SPD_UP,
  GATE_HEAL_20,
  GATE_FR_UP,
  GATE_HEAL_30,
} from '@/game/gates';

/** Stage 2: Asteroid Belt — Recovery gate introduction */
export const STAGE_2: StageDefinition = {
  id: 2,
  name: 'Asteroid Belt',
  isBossStage: false,
  duration: 100,
  difficulty: getDifficultyForStage(2),
  timeline: [
    // Wave 1: stationary intro
    { time: 4, type: 'enemy_spawn', enemyType: 'stationary', x: 120 },
    { time: 4, type: 'enemy_spawn', enemyType: 'stationary', x: 200 },
    // Enhance gate
    {
      time: 12,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_SPD_UP },
    },
    // Wave 2: first patrol
    { time: 18, type: 'enemy_spawn', enemyType: 'patrol', x: 160 },
    { time: 22, type: 'enemy_spawn', enemyType: 'stationary', x: 80 },
    { time: 22, type: 'enemy_spawn', enemyType: 'stationary', x: 240 },
    // Recovery gate (new!)
    {
      time: 30,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_HEAL_20, right: GATE_ATK_UP },
    },
    // Wave 3: patrol pair
    { time: 38, type: 'enemy_spawn', enemyType: 'patrol', x: 100 },
    { time: 42, type: 'enemy_spawn', enemyType: 'patrol', x: 220 },
    // Enhance gate 2
    {
      time: 50,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_FR_UP, right: GATE_ATK_UP },
    },
    // Wave 4: mixed
    { time: 58, type: 'enemy_spawn', enemyType: 'stationary', x: 160 },
    { time: 60, type: 'enemy_spawn', enemyType: 'patrol', x: 80 },
    { time: 64, type: 'enemy_spawn', enemyType: 'stationary', x: 260 },
    // Recovery gate 2
    {
      time: 72,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_HEAL_30, right: GATE_SPD_UP },
    },
    // Final wave
    { time: 78, type: 'enemy_spawn', enemyType: 'patrol', x: 160 },
    { time: 82, type: 'enemy_spawn', enemyType: 'stationary', x: 100 },
    { time: 82, type: 'enemy_spawn', enemyType: 'stationary', x: 220 },
    // Enhance gate 3
    {
      time: 90,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_FR_UP },
    },
  ],
};
