export type IdeaStatus = 'draft' | 'analyzing' | 'planned' | 'developing' | 'completed' | 'archived'

export type ProductType =
  | 'web-app'
  | 'mobile-app'
  | 'desktop-app'
  | 'api-service'
  | 'saas'
  | 'tool'
  | 'platform'
  | 'chrome-extension'
  | 'mini-program'
  | 'other'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export interface ProductShape {
  type: ProductType
  platforms: string[]
  targetUsers: string
  corePainPoint: string
  valueProposition: string
  competitors: string[]
  differentiators: string[]
}

export interface Feature {
  id: string
  name: string
  description: string
  priority: Priority
  effort: 'small' | 'medium' | 'large'
  isCore: boolean
}

export interface TechStack {
  frontend: string[]
  backend: string[]
  database: string[]
  infra: string[]
  thirdParty: string[]
}

export interface ProductPlan {
  mvpFeatures: Feature[]
  v1Features: Feature[]
  futureFeatures: Feature[]
  techStack: TechStack
  timeline: string
  estimatedDevTime: string
  monetization: string[]
  risks: string[]
  successMetrics: string[]
}

export interface GeneratedPage {
  html: string
  generatedAt: string
  version: number
}

export interface IdeaExpansion {
  description: string
  problem: string
  tags: string[]
}

export interface Idea {
  id: string
  title: string
  description: string
  problem: string
  tags: string[]
  status: IdeaStatus
  priority: Priority
  productShape?: ProductShape
  productPlan?: ProductPlan
  generatedPage?: GeneratedPage
  createdAt: string
  updatedAt: string
  notes: string
}
