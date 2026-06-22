import { useState } from 'react'
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../../services/authService'
import api from '../../services/api'
import PublicLayout from '../../components/public/PublicLayout'
import loginIllustration from '../../assets/login-illustration.png'
import loginMobileIllustration from '../../assets/login-mobile-Illustration.png'

export default function Signup() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bi: '',
    password: '',
    confirmPassword: '',
  })

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    bi: false,
    password: false,
    confirmPassword: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const validateFullName = (name) => name.trim().length >= 3
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePhone = (phone) => phone.replace(/\D/g, '').length >= 9
  const validateBI = (bi) => /^\d{9}[A-Z]{2}\d{3}$/.test(bi)

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 0
    let strength = 1
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    if (hasUpperCase && (hasNumber || hasSpecial)) strength = 2
    if (hasUpperCase && hasNumber && hasSpecial && password.length >= 8)
      strength = 3
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword

  const isFormValid =
    validateFullName(formData.fullName) &&
    validateEmail(formData.email) &&
    validatePhone(formData.phone) &&
    validateBI(formData.bi) &&
    passwordStrength >= 1 &&
    passwordsMatch &&
    acceptTerms

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }))
  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: `+244${formData.phone.replace(/\D/g, '')}`,
        bi: formData.bi,
      })

      const attemptId = localStorage.getItem('abc_attempt_id')
      if (attemptId) {
        try {
          await api.patch(`/simulations/attempts/${attemptId}/claim`)
        } catch {
          /* ignorar — não bloquear o signup */
        } finally {
          localStorage.removeItem('abc_attempt_id')
        }
      }

      setSuccess('Conta criada com sucesso! A redirecionar...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || ''

      if (msg.toLowerCase().includes('email')) {
        setError(
          'Este email já está registado. Tenta fazer login ou usa outro email.'
        )
      } else if (msg.toLowerCase().includes('bi')) {
        setError('Este Bilhete de Identidade já está registado.')
      } else if (
        msg.toLowerCase().includes('telefone') ||
        msg.toLowerCase().includes('phone')
      ) {
        setError('Este número de telefone já está registado.')
      } else {
        setError(msg || 'Erro ao criar conta. Tenta novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  /* ── Campos reutilizáveis ─────────────────────────────────────────── */

  // Estilos de input por breakpoint
  const inputClassMobile = (hasError) =>
    `w-full px-4 py-3.5 text-[14px] border rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF] ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
    }`

  const inputClassDesktop = (hasError) =>
    `w-full px-4 py-3 text-[14px] border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF] ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
    }`

  // Indicador de força da senha
  const PasswordStrengthBar = () => (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className="h-1 flex-1 rounded transition-all duration-300"
            style={{
              backgroundColor:
                passwordStrength >= level
                  ? passwordStrength === 1
                    ? '#DC3545'
                    : passwordStrength === 2
                      ? '#FFC107'
                      : '#28A745'
                  : '#E5E7EB',
            }}
          />
        ))}
      </div>
      <p
        className="text-xs"
        style={{
          color:
            passwordStrength === 1
              ? '#DC3545'
              : passwordStrength === 2
                ? '#FFC107'
                : '#28A745',
        }}
      >
        {passwordStrength === 1
          ? 'Senha fraca'
          : passwordStrength === 2
            ? 'Senha média'
            : 'Senha forte'}
      </p>
    </div>
  )

  /* ── Blocos de formulário por breakpoint ──────────────────────────── */

  const renderForm = (variant) => {
    const isMobile = variant === 'mobile'
    const inputClass = isMobile ? inputClassMobile : inputClassDesktop
    const labelClass = `block mb-${isMobile ? '3' : '1.5'} text-[13px] font-medium`
    const rounded = isMobile ? 'rounded-2xl' : 'rounded-xl'
    const py = isMobile ? 'py-[18px]' : 'py-3.5'
    const suffix = isMobile ? '-mobile' : variant === 'tablet' ? '-tablet' : ''

    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome Completo */}
        <div>
          <label
            htmlFor={`fullName${suffix}`}
            className={labelClass}
            style={{ color: '#0A3956' }}
          >
            Nome Completo
          </label>
          <input
            type="text"
            id={`fullName${suffix}`}
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            placeholder="João Manuel Silva"
            autoComplete="name"
            className={inputClass(
              touched.fullName && !validateFullName(formData.fullName)
            )}
            style={{ fontSize: isMobile ? '16px' : undefined }}
          />
          {touched.fullName && !validateFullName(formData.fullName) && (
            <p className="text-red-500 text-xs mt-1.5">
              O nome deve ter pelo menos 3 caracteres.
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor={`email${suffix}`}
            className={labelClass}
            style={{ color: '#0A3956' }}
          >
            Email
          </label>
          <input
            type="email"
            id={`email${suffix}`}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="joao@email.com"
            autoComplete="email"
            className={inputClass(
              touched.email && !validateEmail(formData.email)
            )}
            style={{ fontSize: isMobile ? '16px' : undefined }}
          />
          {touched.email && !validateEmail(formData.email) && (
            <p className="text-red-500 text-xs mt-1.5">
              Formato de email inválido.
            </p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label
            htmlFor={`phone${suffix}`}
            className={labelClass}
            style={{ color: '#0A3956' }}
          >
            Telefone
          </label>
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] select-none pointer-events-none"
              style={{ color: '#6C757D' }}
            >
              +244
            </span>
            <input
              type="tel"
              id={`phone${suffix}`}
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="900 000 000"
              autoComplete="tel"
              className={`${inputClass(touched.phone && !validatePhone(formData.phone))} pl-14`}
              style={{ fontSize: isMobile ? '16px' : undefined }}
            />
          </div>
          {touched.phone && !validatePhone(formData.phone) && (
            <p className="text-red-500 text-xs mt-1.5">
              O telefone deve ter pelo menos 9 dígitos.
            </p>
          )}
        </div>

        {/* Bilhete de Identidade */}
        <div>
          <label
            htmlFor={`bi${suffix}`}
            className={labelClass}
            style={{ color: '#0A3956' }}
          >
            Bilhete de Identidade (BI)
          </label>
          <div className="relative">
            <input
              type="text"
              id={`bi${suffix}`}
              value={formData.bi}
              onChange={(e) => handleChange('bi', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('bi')}
              placeholder="123456789LA045"
              maxLength={14}
              autoComplete="off"
              className={`${inputClass(
                formData.bi ? !validateBI(formData.bi) : false
              )} pr-12`}
              style={{
                fontSize: isMobile ? '16px' : undefined,
                borderColor: formData.bi
                  ? validateBI(formData.bi)
                    ? '#28A745'
                    : '#DC3545'
                  : undefined,
              }}
            />
            {formData.bi && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {validateBI(formData.bi) ? (
                  <CheckCircle
                    className="w-5 h-5"
                    style={{ color: '#28A745' }}
                  />
                ) : (
                  <XCircle className="w-5 h-5" style={{ color: '#DC3545' }} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Senha */}
        <div>
          <label
            htmlFor={`password${suffix}`}
            className={labelClass}
            style={{ color: '#0A3956' }}
          >
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id={`password${suffix}`}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`${inputClass(false)} pr-12`}
              style={{ fontSize: isMobile ? '16px' : undefined }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 touch-manipulation"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <EyeOff
                  size={isMobile ? 20 : 18}
                  style={{ color: '#9CA3AF' }}
                />
              ) : (
                <Eye size={isMobile ? 20 : 18} style={{ color: '#9CA3AF' }} />
              )}
            </button>
          </div>
          {formData.password && <PasswordStrengthBar />}
        </div>

        {/* Confirmar Senha */}
        <div>
          <label
            htmlFor={`confirmPassword${suffix}`}
            className={labelClass}
            style={{ color: '#0A3956' }}
          >
            Confirmar Senha
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id={`confirmPassword${suffix}`}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`${inputClass(
                touched.confirmPassword &&
                  formData.confirmPassword &&
                  !passwordsMatch
              )} pr-20`}
              style={{
                fontSize: isMobile ? '16px' : undefined,
                borderColor: formData.confirmPassword
                  ? passwordsMatch
                    ? '#28A745'
                    : '#DC3545'
                  : undefined,
              }}
            />
            {/* Ícone check/x */}
            {formData.confirmPassword && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                {passwordsMatch ? (
                  <CheckCircle
                    className="w-5 h-5"
                    style={{ color: '#28A745' }}
                  />
                ) : (
                  <XCircle className="w-5 h-5" style={{ color: '#DC3545' }} />
                )}
              </div>
            )}
            {/* Botão mostrar/ocultar */}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 touch-manipulation"
              aria-label={
                showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
              }
            >
              {showConfirmPassword ? (
                <EyeOff
                  size={isMobile ? 20 : 18}
                  style={{ color: '#9CA3AF' }}
                />
              ) : (
                <Eye size={isMobile ? 20 : 18} style={{ color: '#9CA3AF' }} />
              )}
            </button>
          </div>
          {touched.confirmPassword &&
            formData.confirmPassword &&
            !passwordsMatch && (
              <p className="text-red-500 text-xs mt-1.5">
                As senhas não coincidem.
              </p>
            )}
        </div>

        {/* Termos */}
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id={`terms${suffix}`}
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 cursor-pointer"
            style={{ accentColor: '#F69220' }}
          />
          <label
            htmlFor={`terms${suffix}`}
            className="text-[13px] cursor-pointer select-none"
            style={{ color: '#6C757D' }}
          >
            Li e aceito os{' '}
            <a
              href="/termos"
              className="font-semibold hover:underline"
              style={{ color: '#F69220' }}
            >
              Termos e Condições
            </a>
          </label>
        </div>

        {/* Botão */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full ${py} ${rounded} font-semibold text-[16px] text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 touch-manipulation`}
          style={{ backgroundColor: '#F69220' }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              A criar conta...
            </span>
          ) : (
            'Criar Conta'
          )}
        </button>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3.5 text-[13px] text-center leading-relaxed">
            {error}
          </div>
        )}

        {/* Sucesso */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl p-3.5 text-[13px] text-center leading-relaxed">
            {success}
          </div>
        )}
      </form>
    )
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
                alt="Ilustração de registo"
                className="w-80 h-auto object-contain"
              />
            </div>

            <div className="mb-7 text-center">
              <h2
                className="font-bold text-[24px] mb-1.5"
                style={{ color: '#0A3956' }}
              >
                Cria a tua conta
              </h2>
            </div>

            {renderForm('mobile')}

            <div className="text-center mt-7">
              <span className="text-[13px]" style={{ color: '#6C757D' }}>
                Já tens conta?
              </span>
              <Link
                to="/login"
                className="ml-1 text-[13px] font-semibold hover:underline"
                style={{ color: '#F69220' }}
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>

        {/* ── TABLET (md até lg) ──────────────────────────────────── */}
        <div
          className="hidden md:flex lg:hidden items-center justify-center bg-white py-16"
          style={{ paddingTop: '120px' }}
        >
          <div className="w-full max-w-4xl mx-auto pl-8 pr-14 flex items-center gap-2">
            {/* Ilustração */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              <img
                src={loginIllustration}
                alt="Ilustração de registo"
                className="w-full max-w-[350px] object-contain -ml-20"
              />
            </div>

            {/* Formulário */}
            <div className="flex-shrink-0 w-[320px] flex flex-col justify-center">
              <div className="mb-8">
                <h2
                  className="font-bold text-[24px] mb-2"
                  style={{ color: '#0A3956' }}
                >
                  Cria a tua conta
                </h2>
              </div>

              {renderForm('tablet')}

              <div className="text-center mt-6">
                <span className="text-[13px]" style={{ color: '#6C757D' }}>
                  Já tens conta?
                </span>
                <Link
                  to="/login"
                  className="ml-1 text-[13px] font-semibold hover:underline"
                  style={{ color: '#F69220' }}
                >
                  Entrar
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── DESKTOP (lg para cima) ──────────────────────────────────── */}
        <div
          className="hidden lg:flex items-center justify-center min-h-screen bg-white"
          style={{ paddingTop: '120px' }}
        >
          <div className="w-full max-w-6xl mx-auto px-12 flex items-center gap-16  pb-16">
            {/* Ilustração */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              <img
                src={loginIllustration}
                alt="Ilustração de registo"
                className="w-full object-contain -ml-44 scale-120  -mt-28"
              />
            </div>

            {/* Formulário */}
            <div className="flex-1 flex flex-col justify-center min-w-0 ml-6">
              <div className="mb-4">
                <h2
                  className="font-bold text-[28px] mb-2"
                  style={{ color: '#0A3956' }}
                >
                  Cria a tua conta
                </h2>
              </div>

              {renderForm('desktop')}

              <div className="text-center mt-6">
                <span className="text-[13px]" style={{ color: '#6C757D' }}>
                  Já tens conta?
                </span>
                <Link
                  to="/login"
                  className="ml-1 text-[13px] font-semibold hover:underline"
                  style={{ color: '#F69220' }}
                >
                  Entrar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
