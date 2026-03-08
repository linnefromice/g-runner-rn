import { useGameSessionStore } from '@/stores/gameSessionStore';

describe('Awakened system store logic', () => {
  beforeEach(() => {
    useGameSessionStore.getState().resetSession(1);
  });

  test('activateAwakened sets isAwakened and form', () => {
    useGameSessionStore.getState().activateAwakened();
    const state = useGameSessionStore.getState();
    expect(state.isAwakened).toBe(true);
    expect(state.currentForm).toBe('SD_Awakened');
    expect(state.comboCount).toBe(0);
  });

  test('deactivateAwakened restores previous form', () => {
    useGameSessionStore.getState().setForm('SD_HeavyArtillery');
    useGameSessionStore.getState().activateAwakened();
    useGameSessionStore.getState().deactivateAwakened();
    const state = useGameSessionStore.getState();
    expect(state.isAwakened).toBe(false);
    expect(state.awakenedWarning).toBe(false);
    expect(state.currentForm).toBe('SD_HeavyArtillery');
  });

  test('awakenedWarning is set and cleared', () => {
    useGameSessionStore.getState().setAwakenedWarning(true);
    expect(useGameSessionStore.getState().awakenedWarning).toBe(true);
    useGameSessionStore.getState().setAwakenedWarning(false);
    expect(useGameSessionStore.getState().awakenedWarning).toBe(false);
  });

  test('deactivateAwakened clears awakenedWarning', () => {
    useGameSessionStore.getState().activateAwakened();
    useGameSessionStore.getState().setAwakenedWarning(true);
    useGameSessionStore.getState().deactivateAwakened();
    expect(useGameSessionStore.getState().awakenedWarning).toBe(false);
  });

  test('incrementCombo triggers awakening at threshold', () => {
    const store = useGameSessionStore.getState();
    store.incrementCombo(); // 1
    store.incrementCombo(); // 2
    expect(useGameSessionStore.getState().isAwakened).toBe(false);
    store.incrementCombo(); // 3 → awakened
    expect(useGameSessionStore.getState().isAwakened).toBe(true);
    expect(useGameSessionStore.getState().currentForm).toBe('SD_Awakened');
  });

  test('resetCombo resets count to 0', () => {
    useGameSessionStore.getState().incrementCombo();
    useGameSessionStore.getState().incrementCombo();
    useGameSessionStore.getState().resetCombo();
    expect(useGameSessionStore.getState().comboCount).toBe(0);
  });

  test('resetSession clears awakened state', () => {
    useGameSessionStore.getState().activateAwakened();
    useGameSessionStore.getState().setAwakenedWarning(true);
    useGameSessionStore.getState().resetSession(1);
    const state = useGameSessionStore.getState();
    expect(state.isAwakened).toBe(false);
    expect(state.awakenedWarning).toBe(false);
  });
});
