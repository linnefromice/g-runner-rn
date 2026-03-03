import { getStage, getAvailableStageIds } from '@/game/stages';

describe('Stage data', () => {
  test('all 5 stages are registered', () => {
    const ids = getAvailableStageIds();
    expect(ids).toEqual([1, 2, 3, 4, 5]);
  });

  test.each([1, 2, 3, 4, 5])('stage %i has valid structure', (id) => {
    const stage = getStage(id);
    expect(stage.id).toBe(id);
    expect(stage.name).toBeTruthy();
    expect(stage.duration).toBeGreaterThan(0);
    expect(stage.timeline.length).toBeGreaterThan(0);
    expect(stage.difficulty.enemyHpMultiplier).toBeGreaterThanOrEqual(1.0);
  });

  test('stage 5 is a boss stage', () => {
    const stage = getStage(5);
    expect(stage.isBossStage).toBe(true);
    const bossEvents = stage.timeline.filter((e) => e.type === 'boss_spawn');
    expect(bossEvents.length).toBe(1);
  });

  test('timeline events are ordered by time', () => {
    for (let id = 1; id <= 5; id++) {
      const stage = getStage(id);
      for (let i = 1; i < stage.timeline.length; i++) {
        expect(stage.timeline[i].time).toBeGreaterThanOrEqual(
          stage.timeline[i - 1].time
        );
      }
    }
  });

  test('stages 2-4 are not boss stages', () => {
    for (let id = 2; id <= 4; id++) {
      const stage = getStage(id);
      expect(stage.isBossStage).toBe(false);
    }
  });

  test('throws for unknown stage', () => {
    expect(() => getStage(99)).toThrow('Unknown stage: 99');
  });
});
