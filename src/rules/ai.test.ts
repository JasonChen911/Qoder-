import { describe, expect, it } from 'vitest';
import { getFeasibleActivities, validateAiChoice } from './ai';
import type { ActivitySetup } from '../types';

const setup: ActivitySetup = { type: 'icebreaker', people: 20, budget: 100, duration: 60, venue: 'classroom', goal: '让新同学认识' };

describe('AI recommendation guardrails', () => {
  it('offers only activities that can fit individually', () => {
    const candidates = getFeasibleActivities(setup);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every(item => item.type === setup.type && item.duration + 20 <= setup.duration)).toBe(true);
  });

  it('rejects invented ids and combinations that exceed duration', () => {
    expect(validateAiChoice(['imaginary'], setup)).toEqual([]);
    expect(validateAiChoice(['ice-life-map', 'ice-tower-challenge'], setup)).toEqual([]);
  });

  it('accepts a feasible selection and removes duplicate ids', () => {
    expect(validateAiChoice(['ice-common-ground', 'ice-common-ground'], setup)).toEqual(['ice-common-ground']);
  });
});
