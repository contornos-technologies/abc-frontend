import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ClipboardList,
  UserCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

// ─── Score helpers ────────────────────────────────────────────────────────────

function getScoreColor(score) {
  if (score >= 10) return 'blue'
  if (score >= 7) return 'amber'
  return 'red'
}

function getScoreHex(color) {
  if (color === 'blue') return '#1565A8'
  if (color === 'amber') return '#E67E22'
  return '#C0392B'
}

function getClassification(score) {
  if (score >= 17) return 'Excelente'
  if (score >= 14) return 'Muito Bom'
  if (score >= 10) return 'Suficiente'
  if (score >= 7) return 'Fraco'
  return 'Insuficiente'
}

function getClassificationPillStyle(color) {
  if (color === 'blue') return { backgroundColor: '#EEF4FF', color: '#1565A8' }
  if (color === 'amber') return { backgroundColor: '#FEF3E2', color: '#E67E22' }
  return { backgroundColor: '#FDECEA', color: '#C0392B' }
}

// ─── Score circle with animated arc + count-up ───────────────────────────────

function ScoreCircle({ score, maxScore, animated }) {
  const size = 160
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = animated
    ? circumference - (score / maxScore) * circumference
    : circumference

  const color = getScoreColor(score)
  const hex = getScoreHex(color)
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (!animated) return
    const duration = 600
    const start = performance.now()
    const raf = (now) => {
      const t = Math.min((now - start) / duration, 1)
      setDisplayScore(Math.round(t * score))
      if (t < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [animated, score])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ width: 'clamp(120px, 20vw, 160px)', height: 'auto' }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7EDF5"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={hex}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: animated ? 'stroke-dashoffset 0.8s ease-out' : 'none',
          }}
        />
        {/* Score number */}
        <text
          x={size / 2}
          y={size / 2 - 8}
          textAnchor="middle"
          fill={hex}
          fontSize="36"
          fontWeight="500"
          fontFamily="Inter, sans-serif"
        >
          {displayScore}
        </text>
        {/* "val" label */}
        <text
          x={size / 2}
          y={size / 2 + 4}
          textAnchor="middle"
          fill={hex}
          fontSize="11"
          fontFamily="Inter, sans-serif"
        >
          val
        </text>
        {/* /20 denominator */}
        <text
          x={size / 2}
          y={size / 2 + 22}
          textAnchor="middle"
          fill="#5F6D7E"
          fontSize="14"
          fontFamily="Inter, sans-serif"
        >
          /{maxScore}
        </text>
      </svg>

      {/* Classification pill */}
      <span
        style={{
          ...getClassificationPillStyle(color),
          padding: '4px 16px',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {getClassification(score)}
      </span>
    </div>
  )
}

// ─── Per-section progress bar ─────────────────────────────────────────────────

