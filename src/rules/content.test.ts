import { describe, expect, it } from 'vitest';
import { activities } from '../data/activities';
import { buildMaterials, calculateSchedule } from './planner';
import { buildPlanText, getPlanTitle } from './content';
import type { ActivitySetup } from '../types';

const setup: ActivitySetup = {
  type: 'boardgame',
  people: 16,
  budget: 200,
  duration: 90,
  venue: 'classroom',
  goal: '让每个人都能轻松参与',
};

describe('plan content', () => {
  it('creates a deterministic title from the activity type', () => {
    expect(getPlanTitle(setup, [])).toContain('桌游');
  });

  it('exports the schedule, host guide, materials and promotion as plain text', () => {
    const selected = activities.filter((item) => item.id === 'board-one-night');
    const text = buildPlanText({
      id: 'test-plan',
      createdAt: '2026-10-30T00:00:00.000Z',
      setup,
      selectedIds: selected.map((item) => item.id),
      materials: buildMaterials(selected, setup.people),
      contingencyNote: '若人数不足，改为两人搭档。',
    });

    expect(text).toContain(getPlanTitle(setup, selected));
    expect(text).toContain('活动流程');
    expect(text).toContain('主持说明');
    expect(text).toContain('物资清单与预算明细');
    expect(text).toContain('活动前准备');
    expect(text).toContain('招募文案');
    expect(text).toContain('备用方案');
    expect(text).toContain(calculateSchedule(selected, setup.duration).items[1].title);
  });

  it('keeps an adopted AI recommendation in the exported plan', () => {
    const text = buildPlanText({
      id: 'ai-plan', createdAt: '2026-10-30T00:00:00.000Z', setup,
      selectedIds: ['board-one-night'], materials: [], contingencyNote: '',
      aiNote: '用短回合让新成员都参与讨论。',
    });
    expect(text).toContain('AI 策划建议：用短回合让新成员都参与讨论。');
  });
});
