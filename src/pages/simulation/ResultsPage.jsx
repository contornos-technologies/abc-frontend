import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, ClipboardList,
  Share2, X, User, BookOpen, Atom, FlaskConical,
  Leaf, Languages, Calculator, Globe, Pencil,
  RefreshCw, GraduationCap, Trophy, Flame, Zap, Star,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logoWhite from '../../assets/logo-white.svg';

// ─── Tema por faixa ───────────────────────────────────────────────────────────

function getTheme(score) {
  if (score >= 18) return {
    gradient: 'linear-gradient(135deg, #064E3B 0%, #065F46 45%, #059669 100%)',
    gradientLight: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
    accent: '#10B981', accentDark: '#065F46', accentLight: '#D1FAE5',
    text: '#064E3B', bar: '#10B981', barBg: '#D1FAE5',
    arcStroke: 'white', label: 'Excelente',
    Icon: Trophy,
    heroMsg: (name) => name ? `Impressionante, ${name}!` : 'Impressionante resultado!',
    heroSub: 'Estás pronto para o exame. Mantém este nível de preparação.',
    ctaMsg: 'Tenta um exame mais difícil',
    confettiColors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#ffffff'],
  };
  if (score >= 14) return {
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 45%, #4F46E5 100%)',
    gradientLight: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
    accent: '#6366F1', accentDark: '#3730A3', accentLight: '#E0E7FF',
    text: '#1E1B4B', bar: '#6366F1', barBg: '#E0E7FF',
    arcStroke: 'white', label: 'Muito Bom',
    Icon: Star,
    heroMsg: (name) => name ? `Excelente trabalho, ${name}!` : 'Excelente trabalho!',
    heroSub: 'Estás no bom caminho. Continua assim e alcançarás resultados ainda melhores.',
    ctaMsg: 'Tenta outra simulação',
    confettiColors: ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#ffffff'],
  };
  if (score >= 10) return {
    gradient: 'linear-gradient(135deg, #1E3A5F 0%, #1565A8 45%, #2563EB 100%)',
    gradientLight: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    accent: '#3B82F6', accentDark: '#1565A8', accentLight: '#DBEAFE',
    text: '#1E3A5F', bar: '#3B82F6', barBg: '#DBEAFE',
    arcStroke: 'white', label: 'Suficiente',
    Icon: Flame,
    heroMsg: (name) => name ? `Aprovado, ${name}!` : 'Aprovado!',
    heroSub: 'Bom resultado. Com mais prática podes subir ainda mais a nota.',
    ctaMsg: 'Continua a praticar',
    confettiColors: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#ffffff'],
  };
  if (score >= 7) return {
    gradient: 'linear-gradient(135deg, #78350F 0%, #B45309 45%, #D97706 100%)',
    gradientLight: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
    accent: '#F59E0B', accentDark: '#B45309', accentLight: '#FEF3C7',
    text: '#78350F', bar: '#F59E0B', barBg: '#FEF3C7',
    arcStroke: 'white', label: 'Fraco',
    Icon: Zap,
    heroMsg: (name) => name ? `Quase lá, ${name}!` : 'Quase lá!',
    heroSub: 'Com mais prática chegas lá. Cada tentativa conta.',
    ctaMsg: 'Tenta outra vez',
    confettiColors: ['#F59E0B', '#FCD34D', '#FDE68A', '#FEF3C7', '#ffffff'],
  };
  return {
    gradient: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 45%, #DC2626 100%)',
    gradientLight: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
    accent: '#EF4444', accentDark: '#B91C1C', accentLight: '#FEE2E2',
    text: '#7F1D1D', bar: '#EF4444', barBg: '#FEE2E2',
    arcStroke: 'white', label: 'Insuficiente',
    Icon: Flame,
    heroMsg: (name) => name ? `Não desistas, ${name}!` : 'Não desistas!',
    heroSub: 'Cada erro é uma lição. Com dedicação vais melhorar.',
    ctaMsg: 'Tenta novamente',
    confettiColors: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#ffffff'],
  };
}

// ─── Formatar nota ────────────────────────────────────────────────────────────

