import { Link, NavLink } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'


/**
 * Shell partilhado pelas páginas legais (Privacidade e Termos).
 * Estilo migrado directamente do protótipo estático (abc-static):
 * azul #1565A8, navy #071C35, laranja #F7941D, fonte Inter.
 *
 * ⚠️ Requer a fonte Inter carregada globalmente — adicionar ao
 * <head> do index.html na raiz do projecto (uma única vez, não por página):
 *
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
 */
export default function LegalLayout({ title, lastUpdated, intro, sections }) {
  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold no-underline transition-colors ${
      isActive ? 'text-[#1565A8]' : 'text-[#5F6D7E] hover:text-[#1565A8]'
    }`

  return (
    <div
      className="min-h-screen bg-[#F4F8FC] text-[#071C35]"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Cabeçalho */}
      <Navbar />

      {/* Conteúdo */}
      <main className="max-w-[760px] mx-auto px-6 pt-26 pb-20">
        <h1 className="text-[32px] font-extrabold text-[#071C35] m-0 mb-2 tracking-tight">
          {title}
        </h1>
        <p className="text-[#5F6D7E] text-[15px] m-0 mb-10">{intro}</p>

        <span className="inline-flex items-center bg-white border border-[#E7EDF5] text-[#5F6D7E] rounded-full px-3.5 py-1.5 text-xs font-semibold mb-7">
          Última actualização: {lastUpdated}
        </span>

        {sections.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className={`border-t border-[#E7EDF5] py-8 scroll-mt-20 ${
              i === sections.length - 1 ? 'border-b mb-10' : ''
            }`}
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#F7941D] tracking-widest uppercase mb-2.5">
              {String(i + 1).padStart(2, '0')} · {s.eyebrow}
            </span>
            <h2 className="text-[19px] font-bold text-[#071C35] m-0 mb-3">
              {s.title}
            </h2>
            <div className="text-[14.5px] text-[#071C35] leading-relaxed space-y-2 [&_a]:text-[#1565A8] [&_a]:underline [&_ul]:pl-[22px] [&_ul]:mt-2 [&_li]:mb-1.5">
              {s.node}
            </div>
          </section>
        ))}
      </main>

      {/* Rodapé */}
      <Footer />
    </div>
  )
}
