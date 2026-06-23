import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import PublicLayout from '../../components/public/PublicLayout'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { login } = useAuth()

  // 'loading' | 'success' | 'error'
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  const [resendLoading, setResendLoading] = useState(false)
  const [resendStatus, setResendStatus] = useState(null) // 'success' | 'error'
  const [resendEmail, setResendEmail] = useState('')

  // Evita chamar o endpoint duas vezes (ex: StrictMode em dev, ou re-render)
  const hasVerified = useRef(false)

  useEffect(() => {
    if (hasVerified.current) return
    hasVerified.current = true

    async function verify() {
      if (!token) {
        setStatus('error')
        setErrorMessage('Este link é inválido ou já expirou.')
        return
      }

      try {
        const { data } = await api.get('/auth/verify-email', {
          params: { token },
        })

        // O backend devolve sempre um novo JWT com emailVerified: true.
        // Reaproveitamos a função login() do AuthContext para guardar o
        // token e actualizar o user — o banner desaparece sem precisar de
        // logout/login manual.
        if (data?.token) {
          login(data.token)
        }

        setStatus('success')
      } catch (err) {
        const apiError = err.response?.data?.error || ''
        setErrorMessage(apiError || 'Este link é inválido ou já expirou.')
        setStatus('error')
      }
    }

    verify()
  }, [token, login])

  async function handleResend(e) {
    e.preventDefault()
    if (!resendEmail) return

    setResendLoading(true)
    setResendStatus(null)
    try {
      await api.post('/auth/resend-verification', { email: resendEmail })
      setResendStatus('success')
    } catch {
      setResendStatus('error')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div
        className="min-h-screen bg-white flex items-center justify-center px-6"
        style={{ paddingTop: '80px' }}
      >
        <div className="w-full max-w-sm mx-auto py-10 text-center">
          {/* ── LOADING ───────────────────────────────────── */}
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <svg
                  className="animate-spin h-12 w-12"
                  style={{ color: '#F69220' }}
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
              </div>
              <h2
                className="font-bold text-[22px] mb-2"
                style={{ color: '#0A3956' }}
              >
                A verificar o teu email...
              </h2>
              <p className="text-[14px]" style={{ color: '#6C757D' }}>
                Aguarda um momento, por favor.
              </p>
            </>
          )}

          {/* ── SUCESSO ───────────────────────────────────── */}
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle
                  className="w-16 h-16"
                  style={{ color: '#28A745' }}
                />
              </div>
              <h2
                className="font-bold text-[22px] mb-2"
                style={{ color: '#0A3956' }}
              >
                Email verificado com sucesso!
              </h2>
              <p className="text-[14px] mb-7" style={{ color: '#6C757D' }}>
                Já podes continuar a usar a tua conta sem restrições.
              </p>
              <Link
                to="/student/profile"
                className="inline-flex w-full items-center justify-center py-3.5 rounded-2xl font-semibold text-[16px] text-white transition-all duration-200 active:scale-[0.98]"
                style={{ backgroundColor: '#F69220' }}
              >
                Ir para o Meu Perfil
              </Link>
            </>
          )}

          {/* ── ERRO ──────────────────────────────────────── */}
          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <XCircle className="w-16 h-16" style={{ color: '#DC3545' }} />
              </div>
              <h2
                className="font-bold text-[22px] mb-2"
                style={{ color: '#0A3956' }}
              >
                Link inválido ou expirado
              </h2>
              <p className="text-[14px] mb-7" style={{ color: '#6C757D' }}>
                {errorMessage}
              </p>

              {/* Reenviar email */}
              <form onSubmit={handleResend} className="space-y-3 text-left">
                <label
                  htmlFor="resend-email"
                  className="block text-[13px] font-medium"
                  style={{ color: '#0A3956' }}
                >
                  Reenviar email de verificação
                </label>
                <input
                  type="email"
                  id="resend-email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="w-full px-4 py-3.5 text-[14px] border border-gray-200 bg-gray-50 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
                  style={{ fontSize: '16px' }}
                />

                <button
                  type="submit"
                  disabled={resendLoading || !resendEmail}
                  className="w-full py-3.5 rounded-2xl font-semibold text-[16px] text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: '#F69220' }}
                >
                  {resendLoading ? 'A enviar...' : 'Reenviar email'}
                </button>

                {resendStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl p-3.5 text-[13px] text-center leading-relaxed">
                    Email enviado! Verifica a tua caixa de entrada (e a pasta de
                    spam).
                  </div>
                )}
                {resendStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3.5 text-[13px] text-center leading-relaxed">
                    Não foi possível enviar o email. Verifica o endereço e tenta
                    novamente.
                  </div>
                )}
              </form>

              <div className="text-center mt-7">
                <Link
                  to="/"
                  className="text-[13px] font-semibold hover:underline"
                  style={{ color: '#F69220' }}
                >
                  Voltar ao início
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
