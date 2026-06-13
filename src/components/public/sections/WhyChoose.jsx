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
  { icon: HandshakeIcon, title: "Comprometimento" },
  { icon: BookOpenCheck, title: "Excelência no Ensino" },
  { icon: CalendarClock, title: "Horários Flexíveis" },
  { icon: Crosshair, title: "Orientação Precisa" },
  { icon: UserRoundCheck, title: "Acompanhamento Personalizado" },
  { icon: HeartHandshake, title: "Conexões Além do Académico" },
];

export default function WhyChoose() {
  return (
    <section className="w-full bg-[#FAFBFD] pt-10 pb-12 lg:pt-20 lg:pb-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ───────────────── HEADER ───────────────── */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-[24px] sm:text-[36px] lg:text-[42px] leading-[1.15] font-extrabold text-[#071C35]">
            O que nos torna{" "}
<span className="text-[#1565A8]">diferentes?</span>
          </h2>

         <p className="mt-4 text-[16px] sm:text-[17px] leading-7 text-slate-500 mx-auto">
  Mais do que um centro preparatório, somos parceiros na construção do teu futuro académico.
</p>


        </div>

        {/* ───────────────── CONTENT ───────────────── */}
        <div className="mt-8 lg:mt-14 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-start">

          {/* ───────────────── IMAGE ───────────────── */}
          <div className="relative min-h-[260px] sm:min-h-[380px] lg:min-h-[420px]">
            <img
              src={whyChooseImage}
              alt="Estudantes do ABC Centro Preparatório"
              className="
                w-full
                h-full
                object-cover
                object-center
                rounded-[8px]
                shadow-[0_16px_48px_rgba(0,0,0,0.15)]
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

          {/* ───────────────── BENEFITS ───────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-3">
            {benefits.map((item, index) => {
              const Icon = item.icon;
              const col = index % 3;
              const row = Math.floor(index / 3);
              const totalRows = Math.ceil(benefits.length / 3);

              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center px-4 py-6 lg:py-7"
                  style={{
                    borderRight: col < 2 ? "1px solid #E6EBF2" : "none",
                    borderBottom: row < totalRows - 1 ? "1px solid #E6EBF2" : "none",
                  }}
                >
                  {/* ICON */}
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[#F3F7FD] flex items-center justify-center mb-4">
                    <Icon size={26} strokeWidth={2} className="text-[#1565A8]" />
                  </div>

                  {/* TITLE */}
                  <h3 className="text-[15px] sm:text-[16px] lg:text-[17px] font-semibold leading-tight text-[#071C35] max-w-[160px]">
                    {item.title}
                  </h3>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}