import { Link, useLocation } from 'react-router-dom'
import { Lightbulb, Layers, Settings, CheckCircle } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { isConfigured } = useSettingsStore()

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
