import { Link } from 'react-router-dom';
import heroBg from '../../../assets/hero-bg.png';

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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 70% 42%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.18) 35%, transparent 65%)',
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-8 flex items-center min-h-[600px]">
        <div className="flex flex-col gap-5 max-w-[560px] pt-0  pb-12">

          {/* Badge */}
          <div className="w-fit">
            <span className="bg-blue-50 border border-blue-100 text-[#1565A8] rounded-full px-4 py-2 text-sm font-semibold">
            Líder na Preparação para o Acesso ao Ensino Superior
            </span>
          </div>

          {/* Título */}
          <h1
            className="text-[#071C35] font-extrabold leading-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
          >
            Prepare Hoje o Seu
            <br />
            Futuro{' '}
            <span className="text-[#1565A8]">
              Universitário
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-[#64748B] text-lg leading-relaxed max-w-[480px]">
            Preparação intensiva, professores experientes e métodos
            comprovados para conquistar a sua vaga no ensino superior.
          </p>

          {/* Botões */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-[#F7941D] hover:bg-[#ea860f] text-white font-bold px-7 py-3.5 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Inscrever Agora
            </Link>

            <a
              href="#cursos"
              className="inline-flex items-center gap-2 bg-white border border-[#E3EAF2] text-[#071C35] font-bold px-7 py-3.5 rounded-full hover:border-[#1565A8] hover:text-[#1565A8] shadow-sm transition-all duration-300 hover:-translate-y-1"
            >
              Conhecer os Serviços
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}