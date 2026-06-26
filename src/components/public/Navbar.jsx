import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, User, UserCircle2, LogOut } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import logoDark from '../../assets/logo-dark.svg'
import logoWhite from '../../assets/logo-white.svg'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Sobre', to: '/about' },
  { label: 'Contacto', to: '/contact' },
  { label: 'Simulações', to: '/simulations' },
]

// Devolve null (em vez de '?') quando ainda não há nome — assim o avatar
// mostra um ícone genérico de pessoa em vez de um ponto de interrogação.
function getInitials(name) {
  if (!name) return null
  const parts = name.trim().split(' ')
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}

export default function Navbar({
  darkHero = false,
  showBorder = false,
  solidWhite = false,
}) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [activePath, setActivePath] = useState('/')
  // ⚠️ Correcção: o AuthContext exporta a chave `user`, mas o valor dela já
  // é o objecto fundido com fullName/email (ver `value={{ user: user, ... }}`
  // no AuthContext.jsx). Não existe uma chave separada `user` no contexto.
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const accountMenuRef = useRef(null)

  // Respeita a preferência do sistema operativo do utilizador
  const shouldReduceMotion = useReducedMotion()

  // Só anima na primeira página da sessão
  const hasAnimated = sessionStorage.getItem('navbar-animated')
  useEffect(() => {
    sessionStorage.setItem('navbar-animated', 'true')
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setActivePath(window.location.pathname)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Fecha o dropdown da conta ao clicar fora ou ao premir Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target)
      ) {
        setAccountMenuOpen(false)
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setAccountMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleLogout() {
    setAccountMenuOpen(false)
    logout()
    navigate('/')
  }

  const isScrolled = scrolled || menuOpen

  const textColor = solidWhite
    ? 'text-[#071C35]'
    : isScrolled
      ? 'text-white'
      : darkHero
        ? 'text-white'
        : 'text-[#071C35]'

  // Animação de entrada — desativada se já animou nesta sessão ou se o utilizador preferir menos movimento
  const skipAnimation = hasAnimated || shouldReduceMotion
  const navVariants = {
    hidden: { opacity: skipAnimation ? 1 : 0, y: skipAnimation ? 0 : -16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: skipAnimation ? 0 : 0.4, ease: 'easeOut' },
    },
  }

  return (
    <>
      <motion.header
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className={`
          fixed top-0 left-0 right-0 z-50 h-20
          transition-all duration-300 ease-in-out
        ${
          solidWhite
            ? 'bg-white border-b border-gray-200'
            : isScrolled
              ? 'bg-[#0A3956]/95 backdrop-blur-md'
              : `bg-transparent ${showBorder ? 'border-b border-gray-200 md:border-none' : ''}`
        }
        `}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* logo */}
          <Link
            to="/"
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            {/* Logo mobile — branco sobre Hero transparente, dark só quando a página é solidWhite */}
            <img
              src={solidWhite || !isScrolled ? logoDark : logoWhite}
              alt="ABC Centro Preparatório"
              className="h-10 w-auto md:hidden"
            />

            {/* Logo tablet/desktop — mantém o comportamento original */}
            <img
              src={
                solidWhite
                  ? logoDark
                  : isScrolled || darkHero
                    ? logoWhite
                    : logoDark
              }
              alt="ABC Centro Preparatório"
              className="h-12 w-auto hidden md:block"
            />
          </Link>

          {/* links desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = activePath === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    text-sm font-semibold
                    transition-all duration-200
                   ${
                     solidWhite
                       ? isActive
                         ? 'text-[#1565A8] font-bold'
                         : 'text-[#071C35] hover:text-[#1565A8]'
                       : isScrolled
                         ? isActive
                           ? 'text-white font-bold'
                           : 'text-white hover:text-[#F69220]'
                         : darkHero
                           ? isActive
                             ? 'text-white font-bold'
                             : 'text-white/90 hover:text-[#F69220]'
                           : isActive
                             ? 'text-[#1565A8]'
                             : 'text-[#071C35] hover:text-[#1565A8]'
                   }
                  `}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* acções + hamburger */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  aria-haspopup="true"
                  aria-expanded={accountMenuOpen}
                  aria-label="Menu da conta"
                  className="flex items-center gap-1.5 group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F69220] focus-visible:ring-offset-2"
                >
                  <div className="w-9 h-9 rounded-full bg-[#F69220] group-hover:bg-[#e0821a] flex items-center justify-center text-white text-sm font-bold shrink-0 transition-colors duration-200">
                    {getInitials(user.fullName) || <UserCircle2 size={20} />}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`hidden sm:block transition-transform duration-200 ${textColor} ${accountMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {accountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-3 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-[#071C35] truncate">
                        {user.fullName || 'Minha conta'}
                      </p>
                      {user.email && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <Link
                      to="/student/profile"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#071C35] hover:bg-blue-50 hover:text-[#1565A8] transition-colors duration-150"
                    >
                      <User size={16} />
                      Meu Perfil
                    </Link>

                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-[#DC3545] hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut size={16} />
                      Terminar Sessão
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/signup"
                  className={`
                    hidden sm:inline-flex
                    text-sm font-medium
                    transition-colors duration-300
                    hover:text-[#F69220]
                    ${textColor}
                  `}
                >
                  Inscreva-se
                </Link>

                <Link
                  to="/login"
                  className="
                    hidden sm:inline-flex items-center gap-2
                    bg-[#F69220] hover:bg-[#e0821a]
                    text-white text-sm font-semibold
                    px-5 py-2.5 rounded-2xl
                    transition-all duration-200
                  "
                >
                  Portal do Aluno
                </Link>
              </>
            )}

            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`
    md:hidden p-2.5 rounded-lg
    transition-colors duration-200
    ${!solidWhite && (isScrolled || darkHero) ? 'hover:bg-white/10' : 'hover:bg-black/5'}
  `}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {menuOpen ? (
                <X
                  size={24}
                  color={
                    !solidWhite && (isScrolled || darkHero)
                      ? '#ffffff'
                      : '#071C35'
                  }
                />
              ) : (
                <Menu
                  size={24}
                  color={
                    !solidWhite && (isScrolled || darkHero)
                      ? '#ffffff'
                      : '#071C35'
                  }
                />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* menu mobile */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={
          menuOpen
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: shouldReduceMotion ? 0 : -8 }
        }
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
        className={`
    fixed top-20 left-0 right-0 bottom-0 z-40
    bg-white
    md:hidden
    ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}
  `}
      >
        <nav className="h-full max-w-[1200px] mx-auto px-4 pt-16 pb-6 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = activePath === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`
                  px-4 py-3 rounded-lg
                  text-sm font-medium
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'text-[#1565A8] bg-blue-50 font-semibold'
                      : 'text-[#071C35] hover:text-[#1565A8] hover:bg-blue-50'
                  }
                `}
              >
                {link.label}
              </Link>
            )
          })}

          {/* Quando logado: as ações de conta já estão no dropdown do avatar (cabeçalho)
              e o CTA de Simulações já está visível antes de abrir o menu (ex: na Hero) —
              por isso não repetimos nenhum botão aqui, só os links de navegação acima. */}
          {!user && (
            <div className="pt-3 mt-auto border-t border-gray-100 flex flex-col gap-2 pb-6">
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2
                  bg-[#F7941D] hover:bg-[#ea860f] text-white font-bold
                  w-full px-6 py-3.5 text-base rounded-xl
                  shadow-lg shadow-black/20 transition-all duration-300 active:scale-[0.98]"
              >
                Inscreva-se
              </Link>

              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="
                  flex items-center justify-center
                  border border-[#0A3956]/30
                  text-[#0A3956] text-sm font-semibold
                  px-5 py-3 rounded-xl w-full
                  hover:bg-gray-50
                  transition-all duration-200
                "
              >
                Portal do Aluno
              </Link>
            </div>
          )}
        </nav>
      </motion.div>

      {/* overlay mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}
