import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, AlertCircle,
  User, Phone, Mail, CreditCard, Calendar,
  BookOpen, GraduationCap, Building2, CheckCircle,
  Clock, XCircle, ChevronDown, Award, Banknote,
  TrendingUp, FileText, IdCard,
} from 'lucide-react';
import api from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLatestTarget(student) {
  if (!student?.targets?.length) return null;
  return [...student.targets].sort((a, b) => b.year - a.year)[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function formatCurrency(value) {
  if (value == null) return '—';
  return Number(value).toLocaleString('pt-PT') + ' Kz';
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const SCHOLARSHIP_CONFIG = {
  NONE:       { label: 'Sem bolsa',   className: 'bg-gray-100 text-gray-600' },
  PARTIAL_50: { label: 'Bolsa 50%',   className: 'bg-[#FFF3CD] text-[#856404]' },
  PARTIAL_75: { label: 'Bolsa 75%',   className: 'bg-[#FFE5CC] text-[#E07B00]' },
  FULL:       { label: 'Bolsa total', className: 'bg-[#D4EDDA] text-[#155724]' },
};

const PAYMENT_CONFIG = {
  PENDING:   { label: 'Pendente',  className: 'bg-[#FFF3CD] text-[#856404]',  icon: Clock      },
  PARTIAL:   { label: 'Parcial',   className: 'bg-[#CCE5FF] text-[#004085]',  icon: TrendingUp },
  PAID:      { label: 'Pago',      className: 'bg-[#D4EDDA] text-[#155724]',  icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', className: 'bg-[#F8D7DA] text-[#721C24]',  icon: XCircle    },
};

const TARGET_STATUS_CONFIG = {
  ACTIVE:    { label: 'Activa',     className: 'bg-[#D4EDDA] text-[#155724]' },
  CANCELLED: { label: 'Cancelada',  className: 'bg-[#F8D7DA] text-[#721C24]' },
  COMPLETED: { label: 'Concluída',  className: 'bg-[#CCE5FF] text-[#004085]' },
};

function ScholarshipBadge({ value }) {
  const cfg = SCHOLARSHIP_CONFIG[value] ?? SCHOLARSHIP_CONFIG.NONE;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ value, size = 'sm' }) {
  const cfg = PAYMENT_CONFIG[value] ?? PAYMENT_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold ${size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs'} ${cfg.className}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      {cfg.label}
    </span>
  );
}

function TargetStatusBadge({ value }) {
  const cfg = TARGET_STATUS_CONFIG[value] ?? TARGET_STATUS_CONFIG.ACTIVE;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
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

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-[#0A3956]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">{label}</p>
        <p className={`text-sm font-semibold text-gray-800 ${mono ? 'font-mono' : ''}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, color = '#0A3956', children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5"
           style={{ borderTop: `3px solid ${color}` }}>
        <Icon className="w-4 h-4" style={{ color }} />
        <h2 className="text-sm font-semibold text-[#0A3956]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function ModalOverlay({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const [showScholarModal, setShowScholarModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [scholarValue, setScholarValue]         = useState('');
  const [actionLoading, setActionLoading]       = useState(false);
  const [actionError, setActionError]           = useState(null);
  const [actionSuccess, setActionSuccess]       = useState(null);

  const loadStudent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/students/${id}`);
      setStudent(res.data?.data ?? res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/portal/acesso');
      else setError('Não foi possível carregar o estudante.');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { loadStudent(); }, [loadStudent]);

  const target       = student ? getLatestTarget(student) : null;
  const payment      = target?.payment ?? null;
  const subjects     = target?.subjects ?? [];
  const applications = target?.applications ?? student?.targets?.flatMap(t => t.applications ?? []) ?? [];

  // ─── Actions ─────────────────────────────────────────────────────────────

  const handleApprovePayment = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      await api.patch(`/admin/payments/${payment.id}/approve`);
      setActionSuccess('Pagamento aprovado com sucesso!');
      setShowPaymentModal(false);
      await loadStudent();
    } catch (err) {
      setActionError(err.response?.data?.message ?? 'Erro ao aprovar pagamento.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateScholarship = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      await api.patch(`/admin/targets/${target.id}/scholarship`, { scholarshipType: scholarValue });
      setActionSuccess('Bolsa actualizada com sucesso!');
      setShowScholarModal(false);
      await loadStudent();
    } catch (err) {
      setActionError(err.response?.data?.message ?? 'Erro ao actualizar bolsa.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── NOVO: Gerar Cartão ────────────────────────────────────────────────────
  const handleGenerateCard = async () => {
    try {
      const res = await api.get(`/admin/cards/student/${student.id}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      setActionError('Erro ao gerar o cartão. Tenta novamente.');
    }
  };

  useEffect(() => {
    if (actionSuccess) {
      const t = setTimeout(() => setActionSuccess(null), 3500);
      return () => clearTimeout(t);
    }
  }, [actionSuccess]);

  const name = student?.fullName ?? '—';

  return (
    <div className="min-h-full bg-[#F8F9FA] p-4 md:p-6">
      <div className="max-w-[1200px] mx-auto">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admin/students')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0A3956] transition-colors font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Voltar a Estudantes
          </button>
          <button
            onClick={loadStudent}
            title="Actualizar"
            className="p-2 rounded-lg text-gray-400 hover:text-[#0A3956] hover:bg-blue-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ── ERRO DE CARGA ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={loadStudent} className="text-sm font-medium text-red-700 hover:underline">
              Tentar novamente
            </button>
          </div>
        )}

        {/* ── FEEDBACK DE ACÇÃO ── */}
        {actionSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">{actionSuccess}</p>
          </div>
        )}
        {actionError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 flex-1">{actionError}</p>
            <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600 transition-colors">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <DetailSkeleton />
        ) : student ? (
          <div className="space-y-4">

            {/* ── HERO — Perfil ── */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div style={{ borderTop: '3px solid #0A3956' }} />
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                    style={{ backgroundColor: avatarColor(name) }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-xl font-bold text-[#0A3956]">{name}</h1>
                      {target && <TargetStatusBadge value={target.status} />}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{student.user?.email ?? '—'}</p>
                    <div className="flex flex-wrap gap-2">
                      {target && <ScholarshipBadge value={target.scholarshipType} />}
                      {payment && <PaymentBadge value={payment.status} />}
                      {target && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0A3956] text-xs font-semibold">
                          {target.year}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acções rápidas */}
                  {target && (
                    <div className="flex flex-col gap-2 sm:flex-shrink-0 w-full sm:w-auto">
                      {/* Alterar Bolsa */}
                      <button
                        onClick={() => { setScholarValue(target.scholarshipType ?? 'NONE'); setShowScholarModal(true); }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A3956] hover:bg-[#0D4A6E] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full sm:w-auto"
                      >
                        <Award className="w-4 h-4" />
                        Alterar Bolsa
                      </button>

                      {/* Gerar Cartão — só para elegíveis */}
                      {(payment?.status === 'PAID' || target?.scholarshipType === 'FULL') && (
                        <button
                          onClick={handleGenerateCard}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F69220] hover:bg-[#E07B00] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full sm:w-auto"
                        >
                          <IdCard className="w-4 h-4" />
                          Gerar Cartão
                        </button>
                      )}

                      {/* Aprovar Pagamento */}
                      {payment && (payment.status === 'PENDING' || payment.status === 'PARTIAL') && (
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#28A745] hover:bg-[#218838] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full sm:w-auto"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprovar Pgto.
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── GRID PRINCIPAL ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Col 1 — Dados Pessoais */}
              <SectionCard title="Dados Pessoais" icon={User} color="#0A3956">
                <InfoRow icon={User}       label="Nome completo"   value={student.fullName} />
                <InfoRow icon={CreditCard} label="BI"              value={student.bi} mono />
                <InfoRow icon={Phone}      label="Telefone"        value={student.user?.phone} /> {/* ✅ V12.3 — era student.phone */}
                <InfoRow icon={Mail}       label="Email"           value={student.user?.email} />
                <InfoRow icon={Calendar}   label="Data nascimento" value={formatDate(student.birthDate)} />
                <InfoRow icon={Calendar}   label="Registado em"    value={formatDate(student.createdAt)} />
              </SectionCard>

              {/* Col 2 — Inscrição */}
              <SectionCard title="Inscrição" icon={BookOpen} color="#0D4A6E">
                {!target ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Sem inscrição</p>
                    <p className="text-xs text-gray-400">Este estudante ainda não tem inscrição activa</p>
                  </div>
                ) : (
                  <>
                    <InfoRow icon={Calendar} label="Ano lectivo"    value={String(target.year)} />
                    <InfoRow icon={BookOpen} label="Nº disciplinas" value={String(target.subjectCount ?? subjects.length)} />
                    <InfoRow icon={Banknote} label="Preço base"     value={formatCurrency(target.totalAmount)} />
                    <InfoRow icon={Banknote} label="Valor final"    value={formatCurrency(target.finalAmount)} />
                    {subjects.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-50">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Disciplinas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {subjects.map((ts, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-[#0A3956] text-xs font-medium">
                              {ts.subject?.name ?? ts.subject?.code ?? '?'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </SectionCard>

              {/* Col 3 — Pagamento */}
              <SectionCard title="Pagamento" icon={Banknote} color={payment?.status === 'PAID' ? '#28A745' : payment?.status === 'CANCELLED' ? '#DC3545' : '#F69220'}>
                {!payment ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Banknote className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Sem pagamento</p>
                    <p className="text-xs text-gray-400">Não existe registo de pagamento</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                      <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Estado</span>
                      <PaymentBadge value={payment.status} size="lg" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Valor total</span>
                        <span className="text-sm font-semibold text-gray-800">{formatCurrency(target?.finalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Valor pago</span>
                        <span className="text-sm font-semibold text-[#28A745]">{formatCurrency(payment.amountPaid)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                        <span className="text-xs font-semibold text-gray-600">Saldo em falta</span>
                        <span className={`text-sm font-bold ${Number(payment.remainingBalance) > 0 ? 'text-[#DC3545]' : 'text-[#28A745]'}`}>
                          {formatCurrency(payment.remainingBalance)}
                        </span>
                      </div>
                    </div>
                    {target?.finalAmount && Number(target.finalAmount) > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                          <span>Progresso</span>
                          <span>{Math.min(100, Math.round((Number(payment.amountPaid) / Number(target.finalAmount)) * 100))}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.round((Number(payment.amountPaid) / Number(target.finalAmount)) * 100))}%`,
                              backgroundColor: payment.status === 'PAID' ? '#28A745' : '#0A3956',
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {payment.updatedAt && (
                      <p className="text-xs text-gray-400 mt-3">
                        Última actualização: {formatDate(payment.updatedAt)}
                      </p>
                    )}
                  </>
                )}
              </SectionCard>
            </div>

            {/* ── CANDIDATURAS ── */}
            {applications.length > 0 && (
              <SectionCard title="Candidaturas a Universidades" icon={GraduationCap} color="#0A3956">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {applications.map((app, i) => (
                    <div key={app.id ?? i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-[#0A3956]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{app.university?.name ?? '—'}</p>
                        {app.faculty?.name && <p className="text-xs text-gray-500 truncate">{app.faculty.name}</p>}
                        {app.course?.name && <p className="text-xs text-[#0A3956] font-medium truncate">{app.course.name}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ── HISTÓRICO ── */}
            {student.targets && student.targets.length > 1 && (
              <SectionCard title="Histórico de Inscrições" icon={FileText} color="#6C757D">
                <div className="space-y-2">
                  {[...student.targets]
                    .sort((a, b) => b.year - a.year)
                    .map((t, i) => (
                      <div key={t.id ?? i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-semibold text-[#0A3956] w-12">{t.year}</span>
                          <span className="text-xs text-gray-500">{t.subjectCount ?? t.subjects?.length ?? 0} disciplinas</span>
                          <TargetStatusBadge value={t.status} />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <ScholarshipBadge value={t.scholarshipType} />
                          {t.payment && <PaymentBadge value={t.payment.status} />}
                          <span className="text-sm font-semibold text-gray-700">{formatCurrency(t.finalAmount)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </SectionCard>
            )}

          </div>
        ) : null}
      </div>

      {/* ── MODAL — Alterar Bolsa ── */}
      {showScholarModal && (
        <ModalOverlay onClose={() => setShowScholarModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#0A3956]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A3956]">Alterar Bolsa</h3>
                <p className="text-xs text-gray-500">{name}</p>
              </div>
            </div>
            <div className="space-y-2 mb-5">
              {Object.entries(SCHOLARSHIP_CONFIG).map(([value, cfg]) => (
                <button
                  key={value}
                  onClick={() => setScholarValue(value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                    scholarValue === value ? 'border-[#0A3956] bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700">{cfg.label}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
                    {cfg.label}
                  </span>
                </button>
              ))}
            </div>
            {actionError && <p className="text-xs text-red-600 mb-3">{actionError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setShowScholarModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateScholarship}
                disabled={actionLoading || scholarValue === target?.scholarshipType}
                className="flex-1 px-4 py-2.5 bg-[#0A3956] hover:bg-[#0D4A6E] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'A guardar...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── MODAL — Aprovar Pagamento ── */}
      {showPaymentModal && (
        <ModalOverlay onClose={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#28A745]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A3956]">Aprovar Pagamento</h3>
                <p className="text-xs text-gray-500">{name}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Valor total</span>
                <span className="font-semibold text-gray-800">{formatCurrency(target?.finalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Já pago</span>
                <span className="font-semibold text-[#28A745]">{formatCurrency(payment?.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                <span className="text-gray-600 font-medium">Em falta</span>
                <span className="font-bold text-[#DC3545]">{formatCurrency(payment?.remainingBalance)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Ao aprovar, o estado do pagamento será actualizado. Esta acção não pode ser revertida.
            </p>
            {actionError && <p className="text-xs text-red-600 mb-3">{actionError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApprovePayment}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-[#28A745] hover:bg-[#218838] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'A processar...' : 'Aprovar'}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
