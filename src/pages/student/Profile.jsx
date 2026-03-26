import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, ClipboardList, CreditCard, LogOut,
  Shield, Target, DollarSign, Lock, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../services/authService';

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, handleLogout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Buscar dados reais do estudante ─────────────────────────
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await getMe();
        setStudent(data);
      } catch (err) {
        setError('Erro ao carregar os dados do perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, []);

  // ── Logout ───────────────────────────────────────────────────
  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  // ── Helpers de badges ────────────────────────────────────────
  const getScholarshipBadge = (type) => {
    const badges = {
      NONE:       { label: 'Sem Bolsa',  color: 'bg-[#6C757D]' },
      PARTIAL_50: { label: 'Bolsa 50%',  color: 'bg-blue-400' },
      PARTIAL_75: { label: 'Bolsa 75%',  color: 'bg-blue-600' },
      FULL:       { label: 'Bolsa 100%', color: 'bg-[#28A745]' },
    };
    return badges[type] || badges.NONE;
  };

  const getPaymentBadge = (status) => {
    const badges = {
      PAID:    { label: 'PAGO',     color: 'bg-[#28A745]' },
      PENDING: { label: 'PENDENTE', color: 'bg-[#FFC107] text-gray-800' },
      FAILED:  { label: 'FALHOU',   color: 'bg-[#DC3545]' },
    };
    return badges[status] || badges.PENDING;
  };

  // ── Calcular resumo financeiro ───────────────────────────────
  const getFinancialSummary = () => {
    if (!student?.targets?.length) return null;

    let totalOriginal = 0;
    let totalDiscount = 0;
    let totalPaid     = 0;

    student.targets.forEach((target) => {
      target.payments?.forEach((payment) => {
        totalOriginal += payment.originalAmount || 0;
        totalDiscount += payment.discountAmount || 0;
        if (payment.status === 'PAID') totalPaid += payment.finalAmount || 0;
      });
    });

    const totalToPay = totalOriginal - totalDiscount;
    const percentagePaid = totalToPay > 0
      ? Math.round((totalPaid / totalToPay) * 100)
      : 0;

    return { totalOriginal, totalDiscount, totalToPay, totalPaid, percentagePaid };
  };

  const financial = getFinancialSummary();

  // ── Iniciais do nome ─────────────────────────────────────────
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200"
          style={{ borderTopColor: '#F69220' }} />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="bg-red-50 border border-red-300 text-red-600 rounded-lg p-6 text-center">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#F69220] text-white rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const displayName  = student?.fullName || authUser?.email || 'Utilizador';
  const displayEmail = student?.user?.email || authUser?.email || '';

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-[#0A3956] transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full p-6">

          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-white text-2xl font-bold">ABC Platform</h1>
          </div>

          {/* User Info */}
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-[#F69220] flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
              {getInitials(displayName)}
            </div>
            <p className="text-white text-center font-semibold">{displayName}</p>
            <p className="text-gray-300 text-sm text-center">{displayEmail}</p>
          </div>

          {/* Divider */}
          <div className="h-[2px] bg-[#F69220] mb-6" />

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <Link to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F69220] text-white transition-all">
              <User size={20} />
              <span>Perfil</span>
            </Link>
            <Link to="/enrollment"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-[#F69220] transition-all">
              <ClipboardList size={20} />
              <span>Inscrição</span>
            </Link>
            <Link to="/payments"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-[#F69220] transition-all">
              <CreditCard size={20} />
              <span>Pagamentos</span>
            </Link>
          </nav>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-900/30 transition-all mt-auto w-full"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>

        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 lg:p-8">

        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden mb-6 p-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Menu size={24} className="text-[#0A3956]" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0A3956] mb-2">Meu Perfil</h1>
          <p className="text-[#6C757D]">Gerencie as suas informações pessoais</p>
        </div>

        <div className="space-y-6">

          {/* ── Card 1 — Informações Pessoais ── */}
          <div className="bg-white rounded-xl shadow-md border-t-[3px] border-[#F69220] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <User className="text-[#F69220]" size={24} />
                <h2 className="text-xl font-bold text-[#0A3956]">Informações Pessoais</h2>
              </div>
              <button className="px-4 py-2 border-2 border-[#F69220] text-[#F69220] rounded-lg hover:bg-[#F69220] hover:text-white transition-all font-semibold">
                Editar Perfil
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-[#6C757D] uppercase tracking-wide">Nome Completo</label>
                <p className="text-[#0A3956] font-bold mt-1">{student?.fullName || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-[#6C757D] uppercase tracking-wide">Email</label>
                <p className="text-[#0A3956] font-bold mt-1">{student?.user?.email || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-[#6C757D] uppercase tracking-wide">Telefone</label>
                <p className="text-[#0A3956] font-bold mt-1">{student?.phone || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-[#6C757D] uppercase tracking-wide">Bilhete de Identidade</label>
                <p className="text-[#0A3956] font-bold mt-1">{student?.bi || '—'}</p>
              </div>
            </div>
          </div>

          {/* ── Card 2 — Segurança ── */}
          <div className="bg-white rounded-xl shadow-md border-t-[3px] border-[#F69220] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="text-[#F69220]" size={24} />
                <h2 className="text-xl font-bold text-[#0A3956]">Segurança</h2>
              </div>
              <button className="px-4 py-2 border-2 border-[#F69220] text-[#F69220] rounded-lg hover:bg-[#F69220] hover:text-white transition-all font-semibold">
                Alterar Senha
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="text-[#6C757D]" size={20} />
              <div>
                <label className="text-xs text-[#6C757D] uppercase tracking-wide">Senha</label>
                <p className="text-[#0A3956] font-bold">••••••••</p>
              </div>
            </div>
          </div>

          {/* ── Card 3 — Meus Objectivos ── */}
          <div className="bg-white rounded-xl shadow-md border-t-[3px] border-[#F69220] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Target className="text-[#F69220]" size={24} />
                <h2 className="text-xl font-bold text-[#0A3956]">Meus Objectivos</h2>
              </div>
              <Link to="/enrollment"
                className="px-4 py-2 bg-[#F69220] text-white rounded-lg hover:bg-[#e58419] transition-all font-semibold">
                Nova Inscrição
              </Link>
            </div>

            {!student?.targets?.length ? (
              <p className="text-[#6C757D] text-center py-6">
                Ainda não tens inscrições.{' '}
                <Link to="/enrollment" className="text-[#F69220] font-semibold hover:underline">
                  Criar agora
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {student.targets.map((target) => {
                  const scholarship = getScholarshipBadge(target.scholarshipType);
                  const payment     = getPaymentBadge(target.paymentStatus);
                  return (
                    <div key={target.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">

                      {/* Badges de ano, bolsa e pagamento */}
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <span className="px-3 py-1 bg-[#F69220] text-white text-sm font-bold rounded">
                          {target.year}
                        </span>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 ${scholarship.color} text-white text-xs font-semibold rounded`}>
                            {scholarship.label}
                          </span>
                          <span className={`px-3 py-1 ${payment.color} text-xs font-semibold rounded`}>
                            {payment.label}
                          </span>
                        </div>
                      </div>

                      {/* Universidade */}
                      <h3 className="text-[#0A3956] font-bold text-lg mb-3">
                        {target.examConfig?.university?.name || '—'}
                      </h3>

                      {/* Faculdade e Curso com labels */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#6C757D] uppercase tracking-wide w-20 shrink-0">
                            Faculdade:
                          </span>
                          <span className="text-[#0A3956] text-sm font-semibold">
                            {target.examConfig?.faculty?.name || '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#6C757D] uppercase tracking-wide w-20 shrink-0">
                            Curso:
                          </span>
                          <span className="text-[#0A3956] text-sm font-semibold">
                            {target.examConfig?.course?.name || '—'}
                          </span>
                        </div>
                      </div>

                      {/* Disciplinas */}
                      {target.examConfig?.subjects?.length > 0 && (
                        <div>
                          <p className="text-xs text-[#6C757D] uppercase tracking-wide mb-2">
                            Disciplinas:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {target.examConfig.subjects.map((subject) => (
                              <span
                                key={subject.id}
                                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                style={{ backgroundColor: '#0A3956' }}
                              >
                                {subject.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Card 4 — Resumo Financeiro ── */}
          <div className="bg-white rounded-xl shadow-md border-t-[3px] border-[#F69220] p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="text-[#F69220]" size={24} />
              <h2 className="text-xl font-bold text-[#0A3956]">Resumo Financeiro</h2>
            </div>

            {!financial ? (
              <p className="text-[#6C757D] text-center py-4">
                Sem dados financeiros disponíveis.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <label className="text-xs text-[#6C757D] uppercase tracking-wide">Total Original</label>
                    <p className="text-[#6C757D] font-bold text-xl mt-1">
                      {financial.totalOriginal.toLocaleString('pt-AO')} Kz
                    </p>
                  </div>
                  <div className="text-center">
                    <label className="text-xs text-[#6C757D] uppercase tracking-wide">Desconto</label>
                    <p className="text-[#F69220] font-bold text-xl mt-1">
                      -{financial.totalDiscount.toLocaleString('pt-AO')} Kz
                    </p>
                  </div>
                  <div className="text-center">
                    <label className="text-xs text-[#6C757D] uppercase tracking-wide">Total a Pagar</label>
                    <p className="text-[#0A3956] font-bold text-2xl mt-1">
                      {financial.totalToPay.toLocaleString('pt-AO')} Kz
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#6C757D]">Progresso de Pagamento</span>
                    <span className="text-sm font-bold text-[#F69220]">
                      {financial.percentagePaid}% pago
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F69220] transition-all duration-500"
                      style={{ width: `${financial.percentagePaid}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            <Link to="/payments"
              className="block w-full px-4 py-3 bg-[#F69220] text-white rounded-lg hover:bg-[#e58419] transition-all font-semibold text-center mt-4">
              Ver Pagamentos
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
