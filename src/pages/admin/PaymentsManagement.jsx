// src/pages/admin/PaymentsManagement.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle, TrendingUp, XCircle,
  Search, RefreshCw, AlertCircle, ChevronRight,
  Download, X, Filter, CreditCard, WifiOff,
  DollarSign, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';

// ─── Constantes ───────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#0A3956', '#F69220', '#28A745', '#6C63FF', '#DC3545', '#17A2B8'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const PAYMENT_CONFIG = {
  PENDING:   { bg: '#FFF3CD', text: '#856404', icon: Clock,       label: 'Pendente'  },
  PARTIAL:   { bg: '#CCE5FF', text: '#004085', icon: TrendingUp,  label: 'Parcial'   },
  PAID:      { bg: '#D4EDDA', text: '#155724', icon: CheckCircle, label: 'Pago'      },
  CANCELLED: { bg: '#F8D7DA', text: '#721C24', icon: XCircle,     label: 'Cancelado' },
};

const SCHOLARSHIP_CONFIG = {
  NONE:       { bg: '#F3F4F6', text: '#374151', label: 'Sem bolsa'  },
  PARTIAL_50: { bg: '#FFF3CD', text: '#856404', label: 'Bolsa 50%' },
  PARTIAL_75: { bg: '#FFE5CC', text: '#E07B00', label: 'Bolsa 75%' },
  FULL:       { bg: '#D4EDDA', text: '#155724', label: 'Bolsa total'},
};

const METHOD_LABELS = {
  CASH:          'Dinheiro',
  BANK_TRANSFER: 'Transferência Bancária',
  MULTICAIXA:    'Multicaixa',
};

