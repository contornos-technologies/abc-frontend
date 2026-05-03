// src/pages/admin/Cards.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Printer, CheckSquare, Square, RefreshCw,
  Search, AlertCircle, WifiOff, Clock, Filter,
  Users, FileText, ExternalLink, ChevronLeft, ChevronRight,
  CheckCircle, XCircle
} from 'lucide-react';
import api from '../../services/api';

// ─── Constantes ───────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#0A3956', '#F69220', '#28A745', '#6C63FF', '#DC3545', '#17A2B8'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const PAYMENT_STATUS_CONFIG = {
  PAID:    { bg: '#D4EDDA', text: '#155724', icon: CheckCircle, label: 'Pago'         },
  PARTIAL: { bg: '#FFF3CD', text: '#856404', icon: Clock,       label: 'Parcial'      },
  PENDING: { bg: '#F8D7DA', text: '#721C24', icon: XCircle,     label: 'Pendente'     },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getErrorMessage = (err) => {
  if (!navigator.onLine || err.code === 'ERR_NETWORK') {
    return { title: 'Sem ligação à internet', message: 'Verifica a tua ligação e tenta novamente.', icon: WifiOff };
  }
  if (err.code === 'ECONNABORTED') {
    return { title: 'Tempo de resposta esgotado', message: 'O servidor demorou demasiado. Tenta novamente.', icon: Clock };
  }
  const status = err.response?.status;
  if (status === 401 || status === 403) {
    return { title: 'Sessão expirada', message: 'A tua sessão expirou. Serás redirecionado para o login.', icon: AlertCircle };
  }
  if (status >= 500) {
    return { title: 'Erro no servidor', message: 'Ocorreu um problema interno. Tenta novamente mais tarde.', icon: AlertCircle };
  }
  return { title: 'Erro inesperado', message: 'Algo correu mal. Tenta novamente ou contacta o suporte.', icon: AlertCircle };
};

const BASE_URL = import.meta.env.VITE_API_URL || '';

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

