import { useState, useEffect } from "react";
import { Users, TrendingUp, Calendar, BookOpen } from "lucide-react";
import CountUp from "react-countup";
import api from "../../../services/api";

export default function Stats() {

  const [stats, setStats] = useState({
    totalStudents: 5000,
    approvalRate: 95,
  });

  // ── Busca dados reais do backend ─────────────────────────────────────────
  useEffect(() => {
    api.get("/public/stats")
      .then((res) => {
        setStats({
          totalStudents: res.data.totalStudents ?? 5000,
          approvalRate: res.data.approvalRate ?? 95,
        });
      })
      .catch(() => {
        // fallback
      });
  }, []);

  const STATS = [
    {
      icon: (
        <Users
          size={36}
          strokeWidth={1.8}
          className="text-[#F7941D]"
        />
      ),
      end: stats.totalStudents,
      prefix: "+",
      suffix: "",
      separator: ".",
      label: "Estudantes\nPreparados",
    },

    {
      icon: (
        <TrendingUp
          size={36}
          strokeWidth={1.8}
          className="text-[#41B349]"
        />
      ),
      end: stats.approvalRate,
      prefix: "",
      suffix: "%",
      separator: "",
      label: "Taxa de\nAprovação",
    },

    {
      icon: (
        <Calendar
          size={36}
          strokeWidth={1.8}
          className="text-[#F7941D]"
        />
      ),
      end: 10,
      prefix: "+",
      suffix: "",
      separator: "",
      label: "Anos de Experiência\nem Educação",
    },

    {
      icon: (
        <BookOpen
          size={36}
          strokeWidth={1.8}
          className="text-[#F7941D]"
        />
      ),
      end: 9,
      prefix: "",
      suffix: "",
      separator: "",
      label: "Disciplinas\nDisponíveis",
    },
  ];

  return (

    <section className="relative -mt-4 bg-[#F5F8FC] pb-16 lg:pb-24">

      {/* ───────────────── CONTAINER ───────────────── */}
      <div className="w-full max-w-[1150px] mx-auto px-4 sm:px-6">

        {/* ───────────────── CARD WRAPPER ───────────────── */}
        <div
          className="
            bg-white
            rounded-[24px]
            lg:rounded-[32px]
            border border-[#E7EDF5]
            shadow-[0_4px_20px_rgba(0,0,0,0.03)]
            overflow-hidden
          "
        >

          {/* ───────────────── GRID ───────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

            {STATS.map((stat, index) => {

              // ── Divisórias mobile ─────────────────────────
              const borderBottom =
                index < STATS.length - 1
                  ? "border-b border-[#E7EDF5] sm:border-b-0"
                  : "";

              // ── Divisórias tablet ─────────────────────────
              const borderRightTablet =
                index % 2 === 0
                  ? "sm:border-r border-[#E7EDF5]"
                  : "";

              const borderBottomTablet =
                index < 2
                  ? "sm:border-b border-[#E7EDF5] lg:border-b-0"
                  : "";

              // ── Divisórias desktop ─────────────────────────
              const borderRightDesktop =
                index < STATS.length - 1
                  ? "lg:border-r border-[#E7EDF5]"
                  : "";

              return (

                <div
                  key={index}
                  className={`
                    flex
                    flex-col
                    items-center
                    justify-center
                    px-6
                    py-8
                    lg:py-12
                    text-center
                    ${borderBottom}
                    ${borderRightTablet}
                    ${borderRightDesktop}
                    ${borderBottomTablet}
                  `}
                >

                  {/* ───────────────── ÍCONE ───────────────── */}
                  <div className="mb-4 lg:mb-5">
                    {stat.icon}
                  </div>

                  {/* ───────────────── NÚMERO ───────────────── */}
                  <h3
                    className="
                      text-[32px]
                      sm:text-[34px]
                      lg:text-[38px]
                      font-extrabold
                      leading-none
                      text-[#071C35]
                    "
                  >
                    <CountUp
                      end={stat.end}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      separator={stat.separator}
                      duration={2.5}
                      enableScrollSpy
                      scrollSpyOnce
                    />
                  </h3>

                  {/* ───────────────── TEXTO ───────────────── */}
                  <p
                    className="
                      mt-3
                      lg:mt-4
                      whitespace-pre-line
                      text-[15px]
                      lg:text-[17px]
                      font-medium
                      leading-[28px]
                      lg:leading-[32px]
                      text-[#4E5D78]
                    "
                  >
                    {stat.label}
                  </p>

                </div>
              );
            })}

          </div>
        </div>

      </div>
    </section>
  );
}