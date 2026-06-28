// ============================================================================
// SECTION: CONTACT HERO
// FILE: src/components/public/sections/ContactHero.jsx
// ============================================================================

import { motion, useReducedMotion } from "framer-motion";
import heroImage from '../../../assets/contact-hero.webp';

export default function ContactHero() {
  const shouldReduceMotion = useReducedMotion();

  const fadeDown = (delay = 0) => ({
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : -16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: "easeOut",
        delay: shouldReduceMotion ? 0 : delay,
      },
    },
  });

  const fadeUp = (delay = 0) => ({
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: "easeOut",
        delay: shouldReduceMotion ? 0 : delay,
      },
    },
  });

  return (
    <section className="relative overflow-hidden pt-20">
      {/* ───────────────── BACKGROUND IMAGE ───────────────── */}
      <div
        className="
          relative w-full
          min-h-[560px]
          sm:min-h-[620px]
          lg:min-h-[700px]
        "
      >
        {/* IMAGE */}
        <img
          src={heroImage}
          alt="Estudante do ABC Centro Preparatório"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center] sm:object-center"
        />

        {/* OVERLAY */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-r
            from-[#071C35]/90
            via-[#071C35]/78
            to-[#071C35]/50
          "
        />

        {/* ───────────────── CONTENT ───────────────── */}
        <div
          className="
            relative z-10
            flex items-center justify-center

            min-h-[560px]
            sm:min-h-[620px]
            lg:min-h-[700px]

            px-4
            sm:px-6
            lg:px-8
          "
        >
          {/* CONTAINER */}
          <div className="w-full max-w-[1200px] mx-auto text-center">
            {/* SMALL LABEL */}
            <motion.div
              className="
                inline-flex items-center
                rounded-full
                border border-white/20
                bg-white/10
                backdrop-blur-sm
                px-5 py-2
                text-sm
                font-medium
                tracking-wide
                text-white/90
              "
              variants={fadeDown(0)}
              initial="hidden"
              animate="visible"
            >
              ABC Centro Preparatório
            </motion.div>

            {/* TITLE */}
            <motion.h1
              className="
                mt-7
                max-w-4xl
                mx-auto
                text-[36px]
                sm:text-[52px]
                lg:text-[68px]
                font-extrabold
                leading-[1.05]
                tracking-[-2px]
                text-white
              "
              variants={fadeUp(0.1)}
              initial="hidden"
              animate="visible"
            >
              Contacte-nos
            </motion.h1>

            {/* SUBTITLE */}
            <motion.p
              className="
                mt-6
                max-w-2xl
                mx-auto
                text-[17px]
                sm:text-[20px]
                leading-7
                sm:leading-8
                text-white/80
              "
              variants={fadeUp(0.2)}
              initial="hidden"
              animate="visible"
            >
              Estamos prontos para ajudar você a alcançar os seus objectivos.
            </motion.p>
          </div>
        </div>

        {/* ───────────────── CURVED SVG BOTTOM ───────────────── */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 140"
            preserveAspectRatio="none"
            className="relative block h-[140px] w-full"
          >
            <path
              d="
                M0,90
                C320,170
                1120,10
                1440,100
                L1440,140
                L0,140
                Z
              "
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
