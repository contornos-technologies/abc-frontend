import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminNotificationsProvider } from '../../context/AdminNotificationsContext';
import { useAdminNotifications } from '../../context/AdminNotificationsContext';
import logoWhite from '../../assets/logo-white.svg';
import {
  LayoutDashboard, Users, CreditCard, Bell, FileText,
  BarChart3, LogOut, Menu, X, IdCard, MessageSquareQuote, Mail
} from 'lucide-react';

const IconDashboard     = () => <LayoutDashboard className="w-5 h-5" />;
const IconStudents      = () => <Users className="w-5 h-5" />;
const IconPayments      = () => <CreditCard className="w-5 h-5" />;
const IconCards         = () => <IdCard className="w-5 h-5" />;
const IconNotifications = () => <Bell className="w-5 h-5" />;
const IconExams         = () => <FileText className="w-5 h-5" />;
const IconAnalytics     = () => <BarChart3 className="w-5 h-5" />;
const IconTestimonials  = () => <MessageSquareQuote className="w-5 h-5" />;
const IconMessages      = () => <Mail className="w-5 h-5" />;
const IconLogout        = () => <LogOut className="w-5 h-5" />;
const IconMenu          = () => <Menu className="w-6 h-6" />;
const IconClose         = () => <X className="w-6 h-6" />;

const NAV_ITEMS = [
  { label: 'Dashboard',    to: '/admin',                  icon: <IconDashboard />,    end: true },
  { label: 'Estudantes',   to: '/admin/students',         icon: <IconStudents /> },
  { label: 'Pagamentos',   to: '/admin/payments',         icon: <IconPayments /> },
  { label: 'Cartões',      to: '/admin/cards',            icon: <IconCards /> },
  { label: 'Notificações', to: '/admin/notifications',    icon: <IconNotifications /> },
  { label: 'Provas',       to: '/admin/exams',            icon: <IconExams /> },
  { label: 'Testemunhos',  to: '/admin/testemunhos',      icon: <IconTestimonials /> },
  { label: 'Mensagens',    to: '/admin/contact-messages', icon: <IconMessages /> },
  { label: 'Analytics',    to: '/admin/analytics',        icon: <IconAnalytics /> },
];

function SidebarContent({ adminName, adminInitial, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pendingTestimonials, unreadMessages } = useAdminNotifications();

  function handleLogout() {
    logout();
    navigate('/portal/acesso', { replace: true });
  }

  return (
    <div className="flex flex-col h-full bg-[#0A3956]">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <img
          src={logoWhite}
          alt="ABC Centro Preparatório"
          className="h-10 w-auto"
        />
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white md:hidden transition-colors">
            <IconClose />
          </button>
        )}
      </div>

      {/* Admin info */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F69220] flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-bold text-sm">{adminInitial}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{adminName}</p>
            <p className="text-white/50 text-xs">Administrador</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#F69220] text-white shadow-md'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.label}
                {item.to === '/admin/testemunhos' && pendingTestimonials > 0 && (
                  <span className="ml-auto bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {pendingTestimonials}
                  </span>
                )}
                {item.to === '/admin/contact-messages' && unreadMessages > 0 && (
                  <span className="ml-auto bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150"
        >
          <IconLogout />
          Terminar Sessão
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const adminName    = user?.email?.split('@')[0] || 'Administrador';
  const adminInitial = adminName.charAt(0).toUpperCase();

  return (
    <AdminNotificationsProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">

        <aside className="hidden md:flex md:flex-shrink-0 w-60">
          <div className="flex flex-col w-full">
            <SidebarContent adminName={adminName} adminInitial={adminInitial} />
          </div>
        </aside>

        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 z-50 md:hidden shadow-2xl">
              <SidebarContent
                adminName={adminName}
                adminInitial={adminInitial}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </>
        )}

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="md:hidden relative flex items-center justify-between px-4 py-3 bg-[#0A3956] border-b border-white/10 shadow-md flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white hover:text-[#F69220] transition-colors z-10"
              aria-label="Abrir menu"
            >
              <IconMenu />
            </button>

            <img
              src={logoWhite}
              alt="ABC Centro Preparatório"
              className="h-8 w-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />

            <div className="w-6 h-6 rounded-full bg-[#F69220] flex items-center justify-center z-10">
              <span className="text-white font-bold text-xs">{adminInitial}</span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminNotificationsProvider>
  );
}