import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  UserPlus,
  Bell,
  ChevronRight,
  BarChart3,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-PT') + ' Kz';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const todayLabel = () =>
  new Date().toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ borderColor, icon, label, value, sub, subColor = 'text-gray-400' }) {
  return (
    <div
      className="bg-white rounded-xl p-5 shadow-sm"
      style={{ borderTop: `3px solid ${borderColor}` }}
    >
      <div className="mb-3">{icon}</div>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <p className="font-bold text-3xl text-[#0A3956] mb-1" style={{ lineHeight: 1.1 }}>
        {value}
      </p>
      <p className={`text-xs ${subColor}`}>{sub}</p>
    </div>
  );
}

function PaymentRow({ initial, avatarBg, name, dateLabel, amount, isPending }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
          style={{ backgroundColor: avatarBg }}
        >
          {initial}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{name}</p>
          <p className="text-xs text-gray-400">{dateLabel}</p>
        </div>
      </div>
      {isPending ? (
        <span className="inline-flex px-2.5 py-1 rounded-full bg-red-50 text-[#DC3545] text-xs font-medium">
          Pendente
        </span>
      ) : (
        <span className="text-sm font-semibold text-[#28A745]">{amount}</span>
      )}
    </div>
  );
}

// ─── Avatar colours ───────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#28A745', '#F69220', '#0A3956', '#6C63FF', '#DC3545'];
const getAvatarColor = (index) => AVATAR_COLORS[index % AVATAR_COLORS.length];

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm space-y-3">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <Skeleton className="h-5 w-32" />
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <Skeleton className="h-5 w-40" />
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/portal/acesso'); // ✅ corrigido
      } else {
        setError('Não foi possível carregar os dados do dashboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-700 mb-1">Erro ao carregar dashboard</p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={loadStats}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Data aliases ──
  const totalStudents      = stats?.totalEstudantes          ?? 0;
  const activeEnrollments  = stats?.totalTargetsActivos      ?? 0;
  const pendingPayments    = stats?.totalPagamentosPendentes ?? 0;
  const totalCollected     = stats?.totalArrecadado          ?? 0;
  
  const enrollmentRate       = stats?.enrollmentRate      ?? stats?.enrollment_rate     ?? null;
  const recentPayments       = stats?.recentPayments      ?? stats?.recent_payments     ?? [];
  const newStudentsThisMonth = stats?.newStudentsThisMonth ?? stats?.new_students_month ?? null;

  return (
    <div className="min-h-full bg-[#F8F9FA] p-6">
      <div className="max-w-[1200px] mx-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 gap-2">
          <div>
            <h1 className="text-2xl font-bold text-[#0A3956] mb-1">Dashboard</h1>
            <p className="text-sm text-gray-500">Bem-vindo de volta — visão geral do sistema</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 capitalize">{todayLabel()}</span>
            <button
              onClick={loadStats}
              title="Actualizar dados"
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#0A3956] hover:bg-blue-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

          {/* 🟠 Laranja — KPI principal */}
          <StatCard
            borderColor="#F69220"
            icon={<Users className="w-9 h-9 text-[#F69220]" strokeWidth={1.5} />}
            label="Total Estudantes"
            value={totalStudents.toLocaleString('pt-PT')}
            sub={newStudentsThisMonth != null ? `+${newStudentsThisMonth} este mês` : 'Este ano lectivo'}
            subColor="text-[#28A745]"
          />

          {/* 🔵 Azul */}
          <StatCard
            borderColor="#0A3956"
            icon={<FileText className="w-9 h-9 text-[#0A3956]" strokeWidth={1.5} />}
            label="Inscrições Activas"
            value={activeEnrollments.toLocaleString('pt-PT')}
      
            sub={`${activeEnrollments} inscrições este ano`}
            subColor="text-gray-400"
          />

          {/* 🔴 Vermelho — alerta */}
          <StatCard
            borderColor="#DC3545"
            icon={<CreditCard className="w-9 h-9 text-[#DC3545]" strokeWidth={1.5} />}
            label="Pagamentos Pendentes"
            value={pendingPayments.toLocaleString('pt-PT')}
            sub={pendingPayments > 0 ? 'Requerem atenção' : 'Tudo em dia ✓'}
            subColor={pendingPayments > 0 ? 'text-[#DC3545]' : 'text-[#28A745]'}
          />

          {/* 🟢 Verde — positivo */}
          <StatCard
            borderColor="#28A745"
            icon={<TrendingUp className="w-9 h-9 text-[#28A745]" strokeWidth={1.5} />}
            label="Total Arrecadado"
            value={formatCurrency(totalCollected)}
            sub="Este ano lectivo"
            subColor="text-gray-400"
          />
        </div>

        {/* ── DUAS COLUNAS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Acções Rápidas — ícones agora azuis */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-base font-semibold text-[#0A3956] mb-4">Acções Rápidas</h2>
            <div>
              <button
                onClick={() => navigate('/admin/students')}
                className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition-colors rounded-lg group border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-[#0A3956]" />
                  <span className="text-sm text-gray-700">Ver lista de estudantes</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0A3956] transition-colors" />
              </button>
              <button
                onClick={() => navigate('/admin/payments')}
                className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition-colors rounded-lg group border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#0A3956]" />
                  <span className="text-sm text-gray-700">Gerir pagamentos</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0A3956] transition-colors" />
              </button>
              <button
                onClick={() => navigate('/admin/notifications')}
                className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition-colors rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#0A3956]" />
                  <span className="text-sm text-gray-700">Enviar notificação WhatsApp</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0A3956] transition-colors" />
              </button>
            </div>
          </div>

          {/* Pagamentos Recentes */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#0A3956]">Pagamentos Recentes</h2>
              <button
                onClick={() => navigate('/admin/payments')}
                className="text-xs text-[#0A3956] hover:text-[#F69220] hover:underline transition-colors"
              >
                Ver todos →
              </button>
            </div>

            {recentPayments.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Nenhum pagamento recente
              </div>
            ) : (
              <div>
                {recentPayments.slice(0, 5).map((payment, index) => {
                  const name =
                    payment.studentName ??
                    payment.student_name ??
                    payment.name ??
                    'Estudante';
                  const initial  = name.charAt(0).toUpperCase();
                  const amount   = payment.amount ?? payment.amountPaid ?? payment.amount_paid ?? 0;
                  const isPending = payment.status === 'PENDING' || payment.status === 'pending';
                  const dateLabel = payment.date ?? payment.createdAt ?? payment.created_at ?? null;

                  return (
                    <PaymentRow
                      key={payment.id ?? index}
                      initial={initial}
                      avatarBg={getAvatarColor(index)}
                      name={name}
                      dateLabel={dateLabel ? formatDate(dateLabel) : '—'}
                      amount={formatCurrency(amount)}
                      isPending={isPending}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM CARDS — bordas e ícones agora azuis ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/admin/notifications')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
            style={{ borderTop: '3px solid #0A3956' }}
          >
            <Bell className="w-10 h-10 text-[#0A3956] mb-4 group-hover:text-[#F69220] transition-colors" strokeWidth={1.5} />
            <h3 className="text-base font-bold text-[#0A3956] mb-1">Notificações</h3>
            <p className="text-sm text-gray-500 mb-3">WhatsApp em massa</p>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#0A3956] transition-colors" />
          </button>

          <button
            onClick={() => navigate('/admin/exams')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
            style={{ borderTop: '3px solid #0A3956' }}
          >
            <FileText className="w-10 h-10 text-[#0A3956] mb-4 group-hover:text-[#F69220] transition-colors" strokeWidth={1.5} />
            <h3 className="text-base font-bold text-[#0A3956] mb-1">Provas</h3>
            <p className="text-sm text-gray-500 mb-3">Gerir simulações</p>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#0A3956] transition-colors" />
          </button>

          <button
            onClick={() => navigate('/admin/analytics')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
            style={{ borderTop: '3px solid #0A3956' }}
          >
            <BarChart3 className="w-10 h-10 text-[#0A3956] mb-4 group-hover:text-[#F69220] transition-colors" strokeWidth={1.5} />
            <h3 className="text-base font-bold text-[#0A3956] mb-1">Analytics</h3>
            <p className="text-sm text-gray-500 mb-3">Relatórios e gráficos</p>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#0A3956] transition-colors" />
          </button>
        </div>

      </div>
    </div>
  );
}