const STATUS_OPTIONS = ['Todos', 'PENDING', 'PARTIAL', 'PAID', 'CANCELLED'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString('pt-PT')} Kz`;

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const getErrorMessage = (err, payment) => {
  if (!navigator.onLine || err.code === 'ERR_NETWORK') {
    return {
      title: 'Sem ligação à internet',
      message: 'Verifica a tua ligação à internet e tenta novamente.',
      icon: WifiOff,
    };
  }
  if (err.code === 'ECONNABORTED') {
    return {
      title: 'Tempo de resposta esgotado',
      message: 'O servidor demorou demasiado a responder. Tenta novamente.',
      icon: Clock,
    };
  }

  const status = err.response?.status;
  const serverMessage = err.response?.data?.error || err.response?.data?.message || '';

  if (serverMessage.includes('70%') || serverMessage.includes('Pagamento mínimo')) {
    // ✅ FIX — Correcção 3 do relatório: a regra dos 70% no backend só se
    // aplica quando status !== 'PARTIAL'. Se este erro aparecer com o
    // pagamento já em PARTIAL, é sinal de uma regressão/bug, não de um
    // valor insuficiente do utilizador — mensagem diferenciada.
    if (payment?.status === 'PARTIAL') {
      return {
        title: 'Erro inesperado na 2ª prestação',
        message:
          'O sistema rejeitou este valor com base na regra dos 70%, que não devia aplicar-se a uma 2ª prestação (status PARTIAL). Não tentes novamente — contacta o suporte técnico e reporta este erro.',
        icon: AlertTriangle,
      };
    }
    const match = serverMessage.match(/[\d.,]+\s*Kz/);
    const minValue = match ? match[0] : 'o mínimo exigido';
    return {
      title: 'Valor insuficiente',
      message: `O valor inserido não atinge o mínimo obrigatório de 70% do total. O pagamento mínimo aceite é de ${minValue}. Insere um valor igual ou superior.`,
      icon: AlertTriangle,
    };
  }
  if (status === 400) {
    return {
      title: 'Dados inválidos',
      message: serverMessage || 'Verifica os dados inseridos e tenta novamente.',
      icon: AlertCircle,
    };
  }
  if (status === 401) {
    return {
      title: 'Sessão expirada',
      message: 'A tua sessão expirou. Serás redirecionado para o login.',
      icon: AlertCircle,
    };
  }
  if (status === 404) {
    return {
      title: 'Pagamento não encontrado',
      message: 'Este pagamento já não existe ou foi removido. Actualiza a lista.',
      icon: AlertCircle,
    };
  }
  if (status === 422) {
    return {
      title: 'Operação não permitida',
      message: serverMessage || 'Este pagamento não pode ser aprovado no estado actual.',
      icon: AlertTriangle,
    };
  }
  if (status >= 500) {
    return {
      title: 'Erro no servidor',
      message: 'Ocorreu um problema interno no servidor. Tenta novamente mais tarde.',
      icon: AlertCircle,
    };
  }
  return {
    title: 'Erro inesperado',
    message: serverMessage || 'Algo correu mal. Tenta novamente ou contacta o suporte.',
    icon: AlertCircle,
  };
};

// NOTA: getErrorMessage(err) é chamado em mais sítios deste ficheiro além
// do ApproveModal (ex: loadData/handleExportCsv não têm "payment" no contexto).
// O segundo parâmetro é opcional — chamadas existentes como getErrorMessage(err)
// continuam a funcionar (payment fica undefined, payment?.status é undefined,
// cai no ramo "Valor insuficiente" genérico como antes). Só o ApproveModal
// passa o segundo argumento.



// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

function PaymentBadge({ status }) {
  const cfg = PAYMENT_CONFIG[status] || PAYMENT_CONFIG.PENDING;
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

function ScholarshipBadge({ type }) {
  const cfg = SCHOLARSHIP_CONFIG[type] || SCHOLARSHIP_CONFIG.NONE;
  if (!type || type === 'NONE') return null;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}

function KpiCard({ label, value, color, icon: Icon, sub }) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="rounded-lg p-2.5 flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-[#6B7280] mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-[#0A3956] leading-tight truncate">{value}</p>
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
        {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 last:border-0">
            <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-24 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modal de Aprovação ───────────────────────────────────────────────────────

function ApproveModal({ payment, onClose, onSuccess }) {
  const target = payment.studentTarget
  const student = target?.student
  const isPartial = payment.status === 'PARTIAL'
  const finalAmount = Number(target?.finalAmount || 0)
  const minRequired = Math.ceil(finalAmount * 0.7)

  // ── ✅ FIX: saldo real em falta, calculado no frontend como fonte de
  // verdade para validação (independente do que o backend devolver em
  // remainingBalance, que devia já estar correcto, mas isto serve de rede
  // de segurança extra — Correcção 1 do relatório).
  const alreadyPaid = Number(payment.amountPaid || 0)
  const realRemaining = Math.max(finalAmount - alreadyPaid, 0)

  // ── ✅ FIX: pré-preenchimento usa declaredAmount (valor que o ESTUDANTE
  // declarou ter pago nesta prestação) em vez de remainingBalance (saldo
  // em falta). Eram conceitos diferentes — usar remainingBalance levava o
  // admin a "corrigir" o campo para o valor real declarado, o que disparava
  // o bug de duplicação no backend antigo.
  const hasDeclaration =
    payment.declaredAmount !== null && payment.declaredAmount !== undefined
  const initialAmount = hasDeclaration
    ? String(Number(payment.declaredAmount))
    : String(realRemaining)

  const [amountPaid, setAmountPaid] = useState(initialAmount)
  const [method, setMethod] = useState(
    payment.declaredMethod || payment.method || 'CASH'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    setError(null)
    const amount = Number(amountPaid)

    if (!amountPaid || isNaN(amount) || amount <= 0) {
      setError({
        title: 'Valor inválido',
        message: 'Insere um valor maior que zero para continuar.',
        icon: AlertTriangle,
      })
      return
    }
    if (!method) {
      setError({
        title: 'Método em falta',
        message: 'Selecciona o método de pagamento utilizado pelo estudante.',
        icon: AlertTriangle,
      })
      return
    }

    // ── ✅ FIX — Correcção 2 do relatório: validar no frontend que o valor
    // não excede o saldo real em falta, antes mesmo de chamar a API.
    if (amount > realRemaining && realRemaining > 0) {
      setError({
        title: 'Valor superior ao saldo em falta',
        message: `O saldo em falta é de ${formatCurrency(realRemaining)}. Não podes registar mais do que isso.`,
        icon: AlertTriangle,
      })
      return
    }

    setLoading(true)
    try {
      await api.patch(`/admin/payments/${payment.id}/approve`, {
        amountPaid: amount,
        method,
      })
      onSuccess()
    } catch (err) {
      if (err.response?.status === 401) {
        onClose()
        return
      }
      setError(getErrorMessage(err, payment)) // ✅ FIX — passa payment para mensagem contextual
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const ErrorIcon = error?.icon || AlertCircle

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEE2E6]">
          <div>
            <h2 className="text-lg font-bold text-[#0A3956]">
              Confirmar Pagamento
            </h2>
            <p className="text-xs text-[#6C757D] mt-0.5">
              {isPartial
                ? '2ª prestação — saldo parcial em aberto'
                : '1ª prestação — pagamento inicial'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-[#6C757D]" />
          </button>
        </div>

        {/* Info do estudante */}
        <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#DEE2E6]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: avatarColor(student?.fullName || '') }}
            >
              {(student?.fullName || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[#0A3956]">
                {student?.fullName || '—'}
              </p>
              <p className="text-xs text-[#6C757D]">
                BI: {student?.bi || '—'} · Ano {target?.year}
              </p>
            </div>
          </div>

          {/* Resumo financeiro */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white rounded-lg p-3 text-center border border-[#DEE2E6]">
              <p className="text-xs text-[#6C757D] mb-1">Total</p>
              <p className="text-sm font-bold text-[#0A3956]">
                {formatCurrency(target?.finalAmount)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-[#DEE2E6]">
              <p className="text-xs text-[#6C757D] mb-1">Já pago</p>
              <p className="text-sm font-bold text-[#28A745]">
                {formatCurrency(payment.amountPaid)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-[#DEE2E6]">
              <p className="text-xs text-[#6C757D] mb-1">Em falta</p>
              <p className="text-sm font-bold text-[#DC3545]">
                {formatCurrency(realRemaining)}
              </p>
            </div>
          </div>

          {/* ✅ NOVO — Aviso do valor declarado pelo estudante */}
          {hasDeclaration && (
            <div className="mt-3 flex items-start gap-2 bg-[#CCE5FF] rounded-lg px-3 py-2">
              <DollarSign
                size={14}
                className="text-[#004085] flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-[#004085]">
                O estudante declarou ter pago{' '}
                <strong>{formatCurrency(payment.declaredAmount)}</strong>
                {payment.declaredMethod && (
                  <>
                    {' '}
                    via{' '}
                    <strong>
                      {METHOD_LABELS[payment.declaredMethod] ||
                        payment.declaredMethod}
                    </strong>
                  </>
                )}
                . Confirma este valor com o que recebeste presencialmente antes
                de aprovar.
              </p>
            </div>
          )}

          {/* Aviso 70% — só na 1ª prestação */}
          {!isPartial && (
            <div className="mt-3 flex items-start gap-2 bg-[#FFF3CD] rounded-lg px-3 py-2">
              <AlertTriangle
                size={14}
                className="text-[#856404] flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-[#856404]">
                O valor mínimo aceite é{' '}
                <strong>{formatCurrency(minRequired)}</strong> (70% do total).
                Podes aceitar um pagamento parcial ou o valor completo.
              </p>
            </div>
          )}
        </div>

        {/* Formulário */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0A3956] mb-1.5">
              Valor recebido presencialmente (Kz)
            </label>
            <div className="relative">
              <DollarSign
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]"
              />
              <input
                type="number"
                min="1"
                value={amountPaid}
                onChange={(e) => {
                  setAmountPaid(e.target.value)
                  setError(null)
                }}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956]"
                placeholder="Ex: 11900"
              />
            </div>
            <p className="text-xs text-[#6C757D] mt-1">
              {hasDeclaration
                ? 'Pré-preenchido com o valor declarado pelo estudante. Altera se for diferente do que recebeste.'
                : 'Pré-preenchido com o saldo em falta. Altera se o estudante pagou um valor diferente.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0A3956] mb-1.5">
              Método de pagamento utilizado
            </label>
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value)
                setError(null)
              }}
              className="w-full px-3 py-2.5 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] bg-white"
            >
              {Object.entries(METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-[#F8D7DA] border border-[#F5C6CB] rounded-lg px-4 py-3">
              <ErrorIcon
                size={16}
                className="text-[#DC3545] flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-[#721C24]">
                  {error.title}
                </p>
                <p className="text-xs text-[#721C24] mt-0.5">{error.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#28A745' }}
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> A confirmar
                pagamento...
              </>
            ) : (
              <>
                <CheckCircle size={15} /> Confirmar Pagamento
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-[#6C757D] hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PaymentsManagement() {
  const navigate = useNavigate();

  const [payments, setPayments]        = useState([]);
  const [loading, setLoading]          = useState(true);
  const [pageError, setPageError]      = useState(null);
  const [selectedPayment, setSelected] = useState(null);

  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('Todos');
  const [yearFilter, setYear]     = useState('Todos');

  // ── Carregar pagamentos ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const res = await api.get('/admin/payments');
      const data = res.data?.data ?? res.data;
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
      setPageError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApproveSuccess = async () => {
    setSelected(null);
    await loadData();
  };

  // ── Exportar CSV — CORRIGIDO ──────────────────────────────────────────────
  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('abc_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/reports/payments/csv`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pagamentos_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Não foi possível exportar o CSV. Tenta novamente.');
    }
  };

  // ── Filtros ───────────────────────────────────────────────────────────────
  const availableYears = ['Todos', ...new Set(
    payments.map(p => p.studentTarget?.year).filter(Boolean).sort((a, b) => b - a)
  )];

  const filtered = payments.filter(p => {
    const name = p.studentTarget?.student?.fullName?.toLowerCase() || '';
    const bi   = p.studentTarget?.student?.bi?.toLowerCase() || '';
    const q    = search.toLowerCase();
    return (
      (!q || name.includes(q) || bi.includes(q)) &&
      (statusFilter === 'Todos' || p.status === statusFilter) &&
      (yearFilter === 'Todos' || String(p.studentTarget?.year) === String(yearFilter))
    );
  });

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalArrecadado = payments.reduce((s, p) => s + Number(p.amountPaid || 0), 0);
  const totalPendente   = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + Number(p.remainingBalance || 0), 0);
  const totalParcial    = payments.filter(p => p.status === 'PARTIAL').reduce((s, p) => s + Number(p.remainingBalance || 0), 0);

  const activeFilters = [
    statusFilter !== 'Todos' && { key: 'status', label: PAYMENT_CONFIG[statusFilter]?.label || statusFilter },
    yearFilter   !== 'Todos' && { key: 'year',   label: `Ano ${yearFilter}` },
  ].filter(Boolean);

  if (loading) return <PageSkeleton />;

  if (pageError) {
    const ErrIcon = pageError.icon || AlertCircle;
    return (
      <div className="p-4 md:p-6 max-w-[1200px] mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-[#F8D7DA] border border-[#F5C6CB] rounded-2xl p-6 max-w-md w-full text-center">
          <ErrIcon size={36} className="text-[#DC3545] mx-auto mb-3" />
          <p className="font-bold text-[#721C24] text-lg">{pageError.title}</p>
          <p className="text-sm text-[#721C24] mt-2">{pageError.message}</p>
          <button
            onClick={loadData}
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
    <>
      {selectedPayment && (
        <ApproveModal
          payment={selectedPayment}
          onClose={() => setSelected(null)}
          onSuccess={handleApproveSuccess}
        />
      )}

      <div className="p-4 md:p-6 max-w-[1200px] mx-auto bg-[#F8F9FA] min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A3956]">Gestão de Pagamentos</h1>
            <p className="text-sm text-[#6C757D] mt-0.5">{payments.length} pagamentos registados</p>
          </div>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white flex-shrink-0 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0A3956' }}
          >
            <Download size={15} />
            Exportar CSV
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard label="Total Arrecadado" value={formatCurrency(totalArrecadado)} color="#28A745" icon={CheckCircle}
            sub={`${payments.filter(p => p.status === 'PAID').length} pagamentos concluídos`} />
          <KpiCard label="Pendente a Cobrar" value={formatCurrency(totalPendente)} color="#DC3545" icon={Clock}
            sub={`${payments.filter(p => p.status === 'PENDING').length} pagamentos pendentes`} />
          <KpiCard label="Parcial em Aberto" value={formatCurrency(totalParcial)} color="#004085" icon={TrendingUp}
            sub={`${payments.filter(p => p.status === 'PARTIAL').length} pagamentos parciais`} />
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou BI..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956]"
              />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" />
              <select value={statusFilter} onChange={e => setStatus(e.target.value)}
                className="pl-8 pr-8 py-2 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] bg-white appearance-none cursor-pointer">
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s === 'Todos' ? 'Todos os estados' : PAYMENT_CONFIG[s]?.label || s}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select value={yearFilter} onChange={e => setYear(e.target.value)}
                className="px-3 py-2 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] bg-white appearance-none cursor-pointer">
                {availableYears.map(y => (
                  <option key={y} value={y}>{y === 'Todos' ? 'Todos os anos' : `Ano ${y}`}</option>
                ))}
              </select>
            </div>
          </div>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.map(f => (
                <span key={f.key} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#0A3956] text-xs font-medium rounded-full">
                  {f.label}
                  <button onClick={() => f.key === 'status' ? setStatus('Todos') : setYear('Todos')} className="hover:text-[#DC3545] transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
              <button onClick={() => { setStatus('Todos'); setYear('Todos'); setSearch(''); }}
                className="text-xs text-[#6C757D] hover:text-[#DC3545] underline">
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-[#6C757D] mb-2 px-1">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== payments.length && ` de ${payments.length}`}
        </p>

        {/* TABELA — Desktop */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hidden md:block">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6C757D]">
              <CreditCard size={40} className="mb-3 opacity-30" />
              <p className="font-medium">Nenhum pagamento encontrado</p>
              <p className="text-sm mt-1">Tenta ajustar os filtros de pesquisa</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#DEE2E6]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Estudante</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Valor Total</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Pago</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Em Falta</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide hidden lg:table-cell">Actualizado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(payment => {
                  const student    = payment.studentTarget?.student;
                  const target     = payment.studentTarget;
                  const name       = student?.fullName || 'Sem nome';
                  const canApprove = payment.status === 'PENDING' || payment.status === 'PARTIAL';

                  return (
                    <tr key={payment.id} onClick={() => navigate(`/admin/students/${student?.id}`)}
                      className="border-b border-gray-100 last:border-0 cursor-pointer hover:bg-blue-50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: avatarColor(name) }}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#0A3956] group-hover:text-[#0D4A6E] truncate max-w-[180px]">{name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-[#6C757D]">Ano {target?.year} · {target?.subjectCount} disc.</span>
                              <ScholarshipBadge type={target?.scholarshipType} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <PaymentBadge status={payment.status} />
                          {payment.method && <span className="text-xs text-[#6C757D]">{METHOD_LABELS[payment.method] || payment.method}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-[#0A3956]">{formatCurrency(target?.finalAmount)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-[#28A745]">{formatCurrency(payment.amountPaid)}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-1 mt-1 ml-auto">
                          <div className="h-1 rounded-full" style={{
                            width: `${Math.min(Number(payment.percentagePaid || 0), 100)}%`,
                            backgroundColor: Number(payment.percentagePaid) >= 100 ? '#28A745' : '#F69220',
                          }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${Number(payment.remainingBalance) > 0 ? 'text-[#DC3545]' : 'text-[#28A745]'}`}>
                          {formatCurrency(payment.remainingBalance)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6C757D] text-xs hidden lg:table-cell">{formatDate(payment.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          {canApprove && (
                            <button
                              onClick={e => { e.stopPropagation(); setSelected(payment); }}
                              className="px-3 py-1 text-xs font-medium text-white rounded-lg flex-shrink-0 hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: '#28A745' }}
                            >
                              Aprovar
                            </button>
                          )}
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0A3956] transition-colors flex-shrink-0" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* CARDS — Mobile */}
        <div className="flex flex-col gap-3 md:hidden">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-14 text-[#6C757D]">
              <CreditCard size={36} className="mb-3 opacity-30" />
              <p className="font-medium">Nenhum pagamento encontrado</p>
            </div>
          ) : (
            filtered.map(payment => {
              const student    = payment.studentTarget?.student;
              const target     = payment.studentTarget;
              const name       = student?.fullName || 'Sem nome';
              const canApprove = payment.status === 'PENDING' || payment.status === 'PARTIAL';

              return (
                <div key={payment.id} onClick={() => navigate(`/admin/students/${student?.id}`)}
                  className="bg-white rounded-xl shadow-sm p-4 cursor-pointer active:bg-blue-50 transition-colors"
                  style={{ borderLeft: `3px solid ${PAYMENT_CONFIG[payment.status]?.bg || '#DEE2E6'}` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: avatarColor(name) }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0A3956] truncate">{name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#6C757D]">Ano {target?.year} · {target?.subjectCount} disc.</span>
                        <ScholarshipBadge type={target?.scholarshipType} />
                      </div>
                    </div>
                    <PaymentBadge status={payment.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-xs text-[#6C757D]">Total</p>
                      <p className="font-medium text-[#0A3956]">{formatCurrency(target?.finalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6C757D]">Pago</p>
                      <p className="font-medium text-[#28A745]">{formatCurrency(payment.amountPaid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6C757D]">Em falta</p>
                      <p className={`font-medium ${Number(payment.remainingBalance) > 0 ? 'text-[#DC3545]' : 'text-[#28A745]'}`}>
                        {formatCurrency(payment.remainingBalance)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                    <div className="h-1.5 rounded-full transition-all" style={{
                      width: `${Math.min(Number(payment.percentagePaid || 0), 100)}%`,
                      backgroundColor: Number(payment.percentagePaid) >= 100 ? '#28A745' : '#F69220',
                    }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6C757D]">{formatDate(payment.updatedAt)}</span>
                    <div className="flex items-center gap-2">
                      {canApprove && (
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(payment); }}
                          className="px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#28A745' }}
                        >
                          Aprovar
                        </button>
                      )}
                      <ChevronRight size={16} className="text-[#6C757D]" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </>
  );
}
