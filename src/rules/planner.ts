import { activities } from '../data/activities';
import { contingencies } from '../data/contingencies';
import type {
  Activity,
  ActivitySetup,
  ContingencyResult,
  MaterialLine,
  MaterialTemplate,
  Schedule,
} from '../types';

const BASE_MATERIALS: MaterialTemplate[] = [
  { name: '姓名贴', category: '文具纸张', unit: '枚', unitPrice: 0.2, perPersonQuantity: 1 },
  { name: '白板笔', category: '文具纸张', unit: '支', unitPrice: 3, fixedQuantity: 2, borrowable: true },
];

export const getActivity = (id: string) => activities.find((activity) => activity.id === id);

export function calculateActivityCost(activity: Activity, people: number) {
  return activity.materials.reduce((sum, material) => {
    const quantity = (material.fixedQuantity ?? 0) + Math.ceil(people * (material.perPersonQuantity ?? 0));
    return sum + quantity * material.unitPrice;
  }, 0);
}

export function buildMaterials(selected: Activity[], people: number): MaterialLine[] {
  const merged = new Map<string, MaterialLine>();

  [...BASE_MATERIALS, ...selected.flatMap((activity) => activity.materials)].forEach((material) => {
    const existing = merged.get(material.name);
    if (existing) {
      existing.fixedQuantity = Math.max(existing.fixedQuantity ?? 0, material.fixedQuantity ?? 0);
      existing.perPersonQuantity = Math.max(existing.perPersonQuantity ?? 0, material.perPersonQuantity ?? 0);
      existing.optional = existing.optional && material.optional;
      existing.borrowable = existing.borrowable || material.borrowable;
    } else {
      merged.set(material.name, { ...material, id: `material-${merged.size + 1}`, quantity: 0 });
    }
  });

  return [...merged.values()].map((material) => ({
    ...material,
    quantity: (material.fixedQuantity ?? 0) + Math.ceil(people * (material.perPersonQuantity ?? 0)),
  }));
}

export const calculateTotal = (materials: MaterialLine[]) =>
  Math.round(materials.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * 100) / 100;

export function calculateSchedule(selected: Activity[], duration: number): Schedule {
  const items: Schedule['items'] = [
    { id: 'opening', title: '签到与开场', description: '签到、说明目标和规则，完成分组。', start: 0, end: 10, kind: 'opening' },
  ];

  selected.forEach((activity) => {
    const start = items.at(-1)?.end ?? 0;
    items.push({
      id: activity.id,
      title: activity.name,
      description: activity.tagline,
      start,
      end: start + activity.duration,
      kind: 'activity',
    });
  });

  const closingStart = items.at(-1)?.end ?? 10;
  items.push({
    id: 'closing', title: '合影与收尾', description: '收集反馈、合影、物资清点与场地恢复。',
    start: closingStart, end: closingStart + 10, kind: 'closing',
  });

  const totalMinutes = closingStart + 10;
  return {
    items,
    totalMinutes,
    overflowMinutes: Math.max(0, totalMinutes - duration),
    isOverTime: totalMinutes > duration,
  };
}

const fitsConditions = (activity: Activity, setup: ActivitySetup) =>
  activity.type === setup.type &&
  activity.minPeople <= setup.people &&
  activity.maxPeople >= setup.people &&
  activity.venues.includes(setup.venue);

export function getRecommendations(setup: ActivitySetup) {
  return activities
    .filter((activity) => fitsConditions(activity, setup))
    .sort((a, b) => {
      const costDifference = calculateActivityCost(a, setup.people) - calculateActivityCost(b, setup.people);
      return costDifference || a.duration - b.duration;
    })
    .slice(0, 3);
}

export function getCheapestAlternatives(setup: ActivitySetup, excludedIds: string[] = []) {
  return activities
    .filter((activity) => fitsConditions(activity, setup) && !excludedIds.includes(activity.id))
    .sort((a, b) => calculateActivityCost(a, setup.people) - calculateActivityCost(b, setup.people));
}

function replaceIncompatible(selected: Activity[], setup: ActivitySetup) {
  const result: Activity[] = [];
  selected.forEach((activity) => {
    if (fitsConditions(activity, setup)) {
      result.push(activity);
      return;
    }
    const replacement = getCheapestAlternatives(setup, result.map((item) => item.id))[0];
    if (replacement) result.push(replacement);
  });
  return result;
}

export function applyContingency(
  originalSetup: ActivitySetup,
  selected: Activity[],
  eventId: string,
  optionId: string,
): ContingencyResult {
  const event = contingencies.find((item) => item.id === eventId);
  const option = event?.options.find((item) => item.id === optionId);
  if (!event || !option) throw new Error('未知的突发状况或应对方案');

  const setup = { ...originalSetup };
  let adjusted = [...selected];

  if (eventId === 'low-attendance') {
    setup.people = Math.max(4, Math.ceil(setup.people * 0.6));
    if (optionId === 'small-group') adjusted = replaceIncompatible(adjusted, setup);
  }

  if (eventId === 'venue-shrunk') {
    if (optionId === 'split') setup.people = Math.max(4, Math.floor(setup.people * 0.5));
    if (optionId === 'outdoor') setup.venue = 'outdoor';
    if (optionId === 'online') setup.venue = 'online';
    adjusted = replaceIncompatible(adjusted, setup);
  }

  if (eventId === 'budget-cut') {
    setup.budget = Math.round(setup.budget * 0.7);
    if (optionId === 'cheapest') {
      adjusted = getCheapestAlternatives(setup).slice(0, selected.length);
    }
  }

  let materials = buildMaterials(adjusted, setup.people);
  if (optionId === 'trim') materials = materials.filter((material) => !material.optional);
  if (optionId === 'borrow') {
    materials = materials.map((material) => material.borrowable ? { ...material, unitPrice: 0 } : material);
  }

  return { setup, activities: adjusted, materials, note: option.note };
}

export function formatClock(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}
