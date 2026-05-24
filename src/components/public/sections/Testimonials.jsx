// ============================================================================
// SECTION: TESTIMONIALS
// FILE: src/components/public/sections/Testimonials.jsx
// ============================================================================

import { useState, useRef, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../services/api";

// ── Gera as iniciais a partir do nome (ex: "Maria Fernandes" → "MF")
function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

// ── Cor de fundo do círculo baseada no nome (sempre consistente)
const AVATAR_COLORS = [
  "bg-[#1565A8]",
  "bg-[#0D4F8B]",
  "bg-[#1A7BC4]",
  "bg-[#0A3D6B]",
  "bg-[#2260A8]",
  "bg-[#0E5A8A]",
];

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const CARDS_PER_PAGE = 3;

export default function Testimonials() {
  // ── Estado da API
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ── Estado do carrossel desktop
  const [page, setPage] = useState(0);

  // ── Estado do carrossel mobile
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  // ── Fetch dos testemunhos aprovados
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const res = await api.get("/public/testimonials");
        const data = res.data?.data ?? res.data;
        const list = Array.isArray(data) ? data : [];

        // Ordena por createdAt descendente (mais recentes primeiro)
        // Se createdAt não existir, mantém a ordem original do backend
        const sorted = [...list].sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setTestimonials(sorted);
      } catch (err) {
        console.error("Erro ao carregar testemunhos:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // ── Lógica de paginação desktop
  const totalPages = Math.ceil(testimonials.length / CARDS_PER_PAGE);
  const hasMultiplePages = totalPages > 1;
  const visibleTestimonials = testimonials.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE
  );

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  // ── Card de testemunho (partilhado entre mobile e desktop)
  const TestimonialCard = ({ testimonial, className = "" }) => (
    <article
      className={`
        group
        relative
        bg-white
        rounded-[24px]
        border
        border-[#E7EDF5]
        p-6
        lg:p-7
        shadow-[0_4px_20px_rgba(0,0,0,0.03)]
        hover:-translate-y-1
        hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
        transition-all
        duration-300
        ${className}
      `}
    >
      {/* Aspas laranja */}
      <div className="absolute top-5 right-5">
        <Quote
          className="w-6 h-6 sm:w-7 sm:h-7 text-[#F7941D] opacity-90"
          strokeWidth={2.2}
        />
      </div>

      {/* Avatar com iniciais + nome + universidade */}
      <div className="flex items-center gap-4">
        <div
          className={`
            w-14 h-14
            rounded-full
            flex items-center justify-center
            flex-shrink-0
            text-white
            text-[17px]
            font-bold
            tracking-wide
            select-none
            ${getAvatarColor(testimonial.name)}
          `}
        >
          {getInitials(testimonial.name)}
        </div>

        <div>
          <h3 className="text-[16px] font-bold text-[#071C35]">
            {testimonial.name}
          </h3>
          <p className="text-[14px] text-slate-500">
            {testimonial.university}
          </p>
        </div>
      </div>

      {/* Texto do testemunho */}
      <p className="mt-6 text-[15px] leading-7 text-slate-600">
        "{testimonial.text}"
      </p>
    </article>
  );

  return (
    <section
      className="
        relative
        overflow-hidden
        w-full
        bg-[#F4F8FC]
        py-14
        sm:py-16
        lg:py-24
      "
    >
      {/* ───────────────── TEXTURA SUPERIOR ───────────────── */}
      <div
        className="
          hidden
          lg:block
          absolute
          -top-10
          -left-10
          w-[420px]
          h-[420px]
          opacity-[0.06]
          pointer-events-none
        "
      >
        <svg viewBox="0 0 500 500" fill="none" className="w-full h-full">
          <path d="M0 100C100 20 180 20 280 100C380 180 460 180 560 100" stroke="#1565A8" strokeWidth="2" />
          <path d="M0 170C100 90 180 90 280 170C380 250 460 250 560 170" stroke="#1565A8" strokeWidth="2" />
          <path d="M0 240C100 160 180 160 280 240C380 320 460 320 560 240" stroke="#1565A8" strokeWidth="2" />
          <path d="M0 310C100 230 180 230 280 310C380 390 460 390 560 310" stroke="#1565A8" strokeWidth="2" />
        </svg>
      </div>

      {/* ───────────────── TEXTURA INFERIOR ───────────────── */}
      <div
        className="
          hidden
          lg:block
          absolute
          -bottom-10
          -right-10
          w-[420px]
          h-[420px]
          opacity-[0.06]
          rotate-180
          pointer-events-none
        "
      >
        <svg viewBox="0 0 500 500" fill="none" className="w-full h-full">
          <path d="M0 100C100 20 180 20 280 100C380 180 460 180 560 100" stroke="#1565A8" strokeWidth="2" />
          <path d="M0 170C100 90 180 90 280 170C380 250 460 250 560 170" stroke="#1565A8" strokeWidth="2" />
          <path d="M0 240C100 160 180 160 280 240C380 320 460 320 560 240" stroke="#1565A8" strokeWidth="2" />
          <path d="M0 310C100 230 180 230 280 310C380 390 460 390 560 310" stroke="#1565A8" strokeWidth="2" />
        </svg>
      </div>

      {/* ───────────────── CONTAINER ───────────────── */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center mx-auto">
          <h2
            className="
              text-[28px]
              sm:text-[46px]
              lg:text-[56px]
              leading-[1.1]
              font-extrabold
              text-[#071C35]
              xl:whitespace-nowrap
            "
          >
            O que os nossos{" "}
            <span className="text-[#1565A8]">estudantes dizem</span>
          </h2>

          <p
            className="
              mt-5
              sm:mt-6
              text-[16px]
              sm:text-[18px]
              leading-7
              sm:leading-8
              text-slate-500
              max-w-2xl
              mx-auto
            "
          >
            Histórias reais de estudantes que conquistaram a sua vaga
            universitária com a preparação da ABC.
          </p>
        </div>

        {/* ───────────────── LOADING ───────────────── */}
        {loading && (
          <div className="mt-14 flex justify-center items-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#1565A8] border-t-transparent animate-spin" />
          </div>
        )}

        {/* ───────────────── ERRO ───────────────── */}
        {!loading && error && (
          <p className="mt-14 text-center text-slate-400 text-[15px]">
            Não foi possível carregar os testemunhos.
          </p>
        )}

        {/* ───────────────── CONTEÚDO ───────────────── */}
        {!loading && !error && testimonials.length > 0 && (
          <>
            {/* ── MOBILE + TABLET CAROUSEL ── */}
            <div
              ref={carouselRef}
              onScroll={() => {
                const el = carouselRef.current;
                if (!el) return;
                const index = Math.round(el.scrollLeft / el.clientWidth);
                setCurrentIndex(index);
              }}
              className="
                mt-10
                flex
                gap-5
                overflow-x-auto
                snap-x
                snap-mandatory
                scroll-smooth
                pb-2
                lg:hidden
                [-ms-overflow-style:none]
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={testimonial.id ?? index}
                  testimonial={testimonial}
                  className="min-w-[88%] snap-center h-full"
                />
              ))}
            </div>

            {/* ── DOTS (mobile + tablet) ── */}
            <div className="flex lg:hidden justify-center gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const el = carouselRef.current;
                    if (!el) return;
                    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
                  }}
                  className={`
                    transition-all duration-300 rounded-full
                    ${currentIndex === index ? "w-5 h-2.5 bg-[#1565A8]" : "w-2.5 h-2.5 bg-slate-300"}
                  `}
                />
              ))}
            </div>

            {/* ── DESKTOP GRID + PREV/NEXT ── */}
            <div className="hidden lg:block mt-10 sm:mt-14 lg:mt-16">

              {/* Grid de 3 cards */}
              <div className="grid lg:grid-cols-3 gap-5 sm:gap-6">
                {visibleTestimonials.map((testimonial, index) => (
                  <TestimonialCard
                    key={testimonial.id ?? index}
                    testimonial={testimonial}
                    className="h-full"
                  />
                ))}
              </div>

              {/* Botões prev/next — só aparecem quando há mais de 3 testemunhos */}
              {hasMultiplePages && (
                <div className="flex items-center justify-center gap-4 mt-10">

                  {/* Prev */}
                  <button
                    onClick={handlePrev}
                    disabled={page === 0}
                    className={`
                      w-11 h-11
                      rounded-full
                      border
                      flex items-center justify-center
                      transition-all duration-300
                      ${page === 0
                        ? "border-[#E7EDF5] text-slate-300 cursor-not-allowed"
                        : "border-[#1565A8] text-[#1565A8] hover:bg-[#1565A8] hover:text-white"
                      }
                    `}
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                  </button>

                  {/* Next */}
                  <button
                    onClick={handleNext}
                    disabled={page === totalPages - 1}
                    className={`
                      w-11 h-11
                      rounded-full
                      border
                      flex items-center justify-center
                      transition-all duration-300
                      ${page === totalPages - 1
                        ? "border-[#E7EDF5] text-slate-300 cursor-not-allowed"
                        : "border-[#1565A8] text-[#1565A8] hover:bg-[#1565A8] hover:text-white"
                      }
                    `}
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={2} />
                  </button>

                </div>
              )}

            </div>
          </>
        )}

        {/* ───────────────── SEM TESTEMUNHOS ───────────────── */}
        {!loading && !error && testimonials.length === 0 && (
          <p className="mt-14 text-center text-slate-400 text-[15px]">
            Ainda não existem testemunhos disponíveis.
          </p>
        )}

      </div>
    </section>
  );
}
