import { useState, useEffect, useCallback, useContext, useRef } from 'react'
import StudentLayout from '../../components/layout/StudentLayout'
import PersonalInfoCard from '../../components/student/PersonalInfoCard'
import SecurityCard from '../../components/student/SecurityCard'
import EnrollmentCard from '../../components/student/EnrollmentCard'
import PaymentCard from '../../components/student/PaymentCard'
import SimulationsCard from '../../components/student/SimulationsCard'
import {
  getProfile,
  getTargets,
  getPayments,
} from '../../services/student.service'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'

export default function Profile() {
  const [activeTab, setActiveTab] = useState('perfil')
  const { user, setProfile } = useContext(AuthContext)

  const [student, setStudent] = useState(null)
  const [targets, setTargets] = useState([])
  const [payments, setPayments] = useState(null)

  const [loadingStudent, setLoadingStudent] = useState(true)
  const [loadingTargets, setLoadingTargets] = useState(true)
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [errorStudent, setErrorStudent] = useState('')
  const [errorTargets, setErrorTargets] = useState('')
  const [errorPayments, setErrorPayments] = useState('')

  // Banner de verificação de email
  const [resendLoading, setResendLoading] = useState(false)
  const [resendStatus, setResendStatus] = useState(null) // 'success' | 'error'

  const refs = {
    perfil: useRef(null),
    inscricao: useRef(null),
    pagamentos: useRef(null),
    simulacoes: useRef(null),
    seguranca: useRef(null),
  }

  const fetchStudent = useCallback(async () => {
    setLoadingStudent(true)
    setErrorStudent('')
    try {
      const data = await getProfile()
      setStudent(data)
      setProfile && setProfile(data)
    } catch (err) {
      setErrorStudent(err.message || 'Erro ao carregar perfil')
    } finally {
      setLoadingStudent(false)
    }
  }, [setProfile])

  const fetchTargets = useCallback(async () => {
    setLoadingTargets(true)
    setErrorTargets('')
    try {
      const data = await getTargets()
      setTargets(data)
    } catch (err) {
      setErrorTargets(err.message || 'Erro ao carregar inscrição')
    } finally {
      setLoadingTargets(false)
    }
  }, [])

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true)
    setErrorPayments('')
    try {
      const data = await getPayments()
      setPayments(data)
    } catch (err) {
      setErrorPayments(err.message || 'Erro ao carregar pagamentos')
    } finally {
      setLoadingPayments(false)
    }
  }, [])

  useEffect(() => {
    fetchStudent()
    fetchTargets()
    fetchPayments()
  }, [fetchStudent, fetchTargets, fetchPayments])

  useEffect(() => {
    const ref = refs[activeTab]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeTab])

  async function handleResendVerification() {
    setResendLoading(true)
    setResendStatus(null)
    try {
      await api.post('/auth/resend-verification', { email: user.email })
      setResendStatus('success')
    } catch {
      setResendStatus('error')
    } finally {
      setResendLoading(false)
    }
  }

  const showEmailBanner = user?.emailVerified === false

  return (
    <StudentLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* Banner de email não verificado */}
      {showEmailBanner && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#FFF8E1] border border-[#F69220] border-l-4 border-l-[#F69220] rounded-xl px-5 py-4">
          <div className="flex items-start sm:items-center gap-3">
            <span className="text-[#F69220] text-lg mt-0.5 sm:mt-0">✉</span>
            <div>
              <p className="text-sm font-semibold text-[#92400E]">
                Email não verificado
              </p>
              {resendStatus === 'success' ? (
                <p className="text-xs text-[#15803D] mt-0.5">
                  Email enviado! Verifica a tua caixa de entrada (e a pasta de
                  spam).
                </p>
              ) : resendStatus === 'error' ? (
                <p className="text-xs text-[#DC3545] mt-0.5">
                  Não foi possível enviar o email. Tenta novamente mais tarde.
                </p>
              ) : (
                <p className="text-xs text-[#92400E] mt-0.5">
                  Verifica a tua caixa de entrada e clica no link que enviámos.
                </p>
              )}
            </div>
          </div>
          {resendStatus !== 'success' && (
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="shrink-0 bg-[#F69220] hover:bg-[#e0831a] disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {resendLoading ? 'A enviar...' : 'Reenviar email'}
            </button>
          )}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-[#0A3956] font-bold text-2xl mb-1">Meu Perfil</h1>
        <p className="text-[#6B7280] text-sm">
          Gerencie as suas informações pessoais
        </p>
        <div className="h-px bg-[#E5E7EB] mt-4" />
      </div>

      {/* Cards */}
      <div className="space-y-8">
        <div ref={refs.perfil}>
          {loadingStudent ? (
            <PersonalInfoCardSkeleton />
          ) : errorStudent ? (
            <ErrorBanner message={errorStudent} onRetry={fetchStudent} />
          ) : (
            //<PersonalInfoCard student={student} onUpdate={fetchStudent} />
            <PersonalInfoCard student={student} onUpdate={fetchStudent} emailVerified={user?.emailVerified} />
          )}
        </div>

        <div ref={refs.inscricao}>
          <EnrollmentCard
            targets={targets}
            loading={loadingTargets}
            error={errorTargets}
            onRefresh={fetchTargets}
          />
        </div>

        <div ref={refs.pagamentos}>
          <PaymentCard
            payments={payments}
            loading={loadingPayments}
            error={errorPayments}
            onRefresh={fetchPayments}
          />
        </div>

        {/* ── Card Simulações ── */}
        <div ref={refs.simulacoes}>
          <SimulationsCard />
        </div>

        <div ref={refs.seguranca}>
          <SecurityCard />
        </div>
      </div>
    </StudentLayout>
  )
}

/* ─── Helpers ─── */

function PersonalInfoCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#F69220] p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-48 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-[#F8FAFC] p-4 rounded-lg">
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#DC3545] p-6 flex items-center justify-between">
      <p className="text-[#DC3545] text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-[#F69220] font-semibold hover:underline ml-4"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
