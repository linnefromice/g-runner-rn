import type { EnemyEntity } from '@/types/entities';
import { TRANSFORM_GAIN_ENEMY_KILL } from '@/constants/balance';
import { useGameSessionStore } from '@/stores/gameSessionStore';
import { deactivateEnemy } from '@/engine/entities/Enemy';
import { getEnemyScore, getEnemyCredits } from '@/game/scoring';

/** Deactivate enemy and grant kill rewards (score, credits, EX gauge, transform gauge). */
export function applyEnemyKillReward(enemy: EnemyEntity): void {
  deactivateEnemy(enemy);
  const store = useGameSessionStore.getState();
  store.addScore(getEnemyScore(enemy.enemyType));
  store.addCredits(getEnemyCredits());
  if (!store.isEXBurstActive) store.addExGauge(5);
  store.addTransformGauge(TRANSFORM_GAIN_ENEMY_KILL);
}
