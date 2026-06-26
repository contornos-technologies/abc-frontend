/**
 * src/pages/public/About.jsx
 *
 * Página pública "Sobre Nós" — implementa o conteúdo definido na Secção 27.2
 * do contexto frontend (V21.0): história, estatísticas anuais, organigrama
 * da Direcção e contactos.
 *
 * Convertido a partir do export Stitch/Figma Make (code.html) para a stack
 * real do projecto:
 * - Tokens de cor "Material You" (bg-primary-container, text-on-surface-variant, etc.)
 *   substituídos por hex directos, alinhados com o design system já em uso
 *   no resto do site (ver Secção 5.2 do contexto).
 * - "Material Symbols" trocados por lucide-react (única biblioteca de ícones
 *   permitida no projecto — Secção 2).
 * - Script de animação dos contadores (IntersectionObserver manual) trocado
 *   por `react-countup`, já instalado e reservado para esta página (Secção 2).
 * - Números de exemplo do mockup (12 825 / 10 702 / 69,5%) substituídos pelos
 *   valores reais e validados da Secção 27.2.4 (1147 / 687 / ≈59,9%), com o
 *   gráfico de evolução anual a usar as 9 edições completas em vez de 4
 *   ilustrativas, e as larguras das barras recalculadas para não ultrapassar
 *   100% (no mockup original, duas barras a 95%+82% no mesmo "track"
 *   estouravam o contentor).
 * - Organigrama: todos os cards de pessoa têm agora o mesmo tamanho em
 *   todos os níveis (no mockup os avatares encolhiam por nível, o que
 *   contraria a decisão explícita da Secção 27.2.6 de não dar destaque de
 *   tamanho a nenhum cargo, incluindo o Director Geral). Os conectores
 *   horizontais deixam de depender de `calc()` fixo em pixels (frágil em
 *   ecrãs estreitos) e passam a usar percentagens (25%/75%) relativas à
 *   própria grelha de 2 colunas — função do número de colunas, não da
 *   largura do ecrã. Em mobile, os conectores desaparecham e os cards
 *   empilham em lista vertical, como pedido na Secção 27.2.6.
 * - Director vs Vice-Director passam a ter uma cor de avatar consistente
 *   (azul para Director, laranja para Vice-Director) em todos os níveis —
 *   pequena extensão da convenção de nomenclatura já definida na Secção
 *   27.2.1, sem alterar o tamanho dos cards.
 * - Tamanhos de texto (headings, subtítulos, cards e números) alinhados ao
 *   padrão tipográfico já usado no Home e na página de Contacto (ver
 *   ContactHero.jsx, Hero.jsx, Stats.jsx, Pricing.jsx, WhyChoose.jsx e
 *   ContactInfoSection.jsx), para a "Sobre" seguir a mesma escala
 *   responsiva (mobile / tablet / desktop) do resto do site.
 *
 * Pendências (ver Secção 27.2.8):
 * - Fotos da equipa via Cloudinary — ainda sem URLs; `Avatar` já aceita
 *   `photoUrl` para quando estiverem disponíveis (ver array LEADERSHIP).
 * - Confirmar URL real da página de Facebook (FACEBOOK_URL abaixo).
 * - Confirmar se "Período de pico: Junho, Julho e Agosto" é literal.
 * - Confirmar o padding-top do hero face à altura real da Navbar fixa
 *   (assumido h-20 / 80px, conforme Secção 6.1).
 *
 * Animações (ver plano_animacoes_home_abc.docx):
 * - Biblioteca: Framer Motion, conforme Secção 3 do plano.
 * - Aplicados os tipos definidos na Secção 4: fade-up subtil ao entrar na
 *   viewport, stagger nos cards/listas (60–90ms entre itens, Secção 6 —
 *   WhyChoose), hover suave nos cards (translateY + sombra, sem scale
 *   exagerado) e scroll reveal nas secções.
 * - Nada de zoom exagerado, bounce, parallax ou animações infinitas
 *   (Secção 5 — "O Que NÃO Fazer"), em linha com a filosofia geral
 *   (Secção 1): movimento subtil, premium, sem aparência infantil.
 * - O plano original cobre a Home Page; aqui adapta-se a mesma filosofia,
 *   biblioteca e tipos de animação às secções equivalentes desta página
 *   (Hero, estatísticas, cards do organigrama, contactos). A navbar com
 *   blur ao scroll (Secção 6 do plano) não está neste ficheiro — vive em
 *   Navbar.jsx, fora do âmbito desta página.
 */

