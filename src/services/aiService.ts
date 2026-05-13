import type { AISettings } from '../types/ai'
import type { Idea, ProductShape, ProductPlan, Feature, IdeaExpansion, GeneratedPage } from '../types'
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

async function callLLMRaw(settings: AISettings, systemPrompt: string, userPrompt: string): Promise<string> {
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
// 想法扩写补全
// ──────────────────────────────────────────────
const EXPAND_IDEA_SYSTEM_PROMPT = `你是产品经理助手，擅长将简短的产品想法扩展成清晰的产品描述。
用户会给你一个简短的产品想法标题，请帮他补全详细信息。
严格按照以下 JSON 格式返回，不要添加任何额外文字：

{
  "description": "产品是做什么的，解决什么场景下的问题（2-3句话，具体且有场景感）",
  "problem": "用户面临的核心痛点，现有方案的不足（1-2句话，具体指出痛点）",
  "tags": ["标签1", "标签2", "标签3"]
}

要求：
- description 要有场景感，不要泛泛而谈
- problem 要具体，指出现有方案的缺陷
- tags 给 3-4 个精准标签，如：AI、效率工具、B端、移动端等
- 所有内容用中文`

async function aiExpandIdea(idea: Idea, settings: AISettings): Promise<IdeaExpansion> {
  const userPrompt = `产品想法标题：「${idea.title}」`
  try {
    const raw = await callLLM(settings, EXPAND_IDEA_SYSTEM_PROMPT, userPrompt)
    const parsed = JSON.parse(raw) as IdeaExpansion
    if (!parsed.description) throw new Error('返回数据格式不完整')
    return parsed
  } catch (e) {
    if ((e as Error).message?.includes('API 调用失败')) throw e
    throw new Error(`AI 返回格式解析失败：${(e as Error).message}`)
  }
}

export async function expandIdea(idea: Idea, settings: AISettings | null): Promise<IdeaExpansion> {
  if (settings && settings.apiKey.trim()) {
    return aiExpandIdea(idea, settings)
  }
  return {
    description: `${idea.title}是一款旨在解决用户实际痛点的产品工具，通过简洁高效的功能设计，帮助目标用户更好地完成核心任务。`,
    problem: '现有解决方案存在操作复杂、功能分散等问题，用户需要一个更聚焦、更易用的专属工具。',
    tags: ['效率工具', '产品设计'],
  }
}

// ──────────────────────────────────────────────
// 网页代码生成
// ──────────────────────────────────────────────
const WEBPAGE_SYSTEM_PROMPT = `你是一位专业的前端开发工程师和 UI 设计师，擅长创建现代、美观的落地页。
请根据产品信息生成一个完整的单文件落地页 HTML。

要求：
- 输出完整的单文件 HTML，使用 Tailwind CSS CDN（https://cdn.tailwindcss.com）
- 页面结构包含：导航栏、Hero 区、核心功能介绍（3-4个功能）、使用场景/目标用户、行动号召（CTA）、页脚
- 现代简洁的设计风格，专业配色，响应式布局
- 使用语义化 HTML 标签
- 不使用任何外部 JS 框架，可以用少量原生 JS 实现交互（如移动端导航）
- 只输出完整 HTML 代码，不要任何说明文字，不要 markdown 代码块标记`

async function aiGenerateWebpage(idea: Idea, settings: AISettings): Promise<string> {
  const shape = idea.productShape
  const plan = idea.productPlan
  const userPrompt = `请为以下产品生成落地页 HTML：

产品名称：${idea.title}
产品描述：${idea.description || '暂无'}
核心痛点：${idea.problem || '暂无'}
${shape ? `产品类型：${shape.type}
目标用户：${shape.targetUsers}
价值主张：${shape.valueProposition}
差异化优势：${shape.differentiators.slice(0, 3).join('、')}` : ''}
${plan ? `核心功能：${plan.mvpFeatures.slice(0, 4).map(f => `${f.name}（${f.description}）`).join('；')}` : ''}`

  try {
    const html = await callLLMRaw(settings, WEBPAGE_SYSTEM_PROMPT, userPrompt)
    const cleaned = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim()
    if (!cleaned.includes('<html') && !cleaned.includes('<!DOCTYPE')) {
      throw new Error('返回内容不是有效的 HTML')
    }
    return cleaned
  } catch (e) {
    if ((e as Error).message?.includes('API 调用失败')) throw e
    throw new Error(`网页生成失败：${(e as Error).message}`)
  }
}

export async function generateWebpage(idea: Idea, settings: AISettings | null): Promise<GeneratedPage> {
  if (!settings || !settings.apiKey.trim()) {
    throw new Error('生成网页需要配置 AI，请前往设置页面配置 API Key')
  }
  const html = await aiGenerateWebpage(idea, settings)
  const existing = idea.generatedPage
  return {
    html,
    generatedAt: new Date().toISOString(),
    version: existing ? existing.version + 1 : 1,
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
