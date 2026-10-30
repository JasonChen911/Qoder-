import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Check, ClipboardCopy, Clock3, Download, History, RotateCcw, Settings, Sparkles, Trash2 } from 'lucide-react';
import AiRecommendation from './components/AiRecommendation';
import HistoryPanel from './components/HistoryPanel';
import SettingsPanel from './components/SettingsPanel';
import { activities, activityTypeMeta, venueLabels } from './data/activities';
import { contingencies } from './data/contingencies';
import { applyContingency, buildMaterials, calculateActivityCost, calculateSchedule, calculateTotal, getRecommendations } from './rules/planner';
import { buildPlanText, getPlanIntro, getPlanTitle, getPrepChecklist, getPromotionCopy } from './rules/content';
import { clearLocalState, loadLocalState, saveLocalState } from './services/storage';
import { loadApiKey } from './services/apiKey';
import type { Activity, ActivityPlan, ActivitySetup, ActivityType, MaterialLine, VenueType } from './types';

const initial: ActivitySetup = { type: 'icebreaker', people: 24, budget: 300, duration: 90, venue: 'classroom', goal: '' };
const typeKeys: ActivityType[] = ['icebreaker', 'boardgame', 'movie', 'music', 'party'];
const venues: VenueType[] = ['classroom', 'hall', 'outdoor', 'online'];
const money = (value: number) => `¥${value.toFixed(2)}`;

