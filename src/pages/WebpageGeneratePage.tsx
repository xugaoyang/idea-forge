import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, ChevronRight, Globe, RefreshCw, Download,
  Eye, Code2, Sparkles, Bot, Settings, AlertTriangle, Check,
  Monitor, Smartphone
} from 'lucide-react'
import { useIdeaStore } from '../store/ideaStore'
import { useSettingsStore } from '../store/settingsStore'
import { generateWebpage } from '../services/aiService'

type ViewMode = 'preview' | 'code'
type DeviceMode = 'desktop' | 'mobile'

function downloadHTML(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.html`
  a.click()
  URL.revokeObjectURL(url)
}

export function WebpageGeneratePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ideas, setGeneratedPage } = useIdeaStore()
  const idea = ideas.find((i) => i.id === id)
  const { aiSettings, isConfigured } = useSettingsStore()

  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [downloaded, setDownloaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  if (!idea) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">想法不存在</p>
        <Link to="/" className="text-brand-400 hover:text-brand-300">← 返回列表</Link>
      </div>
    )
  }

  if (!idea.productPlan) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">请先完成产品方案生成</p>
        <Link to={`/idea/${id}/plan`} className="text-brand-400 hover:text-brand-300">→ 前往产品方案</Link>
      </div>
    )
  }

  const page = idea.generatedPage

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateError(null)
    try {
      const result = await generateWebpage(idea, isConfigured() ? aiSettings : null)
      setGeneratedPage(idea.id, result)
      setViewMode('preview')
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : '生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!page) return
    downloadHTML(page.html, idea.title)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(`/idea/${id}`)}
          className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:text-slate-300 transition-colors">想法库</Link>
            <ChevronRight size={12} />
            <Link to={`/idea/${id}`} className="hover:text-slate-300 transition-colors truncate max-w-32">{idea.title}</Link>
            <ChevronRight size={12} />
            <span className="text-slate-400">生成网页</span>
          </div>
        </div>
        {page && (
          <button
            onClick={handleDownload}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              downloaded
                ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-300'
                : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {downloaded ? <Check size={14} /> : <Download size={14} />}
            {downloaded ? '已下载' : '下载 HTML'}
          </button>
        )}
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">生成落地页</h1>
        <p className="text-slate-400 text-sm">「{idea.title}」— AI 根据产品方案生成可下载的落地页网页</p>
      </div>

      {!page ? (
        /* ── 未生成状态 ── */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-900/30 border border-brand-800/50 flex items-center justify-center mx-auto mb-5">
            <Globe size={28} className="text-brand-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">生成产品落地页</h2>
          <p className="text-slate-400 text-sm mb-2 max-w-sm mx-auto">
            AI 将根据产品名称、描述、核心功能和目标用户，生成一个完整的单文件 HTML 落地页。
          </p>
          <p className="text-slate-500 text-xs mb-6">生成后可在浏览器中实时预览，并一键下载 HTML 文件</p>

          <div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full mb-6 ${
            isConfigured()
              ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/40'
              : 'bg-red-900/20 text-red-300 border border-red-800/30'
          }`}>
            {isConfigured() ? <Bot size={12} /> : <AlertTriangle size={12} />}
            {isConfigured() ? `AI 模式 · ${aiSettings.modelId}` : '需要配置 AI 才能生成网页'}
            {!isConfigured() && (
              <Link to="/settings" className="ml-1 text-brand-400 hover:text-brand-300 underline">去配置</Link>
            )}
          </div>

          {/* 产品信息预览 */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 text-left max-w-md mx-auto mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">将用于生成网页的信息</p>
            <div className="space-y-2">
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 shrink-0 w-16">产品名</span>
                <span className="text-slate-300">{idea.title}</span>
              </div>
              {idea.description && (
                <div className="flex gap-2 text-sm">
                  <span className="text-slate-500 shrink-0 w-16">描述</span>
                  <span className="text-slate-300 line-clamp-2">{idea.description}</span>
                </div>
              )}
              {idea.productShape?.targetUsers && (
                <div className="flex gap-2 text-sm">
                  <span className="text-slate-500 shrink-0 w-16">目标用户</span>
                  <span className="text-slate-300 line-clamp-1">{idea.productShape.targetUsers}</span>
                </div>
              )}
              {idea.productPlan && (
                <div className="flex gap-2 text-sm">
                  <span className="text-slate-500 shrink-0 w-16">核心功能</span>
                  <span className="text-slate-300 line-clamp-2">
                    {idea.productPlan.mvpFeatures.slice(0, 3).map(f => f.name).join('、')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {generateError && (
            <div className="mb-5 p-3 bg-red-900/20 border border-red-800/40 rounded-xl text-sm text-red-300 max-w-sm mx-auto text-left flex gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              {generateError}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || !isConfigured()}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-3 rounded-xl font-medium transition-colors"
          >
            {generating ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {generating ? 'AI 生成中...' : '生成落地页'}
          </button>

          {!isConfigured() && (
            <p className="text-xs text-slate-600 mt-3">
              网页生成需要 AI 支持，规则引擎无法替代此功能
            </p>
          )}
        </div>
      ) : (
        /* ── 已生成状态 ── */
        <div className="space-y-4">
          {/* 工具栏 */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye size={14} />预览
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'code'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 size={14} />源码
              </button>
            </div>

            {viewMode === 'preview' && (
              <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    deviceMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Monitor size={14} />桌面
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    deviceMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone size={14} />移动
                </button>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-600">
                v{page.version} · {new Date(page.generatedAt).toLocaleDateString('zh-CN')}
              </span>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 disabled:opacity-50 rounded-lg transition-colors"
              >
                {generating ? <RefreshCw size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                重新生成
              </button>
              <button
                onClick={handleDownload}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  downloaded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-600 hover:bg-brand-500 text-white'
                }`}
              >
                {downloaded ? <Check size={14} /> : <Download size={14} />}
                {downloaded ? '已下载' : '下载 HTML'}
              </button>
            </div>
          </div>

          {generating && (
            <div className="bg-brand-900/20 border border-brand-800/40 rounded-xl px-4 py-3 flex items-center gap-3">
              <RefreshCw size={15} className="animate-spin text-brand-400 shrink-0" />
              <p className="text-sm text-slate-300">AI 正在重新生成网页，请稍候...</p>
            </div>
          )}

          {generateError && (
            <div className="bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-300">
              <AlertTriangle size={14} className="shrink-0" />{generateError}
            </div>
          )}

          {/* 预览/代码区域 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {viewMode === 'preview' ? (
              <div className="flex flex-col items-center bg-slate-950 p-4">
                <div
                  className={`bg-white rounded-lg overflow-hidden transition-all duration-300 w-full ${
                    deviceMode === 'mobile' ? 'max-w-sm' : 'max-w-full'
                  }`}
                  style={{ height: 600 }}
                >
                  <iframe
                    ref={iframeRef}
                    srcDoc={page.html}
                    sandbox="allow-scripts"
                    className="w-full h-full border-none"
                    title="网页预览"
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-800/50">
                  <span className="text-xs text-slate-500 font-mono">index.html</span>
                  <span className="text-xs text-slate-600">{page.html.length.toLocaleString()} 字符</span>
                </div>
                <pre className="p-4 text-xs text-slate-400 font-mono leading-relaxed overflow-auto max-h-[600px] whitespace-pre-wrap break-all">
                  {page.html}
                </pre>
              </div>
            )}
          </div>

          {/* 底部提示 */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Globe size={12} />
            <span>生成的 HTML 文件可直接在浏览器中打开，无需服务器，也可部署到 GitHub Pages、Vercel 等平台</span>
          </div>
        </div>
      )}

      {/* Settings 引导 */}
      {!isConfigured() && !page && (
        <div className="mt-4 flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
          <Settings size={15} className="text-slate-500 shrink-0" />
          <p className="text-xs text-slate-500 flex-1">
            前往
            <Link to="/settings" className="text-brand-400 hover:text-brand-300 mx-1">AI 设置</Link>
            配置 API Key，推荐使用智谱 GLM-4-Flash（永久免费）
          </p>
        </div>
      )}
    </div>
  )
}
