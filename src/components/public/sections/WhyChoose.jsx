import {
  HandshakeIcon,
  BookOpenCheck,
  Crosshair,
  CalendarClock,
  UserRoundCheck,
  HeartHandshake,
} from "lucide-react";

import whyChooseImage from "../../../assets/why-choose-abc.png";

const benefits = [
  {
    icon: HandshakeIcon,
    title: "Comprometimento",
    description:
      "Comprometidos não só com o teu ingresso, mas com o teu sucesso ao longo de toda a formação superior.",
  },

  {
    icon: BookOpenCheck,
    title: "Ensino de Excelência",
    description:
      "Professores qualificados que transformam o teu modo de estudar e impulsionam os teus resultados académicos.",
  },

  {
    icon: Crosshair,
    title: "Orientação Precisa e Eficaz",
    description:
      "Focamos nas matérias mais recorrentes nos exames e nos mecanismos certos para responderes correctamente.",
  },

  {
    icon: CalendarClock,
    title: "Horários Flexíveis",
    description:
      "Aulas nos horários mais favoráveis, definidos para se adaptarem às tuas necessidades diárias.",
  },

  {
    icon: UserRoundCheck,
    title: "Acompanhamento Personalizado",
    description:
      "Orientação individual, aulas de reforço e apoio contínuo ao longo de toda a tua preparação.",
  },

  {
    icon: HeartHandshake,
    title: "Conexões Além do Académico",
    description:
      "Na ABC encontrarás uma verdadeira família, com professores abertos a orientar-te para a vida.",
  },
];

export default function WhyChoose() {

  return (

    <section className="w-full bg-[#FAFBFD] pt-14 pb-24 lg:pt-16 lg:pb-32">

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ───────────────── HEADER ───────────────── */}
        <div className="text-center max-w-3xl mx-auto">

          {/* ───────────────── TITLE ───────────────── */}
          <h2 className="text-[32px] sm:text-[46px] lg:text-[56px] leading-[1.1] font-extrabold text-[#071C35]">
            Por que escolher a{" "}
            <span className="text-[#1565A8]">ABC?</span>
          </h2>

          {/* ───────────────── SUBTITLE ───────────────── */}
          <p className="mt-6 text-[16px] sm:text-[18px] leading-7 sm:leading-8 text-slate-500 mx-auto">

            {/* desktop */}
            <span className="hidden sm:inline whitespace-nowrap">
              Mais do que um centro preparatório, somos parceiros na construção do teu futuro académico.
            </span>

            {/* mobile */}
            <span className="sm:hidden">
              Mais do que um centro preparatório, somos parceiros na construção do teu futuro académico.
            </span>

            <br className="hidden sm:block" />

            {/* desktop */}
            <span className="hidden sm:inline whitespace-nowrap">
              Descobre os diferenciais que fazem da ABC a escolha certa para o teu sucesso.
            </span>

            {/* mobile */}
            <span className="sm:hidden">
              Descobre os diferenciais que fazem da ABC a escolha certa para o teu sucesso.
            </span>

          </p>

        </div>

        {/* ───────────────── CONTENT ───────────────── */}
        <div className="mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-10 items-stretch">

          {/* ───────────────── IMAGE ───────────────── */}
          <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[500px]">

            <img
              src={whyChooseImage}
              alt="Estudantes do ABC Centro Preparatório"
              className="
                w-full
                h-full
                object-cover
                object-center
                rounded-[24px]
                lg:rounded-[32px]
                shadow-[0_10px_40px_rgba(0,0,0,0.06)]
              "
            />

            {/* ───────────────── BLUR DECORATIVO ───────────────── */}
            <div
              className="
                absolute
                -bottom-8
                -left-8
                w-40
                h-40
                lg:w-52
                lg:h-52
                bg-blue-100
                rounded-full
                blur-3xl
                opacity-40
                -z-10
              "
            />

          </div>

          {/* ───────────────── CARDS ───────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {benefits.map((item, index) => {

              const Icon = item.icon;

              return (

                <article
                  key={index}
                  className="
                    group
                    bg-white
                    border
                    border-[#EEF2F7]
                    rounded-[20px]
                    lg:rounded-[24px]
                    p-5
                    sm:p-6
                    transition-all
                    duration-300
                    hover:-translate-y-1.5
                    hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                    hover:border-blue-100
                  "
                >

                  {/* ───────────────── ICON ───────────────── */}
                  <div
                    className="
                      w-11
                      h-11
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
                      size={22}
                      strokeWidth={2.1}
                      className="text-[#1565A8]"
                    />

                  </div>

                  {/* ───────────────── TITLE ───────────────── */}
                  <h3 className="text-[15px] sm:text-[16px] font-bold leading-snug text-[#071C35] mb-3">
                    {item.title}
                  </h3>

                  {/* ───────────────── DESCRIPTION ───────────────── */}
                  <p className="text-[14px] sm:text-[13px] lg:text-[14px] leading-6 text-slate-500">
                    {item.description}
                  </p>

                </article>
              );
            })}

          </div>

        </div>
      </div>
    </section>
  );
}