import type { Activity, MaterialTemplate } from '../types';

const paper: MaterialTemplate = {
  name: 'A4 纸', category: '文具纸张', unit: '张', unitPrice: 0.1, fixedQuantity: 1, perPersonQuantity: 1,
};
const pens: MaterialTemplate = {
  name: '黑色签字笔', category: '文具纸张', unit: '支', unitPrice: 1.5, fixedQuantity: 2, perPersonQuantity: 0.5, borrowable: true,
};
const stickyNotes: MaterialTemplate = {
  name: '便利贴', category: '文具纸张', unit: '本', unitPrice: 3, fixedQuantity: 2, perPersonQuantity: 0.08,
};
const tape: MaterialTemplate = {
  name: '纸胶带', category: '场地布置', unit: '卷', unitPrice: 4, fixedQuantity: 1, borrowable: true,
};
const timer: MaterialTemplate = {
  name: '计时器', category: '设备道具', unit: '个', unitPrice: 12, fixedQuantity: 1, borrowable: true,
};
const speaker: MaterialTemplate = {
  name: '蓝牙音箱', category: '设备道具', unit: '台', unitPrice: 35, fixedQuantity: 1, optional: true, borrowable: true,
};

export const activities: Activity[] = [
  {
    id: 'ice-common-ground', type: 'icebreaker', name: '共同点 bingo', tagline: '用一张格子卡，自然开启 9 次对话',
    description: '找到符合格子描述的伙伴并签名，连成一条线即可获得小成就。', duration: 25, minPeople: 8, maxPeople: 60,
    venues: ['classroom', 'hall', 'outdoor', 'online'], energy: '适中', materials: [paper, pens],
    gameplay: ['主持人展示“去过海边”等 9 个安全、易回答的格子。', '每人找不同伙伴交流并签名，率先连成一线者分享发现。'],
    hostGuide: ['提前按参与者专业、兴趣设计不涉隐私的格子。', '线上进行时改用聊天区收集关键词，每轮 3 人分享。'],
  },
  {
    id: 'ice-speed-friends', type: 'icebreaker', name: '朋友限时速递', tagline: '三轮轻问题，让社恐也有明确开口理由',
    description: '两人一组，每轮两分钟，用题库轮换搭档并 reuse 纸张记录共同兴趣。', duration: 20, minPeople: 6, maxPeople: 50,
    venues: ['classroom', 'hall', 'online'], energy: '轻松', materials: [paper, pens, timer],
    gameplay: ['两人抽取“最近的小快乐”等问题，各回答一分钟。', '铃声后顺时针换搭档，共三轮，最后介绍一位新伙伴。'],
    hostGuide: ['问题不涉及感情、家庭收入等私人话题。', '奇数人时主持人加入一组，确保无人落单。'],
  },
  {
    id: 'ice-two-truths', type: 'icebreaker', name: '两真一假', tagline: '一点小悬念，迅速记住彼此',
    description: '每人分享三个关于自己的陈述，小组投票找出虚构的一项。', duration: 20, minPeople: 6, maxPeople: 40,
    venues: ['classroom', 'hall', 'outdoor', 'online'], energy: '轻松', materials: [stickyNotes, pens],
    gameplay: ['4–6 人小组内轮流写下两真一假。', '组员投票并说明理由，分享者揭晓答案。'],
    hostGuide: ['示范“我会一种乐器”这类轻量陈述。', '控制每人 90 秒，提醒不强迫解释不愿展开的内容。'],
  },
  {
    id: 'ice-life-map', type: 'icebreaker', name: '我的人生地图', tagline: '把经历画成路线，完成一次有深度的相识',
    description: '用三个节点画出成长路线，两人互相导览，再向小组介绍伙伴。', duration: 45, minPeople: 8, maxPeople: 36,
    venues: ['classroom', 'hall'], energy: '轻松', materials: [paper, pens, stickyNotes, tape],
    gameplay: ['用 8 分钟画出“起点、转折、现在”三个节点。', '两人互讲 8 分钟，再每人 1 分钟介绍搭档。'],
    hostGuide: ['明确可只画学习和兴趣，不要求公开敏感经历。', '保留 5 分钟自愿展示，不逐组强制汇报。'],
  },
  {
    id: 'ice-tower-challenge', type: 'icebreaker', name: '纸塔共创挑战', tagline: '不靠自我介绍，在协作里认识彼此',
    description: '小组用纸和胶带搭出可自立的高塔，过程中自然分工。', duration: 40, minPeople: 12, maxPeople: 80,
    venues: ['classroom', 'hall', 'outdoor'], energy: '高能', materials: [paper, tape, timer],
    gameplay: ['4–6 人一组，先用 3 分钟讨论，再用 15 分钟搭建。', '测量高度并由每组讲述一次关键协作决定。'],
    hostGuide: ['按每组 12 张纸、半卷胶带预估，主持人巡场控时。', '户外选择避风角落，以稳固度替代高度评分。'],
  },
  {
    id: 'board-one-night', type: 'boardgame', name: '一夜狼人挑战', tagline: '快节奏身份推理，十分钟就有一局',
    description: '使用自制身份卡完成简化推理，主持人引导夜间与讨论阶段。', duration: 30, minPeople: 6, maxPeople: 24,
    venues: ['classroom', 'hall'], energy: '适中', materials: [paper, pens, timer],
    gameplay: ['每组 6–8 人，发放平民、预言家、狼人身份卡。', '夜间行动后讨论 4 分钟并投票，两局后轮换身份。'],
    hostGuide: ['首局公开身份演示流程，避免新手因规则掉队。', '强调对事不对人，不评价玩家现实性格。'],
  },
  {
    id: 'board-code-names', type: 'boardgame', name: '词语接头暗号', tagline: '一句话联起队友的脑回路',
    description: '两队通过词语提示寻找本方词卡，先完成连线的一队获胜。', duration: 30, minPeople: 8, maxPeople: 40,
    venues: ['classroom', 'hall', 'outdoor'], energy: '适中', materials: [paper, pens, timer],
    gameplay: ['将 16 张词卡排成方阵，两队各选一名提示员。', '提示员说“一个词＋数字”，队友依次选择相关词卡。'],
    hostGuide: ['提前准备校园、食物、电影等通俗词库。', '每回合限时 60 秒，旁观者不额外提示。'],
  },
  {
    id: 'board-telestrations', type: 'boardgame', name: '你画我猜接龙', tagline: '看一句话如何变成全场笑点',
    description: '文字与绘画交替传递，最后一起回看每条的奇妙演变。', duration: 25, minPeople: 6, maxPeople: 48,
    venues: ['classroom', 'hall', 'online'], energy: '高能', materials: [paper, pens, timer],
    gameplay: ['每人写下一句校园日常，向下一位传递。', '下一位作画，再下一位猜文字，循环后展示整条接龙。'],
    hostGuide: ['强调画技不计分，线上可用聊天区文字＋表情替代。', '每组 6 人以内，控制传递 4 轮。'],
  },
  {
    id: 'board-just-one', type: 'boardgame', name: '唯一线索', tagline: '全组合作，用一个字把答案送回来',
    description: '队友各写一个提示词，重复词被移除后，猜词者根据唯一线索作答。', duration: 20, minPeople: 6, maxPeople: 50,
    venues: ['classroom', 'hall', 'online'], energy: '轻松', materials: [stickyNotes, pens, timer],
    gameplay: ['一人暂离或闭眼，其余人为目标词写一个提示。', '主持人移除重复提示，猜词者根据剩余提示回答。'],
    hostGuide: ['准备 30 个难度适中的名词，每答对一词积一分。', '线上私聊主持人收集提示，再统一贴到聊天区。'],
  },
  {
    id: 'board-campus-deduction', type: 'boardgame', name: '校园失物谜案', tagline: '合作拼线索，找回消失的社团道具',
    description: '每组阅读时间、地点与人物线索，通过排除法完成原创小型推理。', duration: 40, minPeople: 8, maxPeople: 40,
    venues: ['classroom', 'hall', 'online'], energy: '适中', materials: [paper, pens, stickyNotes],
    gameplay: ['主持人分发预设的 8 条线索和人物表。', '小组在 20 分钟内还原时间线，并提交失物位置。'],
    hostGuide: ['使用活动库中的虚构谜案，不影射真实同学。', '卡住时在 10、15 分钟各给一条递进提示。'],
  },
  {
    id: 'movie-blind-clips', type: 'movie', name: '盲盒片段放映', tagline: '不看评分，用三个片段决定今晚聊什么',
    description: '播放三段合法公开的短片预告或自制素材，观众按感受贴标签。', duration: 30, minPeople: 6, maxPeople: 60,
    venues: ['classroom', 'hall', 'online'], energy: '轻松', materials: [stickyNotes, pens, speaker],
    gameplay: ['每段 2–3 分钟，观看后用一词描述气氛。', '按标签分类，选择最有共鸣的一段展开交流。'],
    hostGuide: ['仅使用公映许可、开放授权或自制片段。', '线上共享声音前先做 10 秒音量测试。'],
  },
  {
    id: 'movie-frame-story', type: 'movie', name: '定格画面会说话', tagline: '从一个镜头，读出不同的生活经验',
    description: '观察自制或无品牌画面，记录看见的客观细节与主观感受。', duration: 25, minPeople: 6, maxPeople: 45,
    venues: ['classroom', 'hall', 'online'], energy: '轻松', materials: [paper, pens],
    gameplay: ['展示画面 30 秒，先只写“我看见了什么”。', '第二轮写“我感受到什么”，小组比较两种答案。'],
    hostGuide: ['先事实后解释，避免把讨论变成标准答案竞猜。', '使用自己拍摄的校园静物或开放许可素材。'],
  },
  {
    id: 'movie-alternate-ending', type: 'movie', name: '结局改写室', tagline: '小组接棒，给故事另一种可能',
    description: '观看简短无结局情境，小组补写结尾并用一句话提案。', duration: 35, minPeople: 8, maxPeople: 48,
    venues: ['classroom', 'hall', 'online'], energy: '适中', materials: [paper, pens, stickyNotes, timer],
    gameplay: ['主持人讲述原创的校园两难情境，停在关键选择前。', '小组 12 分钟写结尾，用 60 秒电梯提案分享。'],
    hostGuide: ['用“主角想兼顾比赛和社团”等低门槛情境。', '评价聚焦创意和动机，不评判表演能力。'],
  },
  {
    id: 'movie-sound-design', type: 'movie', name: '声音蒙太奇', tagline: '闭眼听校园，再为画面配一条声音轨',
    description: '辨认日常环境音，小组为同一幅画面设计不同氛围的声音。', duration: 30, minPeople: 8, maxPeople: 40,
    venues: ['classroom', 'hall'], energy: '适中', materials: [paper, pens, speaker, timer],
    gameplay: ['播放三段自行录制的校园环境音，猜地点与情绪。', '各组为“雨后操场”画面列出三种声音并口头演绎。'],
    hostGuide: ['提前测试音箱，预备手机外放作为替代。', '控制音量，不播放突发巨响或令人不适的声音。'],
  },
  {
    id: 'movie-one-minute-review', type: 'movie', name: '一分钟影评人', tagline: '不聊深奥理论，只说哪一个瞬间打动你',
    description: '两人交流观看感受，再用固定句式完成一分钟推荐。', duration: 20, minPeople: 6, maxPeople: 60,
    venues: ['classroom', 'hall', 'outdoor', 'online'], energy: '轻松', materials: [stickyNotes, pens],
    gameplay: ['用“推荐给……因为……”句式写下推荐理由。', '两人互讲后，自愿进行一分钟公开分享。'],
    hostGuide: ['主持人先示范包含具体场景的短评。', '允许推荐短片、纪录片或动画，避免只谈专业术语。'],
  },
  {
    id: 'music-song-story', type: 'music', name: '一首歌的来信', tagline: '分享一首歌，也分享它陪你的那段路',
    description: '参与者提前准备一首喜欢且适合公开播放的歌，讲述相关记忆。', duration: 35, minPeople: 6, maxPeople: 30,
    venues: ['classroom', 'hall', 'online'], energy: '轻松', materials: [stickyNotes, pens, speaker],
    gameplay: ['每人选 30 秒片段，说明“它让我想到……”。', '听完片段后，下一位分享，其他人写一句回应。'],
    hostGuide: ['提前收集合法平台链接，避免现场等待搜索。', '不强迫解释私人经历，可只谈音乐本身。'],
  },
  {
    id: 'music-lyric-puzzle', type: 'music', name: '歌词拼图局', tagline: '把打乱的情绪词，拼成共同的歌单',
    description: '小组根据原创短句与情绪卡，匹配想表达的场景并创作一句新词。', duration: 25, minPeople: 8, maxPeople: 48,
    venues: ['classroom', 'hall', 'outdoor', 'online'], energy: '适中', materials: [paper, pens, stickyNotes],
    gameplay: ['抽取“周一早八”等场景卡和“松弛”等情绪卡。', '小组创作两句原创短词，并朗读设计理由。'],
    hostGuide: ['全部使用原创词句，不复制受版权保护的歌词。', '鼓励口语表达，不要求押韵或演唱。'],
  },
  {
    id: 'music-rhythm-circle', type: 'music', name: '节奏传声筒', tagline: '不用乐器，全场合成一段节拍',
    description: '用拍手、跺脚和桌面轻敲完成节奏接力，各组逐层加入。', duration: 20, minPeople: 8, maxPeople: 60,
    venues: ['classroom', 'hall', 'outdoor'], energy: '高能', materials: [timer],
    gameplay: ['主持人示范四拍节奏，各组依次模仿并接力。', '每组增加一个动作，最后共同完成两轮合奏。'],
    hostGuide: ['先约定音量，教室场景避免连续跺脚。', '关注跟不上的人，退回基础拍而非加速炫技。'],
  },
  {
    id: 'music-playlist-bingo', type: 'music', name: '曲风宾果', tagline: '听见不同年代，也听见彼此的偏好',
    description: '聆听合法开放音频的短片段，在卡片上标记曲风和情绪。', duration: 30, minPeople: 6, maxPeople: 50,
    venues: ['classroom', 'hall', 'online'], energy: '适中', materials: [paper, pens, speaker],
    gameplay: ['主持人播放 8 段 20 秒开放授权或自制音频。', '参与者在 3×3 卡片标记判断，连线后分享理由。'],
    hostGuide: ['曲风判断没有唯一答案，以描述听到的元素为主。', '线上提前发送空白卡片，可用聊天区代替打印。'],
  },
  {
    id: 'music-silent-disco', type: 'music', name: '静音耳机舞会', tagline: '同一空间里，各自选择舒服的音量',
    description: '参与者自带耳机和设备，在指定歌单中自由聆听并进行轻量动作挑战。', duration: 30, minPeople: 8, maxPeople: 40,
    venues: ['hall', 'outdoor', 'online'], energy: '高能', materials: [stickyNotes, tape, timer],
    gameplay: ['主持人给出统一的开场倒计时，每人播放自己的歌单。', '每 5 分钟发布一个动作任务，如与三人击掌。'],
    hostGuide: ['提前确认每人有耳机和电量，不强制下载应用。', '设置安静休息区，不使用闪光灯。'],
  },
  {
    id: 'party-theme-photo', type: 'party', name: '主题大片照相馆', tagline: '简单道具，也能拍出全组的纪念照',
    description: '用自制纸道具和纯色背景完成小组主题合照。', duration: 30, minPeople: 8, maxPeople: 60,
    venues: ['classroom', 'hall', 'outdoor'], energy: '高能', materials: [paper, pens, tape, timer],
    gameplay: ['每组抽取“复古毕业照”等主题并制作三件纸道具。', '设计构图，由主持人或组员定时拍摄。'],
    hostGuide: ['拍摄前征得每位参与者同意，不默认公开发布。', '只用参与者和组织者自己的设备，注意保管。'],
  },
  {
    id: 'party-potluck', type: 'party', name: '一人一味分享会', tagline: '带一点喜欢的味道，交换一张食物名片',
    description: '参与者自愿携带独立包装食品，用标签记录推荐吃法与过敏原。', duration: 35, minPeople: 8, maxPeople: 45,
    venues: ['classroom', 'hall', 'outdoor'], energy: '轻松', materials: [stickyNotes, pens, tape],
    gameplay: ['每份食物配一张名称、来源、过敏原标签。', '参与者自由品尝，并向一位主人询问食物故事。'],
    hostGuide: ['仅接受独立包装食品，避免现场加工和明火。', '显著标注坚果、乳制品等常见过敏原，准备饮用水。'],
  },
  {
    id: 'party-talent-lottery', type: 'party', name: '技能盲盒交换', tagline: '不登台表演，也能交换一个拿手小技巧',
    description: '每人提供一个两分钟内能教会的技能，现场随机配对教学。', duration: 30, minPeople: 6, maxPeople: 50,
    venues: ['classroom', 'hall', 'outdoor', 'online'], energy: '适中', materials: [paper, pens, stickyNotes, timer],
    gameplay: ['写下技能，如折纸、快捷键、拍照构图或一句方言。', '抽取技能卡，找到主人进行两分钟教学，再轮换。'],
    hostGuide: ['技能无需专业，主持人准备五个备用技能。', '线上用聊天区接龙配对，轮流开麦演示。'],
  },
  {
    id: 'party-memory-market', type: 'party', name: '记忆小卖部', tagline: '用一件小物，交换一段 campus 记忆',
    description: '围绕照片、票根或普通物件，讲述一个校园生活片段。', duration: 30, minPeople: 6, maxPeople: 36,
    venues: ['classroom', 'hall', 'online'], energy: '轻松', materials: [paper, pens, stickyNotes],
    gameplay: ['参与者展示一件随身小物，或选择主持人准备的图片卡。', '用“它来自……它提醒我……”进行两分钟分享。'],
    hostGuide: ['物件无需有纪念价值，一支笔也可以成为入口。', '不交换贵重物品，不涉及估价和交易。'],
  },
  {
    id: 'party-mini-awards', type: 'party', name: '民间颁奖礼', tagline: '认真看见每个人那些可爱的小贡献',
    description: '小组互写具体、友善的原创奖项，完成轻量颁奖仪式。', duration: 25, minPeople: 6, maxPeople: 60,
    venues: ['classroom', 'hall', 'outdoor', 'online'], energy: '适中', materials: [paper, pens, tape],
    gameplay: ['写下“最佳救场奖”等奖项和一件具体事例。', '主持人朗读并颁发纸奖章，获奖者一句话回应。'],
    hostGuide: ['提前收集奖项，确保每位愿意参与者都被看见。', '禁止外貌、身材和负面标签相关奖项。'],
  },
];

export const activityTypeMeta = {
  icebreaker: { label: '迎新破冰', short: '破冰', icon: 'spark', color: '#ef8354' },
  boardgame: { label: '桌游夜', short: '桌游', icon: 'dice', color: '#7067cf' },
  movie: { label: '观影交流', short: '观影', icon: 'film', color: '#4b89dc' },
  music: { label: '音乐分享', short: '音乐', icon: 'music', color: '#d66b93' },
  party: { label: '主题聚会', short: '聚会', icon: 'party', color: '#e0a229' },
} as const;

export const venueLabels = {
  classroom: '普通教室',
  hall: '活动室 / 大厅',
  outdoor: '户外空地',
  online: '线上会议',
} as const;
