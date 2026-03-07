import { ENEMY_STATS, SCORE, CREDITS } from '@/constants/balance';
import type { EnemyType } from '@/types/enemies';

export function getEnemyScore(enemyType: EnemyType): number {
  return ENEMY_STATS[enemyType].scoreValue;
}

export function getEnemyCredits(enemyType: EnemyType): number {
  const creditValue = ENEMY_STATS[enemyType].creditValue;
  if (creditValue <= 0) return 0;
  return Math.max(1, creditValue + Math.floor(Math.random() * 3) - 1);
}

export function getStageClearScore(isBossStage: boolean): number {
  return isBossStage ? SCORE.bossStageClear : SCORE.stageClear;
}

export function getStageClearCredits(isBossStage: boolean): number {
  return isBossStage ? CREDITS.bossStageClear : CREDITS.stageClear;
}
