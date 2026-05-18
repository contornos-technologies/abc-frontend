import { useState, useEffect } from "react";
import { Menu, X, GraduationCap } from "lucide-react";

const NAV_LINKS = [
  { label: "Início",    href: "/" },
  { label: "Sobre",     href: "/sobre" },
  { label: "Serviços",  href: "/servicos" },
  { label: "Contacto",  href: "/contacto" },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [activePath, setActivePath] = useState("/");

  // ── efeito de scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── detecta página activa ─────────────────────────────────────────────────
  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  // ── fecha menu ao redimensionar para desktop ──────────────────────────────
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── cores dinâmicas baseadas no scroll ────────────────────────────────────
  const isScrolled = scrolled || menuOpen;

  // transparente: textos escuros (hero claro)
  // scroll: fundo azul #0A3956, textos brancos
  const textColor = isScrolled ? "text-white"       : "text-[#071C35]";
  const iconColor = isScrolled ? "#ffffff"           : "#071C35";

  return (
    <>
      {/* ── barra principal ───────────────────────────────────────────────── */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 h-20
          transition-all duration-300 ease-in-out
          ${isScrolled
            ? "bg-[#0A3956] shadow-lg"
            : "bg-transparent"}
        `}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

          {/* ── logo ──────────────────────────────────────────────────────── */}
          <a
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            {/* ícone quadrado */}
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isScrolled
                ? "bg-white/10 border border-white/20"
                : "bg-white border-2 border-[#0A3956]/20 shadow-sm"}
            `}>
              <GraduationCap size={24} color={isScrolled ? "#ffffff" : "#0A3956"} strokeWidth={2.2} />
            </div>

            {/* nome duas linhas */}
            <div>
              <p className={`text-[18px] font-extrabold leading-none transition-colors duration-300 ${textColor}`}>
                ABC
              </p>
              <p className={`text-[13px] mt-0.5 transition-colors duration-300 ${isScrolled ? "text-white/70" : "text-[#071C35]/60"}`}>
                Centro Preparatório
              </p>
            </div>
          </a>

          {/* ── links desktop ─────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = activePath === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`
                    text-sm font-semibold transition-all duration-200
                    ${isActive
                      ? "text-[#1565A8]"
                      : `${textColor} hover:text-[#1565A8]`
                    }
                    ${!isScrolled && isActive ? "text-[#1565A8]" : ""}
                    ${isScrolled && isActive  ? "text-white font-bold" : ""}
                  `}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* ── botões de acção + hamburger ───────────────────────────────── */}
          <div className="flex items-center gap-3">

            {/* Inscrição — link simples, só desktop */}
            <a
              href="/signup"
              className={`
                hidden sm:inline-flex text-sm font-medium
                transition-colors duration-300
                hover:text-[#F69220] ${textColor}
              `}
            >
              Inscrição
            </a>

            {/* Portal do Aluno — botão laranja, só desktop */}
            <a
              href="/login"
              className="
                hidden sm:inline-flex items-center gap-2
                bg-[#F69220] hover:bg-[#e0821a]
                text-white text-sm font-semibold
                px-5 py-2.5 rounded-2xl
                transition-all duration-200
                shadow-lg shadow-orange-200/50
                hover:shadow-xl hover:shadow-orange-200/60
              "
            >
              Portal do Aluno
            </a>

            {/* hamburger — só em mobile ─────────────────────────────────── */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`
                md:hidden p-2 rounded-lg transition-colors duration-200
                ${isScrolled ? "hover:bg-white/10" : "hover:bg-black/5"}
              `}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {menuOpen
                ? <X    size={22} color={iconColor} />
                : <Menu size={22} color={iconColor} />
              }
            </button>
          </div>
        </div>
      </header>

      {/* ── menu mobile ───────────────────────────────────────────────────── */}
      <div
        className={`
          fixed top-20 left-0 right-0 z-40
          bg-white shadow-lg border-t border-gray-100
          transition-all duration-300 ease-in-out
          md:hidden
          ${menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"}
        `}
      >
        <nav className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = activePath === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`
                  px-4 py-3 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${isActive
                    ? "text-[#1565A8] bg-blue-50 font-semibold"
                    : "text-[#071C35] hover:text-[#1565A8] hover:bg-blue-50"
                  }
                `}
              >
                {link.label}
              </a>
            );
          })}

          {/* botões no menu mobile */}
          <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2">

            {/* Inscrição — secundário */}
            <a
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="
                flex items-center justify-center
                border-2 border-[#0A3956]
                text-[#0A3956] text-sm font-semibold
                px-5 py-3 rounded-xl w-full
                transition-all duration-200
                hover:bg-gray-50
              "
            >
              Inscrição
            </a>

            {/* Portal do Aluno — principal */}
            <a
              href="/login"
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
            </a>
          </div>
        </nav>
      </div>

      {/* ── overlay escuro ao abrir menu mobile ───────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
