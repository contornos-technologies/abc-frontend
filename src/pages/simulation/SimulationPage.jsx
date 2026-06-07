import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import api from '../../services/api';


// ─── Utilidades ────────────────────────────────────────────────────────────────

function renderMath(text) {
  if (!text) return '';
  return text.replace(/\$(.+?)\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr, { throwOnError: false });
    } catch {
      return expr;
    }
  });
}

function MathText({ text, className = '' }) {
  if (!text) return null;
  const html = renderMath(text);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Ecrã 1: Entrada ───────────────────────────────────────────────────────────

function IntroScreen({ exam, onStart, loading }) {
  const disciplines = exam.disciplines || exam.subjects || [];

  return (
    <div className="min-h-screen bg-[#F4F8FC]">
      <nav className="bg-white border-b border-[#E7EDF5] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1565A8] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">ABC</span>
            </div>
            <span className="font-extrabold text-[#071C35] text-lg hidden sm:block">ABC Simulações</span>
          </a>
          <a
            href="/simulations"
            className="text-sm text-[#1565A8] font-semibold hover:underline"
          >
            ← Ver todas as provas
          </a>
        </div>
      </nav>

      <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-14 sm:py-16 lg:py-24">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#1565A8]/10 text-[#1565A8] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.396 0 2.694.409 3.75 1.11A7.969 7.969 0 0112.75 14c1.037 0 2.026.22 2.925.604v-10A7.968 7.968 0 0012.75 4c-1.255 0-2.443.29-3.5.804z" />
            </svg>
            Simulação de Prova
          </div>

          <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-extrabold text-[#071C35] leading-[1.1] mb-4">
            {exam.title || exam.name}
          </h1>

          {exam.description && (
            <p className="text-slate-500 text-[16px] sm:text-[18px] max-w-xl mx-auto">
              {exam.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <InfoCard
            icon={<ClockIcon />}
            label="Duração"
            value={exam.duration ? `${exam.duration} min` : '—'}
          />
          <InfoCard
            icon={<QuestionIcon />}
            label="Questões"
            value={exam.questions?.length || exam.questionsCount || '—'}
          />
          <InfoCard
            icon={<StarIcon />}
            label="Pontuação"
            value={exam.passingScore ? `${exam.passingScore}/20` : '20 val.'}
          />
          <InfoCard
            icon={<BookIcon />}
            label="Disciplinas"
            value={disciplines.length > 0 ? disciplines.length : 'Mistas'}
          />
        </div>

        {disciplines.length > 0 && (
          <div className="bg-white rounded-[24px] border border-[#E7EDF5] p-5 sm:p-6 mb-6">
            <h3 className="text-sm font-bold text-[#071C35] mb-3 uppercase tracking-wide">
              Disciplinas incluídas
            </h3>
            <div className="flex flex-wrap gap-2">
              {disciplines.map((d, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-[#F4F8FC] border border-[#E7EDF5] rounded-full text-sm font-medium text-[#1565A8]"
                >
                  {typeof d === 'string' ? d : d.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[16px] p-4 mb-8">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-amber-700">
            <strong>Prova pública:</strong> Os resultados desta sessão não ficam guardados no teu perfil. Podes fazer a prova sem conta.
          </p>
        </div>

        <button
          onClick={onStart}
          disabled={loading}
          className="w-full bg-[#1565A8] hover:bg-[#0d4f8a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-full shadow-lg shadow-[#1565A8]/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#1565A8]/30"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              A iniciar prova…
            </span>
          ) : (
            'Iniciar Simulação →'
          )}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          Ao iniciar, o temporizador começa imediatamente.
        </p>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-[20px] border border-[#E7EDF5] p-4 text-center">
      <div className="w-9 h-9 rounded-xl bg-[#F4F8FC] flex items-center justify-center text-[#1565A8] mx-auto mb-2">
        {icon}
      </div>
      <div className="text-[18px] font-extrabold text-[#071C35]">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

// ─── Ecrã 2: A Prova ───────────────────────────────────────────────────────────

function ExamScreen({ exam, attemptId, onSubmit, submitting, submitError, onClearSubmitError }) {
  const questions = exam.questions || [];
  const durationSeconds = (exam.duration || 60) * 60;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [showNav, setShowNav] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // FIX: guardar respostas numa ref para o timer ter sempre o valor mais recente
  const answersRef = useRef({});

  const timerRef = useRef(null);

  // FIX: separar a lógica de build do payload da lógica de submissão
  const buildAnswersArray = useCallback(() => {
    return Object.entries(answersRef.current).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));
  }, []);

  // Timer — usa answersRef para evitar closure stale
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onSubmit(buildAnswersArray());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // onSubmit e buildAnswersArray são estáveis via useCallback no pai

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answered = Object.keys(answers).length;
  const isLowTime = timeLeft < 300;

  // FIX: questões que têm resposta E estão marcadas contam como respondidas, não como "por responder"
  const unansweredCount = questions.filter(q => !answers[q.id]).length;

  function handleSelectOption(optionId) {
    setAnswers(prev => {
      const next = { ...prev, [currentQuestion.id]: optionId };
      answersRef.current = next; // manter ref sincronizada
      return next;
    });
  }

  function handleToggleFlag() {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  }

  function handleSubmit() {
    onSubmit(buildAnswersArray());
  }

  function getQuestionStatus(q) {
    if (answers[q.id]) return 'answered';
    if (flagged.has(q.id)) return 'flagged';
    return 'unanswered';
  }

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen bg-[#F4F8FC] flex flex-col">

      {/* ── Header fixo com timer ── */}
      <header className={`sticky top-0 z-40 border-b transition-colors duration-300 ${isLowTime ? 'bg-red-50 border-red-200' : 'bg-white border-[#E7EDF5]'}`}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-bold text-[#071C35] whitespace-nowrap">
              {currentIndex + 1} / {totalQuestions}
            </span>
            <div className="w-32 sm:w-48 h-2 bg-[#E7EDF5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1565A8] rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 hidden sm:block">
              {answered} respondidas
            </span>
          </div>

          <div className={`flex items-center gap-2 font-mono font-bold text-lg tabular-nums ${isLowTime ? 'text-red-600' : 'text-[#071C35]'}`}>
            {isLowTime && (
              <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            )}
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNav(!showNav)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#1565A8] border border-[#1565A8]/30 rounded-full hover:bg-[#1565A8]/5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Navegar
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={answered === 0 || submitting}
              className="px-4 py-1.5 text-sm font-bold text-white bg-[#F7941D] hover:bg-[#e07d0a] disabled:opacity-40 disabled:cursor-not-allowed rounded-full transition-colors"
            >
              Submeter
            </button>
          </div>
        </div>

        {/* FIX: toast de erro de submissão inline no header — não destrói o ecrã de prova */}
        {submitError && (
          <div className="bg-red-50 border-t border-red-200 px-4 py-2 flex items-center justify-between">
            <p className="text-sm text-red-700">
              <strong>Erro ao submeter:</strong> {submitError}. Tenta novamente.
            </p>
            <button
              onClick={onClearSubmitError}
              className="text-red-400 hover:text-red-600 ml-4 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8 gap-6">

        {/* ── Coluna principal: questão ── */}
        <main className="flex-1 min-w-0">

          <div className="bg-white rounded-[24px] border border-[#E7EDF5] p-5 sm:p-8 mb-4 shadow-sm">

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#1565A8] text-white text-sm font-bold flex items-center justify-center">
                  {currentIndex + 1}
                </span>
                {currentQuestion.discipline && (
                  <span className="text-xs font-semibold text-[#1565A8] bg-[#F4F8FC] border border-[#E7EDF5] px-2.5 py-1 rounded-full">
                    {currentQuestion.discipline}
                  </span>
                )}
                {currentQuestion.year && (
                  <span className="text-xs text-slate-400">{currentQuestion.year}</span>
                )}
              </div>
              <button
                onClick={handleToggleFlag}
                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                  flagged.has(currentQuestion.id)
                    ? 'bg-amber-100 text-amber-600 border border-amber-300'
                    : 'bg-[#F4F8FC] text-slate-400 border border-[#E7EDF5] hover:text-amber-500'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill={flagged.has(currentQuestion.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Marcar
              </button>
            </div>

            <div className="text-[16px] sm:text-[17px] text-[#071C35] font-medium leading-relaxed mb-6">
              <MathText text={currentQuestion.text || currentQuestion.statement} />
            </div>

            {currentQuestion.imageUrl && (
              <div className="mb-6 rounded-[16px] overflow-hidden border border-[#E7EDF5]">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Imagem da questão"
                  className="w-full max-h-64 object-contain bg-[#F4F8FC]"
                />
              </div>
            )}

            <div className="space-y-3">
              {(currentQuestion.options || []).map((option, i) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full text-left flex items-start gap-3 p-4 rounded-[16px] border-2 transition-all duration-150 ${
                      isSelected
                        ? 'border-[#1565A8] bg-[#1565A8]/5 shadow-sm'
                        : 'border-[#E7EDF5] bg-white hover:border-[#1565A8]/40 hover:bg-[#F4F8FC]'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                      isSelected
                        ? 'bg-[#1565A8] border-[#1565A8] text-white'
                        : 'border-[#E7EDF5] text-slate-400'
                    }`}>
                      {optionLabels[i] || i + 1}
                    </span>
                    <span className="text-[15px] text-[#071C35] leading-relaxed pt-0.5">
                      <MathText text={option.text} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#1565A8] border border-[#1565A8]/30 rounded-full hover:bg-[#1565A8]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            <button
              onClick={() => setShowNav(true)}
              className="sm:hidden text-xs font-semibold text-[#1565A8] underline"
            >
              Ver todas ({answered}/{totalQuestions})
            </button>

            <button
              onClick={() => setCurrentIndex(i => Math.min(totalQuestions - 1, i + 1))}
              disabled={currentIndex === totalQuestions - 1}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1565A8] rounded-full hover:bg-[#0d4f8a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Próxima →
            </button>
          </div>
        </main>

        {/* ── Painel de navegação rápida (desktop) ── */}
        <aside className={`hidden sm:block w-64 flex-shrink-0 ${showNav ? 'block' : ''}`}>
          <div className="bg-white rounded-[24px] border border-[#E7EDF5] p-5 sticky top-20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Navegação
            </h3>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {questions.map((q, i) => {
                const status = getQuestionStatus(q);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                      i === currentIndex
                        ? 'bg-[#1565A8] text-white ring-2 ring-[#1565A8]/30'
                        : status === 'answered'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : status === 'flagged'
                        ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                        : 'bg-[#F4F8FC] text-slate-400 hover:bg-[#E7EDF5]'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            {/* FIX: usar unansweredCount calculado correctamente */}
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-green-100 inline-block border border-green-200" />
                Respondida ({answered})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-100 inline-block border border-amber-200" />
                Marcada ({flagged.size})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#F4F8FC] inline-block border border-[#E7EDF5]" />
                Por responder ({unansweredCount})
              </div>
            </div>

            {answered > 0 && (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="w-full mt-5 py-2.5 text-sm font-bold text-white bg-[#F7941D] hover:bg-[#e07d0a] rounded-full transition-colors"
              >
                Submeter Prova
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* ── Modal navegação mobile ── */}
      {showNav && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:hidden" onClick={() => setShowNav(false)}>
          <div className="w-full bg-white rounded-t-[24px] p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-[#071C35] mb-4">Questões</h3>
            <div className="grid grid-cols-8 gap-2 mb-5">
              {questions.map((q, i) => {
                const status = getQuestionStatus(q);
                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentIndex(i); setShowNav(false); }}
                    className={`h-9 rounded-lg text-xs font-bold transition-all ${
                      i === currentIndex
                        ? 'bg-[#1565A8] text-white'
                        : status === 'answered'
                        ? 'bg-green-100 text-green-700'
                        : status === 'flagged'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-[#F4F8FC] text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            {answered > 0 && (
              <button
                onClick={() => { setShowNav(false); setShowConfirm(true); }}
                className="w-full py-3 text-sm font-bold text-white bg-[#F7941D] rounded-full"
              >
                Submeter Prova ({answered}/{totalQuestions})
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Modal de confirmação de submissão ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[24px] border border-[#E7EDF5] p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#1565A8]/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-[#1565A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#071C35] text-center mb-2">
              Submeter a prova?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Respondeste a <strong>{answered}</strong> de <strong>{totalQuestions}</strong> questões.
              {unansweredCount > 0 && (
                <span className="block mt-1 text-amber-600">
                  {unansweredCount} questão(ões) por responder.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 text-sm font-bold text-[#1565A8] border border-[#1565A8]/30 rounded-full hover:bg-[#F4F8FC] transition-colors"
              >
                Continuar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 text-sm font-bold text-white bg-[#1565A8] hover:bg-[#0d4f8a] disabled:opacity-60 rounded-full transition-colors"
              >
                {submitting ? 'A submeter…' : 'Submeter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────────

export default function SimulationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [screen, setScreen] = useState('loading'); // loading | intro | exam | error
  const [exam, setExam] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [startLoading, setStartLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  // FIX: erro de submissão separado — não destrói o ecrã de prova
  const [submitError, setSubmitError] = useState(null);

  // Carregar prova
  useEffect(() => {
    const controller = new AbortController();

    async function loadExam() {
      try {
        // FIX: axios usa res.data, não res.ok / res.json()
        const res = await api.get(`/simulations/${id}`, {
          signal: controller.signal,
        });
        setExam(res.data);
        setScreen('intro');
      } catch (err) {
        if (err.name === 'CanceledError') return; // navegação durante o fetch
        const message = err.response?.data?.message || err.message || 'Erro ao carregar a prova.';
        setError(message);
        setScreen('error');
      }
    }

    loadExam();

    return () => controller.abort();
  }, [id]);

  // Iniciar prova
  async function handleStart() {
    setStartLoading(true);
    try {
      // FIX: axios — usar res.data directamente, sem res.ok / res.json()
      const res = await api.post(`/simulations/${id}/start`, {});
      const data = res.data;
      const aid = data.attemptId || data.id || data._id;
      if (!aid) throw new Error('Resposta inválida do servidor');
      setAttemptId(aid);
      setScreen('exam');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erro ao iniciar a prova.';
      setError(message);
      setScreen('error');
    } finally {
      setStartLoading(false);
    }
  }

  // Submeter prova
  // FIX: erro de submissão não muda o screen para 'error' — mostra toast no ExamScreen
  const handleSubmit = useCallback(async (answersArray) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      // FIX: axios — res.data já é o body parseado; sem res.ok / res.json()
      await api.post(`/simulations/${attemptId}/submit`, { answers: answersArray });
      navigate(`/simulation/${id}/results`, { state: { attemptId } });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erro ao submeter. Tenta novamente.';
      setSubmitError(message);
      setSubmitLoading(false);
    }
  }, [attemptId, id, navigate]);

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1565A8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">A carregar prova…</p>
        </div>
      </div>
    );
  }

  if (screen === 'error') {
    return (
      <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center px-4">
        <div className="bg-white rounded-[24px] border border-[#E7EDF5] p-8 max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-[#071C35] mb-2">Algo correu mal</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <a href="/simulations" className="inline-block px-6 py-2.5 bg-[#1565A8] text-white font-bold rounded-full text-sm hover:bg-[#0d4f8a] transition-colors">
            Ver todas as provas
          </a>
        </div>
      </div>
    );
  }

  if (screen === 'intro') {
    return <IntroScreen exam={exam} onStart={handleStart} loading={startLoading} />;
  }

  if (screen === 'exam') {
    return (
      <ExamScreen
        exam={exam}
        attemptId={attemptId}
        onSubmit={handleSubmit}
        submitting={submitLoading}
        submitError={submitError}
        onClearSubmitError={() => setSubmitError(null)}
      />
    );
  }

  return null;
}

// ─── Ícones ────────────────────────────────────────────────────────────────────

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function QuestionIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
