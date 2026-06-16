// ============================================================================
// SECTION: CONTACT MAP (PREMIUM VERSION)
// ============================================================================

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { motion, useReducedMotion } from 'framer-motion'

// ───────────────── CUSTOM ICON ─────────────────

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [28, 45],
  iconAnchor: [14, 45],
})

// ───────────────── COORDINATES ─────────────────

const position = [-12.7744147, 15.7441334]

const googleMapsUrl = 'https://www.google.com/maps?q=-12.7744147,15.7441334'

export default function ContactMapSection() {
  const shouldReduceMotion = useReducedMotion()

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
        ease: 'easeOut',
        delay: shouldReduceMotion ? 0 : delay,
      },
    },
  })

  return (
    <section className="pb-12 md:pb-16">
      {/* TITLE */}
      <motion.div
        className="text-center mb-8 px-4 -mt-10 md:-mt-6"
        variants={fadeUp(0)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-[22px] sm:text-[26px] lg:text-[28px] leading-[1.15] font-bold text-[#021B4E]">
          Localização
        </h2>
        <p className="mt-2 text-[15px] sm:text-[16px] leading-7 text-slate-500">
          Veja onde estamos no mapa
        </p>
      </motion.div>

      {/* MAP WRAPPER */}
      <motion.div
        className="relative overflow-hidden w-full"
        variants={fadeUp(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* MAP */}
        <div className="h-[300px] sm:h-[380px] md:h-[450px] w-full">
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position} icon={customIcon}>
              <Popup>
                <div className="py-1">
                  <h3 className="font-bold text-[#021B4E]">
                    ABC Centro Preparatório
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Escola do Ensino Especial
                  </p>
                  <p className="text-sm text-gray-600">
                    Próximo ao CLESE, Huambo
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* OVERLAY GRADIENT (visual premium) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

        {/* BUTTON */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              items-center
              justify-center
              rounded-full
              bg-[#1565A8]
              px-5
              py-2
              text-sm
              font-medium
              text-white
              shadow-lg
              transition
              hover:scale-105
              hover:bg-[#12558F]
            "
          >
            Abrir no Google Maps
          </a>
        </div>
      </motion.div>
    </section>
  )
}