function SubjectBar({ subject, visible }) {
  const color = getScoreColor(subject.score)
  const hex = getScoreHex(color)
  const pct = (subject.score / subject.maxScore) * 100

  return (
    <div style={{ paddingTop: 16, paddingBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <span style={{ color: '#071C35', fontSize: 14, fontWeight: 500 }}>
          {subject.name}
        </span>
        <span style={{ color: hex, fontSize: 13, fontWeight: 500 }}>
          {subject.score} val/{subject.maxScore}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          backgroundColor: '#F0F4F8',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 999,
            backgroundColor: hex,
            width: visible ? `${pct}%` : '0%',
            transition: visible ? 'width 0.5s ease-out' : 'none',
          }}
        />
      </div>
      <p style={{ color: '#A0AEC0', fontSize: 12, marginTop: 4 }}>
        {subject.correct} correctas de {subject.total} questões
      </p>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: '#F0F4F8',
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const attemptId = searchParams.get('attemptId')

  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [arcAnimated, setArcAnimated] = useState(false)
  const [barsVisible, setBarsVisible] = useState(false)
  const barsRef = useRef(null)

  // Fetch attempt results
  useEffect(() => {
    if (!attemptId) {
      setError('ID de tentativa em falta.')
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const res = await api.get(`/simulations/attempts/${attemptId}`)
        const data = res.data?.data ?? res.data
        setAttempt(data)
      } catch (err) {
        setError('Não foi possível carregar os resultados.')
      } finally {
        setLoading(false)
      }
    })()
  }, [attemptId])

  // Trigger arc animation after data loads
  useEffect(() => {
    if (!attempt) return
    const t = setTimeout(() => setArcAnimated(true), 120)
    return () => clearTimeout(t)
  }, [attempt])

  // Intersection observer for bar animations
  useEffect(() => {
    const el = barsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setBarsVisible(true)
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [attempt])

  // ── Derived values ────────────────────────────────────────────────────────

  const isLoggedIn = !!user

  // Student first name for personalised greeting
  const firstName =
    user?.studentData?.fullName?.split(' ')[0] ??
    user?.fullName?.split(' ')[0] ??
    null

  // Normalise attempt data into display shape
  const score = attempt ? Math.round((attempt.score ?? 0) * 10) / 10 : 0
  const maxScore = 20
  const correct = attempt?.correctAnswers ?? 0
  const total = attempt?.totalQuestions ?? 0
  const wrong = total - correct
  const examTitle = attempt?.exam?.title ?? 'Simulação'
  const isPass = score >= 10

  // Build per-section results array
  const sections = (attempt?.sectionResults ?? []).map((s) => ({
    name: s.subject?.name ?? s.subjectName ?? 'Disciplina',
    score: Math.round((s.score ?? 0) * 10) / 10,
    maxScore: 20,
    correct: s.correctAnswers ?? 0,
    total: s.totalQuestions ?? 0,
  }))

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
      }}
    >
      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header
        style={{
          height: 64,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E7EDF5',
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          gap: 12,
        }}
      >
        <Link
          to="/simulations"
          style={{
            color: '#1565A8',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} />
          Simulações
        </Link>
        <span
          style={{
            flex: 1,
            textAlign: 'center',
            color: '#071C35',
            fontSize: 15,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '0 12px',
          }}
        >
          {loading ? '' : examTitle}
        </span>
        <div style={{ width: 80, flexShrink: 0 }} />
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 48px' }}>
        {/* ── Error state ──────────────────────────────────────────────── */}
        {error && (
          <div
            style={{
              marginTop: 48,
              textAlign: 'center',
              border: '1px solid #FDECEA',
              borderRadius: 16,
              padding: '32px 24px',
              backgroundColor: '#FFF8F8',
            }}
          >
            <p
              style={{
                color: '#C0392B',
                fontSize: 15,
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              {error}
            </p>
            <button
              onClick={() => navigate('/simulations')}
              style={{
                marginTop: 12,
                backgroundColor: '#1565A8',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Ver simulações
            </button>
          </div>
        )}

        {/* ── Loading skeleton ─────────────────────────────────────────── */}
        {loading && !error && (
          <div style={{ paddingTop: 48 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                marginBottom: 40,
              }}
            >
              <Skeleton width={160} height={160} radius={999} />
              <Skeleton width={100} height={28} radius={999} />
              <Skeleton width={280} height={24} radius={8} />
              <Skeleton width={200} height={16} radius={8} />
            </div>
            <div
              style={{
                border: '1px solid #E7EDF5',
                borderRadius: 16,
                padding: 24,
                marginBottom: 20,
              }}
            >
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <Skeleton
                    width="100%"
                    height={14}
                    radius={6}
                    style={{ marginBottom: 8 }}
                  />
                  <Skeleton width="100%" height={6} radius={999} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Results ──────────────────────────────────────────────────── */}
        {!loading && !error && attempt && (
          <>
            {/* Hero score section */}
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 48,
                paddingBottom: 40,
              }}
            >
              <ScoreCircle
                score={score}
                maxScore={maxScore}
                animated={arcAnimated}
              />

              {/* Personalised headline */}
              <h1
                style={{
                  color: '#071C35',
                  fontSize: 22,
                  fontWeight: 500,
                  marginTop: 24,
                  marginBottom: 6,
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {isPass
                  ? firstName
                    ? `Parabéns, ${firstName}!`
                    : 'Parabéns — passaste na simulação!'
                  : firstName
                    ? `${firstName}, continua a praticar!`
                    : 'Continua a praticar — cada tentativa conta'}
              </h1>

              <p
                style={{
                  color: '#5F6D7E',
                  fontSize: 14,
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                {isPass
                  ? `Respondeste correctamente a ${correct} de ${total} questões. Continua assim!`
                  : `Respondeste correctamente a ${correct} de ${total} questões. Não desistas — a persistência é o caminho.`}
              </p>

              {/* Stats row: correct / wrong / total */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  width: '100%',
                  maxWidth: 500,
                  marginTop: 32,
                }}
              >
                {[
                  {
                    icon: <CheckCircle size={16} color="#1565A8" />,
                    label: 'Correctas',
                    value: correct,
                    color: '#1565A8',
                  },
                  {
                    icon: <XCircle size={16} color="#C0392B" />,
                    label: 'Erradas',
                    value: wrong,
                    color: '#C0392B',
                  },
                  {
                    icon: <ClipboardList size={16} color="#071C35" />,
                    label: 'Total',
                    value: total,
                    color: '#071C35',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      border: '1px solid #E7EDF5',
                      borderRadius: 16,
                      padding: '20px 12px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {stat.icon}
                    <span
                      style={{
                        color: stat.color,
                        fontSize: 24,
                        fontWeight: 500,
                        lineHeight: 1.2,
                      }}
                    >
                      {stat.value}
                    </span>
                    <span style={{ color: '#5F6D7E', fontSize: 12 }}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section breakdown */}
            {sections.length > 0 && (
              <section
                ref={barsRef}
                style={{
                  border: '1px solid #E7EDF5',
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 20,
                }}
              >
                <h2
                  style={{
                    color: '#071C35',
                    fontSize: 15,
                    fontWeight: 500,
                    marginBottom: 4,
                  }}
                >
                  Desempenho por disciplina
                </h2>
                {sections.map((section, i) => (
                  <div key={section.name}>
                    <SubjectBar subject={section} visible={barsVisible} />
                    {i < sections.length - 1 && (
                      <div style={{ height: 1, backgroundColor: '#F4F8FC' }} />
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Scale legend */}
            <section
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E7EDF5',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  color: '#5F6D7E',
                  fontSize: 12,
                  fontWeight: 500,
                  marginBottom: 10,
                }}
              >
                Escala de classificação:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  {
                    range: '17–20',
                    label: 'Excelente',
                    bg: '#EEF4FF',
                    color: '#1565A8',
                  },
                  {
                    range: '14–16',
                    label: 'Muito Bom',
                    bg: '#E6F7F5',
                    color: '#0D9488',
                  },
                  {
                    range: '10–13',
                    label: 'Suficiente',
                    bg: '#EDFAF1',
                    color: '#16A34A',
                  },
                  {
                    range: '7–9',
                    label: 'Fraco',
                    bg: '#FEF3E2',
                    color: '#E67E22',
                  },
                  {
                    range: '0–6',
                    label: 'Insuficiente',
                    bg: '#FDECEA',
                    color: '#C0392B',
                  },
                ].map((item) => (
                  <span
                    key={item.label}
                    style={{
                      backgroundColor: item.bg,
                      color: item.color,
                      borderRadius: 999,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {item.range} · {item.label}
                  </span>
                ))}
              </div>
            </section>

            {/* Anonymous banner — only if not logged in */}
            {!isLoggedIn && (
              <section
                style={{
                  backgroundColor: '#EEF4FF',
                  border: '1.5px solid #B8D3F5',
                  borderRadius: 16,
                  padding: '28px 28px',
                  marginBottom: 28,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                  }}
                >
                  {/* Icon + text block */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: '#D6E8FA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <UserCircle size={28} color="#1565A8" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p
                        style={{
                          color: '#071C35',
                          fontSize: 16,
                          fontWeight: 500,
                          marginBottom: 6,
                          lineHeight: 1.3,
                        }}
                      >
                        Os teus resultados vão desaparecer
                      </p>
                      <p
                        style={{
                          color: '#5F6D7E',
                          fontSize: 13,
                          lineHeight: 1.6,
                          marginBottom: 6,
                        }}
                      >
                        Cria uma conta gratuita para guardar este resultado,
                        acompanhar a tua evolução ao longo do tempo e receber
                        recomendações personalizadas para melhorar.
                      </p>
                      <p style={{ color: '#A0AEC0', fontSize: 11 }}>
                        Já fizeste outras simulações? Os resultados são
                        automaticamente associados à tua conta após o registo.
                      </p>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <Link
                      to="/signup"
                      style={{
                        backgroundColor: '#1565A8',
                        color: '#FFFFFF',
                        borderRadius: 999,
                        padding: '13px 24px',
                        fontWeight: 500,
                        fontSize: 14,
                        textDecoration: 'none',
                        textAlign: 'center',
                        display: 'block',
                      }}
                    >
                      Criar conta gratuita
                    </Link>
                    <Link
                      to="/login"
                      style={{
                        color: '#1565A8',
                        fontSize: 13,
                        textAlign: 'center',
                        textDecoration: 'none',
                        padding: '8px 0',
                      }}
                    >
                      Já tenho conta — entrar
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                alignItems: 'stretch',
                maxWidth: 400,
                margin: '0 auto',
              }}
            >
              <Link
                to={`/simulation/${id}`}
                style={{
                  border: '1.5px solid #1565A8',
                  color: '#1565A8',
                  borderRadius: 999,
                  padding: '12px 28px',
                  fontWeight: 500,
                  fontSize: 14,
                  backgroundColor: '#FFFFFF',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                Tentar novamente
              </Link>
              <Link
                to="/simulations"
                style={{
                  backgroundColor: '#1565A8',
                  color: '#FFFFFF',
                  borderRadius: 999,
                  padding: '12px 28px',
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                Ver todas as simulações
              </Link>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px 0 32px' }}>
        <a
          href="https://contornos.design"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 10, color: '#C0CBD8', textDecoration: 'none' }}
        >
          Desenvolvido por <strong>CONTORNOS Designs</strong>
        </a>
      </footer>
    </div>
  )
}
