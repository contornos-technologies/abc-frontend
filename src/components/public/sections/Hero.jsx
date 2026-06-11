import { Link } from 'react-router-dom';
import heroBg from '../../../assets/hero-bg.png';
import heroBgMobile from '../../../assets/hero-students-mobile.png';
import { TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#F4F8FC] pt-14"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center 80px',
        backgroundRepeat: 'no-repeat',
        minHeight: '600px',
      }}
    >
      {/* Esconde o background SÓ no mobile */}
      <div className="absolute inset-0 bg-[#F4F8FC] md:hidden pointer-events-none z-0" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 70% 42%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.18) 35%, transparent 65%)',
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8 flex items-center
        min-h-[auto] md:min-h-[480px] lg:min-h-[600px]
        py-10 md:py-0">

        <div className="flex flex-col
          w-full md:max-w-[420px] lg:max-w-[560px]
          gap-4 md:gap-4 lg:gap-5
          pb-0 md:pb-6 lg:pb-12">

          {/* Badge */}
          <div className="w-fit">
            <span className="bg-blue-50 border border-blue-100 text-[#1565A8] rounded-full font-semibold
              px-3 py-1.5 text-xs md:px-3 md:py-1 md:text-xs lg:px-4 lg:py-2 lg:text-sm">
              Líder na Preparação para o Acesso ao Ensino Superior
            </span>
          </div>

          {/* Título */}
          <h1 className="text-[#071C35] font-extrabold leading-[1.1] tracking-tight
            text-[28px] md:text-[24px] lg:text-[clamp(28px,4vw,48px)]">
            Prepare Hoje o Seu
            <br />
            Futuro{' '}
            <span className="text-[#1565A8]">
              Universitário
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-[#64748B] leading-relaxed
            text-[15px] md:text-[15px] lg:text-lg
            max-w-full md:max-w-[295px] lg:max-w-[480px]">
            Preparação intensiva, professores experientes e métodos
            comprovados para conquistar a sua vaga no ensino superior.
          </p>

          {/* Botões */}
          <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-3 lg:gap-4 mt-1 md:mt-1 lg:mt-2">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2
                bg-[#F7941D] hover:bg-[#ea860f] text-white font-bold
                w-full md:w-auto
                px-6 py-3.5 text-base md:px-5 md:py-3 md:text-sm
                lg:px-7 lg:py-3.5 lg:text-base
                rounded-xl md:rounded-full
                shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Inscrever Agora
            </Link>

            <a
              href="#cursos"
              className="inline-flex items-center justify-center gap-2
                bg-white border border-[#E3EAF2] text-[#071C35] font-bold
                w-full md:w-auto
                px-6 py-3.5 text-base md:px-5 md:py-3 md:text-sm
                lg:px-7 lg:py-3.5 lg:text-base
                rounded-xl md:rounded-full
                hover:border-[#1565A8] hover:text-[#1565A8]
                shadow-sm transition-all duration-300 hover:-translate-y-1"
            >
              Conhecer os Serviços
            </a>
          </div>

          {/* Imagem — só no mobile */}
          <div className="md:hidden mt-6 -mx-6 relative pb-0">
            <img
              src={heroBgMobile}
              alt="Estudantes"
              className="w-full object-cover"
            />

            {/* Badge flutuante */}
            <div className="absolute top-8 right-6 z-20 flex items-center gap-2.5
  bg-white/80 backdrop-blur-sm
  border border-white/60
  px-3 py-2 rounded-2xl shadow-lg
  animate-bounce"
  style={{ animationDuration: '3s' }}
>
              <div className="bg-white rounded-full p-1.5 flex-shrink-0">
                <TrendingUp size={16} strokeWidth={1.8} className="text-[#41B349]" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider font-black text-slate-400 leading-none mb-0.5">
                    Taxa de Aprovação
                </p>
                <p className="text-sm font-bold text-slate-900 leading-none">
                  60% Aprovados
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}