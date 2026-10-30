import type { Contingency } from '../types';

export const contingencies: Contingency[] = [
  {
    id: 'low-attendance', eyebrow: '突发 01', title: '临时有 40% 的人说来不了',
    description: '按实际到场约六成重新计算。选择一种组织方式，物资会随人数同步减少。',
    options: [
      { id: 'pair-up', label: '两人搭档轮换', description: '减少等待，让每个人都能开口。', note: '到场人数不足时，采用两人搭档轮换；奇数人由主持人补位。' },
      { id: 'small-group', label: '合并为小组深聊', description: '优先保留低人数友好的环节。', note: '合并为 4–6 人小组，减少公开汇报，增加组内交流。' },
      { id: 'recruit', label: '开放朋友邀请', description: '保留流程，增加会前邀请动作。', note: '允许成员各带一位朋友；按当前到场人数备基础物资，预留少量空白材料。' },
    ],
  },
  {
    id: 'venue-shrunk', eyebrow: '突发 02', title: '场地临时缩小了一半',
    description: '不能硬塞人。选择分批、换到户外或线上，方案会同步校验场地适配。',
    options: [
      { id: 'split', label: '分成两场进行', description: '本场接待一半人数，其余安排下一场。', note: '按场地容量分两批；本场结束后记录反馈，下一场沿用同一流程。' },
      { id: 'outdoor', label: '转移到户外空地', description: '自动换成适合户外的环节。', note: '转移至已确认允许使用的户外空地；提前关注天气并准备室内退路。' },
      { id: 'online', label: '改为线上轻量局', description: '保留可线上执行的环节。', note: '改用线上会议；会前发送链接，聊天区代替纸张提交。' },
    ],
  },
  {
    id: 'budget-cut', eyebrow: '突发 03', title: '经费审批少了 30%',
    description: '新预算立即生效。可以换低成本玩法、删掉可选物资或借用已有设备。',
    options: [
      { id: 'cheapest', label: '替换低成本环节', description: '保留环节数量，优先免费材料玩法。', note: '经费缩减后使用低成本替代环节，保留完整开场、互动和收尾。' },
      { id: 'trim', label: '删去可选物资', description: '移除音箱等非必要增项。', note: '精简可选物资，以参与者自带设备和主持人口令完成活动。' },
      { id: 'borrow', label: '借用与自带', description: '可借物资按 0 元计，不重复采购。', note: '可借用物资由社团或参与者自带，借用费用按 0 元估算并提前登记。' },
    ],
  },
];
