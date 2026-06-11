import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PublicLayout from '../../components/public/PublicLayout'
import {
  Zap,
  Search,
  FileText,
  Clock,
  Users,
  ChevronRight,
  Building2,
  SearchX,
  GraduationCap,
  Menu,
  X,
  BookOpen,
  TrendingUp,
  Star,
} from 'lucide-react'
import api from '../../services/api'



// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E7EDF5] rounded-[16px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] animate-pulse" />
        <div className="w-28 h-5 rounded-full bg-[#EEF4FF] animate-pulse" />
      </div>
      <div className="space-y-2 mb-2">
        <div className="h-4 bg-[#EEF4FF] rounded animate-pulse w-full" />
        <div className="h-4 bg-[#EEF4FF] rounded animate-pulse w-4/5" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-4 rounded bg-[#EEF4FF] animate-pulse" />
        <div className="h-3 bg-[#EEF4FF] rounded animate-pulse w-44" />
      </div>
      <div className="mb-1">
        <div className="h-3 bg-[#EEF4FF] rounded animate-pulse w-20 mb-2" />
        <div className="flex gap-1.5 flex-wrap">
          {[72, 60, 80, 56].map((w, i) => (
            <div
              key={i}
              className="h-5 rounded-full bg-[#EEF4FF] animate-pulse"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-3 mb-4">
        <div className="h-4 w-16 bg-[#EEF4FF] rounded animate-pulse" />
        <div className="h-4 w-24 bg-[#EEF4FF] rounded animate-pulse" />
      </div>
      <div className="border-t border-[#E7EDF5] pt-4">
        <div className="h-9 w-full rounded-full bg-[#EEF4FF] animate-pulse" />
      </div>
    </div>
  )
}

// ─── Faculty badge colours ─────────────────────────────────────────────────────
function getFacultyBadgeStyle(name) {
  if (!name)
    return {
      bg: 'bg-gray-50',
      text: 'text-[#64748B]',
      border: 'border-gray-200',
    }
  const n = name.toLowerCase()
  if (
    n.includes('medicina') ||
    n.includes('saúde') ||
    n.includes('saude') ||
    n.includes('enfermagem')
  )
    return {
      bg: 'bg-orange-50',
      text: 'text-[#C2500A]',
      border: 'border-orange-100',
    }
  if (
    n.includes('engenhar') ||
    n.includes('civil') ||
    n.includes('mecânic') ||
    n.includes('electr')
  )
    return {
      bg: 'bg-blue-50',
      text: 'text-[#1565A8]',
      border: 'border-blue-100',
    }
  if (n.includes('direito') || n.includes('ciências jurídicas'))
    return {
      bg: 'bg-purple-50',
      text: 'text-[#6A1B9A]',
      border: 'border-purple-100',
    }
  if (
    n.includes('econom') ||
    n.includes('gestão') ||
    n.includes('contabilidade') ||
    n.includes('finanças')
  )
    return {
      bg: 'bg-emerald-50',
      text: 'text-[#15803D]',
      border: 'border-emerald-100',
    }
  if (n.includes('inform') || n.includes('tecn') || n.includes('computação'))
    return {
      bg: 'bg-cyan-50',
      text: 'text-[#0369A1]',
      border: 'border-cyan-100',
    }
  if (n.includes('arqui') || n.includes('urban'))
    return {
      bg: 'bg-amber-50',
      text: 'text-[#92400E]',
      border: 'border-amber-100',
    }
  if (n.includes('agro') || n.includes('veterinár') || n.includes('biologia'))
    return {
      bg: 'bg-lime-50',
      text: 'text-[#365314]',
      border: 'border-lime-100',
    }
  return {
    bg: 'bg-[#F0F4FF]',
    text: 'text-[#3B4FCE]',
    border: 'border-[#D6DEFF]',
  }
}

// ─── Exam Card — combina o melhor dos dois designs ─────────────────────────────
function ExamCard({ sim }) {
  const navigate = useNavigate()

  const facultyLabel = sim.targetFaculty?.name ?? sim.targetFacultyName ?? null
  const universityLabel = sim.targetUniversity?.name ?? null
  const { bg, text, border } = getFacultyBadgeStyle(facultyLabel)

  const formatAttempts = (n) => {
    if (!n && n !== 0) return '0'
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`
    return n.toLocaleString('pt-AO')
  }

  const visibleSections = (sim.sections ?? []).slice(0, 4)
  const hiddenCount = (sim.sections ?? []).length - 4

  return (
    <div
      className="bg-white border border-[#E7EDF5] rounded-[16px] p-5 sm:p-6
                 shadow-[0_4px_20px_rgba(0,0,0,0.03)]
                 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(21,101,168,0.10)]
                 hover:border-[#c8d8f0]
                 transition-all duration-300 flex flex-col group"
    >
      {/* ── Top row: ícone + badge faculdade ── */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#1565A8] transition-colors duration-300">
          <FileText
            size={18}
            strokeWidth={2}
            className="text-[#1565A8] group-hover:text-white transition-colors duration-300"
          />
        </div>
        {facultyLabel ? (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border max-w-[180px] truncate ${bg} ${text} ${border}`}
          >
            {facultyLabel}
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-50 text-[#64748B] border border-gray-200">
            Prova Geral
          </span>
        )}
      </div>

      {/* ── Título ── */}
      <h3
        className="text-[#071C35] text-[15px] font-bold leading-snug mb-2"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '40px',
        }}
      >
        {sim.title}
      </h3>

      {/* ── Universidade ── */}
      {universityLabel ? (
        <div className="flex items-center gap-1.5 mb-3">
          <Building2
            size={13}
            strokeWidth={2}
            className="text-[#1565A8] flex-shrink-0"
          />
          <span className="text-[#64748B] text-xs truncate">
            {universityLabel}
          </span>
        </div>
      ) : (
        <div className="mb-3" />
      )}

      {/* ── Disciplinas ── */}
      <div className="mb-3">
        <span className="text-[#374151] text-[11px] font-semibold uppercase tracking-wide">
          Disciplinas:
        </span>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {visibleSections.map((s) => (
            <span
              key={s.id}
              className="bg-blue-50 border border-blue-100 text-[#1565A8] rounded-full text-[11px] font-medium px-2.5 py-0.5"
            >
              {s.subject?.name ?? s.subject?.code ?? '—'}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="bg-[#F4F8FC] border border-[#E7EDF5] text-[#64748B] rounded-full text-[11px] font-medium px-2.5 py-0.5">
              +{hiddenCount}
            </span>
          )}
          {(sim.sections ?? []).length === 0 && (
            <span className="text-[#A0AEC0] text-[11px]">
              Sem disciplinas definidas
            </span>
          )}
        </div>
      </div>

      {/* ── Estatísticas ── */}
      <div className="flex items-center gap-4 mt-auto pt-1">
        <div className="flex items-center gap-1.5">
          <Clock size={13} strokeWidth={2} className="text-[#1565A8]" />
          <span className="text-[#64748B] text-xs font-medium">
            {sim.duration} min
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={13} strokeWidth={2} className="text-[#1565A8]" />
          <span className="text-[#64748B] text-xs font-medium">
            {formatAttempts(sim.totalAttempts)} tentativas
          </span>
        </div>
      </div>

      {/* ── Divisor + CTA ── */}
      <div className="border-t border-[#E7EDF5] mt-4 mb-4" />
      <button
        onClick={() => navigate(`/simulation/${sim.id}`)}
        className="w-full flex items-center justify-center gap-1.5 bg-[#1565A8] hover:bg-[#0f4f8a]
                   text-white rounded-full py-2.5 text-sm font-semibold
                   transition-all duration-200 hover:shadow-md hover:shadow-blue-200/60"
      >
        Fazer Simulação
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </div>
  )
}

