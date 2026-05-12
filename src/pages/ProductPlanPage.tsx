import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Sparkles, ChevronRight, RefreshCw, Download,
  Code2, Clock, DollarSign, AlertTriangle, BarChart3, Zap, Star, CheckCircle2, Bot, Settings
} from 'lucide-react'
import { useIdeaStore } from '../store/ideaStore'
import { useSettingsStore } from '../store/settingsStore'
import { generatePlan } from '../services/aiService'
import type { Feature, Priority } from '../types'

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  critical: { label: '紧急', color: 'text-red-300', dot: 'bg-red-400' },
  high: { label: '高', color: 'text-orange-300', dot: 'bg-orange-400' },
  medium: { label: '中', color: 'text-blue-300', dot: 'bg-blue-400' },
  low: { label: '低', color: 'text-slate-400', dot: 'bg-slate-500' },
}

const EFFORT_CONFIG = {
  small: { label: '小（1-3天）', color: 'text-emerald-400' },
  medium: { label: '中（1-2周）', color: 'text-amber-400' },
  large: { label: '大（2-4周）', color: 'text-red-400' },
}

function FeatureCard({ feature, isCore }: { feature: Feature; isCore?: boolean }) {
  const priority = PRIORITY_CONFIG[feature.priority]
  const effort = EFFORT_CONFIG[feature.effort]
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${isCore ? 'bg-brand-900/10 border-brand-800/40' : 'bg-slate-800/30 border-slate-700/50'}`}>
      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${priority.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-slate-200">{feature.name}</span>
          {feature.isCore && <Star size={11} className="text-amber-400 fill-amber-400" />}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
        <div className="flex gap-3 mt-1.5">
          <span className={`text-xs ${priority.color}`}>优先级：{priority.label}</span>
          <span className={`text-xs ${effort.color}`}>工作量：{effort.label}</span>
        </div>
      </div>
    </div>
  )
}

function TechItem({ items, label }: { items: string[]; label: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="px-2.5 py-1 bg-slate-700/60 text-slate-300 text-xs rounded-lg border border-slate-700/30">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function exportMarkdown(ideaTitle: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${ideaTitle}-产品方案.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function ProductPlanPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ideas, setProductPlan } = useIdeaStore()
  const idea = ideas.find((i) => i.id === id)

  const { aiSettings, isConfigured } = useSettingsStore()
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [plan, setPlan] = useState(idea?.productPlan || null)

  if (!idea) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">想法不存在</p>
        <Link to="/" className="text-brand-400 hover:text-brand-300">← 返回列表</Link>
      </div>
    )
  }

  if (!idea.productShape) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">请先完成产品形态分析</p>
        <Link to={`/idea/${id}/shape`} className="text-brand-400 hover:text-brand-300">→ 前往产品形态分析</Link>
      </div>
    )
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateError('')
    try {
      const result = await generatePlan(idea, idea.productShape!, isConfigured() ? aiSettings : null)
      setPlan(result)
      setProductPlan(idea.id, result)
    } catch (e) {
      setGenerateError((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  const handleExport = () => {
    if (!plan) return
    const md = `# ${idea.title} — 产品方案

## 产品信息
- **标题**：${idea.title}
- **描述**：${idea.description}
- **核心痛点**：${idea.problem}
- **产品类型**：${idea.productShape?.type}
- **目标用户**：${idea.productShape?.targetUsers}

---

## MVP 功能（最小可行产品）

${plan.mvpFeatures.map((f) => `### ${f.name}\n- 描述：${f.description}\n- 优先级：${f.priority}\n- 工作量：${f.effort}\n`).join('\n')}

## V1.0 功能

${plan.v1Features.map((f) => `- **${f.name}**：${f.description}`).join('\n')}

## 未来规划

${plan.futureFeatures.map((f) => `- **${f.name}**：${f.description}`).join('\n')}

---

## 技术栈选型

### 前端
${plan.techStack.frontend.join(', ')}

### 后端
${plan.techStack.backend.join(', ')}

### 数据库
${plan.techStack.database.join(', ')}

### 基础设施
${plan.techStack.infra.join(', ')}

### 第三方服务
${plan.techStack.thirdParty.join(', ')}

---

## 开发预估

- **开发周期**：${plan.timeline}
- **工时估算**：${plan.estimatedDevTime}

## 商业模式

${plan.monetization.map((m) => `- ${m}`).join('\n')}

## 风险提示

${plan.risks.map((r) => `- ⚠️ ${r}`).join('\n')}

## 成功指标

${plan.successMetrics.map((m) => `- ✅ ${m}`).join('\n')}

---
*由 IdeaForge 生成于 ${new Date().toLocaleDateString('zh-CN')}*
`
    exportMarkdown(idea.title, md)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(`/idea/${id}`)} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:text-slate-300 transition-colors">想法库</Link>
            <ChevronRight size={12} />
            <Link to={`/idea/${id}`} className="hover:text-slate-300 transition-colors truncate">{idea.title}</Link>
            <ChevronRight size={12} />
            <span className="text-slate-400">产品方案</span>
          </div>
        </div>
        {plan && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            <Download size={14} />导出 MD
          </button>
        )}
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">产品方案</h1>
        <p className="text-slate-400 text-sm">「{idea.title}」的功能规划、技术选型与开发路线</p>
      </div>

      {!plan ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-900/30 border border-amber-800/50 flex items-center justify-center mx-auto mb-5">
            <Sparkles size={28} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">生成完整产品方案</h2>
          <p className="text-slate-400 text-sm mb-4 max-w-sm mx-auto">
            基于产品形态分析，自动生成 MVP 功能列表、技术栈选型、开发时间估算和商业化路径
          </p>
          <div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full mb-6 ${isConfigured() ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/40' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
            {isConfigured() ? <Bot size={12} /> : <Settings size={12} />}
            {isConfigured() ? `AI 模式 · ${aiSettings.modelId}` : '规则引擎模式（未配置 AI）'}
            {!isConfigured() && (
              <Link to="/settings" className="ml-1 text-brand-400 hover:text-brand-300 underline">去配置</Link>
            )}
          </div>
          {generateError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800/40 rounded-xl text-sm text-red-300 text-left max-w-sm mx-auto">
              {generateError}
            </div>
          )}
          <div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              {generating ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {generating ? (isConfigured() ? 'AI 生成中...' : '生成中...') : '生成产品方案'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* MVP */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <h2 className="font-semibold text-white">MVP 功能</h2>
              <span className="text-xs bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded ml-1">最小可行产品</span>
              <span className="ml-auto text-xs text-slate-500">{plan.mvpFeatures.length} 个功能</span>
            </div>
            <div className="p-4 grid gap-2">
              {plan.mvpFeatures.map((f) => <FeatureCard key={f.id} feature={f} isCore={f.isCore} />)}
            </div>
          </section>

          {/* V1.0 */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-blue-400" />
              <h2 className="font-semibold text-white">V1.0 功能</h2>
              <span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded ml-1">正式版</span>
              <span className="ml-auto text-xs text-slate-500">{plan.v1Features.length} 个功能</span>
            </div>
            <div className="p-4 grid gap-2">
              {plan.v1Features.map((f) => <FeatureCard key={f.id} feature={f} />)}
            </div>
          </section>

          {/* 未来规划 */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <Star size={16} className="text-purple-400" />
              <h2 className="font-semibold text-white">未来规划</h2>
              <span className="ml-auto text-xs text-slate-500">{plan.futureFeatures.length} 个方向</span>
            </div>
            <div className="p-4 grid gap-2">
              {plan.futureFeatures.map((f) => <FeatureCard key={f.id} feature={f} />)}
            </div>
          </section>

          {/* 技术栈 */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <Code2 size={16} className="text-brand-400" />
              <h2 className="font-semibold text-white">技术栈选型</h2>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-5">
              <TechItem label="🎨 前端" items={plan.techStack.frontend} />
              <TechItem label="⚙️ 后端" items={plan.techStack.backend} />
              <TechItem label="🗄️ 数据库" items={plan.techStack.database} />
              <TechItem label="☁️ 基础设施" items={plan.techStack.infra} />
              <div className="sm:col-span-2">
                <TechItem label="🔌 第三方服务" items={plan.techStack.thirdParty} />
              </div>
            </div>
          </section>

          {/* 时间&成本 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-white">开发周期</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{plan.timeline}</p>
              <p className="text-xs text-slate-500 mt-2">{plan.estimatedDevTime}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={15} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">商业模式</h3>
              </div>
              <div className="space-y-1.5">
                {plan.monetization.map((m) => (
                  <div key={m} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 风险 & 指标 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-orange-400" />
                <h3 className="text-sm font-semibold text-white">风险提示</h3>
              </div>
              <div className="space-y-2">
                {plan.risks.map((r) => (
                  <div key={r} className="flex items-start gap-2 text-sm text-slate-400">
                    <AlertTriangle size={12} className="text-orange-400/60 shrink-0 mt-0.5" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={15} className="text-brand-400" />
                <h3 className="text-sm font-semibold text-white">成功指标</h3>
              </div>
              <div className="space-y-2">
                {plan.successMetrics.map((m) => (
                  <div key={m} className="flex items-start gap-2 text-sm text-slate-400">
                    <CheckCircle2 size={12} className="text-brand-400/60 shrink-0 mt-0.5" />
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pb-4">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2.5 text-sm border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 disabled:opacity-50 rounded-xl transition-colors"
            >
              {generating ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {generating ? (isConfigured() ? 'AI 生成中...' : '生成中...') : '重新生成'}
            </button>
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
            >
              <Download size={16} />导出为 Markdown
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
