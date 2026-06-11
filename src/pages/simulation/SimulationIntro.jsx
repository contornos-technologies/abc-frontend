import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Target,
  Layers,
  BarChart2,
  Hash,
  Scale,
  AlertCircle,
  User,
  ChevronRight,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

function getScoringLabel(mode) {
  if (mode === 'WEIGHTED') return 'Pontuação ponderada por secção'
  if (mode === 'SIMPLE')
    return 'Pontuação simples por resposta certa. Respostas erradas ou em branco não penalizam a nota final.'
  return 'Pontuação padrão'
}

function getFacultyBadgeStyle(name = '') {
  const n = name.toLowerCase()
  if (n.includes('medicina') || n.includes('saúde') || n.includes('enfermagem'))
    return {
      backgroundColor: '#FFF3E0',
      color: '#C2500A',
      border: '1px solid #FDDBB4',
    }
  if (n.includes('engenharia') || n.includes('civil') || n.includes('electr'))
    return {
      backgroundColor: '#EFF6FF',
      color: '#1565A8',
      border: '1px solid #BFDBFE',
    }
  if (n.includes('direito'))
    return {
      backgroundColor: '#F5F3FF',
      color: '#6A1B9A',
      border: '1px solid #DDD6FE',
    }
  if (n.includes('economia') || n.includes('gestão') || n.includes('contab'))
    return {
      backgroundColor: '#F0FDF4',
      color: '#15803D',
      border: '1px solid #BBF7D0',
    }
  if (n.includes('informática') || n.includes('tecnologia'))
    return {
      backgroundColor: '#ECFEFF',
      color: '#0369A1',
      border: '1px solid #A5F3FC',
    }
  if (n.includes('arquitectura') || n.includes('urbanismo'))
    return {
      backgroundColor: '#FFFBEB',
      color: '#92400E',
      border: '1px solid #FDE68A',
    }
  if (n.includes('agronomia') || n.includes('veterinária'))
    return {
      backgroundColor: '#F7FEE7',
      color: '#365314',
      border: '1px solid #D9F99D',
    }
  return {
    backgroundColor: '#F0F4FF',
    color: '#3B4FCE',
    border: '1px solid #D0D8F7',
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function IntroSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#F4F8FC',
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* top bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 64,
          backgroundColor: '#fff',
          borderBottom: '1px solid #E7EDF5',
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: '#E7EDF5',
              animation: 'pulse 1.5s infinite',
            }}
          />
          <div
            style={{
              width: 160,
              height: 14,
              borderRadius: 6,
              backgroundColor: '#E7EDF5',
            }}
          />
        </div>
      </header>
      {/* content */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div
            style={{
              width: 80,
              height: 26,
              borderRadius: 999,
              backgroundColor: '#E7EDF5',
            }}
          />
          <div
            style={{
              width: 140,
              height: 26,
              borderRadius: 999,
              backgroundColor: '#E7EDF5',
            }}
          />
        </div>
        <div
          style={{
            width: '70%',
            height: 28,
            borderRadius: 8,
            backgroundColor: '#E7EDF5',
            marginBottom: 12,
          }}
        />
        <div
          style={{
            width: '90%',
            height: 15,
            borderRadius: 6,
            backgroundColor: '#F0F4F8',
            marginBottom: 6,
          }}
        />
        <div
          style={{
            width: '60%',
            height: 15,
            borderRadius: 6,
            backgroundColor: '#F0F4F8',
            marginBottom: 32,
          }}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #E7EDF5',
                borderRadius: 16,
                padding: '16px 20px',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: '#E7EDF5',
                  marginBottom: 10,
                }}
              />
              <div
                style={{
                  width: 50,
                  height: 12,
                  borderRadius: 4,
                  backgroundColor: '#E7EDF5',
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  width: 70,
                  height: 14,
                  borderRadius: 4,
                  backgroundColor: '#E7EDF5',
                }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #E7EDF5',
            borderRadius: 16,
            padding: 24,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  backgroundColor: '#E7EDF5',
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: '50%',
                    height: 14,
                    borderRadius: 4,
                    backgroundColor: '#E7EDF5',
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    width: '30%',
                    height: 12,
                    borderRadius: 4,
                    backgroundColor: '#F0F4F8',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SimulationIntro() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [simulation, setSimulation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/simulations/${id}`)
        const simData = res.data?.data ?? res.data

        // Normalização defensiva (V20.1 pattern)
        const normalized = {
          ...simData,
          sections:
            simData.sections?.map((s) => {
              const fromQBS = simData.questionsBySection?.find(
                (q) => q.sectionId === s.id
              )
              return {
                ...s,
                questions: s.questions ?? fromQBS?.questions ?? [],
              }
            }) ?? [],
        }
        setSimulation(normalized)
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/portal/acesso')
          return
        }
        setError('Não foi possível carregar a prova. Tenta novamente.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const handleStart = async () => {
    setStarting(true)
    try {
      const res = await api.post(`/simulations/${id}/start`)
      const { attemptId } = res.data?.data ?? res.data
      localStorage.setItem('abc_attempt_id', attemptId)
      navigate(`/simulation/${id}/exam`, { state: { attemptId } })
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/portal/acesso')
        return
      }
      setError('Não foi possível iniciar a prova. Tenta novamente.')
      setStarting(false)
    }
  }

  if (loading) return <IntroSkeleton />

  if (error) {
    return (
      <div
        style={{
          backgroundColor: '#F4F8FC',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            border: '1px solid #E7EDF5',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            padding: 32,
            maxWidth: 400,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <AlertCircle size={22} color="#DC3545" />
          </div>
          <p
            style={{
              color: '#071C35',
              fontWeight: 600,
              fontSize: 15,
              marginBottom: 12,
            }}
          >
            {error}
          </p>
          <button
            onClick={() => navigate('/simulations')}
            style={{
              background: 'none',
              border: 'none',
              color: '#1565A8',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Voltar às simulações
          </button>
        </div>
      </div>
    )
  }

  if (!simulation) return null

  // Derived
  const facultyLabel =
    simulation.targetFaculty?.name ?? simulation.targetFacultyName ?? null
  const universityLabel = simulation.targetUniversity?.name ?? null
  const totalQuestions = simulation.sections.reduce(
    (acc, s) => acc + (s.questions?.length ?? 0),
    0
  )
  const isWeighted = simulation.scoringMode === 'WEIGHTED'
  const hasDuration = !!simulation.duration
  const isAnonymous = !user

  const COLORS = {
    primaryBlue: '#1565A8',
    darkBlue: '#071C35',
    pageBg: '#F4F8FC',
    cardBg: '#FFFFFF',
    cardBorder: '#E7EDF5',
    bodyText: '#64748B',
    subtleText: '#5F6D7E',
    metaText: '#A0AEC0',
    iconBg: '#F3F7FD',
  }

  return (
    <div
      style={{
        backgroundColor: COLORS.pageBg,
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Sticky top bar ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 64,
          backgroundColor: '#fff',
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            onClick={() => navigate('/simulations')}
            aria-label="Voltar"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              color: COLORS.bodyText,
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <span
            style={{
              fontSize: 14,
              color: COLORS.bodyText,
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}
          >
            Simulações de Acesso
          </span>
        </div>
      </header>

      {/* ── Main content ── */}
      <main
        style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 48px' }}
      >
        {/* Banner anónimo — discreto, informativo */}
        {isAnonymous && (
          <div
            style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <User
              size={15}
              color={COLORS.primaryBlue}
              style={{ marginTop: 1, flexShrink: 0 }}
            />
            <p
              style={{
                fontSize: 14,
                color: '#1E40AF',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Estás a fazer a prova como visitante. Os resultados são guardados
              temporariamente.{' '}
              <button
                onClick={() => navigate('/signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1565A8',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  fontSize: 14,
                }}
              >
                Cria uma conta
              </button>{' '}
              para os guardar definitivamente.
            </p>
          </div>
        )}

        {/* ── Badges ── */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          {facultyLabel && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: 9999,
                letterSpacing: '0.01em',
                ...getFacultyBadgeStyle(facultyLabel),
              }}
            >
              {facultyLabel}
            </span>
          )}
          {universityLabel && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: 9999,
                letterSpacing: '0.01em',
                backgroundColor: '#F0F4FF',
                color: '#3B4FCE',
                border: '1px solid #D0D8F7',
              }}
            >
              {universityLabel}
            </span>
          )}
        </div>

        {/* ── Título + descrição ── */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.darkBlue,
              lineHeight: 1.25,
              margin: '0 0 10px',
            }}
          >
            {simulation.title}
          </h1>
          {simulation.description && (
            <p
              style={{
                fontSize: 15,
                color: COLORS.bodyText,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {simulation.description}
            </p>
          )}
        </div>

        {/* ── Stats row ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {[
            hasDuration && {
              icon: <Clock size={16} color={COLORS.primaryBlue} />,
              label: 'Duração',
              value: formatDuration(simulation.duration),
            },
            {
              icon: <Hash size={16} color={COLORS.primaryBlue} />,
              label: 'Questões',
              value: `${totalQuestions} questões`,
            },
            {
              icon: <Scale size={16} color={COLORS.primaryBlue} />,
              label: 'Escala',
              value: '0 a 20 valores',
            },
          ]
            .filter(Boolean)
            .map((stat) => (
              <div
                key={stat.label}
                style={{
                  backgroundColor: COLORS.cardBg,
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: 16,
                  padding: '16px 20px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: COLORS.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}
                >
                  {stat.icon}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: COLORS.metaText,
                    marginBottom: 3,
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.darkBlue,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
        </div>

        {/* ── Sections breakdown card ── */}
        <div
          style={{
            backgroundColor: COLORS.cardBg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            marginBottom: 16,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={16} color={COLORS.primaryBlue} />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.darkBlue,
                }}
              >
                Conteúdo da prova
              </span>
            </div>
            <span style={{ fontSize: 13, color: COLORS.metaText }}>
              {simulation.sections.length}{' '}
              {simulation.sections.length === 1 ? 'disciplina' : 'disciplinas'}
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: COLORS.cardBorder }} />

          {/* Section rows */}
          {simulation.sections.map((s, i) => {
            const qCount = s.questions?.length ?? 0
            return (
              <div key={s.id ?? i}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 24px',
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor: COLORS.pageBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Target size={14} color={COLORS.primaryBlue} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: COLORS.darkBlue,
                      }}
                    >
                      {s.subject?.name ?? `Secção ${i + 1}`}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.metaText }}>
                      {qCount} {qCount === 1 ? 'questão' : 'questões'}
                    </div>
                  </div>
                  {isWeighted && s.weight != null && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: COLORS.subtleText,
                        backgroundColor: COLORS.pageBg,
                        padding: '3px 10px',
                        borderRadius: 6,
                      }}
                    >
                      {s.weight}%
                    </span>
                  )}
                </div>
                {i < simulation.sections.length - 1 && (
                  <div
                    style={{
                      height: 1,
                      backgroundColor: '#F4F8FC',
                      marginLeft: 24,
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Info notices ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 32,
          }}
        >
          {/* Scoring */}
          <div
            style={{
              backgroundColor: COLORS.cardBg,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <BarChart2
              size={16}
              color={COLORS.primaryBlue}
              style={{ marginTop: 1, flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: 14,
                color: COLORS.subtleText,
                lineHeight: 1.5,
              }}
            >
              {getScoringLabel(simulation.scoringMode)}
            </span>
          </div>

          {/* Time warning */}
          {hasDuration && (
            <div
              style={{
                backgroundColor: '#FFF7ED',
                border: '1px solid #FDDBB4',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <Clock
                size={16}
                color="#F7941D"
                style={{ marginTop: 1, flexShrink: 0 }}
              />
              <span style={{ fontSize: 14, color: '#C2500A', lineHeight: 1.5 }}>
                O cronómetro inicia automaticamente ao começar a prova e não
                pode ser pausado. Tens{' '}
                <strong>{formatDuration(simulation.duration)}</strong> para
                completar.
              </span>
            </div>
          )}
        </div>

        {/* ── CTA buttons ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleStart}
            disabled={starting}
            style={{
              backgroundColor: starting ? '#1256a0' : COLORS.primaryBlue,
              color: '#fff',
              border: 'none',
              borderRadius: 9999,
              padding: '14px 32px',
              fontSize: 14,
              fontWeight: 600,
              cursor: starting ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(21,101,168,0.25)',
              width: '100%',
              letterSpacing: '0.01em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: starting ? 0.75 : 1,
              transition: 'background-color 0.15s, opacity 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!starting) e.currentTarget.style.backgroundColor = '#1256a0'
            }}
            onMouseLeave={(e) => {
              if (!starting)
                e.currentTarget.style.backgroundColor = COLORS.primaryBlue
            }}
          >
            {starting ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                A iniciar...
              </>
            ) : (
              <>
                Iniciar Prova
                <ChevronRight size={16} />
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/simulations')}
            disabled={starting}
            style={{
              backgroundColor: '#fff',
              color: COLORS.subtleText,
              border: '1px solid #E3EAF2',
              borderRadius: 9999,
              padding: '14px 32px',
              fontSize: 14,
              fontWeight: 600,
              cursor: starting ? 'not-allowed' : 'pointer',
              width: '100%',
              letterSpacing: '0.01em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!starting) e.currentTarget.style.borderColor = '#C5D0DC'
            }}
            onMouseLeave={(e) => {
              if (!starting) e.currentTarget.style.borderColor = '#E3EAF2'
            }}
          >
            <ArrowLeft size={14} />
            Voltar
          </button>
        </div>

        {/* ── Rodapé Contornos ── */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 40,
            fontSize: 10,
            color: '#C0CBD8',
            letterSpacing: '0.02em',
          }}
        >
          <a
            href="https://contornos.design"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#C0CBD8', textDecoration: 'none' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#8899aa'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#C0CBD8'
            }}
          >
            Desenvolvido por <strong>CONTORNOS Designs</strong>
          </a>
        </div>
      </main>

      {/* Keyframes para o spinner */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
