import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getFeasibleActivities, validateAiChoice } from '../rules/ai';
import { buildMaterials, calculateTotal } from '../rules/planner';
import type { ActivitySetup } from '../types';

interface AiSuggestion { ids: string[]; reason: string }

export default function AiRecommendation({ setup, onApply }: { setup: ActivitySetup; onApply: (suggestion: AiSuggestion) => void }) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);
  const candidates = getFeasibleActivities(setup);

  useEffect(() => {
    let active = true;
    fetch('/api/ai/status').then(response => response.json()).then(data => {
      if (active) setAvailable(data.available === true);
    }).catch(() => { if (active) setAvailable(false); });
    return () => { active = false; };
  }, []);

  async function ask() {
    setOpen(true); setError(''); setSuggestion(null);
    if (!available || !candidates.length) return;
    setLoading(true);
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setup,
          candidates: candidates.map(item => ({
            id: item.id, name: item.name, description: item.description,
            duration: item.duration, cost: calculateTotal(buildMaterials([item], setup.people)),
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI 请求失败');
      const ids = validateAiChoice(data.ids, setup);
      if (!ids.length) throw new Error('AI 建议未通过预算或时间校验，请重新尝试');
      setSuggestion({ ids, reason: String(data.reason || '').slice(0, 240) });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'AI 请求失败'); }
    finally { setLoading(false); }
  }

  return <section className="ai-assist" aria-label="AI 活动建议">
    <div className="ai-assist-intro"><span className="ai-spark"><Sparkles size={21}/></span><div><strong>还有点拿不定主意？</strong><p>让 DeepSeek 从可执行的环节里，帮你挑出更贴合目标的一组。</p></div></div>
    <button className="ai-trigger" onClick={ask} disabled={loading}>{loading ? 'AI 正在思考…' : '要不问问AI？'} <ArrowRight size={17}/></button>
    <small className="ai-privacy">启用后会将活动条件与候选环节发送给 DeepSeek；方案记录只保存在本机。</small>
    {open && <div className="ai-response" role="status">
      {available === false ? <p>AI 暂未启用。请在项目根目录配置 <code>.env.local</code> 中的 DeepSeek API Key，然后重启服务。手动推荐仍可正常使用。</p>
        : !candidates.length ? <p>目前没有满足预算、场地和时长的环节。请先放宽条件，再问 AI。</p>
        : loading ? <p>正在对照你的条件和活动库寻找合适组合…</p>
        : error ? <p className="ai-error">{error}</p>
        : suggestion ? <><span className="mini-label">AI 建议 · 已通过本地规则校验</span><h4>{suggestion.ids.map(id => candidates.find(item => item.id === id)?.name).join(' ＋ ')}</h4><p>{suggestion.reason}</p><button className="primary" onClick={() => { onApply(suggestion); setOpen(false); }}>采用 AI 建议 <ArrowRight size={16}/></button></> : null}
    </div>}
  </section>;
}
