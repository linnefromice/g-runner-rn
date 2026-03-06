import type { GameSystem } from '@/engine/GameLoop';
import type { GameEntities } from '@/types/entities';
import { checkAABBOverlap, getPlayerHitbox } from '@/engine/collision';
import { deactivateEnemy } from '@/engine/entities/Enemy';
import { deactivateBullet } from '@/engine/entities/Bullet';
import { IFRAME_DURATION, TRANSFORM_GAIN_ENEMY_KILL, EXPLOSION_RADIUS } from '@/constants/balance';
import { useGameSessionStore } from '@/stores/gameSessionStore';
import { getEnemyScore, getEnemyCredits } from '@/game/scoring';

export const collisionSystem: GameSystem<GameEntities> = (entities) => {
  const player = entities.player;
  if (!player.active) return;

  const playerHB = getPlayerHitbox(player);
  const store = useGameSessionStore.getState();

  // Player bullets → Enemies
  for (const bullet of entities.playerBullets) {
    if (!bullet.active) continue;
    for (const enemy of entities.enemies) {
      if (!enemy.active) continue;
      // Pierce: skip enemies already hit by this bullet
      if (bullet.specialAbility === 'pierce' && bullet.piercedEnemyIds?.has(enemy.id)) continue;
      if (checkAABBOverlap(bullet, enemy)) {
        enemy.hp -= bullet.damage;

        if (bullet.specialAbility === 'pierce') {
          // Pierce: don't deactivate, record hit
          bullet.piercedEnemyIds?.add(enemy.id);
        } else if (bullet.specialAbility === 'explosion_radius') {
          // Explosion: deactivate bullet, area damage
          deactivateBullet(bullet);
          const impactX = bullet.x + bullet.width / 2;
          const impactY = bullet.y + bullet.height / 2;
          for (const other of entities.enemies) {
            if (!other.active || other.id === enemy.id) continue;
            const otherCX = other.x + other.width / 2;
            const otherCY = other.y + other.height / 2;
            const dist = Math.sqrt((impactX - otherCX) ** 2 + (impactY - otherCY) ** 2);
            if (dist <= EXPLOSION_RADIUS) {
              other.hp -= bullet.damage;
              if (other.hp <= 0) {
                deactivateEnemy(other);
                store.addScore(getEnemyScore(other.enemyType));
                store.addCredits(getEnemyCredits());
                store.addExGauge(5);
                store.addTransformGauge(TRANSFORM_GAIN_ENEMY_KILL);
              }
            }
          }
        } else {
          // Normal: deactivate bullet
          deactivateBullet(bullet);
        }

        // Kill check for the directly-hit enemy
        if (enemy.hp <= 0) {
          deactivateEnemy(enemy);
          store.addScore(getEnemyScore(enemy.enemyType));
          store.addCredits(getEnemyCredits());
          store.addExGauge(5);
          store.addTransformGauge(TRANSFORM_GAIN_ENEMY_KILL);
        }

        // Pierce continues to next enemy; others break
        if (bullet.specialAbility !== 'pierce') break;
      }
    }
  }

  // Player bullets → Boss
  if (entities.boss?.active) {
    for (const bullet of entities.playerBullets) {
      if (!bullet.active) continue;
      if (checkAABBOverlap(bullet, entities.boss)) {
        const prevPercent = Math.floor((entities.boss.hp / entities.boss.maxHp) * 100);
        entities.boss.hp -= bullet.damage;
        const newPercent = Math.floor((entities.boss.hp / entities.boss.maxHp) * 100);

        if (bullet.specialAbility === 'pierce') {
          // Don't deactivate pierce bullets on boss
        } else if (bullet.specialAbility === 'explosion_radius') {
          deactivateBullet(bullet);
          // Also damage nearby enemies
          const impactX = bullet.x + bullet.width / 2;
          const impactY = bullet.y + bullet.height / 2;
          for (const enemy of entities.enemies) {
            if (!enemy.active) continue;
            const ecx = enemy.x + enemy.width / 2;
            const ecy = enemy.y + enemy.height / 2;
            if (Math.sqrt((impactX - ecx) ** 2 + (impactY - ecy) ** 2) <= EXPLOSION_RADIUS) {
              enemy.hp -= bullet.damage;
              if (enemy.hp <= 0) {
                deactivateEnemy(enemy);
                store.addScore(getEnemyScore(enemy.enemyType));
                store.addCredits(getEnemyCredits());
                store.addExGauge(5);
                store.addTransformGauge(TRANSFORM_GAIN_ENEMY_KILL);
              }
            }
          }
        } else {
          deactivateBullet(bullet);
        }

        const percentDamaged = prevPercent - newPercent;
        if (percentDamaged > 0) {
          store.addScore(percentDamaged * 50);
        }
        store.addExGauge(2);

        const hpRatio = entities.boss.hp / entities.boss.maxHp;
        if (hpRatio <= 0.25) entities.boss.phase = 'all';
        else if (hpRatio <= 0.5) entities.boss.phase = 'laser';

        if (entities.boss.hp <= 0) {
          entities.boss.active = false;
          store.setStageClear(true);
        }
      }
    }
  }

  // Skip damage checks if player is invincible
  if (player.isInvincible) return;

  // Awakened with homing_invincible: immune to body contact damage
  const isAwakenedInvincible = store.isAwakened;

  // Enemy bullets → Player (always takes damage, even when awakened)
  for (const bullet of entities.enemyBullets) {
    if (!bullet.active) continue;
    if (checkAABBOverlap(playerHB, bullet)) {
      deactivateBullet(bullet);
      applyDamage(player, bullet.damage, store);
      return; // Only one hit per frame
    }
  }

  // Enemy collision → Player (skip if awakened)
  if (!isAwakenedInvincible) {
    for (const enemy of entities.enemies) {
      if (!enemy.active) continue;
      if (checkAABBOverlap(playerHB, enemy)) {
        applyDamage(player, 15, store); // §6.2 enemy collision
        return;
      }
    }
  }

  // Boss collision → Player (skip if awakened)
  if (!isAwakenedInvincible && entities.boss?.active && checkAABBOverlap(playerHB, entities.boss)) {
    applyDamage(player, 50, store); // §6.2 boss collision
  }
};

function applyDamage(
  player: GameEntities['player'],
  damage: number,
  store: ReturnType<typeof useGameSessionStore.getState>
) {
  store.takeDamage(damage);
  player.isInvincible = true;
  player.invincibleTimer = IFRAME_DURATION;
  store.resetCombo();
}
