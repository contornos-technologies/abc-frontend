const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

export function initGA() {
  if (!GA_ID || window.__gaInitialised) return

  // Injectar o script gtag.js no <head>
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  // Inicializar dataLayer e gtag — NUNCA usar spread operator (...args)
  // O GA4 interpreta arrays como eventos de Tag Manager e nunca os envia
  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }

  window.gtag('js', new Date())

  // send_page_view: false — o tracking de páginas é feito manualmente
  // pelo hook usePageTracking, via React Router
  window.gtag('config', GA_ID, { send_page_view: false })

  window.__gaInitialised = true
}

export function trackPageView(path, title) {
  if (!GA_ID || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.origin + path,
  })
}
