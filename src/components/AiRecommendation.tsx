import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Send, Sparkles } from 'lucide-react';
import { getFeasibleActivities, validateAiChoice } from '../rules/ai';
import { buildMaterials, calculateTotal } from '../rules/planner';
import type { ActivitySetup } from '../types';

interface AiSuggestion { ids: string[]; reason: string }
interface ChatMessage { role: 'user' | 'assistant'; content: string }

export default function AiRecommendation({ setup, apiKey, startOpen, onOpenSettings, onApply }: { setup: ActivitySetup; apiKey: string; startOpen: boolean; onOpenSettings: () => void; onApply: (suggestion: AiSuggestion) => void }) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(startOpen);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);
  const [applied, setApplied] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const candidates = getFeasibleActivities(setup);

  useEffect(() => {
    let active = true;
    fetch('/api/ai/status').then(response => response.json()).then(data => {
      if (active) setAvailable(data.available === true);
    }).catch(() => { if (active) setAvailable(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (startOpen) setOpen(true); }, [startOpen]);
  useEffect(() => { if (open) endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' }); }, [open, messages, loading, error]);

  async function requestAdvice(next: ChatMessage[]) {
    setLoading(true); setError(''); setSuggestion(null); setApplied(false);
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'X-DeepSeek-API-Key': apiKey } : {}) },
        body: JSON.stringify({
          setup,
          candidates: candidates.map(item => ({
            id: item.id, name: item.name, description: item.description,
            duration: item.duration, cost: calculateTotal(buildMaterials([item], setup.people)),
          })),
          messages: next.slice(-9),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI 请求失败');
      const ids = data.ids?.length ? validateAiChoice(data.ids, setup) : [];
      const reply = String(data.reply || data.reason || '').trim().slice(0, 500);
      if (!reply) throw new Error('AI 暂时没有返回建议，请重试');
      setMessages([...next, { role: 'assistant', content: reply }]);
      if (data.ids?.length) {
        if (!ids.length) { setError('AI 推荐的组合未通过预算或时间校验，请继续说明需求。'); return; }
        setSuggestion({ ids, reason: String(data.reason || reply).slice(0, 240) });
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'AI 请求失败'); }
    finally { setLoading(false); }
  }

  function send() {
    const content = draft.trim();
    if (!content || loading || (!available && !apiKey) || !candidates.length) return;
    const next: ChatMessage[] = [...messages.slice(-8), { role: 'user', content }];
    setMessages(next); setDraft('');
    void requestAdvice(next);
  }

  function retry() {
    if (loading || !messages.length) return;
    if (messages.at(-1)?.role === 'user') { void requestAdvice(messages); return; }
    const next: ChatMessage[] = [...messages.slice(-8), { role: 'user', content: '请换一个符合当前条件的可执行组合。' }];
    setMessages(next); void requestAdvice(next);
  }

  return <section className="ai-assist" aria-label="AI 活动建议">
    <div className="ai-assist-intro"><span className="ai-spark"><Sparkles size={21}/></span><div><strong>和 AI 聊聊这场活动</strong><p>说出你的顾虑或偏好，聊到满意后再决定是否采用。</p></div></div>
    <button className="ai-trigger" onClick={() => setOpen(value => !value)} aria-expanded={open}>要不问问AI？ <ArrowRight size={17}/></button>
    <small className="ai-privacy">对话与活动条件会发送给 DeepSeek；只有你确认的建议才会写入当前方案。</small>
    {open && <div className="ai-chat">
      <div className="ai-chat-head"><strong>活动策划助手</strong><span>DeepSeek · 对话建议</span></div>
      {!apiKey && available === false ? <p className="ai-chat-notice">尚未设置 API Key。<button className="text-button" onClick={onOpenSettings}>打开设置填写 Key ↗</button></p> : null}
      {!candidates.length ? <p className="ai-chat-notice">当前条件下没有可用环节，请先调整预算、场地或时长。</p> : null}
      <div className="ai-chat-log" role="log" aria-label="AI 对话" aria-live="polite">
        <div className="ai-bubble assistant">你好！告诉我这场活动最想解决什么问题，或直接问“帮我选一个省钱的破冰玩法”。</div>
        {messages.map((item, index) => <div key={index} className={`ai-bubble ${item.role}`}>{item.content}</div>)}
        {loading && <div className="ai-bubble assistant ai-thinking">正在结合人数、场地和预算思考…</div>}
        <div ref={endRef}/>
      </div>
      {suggestion && <div className="ai-chat-choice"><span className="mini-label">可执行建议 · 已通过本地规则校验</span><strong>{suggestion.ids.map(id => candidates.find(item => item.id === id)?.name).join(' ＋ ')}</strong><p>{suggestion.reason}</p><button className="primary" disabled={applied} onClick={() => { onApply(suggestion); setApplied(true); }}>{applied ? '已写入当前方案' : '确认采用，更新当前方案'} <ArrowRight size={16}/></button></div>}
      {error && <p className="ai-error" role="alert">{error} <button className="text-button" onClick={retry} disabled={loading}>重试</button></p>}
      <form className="ai-chat-compose" onSubmit={event => { event.preventDefault(); send(); }}><input aria-label="发消息给 AI" placeholder="例如：我们只有半小时，想让每个人都能参与" maxLength={300} value={draft} onChange={event => setDraft(event.target.value)} disabled={loading || (!available && !apiKey) || !candidates.length}/><button type="submit" disabled={!draft.trim() || loading || (!available && !apiKey) || !candidates.length} aria-label="发送消息"><Send size={18}/></button></form>
      <small className="ai-chat-foot">AI 可帮你挑选环节；预算、时长与人数仍由本地规则核算。</small>
    </div>}
  </section>;
}
