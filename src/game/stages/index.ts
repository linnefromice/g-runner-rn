import type { StageDefinition } from '@/types/stages';
import { STAGE_1 } from './stage1';
import { STAGE_2 } from './stage2';
import { STAGE_3 } from './stage3';
import { STAGE_4 } from './stage4';
import { STAGE_5 } from './stage5';

const STAGES: Record<number, StageDefinition> = {
  1: STAGE_1,
  2: STAGE_2,
  3: STAGE_3,
  4: STAGE_4,
  5: STAGE_5,
};

export function getStage(id: number): StageDefinition {
  const stage = STAGES[id];
  if (!stage) throw new Error(`Unknown stage: ${id}`);
  return stage;
}

export function getAvailableStageIds(): number[] {
  return Object.keys(STAGES).map(Number).sort((a, b) => a - b);
}