// ─── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  const navigate = useNavigate()
  return (
    <div
      className="md:col-span-2 lg:col-span-3 relative overflow-hidden rounded-[16px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[160px]"
      style={{
        background: 'linear-gradient(135deg, #071C35 0%, #1565A8 100%)',
      }}
    >
      {/* decorativo */}
      <div className="absolute -right-12 -top-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/2 bottom-0 w-72 h-40 bg-[#F7941D]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex-1">
        <p className="text-[#F7941D] text-xs font-bold uppercase tracking-widest mb-2">
          Inscrição aberta
        </p>
        <h2 className="text-white text-[22px] md:text-[26px] font-extrabold leading-snug mb-2 max-w-md">
          Ainda não escolheu o seu curso?
        </h2>
        <p className="text-white/70 text-sm max-w-sm">
          A nossa equipa ajuda-o a encontrar o percurso ideal para o seu perfil.
        </p>
      </div>
      <div className="relative z-10 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/contacto')}
          className="bg-white text-[#1565A8] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#F4F8FC] transition-all whitespace-nowrap"
        >
          Falar com a equipa
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="border border-white/30 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white/10 transition-all whitespace-nowrap"
        >
          Criar conta gratuita
        </button>
      </div>
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ onReset }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-[#EEF4FF] rounded-full flex items-center justify-center mb-5">
        <SearchX size={34} className="text-[#A0B8D8]" />
      </div>
      <h3 className="text-[#071C35] text-lg font-bold mb-2">
        Nenhuma simulação encontrada
      </h3>
      <p className="text-[#5F6D7E] text-sm max-w-xs">
        Tenta ajustar os filtros ou pesquisar por termos mais genéricos.
      </p>
      <button
        onClick={onReset}
        className="mt-5 text-[#1565A8] text-sm font-semibold hover:underline underline-offset-2 transition-all"
      >
        Limpar filtros
      </button>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SimulationsList() {
  const [simulations, setSimulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeFacultyId, setActiveFacultyId] = useState(null) // null = "Todas"

  // ── Carregar dados ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.get('/simulations')
        const data = res.data?.data ?? res.data
        setSimulations(Array.isArray(data) ? data : [])
      } catch {
        setError('Não foi possível carregar as simulações. Tenta novamente.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Faculdades únicas para filtro ───────────────────────────────────────────
  const faculties = useMemo(() => {
    return [
      ...new Map(
        simulations
          .filter((s) => s.targetFaculty?.id)
          .map((s) => [s.targetFaculty.id, s.targetFaculty])
      ).values(),
    ]
  }, [simulations])

  // ── Filtros ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return simulations.filter((s) => {
      if (activeFacultyId !== null && s.targetFaculty?.id !== activeFacultyId)
        return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const inTitle = s.title?.toLowerCase().includes(q)
        const inUniv = s.targetUniversity?.name?.toLowerCase().includes(q)
        const inFac = (s.targetFaculty?.name ?? s.targetFacultyName ?? '')
          .toLowerCase()
          .includes(q)
        const inSubj = (s.sections ?? []).some(
          (sec) =>
            sec.subject?.name?.toLowerCase().includes(q) ||
            sec.subject?.code?.toLowerCase().includes(q)
        )
        if (!inTitle && !inUniv && !inFac && !inSubj) return false
      }
      return true
    })
  }, [simulations, activeFacultyId, search])

  const handleReset = () => {
    setSearch('')
    setActiveFacultyId(null)
  }

  // ── Grid com CTA intercalado ────────────────────────────────────────────────
  const grid = useMemo(() => {
    const items = filtered.map((s) => ({ type: 'sim', data: s, key: s.id }))
    // Inserir CTA depois do 6.º card (se existirem) ou no final quando há poucos
    if (filtered.length > 0) {
      const insertAt = filtered.length >= 6 ? 6 : filtered.length
      items.splice(insertAt, 0, { type: 'cta', key: 'cta' })
    }
    return items
  }, [filtered])

  // ── Hero wave SVG ───────────────────────────────────────────────────────────
  const HeroWave = () => (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[1px] pointer-events-none">
      <svg
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-16 md:h-20 block"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 C240,80 480,80 720,40 C960,0 1200,0 1440,0 L1440,80 L0,80 Z"
          fill="#1a3f6e"
        />
        <path
          d="M0,20 C240,80 500,80 720,50 C940,20 1200,10 1440,20 L1440,80 L0,80 Z"
          fill="#F4F8FC"
        />
      </svg>
    </div>
  )

  return (
    <PublicLayout solidWhite>
    <div className="bg-[#F4F8FC] min-h-screen font-sans">
     

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative text-white pt-32 pb-24 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #071C35 0%, #1565A8 100%)',
        }}
      >
        {/* Decorativos */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-12 left-0 w-72 h-72 bg-[#F7941D]/10 rounded-full -translate-x-1/3 pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 md:px-10 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
            <Zap size={13} className="text-[#F7941D]" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">
              Simulações Gratuitas
            </span>
          </div>

          {/* Título — variante mobile/desktop */}
          <h1 className="hidden md:block text-[52px] leading-[1.1] font-extrabold mb-5 max-w-3xl">
            Testa os teus conhecimentos
            <br />
            <span className="text-[#F7941D]">e prepara-te para o sucesso.</span>
          </h1>
          <h1 className="md:hidden text-[32px] leading-[1.2] font-extrabold mb-5 max-w-sm">
            Testa os teus conhecimentos e prepara-te para o sucesso.
          </h1>

          <p className="text-white/75 text-[17px] leading-7 max-w-xl mb-10 hidden md:block">
            Prepara-te com os simuladores mais precisos de Angola. Pratica com
            questões reais de anos anteriores e avalia o teu desempenho antes do
            dia decisivo.
          </p>

          {/* Pills de features */}
          <div className="flex flex-wrap gap-2.5">
            {[
              { icon: <Star size={13} />, label: 'Acesso gratuito' },
              { icon: <Users size={13} />, label: 'Sem login necessário' },
              { icon: <TrendingUp size={13} />, label: 'Resultado imediato' },
              { icon: <BookOpen size={13} />, label: 'Questões reais' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 border border-white/15 text-sm font-medium backdrop-blur-sm"
              >
                {icon}
                {label}
              </div>
            ))}
          </div>

          {/* Mini stats mobile */}
          <div className="flex flex-wrap gap-3 mt-9 md:hidden">
            {[
              { label: 'SIMULAÇÕES', value: '+500' },
              { label: 'ESTUDANTES', value: '+12k' },
              { label: 'APROVAÇÃO', value: '85%' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/15 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[110px]"
              >
                <p className="text-[10px] uppercase tracking-wider text-white/60 mb-0.5">
                  {label}
                </p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <HeroWave />
        
      </section>

      {/* ── FILTER BAR ───────────────────────────────────────────────────── */}
   <div className="bg-white border-b border-[#E7EDF5] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-[280px] flex-shrink-0">
              <Search
                size={15}
                strokeWidth={2}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar simulações..."
                className="w-full border border-[#E7EDF5] rounded-full pl-9 pr-4 py-2 text-sm text-[#374151]
                           placeholder:text-[#A0AEC0] outline-none focus:border-[#1565A8] focus:ring-1
                           focus:ring-[#1565A8]/20 transition-all bg-white"
              />
            </div>

            {/* Faculty pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1 min-w-0 scrollbar-hide">
              <button
                onClick={() => setActiveFacultyId(null)}
                className={`flex-shrink-0 rounded-full text-sm px-3.5 py-1.5 transition-all font-semibold whitespace-nowrap ${
                  activeFacultyId === null
                    ? 'bg-[#1565A8] text-white shadow-sm shadow-blue-200'
                    : 'bg-white border border-[#E7EDF5] text-[#374151] hover:border-[#1565A8] hover:text-[#1565A8]'
                }`}
              >
                Todas
              </button>
              {faculties.map((fac) => (
                <button
                  key={fac.id}
                  onClick={() => setActiveFacultyId(fac.id)}
                  className={`flex-shrink-0 rounded-full text-sm px-3.5 py-1.5 transition-all font-semibold whitespace-nowrap ${
                    activeFacultyId === fac.id
                      ? 'bg-[#1565A8] text-white shadow-sm shadow-blue-200'
                      : 'bg-white border border-[#E7EDF5] text-[#374151] hover:border-[#1565A8] hover:text-[#1565A8]'
                  }`}
                >
                  {fac.name}
                </button>
              ))}
            </div>

            {/* Count */}
            {!loading && (
              <span className="hidden md:block text-[#5F6D7E] text-sm flex-shrink-0 whitespace-nowrap">
                {filtered.length} simulaç{filtered.length === 1 ? 'ão' : 'ões'}{' '}
                disponív{filtered.length === 1 ? 'el' : 'eis'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────────── */}
      <section className="pt-10 pb-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          {error && (
            <div className="text-center py-20 text-[#DC3545] text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grid.length === 1 && grid[0]?.type === 'cta' ? (
                <EmptyState onReset={handleReset} />
              ) : (
                grid.map((item) =>
                  item.type === 'cta' ? (
                    <CTABanner key={item.key} />
                  ) : (
                    <ExamCard key={item.key} sim={item.data} />
                  )
                )
              )}
              {filtered.length === 0 && <EmptyState onReset={handleReset} />}
            </div>
          )}
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-[#E7EDF5]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            {
              value: '98%',
              label: 'Precisão dos Simulados',
              icon: <Star size={18} />,
            },
            {
              value: '15k+',
              label: 'Alunos Aprovados',
              icon: <GraduationCap size={18} />,
            },
            {
              value: '500+',
              label: 'Provas Disponíveis',
              icon: <BookOpen size={18} />,
            },
            {
              value: '24/7',
              label: 'Acesso Online',
              icon: <TrendingUp size={18} />,
            },
          ].map(({ value, label, icon }) => (
            <div key={label} className="group">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#EEF4FF] text-[#1565A8] mb-3 group-hover:bg-[#1565A8] group-hover:text-white transition-all duration-300">
                {icon}
              </div>
              <p className="text-[40px] md:text-[46px] font-extrabold text-[#1565A8] leading-none mb-1">
                {value}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#5F6D7E]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

    
    </div>
    </PublicLayout>
  )
}
