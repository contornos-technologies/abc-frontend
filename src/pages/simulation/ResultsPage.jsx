import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, ClipboardList, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// ─── Colour system ────────────────────────────────────────────────────────────
//  Pass  (≥ 10) → deep navy   #1A3A5C
//  Borderline (7–9) → slate   #64748B
//  Fail  (< 7)  → deep claret #8B2635

function getTheme(score) {
  if (score >= 10) return {
    arc: '#1A3A5C', arcBg: '#D6E4F0',
    number: '#1A3A5C', pillBg: '#EBF2FA', pillText: '#1A3A5C',
    barFill: '#1A3A5C',
  };
  if (score >= 7) return {
    arc: '#64748B', arcBg: '#E2E8F0',
    number: '#64748B', pillBg: '#F1F5F9', pillText: '#475569',
    barFill: '#64748B',
  };
  return {
    arc: '#8B2635', arcBg: '#F5E0E3',
    number: '#8B2635', pillBg: '#FDF0F1', pillText: '#8B2635',
    barFill: '#8B2635',
  };
}

function getClassification(score) {
  if (score >= 17) return 'Excelente';
  if (score >= 14) return 'Muito Bom';
  if (score >= 10) return 'Suficiente';
  if (score >= 7)  return 'Fraco';
  return 'Insuficiente';
}

// ─── Calcular breakdown por secção a partir das respostas ─────────────────────
//
// A API devolve:
//   sections  → [{ id, weight, subject: { name } }]
//   answers   → [{ question: { sectionId, options: [{ id, isCorrect }] }, selectedOption: { id } }]
//   scoringMode → 'SIMPLE' | 'WEIGHTED'
//   weightType  → 'PERCENTAGE' | 'FIXED_SCORE'
//
// Lógica de score por secção (espelha o backend):
//
//   SIMPLE:
//     score_secção = (corretas / total) × 20
//     — o peso não existe, todas as questões valem o mesmo
//
//   WEIGHTED + PERCENTAGE:
//     score_secção = (corretas / total) × 20
//     — mostra o desempenho bruto na escala 0–20
//     — weight é mostrado como "peso" informativo (ex: "30%")
//
//   WEIGHTED + FIXED_SCORE:
//     score_secção = (corretas / total) × weight
//     — weight já é o valor máximo da secção na escala final
//     — ex: secção vale 8 pontos → score_secção ∈ [0, 8]
//
// O scoreDisplay é sempre o que aparece na barra — escala consistente com
// o score global (0–20), por isso FIXED_SCORE normaliza para 0–20 para exibição.
//
function buildSectionBreakdown(sections, answers, scoringMode, weightType) {
  if (!sections?.length || !answers?.length) return [];

  // Contar corretas e total por sectionId
  const stats = {};
  for (const answer of answers) {
    const sid = answer.question?.sectionId;
    if (!sid) continue;
    if (!stats[sid]) stats[sid] = { correct: 0, total: 0 };
    stats[sid].total++;
    const isCorrect =
      answer.question?.options?.find(
        (o) => o.id === answer.selectedOption?.id
      )?.isCorrect ?? false;
    if (isCorrect) stats[sid].correct++;
  }

  return sections
    .map((s) => {
      const st     = stats[s.id] ?? { correct: 0, total: 0 };
      if (st.total === 0) return null;

      const ratio  = st.correct / st.total;
      const weight = s.weight ?? null;

      let scoreDisplay;   // valor 0–20 para a barra e label
      let scoreLabel;     // texto junto ao nome ("8.5 val/20" ou "8.5/8 pts")
      let weightLabel;    // texto do peso informativo ("30%" ou "8 pts")

      if (scoringMode === 'WEIGHTED' && weightType === 'FIXED_SCORE' && weight != null) {
        // Secção vale `weight` pontos no total final
        const rawScore   = parseFloat((ratio * weight).toFixed(1));
        scoreDisplay     = parseFloat(((rawScore / weight) * 20).toFixed(1)); // normalizado para barra
        scoreLabel       = `${rawScore} / ${weight} pts`;
        weightLabel      = `${weight} pts`;
      } else {
        // SIMPLE ou WEIGHTED+PERCENTAGE — mostrar em 0–20
        scoreDisplay     = parseFloat((ratio * 20).toFixed(1));
        scoreLabel       = `${scoreDisplay} val/20`;
        weightLabel      = weight != null ? `${weight}%` : null;
      }

      return {
        id:          s.id,
        name:        s.subject?.name ?? 'Disciplina',
        score:       scoreDisplay,   // 0–20 normalizado para barra
        scoreLabel,                  // texto exacto que aparece à direita
        weightLabel,                 // peso informativo (ou null se SIMPLE)
        correct:     st.correct,
        total:       st.total,
      };
    })
    .filter(Boolean);
}

