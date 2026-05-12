import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Idea, ProductShape, ProductPlan, IdeaStatus } from '../types'

interface IdeaStore {
  ideas: Idea[]
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateIdea: (id: string, updates: Partial<Idea>) => void
  deleteIdea: (id: string) => void
  setProductShape: (id: string, shape: ProductShape) => void
  setProductPlan: (id: string, plan: ProductPlan) => void
  updateStatus: (id: string, status: IdeaStatus) => void
}

export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set) => ({
      ideas: [],

      addIdea: (idea) => {
        const id = `idea_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const now = new Date().toISOString()
        set((state) => ({
          ideas: [
            {
              ...idea,
              id,
              createdAt: now,
              updatedAt: now,
            },
            ...state.ideas,
          ],
        }))
        return id
      },

      updateIdea: (id, updates) => {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id
              ? { ...idea, ...updates, updatedAt: new Date().toISOString() }
              : idea
          ),
        }))
      },

      deleteIdea: (id) => {
        set((state) => ({
          ideas: state.ideas.filter((idea) => idea.id !== id),
        }))
      },

      setProductShape: (id, shape) => {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id
              ? {
                  ...idea,
                  productShape: shape,
                  status: idea.status === 'draft' ? 'analyzing' : idea.status,
                  updatedAt: new Date().toISOString(),
                }
              : idea
          ),
        }))
      },

      setProductPlan: (id, plan) => {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id
              ? {
                  ...idea,
                  productPlan: plan,
                  status: 'planned',
                  updatedAt: new Date().toISOString(),
                }
              : idea
          ),
        }))
      },

      updateStatus: (id, status) => {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id
              ? { ...idea, status, updatedAt: new Date().toISOString() }
              : idea
          ),
        }))
      },
    }),
    {
      name: 'idea-forge-storage',
    }
  )
)
