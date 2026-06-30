import { useState, useEffect } from 'react'
import { Check, Award, Users, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import api from '../../../services/api'

// helpers
function formatPrice(value) {
  return `${Number(value).toLocaleString('pt-PT')} Kz`
}

function tierLabel(tier) {
  if (tier.maxSubjects === null)
    return `${tier.minSubjects} ou mais Disciplinas`
  if (tier.minSubjects === tier.maxSubjects)
    return `${tier.minSubjects} Disciplina${tier.minSubjects > 1 ? 's' : ''}`
  return `${tier.minSubjects}–${tier.maxSubjects} Disciplinas`
}

function isPopular(tier) {
  return tier.minSubjects === 3 && tier.maxSubjects === 3
}

const descriptions = [
  'Ideal para reforço específico',
  'Preparação em áreas chave',
  'Cobertura mais abrangente',
  'Preparação completa',
]

const benefits = [
  'Material didático incluído',
  'Simulados online em tempo real',
  'Treino com provas anteriores de acesso',
  'Acesso ao portal do aluno',
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
  const [pricingTiers, setPricingTiers] = useState([])
  const [loadingPricing, setLoadingPricing] = useState(true)

  useEffect(() => {
    api
      .get('/public/pricing')
      .then((res) => {
        const data = res.data?.data ?? res.data
        setPricingTiers(data)
      })
      .catch(() => {
        // fallback silencioso — não quebra a página
      })
      .finally(() => setLoadingPricing(false))
  }, [])

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
          {loadingPricing
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[16px] border border-[#E7EDF5] p-6 animate-pulse h-40"
                />
              ))
            : pricingTiers.map((tier, index) => (
                <motion.article
                  key={tier.id}
                  variants={fadeUpCard(index)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className={`
                  relative bg-white rounded-[16px] p-5 sm:p-6
                  transition-all duration-300
                  hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                  ${
                    isPopular(tier)
                      ? 'border-2 border-[#F69220] shadow-[0_10px_30px_rgba(246,146,32,0.12)] lg:scale-[1.03]'
                      : 'border border-[#E7EDF5] shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                  }
                `}
                >
                  {isPopular(tier) && (
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[#F69220] text-white text-[12px] font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
                      Mais Popular
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-[18px] font-bold text-[#071C35] mb-3">
                      {tierLabel(tier)}
                    </h3>
                    <div className="text-[32px] lg:text-[36px] leading-none font-extrabold text-[#F69220] mb-3">
                      {formatPrice(tier.totalPrice)}
                    </div>
                    <p className="text-[14px] leading-6 text-slate-500">
                      {descriptions[index]}
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
