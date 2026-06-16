import { Check, Award, Users, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

const pricingTiers = [
  {
    disciplines: '1 Disciplina',
    price: '10.000 Kz',
    description: 'Ideal para reforço específico',
  },
  {
    disciplines: '2 Disciplinas',
    price: '13.000 Kz',
    description: 'Preparação em áreas chave',
  },
  {
    disciplines: '3 Disciplinas',
    price: '15.000 Kz',
    description: 'Cobertura mais abrangente',
    popular: true,
  },
  {
    disciplines: '4 ou mais',
    price: '17.000 Kz',
    description: 'Preparação completa',
  },
]

const benefits = [
  'Material didático incluído',
  'Acesso ao portal do aluno',
  'Treino com provas anteriores de acesso',
  'Acompanhamento individualizado',
  'Orientação estratégica para exames',
]

const highlights = [
  {
    icon: Award,
    title: 'Bolsas Disponíveis',
    description:
      'Bolsas parciais e integrais para estudantes com bom desempenho académico.',
  },
  {
    icon: Users,
    title: 'Vagas Limitadas',
    description:
      'Turmas reduzidas para garantir qualidade e atenção a cada estudante.',
  },
  {
    icon: CreditCard,
    title: 'Pagamento Flexível',
    description:
      'Facilidade de pagamento em prestações, de acordo com o pacote de disciplinas escolhido.',
  },
]

export default function Pricing() {
  const shouldReduceMotion = useReducedMotion()

  // Variantes reutilizáveis
  const fadeUpHeader = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' },
    },
  }

  const fadeUpBlock = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' },
    },
  }

  const fadeUpCard = (index) => ({
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.4,
        ease: 'easeOut',
        delay: shouldReduceMotion ? 0 : index * 0.07,
      },
    },
  })

  return (
    <section
      id="precos"
      className="w-full bg-[#FAFBFD] pt-10 pb-12 lg:pt-20 lg:pb-16"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ───────────────── HEADER ───────────────── */}
        <motion.div
          className="text-center max-w-3xl mx-auto"
          variants={fadeUpHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-[24px] sm:text-[36px] lg:text-[42px] leading-[1.15] font-extrabold text-[#071C35]">
            Planos e <span className="text-[#1565A8]">Preços</span>
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] leading-7 text-slate-500 max-w-2xl mx-auto">
            Escolhe o pacote ideal para a tua preparação. Investimento acessível
            com resultados comprovados.
          </p>
        </motion.div>

        {/* ───────────────── PRICING CARDS ───────────────── */}
        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8 lg:mb-12">
          {pricingTiers.map((tier, index) => (
            <motion.article
              key={index}
              variants={fadeUpCard(index)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className={`
                relative bg-white rounded-[16px] p-5 sm:p-6
                transition-all duration-300
                hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                ${
                  tier.popular
                    ? 'border-2 border-[#F69220] shadow-[0_10px_30px_rgba(246,146,32,0.12)] lg:scale-[1.03]'
                    : 'border border-[#E7EDF5] shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                }
              `}
            >
              {tier.popular && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[#F69220] text-white text-[12px] font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
                  Mais Popular
                </div>
              )}
              <div className="text-center">
                <h3 className="text-[18px] font-bold text-[#071C35] mb-3">
                  {tier.disciplines}
                </h3>
                <div className="text-[32px] lg:text-[36px] leading-none font-extrabold text-[#F69220] mb-3">
                  {tier.price}
                </div>
                <p className="text-[14px] leading-6 text-slate-500">
                  {tier.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        {/* ───────────────── INCLUDED ───────────────── */}
        <motion.div
          className="bg-white rounded-[16px] border border-[#E7EDF5] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-8 mb-8 lg:mb-12"
          variants={fadeUpBlock}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h3 className="text-[20px] sm:text-[24px] font-extrabold text-[#071C35] text-center mb-6">
            O que está incluído
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3"
                variants={fadeUpCard(index)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                <div className="w-6 h-6 rounded-full bg-[#41B349] flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </div>
                <span className="text-[15px] text-[#374151]">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ───────────────── HIGHLIGHTS ───────────────── */}
        <div className="grid md:grid-cols-3 gap-5 mb-10 lg:mb-12">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon
            return (
              <motion.article
                key={index}
                variants={fadeUpCard(index)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="group bg-white rounded-[16px] border border-[#E7EDF5] p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
              >
                <div className="w-14 h-14 bg-[#F3F8FD] rounded-xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110">
                  <Icon size={26} className="text-[#1565A8]" />
                </div>
                <h4 className="text-[16px] font-bold text-[#071C35] mb-2">
                  {highlight.title}
                </h4>
                <p className="text-[14px] sm:text-[15px] leading-6 text-slate-500">
                  {highlight.description}
                </p>
              </motion.article>
            )
          })}
        </div>

        {/* ───────────────── CTA ───────────────── */}
        <motion.div
          className="text-center"
          variants={fadeUpBlock}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 sm:px-10 py-4 bg-[#F69220] hover:bg-[#e0821a] text-white text-[16px] font-bold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(246,146,32,0.18)]"
          >
            Começar Inscrição
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