function formatScore(score) {
  const fixed = parseFloat(parseFloat(score).toFixed(2));
  if (fixed % 1 === 0) return fixed.toFixed(0);
  // Se a parte decimal termina em 0 (ex: 7.20), manter duas casas
  return fixed.toFixed(2);
}

// ─── Ícone por disciplina ─────────────────────────────────────────────────────

const DISCIPLINE_CONFIG = {
  'Matemática':                            { Icon: Calculator,   bg: '#EEF2FF', color: '#4F46E5' },
  'Física':                                { Icon: Atom,         bg: '#EFF6FF', color: '#2563EB' },
  'Química':                               { Icon: FlaskConical, bg: '#F0FDF4', color: '#16A34A' },
  'Biologia':                              { Icon: Leaf,         bg: '#F0FDF4', color: '#15803D' },
  'Língua Portuguesa':                     { Icon: BookOpen,     bg: '#FFF7ED', color: '#EA580C' },
  'História Universal':                    { Icon: Globe,        bg: '#FDF4FF', color: '#9333EA' },
  'História Económica e Social de Angola': { Icon: Globe,        bg: '#FDF4FF', color: '#7C3AED' },
  'HESA':                                  { Icon: Globe,        bg: '#FDF4FF', color: '#7C3AED' },
  'Inglês':                                { Icon: Languages,    bg: '#ECFDF5', color: '#059669' },
  'Desenho Técnico':                       { Icon: Pencil,       bg: '#FFF1F2', color: '#E11D48' },
};

function getDisciplineConfig(name) {
  return DISCIPLINE_CONFIG[name] ?? { Icon: BookOpen, bg: '#F8FAFC', color: '#64748B' };
}

// ─── Breakdown por secção ─────────────────────────────────────────────────────

function buildSectionBreakdown(sections, answers, scoringMode, weightType) {
  if (!sections?.length || !answers?.length) return [];
  const stats = {};
  for (const answer of answers) {
    const sid = answer.question?.sectionId;
    if (!sid) continue;
    if (!stats[sid]) stats[sid] = { correct: 0, total: 0 };
    stats[sid].total++;
    const isCorrect = answer.question?.options?.find(
      (o) => o.id === answer.selectedOption?.id
    )?.isCorrect ?? false;
    if (isCorrect) stats[sid].correct++;
  }
  return sections.map((s) => {
    const st = stats[s.id] ?? { correct: 0, total: 0 };
    if (st.total === 0) return null;
    const ratio = st.correct / st.total;
    const weight = s.weight ?? null;
    let scoreDisplay, scoreLabel, weightLabel, pct;
    if (scoringMode === 'WEIGHTED' && weightType === 'FIXED_SCORE' && weight != null) {
      const rawScore = parseFloat((ratio * weight).toFixed(2));
      scoreDisplay = parseFloat(((rawScore / weight) * 20).toFixed(2));
      scoreLabel = `${formatScore(rawScore)} / ${weight} pts`;
      weightLabel = `${weight} pts`;
      pct = (rawScore / weight) * 100;
    } else {
      scoreDisplay = parseFloat((ratio * 20).toFixed(2));
      scoreLabel = `${formatScore(scoreDisplay)} / 20`;
      weightLabel = weight != null ? `${weight}%` : null;
      pct = ratio * 100;
    }
    return {
      id: s.id, name: s.subject?.name ?? 'Disciplina',
      score: scoreDisplay, scoreLabel, weightLabel,
      correct: st.correct, total: st.total,
      pct: Math.min(pct, 100),
    };
  }).filter(Boolean);
}

// ─── Confettis CSS ────────────────────────────────────────────────────────────

