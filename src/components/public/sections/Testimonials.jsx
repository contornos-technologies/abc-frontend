import { useState, useRef, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../services/api";

function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

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
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const res = await api.get("/public/testimonials");
        const data = res.data?.data ?? res.data;
        const list = Array.isArray(data) ? data : [];
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

  const totalPages = Math.ceil(testimonials.length / CARDS_PER_PAGE);
  const hasMultiplePages = totalPages > 1;
  const visibleTestimonials = testimonials.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE
  );

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  const TestimonialCard = ({ testimonial, className = "" }) => (
    <article
      className={`
        group relative bg-white rounded-[16px] border border-[#E7EDF5]
        p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]
        hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
        transition-all duration-300
        ${className}
      `}
    >
      {/* Aspas laranja */}
      <div className="absolute top-5 right-5">
        <Quote className="w-6 h-6 text-[#F7941D] opacity-90" strokeWidth={2.2} />
      </div>

      {/* Avatar + nome + universidade */}
      <div className="flex items-center gap-4">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            flex-shrink-0 text-white text-[15px] font-bold tracking-wide select-none
            ${getAvatarColor(testimonial.name)}
          `}
        >
          {getInitials(testimonial.name)}
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-[#071C35]">
            {testimonial.name}
          </h3>
          <p className="text-[13px] text-slate-500">
            {testimonial.university}
          </p>
        </div>
      </div>

      {/* Texto */}
      <p className="mt-5 text-[14px] sm:text-[15px] leading-7 text-slate-600">
        "{testimonial.text}"
      </p>
    </article>
  );

  return (
    <section className="w-full bg-[#F4F8FC] pt-10 pb-12 lg:pt-20 lg:pb-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ───────────────── HEADER ───────────────── */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-[24px] sm:text-[36px] lg:text-[42px] leading-[1.15] font-extrabold text-[#071C35]">
            O que os nossos{" "}
            <span className="text-[#1565A8]">estudantes dizem</span>
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] leading-7 text-slate-500 max-w-2xl mx-auto">
            Histórias reais de estudantes que conquistaram a sua vaga
            universitária com a preparação da ABC.
          </p>
        </div>

        {/* ───────────────── LOADING ───────────────── */}
        {loading && (
          <div className="mt-12 flex justify-center items-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#1565A8] border-t-transparent animate-spin" />
          </div>
        )}

        {/* ───────────────── ERRO ───────────────── */}
        {!loading && error && (
          <p className="mt-12 text-center text-slate-400 text-[15px]">
            Não foi possível carregar os testemunhos.
          </p>
        )}

        {/* ───────────────── CONTEÚDO ───────────────── */}
        {!loading && !error && testimonials.length > 0 && (
          <>
            {/* ── MOBILE CAROUSEL ── */}
            <div
              ref={carouselRef}
              onScroll={() => {
                const el = carouselRef.current;
                if (!el) return;
                const index = Math.round(el.scrollLeft / el.clientWidth);
                setCurrentIndex(index);
              }}
              className="
                mt-8 flex gap-5 overflow-x-auto snap-x snap-mandatory
                scroll-smooth pb-2 lg:hidden
                [-ms-overflow-style:none] [scrollbar-width:none]
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

            {/* ── DOTS mobile ── */}
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

            {/* ── DESKTOP GRID ── */}
            <div className="hidden lg:block mt-12">
              <div className="grid lg:grid-cols-3 gap-5">
                {visibleTestimonials.map((testimonial, index) => (
                  <TestimonialCard
                    key={testimonial.id ?? index}
                    testimonial={testimonial}
                    className="h-full"
                  />
                ))}
              </div>

              {/* Prev/Next */}
              {hasMultiplePages && (
                <div className="flex items-center justify-center gap-4 mt-10">
                  <button
                    onClick={handlePrev}
                    disabled={page === 0}
                    className={`
                      w-11 h-11 rounded-full border flex items-center justify-center
                      transition-all duration-300
                      ${page === 0
                        ? "border-[#E7EDF5] text-slate-300 cursor-not-allowed"
                        : "border-[#1565A8] text-[#1565A8] hover:bg-[#1565A8] hover:text-white"
                      }
                    `}
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={page === totalPages - 1}
                    className={`
                      w-11 h-11 rounded-full border flex items-center justify-center
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
          <p className="mt-12 text-center text-slate-400 text-[15px]">
            Ainda não existem testemunhos disponíveis.
          </p>
        )}

      </div>
    </section>
  );
}