import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  Trophy,
  Clock,
  ChevronRight,
  PenLine,
} from 'lucide-react'
import api from '../../services/api'

function getErrorMessage(err) {
  if (!err.response)
    return 'Sem ligação. Verifica a tua internet e tenta novamente.'
  const status = err.response?.status
  const serverMsg = err.response?.data?.error
  if (status === 403) return 'Não tens permissão para esta acção.'
  if (status === 404) return 'Registo não encontrado.'
  if (status >= 500) return 'Erro no servidor. Tenta novamente mais tarde.'
  return serverMsg || 'Ocorreu um erro inesperado. Tenta novamente.'
}

export default function SimulationsCard() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchAttempts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/simulations/attempts')
      const data = res.data?.data ?? res.data
      setAttempts(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
        return
      }
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchAttempts()
  }, [fetchAttempts])

  // ── Métricas de resumo ──
  const totalFeitas = attempts.length
  const melhorPontuacao =
    totalFeitas > 0 ? Math.max(...attempts.map((a) => a.score ?? 0)) : null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#DEE2E6] border-t-[3px] border-t-[#F69220]">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
            <ClipboardList size={18} className="text-[#F69220]" />
          </div>
          <div>
            <h2 className="text-[#0A3956] font-semibold text-sm">
              Minhas Simulações
            </h2>
            <p className="text-[#6C757D] text-xs mt-0.5">
              Histórico de provas realizadas
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/simulations')}
          className="flex items-center gap-1.5 bg-[#F69220] hover:bg-[#e0831a] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          <PenLine size={13} />
          Fazer prova
        </button>
      </div>

      {/* Corpo */}
      <div className="p-6">
        {loading ? (
          <SimulationsCardSkeleton />
        ) : error ? (
          <div className="flex items-center justify-between py-2">
            <p className="text-[#DC3545] text-sm">{error}</p>
            <button
              onClick={fetchAttempts}
              className="text-sm text-[#F69220] font-semibold hover:underline ml-4"
            >
              Tentar novamente
            </button>
          </div>
        ) : totalFeitas === 0 ? (
          <EmptyState onNavigate={() => navigate('/simulations')} />
        ) : (
          <>
            {/* Resumo */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#F8F9FA] rounded-lg px-4 py-3">
                <p className="text-[#6C757D] text-xs mb-1">Provas realizadas</p>
                <p className="text-[#0A3956] font-bold text-xl">
                  {totalFeitas}
                </p>
              </div>
              <div className="bg-[#F8F9FA] rounded-lg px-4 py-3">
                <div className="flex items-center gap-1 mb-1">
                  <Trophy size={11} className="text-[#F69220]" />
                  <p className="text-[#6C757D] text-xs">Melhor resultado</p>
                </div>
                <p className="text-[#0A3956] font-bold text-xl">
                  {melhorPontuacao}
                  <span className="text-sm font-normal text-[#6C757D]">
                    {' '}
                    pts
                  </span>
                </p>
              </div>
            </div>

            {/* Lista de tentativas */}
            <div className="space-y-2">
              {attempts.map((attempt) => (
                <AttemptRow
                  key={attempt.id}
                  attempt={attempt}
                  onClick={() =>
                    navigate(
                      `/simulation/${attempt.simulationId}/results?attemptId=${attempt.id}`
                    )
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Linha de tentativa ─── */
function AttemptRow({ attempt, onClick }) {
  const {
    simulationTitle,
    score,
    totalQuestions,
    correctAnswers,
    submittedAt,
  } = attempt

  const percent =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : (score ?? 0)

  const scoreColor =
    percent >= 70 ? '#28A745' : percent >= 50 ? '#F69220' : '#DC3545'

  const dateLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 bg-[#F8F9FA] hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg px-4 py-3 transition-all duration-200 text-left group"
    >
      {/* Score circle */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs"
        style={{ backgroundColor: scoreColor }}
      >
        {percent}%
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[#0A3956] font-medium text-sm truncate">
          {simulationTitle ?? 'Prova sem título'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock size={11} className="text-[#6C757D] shrink-0" />
          <span className="text-[#6C757D] text-xs">{dateLabel}</span>
          {totalQuestions > 0 && (
            <>
              <span className="text-[#DEE2E6]">·</span>
              <span className="text-[#6C757D] text-xs">
                {correctAnswers}/{totalQuestions} correctas
              </span>
            </>
          )}
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight
        size={15}
        className="text-[#6C757D] group-hover:text-[#0A3956] transition-colors shrink-0"
      />
    </button>
  )
}

/* ─── Estado vazio ─── */
function EmptyState({ onNavigate }) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-4">
      <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
        <ClipboardList size={26} className="text-[#F69220]" />
      </div>
      <div>
        <p className="text-[#0A3956] font-semibold text-sm">
          Ainda não realizou nenhuma prova
        </p>
        <p className="text-[#6C757D] text-xs mt-1 max-w-[220px] mx-auto">
          Treine para os exames de acesso com as nossas simulações.
        </p>
      </div>
      <button
        onClick={onNavigate}
        className="bg-[#F69220] hover:bg-[#e0831a] text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors"
      >
        Ver provas disponíveis
      </button>
    </div>
  )
}

/* ─── Skeleton ─── */
function SimulationsCardSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-100 rounded-lg h-16" />
        <div className="bg-gray-100 rounded-lg h-16" />
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-[#F8F9FA] rounded-lg px-4 py-3"
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
