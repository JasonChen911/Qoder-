import { describe, expect, it } from 'vitest';
import { activities } from '../data/activities';
import {
  applyContingency,
  buildMaterials,
  calculateSchedule,
  calculateTotal,
  getRecommendations,
} from './planner';
import type { ActivitySetup } from '../types';

const setup: ActivitySetup = {
  type: 'icebreaker',
  people: 20,
  budget: 300,
  duration: 90,
  venue: 'classroom',
  goal: '让新成员更快熟悉彼此',
};

const byId = (id: string) => {
  const activity = activities.find((item) => item.id === id);
  if (!activity) throw new Error(`Missing fixture ${id}`);
  return activity;
};

describe('planner rules', () => {
  it('aggregates shared materials and rounds per-person quantities up', () => {
    const first = byId('ice-common-ground');
    const second = byId('ice-speed-friends');
    const materials = buildMaterials([first, second], 21);

    expect(materials.find((item) => item.name === 'A4 纸')?.quantity).toBe(22);
    expect(calculateTotal(materials)).toBe(
      materials.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    );
  });

  it('recalculates the estimate after unit price and quantity edits', () => {
    const materials = buildMaterials([byId('ice-common-ground')], 20);
    const edited = materials.map((item, index) =>
      index === 0 ? { ...item, quantity: 3, unitPrice: 4.5 } : item,
    );

    expect(calculateTotal(edited)).toBe(
      edited.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    );
    expect(calculateTotal(edited)).not.toBe(calculateTotal(materials));
  });

  it('creates a contiguous schedule including opening and closing', () => {
    const schedule = calculateSchedule([byId('ice-common-ground')], 90);

    expect(schedule.items[0].start).toBe(0);
    expect(schedule.items.at(-1)?.end).toBe(schedule.totalMinutes);
    expect(schedule.totalMinutes).toBeLessThanOrEqual(90);
    expect(schedule.isOverTime).toBe(false);
  });

  it('flags an activity combination that exceeds the available duration', () => {
    const schedule = calculateSchedule(
      [byId('ice-life-map'), byId('ice-tower-challenge')],
      45,
    );

    expect(schedule.isOverTime).toBe(true);
    expect(schedule.overflowMinutes).toBeGreaterThan(0);
  });

  it('recommends only activities compatible with headcount and venue', () => {
    const recommendations = getRecommendations({ ...setup, people: 12, venue: 'online' });

    expect(recommendations).toHaveLength(3);
    recommendations.forEach((activity) => {
      expect(activity.minPeople).toBeLessThanOrEqual(12);
      expect(activity.maxPeople).toBeGreaterThanOrEqual(12);
      expect(activity.venues).toContain('online');
    });
  });

  it('returns no recommendations for an impossible headcount', () => {
    expect(getRecommendations({ ...setup, people: 101 })).toHaveLength(0);
  });

  it('adjusts headcount and derived materials after a low-attendance response', () => {
    const selected = [byId('ice-common-ground')];
    const result = applyContingency(setup, selected, 'low-attendance', 'pair-up');

    expect(result.setup.people).toBeLessThan(setup.people);
    expect(result.materials).toEqual(buildMaterials(result.activities, result.setup.people));
    expect(result.note).toContain('搭档');
  });

  it('replaces selected activities with cheaper compatible options after a budget cut', () => {
    const selected = [byId('ice-life-map'), byId('ice-tower-challenge')];
    const result = applyContingency(setup, selected, 'budget-cut', 'cheapest');

    expect(result.setup.budget).toBe(Math.round(setup.budget * 0.7));
    expect(calculateTotal(result.materials)).toBeLessThanOrEqual(
      calculateTotal(buildMaterials(selected, setup.people)),
    );
    expect(result.activities).toHaveLength(2);
  });

  it('moves an activity plan outdoors and removes incompatible activities', () => {
    const selected = [byId('ice-common-ground')];
    const result = applyContingency(setup, selected, 'venue-shrunk', 'outdoor');

    expect(result.setup.venue).toBe('outdoor');
    result.activities.forEach((activity) => expect(activity.venues).toContain('outdoor'));
  });
});
