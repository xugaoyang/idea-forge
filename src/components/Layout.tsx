import { Link, useLocation } from 'react-router-dom'
import { Lightbulb, Layers, Settings, CheckCircle, LogOut, Cloud, CloudOff, Loader2 } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useAuthStore } from '../store/authStore'
import { useIdeaStore } from '../store/ideaStore'
import { isSupabaseConfigured } from '../lib/supabase'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { isConfigured } = useSettingsStore()
  const { user, signOut } = useAuthStore()
  const { syncStatus, lastSyncedAt } = useIdeaStore()

  const supabaseReady = isSupabaseConfigured()

  const SyncIndicator = () => {
    if (!supabaseReady || !user) return null
    if (syncStatus === 'syncing') {
      return (
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Loader2 size={11} className="animate-spin" />
          <span className="hidden sm:block">同步中</span>
        </span>
      )
    }
    if (syncStatus === 'error') {
      return (
        <span title="同步失败" className="flex items-center gap-1 text-xs text-red-500">
          <CloudOff size={13} />
        </span>
      )
    }
    return (
      <span
        title={lastSyncedAt ? `上次同步：${new Date(lastSyncedAt).toLocaleTimeString('zh-CN')}` : '已连接云端'}
        className="flex items-center gap-1 text-xs text-emerald-500"
      >
        <Cloud size={13} />
        <span className="hidden sm:block">已同步</span>
      </span>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0f1117]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
              <Lightbulb size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">IdeaForge</span>
            <span className="text-slate-500 text-sm hidden sm:block">· 想法 → 产品</span>
          </Link>

          <nav className="flex items-center gap-1">
            <SyncIndicator />

            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Lightbulb size={15} />
              <span className="hidden sm:block">我的想法</span>
            </Link>

            <Link
              to="/settings"
              title="AI 设置"
              className={`relative p-2 rounded-lg transition-colors ${
                location.pathname === '/settings'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Settings size={16} />
              {isConfigured() && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border border-[#0f1117]" />
              )}
            </Link>

            {user && (
              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-800">
                <span
                  title={user.email}
                  className="w-7 h-7 rounded-full bg-brand-700 border border-brand-600 flex items-center justify-center text-xs font-semibold text-white cursor-default"
                >
                  {user.email?.[0].toUpperCase() ?? 'U'}
                </span>
                <button
                  onClick={signOut}
                  title="退出登录"
                  className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-800 py-4 text-center text-slate-600 text-xs">
        <div className="flex items-center justify-center gap-2">
          <Layers size={12} />
          <span>IdeaForge · 把你的想法锻造成产品</span>
          {isConfigured() && (
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle size={11} />AI 已就绪
            </span>
          )}
        </div>
      </footer>
    </div>
  )
}