function Confetti({ colors }) {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${5 + (i * 5.5) % 90}%`,
    delay: `${(i * 0.18) % 2}s`,
    duration: `${2.5 + (i % 4) * 0.4}s`,
    size: 6 + (i % 3) * 3,
    rotate: i % 2 === 0 ? 45 : 0,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: 'absolute', top: '-10px', left: p.left,
          width: p.size, height: p.size,
          backgroundColor: p.rotate === 45 ? 'transparent' : p.color,
          borderTop: p.rotate === 45 ? `${p.size/2}px solid transparent` : 'none',
          borderBottom: p.rotate === 45 ? `${p.size/2}px solid transparent` : 'none',
          borderLeft: p.rotate === 45 ? `${p.size/2}px solid ${p.color}` : 'none',
          borderRadius: p.rotate === 0 ? '50%' : 0,
          opacity: 0.75,
          animation: `confettiFall ${p.duration} ${p.delay} ease-in infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Score Circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score, maxScore, animated }) {
  const SIZE = 170; const SW = 11;
  const R = (SIZE - SW) / 2;
  const CIRC = 2 * Math.PI * R;
  const pct = score / maxScore;
  const [displayScore, setDisplayScore] = useState(0);
  const [offset, setOffset] = useState(CIRC);

  useEffect(() => {
    if (!animated) return;
    const tArc = setTimeout(() => setOffset(CIRC - pct * CIRC), 100);
    const duration = 900;
    const start = performance.now();
    const raf = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayScore(parseFloat((ease * score).toFixed(2)));
      if (t < 1) requestAnimationFrame(raf);
    };
    const tNum = setTimeout(() => requestAnimationFrame(raf), 100);
    return () => { clearTimeout(tArc); clearTimeout(tNum); };
  }, [animated, score, pct, CIRC]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
        A tua nota
      </p>
      <svg width={SIZE} height={SIZE} style={{ overflow: 'visible' }}>
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={SW} />
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="white" strokeWidth={SW}
          strokeDasharray={CIRC} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.6))' }}
        />
        <text x={SIZE/2} y={SIZE/2 - 10} textAnchor="middle" fill="white"
          fontSize="40" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="-2">
          {formatScore(displayScore)}
        </text>
        <text x={SIZE/2} y={SIZE/2 + 20} textAnchor="middle" fill="rgba(255,255,255,0.6)"
          fontSize="15" fontFamily="Inter, sans-serif" fontWeight="500">
          / {maxScore}
        </text>
      </svg>
    </div>
  );
}

// ─── Subject Bar ──────────────────────────────────────────────────────────────