export default function App() {
  const [saved, setSaved] = useState(loadLocalState);
  const [setup, setSetup] = useState<ActivitySetup>(saved.data.recentPlan?.setup ?? initial);
  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [eventId, setEventId] = useState('low-attendance');
  const [optionId, setOptionId] = useState('');
  const [plan, setPlan] = useState<ActivityPlan | null>(null);
  const [toast, setToast] = useState(saved.error ?? '');
  const workspaceRef = useRef<HTMLElement>(null);
  const heroArtRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [activityFeedback, setActivityFeedback] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(loadApiKey);
  const [aiSuggestedIds, setAiSuggestedIds] = useState<string[]>([]);
  const [aiNote, setAiNote] = useState('');
  const [showAiChat, setShowAiChat] = useState(false);

  useEffect(() => {
    if (step !== 3) return;
    requestAnimationFrame(() => workspaceRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    }));
  }, [step]);

  const recommendations = useMemo(() => {
    const base = getRecommendations(setup);
    const ai = aiSuggestedIds.map(id => activities.find(item => item.id === id)).filter((item): item is Activity => !!item);
    return [...ai, ...base.filter(item => !aiSuggestedIds.includes(item.id))].slice(0, 3);
  }, [setup, aiSuggestedIds]);
  const selected = selectedIds.map(id => activities.find(item => item.id === id)).filter((item): item is Activity => !!item);
  const schedule = calculateSchedule(selected, setup.duration);
  const estimate = calculateTotal(buildMaterials(selected, setup.people));
  const event = contingencies.find(item => item.id === eventId)!;
  const currentOption = event.options.find(item => item.id === optionId);
  const preview = selected.length && currentOption ? applyContingency(setup, selected, eventId, optionId) : null;
  const previewTotal = preview ? calculateTotal(preview.materials) : 0;
  const previewSchedule = preview ? calculateSchedule(preview.activities, preview.setup.duration) : null;
  const resultActivities = plan?.selectedIds.map(id => activities.find(item => item.id === id)).filter((item): item is Activity => !!item) ?? [];
  const resultSchedule = plan ? calculateSchedule(resultActivities, plan.setup.duration) : null;
  const total = plan ? calculateTotal(plan.materials) : 0;
  const isFavorite = !!plan && saved.data.favorites.some(item => item.id === plan.id);

  function announce(message: string) { setToast(message); window.setTimeout(() => setToast(''), 4200); }
  function updateSetup(patch: Partial<ActivitySetup>) { setSetup(value => ({ ...value, ...patch })); setSelectedIds([]); setOptionId(''); setAiSuggestedIds([]); setAiNote(''); }
  function toggleActivity(id: string) {
    setAiNote('');
    const item = activities.find(activity => activity.id === id);
    setActivityFeedback(`${item?.name ?? '环节'}${selectedIds.includes(id) ? '已移出方案' : selectedIds.length < 2 ? '已加入方案' : '最多选择两个环节'}`);
    setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 2 ? [...current, id] : current);
    setOptionId('');
  }
  function createPlan() {
    if (!preview || !preview.activities.length || previewTotal > preview.setup.budget || previewSchedule?.isOverTime) return;
    setGenerating(true);
    const next: ActivityPlan = {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), setup: preview.setup,
      selectedIds: preview.activities.map(item => item.id), materials: preview.materials,
      contingencyNote: preview.note, eventId, optionId, aiNote: aiNote || undefined,
    };
    setPlan(next);
    window.setTimeout(() => { setStep(3); setGenerating(false); }, 180);
    const data = { ...saved.data, recentPlan: next, history: [next, ...saved.data.history.filter(item => item.id !== next.id)] };
    setSaved({ data, error: null });
    announce(saveLocalState(data) ? '方案已保存在这台设备' : '浏览器阻止了本地保存，请及时复制方案');
  }
  function editMaterial(id: string, field: 'quantity' | 'unitPrice', value: number) {
    if (!plan) return;
    const materials = plan.materials.map(item => item.id === id ? { ...item, [field]: Math.max(0, Number.isFinite(value) ? value : 0) } : item);
    const next = { ...plan, materials };
    setPlan(next);
    const data = { ...saved.data, recentPlan: next, favorites: saved.data.favorites.map(item => item.id === next.id ? next : item), history: saved.data.history.map(item => item.id === next.id ? next : item) };
    setSaved({ data, error: null }); saveLocalState(data);
  }
  function toggleFavorite() {
    if (!plan) return;
    const favorites = isFavorite ? saved.data.favorites.filter(item => item.id !== plan.id) : [plan, ...saved.data.favorites];
    const data = { ...saved.data, favorites };
    setSaved({ data, error: null }); saveLocalState(data);
    announce(isFavorite ? '已取消收藏' : '已收藏方案');
  }
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); announce('已复制到剪贴板'); }
    catch { announce('复制失败，请使用打印功能保存或手动选择文本'); }
  }
  function resetData() {
    if (!window.confirm('清除这台设备保存的最近方案与收藏？')) return;
    clearLocalState(); setSaved({ data: { recentPlan: null, favorites: [], history: [] }, error: null }); setShowHistory(false); announce('本地数据已清除');
  }
  function applyAiSuggestion(suggestion: { ids: string[]; reason: string }) {
    setAiSuggestedIds(suggestion.ids); setSelectedIds(suggestion.ids); setAiNote(suggestion.reason);
    setActivityFeedback('AI 建议已写入当前方案，可以继续调整或生成');
  }
  function goToAi() {
    setShowAiChat(true);
    setStep(1);
    requestAnimationFrame(() => workspaceRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    }));
  }
  function openSavedPlan(savedPlan: ActivityPlan) {
    setPlan(savedPlan); setSetup(savedPlan.setup); setSelectedIds(savedPlan.selectedIds);
    setAiNote(savedPlan.aiNote ?? ''); setShowHistory(false); setStep(3);
    requestAnimationFrame(() => workspaceRef.current?.scrollIntoView({ block: 'start' }));
  }
  function deleteSavedPlan(id: string) {
    const data = {
      recentPlan: saved.data.recentPlan?.id === id ? null : saved.data.recentPlan,
      favorites: saved.data.favorites.filter(item => item.id !== id),
      history: saved.data.history.filter(item => item.id !== id),
    };
    setSaved({ data, error: null }); saveLocalState(data);
    if (plan?.id === id) { setPlan(null); setStep(0); }
    announce('方案记录已删除');
  }

  function moveHero(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    heroArtRef.current?.style.setProperty('--px', `${((event.clientX - rect.left) / rect.width - .5) * 12}px`);
    heroArtRef.current?.style.setProperty('--py', `${((event.clientY - rect.top) / rect.height - .5) * 12}px`);
  }
  function resetHero() {
    heroArtRef.current?.style.setProperty('--px', '0px');
    heroArtRef.current?.style.setProperty('--py', '0px');
  }

  return <div className="shell">
    <header className="topbar"><a className="brand" href="#home" onClick={() => setStep(0)}><img className="brand-mark" src="/images/activity-lab-logo-v2.png" alt=""/><span>三分钟<br/><strong>活动实验室</strong></span></a><div className="top-right"><span className="tag">LIFEHACK · 生活娱乐</span><button className="settings-trigger" onClick={() => setShowSettings(true)}><Settings size={17}/> 设置{apiKey ? <span className="settings-dot" aria-label="已设置 API Key"/> : null}</button><button className="record-trigger" onClick={() => setShowHistory(true)}><History size={17}/> 方案记录 <span>{saved.data.history.length}</span></button><button className="subtle" onClick={resetData} title="清除本地数据"><Trash2 size={16}/> 清除数据</button></div></header>
    <main id="home">
      <section className="hero" onPointerMove={moveHero} onPointerLeave={resetHero}><div className="hero-copy"><div className="eyebrow"><span className="pulse"/> YOUR EVENT STARTS HERE</div><h1>让一场好活动<br/><em>从现在开始。</em></h1><p>从灵感到执行，只需三分钟。填入条件、挑选玩法、应对意外，带走一份真正能落地的校园活动方案。</p><div className="hero-actions"><button className="hero-start" onClick={() => workspaceRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>开始策划 <ArrowRight size={18}/></button><button className="hero-ai" onClick={goToAi}><Sparkles size={17}/> 要不问问AI？</button></div><div className="hero-stats"><span><strong>03</strong> 分钟完成</span><span><strong>25</strong> 个真实玩法</span><span><strong>0</strong> 元即可体验</span></div></div><div className="hero-art" ref={heroArtRef} aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-core">LET'S<br/>MAKE<br/>IT HAPPEN<span>✳</span></div><span className="floating f1">✦ 灵感</span><span className="floating f2">⏱ 计划</span><span className="floating f3">↗ 开始</span></div></section>
      <section className="workspace" ref={workspaceRef}><div className="workspace-head"><div><div className="eyebrow dark">THE WORKSPACE / 策划工作台</div><h2>{['先告诉我你的想法','挑一个好玩的环节','给意外留个漂亮的后手','你的活动，可以开场了'][step]}</h2><p>{['给出几个条件，剩下的交给活动实验室。','选 1–2 个环节，预算和时长实时更新。','现实总有小插曲。选一种应对方式，方案会跟着调整。','你的可执行方案已经准备好，带着它去召集伙伴吧。'][step]}</p></div><span className="step-count">0{step + 1} <small>/ 04</small></span></div>
      <div className="progress" aria-label={`当前第 ${step + 1} 步，共 4 步`}>{['活动设定','挑选环节','应对意外','执行方案'].map((label,index) => <div key={label} className={`progress-item ${index <= step ? 'active' : ''}`}><span>{index < step ? <Check size={14}/> : index + 1}</span><b>{label}</b></div>)}</div>
      {step === 0 && <div key="setup" className="panel setup-panel step-enter"><div className="field"><label>01 / 今天要办什么？</label><div className="type-grid">{typeKeys.map(key => <button key={key} className={`choice type ${setup.type === key ? 'chosen' : ''}`} aria-pressed={setup.type === key} onClick={() => updateSetup({ type: key })}><span className="type-icon">{({ icebreaker:'✳', boardgame:'⚄', movie:'▣', music:'♫', party:'✦' })[key]}</span><strong>{activityTypeMeta[key].label}</strong><small>{({ icebreaker:'让陌生人熟起来', boardgame:'轻松开局玩一晚', movie:'散场后继续聊', music:'听见彼此的喜欢', party:'给相聚一个主题' })[key]}</small></button>)}</div></div><div className="field-grid"><div className="field"><label htmlFor="people">02 / 预计到场人数 <strong>{setup.people} 人</strong></label><input id="people" type="range" min="4" max="100" step="1" value={setup.people} onChange={e => updateSetup({ people: +e.target.value })}/><div className="range-ends"><span>4 人</span><span>100 人</span></div></div><div className="field"><label htmlFor="budget">03 / 总预算 <strong>¥{setup.budget}</strong></label><input id="budget" type="range" min="0" max="2000" step="10" value={setup.budget} onChange={e => updateSetup({ budget: +e.target.value })}/><div className="range-ends"><span>零预算</span><span>¥2000</span></div></div><div className="field"><label htmlFor="duration">04 / 可用时长 <strong>{setup.duration} 分钟</strong></label><input id="duration" type="range" min="30" max="180" step="10" value={setup.duration} onChange={e => updateSetup({ duration: +e.target.value })}/><div className="range-ends"><span>30 分钟</span><span>180 分钟</span></div></div><div className="field"><label>05 / 活动在哪里？</label><div className="venue-grid">{venues.map(key => <button key={key} className={`choice venue ${setup.venue === key ? 'chosen' : ''}`} aria-pressed={setup.venue === key} onClick={() => updateSetup({ venue: key })}>{venueLabels[key]}</button>)}</div></div></div><div className="field"><label htmlFor="goal">06 / 这次活动的小目标 <span className="optional">选填</span></label><input className="text-input" id="goal" maxLength={80} placeholder="例如：让新成员更快熟悉彼此" value={setup.goal} onChange={e => updateSetup({ goal: e.target.value })}/></div><div className="panel-footer"><span>✦ 你的条件会在下一步变成可选的活动玩法</span><button className="primary" onClick={() => setStep(1)}>看看有什么好玩的 <ArrowRight size={18}/></button></div></div>}
      {step === 1 && <div key="activities" className="panel step-enter"><div className="section-title"><div><span className="mini-label">CURATED FOR YOU</span><h3>为你挑出的活动环节</h3></div><span className="pill">{setup.people} 人 · {setup.duration} 分钟 · ¥{setup.budget}</span></div><AiRecommendation key={JSON.stringify(setup)} setup={setup} apiKey={apiKey} startOpen={showAiChat} onOpenSettings={() => setShowSettings(true)} onApply={applyAiSuggestion}/>{recommendations.length ? <><div className="activity-grid">{recommendations.map((item,index) => <button key={item.id} className={`activity-card ${selectedIds.includes(item.id) ? 'picked' : ''}`} style={{ animationDelay: `${index * 80}ms` }} onClick={() => toggleActivity(item.id)} aria-pressed={selectedIds.includes(item.id)}><div className="card-top"><span className="card-number">0{index + 1} / ACTIVITY</span><span className="select-circle">{selectedIds.includes(item.id) && <Check size={17}/>}</span></div><div className="activity-symbol">{['✳','✦','◈'][index]}</div><h4>{item.name}</h4><p>{item.tagline}</p><div className="card-metrics"><span><Clock3 size={15}/>{item.duration} 分钟</span><span>约 {money(calculateActivityCost(item, setup.people))}</span></div><div className="card-detail"><b>怎么玩</b>{item.gameplay.map(line => <small key={line}>{line}</small>)}<b>所需物资</b><small>{item.materials.map(m => m.name).join('、') || '无需额外物资'}</small></div></button>)}</div><div key={`${selectedIds.join("-")}-${setup.budget}-${setup.duration}`} className={`budget-strip number-update ${schedule.isOverTime || estimate > setup.budget ? 'warning' : ''}`}><div><b>实时可行性</b><span>预计 {schedule.totalMinutes} / {setup.duration} 分钟 · 物资约 {money(estimate)} / ¥{setup.budget}</span></div><strong>{schedule.isOverTime ? `超时 ${schedule.overflowMinutes} 分钟，请减少环节或延长时长` : estimate > setup.budget ? '超出预算，请选择更省钱的环节或提高预算' : selected.length ? '✓ 可以执行' : '请选择 1–2 个环节'}</strong></div><p className="activity-feedback" role="status">{activityFeedback}</p></> : <div className="empty-state"><img className="empty-logo" src="/images/activity-lab-logo-v2.png" alt=""/><h3>这个组合暂时没有合适的环节</h3><p>试试增加预算或时长、调整人数与场地，或换一个活动主题。</p><button className="secondary" onClick={() => { updateSetup({ people: 20, venue: 'hall', budget: 300, duration: 90 }); setStep(0); }}>一键调整为 20 人 · 90 分钟 · ¥300</button></div>}<div className="panel-footer"><button className="back" onClick={() => setStep(0)}><ArrowLeft size={17}/> 修改条件</button><button className="primary" disabled={!selected.length || schedule.isOverTime || estimate > setup.budget} onClick={() => setStep(2)}>进入突发挑战 <ArrowRight size={18}/></button></div></div>}
      {step === 2 && <div key="contingency" className="panel step-enter"><div className="section-title"><div><span className="mini-label">THE REALITY CHECK</span><h3>活动当天，发生了点意外……</h3></div><span className="pill">选择一个场景</span></div><div className="event-tabs">{contingencies.map(item => <button key={item.id} className={eventId === item.id ? 'active' : ''} onClick={() => { setEventId(item.id); setOptionId(''); }}>{item.eyebrow} · {item.title}</button>)}</div><div key={eventId} className="event-box event-enter"><span className="mini-label">{event.eyebrow} / SURPRISE</span><h3>{event.title}</h3><p>{event.description}</p></div><div className="option-grid">{event.options.map((item, index) => <button key={item.id} style={{ animationDelay: `${index * 75}ms` }} className={`option ${optionId === item.id ? 'chosen' : ''}`} onClick={() => setOptionId(item.id)}><span className="select-circle">{optionId === item.id && <Check size={16}/>}</span><strong>{item.label}</strong><small>{item.description}</small></button>)}</div>{preview && <div key={`${eventId}-${optionId}`} className={`budget-strip number-update ${previewTotal > preview.setup.budget || previewSchedule?.isOverTime || !preview.activities.length ? 'warning' : ''}`}><div><b>调整后的方案</b><span>人数 {setup.people} → {preview.setup.people} 人 · 场地 {venueLabels[setup.venue]} → {venueLabels[preview.setup.venue]} · 预算 ¥{setup.budget} → ¥{preview.setup.budget} · 花费约 {money(previewTotal)} · 用时 {previewSchedule?.totalMinutes} / {preview.setup.duration} 分钟</span></div><strong>{!preview.activities.length ? '没有适配环节，请更换应对方式' : previewTotal > preview.setup.budget ? '仍超预算，请更换应对方式或返回调整' : previewSchedule?.isOverTime ? '仍超时，请返回减少环节' : '✓ 已重新计算'}</strong></div>}<div className="panel-footer"><button className="back" onClick={() => setStep(1)}><ArrowLeft size={17}/> 返回选环节</button><button className="primary" disabled={!preview || !preview.activities.length || previewTotal > preview.setup.budget || !!previewSchedule?.isOverTime} onClick={createPlan}>{generating ? '正在整理方案…' : '生成活动方案'} <Sparkles size={18}/></button></div></div>}
      {step === 3 && plan && resultSchedule && <div key={plan.id} className="result step-enter"><div className="result-hero"><div><span className="mini-label">YOUR EVENT BLUEPRINT · 活动方案已生成</span><h3>{getPlanTitle(plan.setup, resultActivities)}</h3><p>{getPlanIntro(plan.setup)}</p><div className="result-tags"><span>{plan.setup.people} 人参与</span><span>{venueLabels[plan.setup.venue]}</span><span>{plan.setup.duration} 分钟</span><span>预算约 {money(total)}</span></div></div><span className="result-decoration">✳</span></div>{plan.aiNote && <div className="ai-plan-note"><Sparkles size={17}/><div><strong>AI 策划建议</strong><p>{plan.aiNote}</p></div></div>}<div className="result-actions"><button onClick={() => copy(buildPlanText(plan))}><ClipboardCopy size={17}/> 复制全文</button><button onClick={() => window.print()}><Download size={17}/> 打印 / 存为 PDF</button><button onClick={toggleFavorite}><Bookmark size={17} fill={isFavorite ? 'currentColor' : 'none'}/>{isFavorite ? '已收藏' : '收藏方案'}</button><button onClick={() => { setSetup(plan.setup); setSelectedIds(plan.selectedIds); setStep(0); }}><RotateCcw size={17}/> 修改条件</button></div><div className="result-grid"><section className="result-section wide"><span className="mini-label">01 / RUN OF SHOW</span><h4>活动流程</h4><div className="timeline">{resultSchedule.items.map(item => <div key={item.id}><span>{item.start}–{item.end}′</span><div><strong>{item.title}</strong><p>{item.description}</p></div></div>)}</div></section><section className="result-section"><span className="mini-label">02 / HOST GUIDE</span><h4>主持人手卡</h4>{resultActivities.map(activity => <div className="guide" key={activity.id}><strong>{activity.name}</strong>{activity.hostGuide.map(line => <p key={line}>• {line}</p>)}</div>)}</section><section className="result-section"><span className="mini-label">03 / PLAN B</span><h4>备用方案</h4><p>{plan.contingencyNote}</p><p className="muted">场地或到场人数再次变化时，请重新核对人数、物资和环节适配。</p></section><section className="result-section wide"><span className="mini-label">04 / MATERIALS & COST</span><h4>物资与预算 <small>单价、数量均可修改 · 费用为估算</small></h4><div className="materials-table"><div className="table-head"><span>物资 / 分类</span><span>数量</span><span>单价 ¥</span><span>小计</span></div>{plan.materials.map((item: MaterialLine) => <div className="material-row" key={item.id}><span><strong>{item.name}</strong><small>{item.category} · {item.unit}</small></span><input aria-label={`${item.name}数量`} type="number" min="0" step="1" value={item.quantity} onChange={e => editMaterial(item.id, 'quantity', +e.target.value)}/><input aria-label={`${item.name}单价`} type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => editMaterial(item.id, 'unitPrice', +e.target.value)}/><b>{money(item.quantity * item.unitPrice)}</b></div>)}</div><div className={`total-line ${total > plan.setup.budget ? 'over' : ''}`}><span>总计 {money(total)} <small>/ 预算 ¥{plan.setup.budget}</small></span><strong>{total > plan.setup.budget ? `超出 ${money(total - plan.setup.budget)}` : `剩余 ${money(plan.setup.budget - total)}`}</strong></div></section><section className="result-section"><span className="mini-label">05 / BEFORE THE EVENT</span><h4>活动前准备</h4><ul className="checklist">{getPrepChecklist(plan).map(item => <li key={item}><span>□</span>{item}</li>)}</ul></section><section className="result-section"><span className="mini-label">06 / TELL THE WORLD</span><h4>招募文案</h4><pre className="promo">{getPromotionCopy(plan, resultActivities)}</pre><button className="text-button" onClick={() => copy(getPromotionCopy(plan, resultActivities))}>复制招募文案 ↗</button></section></div></div>}
      </section><section className="bottom-note"><img className="bottom-logo" src="/images/activity-lab-logo-v2.png" alt=""/><div><h2>好的活动，不用等万事俱备。</h2><p>先从一个小小的想法开始，剩下的，我们一起安排。</p></div></section>
    </main><footer><span className="footer-brand"><img src="/images/activity-lab-logo-v2.png" alt=""/>© 三分钟活动实验室 · 为校园里的每一次相聚而设计</span><span>本工具离线可用 · 所有金额均为估算</span></footer>{showHistory && <HistoryPanel history={saved.data.history} favorites={saved.data.favorites} onOpen={openSavedPlan} onDelete={deleteSavedPlan} onClose={() => setShowHistory(false)}/>} {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} onKeyChange={setApiKey}/>} {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}
