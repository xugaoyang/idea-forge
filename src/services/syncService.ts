import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Idea } from '../types'

// Supabase 行结构（snake_case）
interface IdeaRow {
  id: string
  user_id: string
  title: string
  description: string
  problem: string
  tags: string[]
  status: string
  priority: string
  product_shape: Idea['productShape'] | null
  product_plan: Idea['productPlan'] | null
  generated_page: Idea['generatedPage'] | null
  notes: string
  created_at: string
  updated_at: string
}

function toRow(idea: Idea, userId: string): Omit<IdeaRow, 'user_id'> & { user_id: string } {
  return {
    id: idea.id,
    user_id: userId,
    title: idea.title,
    description: idea.description,
    problem: idea.problem,
    tags: idea.tags,
    status: idea.status,
    priority: idea.priority,
    product_shape: idea.productShape ?? null,
    product_plan: idea.productPlan ?? null,
    generated_page: idea.generatedPage ?? null,
    notes: idea.notes,
    created_at: idea.createdAt,
    updated_at: idea.updatedAt,
  }
}

function fromRow(row: IdeaRow): Idea {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    problem: row.problem,
    tags: row.tags ?? [],
    status: row.status as Idea['status'],
    priority: row.priority as Idea['priority'],
    productShape: row.product_shape ?? undefined,
    productPlan: row.product_plan ?? undefined,
    generatedPage: row.generated_page ?? undefined,
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// 从云端拉取当前用户的所有想法
export async function fetchIdeasFromCloud(): Promise<Idea[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(`云端同步失败：${error.message}`)
  return (data as IdeaRow[]).map(fromRow)
}

// 单条写入（新增或更新）
export async function upsertIdeaToCloud(idea: Idea, userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('ideas').upsert(toRow(idea, userId))
  if (error) console.error('[sync] upsert 失败:', error.message)
}

// 批量写入（登录后将本地数据推送到云端）
export async function upsertIdeasToCloud(ideas: Idea[], userId: string): Promise<void> {
  if (!isSupabaseConfigured() || ideas.length === 0) return
  const rows = ideas.map((idea) => toRow(idea, userId))
  const { error } = await supabase.from('ideas').upsert(rows)
  if (error) console.error('[sync] 批量 upsert 失败:', error.message)
}

// 删除云端单条
export async function deleteIdeaFromCloud(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('ideas').delete().eq('id', id)
  if (error) console.error('[sync] 删除失败:', error.message)
}

// 合并策略：以 updatedAt 最新的为准，本地与云端取并集
export function mergeIdeas(local: Idea[], remote: Idea[]): Idea[] {
  const map = new Map<string, Idea>()
  for (const idea of [...local, ...remote]) {
    const existing = map.get(idea.id)
    if (!existing || idea.updatedAt > existing.updatedAt) {
      map.set(idea.id, idea)
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}
