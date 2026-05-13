import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Lightbulb, TrendingUp, CheckCircle, Clock, Sparkles, ArrowRight, Trash2, Filter, ChevronDown, Globe } from 'lucide-react'
import { useIdeaStore } from '../store/ideaStore'
import { StatusBadge, PriorityBadge, TagBadge } from '../components/ui/Badge'
import type { IdeaStatus, Priority } from '../types'

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  'web-app': '🌐 Web App',
  'mobile-app': '📱 移动App',
  'saas': '☁️ SaaS',
  'api-service': '🔌 API服务',
  'tool': '🔧 工具',
  'platform': '🏗️ 平台',
  'chrome-extension': '🧩 浏览器插件',
  'mini-program': '💬 小程序',
  'desktop-app': '🖥️ 桌面App',
  'other': '💡 其他',
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 rounded-full bg-brand-900/30 border border-brand-800/50 flex items-center justify-center mx-auto mb-6">
        <Lightbulb size={36} className="text-brand-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">开始记录你的第一个想法</h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        把脑海中闪过的想法快速记录下来，IdeaForge 帮你分析产品形态、生成开发方案。
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
      >
        <Plus size={18} />
        记录第一个想法
      </button>
    </div>
  )
}

function StatsBar({ total, planned, completed }: { total: number; planned: number; completed: number }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { icon: <Lightbulb size={18} className="text-brand-400" />, label: '总想法', value: total, color: 'border-brand-800/40 bg-brand-900/10' },
        { icon: <TrendingUp size={18} className="text-blue-400" />, label: '已规划', value: planned, color: 'border-blue-800/40 bg-blue-900/10' },
        { icon: <CheckCircle size={18} className="text-emerald-400" />, label: '已完成', value: completed, color: 'border-emerald-800/40 bg-emerald-900/10' },
      ].map((stat) => (
        <div key={stat.label} className={`rounded-xl border p-4 flex items-center gap-3 ${stat.color}`}>
          {stat.icon}
          <div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-400">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function HomePage() {
  const { ideas, addIdea, deleteIdea } = useIdeaStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<IdeaStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [quickMode, setQuickMode] = useState(true)
  const [newIdea, setNewIdea] = useState({ title: '', description: '', problem: '', tags: '', priority: 'medium' as Priority })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = ideas.filter((idea) => {
    const matchSearch =
      !search ||
      idea.title.toLowerCase().includes(search.toLowerCase()) ||
      idea.description.toLowerCase().includes(search.toLowerCase()) ||
      idea.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = filterStatus === 'all' || idea.status === filterStatus
    const matchPriority = filterPriority === 'all' || idea.priority === filterPriority
    return matchSearch && matchStatus && matchPriority
  })

  const handleAdd = () => {
    if (!newIdea.title.trim()) return
    const id = addIdea({
      title: newIdea.title.trim(),
      description: newIdea.description.trim(),
      problem: newIdea.problem.trim(),
      tags: newIdea.tags.split(/[,，\s]+/).filter(Boolean),
      status: 'draft',
      priority: newIdea.priority,
      notes: '',
    })
    setShowAddModal(false)
    setQuickMode(true)
    setNewIdea({ title: '', description: '', problem: '', tags: '', priority: 'medium' })
    navigate(`/idea/${id}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">我的想法库</h1>
          <p className="text-slate-400 mt-1">记录灵感，分析产品，生成方案</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus size={18} />
          <span className="hidden sm:block">新建想法</span>
        </button>
      </div>

      {ideas.length > 0 && (
        <StatsBar
          total={ideas.length}
          planned={ideas.filter((i) => ['planned', 'developing'].includes(i.status)).length}
          completed={ideas.filter((i) => i.status === 'completed').length}
        />
      )}

      {ideas.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="搜索想法、标签..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as IdeaStatus | 'all')}
                className="bg-slate-800/50 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="all">全部状态</option>
                <option value="draft">草稿</option>
                <option value="analyzing">分析中</option>
                <option value="planned">已规划</option>
                <option value="developing">开发中</option>
                <option value="completed">已完成</option>
                <option value="archived">已归档</option>
              </select>
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">全部优先级</option>
              <option value="critical">紧急</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
      )}

      {ideas.length === 0 ? (
        <EmptyState onAdd={() => setShowAddModal(true)} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Search size={32} className="mx-auto mb-3 opacity-40" />
          <p>没有找到匹配的想法</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((idea) => (
            <div
              key={idea.id}
              className="group relative bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-brand-700/60 hover:bg-slate-800/80 transition-all cursor-pointer"
              onClick={() => navigate(`/idea/${idea.id}`)}
            >
              <div className="absolute top-3 right-3 flex gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(idea.id) }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-900/40 border border-brand-800/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb size={16} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 pr-6">{idea.title}</h3>
                </div>
              </div>

              {idea.description && (
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">{idea.description}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-3">
                <StatusBadge status={idea.status} />
                <PriorityBadge priority={idea.priority} />
                {idea.productShape && (
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {PRODUCT_TYPE_LABELS[idea.productShape.type] || idea.productShape.type}
                  </span>
                )}
              </div>

              {idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {idea.tags.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} />)}
                  {idea.tags.length > 3 && <span className="text-xs text-slate-600">+{idea.tags.length - 3}</span>}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <Clock size={11} />
                  {new Date(idea.updatedAt).toLocaleDateString('zh-CN')}
                </span>
                <span className="text-xs text-brand-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  查看详情 <ArrowRight size={11} />
                </span>
              </div>

              <div className="absolute bottom-3 left-3 flex gap-1.5">
                {idea.productPlan && <Sparkles size={12} className="text-amber-400" />}
                {idea.generatedPage && <Globe size={12} className="text-brand-400" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lightbulb size={20} className="text-brand-400" />
                记录新想法
              </h2>
              <button
                onClick={() => setQuickMode(!quickMode)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                {quickMode ? '展开详情' : '收起详情'}
                <ChevronDown size={13} className={`transition-transform ${quickMode ? '' : 'rotate-180'}`} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <textarea
                  autoFocus
                  placeholder="描述你的想法，一句话即可..."
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() }
                  }}
                  rows={quickMode ? 3 : 2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none leading-relaxed"
                />
                {quickMode && (
                  <p className="text-xs text-slate-600 mt-1.5 text-right">Enter 快速保存 · Shift+Enter 换行</p>
                )}
              </div>
              {!quickMode && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">详细描述</label>
                    <textarea
                      placeholder="这个产品/工具是做什么的？解决什么问题？"
                      value={newIdea.description}
                      onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">核心痛点</label>
                    <input
                      type="text"
                      placeholder="用户面临什么问题？现有方案有什么不足？"
                      value={newIdea.problem}
                      onChange={(e) => setNewIdea({ ...newIdea, problem: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">标签</label>
                      <input
                        type="text"
                        placeholder="AI, 效率, 工具..."
                        value={newIdea.tags}
                        onChange={(e) => setNewIdea({ ...newIdea, tags: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">优先级</label>
                      <select
                        value={newIdea.priority}
                        onChange={(e) => setNewIdea({ ...newIdea, priority: e.target.value as Priority })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
                      >
                        <option value="low">低优先级</option>
                        <option value="medium">中优先级</option>
                        <option value="high">高优先级</option>
                        <option value="critical">紧急</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => { setShowAddModal(false); setQuickMode(true); setNewIdea({ title: '', description: '', problem: '', tags: '', priority: 'medium' }) }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-sm font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={!newIdea.title.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition-colors"
              >
                记录想法
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">确认删除</h3>
            <p className="text-slate-400 text-sm mb-6">删除后无法恢复，确定要删除这个想法吗？</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-sm transition-colors">取消</button>
              <button
                onClick={() => { deleteIdea(confirmDelete); setConfirmDelete(null) }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
