import type { StageDefinition } from '@/types/stages';
import { getDifficultyForStage } from '@/game/difficulty';
import { GATE_ATK_UP, GATE_SPD_UP, GATE_FR_UP, GATE_HEAL_20 } from '@/game/gates';

/** Stage 5: Core Breach — Boss stage */
export const STAGE_5: StageDefinition = {
  id: 5,
  name: 'Core Breach',
  isBossStage: true,
  duration: 180,
  difficulty: getDifficultyForStage(5),
  timeline: [
    // Pre-boss wave 1
    { time: 3, type: 'enemy_spawn', enemyType: 'patrol', x: 120 },
    { time: 5, type: 'enemy_spawn', enemyType: 'patrol', x: 200 },
    // Enhance (combo start)
    {
      time: 12,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_SPD_UP },
    },
    // Pre-boss wave 2
    { time: 18, type: 'enemy_spawn', enemyType: 'stationary', x: 80 },
    { time: 18, type: 'enemy_spawn', enemyType: 'stationary', x: 240 },
    { time: 22, type: 'enemy_spawn', enemyType: 'patrol', x: 160 },
    // Enhance 2 (combo 2)
    {
      time: 28,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_FR_UP, right: GATE_ATK_UP },
    },
    // Pre-boss wave 3
    { time: 34, type: 'enemy_spawn', enemyType: 'patrol', x: 100 },
    { time: 36, type: 'enemy_spawn', enemyType: 'patrol', x: 220 },
    // Recovery before boss
    {
      time: 42,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_HEAL_20, right: GATE_ATK_UP },
    },
    // Enhance 3 (combo → awakening chance)
    {
      time: 50,
      type: 'gate_spawn',
      gateConfig: { layout: 'forced', left: GATE_ATK_UP, right: GATE_SPD_UP },
    },
    // Boss spawn
    { time: 60, type: 'boss_spawn', bossId: 'boss_1' },
  ],
};
