import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Phone, ChevronRight,
  UserPlus, X, SlidersHorizontal, RefreshCw, AlertCircle,
} from 'lucide-react';
import api from '../../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_OPTIONS = [
  { value: '',          label: 'Todos os estados' },
  { value: 'PENDING',   label: 'Pendente' },
  { value: 'PARTIAL',   label: 'Parcial' },
  { value: 'PAID',      label: 'Pago' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const SCHOLARSHIP_OPTIONS = [
  { value: '',           label: 'Todas as bolsas' },
  { value: 'NONE',       label: 'Sem bolsa' },
  { value: 'PARTIAL_50', label: 'Bolsa 50%' },
  { value: 'PARTIAL_75', label: 'Bolsa 75%' },
  { value: 'FULL',       label: 'Bolsa total' },
];

const YEAR_OPTIONS = [
  { value: '',     label: 'Todos os anos' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
  { value: '2028', label: '2028' },
];

const ITEMS_PER_PAGE = 10;

// ─── Helpers — estrutura real da API ─────────────────────────────────────────

function getEmail(s) {
  return s?.user?.email ?? '—';
}

function getLatestTarget(s) {
  if (!s.targets || s.targets.length === 0) return null;
  return [...s.targets].sort((a, b) => b.year - a.year)[0];
}

function getSubjectNames(s) {
  const target = getLatestTarget(s);
  if (!target?.subjects?.length) return [];
  return target.subjects.map((ts) => ts.subject?.name ?? ts.subject?.code ?? '?');
}

function getSubjectCount(s) {
  const target = getLatestTarget(s);
  return target?.subjectCount ?? target?.subjects?.length ?? 0;
}

function getPaymentStatus(s) {
  const target = getLatestTarget(s);
  return target?.payment?.status ?? 'PENDING';
}

function getScholarship(s) {
  const target = getLatestTarget(s);
  return target?.scholarshipType ?? 'NONE';
}

function getYear(s) {
  const target = getLatestTarget(s);
  return target?.year ?? null;
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const SCHOLARSHIP_CONFIG = {
  NONE:       { label: 'Sem bolsa',   className: 'bg-gray-100 text-gray-600' },
  PARTIAL_50: { label: 'Bolsa 50%',   className: 'bg-[#FFF3CD] text-[#856404]' },
  PARTIAL_75: { label: 'Bolsa 75%',   className: 'bg-[#FFE5CC] text-[#E07B00]' },
  FULL:       { label: 'Bolsa total', className: 'bg-[#D4EDDA] text-[#155724]' },
};

const PAYMENT_CONFIG = {
  PENDING:   { label: 'Pendente',  className: 'bg-[#FFF3CD] text-[#856404]',  dot: true  },
  PARTIAL:   { label: 'Parcial',   className: 'bg-[#CCE5FF] text-[#004085]',  dot: false },
  PAID:      { label: 'Pago',      className: 'bg-[#D4EDDA] text-[#155724]',  dot: false },
  CANCELLED: { label: 'Cancelado', className: 'bg-[#F8D7DA] text-[#721C24]',  dot: false },
};

function ScholarshipBadge({ value }) {
  const cfg = SCHOLARSHIP_CONFIG[value] ?? SCHOLARSHIP_CONFIG.NONE;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ value }) {
  const cfg = PAYMENT_CONFIG[value] ?? PAYMENT_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
      {cfg.dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {cfg.label}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#0A3956', '#F69220', '#28A745', '#6C63FF', '#DC3545', '#17A2B8'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i}>
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
          <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
          <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
          <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
          <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
          <td className="px-4 py-4"><Skeleton className="h-4 w-4" /></td>
        </tr>
      ))}
    </>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-blue-100 text-[#0A3956] text-xs font-semibold rounded-full">
      {label}
      <button onClick={onRemove} className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── Filter Select ────────────────────────────────────────────────────────────
function FilterSelect({ value, options, onChange }) {
  const isActive = value !== '';
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-3 pr-8 py-2 text-sm border rounded-lg appearance-none focus:outline-none transition-colors bg-white
          ${isActive
            ? 'border-[#0A3956] text-[#0A3956] font-semibold bg-blue-50'
            : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isActive && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#0A3956] border-2 border-white" />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Students() {
  const navigate = useNavigate();

  const [search, setSearch]           = useState('');
  const [paymentFilter, setPayment]   = useState('');
  const [scholarFilter, setScholar]   = useState('');
  const [yearFilter, setYear]         = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const hasActiveFilters = search || paymentFilter || scholarFilter || yearFilter;

  const clearFilters = () => {
    setSearch(''); setPayment(''); setScholar(''); setYear('');
    setCurrentPage(1);
  };

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/students');
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? res.data?.students ?? [];
      setAllStudents(list);
    } catch (err) {
      if (err.response?.status === 401) navigate('/portal/acesso');
      else setError('Não foi possível carregar os estudantes.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    let list = allStudents;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) =>
        (s.fullName ?? '').toLowerCase().includes(q) ||
        (s.bi ?? '').toLowerCase().includes(q) ||
        (s.user?.email ?? '').toLowerCase().includes(q)
      );
    }
    if (paymentFilter) list = list.filter((s) => getPaymentStatus(s) === paymentFilter);
    if (scholarFilter) list = list.filter((s) => getScholarship(s) === scholarFilter);
    if (yearFilter)    list = list.filter((s) => String(getYear(s)) === yearFilter);
    return list;
  }, [allStudents, search, paymentFilter, scholarFilter, yearFilter]);

  useEffect(() => { setCurrentPage(1); }, [search, paymentFilter, scholarFilter, yearFilter]);

  const total      = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const students   = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const startItem = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem   = Math.min(currentPage * ITEMS_PER_PAGE, total);

  const activeChips = [
    paymentFilter && { key: 'payment', label: `Estado: ${PAYMENT_CONFIG[paymentFilter]?.label}`, clear: () => setPayment('') },
    scholarFilter && { key: 'scholar', label: SCHOLARSHIP_CONFIG[scholarFilter]?.label,          clear: () => setScholar('') },
    yearFilter    && { key: 'year',    label: `Ano: ${yearFilter}`,                               clear: () => setYear('') },
    search        && { key: 'search',  label: `"${search}"`,                                      clear: () => setSearch('') },
  ].filter(Boolean);

  const pageNumbers = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="min-h-full bg-[#F8F9FA] p-4 md:p-6">
      <div className="max-w-[1200px] mx-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A3956]">Estudantes</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gestão de todos os estudantes inscritos
              {!loading && allStudents.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                  {allStudents.length.toLocaleString('pt-PT')}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadStudents}
              title="Actualizar"
              className="p-2 rounded-lg text-gray-400 hover:text-[#0A3956] hover:bg-blue-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/admin/students/new')}
              className="hidden sm:inline-flex items-center gap-2 bg-[#28A745] hover:bg-[#218838] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Novo Estudante
            </button>
          </div>
        </div>

        {/* ── FILTROS ── */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">Filtros</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Limpar tudo
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2 lg:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome, BI ou email..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0A3956] transition-colors"
              />
            </div>
            <FilterSelect value={paymentFilter} options={PAYMENT_OPTIONS} onChange={setPayment} />
            <FilterSelect value={scholarFilter} options={SCHOLARSHIP_OPTIONS} onChange={setScholar} />
            <FilterSelect value={yearFilter}    options={YEAR_OPTIONS}       onChange={setYear} />
          </div>
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400 self-center">Activos:</span>
              {activeChips.map((chip) => (
                <FilterChip key={chip.key} label={chip.label} onRemove={chip.clear} />
              ))}
            </div>
          )}
        </div>

        {/* ── ERRO ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={loadStudents} className="text-sm font-medium text-red-700 hover:underline">
              Tentar novamente
            </button>
          </div>
        )}

        {/* ── TABELA ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[30%]">
                  Estudante
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">
                  BI
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">
                  Contacto
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[12%]">
                  Disciplinas
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[13%]">
                  Bolsa
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[13%]">
                  Pagamento
                </th>
                <th className="w-[2%]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <TableSkeleton />
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-700">Nenhum estudante encontrado</p>
                      <p className="text-sm text-gray-400">Tente ajustar os filtros de pesquisa</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="mt-1 text-sm text-[#0A3956] font-semibold hover:underline">
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const name          = s.fullName ?? '—';
                  const email         = getEmail(s);
                  const bi            = s.bi ?? '—';
                  const phone         = s.phone ?? '—';
                  const subjectNames  = getSubjectNames(s);
                  const subjectCount  = getSubjectCount(s);
                  const scholarship   = getScholarship(s);
                  const paymentStatus = getPaymentStatus(s);
                  const hasTarget     = !!getLatestTarget(s);

                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors group"
                    >
                      {/* Estudante */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ backgroundColor: avatarColor(name) }}
                          >
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#0A3956] transition-colors">
                              {name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{email}</p>
                          </div>
                        </div>
                      </td>

                      {/* BI */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-mono">{bi}</span>
                      </td>

                      {/* Contacto */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {phone}
                        </div>
                      </td>

                      {/* Disciplinas */}
                      <td className="px-6 py-4">
                        {!hasTarget ? (
                          <span className="text-xs text-gray-400 italic">Sem inscrição</span>
                        ) : subjectCount === 0 ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0A3956] text-xs font-semibold cursor-default"
                            title={subjectNames.join(', ')}
                          >
                            {subjectCount} disc.
                          </span>
                        )}
                      </td>

                      {/* Bolsa */}
                      <td className="px-6 py-4">
                        <ScholarshipBadge value={scholarship} />
                      </td>

                      {/* Pagamento */}
                      <td className="px-6 py-4">
                        <PaymentBadge value={paymentStatus} />
                      </td>

                      {/* Chevron */}
                      <td className="pr-4 py-4">
                        <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-[#0A3956] transition-all" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* ── RODAPÉ ── */}
          {!loading && total > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="text-sm text-gray-500">
                  Mostrando{' '}
                  <span className="font-semibold text-gray-700">{startItem}–{endItem}</span>
                  {' '}de{' '}
                  <span className="font-semibold text-gray-700">{total.toLocaleString('pt-PT')}</span>
                  {' '}estudantes
                  {hasActiveFilters && (
                    <span className="text-gray-400"> (filtrados de {allStudents.length})</span>
                  )}
                </p>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-300">
                  <span>·</span>
                  <span>Clique numa linha para ver o perfil completo</span>
                </span>
              </div>

              {/* Paginação */}
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>

                {pageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === p
                          ? 'bg-[#0A3956] text-white shadow-sm'
                          : 'border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-[#0A3956]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <style>{`
          @media (max-width: 767px) {
            table { display: none; }
          }
        `}</style>

        <div className="md:hidden bg-white rounded-xl shadow-sm overflow-hidden mt-0">
          <div className="divide-y divide-gray-100">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-48" />
                </div>
              ))
            ) : students.length === 0 ? (
              <div className="py-16 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700 mb-1">Nenhum estudante encontrado</p>
                <p className="text-sm text-gray-400 mb-4">Tente ajustar os filtros</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-[#0A3956] font-semibold hover:underline">
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              students.map((s) => {
                const name          = s.fullName ?? '—';
                const email         = getEmail(s);
                const bi            = s.bi ?? '—';
                const phone         = s.phone ?? '—';
                const subjectNames  = getSubjectNames(s);
                const subjectCount  = getSubjectCount(s);
                const scholarship   = getScholarship(s);
                const paymentStatus = getPaymentStatus(s);
                const hasTarget     = !!getLatestTarget(s);

                return (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/admin/students/${s.id}`)}
                    className="p-4 hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: avatarColor(name) }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{name}</p>
                          <p className="text-xs text-gray-400">{email}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Bolsa</span>
                        <ScholarshipBadge value={scholarship} />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Pgto</span>
                        <PaymentBadge value={paymentStatus} />
                      </div>
                      {/* Disciplinas — mobile */}
                      {!hasTarget ? (
                        <span className="text-xs text-gray-400 italic self-center">Sem inscrição</span>
                      ) : subjectCount > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0A3956] text-xs font-semibold">
                          {subjectCount} disc.
                        </span>
                      ) : null}
                    </div>

                    {subjectNames.length > 0 && (
                      <p className="text-xs text-gray-400 mb-2 truncate">{subjectNames.join(', ')}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {phone}
                      </span>
                      <span className="font-mono">{bi}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé mobile */}
          {!loading && total > 0 && (
            <div className="border-t border-gray-100 px-4 py-4">
              <p className="text-xs text-gray-400 text-center mb-3">
                Toque numa linha para ver o perfil completo
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">{startItem}–{endItem}</span>
                  {' '}de{' '}
                  <span className="font-semibold text-gray-700">{total}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <span className="px-3 text-sm text-gray-600 font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FAB mobile */}
        <button
          onClick={() => navigate('/admin/students/new')}
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#28A745] hover:bg-[#218838] text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 z-30"
          title="Novo Estudante"
        >
          <UserPlus className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}
