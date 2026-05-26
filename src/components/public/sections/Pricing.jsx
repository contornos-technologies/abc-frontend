
// ============================================================================
// SECTION: PRICING
// FILE: src/components/public/sections/Pricing.jsx
// ============================================================================

import { Check, Award, Users, CreditCard } from "lucide-react";

const pricingTiers = [
  {
    disciplines: "1 Disciplina",
    price: "10.000 Kz",
    description: "Ideal para reforço específico",
  },

  {
    disciplines: "2 Disciplinas",
    price: "13.000 Kz",
    description: "Preparação em áreas chave",
  },

  {
    disciplines: "3 Disciplinas",
    price: "15.000 Kz",
    description: "Cobertura mais abrangente",
    popular: true,
  },

  {
    disciplines: "4 ou mais",
    price: "17.000 Kz",
    description: "Preparação completa",
  },
];

const benefits = [
  "Material didático incluído",
  "Acesso ao portal do aluno",
  "Treino com provas anteriores de acesso",
  "Acompanhamento individualizado",
  "Orientação estratégica para exames",
];

const highlights = [
  {
    icon: Award,
    title: "Bolsas Disponíveis",
    description:
      "Bolsas parciais e integrais para estudantes com bom desempenho académico.",
  },

  {
    icon: Users,
    title: "Vagas Limitadas",
    description:
      "Turmas reduzidas para garantir qualidade e atenção a cada estudante.",
  },

  {
    icon: CreditCard,
    title: "Pagamento Flexível",
    description:
      "Facilidade de pagamento em prestações, de acordo com o pacote de disciplinas escolhido.",
  },
];

export default function Pricing() {

  return (

    <section
      id="precos"
      className="
        w-full
        bg-[#FAFBFD]
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
            Planos e{" "}
            <span className="text-[#1565A8]">
              Preços
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
            Escolhe o pacote ideal para a tua preparação.
            Investimento acessível com resultados comprovados.
          </p>

        </div>

        {/* ───────────────── PRICING CARDS ───────────────── */}
        <div
          className="
            mt-10
            sm:mt-14
            lg:mt-16
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-5
            sm:gap-6
            mb-12
            lg:mb-16
          "
        >

          {pricingTiers.map((tier, index) => (

            <article
              key={index}
              className={`
                relative
                bg-white
                rounded-[24px]
                p-5
                sm:p-6
                lg:p-7
                transition-all
                duration-300
                hover:-translate-y-1.5
                hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]

                ${tier.popular
                  ? `
                    border-2 border-[#F69220]
                    shadow-[0_10px_30px_rgba(246,146,32,0.12)]
                    lg:scale-[1.03]
                  `
                  : `
                    border border-[#E7EDF5]
                    shadow-[0_4px_20px_rgba(0,0,0,0.03)]
                  `
                }
              `}
            >

              {/* ───────────────── BADGE POPULAR ───────────────── */}
              {tier.popular && (
                <div
                  className="
                    absolute
                    left-1/2
                    top-0
                    -translate-x-1/2
                    -translate-y-1/2
                    bg-[#F69220]
                    text-white
                    text-[13px]
                    font-semibold
                    px-4
                    py-1.5
                    rounded-full
                    whitespace-nowrap
                    shadow-lg
                  "
                >
                  Mais Popular
                </div>
              )}

              {/* ───────────────── CONTENT ───────────────── */}
              <div className="text-center">

                {/* disciplines */}
                <h3
                  className="
                    text-[20px]
                    font-bold
                    text-[#071C35]
                    mb-4
                  "
                >
                  {tier.disciplines}
                </h3>

                {/* price */}
                <div
                  className="
                    text-[34px]
                    lg:text-[38px]
                    leading-none
                    font-extrabold
                    text-[#F69220]
                    mb-4
                  "
                >
                  {tier.price}
                </div>

                {/* description */}
                <p
                  className="
                    text-[15px]
                    leading-7
                    text-slate-500
                  "
                >
                  {tier.description}
                </p>

              </div>

            </article>
          ))}

        </div>

        {/* ───────────────── INCLUDED ───────────────── */}
        <div
          className="
            bg-white
            rounded-[28px]
            border
            border-[#E7EDF5]
            shadow-[0_4px_20px_rgba(0,0,0,0.03)]
            p-7
            sm:p-8
            lg:p-10
            mb-12
            lg:mb-16
          "
        >

          {/* ───────────────── TITLE ───────────────── */}
          <h3
            className="
              text-[24px]
              sm:text-[28px]
              lg:text-[32px]
              font-extrabold
              text-[#071C35]
              text-center
              mb-8
            "
          >
            O que está incluído
          </h3>

          {/* ───────────────── GRID ───────────────── */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

            {benefits.map((benefit, index) => (

              <div
                key={index}
                className="flex items-center gap-3"
              >

                {/* check */}
                <div
                  className="
                    w-6
                    h-6
                    rounded-full
                    bg-[#41B349]
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                  "
                >

                  <Check
                    size={14}
                    className="text-white"
                    strokeWidth={3}
                  />

                </div>

                {/* text */}
                <span
                  className="
                    text-[15px]
                    text-[#374151]
                  "
                >
                  {benefit}
                </span>

              </div>
            ))}

          </div>

        </div>

        {/* ───────────────── HIGHLIGHTS ───────────────── */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">

          {highlights.map((highlight, index) => {

            const Icon = highlight.icon;

            return (

              <article
                key={index}
                className="
                  group
                  bg-white
                  rounded-[24px]
                  border
                  border-[#E7EDF5]
                  p-6
                  lg:p-7
                  text-center
                  shadow-[0_4px_20px_rgba(0,0,0,0.03)]
                  transition-all
                  duration-300
                  hover:-translate-y-1.5
                  hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                "
              >

                {/* ───────────────── ICON ───────────────── */}
                <div
                  className="
                    w-16
                    h-16
                    bg-[#F3F8FD]
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    mx-auto
                    mb-5
                    transition-all
                    duration-300
                    group-hover:scale-110
                  "
                >

                  <Icon
                    size={30}
                    className="text-[#1565A8]"
                  />

                </div>

                {/* ───────────────── TITLE ───────────────── */}
                <h4
                  className="
                    text-[17px]
                    font-bold
                    text-[#071C35]
                    mb-3
                  "
                >
                  {highlight.title}
                </h4>

                {/* ───────────────── DESCRIPTION ───────────────── */}
                <p
                  className="
                    text-[14px]
                    sm:text-[15px]
                    leading-6
                    sm:leading-7
                    text-slate-500
                  "
                >
                  {highlight.description}
                </p>

              </article>
            );
          })}

        </div>

        {/* ───────────────── CTA ───────────────── */}
        <div className="text-center">

          <a
            href="/signup"
            className="
              inline-flex
              items-center
              justify-center
              px-8
              sm:px-10
              py-4
              bg-[#F69220]
              hover:bg-[#e0821a]
              text-white
              text-[16px]
              sm:text-lg
              font-bold
              rounded-full
              transition-all
              duration-300
              hover:-translate-y-0.5
              shadow-[0_10px_30px_rgba(246,146,32,0.18)]
            "
          >
            Começar Inscrição →
          </a>

          <p
            className="
              text-sm
              text-slate-500
              mt-4
            "
          >
            Dúvidas? Entre em contacto connosco pelo WhatsApp
          </p>

        </div>

      </div>

    </section>
  );
}

