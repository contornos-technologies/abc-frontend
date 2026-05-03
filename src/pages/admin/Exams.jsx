import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText, Plus, Search, Archive, Eye, Edit2,
  ChevronRight, AlertCircle, BookOpen, CheckCircle,
  ArchiveIcon, X, Loader2, ClipboardList
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

function getErrorMessage(err) {
  if (err.response?.status === 401) return null;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.status === 404) return 'Recurso não encontrado.';
  if (err.response?.status === 500) return 'Erro interno do servidor. Tente novamente.';
  return 'Ocorreu um erro. Verifique a ligação e tente novamente.';
}

// Extrai o nome da disciplina das secções do exam (schema real)
function getSubjectName(exam) {
  if (exam.sections && exam.sections.length > 0) {
    return exam.sections.map(s => s.subject?.name).filter(Boolean).join(', ') || '—';
  }
  return '—';
}

// Conta questões (schema real: exam.questions[] ou exam._count.questions)
function getQuestionCount(exam) {
  if (typeof exam._count?.questions === 'number') return exam._count.questions;
  if (Array.isArray(exam.questions)) return exam.questions.length;
  return '—';
}

const SCORING_LABELS = {
  SIMPLE: 'Simples',
  WEIGHTED: 'Ponderado',
  DRAFT: 'Rascunho',
};

const SCORING_COLORS = {
  SIMPLE: 'bg-blue-100 text-blue-700',
  WEIGHTED: 'bg-purple-100 text-purple-700',
  DRAFT: 'bg-gray-100 text-gray-500',
};

// ─── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-[#DEE2E6]">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 animate-pulse rounded-md" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#DEE2E6] p-4 space-y-3">
      <div className="h-4 bg-gray-200 animate-pulse rounded-md w-3/4" />
      <div className="h-3 bg-gray-200 animate-pulse rounded-md w-1/2" />
      <div className="h-3 bg-gray-200 animate-pulse rounded-md w-1/3" />
    </div>
  );
}

// ─── Modal Criar / Editar Prova ──────────────────────────────────────────────
// NOTA: O schema não tem subjectName no Exam — disciplinas são ligadas via ExamSection.
// O modal cria a prova sem disciplina; as secções são adicionadas no ExamDetail.

function ExamModal({ exam, onClose, onSaved }) {
  const isEdit = !!exam;
  const [form, setForm] = useState({
    title: exam?.title || '',
    description: exam?.description || '',
    duration: exam?.duration || 60,
    scoringMode: exam?.scoringMode || 'SIMPLE',
    isPublic: exam?.isPublic ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError('O título é obrigatório.');
    if (!form.duration || Number(form.duration) < 1) return setError('A duração é obrigatória.');

    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        duration: Number(form.duration),
        scoringMode: form.scoringMode,
        isPublic: form.isPublic,
      };
      if (isEdit) {
        await api.put(`/admin/exams/${exam.id}`, payload);
      } else {
        await api.post('/admin/exams', payload);
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao guardar prova.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEE2E6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0A3956] flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-[#0A3956]">
              {isEdit ? 'Editar Prova' : 'Nova Prova'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-[#0A3956] mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Exame Final de Matemática 2025"
              className="w-full border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#0A3956] transition-colors"
            />
          </div>

          {/* Duração */}
          <div>
            <label className="block text-sm font-semibold text-[#0A3956] mb-1">
              Duração (minutos) <span className="text-red-500">*</span>
            </label>
            <input
              name="duration"
              type="number"
              min="1"
              max="480"
              value={form.duration}
              onChange={handleChange}
              className="w-full border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#0A3956] transition-colors"
            />
          </div>

          {/* Modo de Scoring */}
          <div>
            <label className="block text-sm font-semibold text-[#0A3956] mb-1">
              Modo de Avaliação
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'SIMPLE', label: 'Simples', desc: 'Score directo' },
                { value: 'WEIGHTED', label: 'Ponderado', desc: 'Por secções' },
                { value: 'DRAFT', label: 'Rascunho', desc: 'Invisível' },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, scoringMode: opt.value }))}
                  className={`border rounded-lg px-3 py-2 text-left transition-all ${
                    form.scoringMode === opt.value
                      ? 'border-[#0A3956] bg-[#0A3956]/5'
                      : 'border-[#DEE2E6] hover:border-gray-400'
                  }`}
                >
                  <p className={`text-xs font-semibold ${form.scoringMode === opt.value ? 'text-[#0A3956]' : 'text-gray-700'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Visibilidade */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={form.isPublic}
              onChange={handleChange}
              className="w-4 h-4 accent-[#0A3956]"
            />
            <label htmlFor="isPublic" className="text-sm font-semibold text-[#0A3956] cursor-pointer">
              Visível para estudantes
            </label>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-[#0A3956] mb-1">
              Descrição <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Notas ou instruções sobre esta prova..."
              className="w-full border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#0A3956] transition-colors resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#0A3956] text-white text-sm font-semibold rounded-lg hover:bg-[#0D4A6E] transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Guardar Alterações' : 'Criar Prova'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Confirmar Arquivar ────────────────────────────────────────────────

function ArchiveModal({ exam, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <ArchiveIcon className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-base font-bold text-[#0A3956]">Arquivar Prova</h3>
          <p className="text-sm text-gray-500">
            Tens a certeza que queres arquivar <span className="font-semibold text-gray-700">"{exam.title}"</span>?
            A prova ficará invisível para os estudantes mas os dados são preservados.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[#DEE2E6] text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Arquivar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, borderColor, loading }) {
  return (
    <div className="bg-white rounded-xl border border-[#DEE2E6] shadow-sm p-4 border-t-4" style={{ borderTopColor: borderColor }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-[#6C757D] font-medium">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${borderColor}18` }}>
          {icon}
        </div>
      </div>
      {loading
        ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md" />
        : <p className="text-3xl font-bold text-[#0A3956]">{value}</p>
      }
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────

