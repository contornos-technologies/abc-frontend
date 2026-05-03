import { useState } from 'react';
import { CreditCard, Loader2, AlertCircle, X } from 'lucide-react';
import api from '../../services/api';

const formatCurrency = (value) => Number(value).toLocaleString('pt-PT') + ' Kz';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT');
}

const STATUS_CONFIG = {
  PAID:      { bg: '#D4EDDA', color: '#155724', label: 'Pago ✅' },
  PARTIAL:   { bg: '#CCE5FF', color: '#004085', label: 'Pagamento Parcial' },
  PENDING:   { bg: '#FFF3CD', color: '#856404', label: 'Pagamento Pendente' },
  CANCELLED: { bg: '#F8D7DA', color: '#721C24', label: 'Cancelado' },
};

const METHOD_LABELS = {
  CASH:          'Cash',
  BANK_TRANSFER: 'Transferência',
  MULTICAIXA:    'Multicaixa',
};

export default function PaymentCard({ payments, loading, error, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess]     = useState(false);
  const [form, setForm]           = useState({ amount: '', method: 'CASH', note: '' });

  // ✅ backend devolve array — pegamos o primeiro elemento
  const data      = Array.isArray(payments) ? payments[0] : payments;
  const status    = data?.status || 'PENDING';
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const amountPaid = Number(data?.amountPaid || 0);
  const remaining  = Number(data?.remainingBalance || 0);
  const progress   = Number(data?.percentagePaid || 0);
  const isFull     = status === 'PAID';

  function openModal() {
    setForm({ amount: '', method: 'CASH', note: '' });
    setFormError('');
    setSuccess(false);
    setShowModal(true);
  }

  async function handleRegister() {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setFormError('Insira um valor válido. O valor deve ser maior que zero.');
      return;
    }
    if (Number(form.amount) > remaining) {
      setFormError(`O valor não pode ser superior ao valor em falta (${formatCurrency(remaining)}).`);
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await api.post(`/payments/${data.id}/mark-paid`, {
        amountPaid: Number(form.amount),
        method: form.method,
        note:   form.note || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        onRefresh && onRefresh();
      }, 1500);
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.error || err.response?.data?.message || '';
      if (status === 400) {
        setFormError(msg || 'Dados inválidos. Verifica o valor e tenta novamente.');
      } else if (status === 404) {
        setFormError('Pagamento não encontrado. Recarrega a página e tenta novamente.');
      } else if (!navigator.onLine) {
        setFormError('Sem ligação à internet. Verifica a tua rede e tenta novamente.');
      } else {
        setFormError(msg || 'Erro ao registar pagamento. Tenta novamente.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#F69220] p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="text-[#0A3956]" size={24} />
          <h2 className="text-[#0A3956] font-semibold text-base">Pagamentos</h2>
        </div>
        <div className="flex items-center justify-center py-10 text-[#6B7280] gap-3">
          <Loader2 className="animate-spin" size={22} />
          <span className="text-sm">A carregar pagamentos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#F69220] p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="text-[#0A3956]" size={24} />
          <h2 className="text-[#0A3956] font-semibold text-base">Pagamentos</h2>
        </div>
        <div className="flex items-center gap-2 bg-red-50 text-[#DC3545] px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#F69220] p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="text-[#0A3956]" size={24} />
          <h2 className="text-[#0A3956] font-semibold text-base">Pagamentos</h2>
        </div>
        <div className="bg-[#F8FAFC] rounded-lg p-6 text-center text-[#6B7280] text-sm">
          Nenhum pagamento encontrado. Crie uma inscrição primeiro.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#F69220] p-6 hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CreditCard className="text-[#0A3956]" size={24} />
            <h2 className="text-[#0A3956] font-semibold text-base">Pagamentos</h2>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
          >
            {statusCfg.label}
          </span>
        </div>

        <div className="text-[13px] text-[#6B7280] mb-4">
          Valor total:{' '}
          <span className="font-semibold text-[#0A3956]">
            {formatCurrency(amountPaid + remaining)}
          </span>
        </div>

        <div className="h-px bg-[#E5E7EB] mb-5" />

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#F8FAFC] p-5 rounded-lg">
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2">JÁ PAGO</div>
            <div className="text-[#28A745] font-bold text-2xl">{formatCurrency(amountPaid)}</div>
          </div>
          <div className="bg-[#F8FAFC] p-5 rounded-lg">
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2">EM FALTA</div>
            <div className="text-[#DC3545] font-bold text-2xl">{formatCurrency(remaining)}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">Progresso do Pagamento</span>
            <span className="text-[#F69220] font-bold text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round(progress))}%`,
                background: 'linear-gradient(to right, #F69220, #E08210)',
              }}
            />
          </div>
        </div>

        {/* Transactions */}
        {data.transactions?.length > 0 && (
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-3">TRANSACÇÕES</div>
            <div className="space-y-2">
              {data.transactions.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#F8FAFC] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <span className="text-[13px] text-[#6B7280] min-w-[80px]">{formatDate(t.createdAt)}</span>
                    <span className="bg-[#0A3956] text-white px-2 py-1 rounded text-[10px] font-medium">
                      {METHOD_LABELS[t.method] || t.method}
                    </span>
                    {t.note && <span className="text-[13px] text-[#6B7280]">{t.note}</span>}
                  </div>
                  <span className="text-[13px] font-bold text-[#0A3956]">{formatCurrency(t.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action */}
        {isFull ? (
          <div className="bg-[#D4EDDA] text-[#155724] p-4 rounded-lg text-center font-semibold text-sm">
            Pagamento concluído ✅
          </div>
        ) : (
          <button
            onClick={openModal}
            className="w-full bg-[#F69220] text-white py-3 rounded-lg font-semibold hover:bg-[#E08210] transition-colors text-sm"
          >
            Registar Pagamento
          </button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#0A3956] font-bold text-lg">Registar Pagamento</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="bg-[#D4EDDA] text-[#155724] p-4 rounded-lg text-center font-semibold">
                Pagamento registado com sucesso ✅
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {/* Valor */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2 block">
                      VALOR (Kz)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.amount}
                      onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                      placeholder="Ex: 75000"
                      className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#F69220]"
                    />
                    <p className="text-xs text-[#6B7280] mt-1">
                      Valor em falta: <span className="font-semibold text-[#0A3956]">{formatCurrency(remaining)}</span>
                    </p>
                  </div>

                  {/* Método */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2 block">
                      MÉTODO DE PAGAMENTO
                    </label>
                    <select
                      value={form.method}
                      onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}
                      className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#F69220] bg-white"
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Transferência Bancária</option>
                      <option value="MULTICAIXA">Multicaixa</option>
                    </select>
                  </div>

                  {/* Nota */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2 block">
                      NOTA (opcional)
                    </label>
                    <input
                      type="text"
                      value={form.note}
                      onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                      placeholder="Ex: Primeiro pagamento"
                      className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#F69220]"
                    />
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border-2 border-gray-300 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-[#F69220] text-white rounded-lg text-sm font-semibold hover:bg-[#E08210] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving && <Loader2 size={15} className="animate-spin" />}
                    Registar
                  </button>
                </div>

                {/* ERRO — abaixo dos botões */}
                {formError && (
                  <div className="mt-3 bg-red-50 text-[#DC3545] text-sm px-4 py-3 rounded-lg border border-red-200 text-center">
                    {formError}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}