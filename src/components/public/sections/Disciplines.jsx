
// ============================================================================
// SECTION: DISCIPLINES
// FILE: src/components/public/sections/Disciplines.jsx
// Conteúdo estático — sem endpoints
// ============================================================================

import {
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  BookText,
  Scroll,
  Globe,
  Languages,
  Ruler,
} from "lucide-react";

const disciplines = [
  {
    icon: Calculator,
    title: "Matemática",
    description:
      "Álgebra, geometria, trigonometria e cálculo aplicado aos exames de acesso.",
  },

  {
    icon: Atom,
    title: "Física",
    description:
      "Mecânica, eletromagnetismo, termodinâmica e física moderna.",
  },

  {
    icon: FlaskConical,
    title: "Química",
    description:
      "Química geral, orgânica, inorgânica e físico-química.",
  },

  {
    icon: Dna,
    title: "Biologia",
    description:
      "Biologia celular, genética, ecologia e fisiologia humana.",
  },

  {
    icon: BookText,
    title: "Língua Portuguesa",
    description:
      "Gramática, interpretação de texto, literatura e redação académica.",
  },

  {
    icon: Scroll,
    title: "História Universal",
    description:
      "História antiga, medieval, moderna e contemporânea.",
  },

  {
    icon: Globe,
    title: "HESA",
    description:
      "História Económica e Social de Angola com foco nos exames de acesso.",
  },

  {
    icon: Languages,
    title: "Inglês",
    description:
      "Grammar, reading comprehension, writing e conversação.",
  },

  {
    icon: Ruler,
    title: "Desenho Técnico",
    description:
      "Geometria descritiva, projeções e representação técnica.",
  },
];

export default function Disciplines() {

  return (

    <section
  id="cursos"
  className="
    w-full
    bg-[#F4F8FC]
    py-14
    sm:py-16
    lg:py-24
  "
>

  {/* ───────────────── CONTAINER ───────────────── */}
  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

    {/* ───────────────── HEADER ───────────────── */}
    <div className="text-center max-w-3xl mx-auto">

      {/* ───────────────── TITLE ───────────────── */}
      <h2
        className="
          text-[28px]
          sm:text-[46px]
          lg:text-[56px]
          leading-[1.1]
          font-extrabold
          text-[#071C35]
        "
      >
        Disciplinas{" "}
        <span className="text-[#1565A8]">
          Disponíveis
        </span>
      </h2>

      {/* ───────────────── SUBTITLE ───────────────── */}
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
        Preparação completa nas disciplinas essenciais para os exames
        de acesso ao ensino superior angolano.
      </p>

    </div>

    {/* ───────────────── GRID ───────────────── */}
    <div
      className="
        mt-10
        sm:mt-14
        lg:mt-16
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-4
        sm:gap-5
      "
    >

      {disciplines.map((discipline, index) => {

        const Icon = discipline.icon;

        return (

          <article
            key={index}
            className="
              group
              relative
              bg-white
              rounded-[24px]
              border
              border-[#E7EDF5]
              p-5
              sm:p-6
              shadow-[0_4px_20px_rgba(0,0,0,0.03)]
              hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
              hover:-translate-y-1
              transition-all
              duration-300
              overflow-hidden
            "
          >

            {/* ───────────────── BORDA LARANJA ───────────────── */}
            <div
              className="
                absolute
                top-0
                left-0
                h-full
                w-[5px]
                bg-[#F7941D]
              "
            />

            {/* ───────────────── ICON ───────────────── */}
            <div
              className="
                w-10
                h-10
                sm:w-12
                sm:h-12
                rounded-2xl
                bg-[#F3F8FD]
                flex
                items-center
                justify-center
                mb-4
                sm:mb-5
                transition-all
                duration-300
                group-hover:scale-110
              "
            >

              <Icon
                size={20}
                strokeWidth={2.1}
                className="
                  text-[#1565A8]
                "
              />

            </div>

            {/* ───────────────── TITLE ───────────────── */}
            <h3
              className="
                text-[15px]
                sm:text-[16px]
                font-bold
                leading-snug
                text-[#071C35]
                mb-2
                sm:mb-3
              "
            >
              {discipline.title}
            </h3>

            {/* ───────────────── DESCRIPTION ───────────────── */}
            <p
              className="
                text-[14px]
                leading-5
                sm:leading-6
                text-slate-500
              "
            >
              {discipline.description}
            </p>

          </article>
        );
      })}

    </div>

  </div>

</section>

  );
}