// ─── Score circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score, maxScore, animated }) {
  const SIZE = 160;
  const SW   = 11;
  const R    = (SIZE - SW) / 2;
  const CIRC = 2 * Math.PI * R;
  const pct  = score / maxScore;
  const theme = getTheme(score);

  const [displayScore, setDisplayScore] = useState(0);
  const [offset, setOffset]             = useState(CIRC);

  useEffect(() => {
    if (!animated) return;
    const tArc = setTimeout(() => setOffset(CIRC - pct * CIRC), 80);
    const duration = 700;
    const start = performance.now();
    const raf = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayScore(parseFloat((ease * score).toFixed(1)))
      if (t < 1) requestAnimationFrame(raf);
    };
    const tNum = setTimeout(() => requestAnimationFrame(raf), 80);
    return () => { clearTimeout(tArc); clearTimeout(tNum); };
  }, [animated, score, pct, CIRC]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <svg
        width={SIZE} height={SIZE}
        style={{ width: 'clamp(130px, 18vw, 160px)', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <filter id="arc-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor={theme.arc} floodOpacity="0.15" />
          </filter>
        </defs>
        <circle cx={SIZE/2} cy={SIZE/2} r={R}
          fill="none" stroke={theme.arcBg} strokeWidth={SW} />
        <circle cx={SIZE/2} cy={SIZE/2} r={R}
          fill="none" stroke={theme.arc} strokeWidth={SW}
          strokeDasharray={CIRC} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.34,1.56,0.64,1)' }}
          filter="url(#arc-shadow)"
        />
        <text x={SIZE/2} y={SIZE/2 - 10}
          textAnchor="middle" fill={theme.number}
          fontSize="32" fontWeight="500" fontFamily="Inter, sans-serif" letterSpacing="-1">
          {displayScore}
        </text>
        <text x={SIZE/2} y={SIZE/2 + 8}
          textAnchor="middle" fill={theme.number}
          fontSize="11" fontFamily="Inter, sans-serif" opacity="0.7">
          val
        </text>
        <text x={SIZE/2} y={SIZE/2 + 26}
          textAnchor="middle" fill="#8898AA"
          fontSize="13" fontFamily="Inter, sans-serif">
          /{maxScore}
        </text>
      </svg>
      <span style={{
        backgroundColor: theme.pillBg, color: theme.pillText,
        borderRadius: 999, padding: '5px 18px',
        fontSize: 13, fontWeight: 500, letterSpacing: '0.01em',
      }}>
        {getClassification(score)}
      </span>
    </div>
  );
}

// ─── Section bar row ──────────────────────────────────────────────────────────

