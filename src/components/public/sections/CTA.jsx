import {
  GraduationCap,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1565A8 0%, #12558F 100%)" }}
    >

      {/* ───────────────── WAVE TOP ───────────────── */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="relative block w-full h-[80px] sm:h-[120px] lg:h-[170px]"
        >
          <path
            fill="#F4F8FC"
            d="M0,64 C240,180 480,220 720,200 C960,180 1200,100 1440,140 L1440,0 L0,0 Z"
          />
        </svg>
      </div>

      {/* ───────────────── CONTEÚDO ───────────────── */}
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-18 sm:pb-14 lg:pt-32 lg:pb-20">
        <div className="flex flex-col items-center text-center max-w-[900px] mx-auto">

          {/* ───────────────── BADGE ───────────────── */}
          <div className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/10 mt-6 mb-6 backdrop-blur-sm">
            <GraduationCap size={15} className="text-[#F69220]" strokeWidth={2.2} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              As inscrições para o próximo ciclo encontram-se abertas
            </span>
          </div>

          {/* ───────────────── HEADLINE ───────────────── */}
          <h2
            className="mt-6 sm:mt-0 font-extrabold text-white leading-[1.08] tracking-tight px-1 sm:px-0"
            style={{ fontSize: "clamp(24px, 6vw, 48px)" }}
          >
            Pronto para começar a tua{" "}
            <span
              className="relative inline-block"
              style={{
                WebkitTextFillColor: "transparent",
                WebkitBackgroundClip: "text",
                backgroundImage: "linear-gradient(90deg, #F69220, #FFB457)",
              }}
            >
              preparação
            </span>{" "}
            rumo à universidade?
          </h2>

          {/* ───────────────── SUBHEADLINE ───────────────── */}
          <p className="mt-5 sm:mt-6 max-w-[620px] text-[15px] sm:text-[16px] leading-relaxed text-white/60">
            Inscreve-te hoje e estuda com acompanhamento
            de excelência, preparação focada nos exames
            de admissão e professores comprometidos com
            os teus resultados.
          </p>

          {/* ───────────────── BOTÕES ───────────────── */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 sm:gap-4">

            {/* botão principal */}
            <Link
              to="/signup"
              className="group flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-[#F69220] hover:bg-[#E8850E] text-white font-bold text-sm sm:text-base transition-all duration-200 hover:-translate-y-0.5"
            >
              Inscrever-me Agora
              <ArrowRight size={18} strokeWidth={2.5} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            {/* botão secundário — link externo, <a> correcto */}
            <a
              href="https://wa.me/244900000000"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white/8 hover:bg-white/14 border border-white/20 hover:border-white/30 text-white font-semibold text-sm sm:text-base transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm"
            >
              <MessageCircle size={18} strokeWidth={2} className="text-white/70" />
              Falar no WhatsApp
            </a>

          </div>

        </div>
      </div>

    </section>
  );
}