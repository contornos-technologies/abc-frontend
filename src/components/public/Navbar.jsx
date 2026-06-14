import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import logoDark from '../../assets/logo-dark.svg'
import logoWhite from '../../assets/logo-white.svg'

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Sobre', to: '/about' },
  { label: 'Contacto', to: '/contact' },
  { label: 'Simulações', to: '/simulations' },
]

export default function Navbar({
  darkHero = false,
  showBorder = false,
  solidWhite = false,
}) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePath, setActivePath] = useState('/')

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

  const isScrolled = scrolled || menuOpen

  const textColor = solidWhite
    ? 'text-[#071C35]'
    : isScrolled
      ? 'text-white'
      : darkHero
        ? 'text-white'
        : 'text-[#071C35]'

  return (
    <>
      <header
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
            <img
              src={
                solidWhite
                  ? logoDark
                  : isScrolled || darkHero
                    ? logoWhite
                    : logoDark
              }
              alt="ABC Centro Preparatório"
              className="h-12 w-auto"
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
              Inscrição
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

            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`
                md:hidden p-2 rounded-lg
                transition-colors duration-200
                ${isScrolled || darkHero ? 'hover:bg-white/10' : 'hover:bg-black/5'}
              `}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {menuOpen ? (
                <X
                  size={22}
                  color={isScrolled || darkHero ? '#ffffff' : '#071C35'}
                />
              ) : (
                <Menu
                  size={22}
                  color={isScrolled || darkHero ? '#ffffff' : '#071C35'}
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* menu mobile */}
      <div
        className={`
          fixed top-20 left-0 right-0 z-40
          bg-white shadow-lg border-t border-gray-100
          transition-all duration-300 ease-in-out
          md:hidden
          ${
            menuOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }
        `}
      >
        <nav className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col gap-1">
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

          <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="
                flex items-center justify-center
                border-2 border-[#0A3956]
                text-[#0A3956]
                text-sm font-semibold
                px-5 py-3 rounded-xl w-full
                transition-all duration-200
                hover:bg-gray-50
              "
            >
              Inscrição
            </Link>

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="
                flex items-center justify-center
                bg-[#F69220] hover:bg-[#e0821a]
                text-white text-sm font-semibold
                px-5 py-3 rounded-xl w-full
                transition-all duration-200
              "
            >
              Portal do Aluno
            </Link>
          </div>
        </nav>
      </div>

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
