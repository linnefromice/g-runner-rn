import type { GameSystem } from '@/engine/GameLoop';
import type { GameEntities } from '@/types/entities';
import { BASE_SCROLL_SPEED, BOOST_LANE_SCROLL_MULTIPLIER } from '@/constants/balance';

export const scrollSystem: GameSystem<GameEntities> = (entities, { time }) => {
  const dt = time.delta / 1000;
  const speed = BASE_SCROLL_SPEED * entities.screen.scale;
  let multiplier = entities.isBossPhase ? 0.5 : 1.0;
  if (entities.isPlayerBoosted) {
    multiplier *= BOOST_LANE_SCROLL_MULTIPLIER;
  }

  // Advance stage time
  entities.stageTime += dt;

  // Update scroll offset (wrapping for seamless background)
  entities.scrollY += speed * multiplier * dt;
};
