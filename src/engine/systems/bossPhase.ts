import type { BossEntity } from '@/types/entities';

/** Update boss phase based on current HP ratio. Call after any boss damage. */
export function updateBossPhase(boss: BossEntity): void {
  const hpRatio = boss.hp / boss.maxHp;
  if (hpRatio <= 0.25) boss.phase = 'all';
  else if (hpRatio <= 0.5) boss.phase = 'laser';
}
