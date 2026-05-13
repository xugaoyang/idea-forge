import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lightbulb, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { isSupabaseConfigured } from '../lib/supabase'

type Mode = 'login' | 'register'

export function AuthPage() {
  const { signIn, signUp, loading } = useAuthStore()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const configured = isSupabaseConfigured()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setError(null)
    setNotice(null)

    if (mode === 'login') {
      const err = await signIn(email.trim(), password)
      if (err) {
        setError(translateError(err))
      } else {
        navigate('/', { replace: true })
      }
    } else {
      const err = await signUp(email.trim(), password)
      if (err) {
        setError(translateError(err))
      } else {
        setNotice('注册成功！请检查邮箱并点击验证链接，验证后即可登录。')
        setMode('login')
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1117] px-4">
      {/* 品牌 Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
          <Lightbulb size={20} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-xl leading-tight">IdeaForge</div>
          <div className="text-slate-500 text-xs">把你的想法锻造成产品</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Tab 切换 */}
        <div className="flex border-b border-slate-800">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setNotice(null) }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                mode === m
                  ? 'text-white border-b-2 border-brand-500'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {m === 'login' ? '登录' : '注册账号'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!configured && (
            <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-800/40 rounded-xl px-3 py-2.5 text-xs text-amber-300">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>未检测到 Supabase 配置，请先在 <code className="font-mono">.env.local</code> 中填写项目地址和 Key。</span>
            </div>
          )}

          {notice && (
            <div className="flex items-start gap-2 bg-emerald-900/20 border border-emerald-800/40 rounded-xl px-3 py-2.5 text-xs text-emerald-300">
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
              {notice}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-900/20 border border-red-800/40 rounded-xl px-3 py-2.5 text-xs text-red-300">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* 邮箱 */}
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* 密码 */}
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'register' ? '设置密码（至少 6 位）' : '密码'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !configured || !email.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors mt-2"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" />处理中...</>
              : mode === 'login' ? '登录' : '注册并开始使用'
            }
          </button>

          {mode === 'login' && (
            <p className="text-center text-xs text-slate-600">
              还没有账号？
              <button type="button" onClick={() => { setMode('register'); setError(null) }} className="text-brand-400 hover:text-brand-300 ml-1">
                立即注册
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p className="text-center text-xs text-slate-600">
              已有账号？
              <button type="button" onClick={() => { setMode('login'); setError(null) }} className="text-brand-400 hover:text-brand-300 ml-1">
                直接登录
              </button>
            </p>
          )}
        </form>
      </div>

      <p className="text-xs text-slate-700 mt-6 text-center max-w-xs">
        数据加密存储于 Supabase 云端，仅你自己可见。
      </p>
    </div>
  )
}

// 将英文错误转为中文提示
function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return '邮箱或密码错误，请重试'
  if (msg.includes('Email not confirmed')) return '邮箱尚未验证，请查收验证邮件后再登录'
  if (msg.includes('User already registered')) return '该邮箱已注册，请直接登录'
  if (msg.includes('Password should be at least')) return '密码至少需要 6 位字符'
  if (msg.includes('Unable to validate email')) return '邮箱格式不正确'
  if (msg.includes('Network')) return '网络连接失败，请检查网络后重试'
  return msg
}