export default function Exams() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState(null);
  const [modalArchive, setModalArchive] = useState(null);
  const [archiving, setArchiving] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
  async function fetchExams() {
    setLoading(true);
    setError('');
    try {
      const [activeRes, archivedRes] = await Promise.all([
        api.get('/admin/exams'),
        api.get('/admin/exams?archived=true'),
      ]);
      const active   = activeRes.data?.data   ?? activeRes.data   ?? [];
      const archived = archivedRes.data?.data ?? archivedRes.data ?? [];
      const map = new Map();
      [...active, ...archived].forEach(e => map.set(e.id, e));
      setExams([...map.values()]);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchExams(); }, []);

  // ── archive ────────────────────────────────────────────────────────────────
  async function handleArchive() {
    setArchiving(true);
    try {
      await api.patch(`/admin/exams/${modalArchive.id}/archive`);
      setModalArchive(null);
      fetchExams();
    } catch (err) {
      if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
      setError(getErrorMessage(err));
      setModalArchive(null);
    } finally {
      setArchiving(false);
    }
  }

  // ── derived ────────────────────────────────────────────────────────────────
  const activeExams   = exams.filter(e => !e.isArchived);
  const archivedExams = exams.filter(e =>  e.isArchived);
  const displayed     = (showArchived ? archivedExams : activeExams)
    .filter(e => {
      const subjectName = getSubjectName(e).toLowerCase();
      const q = search.toLowerCase();
      return e.title?.toLowerCase().includes(q) || subjectName.includes(q);
    });

  return (
    <div className="p-6 max-w-[1200px] mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3956]">Provas</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">Gestão de provas e simulados</p>
        </div>
        <button
          onClick={() => setModalCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A3956] text-white text-sm font-semibold rounded-lg hover:bg-[#0D4A6E] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Prova
        </button>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Total de Provas"
          value={exams.length}
          icon={<FileText className="w-4 h-4" style={{ color: '#F69220' }} />}
          borderColor="#F69220"
          loading={loading}
        />
        <KpiCard
          label="Provas Activas"
          value={activeExams.length}
          icon={<CheckCircle className="w-4 h-4" style={{ color: '#28A745' }} />}
          borderColor="#28A745"
          loading={loading}
        />
        <KpiCard
          label="Arquivadas"
          value={archivedExams.length}
          icon={<ArchiveIcon className="w-4 h-4" style={{ color: '#6C757D' }} />}
          borderColor="#6C757D"
          loading={loading}
        />
      </div>

      {/* ── Erro global ─────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button onClick={fetchExams} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
            Tentar novamente
          </button>
        </div>
      )}

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#DEE2E6] shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar por título ou disciplina..."
              className="w-full pl-9 pr-4 py-2 border border-[#DEE2E6] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0A3956] transition-colors"
            />
          </div>
          <div className="flex rounded-lg border border-[#DEE2E6] overflow-hidden">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                !showArchived ? 'bg-[#0A3956] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Activas
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                showArchived ? 'bg-[#0A3956] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Arquivadas
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabela Desktop ──────────────────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-xl border border-[#DEE2E6] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#DEE2E6]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Título</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Disciplina(s)</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Avaliação</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Questões</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Acções</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : displayed.length === 0
              ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ClipboardList className="w-10 h-10 text-gray-300" />
                      <p className="text-sm text-gray-400">
                        {search
                          ? 'Nenhuma prova encontrada para essa pesquisa.'
                          : showArchived
                          ? 'Não há provas arquivadas.'
                          : 'Ainda não há provas criadas. Clica em "Nova Prova" para começar.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )
              : displayed.map(exam => (
                <tr
                  key={exam.id}
                  className="border-b border-[#DEE2E6] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/exams/${exam.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#0A3956]/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-[#0A3956]" />
                      </div>
                      <span className="font-medium text-gray-800">{exam.title}</span>
                    </div>
                  </td>
                  {/* Disciplina vem das sections (schema real) */}
                  <td className="px-4 py-3 text-gray-600">{getSubjectName(exam)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SCORING_COLORS[exam.scoringMode] || 'bg-gray-100 text-gray-500'}`}>
                      {SCORING_LABELS[exam.scoringMode] || exam.scoringMode}
                    </span>
                  </td>
                  {/* Questões: _count.questions ou questions.length (schema real) */}
                  <td className="px-4 py-3 text-gray-600">
                    {getQuestionCount(exam)}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/exams/${exam.id}`)}
                        className="p-1.5 text-gray-400 hover:text-[#0A3956] hover:bg-[#0A3956]/10 rounded-lg transition-colors"
                        title="Ver detalhe"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!exam.isArchived && (
                        <>
                          <button
                            onClick={() => setModalEdit(exam)}
                            className="p-1.5 text-gray-400 hover:text-[#0A3956] hover:bg-[#0A3956]/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setModalArchive(exam)}
                            className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Arquivar"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* ── Cards Mobile ────────────────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {loading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : displayed.length === 0
          ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <ClipboardList className="w-10 h-10 text-gray-300" />
              <p className="text-sm text-gray-400 text-center">
                {search ? 'Nenhuma prova encontrada.' : 'Ainda não há provas criadas.'}
              </p>
            </div>
          )
          : displayed.map(exam => (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-[#DEE2E6] shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/admin/exams/${exam.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#0A3956]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4 text-[#0A3956]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{exam.title}</p>
                    <p className="text-xs text-[#6C757D] mt-0.5">{getSubjectName(exam)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SCORING_COLORS[exam.scoringMode] || 'bg-gray-100 text-gray-500'}`}>
                        {SCORING_LABELS[exam.scoringMode] || exam.scoringMode}
                      </span>
                      <span className="text-xs text-gray-400">
                        {getQuestionCount(exam)} questões
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  {!exam.isArchived && (
                    <>
                      <button
                        onClick={() => setModalEdit(exam)}
                        className="p-1.5 text-gray-400 hover:text-[#0A3956] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setModalArchive(exam)}
                        className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* ── Modais ──────────────────────────────────────────────────────── */}
      {modalCreate && (
        <ExamModal
          onClose={() => setModalCreate(false)}
          onSaved={() => { setModalCreate(false); fetchExams(); }}
        />
      )}
      {modalEdit && (
        <ExamModal
          exam={modalEdit}
          onClose={() => setModalEdit(null)}
          onSaved={() => { setModalEdit(null); fetchExams(); }}
        />
      )}
      {modalArchive && (
        <ArchiveModal
          exam={modalArchive}
          onClose={() => setModalArchive(null)}
          onConfirm={handleArchive}
          loading={archiving}
        />
      )}
    </div>
  );
}