function SubjectBar({ subject, visible, index, theme }) {
  const delay = `${index * 80}ms`;
  const cfg = getDisciplineConfig(subject.name);
  const Icon = cfg.Icon;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={cfg.color} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ color: '#1E2A3A', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
              {subject.name}
            </span>
            {subject.weightLabel && (
              <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
                {subject.weightLabel}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ color: theme.accentDark, fontSize: 14, fontWeight: 700 }}>
              {subject.scoreLabel}
            </span>
            <span style={{ color: theme.accent, fontSize: 12, fontWeight: 600, minWidth: 42, textAlign: 'right' }}>
              {subject.pct.toFixed(1)}%
            </span>
          </div>
        </div>
        <div style={{ height: 7, borderRadius: 999, backgroundColor: theme.barBg, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 999, backgroundColor: theme.bar, width: visible ? `${subject.pct}%` : '0%', transition: visible ? `width 0.65s ease-out ${delay}` : 'none' }} />
        </div>
        <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 5 }}>
          {subject.correct} correctas de {subject.total} questões
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ w = '100%', h = 16, r = 8 }) {
  return <div style={{ width: w, height: h, borderRadius: r, backgroundColor: '#EDF1F7', animation: 'sk-pulse 1.4s ease-in-out infinite' }} />;
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

function ShareModal({ score, classification, examTitle, facultyLabel, universityLabel, theme, onClose, defaultName }) {
  const [name, setName] = useState(defaultName || '');
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const bannerRef = useRef(null);

  const displayName = name.trim() || 'Estudante ABC';

  const generateImage = useCallback(async () => {
    const html2canvas = (await import('html2canvas')).default;
    return html2canvas(bannerRef.current, {
      scale: 2, useCORS: true, allowTaint: true, backgroundColor: null,
      logging: false,
    });
  }, []);

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      const canvas = await generateImage();
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'resultado-abc.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'O meu resultado — ABC',
            text: `Obtive ${formatScore(score)}/20 — ${classification} no ABC!`,
          });
        } else {
          // Fallback: download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'resultado-abc.png'; a.click();
          URL.revokeObjectURL(url);
        }
        setSharing(false);
      }, 'image/png');
    } catch { setSharing(false); }
  }, [generateImage, score, classification]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = await generateImage();
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'resultado-abc.png'; a.click();
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 'image/png');
    } catch { setDownloading(false); }
  }, [generateImage]);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div style={{ backgroundColor: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px 44px', width: '100%', maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}>

        <div style={{ width: 44, height: 4, borderRadius: 999, backgroundColor: '#E2E8F0', margin: '0 auto 24px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: '#1E2A3A' }}>Partilhar resultado</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={22} color="#64748B" />
          </button>
        </div>

        {/* Campo de nome — só para anónimos */}
        {!defaultName && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 7 }}>
              O teu nome (opcional)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '11px 16px' }}>
              <User size={17} color="#94A3B8" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                style={{ border: 'none', outline: 'none', fontSize: 15, color: '#1E2A3A', flex: 1, backgroundColor: 'transparent' }}
                maxLength={30} />
            </div>
          </div>
        )}

        {/* Preview do banner */}
        <p style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
          Pré-visualização
        </p>
        <div style={{ marginBottom: 20, borderRadius: 16, overflow: 'hidden', boxShadow: '0 6px 28px rgba(0,0,0,0.15)' }}>
          <div ref={bannerRef} style={{ background: theme.gradient, padding: '32px 28px', position: 'relative', overflow: 'hidden', minHeight: 220 }}>
            {/* Círculos decorativos */}
            <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)' }} />
            <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />

            {/* Header do banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, position: 'relative', zIndex: 2 }}>
              <img src={logoWhite} alt="ABC" style={{ height: 30, filter: 'brightness(0) invert(1)' }} />
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '0.06em' }}>SIMULAÇÃO ABC</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>abchuambo.com</p>
              </div>
            </div>

            {/* Detalhes do exame */}
            {(examTitle || facultyLabel || universityLabel) && (
              <div style={{ marginBottom: 16, position: 'relative', zIndex: 2 }}>
                {examTitle && (
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{examTitle}</p>
                )}
                {(facultyLabel || universityLabel) && (
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                    {[facultyLabel, universityLabel].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            )}

            {/* Nome */}
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4, position: 'relative', zIndex: 2 }}>
              {displayName} obteve
            </p>

            {/* Nota */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10, position: 'relative', zIndex: 2 }}>
              <span style={{ color: 'white', fontSize: 52, fontWeight: 800, lineHeight: 1, letterSpacing: '-2px' }}>
                {formatScore(score)}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 20, fontWeight: 500 }}>/20</span>
            </div>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: '6px 16px', position: 'relative', zIndex: 2 }}>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }}>{classification}</span>
            </div>

            {/* Tagline */}
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 16, position: 'relative', zIndex: 2 }}>
              Estuda hoje, conquista o amanhã.
            </p>
          </div>
        </div>

        {/* Botões */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={handleDownload} disabled={downloading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 600, color: '#1E2A3A', cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1 }}>
            <Download size={17} />
            {downloading ? 'A guardar...' : 'Guardar imagem'}
          </button>
          <button onClick={handleShare} disabled={sharing}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: theme.gradient, border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 600, color: 'white', cursor: sharing ? 'not-allowed' : 'pointer', opacity: sharing ? 0.7 : 1 }}>
            <Share2 size={17} />
            {sharing ? 'A partilhar...' : 'Partilhar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const attemptId = searchParams.get('attemptId');

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animated, setAnimated] = useState(false);
  const [barsOn, setBarsOn] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const barsRef = useRef(null);

  useEffect(() => {
    if (!attemptId) { setError('ID de tentativa em falta. Tenta iniciar a simulação novamente.'); setLoading(false); return; }
    api.get(`/simulations/attempts/${attemptId}`)
      .then((res) => setAttempt(res.data?.data ?? res.data))
      .catch(() => setError('Não foi possível carregar os resultados.'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  useEffect(() => {
    if (!attempt) return;
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, [attempt]);

  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setBarsOn(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [attempt]);

  const isLoggedIn = !!user;
  const firstName = (user?.studentData?.fullName ?? user?.fullName ?? '').split(' ')[0] || null;

  const score = attempt ? parseFloat((attempt.score ?? 0).toFixed(2)) : 0;
  const maxScore = 20;
  const theme = getTheme(score);
  const ThemeIcon = theme.Icon;

  const answers = attempt?.answers ?? [];
  const total = answers.length;
  const correct = answers.filter((a) => a.question?.options?.find((o) => o.id === a.selectedOption?.id)?.isCorrect ?? false).length;
  const wrong = total - correct;
  const correctPct = total > 0 ? ((correct / total) * 100).toFixed(1) : '0.0';
  const wrongPct   = total > 0 ? ((wrong   / total) * 100).toFixed(1) : '0.0';

  const examTitle     = attempt?.examTitle ?? attempt?.exam?.title ?? null;
  const facultyLabel  = attempt?.exam?.targetFaculty?.name ?? attempt?.exam?.targetFacultyName ?? null;
  const universityLabel = attempt?.exam?.targetUniversity?.name ?? null;

  const scoringMode = attempt?.scoringMode ?? 'SIMPLE';
  const weightType  = attempt?.weightType  ?? 'PERCENTAGE';
  const sections    = buildSectionBreakdown(attempt?.sections ?? [], answers, scoringMode, weightType);

  const SCALE = [
    { range: '0 – 6',   label: 'Insuficiente', color: '#DC2626', bg: '#FEF2F2', active: score <= 6 },
    { range: '7 – 9',   label: 'Fraco',         color: '#D97706', bg: '#FFFBEB', active: score >= 7  && score <= 9  },
    { range: '10 – 13', label: 'Suficiente',    color: '#1565A8', bg: '#EFF6FF', active: score >= 10 && score <= 13 },
    { range: '14 – 17', label: 'Muito Bom',     color: '#4F46E5', bg: '#EEF2FF', active: score >= 14 && score <= 17 },
    { range: '18 – 20', label: 'Excelente',     color: '#16A34A', bg: '#ECFDF5', active: score >= 18 },
  ];
  const activeScale = SCALE.find((s) => s.active);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F4F8FC', minHeight: '100vh' }}>
      <style>{`
        @keyframes sk-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 0.8; }
          100% { transform: translateY(340px) rotate(540deg); opacity: 0; }
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {showShare && (
        <ShareModal
          score={score}
          classification={theme.label}
          examTitle={examTitle}
          facultyLabel={facultyLabel}
          universityLabel={universityLabel}
          theme={theme}
          onClose={() => setShowShare(false)}
          defaultName={firstName}
        />
      )}

      {/* ── HERO ── */}
      <div style={{ background: theme.gradient, position: 'relative', overflow: 'hidden', paddingBottom: 56 }}>
        <Confetti colors={theme.confettiColors} />

        {/* Círculos de fundo */}
        <div style={{ position: 'absolute', top: -70, right: -70, width: 260, height: 260, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: 10, left: -50, width: 200, height: 200, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)', zIndex: 1 }} />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', position: 'relative', zIndex: 3 }}>
          <Link to="/simulations" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <ArrowLeft size={17} />
            Simulações
          </Link>
          <img src={logoWhite} alt="ABC" style={{ height: 30, filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
          <button onClick={() => setShowShare(true)} style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '8px 16px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Share2 size={14} />
            Partilhar
          </button>
        </div>

        {/* Conteúdo do hero */}
        <div style={{ maxWidth: 660, margin: '0 auto', padding: '16px 24px 0', position: 'relative', zIndex: 3 }}>
          {/* Detalhes do exame — acima do conteúdo principal */}
          {!loading && (examTitle || facultyLabel || universityLabel) && (
            <div style={{ marginBottom: 20, padding: '10px 16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' }}>
              {examTitle && (
                <p style={{ color: 'white', fontSize: 14, fontWeight: 700, marginBottom: facultyLabel || universityLabel ? 3 : 0 }}>
                  {examTitle}
                </p>
              )}
              {(facultyLabel || universityLabel) && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                  {[facultyLabel, universityLabel].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Círculo */}
            <div style={{ flexShrink: 0 }}>
              <ScoreCircle score={score} maxScore={maxScore} animated={animated} />
            </div>

            {/* Texto */}
            <div style={{ flex: 1, minWidth: 200, animation: animated ? 'fadeUp 0.5s ease-out' : 'none' }}>
              {/* Badge classificação */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 14 }}>
                <span style={{ color: 'white', fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{theme.label}</span>
              </div>

              <h1 style={{ color: 'white', fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 12 }}>
                {theme.heroMsg(firstName)}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.65, marginBottom: 22 }}>
                {theme.heroSub}
              </p>

              <Link to={`/simulation/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 999, padding: '11px 22px', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                <RefreshCw size={15} />
                {theme.ctaMsg}
              </Link>
            </div>

            {/* Ícone decorativo */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 88, height: 88, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.13)', border: '2px solid rgba(255,255,255,0.22)', boxShadow: '0 0 40px rgba(255,255,255,0.12)' }}>
              <ThemeIcon size={40} color="white" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '0 20px 72px' }}>

        {/* Error */}
        {error && (
          <div style={{ marginTop: 44, border: '1px solid #FEE2E2', borderRadius: 16, padding: '36px 28px', textAlign: 'center', backgroundColor: '#FEF2F2' }}>
            <p style={{ color: '#DC2626', fontSize: 16, fontWeight: 500, marginBottom: 18 }}>{error}</p>
            <Link to={`/simulation/${id}`} style={{ display: 'inline-block', backgroundColor: '#1565A8', color: '#fff', borderRadius: 999, padding: '12px 32px', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Voltar à simulação
            </Link>
          </div>
        )}

        {/* Skeleton */}
        {loading && !error && (
          <div style={{ paddingTop: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
              {[1,2,3].map((i) => <Sk key={i} h={100} r={16} />)}
            </div>
            <Sk h={220} r={16} />
          </div>
        )}

        {!loading && !error && attempt && (
          <>
            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: -28, position: 'relative', zIndex: 3, marginBottom: 18 }}>
              {[
                { icon: <CheckCircle size={22} color="#16A34A" />, label: 'Correctas', value: correct, sub: `${correctPct}%`, color: '#16A34A', bg: '#ECFDF5' },
                { icon: <XCircle     size={22} color="#DC2626" />, label: 'Erradas',   value: wrong,   sub: `${wrongPct}%`,  color: '#DC2626', bg: '#FEF2F2' },
                { icon: <ClipboardList size={22} color="#1565A8" />, label: 'Total',   value: total,   sub: '100%',          color: '#1565A8', bg: '#EFF6FF' },
              ].map((s) => (
                <div key={s.label} style={{ backgroundColor: 'white', border: '1px solid #E7EDF5', borderRadius: 18, padding: '18px 10px', textAlign: 'center', boxShadow: '0 4px 20px rgba(7,28,53,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                    {s.icon}
                  </div>
                  <span style={{ color: s.color, fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{s.value}</span>
                  <span style={{ color: '#94A3B8', fontSize: 12, fontWeight: 500 }}>{s.label}</span>
                  <span style={{ color: s.color, fontSize: 13, fontWeight: 700 }}>{s.sub}</span>
                </div>
              ))}
            </div>

            {/* Breakdown por disciplina */}
            {sections.length > 0 && (
              <div ref={barsRef} style={{ backgroundColor: 'white', border: '1px solid #E7EDF5', borderRadius: 18, padding: '22px 22px', marginBottom: 18, boxShadow: '0 2px 14px rgba(7,28,53,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
                  <h2 style={{ color: '#1E2A3A', fontSize: 17, fontWeight: 700 }}>Desempenho por disciplina</h2>
                  <span style={{ color: '#94A3B8', fontSize: 13 }}>{sections.length} disciplina{sections.length !== 1 ? 's' : ''}</span>
                </div>
                {sections.map((s, i) => (
                  <div key={s.id}>
                    <SubjectBar subject={s} visible={barsOn} index={i} theme={theme} />
                    {i < sections.length - 1 && <div style={{ height: 1, backgroundColor: '#F4F7FB' }} />}
                  </div>
                ))}
              </div>
            )}

            {/* Escala angolana */}
            <div style={{ backgroundColor: 'white', border: '1px solid #E7EDF5', borderRadius: 18, padding: '22px 22px', marginBottom: 18, boxShadow: '0 2px 14px rgba(7,28,53,0.05)' }}>
              <h2 style={{ color: '#1E2A3A', fontSize: 17, fontWeight: 700, marginBottom: 18 }}>
                Escala de classificação (Angola)
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                {SCALE.map((item) => (
                  <div key={item.label} style={{ backgroundColor: item.active ? item.bg : '#F8FAFC', border: `2px solid ${item.active ? item.color : 'transparent'}`, borderRadius: 12, padding: '12px 6px', textAlign: 'center', transition: 'all 0.2s' }}>
                    <p style={{ color: item.color, fontSize: 12, fontWeight: 800, marginBottom: 3 }}>{item.range}</p>
                    <p style={{ color: item.active ? item.color : '#94A3B8', fontSize: 10, fontWeight: 600 }}>{item.label}</p>
                  </div>
                ))}
              </div>
              {activeScale && (
                <p style={{ color: '#5F6D7E', fontSize: 14, textAlign: 'center', marginTop: 14 }}>
                  A tua nota de{' '}
                  <strong style={{ color: activeScale.color }}>{formatScore(score)}</strong>
                  {' '}situa-te na classificação{' '}
                  <strong style={{ color: activeScale.color }}>{activeScale.label}</strong>.
                </p>
              )}
            </div>

            {/* Banner anónimo */}
            {!isLoggedIn && (
              <div style={{ background: theme.gradientLight, border: `1.5px solid ${theme.accent}25`, borderRadius: 18, padding: '26px', marginBottom: 18, boxShadow: '0 2px 14px rgba(7,28,53,0.05)' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'white', border: `2px solid ${theme.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <GraduationCap size={24} color={theme.accentDark} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ color: theme.text, fontSize: 17, fontWeight: 700, marginBottom: 7 }}>
                      Cria a tua conta gratuita e vai mais longe!
                    </p>
                    <p style={{ color: theme.text, fontSize: 14, lineHeight: 1.65, opacity: 0.75 }}>
                      Guarda este resultado, acompanha a tua evolução e recebe recomendações personalizadas.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 18 }}>
                  {['Guarda o teu histórico', 'Acompanha o teu progresso', 'Compara simulações', 'Recebe dicas personalizadas'].map((b) => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: theme.text, opacity: 0.8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: theme.accent, flexShrink: 0 }} />
                      {b}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/signup" style={{ display: 'block', textAlign: 'center', background: theme.gradient, color: 'white', borderRadius: 14, padding: '15px 24px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                    Criar conta gratuita
                  </Link>
                  <Link to="/login" style={{ display: 'block', textAlign: 'center', color: theme.accentDark, fontSize: 14, textDecoration: 'none', padding: '6px 0', fontWeight: 600 }}>
                    Já tenho conta — entrar
                  </Link>
                </div>
              </div>
            )}

            {/* Acções */}
            <div style={{ backgroundColor: 'white', border: '1px solid #E7EDF5', borderRadius: 18, padding: '22px', boxShadow: '0 2px 14px rgba(7,28,53,0.05)' }}>
              <p style={{ color: '#1E2A3A', fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 18 }}>
                O que queres fazer agora?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                <Link to={`/simulation/${id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: theme.gradient, color: 'white', borderRadius: 16, padding: '20px 12px', fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                  <RefreshCw size={22} />
                  Tentar outra vez
                </Link>
                <button onClick={() => setShowShare(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', border: '1.5px solid #E7EDF5', color: '#1E2A3A', borderRadius: 16, padding: '20px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                  <Share2 size={22} color={theme.accent} />
                  Partilhar resultado
                </button>
                <Link to="/simulations" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', border: '1.5px solid #E7EDF5', color: '#1E2A3A', borderRadius: 16, padding: '20px 12px', fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                  <ClipboardList size={22} color={theme.accent} />
                  Outras simulações
                </Link>
                <Link to="/about" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', border: '1.5px solid #E7EDF5', color: '#1E2A3A', borderRadius: 16, padding: '20px 12px', fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                  <GraduationCap size={22} color={theme.accent} />
                  Saber mais sobre o ABC
                </Link>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '16px 0 36px' }}>
        <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8 }}>Estuda hoje, conquista o amanhã.</p>
        <a href="#" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, color: '#C0CBD8', textDecoration: 'none' }}>
          Desenvolvido por <strong>CONTORNOS Designs</strong>
        </a>
      </footer>
    </div>
  );
}
