import { Users, TrendingUp, Calendar, BookOpen } from "lucide-react";
import CountUp from "react-countup";

const STATS = [
  {
    icon: <Users size={42} strokeWidth={1.8} className="text-[#F7941D]" />,
    end: 5000,
    prefix: "+",
    separator: ".",
    suffix: "",
    label: "Estudantes\nPreparados",
    border: true,
  },
  {
    icon: (
      <TrendingUp
        size={42}
        strokeWidth={1.8}
        className="text-[#41B349]"
      />
    ),
    end: 95,
    prefix: "",
    separator: "",
    suffix: "%",
    label: "Taxa de\nAprovação",
    border: true,
  },
  {
    icon: <Calendar size={42} strokeWidth={1.8} className="text-[#F7941D]" />,
    end: 10,
    prefix: "+",
    separator: "",
    suffix: "",
    label: "Anos de Experiência\nem Educação",
    border: true,
  },
  {
    icon: <BookOpen size={42} strokeWidth={1.8} className="text-[#F7941D]" />,
    end: 50,
    prefix: "+",
    separator: "",
    suffix: "",
    label: "Simulados Realizados\npor Ano",
    border: false,
  },
];

export default function Stats() {
  return (
    <section className="relative -mt-6 bg-[#F5F8FC] pb-24 px-4">
      <div className="max-w-[1150px] mx-auto px-6">
        
        <div className="grid grid-cols-2 overflow-hidden border bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-[32px] border-[#E7EDF5] lg:grid-cols-4">

          {STATS.map((stat, index) => (
            <div
              key={index}
              className="
                relative
                flex
                flex-col
                items-center
                justify-center
                px-6
                py-14
                text-center
              "
            >
              {/* Linha divisória */}
              {stat.border && (
                <div className="absolute right-0 top-1/2 hidden h-[150px] w-[1px] -translate-y-1/2 bg-[#E7EDF5] lg:block" />
              )}

              {/* Ícone */}
              <div className="mb-5">
                {stat.icon}
              </div>

              {/* Número */}
              <h3 className="text-[38px] font-extrabold leading-none text-[#071C35]">
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

              {/* Texto */}
              <p className="mt-4 whitespace-pre-line text-[17px] font-medium leading-[32px] text-[#4E5D78]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}