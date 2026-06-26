//Student Profile Sidebar

import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  ClipboardList,
  CreditCard,
  Lock,
  LogOut,
  Menu,
  X,
  PenLine,
  Home,
} from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import logoWhite from '../../assets/logo-white.svg'

const menuItems = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'inscricao', label: 'Inscrição', icon: ClipboardList },
  { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { id: 'simulacoes', label: 'Simulações', icon: PenLine },
  { id: 'seguranca', label: 'Segurança', icon: Lock },
]

export default function StudentLayout({ children, activeTab, onTabChange }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ST'

  function handleTabChange(tab) {
    onTabChange(tab)
    setIsMobileMenuOpen(false)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans">
      {/* Scrollbar fino e discreto para a navegação da sidebar — evita a
          barra de scroll nativa (grossa, com setas) em ecrãs mais baixos */}
      <style>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }
      `}</style>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A3956] text-white px-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 -ml-1"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition-opacity"
        >
          <img
            src={logoWhite}
            alt="ABC Centro Preparatório"
            className="h-8 w-auto"
          />
        </Link>
        <div className="w-9 h-9 rounded-full bg-[#F69220] flex items-center justify-center flex-shrink-0 mr-1">
          <span className="text-white font-bold text-sm">{initials}</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 right-0 z-40 bg-[#0A3956] text-white flex flex-col transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:top-0 lg:right-auto lg:w-60 lg:translate-x-0`}
      >
        {/* Logo — só no desktop. No mobile o logo já aparece na barra fixa do topo */}
        <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-white/10">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img
              src={logoWhite}
              alt="ABC Centro Preparatório"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Avatar */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#F69220] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">
              {user?.fullName || 'Estudante'}
            </div>
            <div className="text-xs text-white/60 truncate">
              {user?.email || ''}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-6 pb-3 overflow-y-auto sidebar-scroll">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-all text-left ${
                  isActive
                    ? 'bg-[#F69220] text-white'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Voltar ao site + Logout */}
        <div className="px-3 py-3 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Home size={20} />
            <span className="text-sm font-medium">Voltar ao site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-300 hover:bg-white/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="lg:ml-60 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
