import type { ActivitySetup } from '../types';
import { buildMaterials, calculateSchedule, calculateTotal, getFeasibleActivities } from './planner';
export { getFeasibleActivities } from './planner';

export function validateAiChoice(ids: unknown, setup: ActivitySetup): string[] {
  if (!Array.isArray(ids) || ids.length > 2 || ids.length === 0 || ids.some(id => typeof id !== 'string')) return [];
  const unique = [...new Set(ids)] as string[];
  const eligible = getFeasibleActivities(setup);
  const selected = unique.map(id => eligible.find(item => item.id === id));
  if (selected.some(item => !item)) return [];
  const concrete = selected.filter((item): item is NonNullable<typeof item> => !!item);
  if (calculateSchedule(concrete, setup.duration).isOverTime) return [];
  if (calculateTotal(buildMaterials(concrete, setup.people)) > setup.budget) return [];
  return unique;
}
