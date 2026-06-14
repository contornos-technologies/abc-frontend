//Student Profile Sidebar

import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  ClipboardList,
  CreditCard,
  Lock,
  LogOut,
  Menu,
  X,
  PenLine,
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
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0A3956] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <img
          src={logoWhite}
          alt="ABC Centro Preparatório"
          className="h-8 w-auto absolute left-1/2 -translate-x-1/2"
        />
        <div className="w-7 h-7 rounded-full bg-[#F69220] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">{initials}</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#0A3956] text-white flex flex-col transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <img
            src={logoWhite}
            alt="ABC Centro Preparatório"
            className="h-10 w-auto"
          />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Avatar */}
        <div className="p-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-full bg-[#F69220] flex items-center justify-center text-white mb-3 font-bold text-lg">
            {initials}
          </div>
          <div className="font-semibold text-sm truncate">
            {user?.fullName || 'Estudante'}
          </div>
          <div className="text-xs text-white/60 mt-0.5 truncate">
            {user?.email || ''}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all text-left ${
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

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-white/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-2">
        <div className="flex justify-around">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-[#F69220]' : 'text-[#6B7280]'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="lg:ml-60 pt-16 lg:pt-0 pb-24 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
