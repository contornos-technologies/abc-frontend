import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../lib/analytics'

// Mapa de path exacto → título. Para paths dinâmicos (ex: /simulation/:id),
// usar a lógica de prefixo abaixo em vez de listar cada id aqui.
const PAGE_TITLES = {
  '/': 'Início',
  '/about': 'Sobre Nós',
  '/contact': 'Contacto',
  '/privacy': 'Privacidade',
  '/terms': 'Termos e Condições',
  '/login': 'Login',
  '/signup': 'Inscrição',
  '/portal/acesso': 'Acesso Administrativo',
  '/verify-email': 'Verificar Email',
  '/simulations': 'Simulações',
  '/student/profile': 'Meu Perfil',
  '/student/enrollment/new': 'Nova Inscrição',
  '/student/enrollment/success': 'Inscrição Concluída',
}

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]

  // Paths dinâmicos por prefixo
  if (pathname.startsWith('/simulation/') && pathname.endsWith('/exam'))
    return 'Prova em Curso'
  if (pathname.startsWith('/simulation/') && pathname.endsWith('/results'))
    return 'Resultados'
  if (pathname.startsWith('/simulation/')) return 'Detalhe da Simulação'
  if (pathname.startsWith('/admin')) return 'Painel Admin'

  return 'ABC Huambo'
}

export function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    const title = `${getPageTitle(location.pathname)} | ABC Huambo`
    document.title = title
    trackPageView(location.pathname + location.search, title)
  }, [location])
}
