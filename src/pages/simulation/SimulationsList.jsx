import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ─── Utilitários ──────────────────────────────────────────────────────────────

function formatDuration(minutes) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function SimulationsList() {
  const navigate = useNavigate();

  const [exams, setExams]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/simulations');
        const data = res.data?.data ?? res.data;
        setExams(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Não foi possível carregar as provas. Tenta novamente.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = exams.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F8FC]">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#E7EDF5] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1565A8] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">ABC</span>
            </div>
            <span className="font-extrabold text-[#071C35] text-lg hidden sm:block">
              ABC Simulações
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm text-[#1565A8] font-semibold hover:underline"
            >
              Entrar
            </a>
            <a
              href="/signup"
              className="text-sm font-bold text-white bg-[#1565A8] hover:bg-[#0d4f8a] px-4 py-2 rounded-full transition-colors"
            >
              Criar conta
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="bg-white border-b border-[#E7EDF5]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[#1565A8]/10 text-[#1565A8] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.396 0 2.694.409 3.75 1.11A7.969 7.969 0 0112.75 14c1.037 0 2.026.22 2.925.604v-10A7.968 7.968 0 0012.75 4c-1.255 0-2.443.29-3.5.804z" />
            </svg>
            Provas de Simulação
          </div>
          <h1 className="text-[28px] sm:text-[42px] font-extrabold text-[#071C35] leading-[1.1] mb-4">
            Pratica e prepara-te para o exame
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto mb-8">
            Escolhe uma prova abaixo, responde às questões e recebe a tua nota imediatamente. Grátis e sem conta.
          </p>

          {/* Barra de pesquisa */}
          <div className="max-w-md mx-auto relative">
            <svg
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar prova..."
              className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-[#E7EDF5] focus:border-[#1565A8] outline-none text-sm text-[#071C35] bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">

        {/* Estado de carregamento */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-[20px] border border-[#E7EDF5] p-6 animate-pulse">
                <div className="h-4 bg-[#E7EDF5] rounded-full w-3/4 mb-3" />
                <div className="h-3 bg-[#E7EDF5] rounded-full w-full mb-2" />
                <div className="h-3 bg-[#E7EDF5] rounded-full w-2/3 mb-6" />
                <div className="flex gap-2 mb-5">
                  <div className="h-6 bg-[#E7EDF5] rounded-full w-20" />
                  <div className="h-6 bg-[#E7EDF5] rounded-full w-16" />
                </div>
                <div className="h-10 bg-[#E7EDF5] rounded-full w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Erro */}
        {!loading && error && (
          <div className="bg-white rounded-[20px] border border-red-200 p-8 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 text-sm font-bold text-white bg-[#1565A8] rounded-full hover:bg-[#0d4f8a] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Lista vazia */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#1565A8]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#1565A8] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#071C35] mb-1">
              {search ? 'Nenhuma prova encontrada' : 'Nenhuma prova disponível'}
            </h3>
            <p className="text-sm text-slate-400">
              {search ? 'Tenta outro termo de pesquisa.' : 'Volta mais tarde — as provas serão publicadas em breve.'}
            </p>
          </div>
        )}

        {/* Grid de provas */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-xs text-slate-400 font-medium mb-5">
              {filtered.length} {filtered.length === 1 ? 'prova disponível' : 'provas disponíveis'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(exam => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  onClick={() => navigate(`/simulation/${exam.id}`)}
                />
              ))}
            </div>
          </>
        )}

      </div>

      {/* ── Footer simples ── */}
      <footer className="border-t border-[#E7EDF5] mt-16 py-8 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} ABC Simulações — Todos os direitos reservados
        </p>
      </footer>

    </div>
  );
}

// ─── Card de Prova ────────────────────────────────────────────────────────────

function ExamCard({ exam, onClick }) {
  const disciplines = exam.sections?.map(s => s.subject?.name).filter(Boolean) ?? [];
  const questionCount = exam.totalQuestions ?? exam._count?.questions ?? null;

  return (
    <div
      className="group bg-white rounded-[20px] border border-[#E7EDF5] p-6 flex flex-col cursor-pointer hover:border-[#1565A8]/40 hover:shadow-lg hover:shadow-[#1565A8]/8 transition-all duration-200 hover:-translate-y-0.5"
      onClick={onClick}
    >
      {/* Topo: ícone + título */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#1565A8]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1565A8]/15 transition-colors">
          <svg className="w-5 h-5 text-[#1565A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-[15px] font-extrabold text-[#071C35] leading-snug">
          {exam.title}
        </h2>
      </div>

      {/* Descrição */}
      {exam.description && (
        <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
          {exam.description}
        </p>
      )}

      {/* Tags de disciplinas */}
      {disciplines.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {disciplines.slice(0, 3).map((d, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-[#F4F8FC] border border-[#E7EDF5] rounded-full text-xs font-medium text-[#1565A8]"
            >
              {d}
            </span>
          ))}
          {disciplines.length > 3 && (
            <span className="px-2.5 py-1 bg-[#F4F8FC] border border-[#E7EDF5] rounded-full text-xs font-medium text-slate-400">
              +{disciplines.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Stats: questões + duração */}
      <div className="flex items-center gap-4 mb-5 pt-4 border-t border-[#F4F8FC]">
        {questionCount !== null && (
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-slate-500">
              {questionCount} questões
            </span>
          </div>
        )}
        {exam.duration && (
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-slate-500">
              {formatDuration(exam.duration)}
            </span>
          </div>
        )}
      </div>

      {/* Botão */}
      <button className="w-full py-3 text-sm font-bold text-white bg-[#1565A8] group-hover:bg-[#0d4f8a] rounded-full transition-colors">
        Iniciar Prova →
      </button>
    </div>
  );
}