import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { MapPin, Clock, HelpCircle } from 'lucide-react'
import Navbar from '../../components/public/Navbar'
import Footer from '../../components/public/Footer'

// ──────────────────────────────────────────────────────────────────────────
// Conteúdo estático (Secção 27.2 do contexto) — sem endpoint de backend
// dedicado; é informação institucional validada, não dados ao vivo.
// ──────────────────────────────────────────────────────────────────────────

const TOTAL_INSCRITOS = 1147
const TOTAL_ADMITIDOS = 687
const TAXA_GLOBAL = 59.9

const YEARLY_STATS = [
  { label: '2016/17', inscritos: 45, admitidos: 39 },
  { label: '2017/18', inscritos: 105, admitidos: 70 },
  { label: '2018/19', inscritos: 164, admitidos: 101 },
  { label: '2019/20', inscritos: 201, admitidos: 112 },
  { label: '2021', inscritos: 119, admitidos: 80 },
  { label: '2022', inscritos: 188, admitidos: 111 },
  { label: '2023', inscritos: 169, admitidos: 89 },
  { label: '2024', inscritos: 91, admitidos: 49 },
  { label: '2025', inscritos: 65, admitidos: 36 },
]

const MAX_YEAR_TOTAL = Math.max(
  ...YEARLY_STATS.map((y) => y.inscritos + y.admitidos)
)

const LEADERSHIP = {
  level1: {
    name: 'Jonas Lucamba Fernando',
    role: 'Director Geral',
    photoUrl: null,
  },
  level2: {
    name: 'André Nfuanani da Costa',
    role: 'Vice-Director Geral',
    photoUrl: null,
  },
  level3: [
    {
      name: 'Aurélio Cachumbo Josué',
      role: 'Secretário-Geral',
      photoUrl: null,
    },
    {
      name: 'Paulino Bongo Bento',
      role: 'Director Financeiro',
      photoUrl: null,
    },
  ],
  level4: [
    {
      groupLabel: 'Equipa de Marketing e Comunicação',
      members: [
        { name: 'Feliciano Filjo Manuel', role: 'Director', photoUrl: null },
        {
          name: 'Baltazar Manuel Lupupa',
          role: 'Vice-Director',
          photoUrl: null,
        },
      ],
    },
    {
      groupLabel: 'Equipa Pedagógica',
      members: [
        { name: 'Samuel Siku Domingos', role: 'Director', photoUrl: null },
        { name: 'José Maria Kayove', role: 'Vice-Director', photoUrl: null },
      ],
    },
  ],
}

// Os 8 fundadores são, hoje, a própria Direcção — derivar a lista a partir
// de LEADERSHIP em vez de repetir os nomes evita os dois ficarem
// dessincronizados se algum nome for corrigido no futuro.
const FOUNDERS = [
  LEADERSHIP.level1.name,
  LEADERSHIP.level2.name,
  ...LEADERSHIP.level3.map((p) => p.name),
  ...LEADERSHIP.level4.flatMap((g) => g.members.map((m) => m.name)),
]

// ──────────────────────────────────────────────────────────────────────────
// Variantes de animação (Framer Motion) — implementação do plano de
// animações: fade-up subtil (0.5–0.7s), stagger leve entre itens (60–90ms)
// e hover suave nos cards. Centralizadas aqui para reutilização em todas
// as secções, sem duplicar valores de duração/easing.
// ──────────────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const heroContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const cardItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

