import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { IdeaDetailPage } from './pages/IdeaDetailPage'
import { ProductShapePage } from './pages/ProductShapePage'
import { ProductPlanPage } from './pages/ProductPlanPage'
import { WebpageGeneratePage } from './pages/WebpageGeneratePage'
import { SettingsPage } from './pages/SettingsPage'
import { AuthPage } from './pages/AuthPage'
import { useAuthStore } from './store/authStore'
import { useIdeaStore } from './store/ideaStore'
import { isSupabaseConfigured } from './lib/supabase'
import { REVIEW_MODE } from './config/site'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()

  // 公安审核期间临时开放访问
  if (REVIEW_MODE) return <>{children}</>

  // Supabase 未配置时放行（本地模式）
  if (!isSupabaseConfigured()) return <>{children}</>

  // 初始化中显示占位
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <div className="w-8 h-8 rounded-lg bg-brand-600 animate-pulse" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, init } = useAuthStore()
  const { syncFromCloud } = useIdeaStore()

  // 初始化 Supabase session 监听
  useEffect(() => {
    init()
  }, [init])

  // 登录后从云端同步数据
  useEffect(() => {
    if (user?.id) {
      syncFromCloud(user.id)
    }
  }, [user?.id, syncFromCloud])

  return (
    <Routes>
      {/* 审核模式或已登录时访问 /auth 直接跳首页 */}
      <Route path="/auth" element={REVIEW_MODE || user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/*"
        element={
          <AuthGuard>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/idea/:id" element={<IdeaDetailPage />} />
                <Route path="/idea/:id/shape" element={<ProductShapePage />} />
                <Route path="/idea/:id/plan" element={<ProductPlanPage />} />
                <Route path="/idea/:id/webpage" element={<WebpageGeneratePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </AuthGuard>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
