import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginService } from '../../services/authService';
import logoWhite from '../../assets/logo-white.svg';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState(null);
  const [fieldErrors, setFieldErrors]   = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validação
    const errors = {};
    if (!email) errors.email = 'O campo email é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Por favor, insira um email válido.';
    if (!password) errors.password = 'O campo senha é obrigatório.';
    else if (password.length < 6) errors.password = 'A senha deve ter pelo menos 6 caracteres.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const data = await loginService({ email, password });

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      const userInfo = data.user || payload;

      // ✅ Bloquear se não for ADMIN
      if (userInfo.role !== 'ADMIN') {
        setError('Acesso restrito. Credenciais não autorizadas para este portal.');
        return;
      }

      login(data.token, userInfo);
      navigate('/admin');

    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.error || err.response?.data?.message || '';

      if (status === 401) {
        setError('Email ou senha incorrectos. Verifica os teus dados e tenta novamente.');
      } else if (status === 404) {
        setError('Não encontrámos nenhuma conta com este email.');
      } else if (status === 429) {
        setError('Demasiadas tentativas. Aguarda alguns minutos e tenta novamente.');
      } else if (!navigator.onLine) {
        setError('Sem ligação à internet. Verifica a tua rede e tenta novamente.');
      } else {
        setError(msg || 'Erro ao autenticar. Tenta novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── PAINEL ESQUERDO — Branding ── */}
      <div className="relative lg:w-1/2 bg-[#0A3956] p-8 lg:p-12 flex flex-col justify-between min-h-[200px] lg:min-h-screen overflow-hidden">

        {/* Textura geométrica */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Linhas diagonais */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[10%] left-[-10%] w-[120%] h-[1px] bg-white rotate-[-15deg]"></div>
            <div className="absolute top-[30%] left-[-10%] w-[120%] h-[1px] bg-white rotate-[-15deg]"></div>
            <div className="absolute top-[50%] left-[-10%] w-[120%] h-[1px] bg-white rotate-[-15deg]"></div>
            <div className="absolute top-[70%] left-[-10%] w-[120%] h-[1px] bg-white rotate-[-15deg]"></div>
            <div className="absolute top-[90%] left-[-10%] w-[120%] h-[1px] bg-white rotate-[-15deg]"></div>
          </div>
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
            </div>

            <img
  src={logoWhite}
  alt="ABC Centro Preparatório"
  className="h-16 w-auto mx-auto mb-4"
/>

            <div className="text-white/70 text-sm lg:text-base" style={{ fontWeight: 400 }}>
              Painel de Gestão Administrativa
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="relative z-10 text-center text-white/50 text-xs lg:text-sm mt-8 lg:mt-0">
          © 2026 ABC. Todos os direitos reservados.
        </div>
      </div>

      {/* ── PAINEL DIREITO — Formulário ── */}
      <div className="flex-1 lg:w-1/2 bg-white flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <h1 className="text-[#0A3956] text-[22px]" style={{ fontWeight: 700 }}>
                Portal Administrativo
              </h1>
            </div>
            <p className="text-[#6C757D] text-sm">
              Acesso restrito a pessoal autorizado
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-[#DEE2E6] mb-8"></div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="block text-[#0A3956] mb-2 text-sm" style={{ fontWeight: 600 }}>
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]">
                  <Mail className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  placeholder="admin@abc.ao"
                  className={`w-full pl-11 pr-4 py-3 border ${
                    fieldErrors.email ? 'border-[#DC2626]' : 'border-[#DEE2E6]'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956] focus:border-transparent transition-all placeholder:text-[#6C757D]`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-2 text-[#DC2626] text-xs">{fieldErrors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className="block text-[#0A3956] mb-2 text-sm" style={{ fontWeight: 600 }}>
                Senha
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]">
                  <Lock className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-11 py-3 border ${
                    fieldErrors.password ? 'border-[#DC2626]' : 'border-[#DEE2E6]'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956] focus:border-transparent transition-all placeholder:text-[#6C757D]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#0A3956] transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                    : <Eye className="w-5 h-5" strokeWidth={1.5} />
                  }
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-2 text-[#DC2626] text-xs">{fieldErrors.password}</p>
              )}
            </div>

            {/* BOTÃO */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0A3956] hover:bg-[#0D4A6E] text-white py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontWeight: 700 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A autenticar...
                </>
              ) : (
                'Aceder ao Painel'
              )}
            </button>

            {/* ERRO — abaixo do botão */}
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-600 rounded-lg p-3 text-sm text-center">
                {error}
              </div>
            )}

          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-[#CBD5E0] text-xs">
            ABC Platform © 2026
          </div>

        </div>
      </div>

    </div>
  );
}