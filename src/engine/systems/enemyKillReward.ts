import type { EnemyEntity, GameEntities } from '@/types/entities';
import { TRANSFORM_GAIN_ENEMY_KILL, FORM_XP_ENEMY_KILL, FORM_XP_STRONG_ENEMY_KILL } from '@/constants/balance';
import { useGameSessionStore } from '@/stores/gameSessionStore';
import { deactivateEnemy } from '@/engine/entities/Enemy';
import { getEnemyScore, getEnemyCredits } from '@/game/scoring';
import { onEnemyKill } from '@/engine/effects';

/** Deactivate enemy and grant kill rewards (score, credits, EX gauge, transform gauge). */
export function applyEnemyKillReward(enemy: EnemyEntity, entities: GameEntities): void {
  const cx = enemy.x + enemy.width / 2;
  const cy = enemy.y + enemy.height / 2;
  deactivateEnemy(enemy);
  const store = useGameSessionStore.getState();
  const score = getEnemyScore(enemy.enemyType);
  store.addScore(score);
  store.addCredits(getEnemyCredits(enemy.enemyType));
  if (!store.isEXBurstActive) store.addExGauge(5);
  store.addTransformGauge(TRANSFORM_GAIN_ENEMY_KILL);
  store.incrementEnemiesKilled();

  const xp = (enemy.enemyType === 'phalanx' || enemy.enemyType === 'juggernaut')
    ? FORM_XP_STRONG_ENEMY_KILL
    : FORM_XP_ENEMY_KILL;
  store.addFormXP(store.currentForm, xp);

  onEnemyKill(entities, cx, cy, score);
}
