import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AISettings } from '../types/ai'

interface SettingsStore {
  aiSettings: AISettings
  updateAISettings: (settings: Partial<AISettings>) => void
  isConfigured: () => boolean
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      aiSettings: {
        provider: 'zhipu',
        modelId: 'glm-4-flash',
        apiKey: '',
        customBaseUrl: '',
        customModelId: '',
        temperature: 0.7,
      },

      updateAISettings: (settings) => {
        set((state) => ({
          aiSettings: { ...state.aiSettings, ...settings },
        }))
      },

      isConfigured: () => {
        const { apiKey } = get().aiSettings
        return apiKey.trim().length > 0
      },
    }),
    {
      name: 'idea-forge-settings',
    }
  )
)
