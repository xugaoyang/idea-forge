import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Settings, Key, Bot, CheckCircle, AlertCircle,
  ExternalLink, Eye, EyeOff, Sliders, Sparkles, Gift
} from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { AI_MODELS, PROVIDER_CONFIG } from '../types/ai'
import type { AIProvider } from '../types/ai'

const FREE_PROVIDERS: AIProvider[] = ['zhipu', 'siliconflow']
const PAID_PROVIDERS: AIProvider[] = ['deepseek', 'moonshot', 'qwen', 'openai', 'custom']

const PROVIDER_META: Record<AIProvider, { emoji: string; shortDesc: string }> = {
  zhipu:       { emoji: '🟣', shortDesc: '智谱 · 永久免费' },
  siliconflow: { emoji: '🌊', shortDesc: '硅基流动 · 送额度' },
  deepseek:    { emoji: '🔵', shortDesc: '国产 · 价格极低' },
  moonshot:    { emoji: '🌙', shortDesc: '月之暗面' },
  qwen:        { emoji: '🟠', shortDesc: '阿里 · 中文强' },
  openai:      { emoji: '🟢', shortDesc: 'GPT · 全球最强' },
  custom:      { emoji: '⚙️', shortDesc: '自定义接口' },
}

function ProviderButton({
  provider,
  selected,
  onClick,
  isFree,
}: {
  provider: AIProvider
  selected: boolean
  onClick: () => void
  isFree?: boolean
}) {
  const config = PROVIDER_CONFIG[provider]
  const meta = PROVIDER_META[provider]
  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-xl border text-left transition-all ${
        selected
          ? 'border-brand-600 bg-brand-900/30'
          : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
      }`}
    >
      {isFree && (
        <span className="absolute top-2 right-2 text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 px-1.5 py-0.5 rounded-full font-medium">
          免费
        </span>
      )}
      <div className="text-xl mb-1">{meta.emoji}</div>
      <div className={`text-sm font-medium ${selected ? 'text-brand-300' : 'text-slate-300'}`}>
        {config.name.split('（')[0]}
      </div>
      <div className="text-xs text-slate-500 mt-0.5">{meta.shortDesc}</div>
    </button>
  )
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { aiSettings, updateAISettings, isConfigured } = useSettingsStore()
  const [showKey, setShowKey] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [testError, setTestError] = useState('')
  const [saved, setSaved] = useState(false)

  const currentProviderConfig = PROVIDER_CONFIG[aiSettings.provider]
  const isFreeProvider = FREE_PROVIDERS.includes(aiSettings.provider)
  const filteredModels = AI_MODELS.filter((m) => m.provider === aiSettings.provider)

  const handleProviderChange = (provider: AIProvider) => {
    const firstModel = AI_MODELS.find((m) => m.provider === provider)
    updateAISettings({ provider, modelId: firstModel?.id || provider, apiKey: '' })
    setTestStatus('idle')
    setTestError('')
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTest = async () => {
    if (!aiSettings.apiKey.trim()) return
    setTestStatus('testing')
    setTestError('')
    try {
      const endpoint =
        aiSettings.provider === 'custom'
          ? `${aiSettings.customBaseUrl?.replace(/\/$/, '') || ''}/v1/chat/completions`
          : `${currentProviderConfig.baseUrl}${currentProviderConfig.completionsPath}`
      const modelId =
        aiSettings.provider === 'custom' ? aiSettings.customModelId || 'gpt-4o' : aiSettings.modelId

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aiSettings.apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: 'Reply with the word "ok" only.' }],
          max_tokens: 10,
        }),
      })
      if (!resp.ok) {
        const err = (await resp.json().catch(() => ({}))) as { error?: { message?: string } }
        throw new Error(err?.error?.message || `HTTP ${resp.status}`)
      }
      setTestStatus('ok')
    } catch (e) {
      setTestStatus('error')
      setTestError((e as Error).message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings size={20} className="text-slate-400" />
            AI 模型设置
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">配置后，产品形态分析和方案生成将由 AI 完成</p>
        </div>
      </div>

      {/* 当前状态 */}
      <div
        className={`rounded-xl border p-4 mb-6 flex items-center gap-3 ${
          isConfigured()
            ? 'bg-emerald-900/10 border-emerald-800/40'
            : 'bg-amber-900/10 border-amber-800/40'
        }`}
      >
        {isConfigured() ? (
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
        )}
        <div>
          <p className={`text-sm font-medium ${isConfigured() ? 'text-emerald-300' : 'text-amber-300'}`}>
            {isConfigured()
              ? `AI 已就绪 · ${currentProviderConfig.name} / ${aiSettings.modelId}`
              : '尚未配置 · 当前使用规则引擎生成（效果有限）'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isConfigured()
              ? '分析产品形态和生成方案时将自动调用 AI'
              : '选择下方任意模型并填写 API Key 即可开启'}
          </p>
        </div>
      </div>

      {/* 免费模型区 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-4">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center gap-2 bg-emerald-900/10">
          <Gift size={15} className="text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-300">免费可用</span>
          <span className="text-xs text-slate-500 ml-1">— 注册即得 API Key，无需付费</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {FREE_PROVIDERS.map((p) => (
              <ProviderButton
                key={p}
                provider={p}
                selected={aiSettings.provider === p}
                onClick={() => handleProviderChange(p)}
                isFree
              />
            ))}
          </div>

          {/* 免费服务商的免费说明 */}
          {isFreeProvider && (
            <div className="bg-emerald-900/10 border border-emerald-800/30 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-300 font-medium">{currentProviderConfig.freeDesc}</p>
                  {currentProviderConfig.keyLink && (
                    <a
                      href={currentProviderConfig.keyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 mt-1 transition-colors"
                    >
                      点击前往获取免费 API Key <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 当前免费服务商的模型列表 */}
          {isFreeProvider && filteredModels.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-2">选择模型</p>
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => updateAISettings({ modelId: model.id })}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    aiSettings.modelId === model.id
                      ? 'border-brand-600 bg-brand-900/30'
                      : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      aiSettings.modelId === model.id ? 'border-brand-500 bg-brand-500' : 'border-slate-600'
                    }`}
                  >
                    {aiSettings.modelId === model.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${aiSettings.modelId === model.id ? 'text-brand-300' : 'text-slate-300'}`}>
                        {model.name}
                      </span>
                      {model.recommended && (
                        <span className="text-[10px] bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded">推荐</span>
                      )}
                      {model.free && (
                        <span className="text-[10px] bg-emerald-900/40 text-emerald-300 px-1.5 py-0.5 rounded">免费</span>
                      )}
                      <span className="text-xs text-slate-600 ml-auto">{model.contextWindow}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{model.description}</p>
                    {model.freeNote && (
                      <p className="text-[10px] text-emerald-600 mt-0.5">{model.freeNote}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 付费模型区 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-4">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center gap-2">
          <Bot size={15} className="text-brand-400" />
          <span className="text-sm font-semibold text-white">付费模型</span>
          <span className="text-xs text-slate-500 ml-1">— 效果更强，按量付费</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {PAID_PROVIDERS.map((p) => (
              <ProviderButton
                key={p}
                provider={p}
                selected={aiSettings.provider === p}
                onClick={() => handleProviderChange(p)}
              />
            ))}
          </div>

          {/* 付费服务商的模型列表 */}
          {!isFreeProvider && aiSettings.provider !== 'custom' && filteredModels.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-2">选择模型</p>
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => updateAISettings({ modelId: model.id })}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    aiSettings.modelId === model.id
                      ? 'border-brand-600 bg-brand-900/30'
                      : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      aiSettings.modelId === model.id ? 'border-brand-500 bg-brand-500' : 'border-slate-600'
                    }`}
                  >
                    {aiSettings.modelId === model.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${aiSettings.modelId === model.id ? 'text-brand-300' : 'text-slate-300'}`}>
                        {model.name}
                      </span>
                      {model.recommended && (
                        <span className="text-[10px] bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded">推荐</span>
                      )}
                      <span className="text-xs text-slate-600 ml-auto">{model.contextWindow}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{model.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 自定义配置 */}
          {aiSettings.provider === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Base URL（兼容 OpenAI 格式）</label>
                <input
                  type="text"
                  placeholder="https://your-api-endpoint.com"
                  value={aiSettings.customBaseUrl || ''}
                  onChange={(e) => updateAISettings({ customBaseUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Model ID</label>
                <input
                  type="text"
                  placeholder="gpt-4o / llama-3-70b / ..."
                  value={aiSettings.customModelId || ''}
                  onChange={(e) => updateAISettings({ customModelId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Key 输入 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Key size={15} className="text-brand-400" />
            API Key
            {isFreeProvider && (
              <span className="text-xs font-normal text-emerald-400">（免费获取）</span>
            )}
          </h2>
          {currentProviderConfig.keyLink && (
            <a
              href={currentProviderConfig.keyLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              {isFreeProvider ? '免费获取 Key' : '获取 Key'} <ExternalLink size={10} />
            </a>
          )}
        </div>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            placeholder={currentProviderConfig.keyPlaceholder}
            value={aiSettings.apiKey}
            onChange={(e) => {
              updateAISettings({ apiKey: e.target.value })
              setTestStatus('idle')
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors font-mono"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
          <Key size={10} />
          Key 仅保存在本地浏览器，不会上传至任何服务器
        </p>
      </div>

      {/* Temperature */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders size={15} className="text-brand-400" />
            创意度（Temperature）
          </h2>
          <span className="text-brand-400 font-mono text-sm">{aiSettings.temperature}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={aiSettings.temperature}
          onChange={(e) => updateAISettings({ temperature: parseFloat(e.target.value) })}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>保守（稳定）</span>
          <span>创意（发散）</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleTest}
          disabled={!aiSettings.apiKey.trim() || testStatus === 'testing'}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-colors"
        >
          {testStatus === 'testing' ? (
            <span className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
          ) : testStatus === 'ok' ? (
            <CheckCircle size={15} className="text-emerald-400" />
          ) : testStatus === 'error' ? (
            <AlertCircle size={15} className="text-red-400" />
          ) : (
            <Bot size={15} />
          )}
          {testStatus === 'testing'
            ? '测试中...'
            : testStatus === 'ok'
            ? '连接成功'
            : testStatus === 'error'
            ? '连接失败'
            : '测试连接'}
        </button>

        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          {saved && <CheckCircle size={15} />}
          {saved ? '已保存' : '保存设置'}
        </button>
      </div>

      {testStatus === 'error' && testError && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-800/40 rounded-lg">
          <p className="text-xs text-red-300">{testError}</p>
        </div>
      )}
    </div>
  )
}
