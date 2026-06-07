import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

function formatTime(seconds) {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  if (m > 0) return `${m}min ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

// Anel animado com a nota
function ScoreRing({ score, maxScore = 20 }) {
  const [animated, setAnimated] = useState(false);
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const dash = animated ? (circumference * percentage) / 100 : 0;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const ringColor =
    percentage >= 60
      ? '#1565A8'
      : percentage >= 40
      ? '#F7941D'
      : '#ef4444';

  const passed = percentage >= 50;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="#E7EDF5"
            strokeWidth="14"
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[36px] font-extrabold text-[#071C35] leading-none">
            {typeof score === 'number' ? score.toFixed(1) : score}
          </span>
          <span className="text-sm text-slate-400 font-medium">/ {maxScore}</span>
        </div>
      </div>
      <div className={`mt-3 px-4 py-1.5 rounded-full text-sm font-bold ${
        passed
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-600'
      }`}>
        {passed ? '✓ Aprovado' : '✗ Não aprovado'}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-[#F4F8FC] text-[#1565A8]',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-500',
    amber: 'bg-amber-50 text-amber-500',
    slate: 'bg-slate-50 text-slate-500',
  };
  return (
    <div className="bg-white rounded-[20px] border border-[#E7EDF5] p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-[22px] font-extrabold text-[#071C35]">{value}</div>
      <div className="text-sm font-medium text-slate-600">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function ResultsPage() {
  const { id } = useParams(); // id do exame (usado para "Refazer")
  const location = useLocation();
  const navigate = useNavigate();

  const attemptId = location.state?.attemptId;

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!attemptId) {
      setError('Não foi possível encontrar os resultados desta tentativa.');
      setLoading(false);
      return;
    }

    async function loadResults() {
      try {
        // ✅ Usa api (axios) em vez de fetch directo — envia token automaticamente
        const res = await api.get(`/simulations/attempts/${attemptId}`);
        setResults(res.data);
      } catch (err) {
        // ✅ Axios lança erro em respostas 4xx/5xx — mensagem mais clara
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          `Erro ao carregar resultados (${err.response?.status ?? 'rede'})`;
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1565A8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">A calcular resultados…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center px-4">
        <div className="bg-white rounded-[24px] border border-[#E7EDF5] p-8 max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-[#071C35] mb-2">Sem resultados</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <a href="/simulations" className="inline-block px-6 py-2.5 bg-[#1565A8] text-white font-bold rounded-full text-sm hover:bg-[#0d4f8a] transition-colors">
            Ver todas as provas
          </a>
        </div>
      </div>
    );
  }

  // ✅ Campos confirmados pelo backend (Postman): score, completedAt, results[]
  // results[] contém { isCorrect, selectedOptionId, ... } por questão
  const score    = results?.score ?? 0;
  const maxScore = results?.maxScore ?? 20; // pede ao backend para incluir este campo se não vier

  // ✅ Derivar correct/wrong/blank dos results[] que o backend confirma retornar
  const allResults = Array.isArray(results?.results) ? results.results : [];
  const correct    = allResults.filter(r => r.isCorrect === true).length;
  const wrong      = allResults.filter(r => r.isCorrect === false && r.selectedOptionId).length;
  const blank      = allResults.filter(r => !r.selectedOptionId).length;
  const total      = allResults.length;

  // ✅ Campos opcionais — mostrar '—' se não vierem
  const timeSpent = results?.timeSpent ?? results?.duration ?? results?.elapsed ?? null;

  // ✅ Título: tenta vários campos comuns, fallback limpo
  const examTitle =
    results?.examTitle ??
    results?.simulation?.title ??
    results?.exam?.title ??
    results?.title ??
    'Simulação';

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  // ✅ Detectar sessão anónima (sem token guardado)
  const isAnonymous = !localStorage.getItem('abc_token');

  return (
    <div className="min-h-screen bg-[#F4F8FC]">

      {/* Navbar */}
      <nav className="bg-white border-b border-[#E7EDF5] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1565A8] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">ABC</span>
            </div>
            <span className="font-extrabold text-[#071C35] text-lg hidden sm:block">ABC Simulações</span>
          </a>
          <a href="/simulations" className="text-sm text-[#1565A8] font-semibold hover:underline">
            Ver todas as provas
          </a>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-14 sm:py-16 lg:py-20">

        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#1565A8]/10 text-[#1565A8] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            Resultado Final
          </div>
          <h1 className="text-[26px] sm:text-[38px] font-extrabold text-[#071C35] leading-[1.1] mb-2">
            {examTitle}
          </h1>
          <p className="text-slate-400 text-sm">
            Aqui está o teu desempenho nesta simulação
          </p>
        </div>

        {/* Nota principal */}
        <div className="bg-white rounded-[28px] border border-[#E7EDF5] shadow-sm p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8 mb-6">
          <ScoreRing score={score} maxScore={maxScore} />

          <div className="flex-1 w-full">
            {/* Barra de percentagem de acertos */}
            <div className="mb-5">
              <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
                <span>Taxa de acerto</span>
                <span className="text-[#1565A8] font-bold">{percentage}%</span>
              </div>
              <div className="w-full h-3 bg-[#E7EDF5] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1565A8] transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Mini stats inline */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center bg-green-50 border border-green-100 rounded-[16px] py-3">
                <div className="text-xl font-extrabold text-green-600">{correct}</div>
                <div className="text-xs text-green-500 font-medium">Certas</div>
              </div>
              <div className="text-center bg-red-50 border border-red-100 rounded-[16px] py-3">
                <div className="text-xl font-extrabold text-red-500">{wrong}</div>
                <div className="text-xs text-red-400 font-medium">Erradas</div>
              </div>
              <div className="text-center bg-slate-50 border border-slate-200 rounded-[16px] py-3">
                <div className="text-xl font-extrabold text-slate-400">{blank}</div>
                <div className="text-xs text-slate-400 font-medium">Em branco</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de detalhe */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            color="blue"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            label="Total de questões"
            value={total || '—'}
          />
          <StatCard
            color="green"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            label="Respostas certas"
            value={correct}
            sub={total > 0 ? `${percentage}% de acerto` : undefined}
          />
          <StatCard
            color="red"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
            label="Respostas erradas"
            value={wrong}
          />
          <StatCard
            color="amber"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Tempo gasto"
            value={formatTime(timeSpent)}
          />
        </div>

        {/* ✅ Aviso apenas se sessão anónima */}
        {isAnonymous && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[16px] p-4 mb-8">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-amber-700">
              Esta prova foi feita em modo anónimo — os resultados não ficam guardados no teu perfil.
              <a href="/signup" className="ml-1 font-bold underline hover:text-amber-800">Cria uma conta</a> para guardar o histórico de simulações.
            </p>
          </div>
        )}

        {/* Botões de acção */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/simulation/${id}`)}
            className="flex-1 py-3.5 text-sm font-bold text-[#1565A8] border-2 border-[#1565A8]/30 rounded-full hover:bg-[#1565A8]/5 transition-colors"
          >
            🔁 Refazer esta prova
          </button>
          <a
            href="/simulations"
            className="flex-1 py-3.5 text-sm font-bold text-white bg-[#1565A8] hover:bg-[#0d4f8a] rounded-full text-center transition-colors"
          >
            Ver todas as provas →
          </a>
        </div>

      </div>
    </div>
  );
}
