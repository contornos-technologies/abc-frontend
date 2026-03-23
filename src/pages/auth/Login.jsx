import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const errors = { email: '', password: '' };
  if (!email) errors.email = 'O email é obrigatório.';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Insira um email válido.';
  if (!password) errors.password = 'A senha é obrigatória.';
  else if (password.length < 6) errors.password = 'A senha deve ter pelo menos 6 caracteres.';

  setFieldErrors(errors);
  if (errors.email || errors.password) return;

  setLoading(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Credenciais inválidas.');

    // ✅ MUDANÇA 1: escolhe o storage consoante rememberMe
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', data.token);
    storage.setItem('user', JSON.stringify(data.user));

    navigate(data.user.role === 'ADMIN' ? '/admin' : '/profile');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 animate-fadeInUp"
      style={{ background: 'linear-gradient(135deg, rgba(246, 146, 32, 0.1) 0%, rgba(10, 57, 86, 0.1) 100%)' }}
    >
      <div
        className="w-full max-w-md bg-white shadow-2xl p-8 sm:p-10"
        style={{ borderRadius: '16px' }}
      >
        <div className="text-center mb-8">
          <h1 style={{ color: '#0A3956', fontWeight: 'bold', fontSize: '32px' }}>
            ABC Platform
          </h1>
          <p style={{ color: '#6C757D' }}>Preparacao para o Ensino Superior</p>
        </div>

        <div className="text-center mb-8">
          <h2 style={{ color: '#0A3956', fontSize: '24px', fontWeight: 'bold' }}>
            Bem-vindo de volta
          </h2>
          <p style={{ color: '#6C757D' }}>Acesse sua conta para continuar</p>
        </div>

        {error && (
          <div className="animate-slideDown bg-red-50 border border-red-300 text-red-600 rounded-lg p-3 mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label htmlFor="email" className="block mb-2" style={{ color: '#0A3956' }}>
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail size={20} style={{ color: '#6C757D' }} />
              </div>
<input
  type="email"
  id="email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    setFieldErrors((prev) => ({ ...prev, email: '' }));
  }}
  placeholder="seu@email.com"
  className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none ${
    fieldErrors.email ? 'border-red-400' : 'border-gray-300'
  }`}
  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(246, 146, 32, 0.3)'; }}
  onBlur={(e) => { e.target.style.boxShadow = ''; }}
/>
{fieldErrors.email && (
  <p className="text-red-500 text-xs mt-1 animate-slideDown">{fieldErrors.email}</p>
)}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block mb-2" style={{ color: '#0A3956' }}>
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock size={20} style={{ color: '#6C757D' }} />
              </div>
              <input
  type={showPassword ? 'text' : 'password'}
  id="password"
  value={password}
  onChange={(e) => {
    setPassword(e.target.value);
    setFieldErrors((prev) => ({ ...prev, password: '' }));
  }}
  placeholder="........"
  className={`w-full pl-10 pr-12 py-3 border rounded-lg transition-all duration-200 focus:outline-none ${
    fieldErrors.password ? 'border-red-400' : 'border-gray-300'
  }`}
  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(246, 146, 32, 0.3)'; }}
  onBlur={(e) => { e.target.style.boxShadow = ''; }}
  required
/>
{fieldErrors.password && (
  <p className="text-red-500 text-xs mt-1 animate-slideDown">{fieldErrors.password}</p>
)}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword
                  ? <EyeOff size={20} style={{ color: '#6C757D' }} />
                  : <Eye size={20} style={{ color: '#6C757D' }} />
                }
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                style={{ accentColor: '#F69220' }}
              />
              <label htmlFor="remember" className="ml-2 cursor-pointer" style={{ color: '#6C757D' }}>
                Lembrar-me
              </label>
            </div>
            <a
              href="#"
              style={{ color: '#F69220' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0A3956'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#F69220'; }}
            >
              Esqueceu a senha?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: '#F69220', color: 'white', fontWeight: 'bold' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E67E0D'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F69220'; }}
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>

        </form>

        <div className="text-center mt-6">
          <span style={{ color: '#6C757D' }}>Nao tem conta? </span>
          <Link
            to="/signup"
            style={{ color: '#F69220', fontWeight: '500' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#0A3956'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#F69220'; }}
          >
            Criar conta
          </Link>
        </div>

      </div>
    </div>
  );
}
