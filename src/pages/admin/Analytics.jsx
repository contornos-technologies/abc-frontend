// src/pages/admin/Analytics.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, Clock, CheckCircle,
  AlertCircle, RefreshCw, BarChart2, BookOpen,
  Award, GraduationCap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import api from '../../services/api';

// ─── Cores ────────────────────────────────────────────────────────────────────
const COLORS = {
  primary:  '#0A3956',
  orange:   '#F69220',
  success:  '#28A745',
  danger:   '#DC3545',
  muted:    '#6C757D',
  border:   '#DEE2E6',
  bg:       '#F8F9FA',
};

const PIE_COLORS = {
  PAID:      '#28A745',
  PARTIAL:   '#0A3956',
  PENDING:   '#F69220',
  CANCELLED: '#DC3545',
};

const PIE_LABELS = {
  PAID:      'Pago',
  PARTIAL:   'Parcial',
  PENDING:   'Pendente',
  CANCELLED: 'Cancelado',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (v) => `${Number(v || 0).toLocaleString('pt-PT')} Kz`;

const monthLabel = (str) => {
  if (!str) return '';
  const [year, month] = str.split('-');
  const names = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${names[parseInt(month, 10) - 1]} ${year}`;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-5">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton({ height = 'h-64' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 ${height}`}>
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, icon: Icon }) {
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

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={18} style={{ color: COLORS.primary }} />
      <h2 className="text-base font-semibold text-[#0A3956]">{title}</h2>
    </div>
  );
}

