import { activityTypeMeta, venueLabels } from '../data/activities';
import { activities } from '../data/activities';
import type { Activity, ActivityPlan, ActivitySetup } from '../types';
import { calculateSchedule, calculateTotal, formatClock } from './planner';

const titleSeeds = {
  icebreaker: '今天，我们就熟起来',
  boardgame: '今晚开局，桌游见',
  movie: '光影之后，好好聊聊',
  music: '把喜欢的歌分享给你',
  party: '一场刚刚好的主题聚会',
};

export function getPlanTitle(setup: ActivitySetup, selected: Activity[]) {
  const suffix = selected[0] ? ` · ${selected[0].name}` : '';
  return `${titleSeeds[setup.type]}${suffix}`;
}

export function getPlanIntro(setup: ActivitySetup) {
  return setup.goal.trim()
    ? `以“${setup.goal.trim()}”为目标，用清晰的节奏完成一场${activityTypeMeta[setup.type].label}。`
    : `一场为 ${setup.people} 人设计的${activityTypeMeta[setup.type].label}，轻量组织，认真相聚。`;
}

export function getPromotionCopy(plan: ActivityPlan, selected: Activity[]) {
  const { setup } = plan;
  return [
    `【${getPlanTitle(setup, selected)}】`,
    getPlanIntro(setup),
    `我们为 ${setup.people} 位伙伴准备了 ${selected.map((item) => item.name).join('、')}。不需要经验，带上好奇心就好。`,
    `时间：____年__月__日 __:__（全程约 ${setup.duration} 分钟）`,
    `地点：______（${venueLabels[setup.venue]}）`,
    '费用：免费参加 / 如需分摊以现场公示为准',
    '报名：联系______，截止时间______。期待和你见面！',
  ].join('\n');
}

export function getPrepChecklist(plan: ActivityPlan) {
  const { setup } = plan;
  return [
    `确认${venueLabels[setup.venue]}可使用，并核对电源、桌椅与紧急出口。`,
    `按 ${setup.people} 人招募与提醒，活动前一天确认实际到场人数。`,
    '对照物资表采购或借用，给可借设备充满电并提前测试。',
    '安排 1 名主持人和至少 1 名机动协助者，提前走完主持词与计时。',
    '提前发布无强制公开分享、拍摄需同意等参与约定。',
  ];
}

export function buildPlanText(plan: ActivityPlan) {
  const selected = plan.selectedIds
    .map((id) => activities.find((activity) => activity.id === id))
    .filter((activity): activity is Activity => Boolean(activity));
  const schedule = calculateSchedule(selected, plan.setup.duration);
  const materialsByCategory = plan.materials.reduce<Record<string, typeof plan.materials>>((groups, item) => {
    (groups[item.category] ??= []).push(item);
    return groups;
  }, {});
  const lines = [
    getPlanTitle(plan.setup, selected),
    getPlanIntro(plan.setup),
    '',
    `适用人数：${plan.setup.people} 人｜场地：${venueLabels[plan.setup.venue]}｜总时长：${plan.setup.duration} 分钟`,
    `预算估算：¥${calculateTotal(plan.materials).toFixed(2)}（限额 ¥${plan.setup.budget}，均为估算值）`,
    '',
    '一、活动流程',
    ...schedule.items.map((item) => `${formatClock(item.start)}–${formatClock(item.end)} ${item.title}：${item.description}`),
    '',
    '二、互动环节主持说明',
    ...selected.flatMap((activity, index) => [
      `${index + 1}. ${activity.name}（${activity.duration} 分钟）`,
      ...activity.hostGuide.map((guide) => `   - ${guide}`),
    ]),
    '',
    '三、物资清单与预算明细（估算）',
    ...Object.entries(materialsByCategory).flatMap(([category, items]) => [
      `[${category}]`,
      ...(items ?? []).map((item) => `- ${item.name}：${item.quantity}${item.unit} × ¥${item.unitPrice.toFixed(2)} = ¥${(item.quantity * item.unitPrice).toFixed(2)}`),
    ]),
    `合计：¥${calculateTotal(plan.materials).toFixed(2)}`,
    '',
    '四、活动前准备',
    ...getPrepChecklist(plan).map((item) => `□ ${item}`),
    '',
    '五、招募文案',
    getPromotionCopy(plan, selected),
    '',
    '六、备用方案',
    plan.contingencyNote || '如场地或人数变化，优先缩小分组并保留低物资环节。',
  ];
  return lines.join('\n');
}