// Delay entre 60–90ms conforme Secção 6 (WhyChoose) do plano de animações.
const staggerContainer = (stagger = 0.08) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger },
  },
})

// Hover suave para cards (translateY + sombra), sem scale exagerado —
// Secção 5 do plano pede para evitar efeitos chamativos.
const cardHover = {
  y: -4,
  boxShadow: '0px 10px 28px rgba(7, 28, 53, 0.10)',
  transition: { duration: 0.25, ease: 'easeOut' },
}

// ──────────────────────────────────────────────────────────────────────────
// Subcomponentes locais (apenas usados nesta página)
// ──────────────────────────────────────────────────────────────────────────

function Avatar({ name, photoUrl, isVice = false, size = 'md' }) {
  const initial = name.trim().charAt(0).toUpperCase()
  const sizeClasses = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-12 h-12 text-base'

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${sizeClasses}`}
      />
    )
  }

  return (
    <div
      className={`shrink-0 rounded-full flex items-center justify-center font-bold ${sizeClasses} ${
        isVice ? 'bg-orange-50 text-[#F7941D]' : 'bg-blue-50 text-[#1565A8]'
      }`}
    >
      {initial}
    </div>
  )
}

function TeamNode({ name, role, photoUrl, isVice = false }) {
  return (
    <motion.div
      variants={cardItem}
      whileHover={cardHover}
      className="w-full max-w-[280px] bg-white border border-[#E7EDF5] rounded-2xl p-4 flex items-center gap-3"
      style={{ boxShadow: '0px 4px 20px rgba(7, 28, 53, 0.04)' }}
    >
      <Avatar name={name} photoUrl={photoUrl} isVice={isVice} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#071C35] truncate">{name}</p>
        <p className="text-xs text-[#5F6D7E]">{role}</p>
      </div>
    </motion.div>
  )
}

function GroupMemberRow({ name, role, photoUrl, isVice = false }) {
  return (
    <motion.div
      variants={cardItem}
      whileHover={cardHover}
      className="bg-white border border-[#E7EDF5] rounded-xl p-3 flex items-center gap-3"
    >
      <Avatar name={name} photoUrl={photoUrl} isVice={isVice} size="sm" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#071C35] truncate">{name}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#5F6D7E]">
          {role}
        </p>
      </div>
    </motion.div>
  )
}

function YearBarRow({ year, inscritos, admitidos }) {
  const total = inscritos + admitidos
  const fullWidthPct = (total / MAX_YEAR_TOTAL) * 100
  const inscritosPct = (inscritos / total) * fullWidthPct
  const admitidosPct = (admitidos / total) * fullWidthPct

  return (
    <motion.div
      variants={cardItem}
      className="grid grid-cols-[56px_1fr] sm:grid-cols-[72px_1fr] items-center gap-3"
    >
      <span className="text-sm font-semibold text-white/90">{year}</span>
      <div className="h-5 sm:h-6 flex rounded-sm overflow-hidden bg-white/5">
        <div
          className="bg-[#1565A8] h-full transition-all duration-700"
          style={{ width: `${inscritosPct}%` }}
        />
        <div
          className="bg-[#F7941D] h-full transition-all duration-700"
          style={{ width: `${admitidosPct}%` }}
        />
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────

export default function About() {
  return (
    <>
      <Navbar />

      <main className="w-full overflow-x-hidden">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#F4F8FC] pt-28 pb-16 sm:pb-20">
          <div
            className="absolute top-0 right-0 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full pointer-events-none -translate-y-1/3 translate-x-1/4"
            style={{
              background:
                'radial-gradient(circle, rgba(21,101,168,0.10) 0%, rgba(21,101,168,0.02) 70%, transparent 100%)',
            }}
          />
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-6">
            <motion.div
              className="max-w-2xl"
              initial="hidden"
              animate="visible"
              variants={heroContainer}
            >
              <motion.span
                variants={heroItem}
                className="inline-block bg-blue-50 border border-blue-100 text-[#1565A8] rounded-full px-4 py-1.5 text-sm font-semibold mb-4"
              >
                Desde 2016
              </motion.span>
              <motion.h1
                variants={heroItem}
                className="text-[#071C35] font-extrabold text-[36px] sm:text-[52px] lg:text-[56px] leading-[1.05] tracking-[-2px] mb-4"
              >
                Sobre a ABC
              </motion.h1>
              <motion.p
                variants={heroItem}
                className="text-[#5F6D7E] text-[17px] sm:text-[20px] leading-7 sm:leading-8"
              >
                Comprometidos com a excelência académica, somos o parceiro
                estratégico de milhares de jovens angolanos na jornada de acesso
                ao ensino superior. O ABC Centro Preparatório transforma
                aspirações em realidades através de um método rigoroso e focado
                no sucesso.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* NOSSA HISTÓRIA */}
        <section className="bg-white py-16 sm:py-20">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            <motion.div
              className="md:col-span-7 space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
            >
              <h2 className="text-[#1565A8] font-extrabold text-[24px] sm:text-[36px] lg:text-[42px] leading-[1.15]">
                Nossa História
              </h2>
              <div className="space-y-4 text-[#5F6D7E] text-[15px] sm:text-[16px] leading-7">
                <p>
                  A ABC (Academia Berço do Conhecimento) é uma instituição de
                  ensino vocacionada, sobretudo, na preparação de estudantes que
                  pretendem ingressar no Ensino Superior. Mais recentemente,
                  passou também a apoiar, de forma complementar, estudantes do
                  Ensino Médio.
                </p>
                <p>
                  Foi fundada em 2016 por 8 jovens amigos, oriundos da Escola de
                  Formação de Professores Ferraz Bomboco, no Huambo, no Curso de
                  Matemática e Física.
                </p>
                <p>
                  Este grupo de amigos terminou o Ensino Médio em 2015 e, em
                  2016, todos ingressaram no Ensino Superior — na Faculdade de
                  Economia da UJES-Huambo e no ISCED-Huambo.
                </p>
                <p>
                  Nesse mesmo ano, porém, grande parte dos restantes colegas do
                  Ensino Médio reprovou no Exame de Acesso ao Ensino Superior.
                  Foi assim que, no final de 2016, surgiu a ideia de ajudar
                  esses colegas não admitidos.
                </p>
                <p>
                  No início, o objectivo do projecto era simplesmente apoiar os
                  colegas do Ensino Médio que tinham reprovado no Exame de
                  Acesso ao Ensino Superior. Mas o sucesso da primeira edição —
                  mais de 80% de admitidos — motivou a continuidade do projecto
                  e a sua abertura ao público em geral. E assim tudo começou.
                </p>
              </div>
            </motion.div>

            <div className="md:col-span-5 flex justify-center md:justify-end">
              <motion.div
                className="relative border-l-2 border-[#E7EDF5] pl-8 space-y-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer(0.15)}
              >
                <motion.div className="relative" variants={cardItem}>
                  <span className="absolute -left-[37px] top-1 w-4 h-4 bg-[#1565A8] rounded-full border-4 border-white" />
                  <div className="text-[#1565A8] font-extrabold text-[40px] leading-none">
                    2016
                  </div>
                  <div className="text-[#F7941D] text-xs font-bold uppercase tracking-wider mt-1">
                    O Nascimento
                  </div>
                </motion.div>
                <motion.div className="relative" variants={cardItem}>
                  <span className="absolute -left-[37px] top-1 w-4 h-4 bg-[#E7EDF5] rounded-full border-4 border-white" />
                  <div className="text-[#071C35] font-bold text-[28px] leading-none">
                    8
                  </div>
                  <div className="text-[#5F6D7E] text-xs font-semibold mt-1">
                    Amigos Fundadores
                  </div>
                  <motion.ul
                    className="mt-3 space-y-1.5 text-xs text-[#5F6D7E]"
                    variants={staggerContainer(0.07)}
                  >
                    {FOUNDERS.map((name) => (
                      <motion.li key={name} variants={cardItem}>
                        {name}
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* IMPACTO EM NÚMEROS */}
        <section className="bg-[#0A3956] py-16 sm:py-20">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <motion.div
              className="text-center mb-12 sm:mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={fadeUp}
            >
              <h2 className="text-white font-extrabold text-[24px] sm:text-[36px] lg:text-[42px] leading-[1.15] mb-3">
                Impacto em Números
              </h2>
              <p className="text-white/70 text-[16px] sm:text-[17px] leading-7 max-w-xl mx-auto">
                Resultados que comprovam a eficácia da nossa metodologia desde
                2016.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14 sm:mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer(0.08)}
            >
              <motion.div
                variants={cardItem}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="text-[#F7941D] font-extrabold text-[28px] sm:text-[30px] lg:text-[34px] leading-none mb-1">
                  <CountUp
                    end={TOTAL_INSCRITOS}
                    duration={2.2}
                    separator=" "
                    enableScrollSpy
                    scrollSpyOnce
                  />
                  +
                </div>
                <div className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                  Estudantes Inscritos
                </div>
              </motion.div>
              <motion.div
                variants={cardItem}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="text-[#F7941D] font-extrabold text-[28px] sm:text-[30px] lg:text-[34px] leading-none mb-1">
                  <CountUp
                    end={TOTAL_ADMITIDOS}
                    duration={2.2}
                    separator=" "
                    enableScrollSpy
                    scrollSpyOnce
                  />
                  +
                </div>
                <div className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                  Estudantes Admitidos
                </div>
              </motion.div>
              <motion.div
                variants={cardItem}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="text-[#F7941D] font-extrabold text-[28px] sm:text-[30px] lg:text-[34px] leading-none mb-1">
                  <CountUp
                    end={TAXA_GLOBAL}
                    decimals={0}
                    decimal=","
                    duration={2.2}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                  %
                </div>
                <div className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                  Taxa de Aprovação Global
                </div>
              </motion.div>
            </motion.div>

            <div>
              <motion.div
                className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp}
              >
                <h3 className="text-white font-semibold text-[20px] leading-[28px]">
                  Evolução Anual (Inscritos vs. Admitidos)
                </h3>
                <div className="flex gap-4 text-xs text-white/70">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#1565A8]" />{' '}
                    Inscritos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#F7941D]" />{' '}
                    Admitidos
                  </span>
                </div>
              </motion.div>
              <motion.div
                className="space-y-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerContainer(0.05)}
              >
                {YEARLY_STATS.map((y) => (
                  <YearBarRow
                    key={y.label}
                    year={y.label}
                    inscritos={y.inscritos}
                    admitidos={y.admitidos}
                  />
                ))}
              </motion.div>
              <p className="text-xs text-white/50 pt-4">
                Total acumulado desde 2016:{' '}
                {TOTAL_INSCRITOS.toLocaleString('pt-PT')} inscritos ·{' '}
                {TOTAL_ADMITIDOS.toLocaleString('pt-PT')} admitidos.
              </p>
            </div>
          </div>
        </section>

        {/* QUEM LIDERA A ABC */}
        <section className="bg-[#F4F8FC] py-16 sm:py-20 overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <motion.div
              className="text-center mb-12 sm:mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={fadeUp}
            >
              <h2 className="text-[#1565A8] font-extrabold text-[24px] sm:text-[36px] lg:text-[42px] leading-[1.15] mb-3">
                Quem Lidera a ABC
              </h2>
              <p className="text-[#5F6D7E] text-[16px] sm:text-[17px] leading-7 max-w-xl mx-auto">
                Uma estrutura organizacional focada na excelência pedagógica e
                administrativa.
              </p>
            </motion.div>

            <div className="flex flex-col items-center gap-0">
              {/* Nível 1 — Director Geral */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={fadeUp}
              >
                <TeamNode {...LEADERSHIP.level1} />
              </motion.div>
              <div className="hidden md:block w-px h-10 bg-[#E7EDF5]" />

              {/* Nível 2 — Vice-Director Geral */}
              <motion.div
                className="mt-6 md:mt-0"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={fadeUp}
              >
                <TeamNode {...LEADERSHIP.level2} isVice />
              </motion.div>
              <div className="hidden md:block w-px h-10 bg-[#E7EDF5]" />

              {/* Nível 3 — Secretário-Geral / Director Financeiro */}
              <motion.div
                className="relative w-full max-w-2xl mt-6 md:mt-0"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer(0.08)}
              >
                <div className="hidden md:block absolute top-0 left-1/4 right-1/4 h-px bg-[#E7EDF5]" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-y-0 gap-x-16">
                  {LEADERSHIP.level3.map((person) => (
                    <div
                      key={person.name}
                      className="flex flex-col items-center"
                    >
                      <div className="hidden md:block w-px h-10 bg-[#E7EDF5]" />
                      <TeamNode {...person} />
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="hidden md:block w-px h-10 bg-[#E7EDF5] mt-2" />

              {/* Nível 4 — Equipas de Marketing e Pedagógica */}
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-4xl mt-6 md:mt-0"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerContainer(0.1)}
              >
                {LEADERSHIP.level4.map((group) => (
                  <motion.div
                    key={group.groupLabel}
                    variants={cardItem}
                    className="bg-[#EEF4FF] border border-[#E7EDF5] rounded-2xl p-5"
                  >
                    <h5 className="text-center text-[11px] font-bold text-[#1565A8] uppercase tracking-widest mb-4">
                      {group.groupLabel}
                    </h5>
                    <motion.div
                      className="flex flex-col gap-3"
                      variants={staggerContainer(0.07)}
                    >
                      {group.members.map((m) => (
                        <GroupMemberRow
                          key={m.name}
                          {...m}
                          isVice={m.role.startsWith('Vice')}
                        />
                      ))}
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* CONTACTOS */}
        <section className="bg-white py-16 sm:py-20">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <motion.div
              className="relative overflow-hidden bg-white border border-[#E7EDF5] rounded-3xl p-6 md:p-12"
              style={{ boxShadow: '0px 4px 20px rgba(7, 28, 53, 0.04)' }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
            >
              <HelpCircle
                className="hidden md:block absolute -top-6 -right-6 text-[#1565A8] opacity-5"
                size={220}
                strokeWidth={1}
              />

              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h2 className="text-[#1565A8] font-extrabold text-[24px] sm:text-[36px] lg:text-[42px] leading-[1.15] mb-5">
                  Entre em Contacto
                </h2>
                <p className="text-[#5F6D7E] text-[16px] sm:text-[17px] leading-7">
                  Estamos à sua disposição para esclarecer qualquer dúvida sobre
                  os nossos cursos, horários e processos de inscrição.
                </p>
              </div>

              <motion.div
                className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto mt-10"
                variants={staggerContainer(0.09)}
              >
                <motion.div
                  className="flex gap-4 items-start"
                  variants={cardItem}
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#1565A8]" />
                  </div>
                  <div>
                    <h4 className="text-[15px] sm:text-[16px] font-semibold text-[#071C35]">
                      Endereço
                    </h4>
                    <p className="text-[15px] leading-relaxed text-[#5F6D7E]">
                      Huambo, Cidade Alta, Escola do Ensino Especial
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex gap-4 items-start"
                  variants={cardItem}
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#1565A8]" />
                  </div>
                  <div>
                    <h4 className="text-[15px] sm:text-[16px] font-semibold text-[#071C35]">
                      Horário de Funcionamento
                    </h4>
                    <p className="text-[15px] leading-relaxed text-[#5F6D7E]">
                      Segunda a Sexta: 08h00 — 17h00
                    </p>
                    <p className="text-xs text-[#F7941D] font-semibold mt-1">
                      Período de pico: Junho, Julho e Agosto
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
