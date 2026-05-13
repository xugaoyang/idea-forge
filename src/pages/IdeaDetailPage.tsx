import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Edit3, Save, X, Sparkles, Layers, ChevronRight,
  FileText, Tag, Calendar, CheckSquare, AlertTriangle, Trash2,
  Globe, Wand2, Check, RefreshCw
} from 'lucide-react'
import { useIdeaStore } from '../store/ideaStore'
import { useSettingsStore } from '../store/settingsStore'
import { expandIdea } from '../services/aiService'
import { StatusBadge, PriorityBadge, TagBadge } from '../components/ui/Badge'
import type { IdeaStatus, Priority, IdeaExpansion } from '../types'

export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ideas, updateIdea, deleteIdea, updateStatus } = useIdeaStore()
  const idea = ideas.find((i) => i.id === id)

  const { aiSettings, isConfigured } = useSettingsStore()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(idea ? {
    title: idea.title,
    description: idea.description,
    problem: idea.problem,
    tags: idea.tags.join(', '),
    priority: idea.priority,
    notes: idea.notes,
  } : null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expanding, setExpanding] = useState(false)
  const [expandError, setExpandError] = useState<string | null>(null)
  const [expandPreview, setExpandPreview] = useState<IdeaExpansion | null>(null)
  const [expandDismissed, setExpandDismissed] = useState(false)

  if (!idea || !form) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">想法不存在</p>
        <Link to="/" className="text-brand-400 hover:text-brand-300">← 返回列表</Link>
      </div>
    )
  }

  const handleSave = () => {
    updateIdea(idea.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      problem: form.problem.trim(),
      tags: form.tags.split(/[,，\s]+/).filter(Boolean),
      priority: form.priority as Priority,
      notes: form.notes.trim(),
    })
    setEditing(false)
  }

  const handleDelete = () => {
    deleteIdea(idea.id)
    navigate('/')
  }

  const steps = [
    { label: '想法记录', icon: <FileText size={14} />, done: true, link: null },
    { label: '产品形态', icon: <Layers size={14} />, done: !!idea.productShape, link: `/idea/${id}/shape` },
    { label: '产品方案', icon: <Sparkles size={14} />, done: !!idea.productPlan, link: `/idea/${id}/plan` },
    { label: '生成网页', icon: <Globe size={14} />, done: !!idea.generatedPage, link: `/idea/${id}/webpage` },
  ]

  const needsExpansion = !idea.description && !idea.problem && !expandDismissed

  const handleExpand = async () => {
    setExpanding(true)
    setExpandError(null)
    try {
      const result = await expandIdea(idea, isConfigured() ? aiSettings : null)
      setExpandPreview(result)
    } catch (e) {
      setExpandError(e instanceof Error ? e.message : '扩写失败，请重试')
    } finally {
      setExpanding(false)
    }
  }

  const handleAcceptExpansion = () => {
    if (!expandPreview) return
    updateIdea(idea.id, {
      description: expandPreview.description,
      problem: expandPreview.problem,
      tags: idea.tags.length ? idea.tags : expandPreview.tags,
    })
    setForm((f) => f ? {
      ...f,
      description: expandPreview.description,
      problem: expandPreview.problem,
      tags: idea.tags.length ? f.tags : expandPreview.tags.join(', '),
    } : f)
    setExpandPreview(null)
    setExpandDismissed(true)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:text-slate-300 transition-colors">想法库</Link>
            <ChevronRight size={12} />
            <span className="text-slate-400 truncate">{idea.title}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
              >
                <Edit3 size={14} />编辑
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                <X size={15} />
              </button>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors">
                <Save size={14} />保存
              </button>
            </>
          )}
        </div>
      </div>

      {/* 进度步骤 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">产品化进度</h3>
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-1">
              <div
                className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border text-sm ${
                  step.done
                    ? 'bg-brand-900/30 border-brand-700/50 text-brand-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-500'
                } ${step.link && !step.done ? 'cursor-pointer hover:border-brand-700/40 hover:text-slate-300 transition-colors' : ''}`}
                onClick={() => step.link && navigate(step.link)}
              >
                <span className={step.done ? 'text-brand-400' : 'text-slate-600'}>{step.icon}</span>
                <span>{step.label}</span>
                {step.done && <CheckSquare size={13} className="ml-auto text-brand-400" />}
              </div>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-slate-700 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* AI 扩写引导 */}
      {needsExpansion && !expandPreview && (
        <div className="bg-brand-900/20 border border-brand-800/40 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-brand-900/50 border border-brand-700/40 flex items-center justify-center shrink-0">
            <Wand2 size={16} className="text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-300 font-medium">想法有点简短，需要 AI 帮你补全细节吗？</p>
            <p className="text-xs text-slate-500 mt-0.5">AI 将根据标题推断描述和痛点，你来确认</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setExpandDismissed(true)}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors px-2 py-1.5"
            >
              暂不需要
            </button>
            <button
              onClick={handleExpand}
              disabled={expanding}
              className="flex items-center gap-1.5 text-xs bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {expanding ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
              {expanding ? '生成中...' : '帮我补全'}
            </button>
          </div>
        </div>
      )}

      {/* AI 扩写预览确认 */}
      {expandPreview && (
        <div className="bg-slate-900 border border-brand-700/50 rounded-xl overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
            <Wand2 size={14} className="text-brand-400" />
            <span className="text-sm font-medium text-white">AI 补全建议</span>
            <span className="text-xs text-slate-500 ml-1">确认后将填入对应字段</span>
          </div>
          <div className="p-5 space-y-4">
            {expandError && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">{expandError}</p>
            )}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">产品描述</p>
              <p className="text-sm text-slate-300 leading-relaxed">{expandPreview.description}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">核心痛点</p>
              <p className="text-sm text-slate-300 leading-relaxed">{expandPreview.problem}</p>
            </div>
            {!idea.tags.length && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">推荐标签</p>
                <div className="flex flex-wrap gap-1.5">
                  {expandPreview.tags.map(t => (
                    <span key={t} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="px-5 py-3 border-t border-slate-800 flex gap-3">
            <button
              onClick={() => { setExpandPreview(null); setExpandDismissed(true) }}
              className="flex-1 text-sm text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg py-2 transition-colors"
            >
              不采用
            </button>
            <button
              onClick={handleAcceptExpansion}
              className="flex-1 flex items-center justify-center gap-2 text-sm bg-brand-600 hover:bg-brand-500 text-white rounded-lg py-2 font-medium transition-colors"
            >
              <Check size={14} />采用建议
            </button>
          </div>
        </div>
      )}

      {/* 主内容 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-800">
          {editing ? (
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-xl font-bold text-white focus:outline-none focus:border-brand-500 transition-colors"
            />
          ) : (
            <h1 className="text-2xl font-bold text-white">{idea.title}</h1>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <StatusBadge status={idea.status} />
            <PriorityBadge priority={idea.priority} />
            {editing ? (
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
              >
                <option value="low">低优先级</option>
                <option value="medium">中优先级</option>
                <option value="high">高优先级</option>
                <option value="critical">紧急</option>
              </select>
            ) : null}
            <span className="text-xs text-slate-600 flex items-center gap-1 ml-auto">
              <Calendar size={11} />
              {new Date(idea.createdAt).toLocaleDateString('zh-CN')} 创建
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">产品描述</label>
            {editing ? (
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="详细描述这个产品/工具的功能和目标..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
              />
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {idea.description || <span className="text-slate-600 italic">暂无描述</span>}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">核心痛点 / 解决的问题</label>
            {editing ? (
              <textarea
                value={form.problem}
                onChange={(e) => setForm({ ...form, problem: e.target.value })}
                rows={3}
                placeholder="用户面临什么问题？现有方案有什么不足？"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
              />
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {idea.problem || <span className="text-slate-600 italic">暂无痛点描述</span>}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag size={11} />标签
            </label>
            {editing ? (
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="用逗号或空格分隔标签"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {idea.tags.length > 0 ? idea.tags.map((tag) => <TagBadge key={tag} tag={tag} />) : <span className="text-slate-600 text-sm italic">暂无标签</span>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">备注 / 想法演进</label>
            {editing ? (
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                placeholder="记录额外的思考、灵感、资源链接..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
              />
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {idea.notes || <span className="text-slate-600 italic">暂无备注</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 状态更新 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">更新状态</h3>
        <div className="flex flex-wrap gap-2">
          {(['draft', 'analyzing', 'planned', 'developing', 'completed', 'archived'] as IdeaStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(idea.id, s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                idea.status === s
                  ? 'bg-brand-600 border-brand-500 text-white'
                  : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {{ draft: '草稿', analyzing: '分析中', planned: '已规划', developing: '开发中', completed: '已完成', archived: '已归档' }[s]}
            </button>
          ))}
        </div>
      </div>

      {/* 下一步操作 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to={`/idea/${id}/shape`}
          className="group flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-brand-700/60 rounded-xl p-5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-900/30 border border-blue-800/40 flex items-center justify-center shrink-0 group-hover:bg-blue-900/50 transition-colors">
            <Layers size={22} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm mb-1">
              {idea.productShape ? '查看产品形态' : '分析产品形态'}
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              {idea.productShape ? '已生成产品类型、目标用户等分析' : '确定产品类型、目标用户、竞品分析'}
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>

        <Link
          to={`/idea/${id}/plan`}
          className={`group flex items-center gap-4 bg-slate-900 border rounded-xl p-5 transition-all ${
            idea.productShape
              ? 'border-slate-800 hover:border-brand-700/60'
              : 'border-slate-800/50 opacity-60 cursor-not-allowed pointer-events-none'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-900/30 border border-amber-800/40 flex items-center justify-center shrink-0">
            <Sparkles size={22} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm mb-1">
              {idea.productPlan ? '查看产品方案' : '生成产品方案'}
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              {idea.productPlan ? '已生成功能列表、技术栈等方案' : idea.productShape ? '功能规划、技术选型、开发路线' : '请先完成产品形态分析'}
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>

        <Link
          to={`/idea/${id}/webpage`}
          className={`group flex items-center gap-4 bg-slate-900 border rounded-xl p-5 transition-all sm:col-span-2 ${
            idea.productPlan
              ? 'border-slate-800 hover:border-brand-700/60'
              : 'border-slate-800/50 opacity-60 cursor-not-allowed pointer-events-none'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-brand-900/30 border border-brand-800/40 flex items-center justify-center shrink-0 group-hover:bg-brand-900/50 transition-colors">
            <Globe size={22} className="text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm mb-1">
              {idea.generatedPage ? `查看生成网页（v${idea.generatedPage.version}）` : '生成落地页网页'}
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              {idea.generatedPage
                ? '已生成网页，可预览或重新生成'
                : idea.productPlan
                  ? 'AI 根据产品方案生成完整落地页，可预览并下载 HTML'
                  : '请先完成产品方案生成'}
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={20} className="text-red-400" />
              <h3 className="text-lg font-bold text-white">确认删除</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">删除后无法恢复，包括所有产品分析和方案数据。</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-sm transition-colors">取消</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition-colors">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
