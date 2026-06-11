import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginService } from '../../services/authService';
import Navbar from '../../components/public/Navbar';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [identifier, setIdentifier]     = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({ identifier: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = { identifier: '', password: '' };
    if (!identifier) errors.identifier = 'O email ou telefone é obrigatório.';
    if (!password) errors.password = 'A senha é obrigatória.';
    else if (password.length < 6) errors.password = 'A senha deve ter pelo menos 6 caracteres.';

    setFieldErrors(errors);
    if (errors.identifier || errors.password) return;

    setLoading(true);
    try {
      const data = await loginService({ identifier, password });

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      const userInfo = data.user || payload;

      if (userInfo.role === 'ADMIN') {
        setError('Acesso não permitido. Use o portal administrativo.');
        return;
      }

      login(data.token, userInfo);
      navigate('/student/profile');

    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.error || err.response?.data?.message || '';

      if (status === 401) {
        setError('Email/telefone ou senha incorrectos. Verifica os teus dados e tenta novamente.');
      } else if (status === 404) {
        setError('Não encontrámos nenhuma conta com estes dados. Verifica ou cria uma conta nova.');
      } else if (status === 429) {
        setError('Demasiadas tentativas. Aguarda alguns minutos e tenta novamente.');
      } else if (!navigator.onLine) {
        setError('Sem ligação à internet. Verifica a tua rede e tenta novamente.');
      } else {
        setError(msg || 'Erro ao fazer login. Tenta novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <Navbar darkHero={false} showBorder={true} />

      {/* ── MOBILE E TABLET (abaixo de lg) ─────────────────────────── */}
      <div className="lg:hidden" style={{ paddingTop: '80px' }}>

        <div className="px-6 pt-10 pb-10 w-full max-w-sm mx-auto">

            {/* TÍTULO */}
            <div className="mb-7">
              <h2 className="font-bold text-[24px] mb-1.5" style={{ color: '#0A3956' }}>
                Bem-vindo de volta
              </h2>
              <p className="text-[14px]" style={{ color: '#6C757D' }}>
                Acede à tua conta para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="identifier-mobile"
                  className="block mb-1.5 text-[13px] font-medium"
                  style={{ color: '#0A3956' }}
                >
                  Email ou Telefone
                </label>
                <input
                  type="text"
                  id="identifier-mobile"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                  }}
                  placeholder="seu@email.com ou 923 456 789"
                  autoComplete="username"
                  className={`w-full px-4 py-3.5 text-[14px] border rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF] ${
                    fieldErrors.identifier ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  style={{ fontSize: '16px' /* evita zoom automático no iOS */ }}
                />
                {fieldErrors.identifier && (
                  <p className="text-red-500 text-xs mt-1.5">{fieldErrors.identifier}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password-mobile"
                  className="block mb-1.5 text-[13px] font-medium"
                  style={{ color: '#0A3956' }}
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password-mobile"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="••••••••"
                    className={`w-full px-4 pr-12 py-3.5 text-[14px] border rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF] ${
                      fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                    style={{ fontSize: '16px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 touch-manipulation"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword
                      ? <EyeOff size={20} style={{ color: '#9CA3AF' }} />
                      : <Eye size={20} style={{ color: '#9CA3AF' }} />
                    }
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs mt-1.5">{fieldErrors.password}</p>
                )}
              </div>

              {/* LEMBRAR */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-mobile"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#F69220' }}
                />
                <label
                  htmlFor="remember-mobile"
                  className="ml-2 text-[13px] select-none"
                  style={{ color: '#6C757D' }}
                >
                  Lembrar-me
                </label>
              </div>

              {/* BOTÃO */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-[16px] text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 touch-manipulation"
                style={{ backgroundColor: '#F69220' }}
              >
                {loading ? 'A entrar...' : 'Entrar'}
              </button>

              {/* ERRO GLOBAL */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3.5 text-[13px] text-center leading-relaxed">
                  {error}
                </div>
              )}

            </form>

            {/* LINK CRIAR CONTA */}
            <div className="text-center mt-7">
              <span className="text-[13px]" style={{ color: '#6C757D' }}>Não tens conta?</span>
              <Link
                to="/signup"
                className="ml-1 text-[13px] font-semibold hover:underline"
                style={{ color: '#F69220' }}
              >
                Criar conta
              </Link>
            </div>

        </div>
      </div>

      {/* ── DESKTOP (lg para cima) ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:min-h-screen relative items-center justify-center overflow-hidden bg-[#E8EDF5] px-4 pt-20 animate-fadeInUp">

        {/* FUNDO DECORATIVO */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#1E90FF]/10" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full border-[35px] border-[#1E90FF]/10" />

        {/* CARD PRINCIPAL */}
        <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[20px] bg-white shadow-2xl">
          <div className="grid lg:grid-cols-2">

            {/* PAINEL ESQUERDO */}
            <div className="relative bg-[#0A3956] p-8 py-11 flex flex-col justify-center overflow-hidden">

              {/* Círculo laranja topo esquerdo */}
              <div className="absolute top-0 left-10 w-12 h-12 rounded-b-full bg-[#F69220]" />

              {/* Barras azuis com gradiente */}
              <div className="absolute top-0 left-[25%] flex gap-3 items-start">
                <div className="w-4 h-24 rounded-b-full" style={{ background: 'linear-gradient(to bottom, #1E90FF, transparent)' }} />
                <div className="w-4 h-36 rounded-b-full" style={{ background: 'linear-gradient(to bottom, #1E90FF, transparent)' }} />
                <div className="w-4 h-28 rounded-b-full" style={{ background: 'linear-gradient(to bottom, #1E90FF, transparent)' }} />
              </div>

              {/* Círculo com anel laranja */}
              <div className="absolute top-10 left-1/2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-[#F69220] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#F69220]" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              </div>

              {/* Círculo orbital baixo direito */}
              <div className="absolute bottom-[-115px] right-[-60px] w-72 h-72 rounded-full border-[10px] border-white" />
              <div className="absolute bottom-[-30px] right-[50px] w-36 h-36 rounded-full bg-[#F69220]" />

              {/* TEXTO */}
              <div className="relative z-10 max-w-md -mt-4">
                <h1 className="text-white font-bold leading-tight text-[36px]">
                  o seu futuro
                  <br />
                  começa aqui.
                </h1>
                <div className="w-16 h-1 bg-[#F69220] mt-4 mb-4 rounded-full" />
                <p className="text-white/90 text-[15px] leading-relaxed">
                  Prepare-se para os exames de acesso
                  com acompanhamento especializado.
                </p>
              </div>
            </div>

            {/* PAINEL DIREITO */}
            <div className="flex flex-col justify-center px-10 py-11">

              {/* TÍTULO */}
              <div className="text-center mb-6">
                <h2 className="font-bold text-[22px] mb-1" style={{ color: '#0A3956' }}>
                  Bem-vindo de volta
                </h2>
                <p className="text-[14px]" style={{ color: '#6C757D' }}>
                  Acede à tua conta para continuar
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* EMAIL */}
                <div>
                  <label htmlFor="identifier" className="block mb-1.5 text-[13px] font-medium" style={{ color: '#0A3956' }}>
                    Email ou Telefone
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                    }}
                    placeholder="seu@email.com ou 923 456 789"
                    autoComplete="username"
                    className={`w-full px-4 py-3 text-[14px] border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/40 focus:border-[#1E90FF] ${
                      fieldErrors.identifier ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.identifier && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.identifier}</p>
                  )}
                </div>

                {/* PASSWORD */}
                <div>
                  <label htmlFor="password" className="block mb-1.5 text-[13px] font-medium" style={{ color: '#0A3956' }}>
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      placeholder="........"
                      className={`w-full px-4 pr-12 py-3 text-[14px] border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/40 focus:border-[#1E90FF] ${
                        fieldErrors.password ? 'border-red-400' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword
                        ? <EyeOff size={18} style={{ color: '#6C757D' }} />
                        : <Eye size={18} style={{ color: '#6C757D' }} />
                      }
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                {/* LEMBRAR */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4"
                    style={{ accentColor: '#F69220' }}
                  />
                  <label htmlFor="remember" className="ml-2 text-[13px]" style={{ color: '#6C757D' }}>
                    Lembrar-me
                  </label>
                </div>

                {/* BOTÃO */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-[15px] text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: '#F69220' }}
                >
                  {loading ? 'A entrar...' : 'Entrar'}
                </button>

                {/* ERRO */}
                {error && (
                  <div className="bg-red-50 border border-red-300 text-red-600 rounded-lg p-3 text-[13px] text-center">
                    {error}
                  </div>
                )}

              </form>

              {/* LINK CRIAR CONTA */}
              <div className="text-center mt-6">
                <span className="text-[13px]" style={{ color: '#6C757D' }}>Não tens conta?</span>
                <Link to="/signup" className="ml-1 text-[13px] font-medium hover:underline" style={{ color: '#F69220' }}>
                  Criar conta
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