function PaymentBadge({ status }) {
  const cfg = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function KpiCard({ label, value, color, icon: Icon, sub }) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="rounded-lg p-2 flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-[#6B7280] mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-[#0A3956] leading-tight">{value}</p>
        {sub && <p className="text-xs text-[#6C757D] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 last:border-0">
            <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
            <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Linha de estudante (Desktop) ─────────────────────────────────────────────

function StudentRow({ student, selected, onToggle, onOpenCard, generatingId }) {
  const name = student.fullName || 'Sem nome';
  const color = avatarColor(name);
  const isGenerating = generatingId === student.id;

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors">
      {/* Checkbox */}
      <td className="px-4 py-3">
        <button onClick={() => onToggle(student.id)} className="flex items-center justify-center">
          {selected
            ? <CheckSquare size={18} style={{ color: '#0A3956' }} />
            : <Square size={18} className="text-[#DEE2E6]" />
          }
        </button>
      </td>

      {/* Estudante */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: color }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#0A3956] truncate max-w-[180px]">{name}</p>
            <p className="text-xs text-[#6C757D]">{student.bi || '—'}</p>
          </div>
        </div>
      </td>

      {/* Curso */}
      <td className="px-4 py-3 text-sm text-[#374151] hidden lg:table-cell">
        {student.targetCourse || student.course || '—'}
      </td>

      {/* Pagamento */}
      <td className="px-4 py-3">
        <PaymentBadge status={student.paymentStatus || student.payment?.status} />
      </td>

      {/* Bolsa */}
      <td className="px-4 py-3 text-xs text-[#6C757D] hidden md:table-cell">
        {student.scholarshipType === 'FULL'
          ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#0A395618] text-[#0A3956]">Bolsa Completa</span>
          : student.scholarshipType === 'PARTIAL'
            ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F6922018] text-[#F69220]">Bolsa Parcial</span>
            : '—'
        }
      </td>

      {/* Acção */}
      <td className="px-4 py-3">
        <button
          onClick={() => onOpenCard(student.id)}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#DEE2E6] bg-white text-[#0A3956] hover:bg-blue-50 hover:border-[#0A3956] transition-colors disabled:opacity-50"
        >
          {isGenerating
            ? <><RefreshCw size={12} className="animate-spin" /> A gerar...</>
            : <><ExternalLink size={12} /> Ver Cartão</>
          }
        </button>
      </td>
    </tr>
  );
}

// ─── Card mobile de estudante ─────────────────────────────────────────────────

function StudentCard({ student, selected, onToggle, onOpenCard, generatingId }) {
  const name = student.fullName || 'Sem nome';
  const color = avatarColor(name);
  const isGenerating = generatingId === student.id;

  return (
    <div
      className="bg-white rounded-xl shadow-sm p-4"
      style={{ borderLeft: `3px solid ${selected ? '#0A3956' : '#DEE2E6'}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        {/* Checkbox */}
        <button onClick={() => onToggle(student.id)} className="flex-shrink-0">
          {selected
            ? <CheckSquare size={18} style={{ color: '#0A3956' }} />
            : <Square size={18} className="text-[#DEE2E6]" />
          }
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0A3956] truncate">{name}</p>
          <p className="text-xs text-[#6C757D]">{student.bi || '—'}</p>
        </div>

        <PaymentBadge status={student.paymentStatus || student.payment?.status} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {student.scholarshipType === 'FULL' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#0A395618] text-[#0A3956]">Bolsa Completa</span>
          )}
          {student.scholarshipType === 'PARTIAL' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F6922018] text-[#F69220]">Bolsa Parcial</span>
          )}
          {student.targetCourse && (
            <span className="text-xs text-[#6C757D]">{student.targetCourse}</span>
          )}
        </div>

        <button
          onClick={() => onOpenCard(student.id)}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#DEE2E6] bg-white text-[#0A3956] hover:bg-blue-50 transition-colors disabled:opacity-50 ml-2 flex-shrink-0"
        >
          {isGenerating
            ? <><RefreshCw size={12} className="animate-spin" /> A gerar...</>
            : <><ExternalLink size={12} /> Ver Cartão</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Cards() {
  const navigate = useNavigate();

  const [students, setStudents]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [pageError, setPageError]     = useState(null);
  const [selected, setSelected]       = useState(new Set());
  const [generatingId, setGeneratingId] = useState(null);
  const [printingSheet, setPrintingSheet] = useState(false);

  // Filtros
  const [search, setSearch]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination]   = useState({ total: 0, page: 1, totalPages: 1 });

  // ── Carregar lista de elegíveis ───────────────────────────────────────────
  const loadData = useCallback(async (page = 1) => {
    setLoading(true);
    setPageError(null);
    try {
      const res = await api.get('/admin/cards/pending', {
        params: { page, limit: 20 },
      });
      const data = res.data?.students ?? res.data?.data ?? res.data;
const total = res.data?.total;
setStudents(Array.isArray(data) ? data : []);
if (total !== undefined) setPagination(prev => ({ ...prev, total }));
    } catch (err) {
      if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
      setPageError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadData(currentPage); }, [loadData, currentPage]);

  // ── Toggle selecção ───────────────────────────────────────────────────────
  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (filtered.length > 0 && filtered.every(s => selected.has(s.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(s => s.id)));
    }
  };

  // ── Abrir cartão individual ───────────────────────────────────────────────
const openCard = async (studentId) => {
  setGeneratingId(studentId);
  try {
    const res = await api.get(`/admin/cards/student/${studentId}`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (err) {
    if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
    alert('Erro ao gerar o cartão. Tenta novamente.');
  } finally {
    setGeneratingId(null);
  }
};

  // ── Imprimir folha A4 (seleccionados) ────────────────────────────────────
  const printSelected = async () => {
  if (selected.size === 0) return;
  setPrintingSheet(true);
  try {
    const ids = Array.from(selected).join(',');
    const res = await api.get(`/admin/cards/sheet`, {
      params: { ids },
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setSelected(new Set());
  } catch (err) {
    alert('Erro ao gerar a folha. Tenta novamente.');
  } finally {
    setPrintingSheet(false);
  }
};


  // ── Imprimir folha A4 (últimos 10) ───────────────────────────────────────
 const printLatest = async () => {
  setPrintingSheet(true);
  try {
    const res = await api.get(`/admin/cards/sheet`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (err) {
    alert('Erro ao gerar a folha. Tenta novamente.');
  } finally {
    setPrintingSheet(false);
  }
};

  // ── Filtros locais ────────────────────────────────────────────────────────
  const filtered = students.filter(s => {
    const name = s.fullName?.toLowerCase() || '';
    const bi   = s.bi?.toLowerCase() || '';
    const q    = search.toLowerCase();
    return !q || name.includes(q) || bi.includes(q);
  });

  const allSelected = filtered.length > 0 && filtered.every(s => selected.has(s.id));

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalPaid    = students.filter(s => (s.paymentStatus || s.payment?.status) === 'PAID').length;
  const totalPartial = students.filter(s => (s.paymentStatus || s.payment?.status) === 'PARTIAL').length;
  const totalScholar = students.filter(s => s.scholarshipType === 'FULL').length;

  // ── Loading / Erro ────────────────────────────────────────────────────────
  if (loading) return <PageSkeleton />;

  if (pageError) {
    const ErrIcon = pageError.icon || AlertCircle;
    return (
      <div className="p-4 md:p-6 max-w-[1200px] mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#F8D7DA] border border-[#F5C6CB] rounded-2xl p-6 max-w-md w-full text-center">
          <ErrIcon size={36} className="text-[#DC3545] mx-auto mb-3" />
          <p className="font-bold text-[#721C24] text-lg">{pageError.title}</p>
          <p className="text-sm text-[#721C24] mt-2">{pageError.message}</p>
          <button
            onClick={() => loadData(1)}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#0A3956' }}
          >
            <RefreshCw size={14} /> Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto bg-[#F8F9FA] min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3956]">Cartões de Estudante</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">{pagination.total} estudante{pagination.total !== 1 ? 's' : ''} elegíve{pagination.total !== 1 ? 'is' : 'l'} para cartão</p>
        </div>

        {/* Botões de impressão */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Imprimir seleccionados — só aparece quando há selecção */}
          {selected.size > 0 && (
            <button
              onClick={printSelected}
              disabled={printingSheet}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#28A745' }}
            >
              {printingSheet
                ? <><RefreshCw size={14} className="animate-spin" /> A gerar...</>
                : <><Printer size={14} /> Imprimir {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}</>
              }
            </button>
          )}

          {/* Imprimir últimos 10 */}
          <button
            onClick={printLatest}
            disabled={printingSheet || students.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#0A3956' }}
          >
            {printingSheet
              ? <><RefreshCw size={14} className="animate-spin" /> A gerar...</>
              : <><FileText size={14} /> Imprimir Últimos 10</>
            }
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Pagamento Completo"
          value={totalPaid}
          color="#28A745"
          icon={CheckCircle}
          sub="Pagamento total efectuado"
        />
        <KpiCard
          label="Pagamento Parcial"
          value={totalPartial}
          color="#F69220"
          icon={Clock}
          sub="1ª prestação paga"
        />
        <KpiCard
          label="Bolsa Completa"
          value={totalScholar}
          color="#0A3956"
          icon={Users}
          sub="Isenção total de pagamento"
        />
      </div>

      {/* ── Filtros ── */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou BI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956]"
          />
        </div>
      </div>

      {/* Contador + info de selecção */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs text-[#6C757D]">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== students.length && ` de ${students.length}`}
        </p>
        {selected.size > 0 && (
          <p className="text-xs font-medium text-[#0A3956]">
            {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── TABELA — Desktop ── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hidden md:block">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#6C757D]">
            <CreditCard size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Nenhum estudante elegível encontrado</p>
            <p className="text-sm mt-1">
              {search ? 'Tenta ajustar a pesquisa' : 'Os estudantes elegíveis aparecerão aqui após aprovação do pagamento'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#DEE2E6]">
                {/* Checkbox — seleccionar todos */}
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleAll} className="flex items-center justify-center">
                    {allSelected
                      ? <CheckSquare size={18} style={{ color: '#0A3956' }} />
                      : <Square size={18} className="text-[#DEE2E6]" />
                    }
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Estudante</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide hidden lg:table-cell">Curso</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Pagamento</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide hidden md:table-cell">Bolsa</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => (
                <StudentRow
                  key={student.id}
                  student={student}
                  selected={selected.has(student.id)}
                  onToggle={toggleOne}
                  onOpenCard={openCard}
                  generatingId={generatingId}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── CARDS — Mobile ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Seleccionar todos — mobile */}
        {filtered.length > 0 && (
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm text-sm font-medium text-[#0A3956] border border-[#DEE2E6]"
          >
            {allSelected
              ? <CheckSquare size={16} style={{ color: '#0A3956' }} />
              : <Square size={16} className="text-[#DEE2E6]" />
            }
            {allSelected ? 'Desseleccionar todos' : 'Seleccionar todos'}
          </button>
        )}

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-14 text-[#6C757D]">
            <CreditCard size={36} className="mb-3 opacity-30" />
            <p className="font-medium">Nenhum estudante elegível</p>
            <p className="text-sm mt-1 text-center px-4">
              {search ? 'Tenta ajustar a pesquisa' : 'Os estudantes elegíveis aparecerão aqui após aprovação do pagamento'}
            </p>
          </div>
        ) : (
          filtered.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              selected={selected.has(student.id)}
              onToggle={toggleOne}
              onOpenCard={openCard}
              generatingId={generatingId}
            />
          ))
        )}
      </div>

      {/* ── Paginação ── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-[#DEE2E6] bg-white text-[#0A3956] disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={15} /> Anterior
          </button>
          <span className="text-sm text-[#6C757D]">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-[#DEE2E6] bg-white text-[#0A3956] disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Próxima <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── Barra flutuante de selecção (mobile) ── */}
      {selected.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-40">
          <div className="bg-[#0A3956] rounded-xl shadow-lg px-4 py-3 flex items-center justify-between">
            <p className="text-white text-sm font-medium">
              {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}
            </p>
            <button
              onClick={printSelected}
              disabled={printingSheet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0A3956] bg-white hover:bg-gray-100 transition-colors disabled:opacity-60"
            >
              {printingSheet
                ? <><RefreshCw size={12} className="animate-spin" /> A gerar...</>
                : <><Printer size={12} /> Imprimir</>
              }
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
