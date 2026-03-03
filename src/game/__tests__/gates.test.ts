import {
  GATE_ATK_UP,
  GATE_HEAL_20,
  GATE_GLASS_CANNON,
  GATE_REFIT_HEAVY,
  PAIR_ATK_SPD,
  PAIR_TRADEOFF_OPTIONAL,
} from '@/game/gates';

describe('Gate presets', () => {
  test('enhance gate has stat_add effect', () => {
    expect(GATE_ATK_UP.type).toBe('enhance');
    expect(GATE_ATK_UP.effects[0].kind).toBe('stat_add');
  });

  test('recovery gate has heal effect', () => {
    expect(GATE_HEAL_20.type).toBe('recovery');
    expect(GATE_HEAL_20.effects[0].kind).toBe('heal');
  });

  test('tradeoff gate has two effects', () => {
    expect(GATE_GLASS_CANNON.type).toBe('tradeoff');
    expect(GATE_GLASS_CANNON.effects.length).toBe(2);
  });

  test('refit gate has refit effect', () => {
    expect(GATE_REFIT_HEAVY.type).toBe('refit');
    expect(GATE_REFIT_HEAVY.effects[0].kind).toBe('refit');
  });

  test('forced pair has forced layout', () => {
    expect(PAIR_ATK_SPD.layout).toBe('forced');
  });

  test('optional pair has optional layout', () => {
    expect(PAIR_TRADEOFF_OPTIONAL.layout).toBe('optional');
  });
});