// ─── Tooltip personalizado ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#DEE2E6] rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-semibold text-[#0A3956] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || COLORS.primary }}>
          {p.name}: {prefix}{Number(p.value).toLocaleString('pt-PT')}{suffix}
        </p>
      ))}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Analytics() {
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [data, setData]         = useState({
    overview:          null,
    enrollByMonth:     [],
    enrollByUni:       [],
    enrollByCourse:    [],
    revenueByMonth:    [],
    paymentsByStatus:  [],
    topDebtors:        [],
    avgScores:         [],
    scoreDist:         [],
    mostTaken:         [],
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        overview,
        enrollByMonth,
        enrollByUni,
        enrollByCourse,
        revenueByMonth,
        paymentsByStatus,
        topDebtors,
        avgScores,
        scoreDist,
        mostTaken,
      ] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/admin/analytics/enrollments/by-month'),
        api.get('/admin/analytics/enrollments/by-university'),
        api.get('/admin/analytics/enrollments/by-course'),
        api.get('/admin/analytics/revenue/by-month'),
        api.get('/admin/analytics/payments/by-status'),
        api.get('/admin/analytics/students/top-debtors'),
        api.get('/admin/analytics/exams/average-scores'),
        api.get('/admin/analytics/exams/score-distribution'),
        api.get('/admin/analytics/exams/most-taken'),
      ]);

      setData({
        overview:         overview.data?.data ?? overview.data,
        enrollByMonth:    enrollByMonth.data?.data ?? enrollByMonth.data ?? [],
        enrollByUni:      enrollByUni.data?.data ?? enrollByUni.data ?? [],
        enrollByCourse:   enrollByCourse.data?.data ?? enrollByCourse.data ?? [],
        revenueByMonth:   revenueByMonth.data?.data ?? revenueByMonth.data ?? [],
        paymentsByStatus: paymentsByStatus.data?.data ?? paymentsByStatus.data ?? [],
        topDebtors:       topDebtors.data?.data ?? topDebtors.data ?? [],
        avgScores:        avgScores.data?.data ?? avgScores.data ?? [],
        scoreDist:        scoreDist.data?.data ?? scoreDist.data ?? [],
        mostTaken:        mostTaken.data?.data ?? mostTaken.data ?? [],
      });
    } catch (err) {
      if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
      setError('Não foi possível carregar os dados. Verifica a ligação e tenta novamente.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Erro ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-[#F8D7DA] border border-[#F5C6CB] rounded-2xl p-6 max-w-md w-full text-center">
          <AlertCircle size={36} className="text-[#DC3545] mx-auto mb-3" />
          <p className="font-bold text-[#721C24] text-lg">Erro ao carregar Analytics</p>
          <p className="text-sm text-[#721C24] mt-2">{error}</p>
          <button
            onClick={loadAll}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: COLORS.primary }}
          >
            <RefreshCw size={14} /> Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const ov = data.overview;

  // ── Preparar dados para os gráficos ──────────────────────────────────────
  const enrollMonthData = data.enrollByMonth.map(d => ({
    ...d,
    label: monthLabel(d.month || d.period),
    count: Number(d.count || d.total || 0),
  }));

  const revenueMonthData = data.revenueByMonth.map(d => ({
    ...d,
    label: monthLabel(d.month || d.period),
    total: Number(d.total || d.revenue || d.amount || 0),
  }));

  const payStatusData = data.paymentsByStatus.map(d => ({
    name:  PIE_LABELS[d.status] || d.status,
    value: Number(d.count || d.total || 0),
    color: PIE_COLORS[d.status] || COLORS.primary,
    status: d.status,
  }));

  const uniData = data.enrollByUni
    .slice(0, 8)
    .map(d => ({ name: d.university || d.name || '—', count: Number(d.count || 0) }));

  const courseData = data.enrollByCourse
    .slice(0, 8)
    .map(d => ({ name: d.course || d.name || '—', count: Number(d.count || 0) }));

  const avgScoreData = data.avgScores.map(d => ({
    name:  d.exam || d.title || d.name || '—',
    media: Number(d.average || d.avg || d.score || 0),
  }));

  const mostTakenData = data.mostTaken.slice(0, 8).map(d => ({
    name:  d.exam || d.title || d.name || '—',
    total: Number(d.count || d.total || 0),
  }));

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-[1200px] mx-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0A3956]">Analytics</h1>
            <p className="text-sm text-[#6C757D] mt-0.5">Visão geral do centro — dados em tempo real</p>
          </div>
          <button
            onClick={loadAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: COLORS.primary }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* ── SECÇÃO 1 — KPIs ── */}
        {loading ? <KpiSkeleton /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard
              label="Total de Estudantes"
              value={Number(ov?.totalStudents || 0).toLocaleString('pt-PT')}
              sub="registados na plataforma"
              color={COLORS.orange}
              icon={Users}
            />
            <KpiCard
              label="Inscrições Activas"
              value={Number(ov?.activeEnrollments || ov?.totalEnrollments || 0).toLocaleString('pt-PT')}
              sub={`ano ${new Date().getFullYear()}`}
              color={COLORS.primary}
              icon={GraduationCap}
            />
            <KpiCard
              label="Pagamentos Pendentes"
              value={Number(ov?.pendingPayments || 0).toLocaleString('pt-PT')}
              sub="requerem atenção"
              color={COLORS.danger}
              icon={Clock}
            />
            <KpiCard
              label="Total Arrecadado"
              value={formatCurrency(ov?.totalRevenue || 0)}
              sub="receita confirmada"
              color={COLORS.success}
              icon={CheckCircle}
            />
          </div>
        )}

        {/* ── SECÇÃO 2 — INSCRIÇÕES ── */}
        <div className="mb-8">
          <SectionTitle icon={TrendingUp} title="Inscrições" />
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton height="h-72" />
              <ChartSkeleton height="h-72" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Inscrições por mês */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm font-semibold text-[#0A3956] mb-4">Inscrições por Mês</p>
                {enrollMonthData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={enrollMonthData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.muted }} />
                      <YAxis tick={{ fontSize: 11, fill: COLORS.muted }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip suffix=" inscrições" />} />
                      <Bar dataKey="count" name="Inscrições" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Inscrições por universidade */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm font-semibold text-[#0A3956] mb-4">Universidades mais escolhidas</p>
                {uniData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={uniData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.muted }} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: COLORS.muted }} width={100} />
                      <Tooltip content={<CustomTooltip suffix=" inscrições" />} />
                      <Bar dataKey="count" name="Inscrições" fill={COLORS.orange} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>
          )}
        </div>

        {/* ── SECÇÃO 3 — FINANCEIRO ── */}
        <div className="mb-8">
          <SectionTitle icon={CheckCircle} title="Financeiro" />
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton height="h-72" />
              <ChartSkeleton height="h-72" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Receita por mês */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm font-semibold text-[#0A3956] mb-4">Receita por Mês (Kz)</p>
                {revenueMonthData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={revenueMonthData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.muted }} />
                      <YAxis tick={{ fontSize: 11, fill: COLORS.muted }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip suffix=" Kz" />} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Receita"
                        stroke={COLORS.success}
                        strokeWidth={2.5}
                        dot={{ fill: COLORS.success, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Distribuição de pagamentos */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm font-semibold text-[#0A3956] mb-4">Estado dos Pagamentos</p>
                {payStatusData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={payStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {payStatusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend
                        formatter={(value) => <span style={{ fontSize: 12, color: COLORS.muted }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>
          )}
        </div>

        {/* ── SECÇÃO 4 — DEVEDORES ── */}
        <div className="mb-8">
          <SectionTitle icon={AlertCircle} title="Estudantes com Dívida" />
          {loading ? (
            <ChartSkeleton height="h-48" />
          ) : data.topDebtors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-[#6C757D]">
              <CheckCircle size={32} className="mx-auto mb-2 text-[#28A745]" />
              <p className="font-medium">Sem dívidas em aberto</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#DEE2E6]">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">#</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Estudante</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Valor em Falta</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide hidden md:table-cell">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topDebtors.slice(0, 8).map((d, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors">
                      <td className="px-5 py-3 text-[#6C757D] font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-[#0A3956]">{d.fullName || d.name || '—'}</p>
                        <p className="text-xs text-[#6C757D]">{d.bi || ''}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-[#DC3545]">
                        {formatCurrency(d.remainingBalance || d.debt || 0)}
                      </td>
                      <td className="px-5 py-3 text-right text-[#6C757D] hidden md:table-cell">
                        {formatCurrency(d.finalAmount || d.total || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── SECÇÃO 5 — SIMULAÇÕES ── */}
        <div className="mb-8">
          <SectionTitle icon={BookOpen} title="Simulações e Exames" />
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton height="h-72" />
              <ChartSkeleton height="h-72" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Média de notas por exame */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm font-semibold text-[#0A3956] mb-4">Média de Notas por Exame (0–20)</p>
                {avgScoreData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={avgScoreData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: COLORS.muted }} />
                      <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: COLORS.muted }} />
                      <Tooltip content={<CustomTooltip suffix=" val." />} />
                      <Bar dataKey="media" name="Média" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Exames mais realizados */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm font-semibold text-[#0A3956] mb-4">Exames mais Realizados</p>
                {mostTakenData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={mostTakenData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.muted }} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: COLORS.muted }} width={120} />
                      <Tooltip content={<CustomTooltip suffix=" tentativas" />} />
                      <Bar dataKey="total" name="Tentativas" fill={COLORS.orange} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>
          )}
        </div>

        {/* ── SECÇÃO 6 — CURSOS ── */}
        {!loading && courseData.length > 0 && (
          <div className="mb-8">
            <SectionTitle icon={Award} title="Cursos mais escolhidos" />
            <div className="bg-white rounded-xl shadow-sm p-5">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={courseData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.muted }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: COLORS.muted }} width={140} />
                  <Tooltip content={<CustomTooltip suffix=" inscrições" />} />
                  <Bar dataKey="count" name="Inscrições" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Empty state para gráficos sem dados ──────────────────────────────────────
function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-[#6C757D]">
      <BarChart2 size={32} className="mb-2 opacity-30" />
      <p className="text-sm">Sem dados disponíveis</p>
    </div>
  );
}
