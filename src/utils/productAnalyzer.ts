import type { Idea, ProductShape, ProductPlan, Feature, TechStack, ProductType } from '../types'

function generateId(): string {
  return `feat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function detectProductType(idea: Idea): ProductType {
  const text = `${idea.title} ${idea.description} ${idea.problem}`.toLowerCase()
  if (text.includes('移动') || text.includes('app') || text.includes('手机') || text.includes('ios') || text.includes('android')) return 'mobile-app'
  if (text.includes('小程序') || text.includes('微信')) return 'mini-program'
  if (text.includes('插件') || text.includes('扩展') || text.includes('chrome') || text.includes('浏览器')) return 'chrome-extension'
  if (text.includes('桌面') || text.includes('客户端') || text.includes('electron')) return 'desktop-app'
  if (text.includes('api') || text.includes('接口') || text.includes('服务') || text.includes('sdk')) return 'api-service'
  if (text.includes('平台') || text.includes('市场') || text.includes('生态')) return 'platform'
  if (text.includes('saas') || text.includes('订阅') || text.includes('企业')) return 'saas'
  if (text.includes('工具') || text.includes('效率') || text.includes('自动化')) return 'tool'
  return 'web-app'
}

function detectTargetUsers(idea: Idea): string {
  const text = `${idea.title} ${idea.description} ${idea.problem}`.toLowerCase()
  if (text.includes('开发者') || text.includes('程序员') || text.includes('工程师')) return '开发者 / 技术人员'
  if (text.includes('学生') || text.includes('学习') || text.includes('教育')) return '学生 / 学习者'
  if (text.includes('设计') || text.includes('设计师')) return '设计师 / 创意工作者'
  if (text.includes('企业') || text.includes('团队') || text.includes('公司') || text.includes('职场')) return '企业用户 / 团队'
  if (text.includes('创业') || text.includes('创业者') || text.includes('独立')) return '创业者 / 独立开发者'
  if (text.includes('内容') || text.includes('博主') || text.includes('创作')) return '内容创作者'
  if (text.includes('个人') || text.includes('用户')) return '个人用户（大众消费者）'
  return '广泛用户群体'
}

function detectPlatforms(type: ProductType): string[] {
  const map: Record<ProductType, string[]> = {
    'web-app': ['Web 浏览器', 'PC', '移动端响应式'],
    'mobile-app': ['iOS', 'Android'],
    'desktop-app': ['Windows', 'macOS', 'Linux'],
    'api-service': ['云端部署', 'RESTful API', 'SDK'],
    'saas': ['Web 浏览器', 'PC', '移动端'],
    'tool': ['Web', 'CLI', 'Desktop'],
    'platform': ['Web 浏览器', 'iOS', 'Android', 'PC'],
    'chrome-extension': ['Chrome', 'Edge'],
    'mini-program': ['微信小程序', '支付宝小程序'],
    'other': ['Web'],
  }
  return map[type] || ['Web']
}

function inferCompetitors(idea: Idea): string[] {
  const text = `${idea.title} ${idea.description}`.toLowerCase()
  const competitorMap: [string[], string[]][] = [
    [['笔记', '记录', '知识库'], ['Notion', 'Obsidian', '印象笔记', '有道云笔记']],
    [['任务', '待办', 'todo', '项目管理'], ['Trello', 'Linear', 'Jira', 'Asana']],
    [['代码', '编程', '开发'], ['GitHub', 'GitLab', 'VS Code', 'Cursor']],
    [['设计', 'ui', 'ux'], ['Figma', 'Sketch', 'Adobe XD']],
    [['聊天', '即时通讯', '协作'], ['Slack', 'Teams', '飞书', '钉钉']],
    [['ai', '智能', '生成'], ['ChatGPT', 'Claude', 'Gemini', 'Midjourney']],
    [['电商', '购物', '商城'], ['淘宝', '京东', '拼多多', 'Shopify']],
    [['数据', '分析', '报表'], ['Tableau', 'PowerBI', 'Metabase']],
    [['视频', '直播', '流媒体'], ['YouTube', 'B站', '抖音', 'Twitch']],
  ]
  for (const [keywords, competitors] of competitorMap) {
    if (keywords.some((k) => text.includes(k))) {
      return competitors.slice(0, 3)
    }
  }
  return ['暂无明确竞品（细分市场）']
}

function generateTechStack(type: ProductType): TechStack {
  const stacks: Record<ProductType, TechStack> = {
    'web-app': {
      frontend: ['React / Next.js', 'TypeScript', 'Tailwind CSS'],
      backend: ['Node.js + Express', '或 Python + FastAPI'],
      database: ['PostgreSQL', 'Redis（缓存）'],
      infra: ['Vercel / Railway', 'Docker'],
      thirdParty: ['Auth.js（认证）', 'Stripe（支付）'],
    },
    'mobile-app': {
      frontend: ['React Native / Expo', '或 Flutter'],
      backend: ['Node.js + Fastify', 'Firebase'],
      database: ['SQLite（本地）', 'Supabase（云端）'],
      infra: ['App Store / Google Play', 'Expo EAS'],
      thirdParty: ['RevenueCat（订阅）', 'OneSignal（推送）'],
    },
    'saas': {
      frontend: ['Next.js', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'],
      backend: ['Node.js + tRPC', '或 Go + Gin'],
      database: ['PostgreSQL', 'Redis', 'S3（文件存储）'],
      infra: ['AWS / 阿里云', 'Kubernetes', 'Terraform'],
      thirdParty: ['Stripe（订阅）', 'Resend（邮件）', 'Sentry（监控）'],
    },
    'api-service': {
      frontend: ['API 文档（Swagger）'],
      backend: ['Go + Gin', '或 Python + FastAPI'],
      database: ['PostgreSQL', 'Redis'],
      infra: ['Docker', 'Kubernetes', 'CI/CD'],
      thirdParty: ['OpenTelemetry（监控）', 'API Gateway'],
    },
    'tool': {
      frontend: ['React / Vue', 'Electron（桌面）'],
      backend: ['Node.js', 'Python'],
      database: ['SQLite', 'LevelDB'],
      infra: ['GitHub Actions', 'npm / PyPI 发布'],
      thirdParty: ['依需引入'],
    },
    'platform': {
      frontend: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      backend: ['Node.js 微服务', 'Go（高性能服务）'],
      database: ['PostgreSQL', 'Elasticsearch', 'Redis'],
      infra: ['Kubernetes', 'AWS / 阿里云', 'CDN'],
      thirdParty: ['Stripe', 'SendGrid', 'Algolia（搜索）'],
    },
    'chrome-extension': {
      frontend: ['React', 'TypeScript', 'Tailwind CSS', 'WXT / Plasmo'],
      backend: ['（可选）Node.js API'],
      database: ['Chrome Storage API', '（可选）Supabase'],
      infra: ['Chrome Web Store', 'GitHub Actions'],
      thirdParty: ['依需引入'],
    },
    'mini-program': {
      frontend: ['Taro / uni-app', 'WeUI'],
      backend: ['Node.js', '微信云开发'],
      database: ['云数据库（微信）', 'MySQL'],
      infra: ['微信开发者工具', '云托管'],
      thirdParty: ['微信支付', '微信登录'],
    },
    'desktop-app': {
      frontend: ['Electron + React', '或 Tauri + React'],
      backend: ['Rust（Tauri）', 'Node.js（Electron）'],
      database: ['SQLite', 'LevelDB'],
      infra: ['GitHub Releases', 'Squirrel（更新）'],
      thirdParty: ['依需引入'],
    },
    'other': {
      frontend: ['React', 'TypeScript'],
      backend: ['Node.js'],
      database: ['PostgreSQL'],
      infra: ['Docker', 'Vercel'],
      thirdParty: ['依需引入'],
    },
  }
  return stacks[type] || stacks['web-app']
}

function generateMvpFeatures(idea: Idea): Feature[] {
  const text = `${idea.title} ${idea.description} ${idea.problem}`.toLowerCase()
  const features: Feature[] = [
    {
      id: generateId(),
      name: '用户身份认证',
      description: '注册、登录、找回密码，支持邮箱/手机号',
      priority: 'high',
      effort: 'small',
      isCore: true,
    },
    {
      id: generateId(),
      name: `${idea.title}核心功能`,
      description: `实现产品最核心的价值交付：${idea.description.slice(0, 60)}...`,
      priority: 'critical',
      effort: 'large',
      isCore: true,
    },
    {
      id: generateId(),
      name: '数据持久化',
      description: '用户数据的保存、读取、同步',
      priority: 'high',
      effort: 'medium',
      isCore: true,
    },
  ]
  if (text.includes('搜索') || text.includes('查找')) {
    features.push({ id: generateId(), name: '搜索功能', description: '关键词检索核心数据', priority: 'medium', effort: 'medium', isCore: false })
  }
  if (text.includes('通知') || text.includes('提醒')) {
    features.push({ id: generateId(), name: '消息通知', description: '系统通知和用户提醒', priority: 'medium', effort: 'small', isCore: false })
  }
  if (text.includes('分享') || text.includes('协作') || text.includes('团队')) {
    features.push({ id: generateId(), name: '分享与协作', description: '内容分享链接、多人协作支持', priority: 'high', effort: 'large', isCore: true })
  }
  features.push({
    id: generateId(),
    name: '响应式 UI',
    description: '适配 PC 和移动端的响应式界面',
    priority: 'high',
    effort: 'medium',
    isCore: true,
  })
  return features
}

function generateV1Features(idea: Idea): Feature[] {
  const text = `${idea.title} ${idea.description}`.toLowerCase()
  const features: Feature[] = [
    { id: generateId(), name: '个人中心', description: '用户资料编辑、头像上传、偏好设置', priority: 'medium', effort: 'medium', isCore: false },
    { id: generateId(), name: '数据导出', description: '支持 CSV / PDF 导出用户数据', priority: 'medium', effort: 'small', isCore: false },
    { id: generateId(), name: '暗色模式', description: '深色/浅色主题切换', priority: 'low', effort: 'small', isCore: false },
    { id: generateId(), name: '操作历史/撤销', description: '关键操作的撤销和重做', priority: 'medium', effort: 'medium', isCore: false },
  ]
  if (text.includes('ai') || text.includes('智能') || text.includes('生成')) {
    features.push({ id: generateId(), name: 'AI 增强功能', description: '集成 AI 能力提升核心体验', priority: 'high', effort: 'large', isCore: false })
  }
  if (text.includes('数据') || text.includes('统计') || text.includes('分析')) {
    features.push({ id: generateId(), name: '数据仪表盘', description: '可视化统计和趋势分析', priority: 'medium', effort: 'large', isCore: false })
  }
  features.push({ id: generateId(), name: '第三方登录', description: '支持 Google / GitHub / 微信 OAuth 登录', priority: 'low', effort: 'small', isCore: false })
  return features
}

function generateFutureFeatures(): Feature[] {
  return [
    { id: generateId(), name: 'API 开放平台', description: '为第三方开发者提供 API 接入能力', priority: 'low', effort: 'large', isCore: false },
    { id: generateId(), name: '移动端 App', description: '基于 React Native 的原生移动应用', priority: 'medium', effort: 'large', isCore: false },
    { id: generateId(), name: 'AI 智能助手', description: '嵌入式 AI 助手提供个性化建议', priority: 'medium', effort: 'large', isCore: false },
    { id: generateId(), name: '国际化（i18n）', description: '多语言支持，进军海外市场', priority: 'low', effort: 'medium', isCore: false },
    { id: generateId(), name: '企业版功能', description: 'SSO、权限管理、审计日志等企业级能力', priority: 'low', effort: 'large', isCore: false },
  ]
}

function generateMonetization(type: ProductType): string[] {
  const models: Record<string, string[]> = {
    'saas': ['免费增值（Freemium）', '按月/年订阅制', '企业定制版', '用量计费'],
    'web-app': ['免费增值（Freemium）', '一次性买断', '广告收入（谨慎考虑）'],
    'mobile-app': ['免费 + 应用内购买', '订阅制', '一次性付费下载'],
    'api-service': ['按调用量计费', 'API 订阅套餐', '企业私有化部署'],
    'platform': ['平台抽佣', '广告投放', '增值服务订阅', '数据服务'],
    'tool': ['开源 + 商业许可', '一次性买断', 'Pro 订阅版'],
    'chrome-extension': ['免费增值', '一次性买断', 'Pro 订阅'],
    'mini-program': ['虚拟商品', '订阅制', '广告接入'],
    'desktop-app': ['买断制', '订阅制', '教育版优惠'],
    'other': ['订阅制', '免费增值'],
  }
  return models[type] || models['web-app']
}

export function analyzeProductShape(idea: Idea): ProductShape {
  const type = detectProductType(idea)
  return {
    type,
    platforms: detectPlatforms(type),
    targetUsers: detectTargetUsers(idea),
    corePainPoint: idea.problem || `用户在 ${idea.title} 相关场景中面临的核心痛点`,
    valueProposition: `通过 ${idea.title}，帮助 ${detectTargetUsers(idea)} 更高效地解决 ${idea.problem?.slice(0, 30) || '目标问题'}`,
    competitors: inferCompetitors(idea),
    differentiators: [
      '更简洁的用户体验，降低使用门槛',
      '专注细分场景，做深度垂直产品',
      '结合 AI 能力提升智能化水平',
      '更合理的定价策略',
    ],
  }
}

export function generateProductPlan(idea: Idea, shape: ProductShape): ProductPlan {
  const type = shape.type
  return {
    mvpFeatures: generateMvpFeatures(idea),
    v1Features: generateV1Features(idea),
    futureFeatures: generateFutureFeatures(),
    techStack: generateTechStack(type),
    timeline: '建议 MVP 开发周期：4-8 周（独立开发者）/ 2-4 周（2-3 人小团队）',
    estimatedDevTime: 'MVP: ~160 小时 | V1.0: ~320 小时 | 完整版: ~600+ 小时',
    monetization: generateMonetization(type),
    risks: [
      '市场验证不足，方向偏差风险',
      '竞品已占据用户心智，获客成本高',
      '技术复杂度超预期，工期延误',
      '核心功能难以与竞品形成差异化',
    ],
    successMetrics: [
      'MVP 发布后 30 天内获得 100 个真实用户',
      '用户 DAU/MAU > 40%（粘性指标）',
      'NPS（净推荐值）> 40',
      '付费转化率 > 5%（若有付费功能）',
      '月增长率 > 15%',
    ],
  }
}
