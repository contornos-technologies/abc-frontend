import { MapPin, Phone, Mail, MessageCircle, Facebook } from 'lucide-react'
import { Link } from 'react-router-dom'
import logoWhite from '../../assets/logo-white.svg'

const NAV_LINKS = [
  { label: 'Início', to: '/', scrollTo: 'top' },
  { label: 'Sobre', to: '/about', scrollTo: 'top' },
  { label: 'Contacto', to: '/contact', scrollTo: 'top' },
  { label: 'Simulações', to: '/simulations', scrollTo: 'top' },
]

const DISCIPLINES = [
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'Língua Portuguesa',
  'História Universal',
  'História Económica e Social de Angola',
  'Inglês',
  'Desenho Técnico',
]

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', icon: Facebook },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/244900000000',
    icon: MessageCircle,
  },
]

const CONTACT_INFO = [
  { icon: MapPin, text: 'Huambo, Angola' },
  { icon: Phone, text: '+244 930 469 087', href: 'tel:+244930469087' },
  {
    icon: Mail,
    text: 'info@abchuambo.com',
    href: 'mailto:info@abchuambo.com',
  },
  { icon: MessageCircle, text: 'WhatsApp', href: 'https://wa.me/244942082678' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  const handleNavClick = (scrollTo) => {
    if (scrollTo === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDisciplineClick = () => {
    const section = document.getElementById('cursos')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-[#0A3956] text-white">
      {/* ── corpo principal ─────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* ── coluna 1 — identidade ──────────────────────────────────── */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center hover:opacity-80 transition-opacity duration-200"
            >
              <img
                src={logoWhite}
                alt="ABC Centro Preparatório"
                className="h-12 w-auto"
              />
            </Link>

            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              Preparação intensiva e resultados comprovados para conquistar a
              sua vaga no ensino superior.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="
                      w-9 h-9 rounded-lg
                      bg-white/10 hover:bg-[#FFB347]
                      flex items-center justify-center
                      transition-all duration-200
                    "
                  >
                    <Icon size={16} strokeWidth={2} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* ── coluna 2 — navegação ───────────────────────────────────── */}
          <div>
            <h3 className="text-[#FFB347] text-sm font-semibold uppercase tracking-widest mb-5">
              Navegação
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => handleNavClick(link.scrollTo)}
                    className="text-sm text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  className="text-sm text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                >
                  Portal do Aluno
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                >
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          {/* ── coluna 3 — disciplinas ─────────────────────────────────── */}
          <div>
            <h3 className="text-[#FFB347] text-sm font-semibold uppercase tracking-widest mb-5">
              Disciplinas
            </h3>
            <ul className="space-y-3">
              {DISCIPLINES.map((disc) => (
                <li key={disc}>
                  <Link
                    to="/"
                    onClick={handleDisciplineClick}
                    className="text-sm text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {disc}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── coluna 4 — contacto ────────────────────────────────────── */}
          <div>
            <h3 className="text-[#FFB347] text-sm font-semibold uppercase tracking-widest mb-5">
              Contacto
            </h3>
            <ul className="space-y-4">
              {CONTACT_INFO.map((item, index) => {
                const Icon = item.icon

                const content = (
                  <div className="flex items-start gap-3">
                    <Icon
                      size={16}
                      strokeWidth={2}
                      className="text-[#FFB347] mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-white/70 hover:text-white transition-colors duration-200">
                      {item.text}
                    </span>
                  </div>
                )

                return (
                  <li key={index}>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={
                          item.href.startsWith('http') ? '_blank' : undefined
                        }
                        rel={
                          item.href.startsWith('http')
                            ? 'noopener noreferrer'
                            : undefined
                        }
                        className="block"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* ── linha divisória ─────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/70">
              © {year} ABC — Academia Berço do Conhecimento. Todos os direitos
              reservados.
            </p>

            <div className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="text-xs text-white/70 hover:text-white/80 transition-colors duration-200"
              >
                Política de Privacidade
              </Link>
              <Link
                to="/terms"
                className="text-xs text-white/70 hover:text-white/80 transition-colors duration-200"
              >
                Termos de Uso
              </Link>
            </div>
          </div>

          <div className="mt-4 flex justify-center sm:justify-end">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="contornos-credit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                className="contornos-credit-label"
                style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}
              >
                Desenvolvido por
              </span>
              <span
                className="contornos-credit-brand"
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#B388C9',
                  letterSpacing: '-0.02em',
                }}
              >
                CONTORNOS{' '}
                <span
                  className="contornos-credit-designs"
                  style={{ fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}
                >
                  Designs
                </span>
              </span>
            </a>
          </div>

          <style>{`
            .contornos-credit:hover .contornos-credit-label,
            .contornos-credit:hover .contornos-credit-brand,
            .contornos-credit:hover .contornos-credit-designs {
              color: #ffffff !important;
              text-decoration: underline;
            }
          `}</style>
        </div>
      </div>
    </footer>
  )
}
