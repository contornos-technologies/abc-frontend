import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login as loginService } from '../../services/authService'
import PublicLayout from '../../components/public/PublicLayout'
import loginIllustration from '../../assets/login-illustration.png'
import loginMobileIllustration from '../../assets/login-mobile-Illustration.png'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    identifier: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errors = { identifier: '', password: '' }
    if (!identifier) errors.identifier = 'O email ou telefone é obrigatório.'
    if (!password) errors.password = 'A senha é obrigatória.'
    else if (password.length < 6)
      errors.password = 'A senha deve ter pelo menos 6 caracteres.'

    setFieldErrors(errors)
    if (errors.identifier || errors.password) return

    setLoading(true)
    try {
      const data = await loginService({ identifier, password })

      const payload = JSON.parse(atob(data.token.split('.')[1]))
      const userInfo = data.user || payload

      if (userInfo.role === 'ADMIN') {
        setError('Acesso não permitido. Use o portal administrativo.')
        return
      }

      login(data.token, userInfo)
      navigate('/student/profile')
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.error || err.response?.data?.message || ''

      if (status === 401) {
        setError(
          'Email/telefone ou senha incorrectos. Verifica os teus dados e tenta novamente.'
        )
      } else if (status === 404) {
        setError(
          'Não encontrámos nenhuma conta com estes dados. Verifica ou cria uma conta nova.'
        )
      } else if (status === 429) {
        setError(
          'Demasiadas tentativas. Aguarda alguns minutos e tenta novamente.'
        )
      } else if (!navigator.onLine) {
        setError(
          'Sem ligação à internet. Verifica a tua rede e tenta novamente.'
        )
      } else {
        setError(msg || 'Erro ao fazer login. Tenta novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
        {/* ── MOBILE (abaixo de md) ─────────────────────────── */}
        <div className="md:hidden" style={{ paddingTop: '80px' }}>
          <div className="px-6 pt-4 pb-10 w-full max-w-sm mx-auto">
            {/* Ilustração mobile */}
            <div className="flex justify-center mb-6">
              <img
                src={loginMobileIllustration}
                alt="Ilustração de login"
                className="w-80 h-auto object-contain"
              />
            </div>

            <div className="mb-7  text-center">
              <h2
                className="font-bold text-[24px] mb-1.5"
                style={{ color: '#0A3956' }}
              >
                Bem-vindo de volta
              </h2>
              <p className="text-[14px]" style={{ color: '#6C757D' }}>
                Acede à tua conta para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="identifier-mobile"
                  className="block mb-3 text-[13px] font-medium"
                  style={{ color: '#0A3956' }}
                >
                  Email ou Telefone
                </label>
                <input
                  type="text"
                  id="identifier-mobile"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    setFieldErrors((prev) => ({ ...prev, identifier: '' }))
                  }}
                  placeholder="seu@email.com ou número de telefone"
                  autoComplete="username"
                  className={`w-full px-4 py-3.5 text-[14px] border rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF] ${
                    fieldErrors.identifier
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  style={{ fontSize: '16px' }}
                />
                {fieldErrors.identifier && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {fieldErrors.identifier}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password-mobile"
                  className="block mb-3 text-[13px] font-medium"
                  style={{ color: '#0A3956' }}
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password-mobile"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setFieldErrors((prev) => ({ ...prev, password: '' }))
                    }}
                    placeholder="••••••••"
                    className={`w-full px-4 pr-12 py-3.5 text-[14px] border rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF] ${
                      fieldErrors.password
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    style={{ fontSize: '16px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 touch-manipulation"
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={20} style={{ color: '#9CA3AF' }} />
                    ) : (
                      <Eye size={20} style={{ color: '#9CA3AF' }} />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center  mt-3">
                <input
                  type="checkbox"
                  id="remember-mobile"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#F69220' }}
                />
                <label
                  htmlFor="remember-mobile"
                  className="ml-2 text-[13px] select-none"
                  style={{ color: '#6C757D' }}
                >
                  Lembrar-me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-[18px] rounded-2xl font-semibold text-[16px] text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 touch-manipulation"
                style={{ backgroundColor: '#F69220' }}
              >
                {loading ? 'A entrar...' : 'Entrar'}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3.5 text-[13px] text-center leading-relaxed">
                  {error}
                </div>
              )}
            </form>

            <div className="text-center mt-7">
              <span className="text-[13px]" style={{ color: '#6C757D' }}>
                Não tens conta?
              </span>
              <Link
                to="/signup"
                className="ml-1 text-[13px] font-semibold hover:underline"
                style={{ color: '#F69220' }}
              >
                Criar conta
              </Link>
            </div>
          </div>
        </div>

        {/* ── TABLET (md até lg) ──────────────────────────────────── */}
        <div
          className="hidden md:flex lg:hidden items-center justify-center bg-white py-16"
          style={{ paddingTop: '120px' }}
        >
          <div className="w-full max-w-4xl mx-auto pl-8 pr-14 flex items-center gap-2 ">
            {/* LADO ESQUERDO — ilustração */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              <img
                src={loginIllustration}
                alt="Ilustração de login"
                className="w-full max-w-[350px] object-contain -ml-20"
              />
            </div>

            {/* LADO DIREITO — formulário */}
            <div className="flex-shrink-0 w-[320px] flex flex-col justify-center  ">
              <div className="mb-8">
                <h2
                  className="font-bold text-[24px] mb-2"
                  style={{ color: '#0A3956' }}
                >
                  Bem-vindo de volta
                </h2>
                <p className="text-[14px]" style={{ color: '#6C757D' }}>
                  Acede à tua conta para continuar
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="identifier-tablet"
                    className="block mb-1.5 text-[13px] font-medium"
                    style={{ color: '#0A3956' }}
                  >
                    Email ou Telefone
                  </label>
                  <input
                    type="text"
                    id="identifier-tablet"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value)
                      setFieldErrors((prev) => ({ ...prev, identifier: '' }))
                    }}
                    placeholder="seu@email.com ou número de telefone"
                    autoComplete="username"
                    className={`w-full px-4 py-3 text-[14px] border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF] ${
                      fieldErrors.identifier
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {fieldErrors.identifier && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.identifier}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password-tablet"
                    className="block mb-1.5 text-[13px] font-medium"
                    style={{ color: '#0A3956' }}
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password-tablet"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setFieldErrors((prev) => ({ ...prev, password: '' }))
                      }}
                      placeholder="••••••••"
                      className={`w-full px-4 pr-12 py-3 text-[14px] border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF] ${
                        fieldErrors.password
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4"
                      aria-label={
                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} style={{ color: '#9CA3AF' }} />
                      ) : (
                        <Eye size={18} style={{ color: '#9CA3AF' }} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-tablet"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#F69220' }}
                  />
                  <label
                    htmlFor="remember-tablet"
                    className="ml-2 text-[13px] select-none"
                    style={{ color: '#6C757D' }}
                  >
                    Lembrar-me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: '#F69220' }}
                >
                  {loading ? 'A entrar...' : 'Entrar'}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3.5 text-[13px] text-center leading-relaxed">
                    {error}
                  </div>
                )}
              </form>

              <div className="text-center mt-6">
                <span className="text-[13px]" style={{ color: '#6C757D' }}>
                  Não tens conta?
                </span>
                <Link
                  to="/signup"
                  className="ml-1 text-[13px] font-semibold hover:underline"
                  style={{ color: '#F69220' }}
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── DESKTOP (lg para cima) ──────────────────────────────────── */}
        <div
          className="hidden lg:flex items-center justify-center min-h-screen bg-white"
          style={{ paddingTop: '80px' }}
        >
          <div className="w-full max-w-6xl mx-auto px-12 flex items-center gap-16">
            {/* LADO ESQUERDO — só a ilustração */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              <img
                src={loginIllustration}
                alt="Ilustração de login"
                className="w-full object-contain -ml-44 scale-110"
              />
            </div>

            {/* LADO DIREITO — só o formulário */}
            <div className="flex-1 flex flex-col justify-center min-w-0 ml-6">
              <div className="mb-8">
                <h2
                  className="font-bold text-[28px] mb-2"
                  style={{ color: '#0A3956' }}
                >
                  Bem-vindo de volta
                </h2>
                <p className="text-[15px]" style={{ color: '#6C757D' }}>
                  Acede à tua conta para continuar
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="identifier"
                    className="block mb-1.5 text-[13px] font-medium"
                    style={{ color: '#0A3956' }}
                  >
                    Email ou Telefone
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value)
                      setFieldErrors((prev) => ({ ...prev, identifier: '' }))
                    }}
                    placeholder="seu@email.com ou número de telefone"
                    autoComplete="username"
                    className={`w-full px-4 py-3 text-[14px] border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF] ${
                      fieldErrors.identifier
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {fieldErrors.identifier && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.identifier}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block mb-1.5 text-[13px] font-medium"
                    style={{ color: '#0A3956' }}
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setFieldErrors((prev) => ({ ...prev, password: '' }))
                      }}
                      placeholder="••••••••"
                      className={`w-full px-4 pr-12 py-3 text-[14px] border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF] ${
                        fieldErrors.password
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4"
                      aria-label={
                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} style={{ color: '#9CA3AF' }} />
                      ) : (
                        <Eye size={18} style={{ color: '#9CA3AF' }} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#F69220' }}
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-[13px] select-none"
                    style={{ color: '#6C757D' }}
                  >
                    Lembrar-me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: '#F69220' }}
                >
                  {loading ? 'A entrar...' : 'Entrar'}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3.5 text-[13px] text-center leading-relaxed">
                    {error}
                  </div>
                )}
              </form>

              <div className="text-center mt-6">
                <span className="text-[13px]" style={{ color: '#6C757D' }}>
                  Não tens conta?
                </span>
                <Link
                  to="/signup"
                  className="ml-1 text-[13px] font-semibold hover:underline"
                  style={{ color: '#F69220' }}
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
