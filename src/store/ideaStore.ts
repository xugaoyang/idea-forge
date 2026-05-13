import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Idea, ProductShape, ProductPlan, GeneratedPage, IdeaStatus } from '../types'
import {
  fetchIdeasFromCloud,
  upsertIdeaToCloud,
  deleteIdeaFromCloud,
  upsertIdeasToCloud,
  mergeIdeas,
} from '../services/syncService'

type SyncStatus = 'idle' | 'syncing' | 'error'

interface IdeaStore {
  ideas: Idea[]
  syncStatus: SyncStatus
  lastSyncedAt: string | null

  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateIdea: (id: string, updates: Partial<Idea>) => void
  deleteIdea: (id: string) => void
  setProductShape: (id: string, shape: ProductShape) => void
  setProductPlan: (id: string, plan: ProductPlan) => void
  setGeneratedPage: (id: string, page: GeneratedPage) => void
  updateStatus: (id: string, status: IdeaStatus) => void

  // 云同步操作
  syncFromCloud: (userId: string) => Promise<void>
  pushLocalToCloud: (userId: string) => Promise<void>
}

export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set, get) => ({
      ideas: [],
      syncStatus: 'idle',
      lastSyncedAt: null,

      addIdea: (idea) => {
        const id = `idea_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const now = new Date().toISOString()
        const newIdea: Idea = { ...idea, id, createdAt: now, updatedAt: now }
        set((state) => ({ ideas: [newIdea, ...state.ideas] }))
        // 异步同步，不阻塞 UI
        const userId = getCurrentUserId()
        if (userId) upsertIdeaToCloud(newIdea, userId).catch(() => {})
        return id
      },

      updateIdea: (id, updates) => {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id ? { ...idea, ...updates, updatedAt: new Date().toISOString() } : idea
          ),
        }))
        const updated = get().ideas.find((i) => i.id === id)
        const userId = getCurrentUserId()
        if (updated && userId) upsertIdeaToCloud(updated, userId).catch(() => {})
      },

      deleteIdea: (id) => {
        set((state) => ({ ideas: state.ideas.filter((idea) => idea.id !== id) }))
        const userId = getCurrentUserId()
        if (userId) deleteIdeaFromCloud(id).catch(() => {})
      },

      setProductShape: (id, shape) => {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id
              ? { ...idea, productShape: shape, status: idea.status === 'draft' ? 'analyzing' : idea.status, updatedAt: new Date().toISOString() }
              : idea
          ),
        }))
        const updated = get().ideas.find((i) => i.id === id)
        const userId = getCurrentUserId()
        if (updated && userId) upsertIdeaToCloud(updated, userId).catch(() => {})
      },

      setProductPlan: (id, plan) => {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id
              ? { ...idea, productPlan: plan, status: 'planned', updatedAt: new Date().toISOString() }
              : idea
          ),
        }))
        const updated = get().ideas.find((i) => i.id === id)
        const userId = getCurrentUserId()
        if (updated && userId) upsertIdeaToCloud(updated, userId).catch(() => {})
      },

      setGeneratedPage: (id, page) => {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id ? { ...idea, generatedPage: page, updatedAt: new Date().toISOString() } : idea
          ),
        }))
        const updated = get().ideas.find((i) => i.id === id)
        const userId = getCurrentUserId()
        if (updated && userId) upsertIdeaToCloud(updated, userId).catch(() => {})
      },

      updateStatus: (id, status) => {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id ? { ...idea, status, updatedAt: new Date().toISOString() } : idea
          ),
        }))
        const updated = get().ideas.find((i) => i.id === id)
        const userId = getCurrentUserId()
        if (updated && userId) upsertIdeaToCloud(updated, userId).catch(() => {})
      },

      // 登录后从云端拉取并与本地合并
      syncFromCloud: async (userId) => {
        set({ syncStatus: 'syncing' })
        try {
          const remote = await fetchIdeasFromCloud()
          const local = get().ideas
          const merged = mergeIdeas(local, remote)
          set({ ideas: merged, syncStatus: 'idle', lastSyncedAt: new Date().toISOString() })
          // 把本地有但云端没有的也推上去
          await upsertIdeasToCloud(merged, userId)
        } catch (e) {
          console.error('[sync] 云端同步失败:', e)
          set({ syncStatus: 'error' })
        }
      },

      // 手动将本地全量推送到云端
      pushLocalToCloud: async (userId) => {
        set({ syncStatus: 'syncing' })
        try {
          await upsertIdeasToCloud(get().ideas, userId)
          set({ syncStatus: 'idle', lastSyncedAt: new Date().toISOString() })
        } catch {
          set({ syncStatus: 'error' })
        }
      },
    }),
    { name: 'idea-forge-storage' }
  )
)

// 从 Supabase session 获取当前用户 ID（同步读取，避免循环依赖）
function getCurrentUserId(): string | null {
  try {
    // supabase-js 将 session 存于 localStorage，key 格式固定
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (!keys.length) return null
    const raw = localStorage.getItem(keys[0])
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.user?.id ?? null
  } catch {
    return null
  }
}
