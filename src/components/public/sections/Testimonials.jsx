import { useState, useRef, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight, Send, CheckCircle } from "lucide-react";
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

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", university: "", text: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(false);

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

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim() || !formData.university.trim() || !formData.text.trim()) return;
    try {
      setFormLoading(true);
      setFormError(false);
      await api.post("/public/contact", {
        name: formData.name,
        email: "testemunho@abc.ao",
        subject: `Testemunho de ${formData.name} — ${formData.university}`,
        message: formData.text,
      });
      setFormSuccess(true);
      setFormData({ name: "", university: "", text: "" });
    } catch (err) {
      console.error("Erro ao enviar testemunho:", err);
      setFormError(true);
    } finally {
      setFormLoading(false);
    }
  };

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
      <div className="absolute top-5 right-5">
        <Quote className="w-6 h-6 text-[#F7941D] opacity-90" strokeWidth={2.2} />
      </div>

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

        {/* ───────────────── CTA — DEIXAR TESTEMUNHO ───────────────── */}
        <div className="text-center mt-10 lg:mt-14">

          {!formOpen && !formSuccess && (
            <>
              <button
                onClick={() => setFormOpen(true)}
                className="inline-flex items-center justify-center px-8 sm:px-10 py-4 bg-[#F69220] hover:bg-[#e0821a] text-white text-[16px] font-bold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(246,146,32,0.18)]"
              >
                Deixar o meu testemunho
              </button>
              <p className="text-[14px] text-slate-500 mt-4">
                Partilha a tua experiência e inspira outros estudantes
              </p>
            </>
          )}

          {/* ── FORMULÁRIO ── */}
          {formOpen && !formSuccess && (
            <div className="mt-2 max-w-xl mx-auto bg-white rounded-[16px] border border-[#E7EDF5] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-8 text-left">
              <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#071C35] mb-1">
                Deixa a tua mensagem
              </h3>
              <p className="text-[14px] text-slate-500 mb-6">
                A tua mensagem será revista pela nossa equipa antes de ser publicada.
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#071C35] mb-1.5">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Ex: João Silva"
                    className="w-full border border-[#E7EDF5] rounded-[10px] px-4 py-3 text-[15px] text-[#071C35] placeholder:text-slate-400 focus:outline-none focus:border-[#1565A8] transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#071C35] mb-1.5">
                    Escola / Faculdade
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleFormChange}
                    placeholder="Ex: Universidade Agostinho Neto"
                    className="w-full border border-[#E7EDF5] rounded-[10px] px-4 py-3 text-[15px] text-[#071C35] placeholder:text-slate-400 focus:outline-none focus:border-[#1565A8] transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#071C35] mb-1.5">
                    A tua mensagem
                  </label>
                  <textarea
                    name="text"
                    value={formData.text}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="Conta a tua experiência no ABC..."
                    className="w-full border border-[#E7EDF5] rounded-[10px] px-4 py-3 text-[15px] text-[#071C35] placeholder:text-slate-400 focus:outline-none focus:border-[#1565A8] transition-colors duration-200 resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-[13px] text-red-500">
                    Ocorreu um erro ao enviar. Tenta novamente.
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleFormSubmit}
                    disabled={
                      formLoading ||
                      !formData.name.trim() ||
                      !formData.university.trim() ||
                      !formData.text.trim()
                    }
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#F69220] hover:bg-[#e0821a] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-[15px] font-bold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(246,146,32,0.18)] disabled:shadow-none"
                  >
                    {formLoading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" strokeWidth={2.2} />
                    )}
                    {formLoading ? "A enviar..." : "Enviar testemunho"}
                  </button>

                  <button
                    onClick={() => {
                      setFormOpen(false);
                      setFormError(false);
                      setFormData({ name: "", university: "", text: "" });
                    }}
                    className="text-[14px] text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SUCESSO ── */}
          {formSuccess && (
            <div className="mt-2 max-w-xl mx-auto bg-white rounded-[16px] border border-[#E7EDF5] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8 text-center">
              <div className="w-14 h-14 bg-[#F0FBF1] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-[#41B349]" strokeWidth={2} />
              </div>
              <h3 className="text-[20px] font-extrabold text-[#071C35] mb-2">
                Obrigado pelo teu testemunho!
              </h3>
              <p className="text-[15px] text-slate-500 leading-7">
                A tua mensagem foi recebida e será publicada após revisão pela nossa equipa.
              </p>
              <button
                onClick={() => {
                  setFormSuccess(false);
                  setFormOpen(false);
                }}
                className="mt-6 text-[14px] text-[#1565A8] hover:underline transition-all duration-200"
              >
                Fechar
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
