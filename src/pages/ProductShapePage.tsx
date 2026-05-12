import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Wand2, ChevronRight, Users, Target, Zap, TrendingUp, RefreshCw, CheckCircle, Edit3, Save, X, Settings, Bot } from 'lucide-react'
import { useIdeaStore } from '../store/ideaStore'
import { useSettingsStore } from '../store/settingsStore'
import { analyzeShape } from '../services/aiService'
import type { ProductShape, ProductType } from '../types'

const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string; desc: string }[] = [
  { value: 'web-app', label: '🌐 Web App', desc: '基于浏览器的网页应用' },
  { value: 'mobile-app', label: '📱 移动 App', desc: 'iOS / Android 原生应用' },
  { value: 'saas', label: '☁️ SaaS', desc: '软件即服务，按需订阅' },
  { value: 'api-service', label: '🔌 API 服务', desc: '供开发者调用的 API' },
  { value: 'tool', label: '🔧 效率工具', desc: '提升特定场景效率的工具' },
  { value: 'platform', label: '🏗️ 平台', desc: '连接多方的开放平台' },
  { value: 'chrome-extension', label: '🧩 浏览器插件', desc: 'Chrome/Edge 扩展程序' },
  { value: 'mini-program', label: '💬 小程序', desc: '微信/支付宝小程序' },
  { value: 'desktop-app', label: '🖥️ 桌面应用', desc: 'Windows/Mac/Linux 客户端' },
  { value: 'other', label: '💡 其他', desc: '不在上述分类中' },
]

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3 text-slate-300">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      {children}
    </div>
  )
}

export function ProductShapePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ideas, setProductShape } = useIdeaStore()
  const idea = ideas.find((i) => i.id === id)

  const { aiSettings, isConfigured } = useSettingsStore()
  const [shape, setShape] = useState<ProductShape | null>(idea?.productShape || null)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<ProductShape | null>(null)

  if (!idea) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">想法不存在</p>
        <Link to="/" className="text-brand-400 hover:text-brand-300">← 返回列表</Link>
      </div>
    )
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateError('')
    try {
      const result = await analyzeShape(idea, isConfigured() ? aiSettings : null)
      setShape(result)
      setProductShape(idea.id, result)
    } catch (e) {
      setGenerateError((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  const handleEdit = () => {
    setEditForm(shape ? { ...shape } : null)
    setEditing(true)
  }

  const handleSaveEdit = () => {
    if (!editForm) return
    setShape(editForm)
    setProductShape(idea.id, editForm)
    setEditing(false)
  }

  const currentShape = editing ? editForm : shape

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
            <span className="text-slate-400">产品形态</span>
          </div>
        </div>
        {shape && !editing && (
          <button onClick={handleEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors">
            <Edit3 size={14} />编辑
          </button>
        )}
        {editing && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"><X size={15} /></button>
            <button onClick={handleSaveEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors"><Save size={14} />保存</button>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">产品形态分析</h1>
        <p className="text-slate-400 text-sm">分析「{idea.title}」的产品类型、目标用户和核心价值</p>
      </div>

      {!shape ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-900/30 border border-brand-800/50 flex items-center justify-center mx-auto mb-5">
            <Wand2 size={28} className="text-brand-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">智能分析产品形态</h2>
          <p className="text-slate-400 text-sm mb-4 max-w-sm mx-auto">
            基于你的想法描述，自动分析产品类型、目标用户群体、核心痛点和竞品格局
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
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              {generating ? <RefreshCw size={18} className="animate-spin" /> : <Wand2 size={18} />}
              {generating ? (isConfigured() ? 'AI 分析中...' : '分析中...') : '开始分析'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 产品类型 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">产品类型</h3>
            {editing && editForm ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRODUCT_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEditForm({ ...editForm, type: opt.value })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      editForm.type === opt.value
                        ? 'border-brand-600 bg-brand-900/30 text-brand-300'
                        : 'border-slate-700 hover:border-slate-600 text-slate-400'
                    }`}
                  >
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="bg-brand-900/30 border border-brand-800/50 rounded-xl px-4 py-3">
                  <div className="text-lg font-bold text-brand-300">
                    {PRODUCT_TYPE_OPTIONS.find((o) => o.value === currentShape?.type)?.label || currentShape?.type}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {PRODUCT_TYPE_OPTIONS.find((o) => o.value === currentShape?.type)?.desc}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 平台 */}
          <InfoCard icon={<Zap size={15} className="text-blue-400" />} title="支持平台">
            {editing && editForm ? (
              <input
                type="text"
                value={editForm.platforms.join(', ')}
                onChange={(e) => setEditForm({ ...editForm, platforms: e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean) })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentShape?.platforms.map((p) => (
                  <span key={p} className="px-2.5 py-1 bg-slate-700/60 text-slate-300 text-xs rounded-lg">{p}</span>
                ))}
              </div>
            )}
          </InfoCard>

          {/* 目标用户 */}
          <InfoCard icon={<Users size={15} className="text-emerald-400" />} title="目标用户群体">
            {editing && editForm ? (
              <input
                type="text"
                value={editForm.targetUsers}
                onChange={(e) => setEditForm({ ...editForm, targetUsers: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
              />
            ) : (
              <p className="text-slate-300 text-sm">{currentShape?.targetUsers}</p>
            )}
          </InfoCard>

          {/* 痛点 & 价值 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoCard icon={<Target size={15} className="text-red-400" />} title="核心痛点">
              {editing && editForm ? (
                <textarea
                  value={editForm.corePainPoint}
                  onChange={(e) => setEditForm({ ...editForm, corePainPoint: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 resize-none"
                />
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed">{currentShape?.corePainPoint}</p>
              )}
            </InfoCard>

            <InfoCard icon={<Zap size={15} className="text-amber-400" />} title="价值主张">
              {editing && editForm ? (
                <textarea
                  value={editForm.valueProposition}
                  onChange={(e) => setEditForm({ ...editForm, valueProposition: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 resize-none"
                />
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed">{currentShape?.valueProposition}</p>
              )}
            </InfoCard>
          </div>

          {/* 竞品 & 差异化 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoCard icon={<TrendingUp size={15} className="text-purple-400" />} title="主要竞品">
              {editing && editForm ? (
                <input
                  type="text"
                  value={editForm.competitors.join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, competitors: e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
                />
              ) : (
                <div className="space-y-1.5">
                  {currentShape?.competitors.map((c) => (
                    <div key={c} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>

            <InfoCard icon={<CheckCircle size={15} className="text-brand-400" />} title="差异化优势">
              {editing && editForm ? (
                <textarea
                  value={editForm.differentiators.join('\n')}
                  onChange={(e) => setEditForm({ ...editForm, differentiators: e.target.value.split('\n').filter(Boolean) })}
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 resize-none"
                  placeholder="每行一条"
                />
              ) : (
                <div className="space-y-1.5">
                  {currentShape?.differentiators.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle size={13} className="text-brand-400 shrink-0 mt-0.5" />
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>
          </div>

          {/* 下一步 */}
          {!editing && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2.5 text-sm border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 disabled:opacity-50 rounded-xl transition-colors"
              >
                {generating ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {generating ? (isConfigured() ? 'AI 分析中...' : '分析中...') : '重新分析'}
              </button>
              <button
                onClick={() => navigate(`/idea/${id}/plan`)}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
              >
                下一步：生成产品方案 <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