function SubjectBar({ subject, visible, index }) {
  const theme = getTheme(subject.score);
  const pct   = Math.min((subject.score / 20) * 100, 100);
  const delay = `${index * 70}ms`;

  return (
    <div style={{ padding: '14px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#1E2A3A', fontSize: 14, fontWeight: 500 }}>
            {subject.name}
          </span>
          {subject.weightLabel && (
            <span style={{
              backgroundColor: '#F1F5F9', color: '#64748B',
              borderRadius: 999, padding: '2px 8px',
              fontSize: 11, fontWeight: 500,
            }}>
              {subject.weightLabel}
            </span>
          )}
        </div>
        <span style={{ color: theme.number, fontSize: 13, fontWeight: 500 }}>
          {subject.scoreLabel}
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 999, backgroundColor: '#EDF1F7', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          backgroundColor: theme.barFill,
          width: visible ? `${pct}%` : '0%',
          transition: visible ? `width 0.55s ease-out ${delay}` : 'none',
        }} />
      </div>
      <p style={{ color: '#A0ADBF', fontSize: 11, marginTop: 5 }}>
        {subject.correct} correctas de {subject.total} questões
      </p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ w = '100%', h = 14, r = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      backgroundColor: '#EDF1F7',
      animation: 'sk-pulse 1.4s ease-in-out infinite',
    }} />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { id }         = useParams();
  const [searchParams] = useSearchParams();
  const { user }       = useAuth();
  const attemptId      = searchParams.get('attemptId');

  const [attempt,  setAttempt]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [animated, setAnimated] = useState(false);
  const [barsOn,   setBarsOn]   = useState(false);
  const barsRef = useRef(null);

  // ── Fetch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!attemptId) {
      setError('ID de tentativa em falta. Tenta iniciar a simulação novamente.');
      setLoading(false);
      return;
    }
    api.get(`/simulations/attempts/${attemptId}`)
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setAttempt(d);
      })
      .catch(() => setError('Não foi possível carregar os resultados.'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  // ── Trigger animations ──────────────────────────────────────────────────
  useEffect(() => {
    if (!attempt) return;
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, [attempt]);

  // ── IntersectionObserver for bars ───────────────────────────────────────
  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setBarsOn(true); },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [attempt]);

  // ── Derived values ──────────────────────────────────────────────────────
  const isLoggedIn = !!user;
  const firstName  = (user?.studentData?.fullName ?? user?.fullName ?? '')
                       .split(' ')[0] || null;

  // score vem directamente do campo ExamAttempt.score (calculado no submit)
  const score    = attempt ? parseFloat((attempt.score ?? 0).toFixed(1)) : 0;
  const maxScore = 20;
  const isPass   = score >= 10;
  const theme    = getTheme(score);

  // Totais — calculados a partir das respostas
  const answers  = attempt?.answers ?? [];
  const total    = answers.length;
  const correct  = answers.filter((a) => {
    return a.question?.options?.find(
      (o) => o.id === a.selectedOption?.id
    )?.isCorrect ?? false;
  }).length;
  const wrong    = total - correct;

  const examTitle = attempt?.examTitle ?? attempt?.exam?.title ?? 'Simulação';

  // Breakdown por secção — calculado a partir das respostas, respeitando scoringMode e weightType
  const scoringMode = attempt?.scoringMode ?? 'SIMPLE';
  const weightType  = attempt?.weightType  ?? 'PERCENTAGE';
  const sections    = buildSectionBreakdown(
    attempt?.sections ?? [],
    answers,
    scoringMode,
    weightType,
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>

      <style>{`
        @keyframes sk-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
      `}</style>

      {/* Top bar */}
      <header style={{
        height: 64, backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E7EDF5',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', padding: '0 24px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link to="/simulations" style={{
          color: '#1A3A5C', fontSize: 14, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 6,
          textDecoration: 'none', flexShrink: 0,
        }}>
          <ArrowLeft size={16} />
          Simulações
        </Link>
        <span style={{
          flex: 1, textAlign: 'center', color: '#1E2A3A',
          fontSize: 15, fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          padding: '0 16px',
        }}>
          {!loading && examTitle}
        </span>
        <div style={{ width: 80, flexShrink: 0 }} />
      </header>

      <main style={{ maxWidth: 660, margin: '0 auto', padding: '0 20px 56px' }}>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 48, border: '1px solid #F5E0E3', borderRadius: 16,
            padding: '36px 24px', textAlign: 'center', backgroundColor: '#FDF8F8',
          }}>
            <p style={{ color: '#8B2635', fontSize: 15, fontWeight: 500, marginBottom: 16 }}>
              {error}
            </p>
            <Link to={`/simulation/${id}`} style={{
              display: 'inline-block', backgroundColor: '#1A3A5C', color: '#fff',
              borderRadius: 999, padding: '10px 28px',
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
            }}>
              Voltar à simulação
            </Link>
          </div>
        )}

        {/* Skeleton */}
        {loading && !error && (
          <div style={{ paddingTop: 52 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 44 }}>
              <Sk w={160} h={160} r={999} />
              <Sk w={90}  h={28}  r={999} />
              <Sk w={300} h={22}  r={8}   />
              <Sk w={200} h={16}  r={8}   />
            </div>
            <div style={{ border: '1px solid #E7EDF5', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              {[1,2,3].map((i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Sk w={120} h={14} r={6} />
                    <Sk w={60}  h={14} r={6} />
                  </div>
                  <Sk w="100%" h={5} r={999} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && !error && attempt && (
          <>
            {/* Hero */}
            <section style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              paddingTop: 52, paddingBottom: 44,
            }}>
              <ScoreCircle score={score} maxScore={maxScore} animated={animated} />

              <h1 style={{
                color: '#1E2A3A', fontSize: 22, fontWeight: 500,
                marginTop: 28, marginBottom: 8,
                textAlign: 'center', lineHeight: 1.35, letterSpacing: '-0.01em',
              }}>
                {isPass
                  ? (firstName ? `Parabéns, ${firstName}!` : 'Parabéns — passaste na simulação!')
                  : (firstName ? `${firstName}, continua a praticar.` : 'Continua a praticar — cada tentativa conta.')}
              </h1>

              <p style={{ color: '#5F6D7E', fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
                {isPass
                  ? `Respondeste correctamente a ${correct} de ${total} questões.`
                  : `Respondeste correctamente a ${correct} de ${total} questões — não desistas.`}
              </p>

              {/* Stats */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                gap: 12, width: '100%', maxWidth: 480, marginTop: 32,
              }}>
                {[
                  { icon: <CheckCircle size={15} color="#2E6DA4" />, label: 'Correctas', value: correct, color: '#1A3A5C' },
                  { icon: <XCircle     size={15} color="#8B2635" />, label: 'Erradas',   value: wrong,   color: '#8B2635' },
                  { icon: <ClipboardList size={15} color="#5F6D7E" />, label: 'Total',   value: total,   color: '#1E2A3A' },
                ].map((s) => (
                  <div key={s.label} style={{
                    border: '1px solid #E7EDF5', borderRadius: 14,
                    padding: '18px 10px', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                    {s.icon}
                    <span style={{ color: s.color, fontSize: 26, fontWeight: 500, lineHeight: 1.1 }}>
                      {s.value}
                    </span>
                    <span style={{ color: '#8898AA', fontSize: 12 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section breakdown */}
            {sections.length > 0 && (
              <section ref={barsRef} style={{
                border: '1px solid #E7EDF5', borderRadius: 16,
                padding: '20px 24px', marginBottom: 16,
              }}>
                <h2 style={{
                  color: '#8898AA', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4,
                }}>
                  Desempenho por disciplina
                </h2>
                {sections.map((s, i) => (
                  <div key={s.id}>
                    <SubjectBar subject={s} visible={barsOn} index={i} />
                    {i < sections.length - 1 && (
                      <div style={{ height: 1, backgroundColor: '#F4F7FB' }} />
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Scale legend */}
            <section style={{
              backgroundColor: '#F8FAFC', border: '1px solid #E7EDF5',
              borderRadius: 12, padding: '14px 20px', marginBottom: 20,
            }}>
              <p style={{
                color: '#8898AA', fontSize: 11, fontWeight: 500,
                letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10,
              }}>
                Escala angolana
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { range: '17–20', label: 'Excelente',    bg: '#EBF2FA', color: '#1A3A5C' },
                  { range: '14–16', label: 'Muito Bom',    bg: '#E6F4F2', color: '#0D6E6A' },
                  { range: '10–13', label: 'Suficiente',   bg: '#EAF5EC', color: '#1A6B2E' },
                  { range: '7–9',   label: 'Fraco',        bg: '#F1F5F9', color: '#475569' },
                  { range: '0–6',   label: 'Insuficiente', bg: '#FDF0F1', color: '#8B2635' },
                ].map((item) => (
                  <span key={item.label} style={{
                    backgroundColor: item.bg, color: item.color,
                    borderRadius: 999, padding: '4px 12px',
                    fontSize: 12, fontWeight: 500,
                  }}>
                    {item.range} · {item.label}
                  </span>
                ))}
              </div>
            </section>

            {/* Anonymous banner */}
            {!isLoggedIn && (
              <section style={{
                backgroundColor: '#EBF2FA', border: '1.5px solid #C2D8EE',
                borderRadius: 16, padding: '24px', marginBottom: 28,
              }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    backgroundColor: '#D0E4F4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <UserCircle size={26} color="#1A3A5C" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p style={{ color: '#1E2A3A', fontSize: 15, fontWeight: 500, marginBottom: 6, lineHeight: 1.3 }}>
                      Os teus resultados vão desaparecer
                    </p>
                    <p style={{ color: '#5F6D7E', fontSize: 13, lineHeight: 1.65, marginBottom: 6 }}>
                      Cria uma conta gratuita para guardar este resultado, acompanhar a tua evolução e receber recomendações personalizadas.
                    </p>
                    <p style={{ color: '#A0ADBF', fontSize: 11 }}>
                      Já fizeste outras simulações? Os resultados são automaticamente associados à tua conta.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/signup" style={{
                    display: 'block', textAlign: 'center',
                    backgroundColor: '#1A3A5C', color: '#fff',
                    borderRadius: 999, padding: '13px 24px',
                    fontSize: 14, fontWeight: 500, textDecoration: 'none',
                  }}>
                    Criar conta gratuita
                  </Link>
                  <Link to="/login" style={{
                    display: 'block', textAlign: 'center',
                    color: '#1A3A5C', fontSize: 13,
                    textDecoration: 'none', padding: '6px 0', opacity: 0.8,
                  }}>
                    Já tenho conta — entrar
                  </Link>
                </div>
              </section>
            )}

            {/* Action buttons */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 12,
              maxWidth: 400, margin: '0 auto',
            }}>
              <Link to={`/simulation/${id}`} style={{
                display: 'block', textAlign: 'center',
                border: '1.5px solid #1A3A5C', color: '#1A3A5C',
                borderRadius: 999, padding: '12px 28px',
                fontSize: 14, fontWeight: 500,
                backgroundColor: '#FFFFFF', textDecoration: 'none',
              }}>
                Tentar novamente
              </Link>
              <Link to="/simulations" style={{
                display: 'block', textAlign: 'center',
                backgroundColor: '#1A3A5C', color: '#FFFFFF',
                borderRadius: 999, padding: '12px 28px',
                fontSize: 14, fontWeight: 500, textDecoration: 'none',
              }}>
                Ver todas as simulações
              </Link>
            </div>
          </>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '20px 0 32px' }}>
        <a href="https://contornos.design" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 10, color: '#C0CBD8', textDecoration: 'none' }}>
          Desenvolvido por <strong>CONTORNOS Designs</strong>
        </a>
      </footer>
    </div>
  );
}
