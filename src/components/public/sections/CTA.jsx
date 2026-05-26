
import {
  GraduationCap,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

export default function CTA() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1565A8 0%, #12558F 100%)",
      }}
    >

      {/* ───────────────── WAVE TOP ───────────────── */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="
            relative block w-full
            h-[80px]
            sm:h-[120px]
            lg:h-[170px]
          "
        >
          <path
            fill="#F4F8FC"
            d="
              M0,64
              C240,180 480,220 720,200
              C960,180 1200,100 1440,140
              L1440,0
              L0,0
              Z
            "
          />
        </svg>
      </div>

      {/* ───────────────── DECORAÇÃO DE FUNDO ───────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0"
      >

        {/* círculo superior esquerdo */}
        <div
          className="
            absolute -top-32 -left-32
            w-[420px] h-[420px]
            rounded-full
          "
          style={{
            background:
              "radial-gradient(circle, rgba(246,146,32,0.07) 0%, transparent 70%)",
          }}
        />

        {/* círculo inferior direito */}
        <div
          className="
            absolute -bottom-24 -right-24
            w-[300px] h-[300px]
            sm:w-[360px] sm:h-[360px]
            rounded-full
          "
          style={{
            background:
              "radial-gradient(circle, rgba(21,101,168,0.18) 0%, transparent 70%)",
          }}
        />

        {/* linha decorativa */}
        <div
          className="
            hidden lg:block
            absolute top-0 right-0
            w-px h-full opacity-10
          "
          style={{
            background:
              "linear-gradient(to bottom, transparent, #F69220, transparent)",
          }}
        />

        {/* pontos decorativos */}
        <svg
          className="
            hidden lg:block
            absolute top-8 right-16 opacity-10
          "
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
        >
          {[0, 1, 2, 3, 4].map((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <circle
                key={`${row}-${col}`}
                cx={col * 24 + 12}
                cy={row * 24 + 12}
                r="2"
                fill="#F69220"
              />
            ))
          )}
        </svg>

      </div>

      {/* ───────────────── CONTEÚDO ───────────────── */}
      <div
        className="
          relative
          max-w-[1200px]
          mx-auto
          px-4 sm:px-6 lg:px-8

          pt-16 pb-14
          sm:pt-20 sm:pb-18
          lg:pt-40 lg:pb-28
        "
      >

        <div
          className="
            flex flex-col items-center text-center
            max-w-[900px]
            mx-auto
          "
        >

          {/* ───────────────── BADGE ───────────────── */}
          <div
            className="
              hidden sm:inline-flex

              items-center gap-2
              px-4 py-2

              rounded-full
              bg-white/8
              border border-white/10

              mt-8 mb-8

              backdrop-blur-sm
            "
          >
            <GraduationCap
              size={15}
              className="text-[#F69220]"
              strokeWidth={2.2}
            />

            <span
              className="
                text-xs
                font-semibold uppercase
                tracking-[0.18em]
                text-white/70
              "
            >
              As inscrições para o próximo ciclo encontram-se abertas
            </span>
          </div>

          {/* ───────────────── HEADLINE ───────────────── */}
          <h2
            className="
              mt-6 sm:mt-0
              font-extrabold text-white
              leading-[1.08]
              tracking-tight
              px-1 sm:px-0
            "
            style={{
              fontSize: "clamp(28px, 7vw, 56px)",
            }}
          >
            Pronto para começar a tua{" "}

            <span
              className="relative inline-block"
              style={{
                WebkitTextFillColor: "transparent",
                WebkitBackgroundClip: "text",
                backgroundImage:
                  "linear-gradient(90deg, #F69220, #FFB457)",
              }}
            >
              preparação
            </span>{" "}

            rumo à universidade?
          </h2>

          {/* ───────────────── SUBHEADLINE ───────────────── */}
          <p
            className="
              mt-6 sm:mt-8
              max-w-[620px]

              text-[15px] sm:text-lg
              leading-relaxed

              text-white/60
            "
          >
            Inscreve-te hoje e estuda com acompanhamento
            de excelência, preparação focada nos exames
            de admissão e professores comprometidos com
            os teus resultados.
          </p>

          {/* ───────────────── BOTÕES ───────────────── */}
          <div
            className="
              mt-8 sm:mt-10

              flex flex-col sm:flex-row

              w-full sm:w-auto

              items-stretch sm:items-center

              gap-3 sm:gap-4
            "
          >

            {/* botão principal */}
            <a
              href="/signup"
              className="
                group flex items-center justify-center gap-2.5

                w-full sm:w-auto

                px-6 sm:px-8
                py-3 sm:py-4

                rounded-full

                bg-[#F69220]
                hover:bg-[#E8850E]

                text-white
                font-bold
                text-sm sm:text-base

                transition-all duration-200
                hover:-translate-y-0.5
              "
            >
              Inscrever-me Agora

              <ArrowRight
                size={18}
                strokeWidth={2.5}
                className="
                  transition-transform duration-200
                  group-hover:translate-x-1
                "
              />
            </a>

            {/* botão secundário */}
            <a
              href="https://wa.me/244900000000"
              target="_blank"
              rel="noopener noreferrer"
              className="
                group flex items-center justify-center gap-2.5

                w-full sm:w-auto

                px-6 sm:px-8
                py-3 sm:py-4

                rounded-full

                bg-white/8 hover:bg-white/14
                border border-white/20 hover:border-white/30

                text-white
                font-semibold
                text-sm sm:text-base

                transition-all duration-200
                hover:-translate-y-0.5

                backdrop-blur-sm
              "
            >
              <MessageCircle
                size={18}
                strokeWidth={2}
                className="text-white/70"
              />

              Falar no WhatsApp
            </a>

          </div>

        </div>
      </div>

    </section>
  );
}

