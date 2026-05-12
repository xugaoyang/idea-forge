export type AIProvider = 'zhipu' | 'siliconflow' | 'deepseek' | 'openai' | 'moonshot' | 'qwen' | 'custom'

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  description: string
  contextWindow: string
  recommended?: boolean
  free?: boolean        // 有免费额度
  freeNote?: string     // 免费限制说明
}

export interface AISettings {
  provider: AIProvider
  modelId: string
  apiKey: string
  customBaseUrl?: string
  customModelId?: string
  temperature: number
}

export const AI_MODELS: AIModel[] = [
  // ── 国内免费可用 ──────────────────────────────
  {
    id: 'glm-4-flash',
    name: 'GLM-4-Flash',
    provider: 'zhipu',
    description: '智谱 AI 旗舰轻量模型，完全免费，无限额度',
    contextWindow: '128K',
    recommended: true,
    free: true,
    freeNote: '永久免费，不限次数',
  },
  {
    id: 'glm-4-flash-250414',
    name: 'GLM-4-Flash（最新版）',
    provider: 'zhipu',
    description: '智谱 AI 最新升级版，能力更强',
    contextWindow: '128K',
    free: true,
    freeNote: '永久免费，不限次数',
  },
  {
    id: 'Qwen/Qwen2.5-7B-Instruct',
    name: 'Qwen2.5 7B',
    provider: 'siliconflow',
    description: '阿里开源模型，硅基流动托管，免费额度充足',
    contextWindow: '32K',
    recommended: true,
    free: true,
    freeNote: '注册送 14 元额度，用完按量计费',
  },
  {
    id: 'deepseek-ai/DeepSeek-V2.5',
    name: 'DeepSeek V2.5',
    provider: 'siliconflow',
    description: 'DeepSeek 开源版，硅基流动托管',
    contextWindow: '32K',
    free: true,
    freeNote: '注册送 14 元额度',
  },
  {
    id: 'THUDM/glm-4-9b-chat',
    name: 'GLM-4 9B',
    provider: 'siliconflow',
    description: '清华智谱开源模型，中文理解强',
    contextWindow: '128K',
    free: true,
    freeNote: '注册送 14 元额度',
  },
  // ── 付费模型 ──────────────────────────────────
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    description: '综合能力强，价格极低，速度快',
    contextWindow: '128K',
    recommended: true,
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    description: '深度推理模型，分析更严谨',
    contextWindow: '64K',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: '综合能力顶尖，支持多模态',
    contextWindow: '128K',
    recommended: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: '轻量快速，价格低廉',
    contextWindow: '128K',
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    description: '最新旗舰模型，代码能力强',
    contextWindow: '1M',
  },
  {
    id: 'moonshot-v1-32k',
    name: 'Moonshot v1 32K',
    provider: 'moonshot',
    description: '月之暗面，中文理解优秀',
    contextWindow: '32K',
    recommended: true,
  },
  {
    id: 'moonshot-v1-8k',
    name: 'Moonshot v1 8K',
    provider: 'moonshot',
    description: '月之暗面，短上下文版本',
    contextWindow: '8K',
  },
  {
    id: 'qwen-max',
    name: 'Qwen Max',
    provider: 'qwen',
    description: '通义千问旗舰，中文最强',
    contextWindow: '32K',
    recommended: true,
  },
  {
    id: 'qwen-plus',
    name: 'Qwen Plus',
    provider: 'qwen',
    description: '性价比高，速度快',
    contextWindow: '131K',
  },
  // ── 自定义 ────────────────────────────────────
  {
    id: 'custom',
    name: '自定义模型',
    provider: 'custom',
    description: '任意兼容 OpenAI 格式的模型',
    contextWindow: '-',
  },
]

export const PROVIDER_CONFIG: Record<AIProvider, {
  name: string
  baseUrl: string
  /** chat completions 的完整路径，默认 /v1/chat/completions */
  completionsPath: string
  keyPlaceholder: string
  keyLink: string
  free?: boolean
  freeDesc?: string
}> = {
  zhipu: {
    name: '智谱 AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    completionsPath: '/chat/completions',       // 已含 v4，不加 v1
    keyPlaceholder: 'xxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx',
    keyLink: 'https://open.bigmodel.cn/usercenter/apikeys',
    free: true,
    freeDesc: 'GLM-4-Flash 永久免费，不限次数，注册即用',
  },
  siliconflow: {
    name: '硅基流动',
    baseUrl: 'https://api.siliconflow.cn/v1',
    completionsPath: '/chat/completions',       // 已含 v1，不重复加
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: 'https://cloud.siliconflow.cn/account/ak',
    free: true,
    freeDesc: '注册即送 14 元免费额度，支持 DeepSeek / Qwen 等主流模型',
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    completionsPath: '/v1/chat/completions',
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: 'https://platform.deepseek.com/api_keys',
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com',
    completionsPath: '/v1/chat/completions',
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: 'https://platform.openai.com/api-keys',
  },
  moonshot: {
    name: 'Moonshot（月之暗面）',
    baseUrl: 'https://api.moonshot.cn',
    completionsPath: '/v1/chat/completions',
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: 'https://platform.moonshot.cn/console/api-keys',
  },
  qwen: {
    name: '通义千问（阿里云）',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode',
    completionsPath: '/v1/chat/completions',
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: 'https://dashscope.console.aliyun.com/apiKey',
  },
  custom: {
    name: '自定义',
    baseUrl: '',
    completionsPath: '/v1/chat/completions',
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: '',
  },
}
