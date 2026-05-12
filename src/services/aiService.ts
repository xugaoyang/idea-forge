import type { AISettings } from '../types/ai'
import type { Idea, ProductShape, ProductPlan, Feature } from '../types'
import { PROVIDER_CONFIG } from '../types/ai'
import { analyzeProductShape as ruleBasedShape, generateProductPlan as ruleBasedPlan } from '../utils/productAnalyzer'

function getEndpoint(settings: AISettings): string {
  if (settings.provider === 'custom') {
    const base = settings.customBaseUrl?.replace(/\/$/, '') || ''
    return `${base}/v1/chat/completions`
  }
  const cfg = PROVIDER_CONFIG[settings.provider]
  return `${cfg.baseUrl}${cfg.completionsPath}`
}

function getModelId(settings: AISettings): string {
  if (settings.provider === 'custom') {
    return settings.customModelId || 'gpt-4o'
  }
  return settings.modelId
}

async function callLLM(settings: AISettings, systemPrompt: string, userPrompt: string): Promise<string> {
  const endpoint = getEndpoint(settings)
  const modelId = getModelId(settings)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      temperature: settings.temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg = (err as { error?: { message?: string } })?.error?.message || `HTTP ${response.status}`
    throw new Error(`API 调用失败：${msg}`)
  }

  const data = await response.json() as { choices: { message: { content: string } }[] }
  return data.choices[0].message.content
}

function generateId(): string {
  return `feat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function ensureFeatureIds(features: Partial<Feature>[]): Feature[] {
  return features.map((f) => ({
    id: f.id || generateId(),
    name: f.name || '未命名功能',
    description: f.description || '',
    priority: f.priority || 'medium',
    effort: f.effort || 'medium',
    isCore: f.isCore ?? false,
  }))
}

// ──────────────────────────────────────────────
// 产品形态分析
// ──────────────────────────────────────────────
const SHAPE_SYSTEM_PROMPT = `你是一位经验丰富的产品经理，擅长分析产品形态和市场定位。
用户会给你一个产品想法，请你分析并严格按照以下 JSON 格式返回结果（不要添加任何额外文字）：

{
  "type": "web-app|mobile-app|desktop-app|api-service|saas|tool|platform|chrome-extension|mini-program|other",
  "platforms": ["平台1", "平台2"],
  "targetUsers": "目标用户群体描述",
  "corePainPoint": "核心痛点描述（2-3句话）",
  "valueProposition": "产品价值主张（1-2句话）",
  "competitors": ["竞品1", "竞品2", "竞品3"],
  "differentiators": ["差异化优势1", "差异化优势2", "差异化优势3", "差异化优势4"]
}

要求：
- type 只能是给定枚举值之一
- platforms 根据 type 填写合适的平台列表
- 竞品分析要结合实际市场情况，给出真实存在的竞品
- 差异化优势要具体、可落地，不要泛泛而谈
- 所有内容用中文回答`

export async function aiAnalyzeProductShape(idea: Idea, settings: AISettings): Promise<ProductShape> {
  const userPrompt = `产品想法如下：

【标题】${idea.title}
【描述】${idea.description || '（未填写）'}
【核心痛点】${idea.problem || '（未填写）'}
【标签】${idea.tags.join('、') || '（无）'}`

  try {
    const raw = await callLLM(settings, SHAPE_SYSTEM_PROMPT, userPrompt)
    const parsed = JSON.parse(raw) as ProductShape
    if (!parsed.type || !parsed.targetUsers) throw new Error('返回数据格式不完整')
    return parsed
  } catch (e) {
    if ((e as Error).message?.includes('API 调用失败')) throw e
    throw new Error(`AI 返回格式解析失败：${(e as Error).message}`)
  }
}

// ──────────────────────────────────────────────
// 产品方案生成
// ──────────────────────────────────────────────
const PLAN_SYSTEM_PROMPT = `你是一位资深产品经理兼技术架构师，擅长制定产品开发方案。
用户会给你一个产品想法和产品形态分析结果，请生成详细的产品开发方案。
严格按照以下 JSON 格式返回（不要添加任何额外文字）：

{
  "mvpFeatures": [
    {
      "name": "功能名称",
      "description": "功能描述（1-2句话）",
      "priority": "critical|high|medium|low",
      "effort": "small|medium|large",
      "isCore": true
    }
  ],
  "v1Features": [...同上格式，4-6个功能...],
  "futureFeatures": [...同上格式，3-5个功能...],
  "techStack": {
    "frontend": ["技术1", "技术2"],
    "backend": ["技术1", "技术2"],
    "database": ["技术1", "技术2"],
    "infra": ["技术1", "技术2"],
    "thirdParty": ["服务1", "服务2"]
  },
  "timeline": "开发周期描述（1句话）",
  "estimatedDevTime": "工时估算描述（1句话）",
  "monetization": ["商业模式1", "商业模式2", "商业模式3"],
  "risks": ["风险1", "风险2", "风险3", "风险4"],
  "successMetrics": ["指标1", "指标2", "指标3", "指标4", "指标5"]
}

要求：
- mvpFeatures 只包含上线必须的核心功能（3-5个）
- 技术栈选型要结合产品类型给出合理建议
- 风险要具体针对该产品场景，不要泛泛而谈
- 成功指标要可量化、可验证
- 所有内容用中文`

export async function aiGenerateProductPlan(idea: Idea, shape: ProductShape, settings: AISettings): Promise<ProductPlan> {
  const userPrompt = `产品信息如下：

【标题】${idea.title}
【描述】${idea.description || '（未填写）'}
【核心痛点】${idea.problem || '（未填写）'}

【产品形态分析结果】
- 产品类型：${shape.type}
- 目标用户：${shape.targetUsers}
- 核心痛点：${shape.corePainPoint}
- 价值主张：${shape.valueProposition}
- 竞品：${shape.competitors.join('、')}
- 差异化：${shape.differentiators.join('；')}`

  try {
    const raw = await callLLM(settings, PLAN_SYSTEM_PROMPT, userPrompt)
    const parsed = JSON.parse(raw) as Omit<ProductPlan, 'mvpFeatures' | 'v1Features' | 'futureFeatures'> & {
      mvpFeatures: Partial<Feature>[]
      v1Features: Partial<Feature>[]
      futureFeatures: Partial<Feature>[]
    }
    if (!parsed.mvpFeatures || !parsed.techStack) throw new Error('返回数据格式不完整')
    return {
      ...parsed,
      mvpFeatures: ensureFeatureIds(parsed.mvpFeatures),
      v1Features: ensureFeatureIds(parsed.v1Features),
      futureFeatures: ensureFeatureIds(parsed.futureFeatures),
    }
  } catch (e) {
    if ((e as Error).message?.includes('API 调用失败')) throw e
    throw new Error(`AI 返回格式解析失败：${(e as Error).message}`)
  }
}

// ──────────────────────────────────────────────
// 统一入口（自动降级到规则引擎）
// ──────────────────────────────────────────────
export async function analyzeShape(idea: Idea, settings: AISettings | null): Promise<ProductShape> {
  if (settings && settings.apiKey.trim()) {
    return aiAnalyzeProductShape(idea, settings)
  }
  return ruleBasedShape(idea)
}

export async function generatePlan(idea: Idea, shape: ProductShape, settings: AISettings | null): Promise<ProductPlan> {
  if (settings && settings.apiKey.trim()) {
    return aiGenerateProductPlan(idea, shape, settings)
  }
  return ruleBasedPlan(idea, shape)
}
