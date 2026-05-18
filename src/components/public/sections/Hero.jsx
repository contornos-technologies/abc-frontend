import heroImage from "../../../assets/hero-students.png";
import { Users, GraduationCap, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F4F8FC]">

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20">

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* ── COLUNA ESQUERDA ───────────────────────────────────────────── */}
          <div>

            {/* Label topo */}
            <div className="inline-flex px-6 py-3 rounded-full border border-[#B7D2FF] text-[#1565A8] text-sm font-medium bg-white">
              #1 Academia de Preparação Universitária em Angola
            </div>

            {/* Título H1 */}
            <h1 className="mt-8 text-[72px] leading-[1.02] font-black tracking-[-3px] text-[#071C35]">
              Prepare Hoje o Seu
              <br />
              Futuro{" "}
              <span className="text-[#1565A8]">
                Universitário
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="mt-8 text-[21px] leading-[45px] text-[#5F6D7E] max-w-[520px]">
              Preparação intensiva, professores experientes e
              métodos comprovados para conquistar a sua vaga
              no ensino superior.
            </p>

            {/* Botões */}
            <div className="mt-10 flex items-center gap-6">

              <a
                href="/signup"
                className="bg-[#F7941D] hover:bg-[#ea860f] transition-all duration-300 text-white font-bold h-16 px-10 rounded-full text-lg shadow-xl shadow-orange-200 inline-flex items-center gap-2"
              >
                Inscrever Agora →
              </a>

              <a
                href="/servicos"
                className="bg-white border border-[#E3EAF2] hover:border-[#CBD7E5] transition-all duration-300 text-[#071C35] font-bold h-16 px-10 rounded-full text-lg shadow-sm inline-flex items-center gap-2"
              >
                Conhecer os Serviços →
              </a>

            </div>

          </div>

          {/* ── COLUNA DIREITA ────────────────────────────────────────────── */}
          <div className="relative">

            {/* Imagem principal */}
            <div className="relative overflow-hidden rounded-[40px]">
              <img
                src={heroImage}
                alt="Estudantes a estudar"
                className="w-full object-cover"
              />

              {/* Curvas decorativas */}
              <div className="absolute bottom-0 left-0 w-full h-[110px]">
                <div className="absolute bottom-0 left-0 w-full h-[90px] bg-[#1565A8] rounded-t-[100%]" />
                <div className="absolute bottom-0 left-0 w-full h-[70px] bg-[#F7941D] rounded-t-[100%]" />
              </div>
            </div>

            {/* Card flutuante 1 — Taxa de Aprovação */}
            <div className="absolute top-[35%] -left-10 bg-white rounded-[30px] shadow-2xl w-[190px] p-8">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                <TrendingUp size={28} className="text-green-600" />
              </div>
              <h3 className="mt-5 text-[56px] leading-none font-black text-[#071C35]">
                95%
              </h3>
              <p className="mt-3 text-[#5F6D7E] text-xl leading-8">
                Taxa de Aprovação
              </p>
            </div>

            {/* Card flutuante 2 — Estudantes */}
            <div className="absolute top-4 right-0 bg-white rounded-[30px] shadow-2xl w-[220px] p-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Users size={28} className="text-[#1565A8]" />
              </div>
              <h3 className="mt-5 text-[56px] leading-none font-black text-[#071C35]">
                +5.000
              </h3>
              <p className="mt-3 text-[#5F6D7E] text-xl leading-8">
                Estudantes
                <br />
                Preparados
              </p>
            </div>

            {/* Card flutuante 3 — Preparação Intensiva */}
            <div className="absolute bottom-16 right-6 bg-white rounded-[30px] shadow-2xl px-8 py-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                <GraduationCap size={30} className="text-[#1565A8]" />
              </div>
              <div>
                <h4 className="text-[34px] leading-9 font-black text-[#071C35]">
                  Preparação
                  Intensiva
                </h4>
                <p className="mt-2 text-[#5F6D7E] text-lg">
                  para o sucesso
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
