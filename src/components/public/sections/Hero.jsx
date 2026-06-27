import { Link } from 'react-router-dom'
import heroBg from '../../../assets/hero-bg.webp'
import heroBgMobile from '../../../assets/hero-students-mobile.webp'
import { TrendingUp } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

export default function Hero() {
  const shouldReduceMotion = useReducedMotion()

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: shouldReduceMotion ? 0 : 0.5,
      ease: 'easeOut',
      delay,
    },
  })

  const fadeDown = (delay = 0) => ({
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : -16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: shouldReduceMotion ? 0 : 0.5,
      ease: 'easeOut',
      delay,
    },
  })

  return (
    <section
      className="relative w-full overflow-hidden bg-[#F4F8FC] pt-24 md:pt-14"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center 80px',
        backgroundRepeat: 'no-repeat',
        minHeight: '600px',
      }}
    >
      {/* Esconde o background SÓ no mobile (a secção mobile tem o seu próprio fundo) */}
      <div
        className="absolute inset-0 bg-[#F4F8FC] md:hidden pointer-events-none z-0"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{
          background:
            'radial-gradient(circle at 70% 42%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.18) 35%, transparent 65%)',
        }}
      />

      {/* ══════════════════════════ MOBILE ══════════════════════════ */}
      <div className="md:hidden relative -mt-14 -mx-6">
        <div className="relative min-h-[640px] flex flex-col">
          {/* Imagem de fundo full-bleed */}
          <img
            src={heroBgMobile}
            alt="Estudantes a estudar"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
          />

          {/* Overlay gradiente — azul da marca (#0A3956); cobre a biblioteca clara no topo e cria transição suave até ao texto */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,57,86,0.62) 0%, rgba(10,57,86,0.45) 28%, rgba(10,57,86,0.50) 42%, rgba(10,57,86,0.78) 68%, rgba(10,57,86,0.94) 100%)',
            }}
          />

          {/* Badge Taxa de Aprovação — canto direito */}
          <motion.div
            className="absolute top-20 right-8 z-20 flex items-center gap-2
              bg-white/20 backdrop-blur-md
              border border-white/30
              px-2.5 py-2 rounded-xl
              shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.85 }}
          >
            <div className="bg-white rounded-full p-1 flex-shrink-0 shadow-sm">
              <TrendingUp
                size={12}
                strokeWidth={2}
                className="text-[#41B349]"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none mb-0.5">
                Há 10 Anos
              </p>
              <p className="text-[7px] uppercase tracking-wider font-bold text-white/70 leading-none mt-0.5 text-center">
                Impactando
              </p>
            </div>
          </motion.div>

          {/* Conteúdo centralizado, ancorado na base */}
          <div className="relative z-10 mt-auto px-6 pb-10 pt-24 flex flex-col items-center text-center gap-4">
            <motion.h1
              className="text-white font-extrabold leading-[1.15] tracking-tight text-[30px]"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}
              {...fadeUp(0.15)}
            >
              Prepare Hoje o Seu Futuro{' '}
              <span className="text-[#F7941D]">Universitário</span>
            </motion.h1>

            <motion.p
              className="text-white/90 leading-relaxed text-[15px] max-w-[320px]"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
              {...fadeUp(0.28)}
            >
              Preparação intensiva, professores experientes e métodos
              comprovados para conquistar a sua vaga no ensino superior.
            </motion.p>

            <motion.div
              className="flex flex-col w-full max-w-[92%] gap-3 mt-2"
              {...fadeUp(0.4)}
            >
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2
                  bg-[#F7941D] hover:bg-[#ea860f] text-white font-bold
                  w-full px-6 py-3.5 text-base rounded-xl
                  shadow-lg shadow-black/20 transition-all duration-300 active:scale-[0.98]"
              >
                Inscreva-se
              </Link>

              <Link
                to="/simulations"
                className="inline-flex items-center justify-center gap-2
    bg-white/10 backdrop-blur-sm border border-white/40 text-white font-bold
    w-full px-6 py-3.5 text-base rounded-xl
    hover:bg-white/20 transition-all duration-300 active:scale-[0.98]"
              >
                Simulações
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════ TABLET / DESKTOP ══════════════════════ */}
      <div
        className="relative z-10 max-w-[1200px] mx-auto px-8 hidden md:flex items-center
        min-h-[480px] lg:min-h-[600px]"
      >
        <div
          className="flex flex-col
          max-w-[420px] lg:max-w-[560px]
          gap-4 lg:gap-5
          pb-6 lg:pb-12"
        >
          {/* Badge */}
          <motion.div className="w-fit" {...fadeDown(0.1)}>
            <span
              className="bg-blue-50 border border-blue-100 text-[#1565A8] rounded-full font-semibold
              px-3 py-1 text-xs lg:px-4 lg:py-2 lg:text-sm"
            >
              Líder na Preparação para o Acesso ao Ensino Superior
            </span>
          </motion.div>

          {/* Título */}
          <motion.h1
            className="text-[#071C35] font-extrabold leading-[1.1] tracking-tight
              text-[24px] lg:text-[clamp(28px,4vw,48px)]"
            {...fadeUp(0.2)}
          >
            Prepare Hoje o Seu
            <br />
            Futuro <span className="text-[#1565A8]">Universitário</span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            className="text-[#64748B] leading-relaxed
              text-[15px] lg:text-lg
              max-w-[295px] lg:max-w-[480px]"
            {...fadeUp(0.3)}
          >
            Preparação intensiva, professores experientes e métodos comprovados
            para conquistar a sua vaga no ensino superior.
          </motion.p>

          {/* Botões */}
          <motion.div
            className="flex flex-row flex-wrap gap-3 lg:gap-4 mt-1 lg:mt-2"
            {...fadeUp(0.4)}
          >
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2
                bg-[#F7941D] hover:bg-[#ea860f] text-white font-bold
                px-5 py-3 text-sm
                lg:px-7 lg:py-3.5 lg:text-base
                rounded-full
                shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Inscreva-se
            </Link>

            <Link
              to="/simulations"
              className="inline-flex items-center justify-center gap-2
    bg-white border border-[#E3EAF2] text-[#071C35] font-bold
    px-5 py-3 text-sm
    lg:px-7 lg:py-3.5 lg:text-base
    rounded-full min-w-[140px] lg:min-w-[160px]
    hover:border-[#1565A8] hover:text-[#1565A8]
    shadow-sm transition-all duration-300 hover:-translate-y-1"
            >
              Simulações
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
