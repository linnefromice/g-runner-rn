import type { GameSystem } from '@/engine/GameLoop';
import type { GameEntities } from '@/types/entities';
import { AWAKENED_DURATION } from '@/constants/balance';
import { useGameSessionStore } from '@/stores/gameSessionStore';

const AWAKENED_WARNING_THRESHOLD = 3000; // ms remaining before warning

export const awakenedSystem: GameSystem<GameEntities> = (entities, { time }) => {
  const store = useGameSessionStore.getState();
  if (!store.isAwakened) return;

  // Initialize timer on first frame of awakened activation
  if (entities.awakenedTimer === 0) {
    entities.awakenedTimer = AWAKENED_DURATION;
  }

  entities.awakenedTimer -= time.delta;

  if (entities.awakenedTimer <= 0) {
    entities.awakenedTimer = 0;
    store.deactivateAwakened();
    return;
  }

  // Warning at 3s remaining
  if (entities.awakenedTimer <= AWAKENED_WARNING_THRESHOLD && !store.awakenedWarning) {
    store.setAwakenedWarning(true);
  }
};
