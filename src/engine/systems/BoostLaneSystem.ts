import type { GameSystem } from '@/engine/GameLoop';
import type { GameEntities } from '@/types/entities';
import { useGameSessionStore } from '@/stores/gameSessionStore';
import { BOOST_LANE_SCORE_MULTIPLIER } from '@/constants/balance';

export const boostLaneSystem: GameSystem<GameEntities> = (entities) => {
  const player = entities.player;
  const boostLane = entities.boostLane;

  if (!boostLane?.active) {
    if (entities.isPlayerBoosted) {
      entities.isPlayerBoosted = false;
      useGameSessionStore.getState().setScoreMultiplier(1);
    }
    return;
  }

  const playerCenterX = player.x + player.width / 2;
  const inLane = playerCenterX >= boostLane.x && playerCenterX <= boostLane.x + boostLane.width;

  if (inLane && !entities.isPlayerBoosted) {
    entities.isPlayerBoosted = true;
    useGameSessionStore.getState().setScoreMultiplier(BOOST_LANE_SCORE_MULTIPLIER);
  } else if (!inLane && entities.isPlayerBoosted) {
    entities.isPlayerBoosted = false;
    useGameSessionStore.getState().setScoreMultiplier(1);
  }
};
