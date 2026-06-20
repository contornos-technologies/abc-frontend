import { useState } from 'react';
import { User, Mail, Phone, CreditCard, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../services/authService';
import api from '../../services/api'

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bi: '',
    password: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    bi: false,
    password: false,
    confirmPassword: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateFullName = (name) => name.trim().length >= 3;
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => phone.replace(/\D/g, '').length >= 9;
  const validateBI = (bi) => /^\d{9}[A-Z]{2}\d{3}$/.test(bi);

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 0;
    let strength = 1;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber   = /[0-9]/.test(password);
    const hasSpecial  = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (hasUpperCase && (hasNumber || hasSpecial)) strength = 2;
    if (hasUpperCase && hasNumber && hasSpecial && password.length >= 8) strength = 3;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch   = formData.password &&
                           formData.confirmPassword &&
                           formData.password === formData.confirmPassword;

  const isFormValid =
    validateFullName(formData.fullName) &&
    validateEmail(formData.email) &&
    validatePhone(formData.phone) &&
    validateBI(formData.bi) &&
    passwordStrength >= 1 &&
    passwordsMatch &&
    acceptTerms;

  const handleBlur   = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await signup({
        fullName: formData.fullName,
        email:    formData.email,
        password: formData.password,
        phone:    `+244${formData.phone.replace(/\D/g, '')}`,
        bi:       formData.bi,
      });

      const attemptId = localStorage.getItem('abc_attempt_id')
      if (attemptId) {
        try {
          await api.patch(`/simulations/attempts/${attemptId}/claim`)
        } catch {
          /* ignorar — não bloquear o signup */
        } finally {
          localStorage.removeItem('abc_attempt_id')
        }
      }

      setSuccess('Conta criada com sucesso! A redirecionar...');
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || '';

      if (msg.toLowerCase().includes('email')) {
        setError('Este email já está registado. Tenta fazer login ou usa outro email.');
      } else if (msg.toLowerCase().includes('bi')) {
        setError('Este Bilhete de Identidade já está registado.');
      } else if (msg.toLowerCase().includes('telefone') || msg.toLowerCase().includes('phone')) {
        setError('Este número de telefone já está registado.');
      } else {
        setError(msg || 'Erro ao criar conta. Tenta novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const focusStyle  = (e) => { e.target.style.borderColor = '#F69220'; e.target.style.boxShadow = '0 0 0 2px rgba(246,146,32,0.2)'; };
  const resetShadow = (e) => { e.target.style.boxShadow = 'none'; };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #E3F0F7 100%)' }}
    >
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl p-8">

        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A3956' }}>
            ABC Platform
          </h1>
          <p className="text-base mb-4" style={{ color: '#6C757D' }}>
            Crie a sua conta
          </p>
          <div className="h-0.5 w-full" style={{ backgroundColor: '#F69220' }} />
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nome Completo */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#0A3956' }}>
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6C757D' }} />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="João Manuel Silva"
                className="w-full h-12 pl-10 pr-4 rounded-lg border transition-all outline-none"
                style={{ borderColor: touched.fullName && !validateFullName(formData.fullName) ? '#DC3545' : '#D1D5DB' }}
                onFocus={focusStyle}
                onBlur={(e) => {
                  handleBlur('fullName');
                  e.target.style.borderColor = touched.fullName && !validateFullName(formData.fullName) ? '#DC3545' : '#D1D5DB';
                  resetShadow(e);
                }}
              />
            </div>
            {touched.fullName && !validateFullName(formData.fullName) && (
              <p className="text-xs mt-1" style={{ color: '#DC3545' }}>O nome deve ter pelo menos 3 caracteres</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#0A3956' }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6C757D' }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="joao@email.com"
                className="w-full h-12 pl-10 pr-4 rounded-lg border transition-all outline-none"
                style={{ borderColor: touched.email && !validateEmail(formData.email) ? '#DC3545' : '#D1D5DB' }}
                onFocus={focusStyle}
                onBlur={(e) => {
                  handleBlur('email');
                  e.target.style.borderColor = touched.email && !validateEmail(formData.email) ? '#DC3545' : '#D1D5DB';
                  resetShadow(e);
                }}
              />
            </div>
            {touched.email && !validateEmail(formData.email) && (
              <p className="text-xs mt-1" style={{ color: '#DC3545' }}>Formato de email inválido</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#0A3956' }}>
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6C757D' }} />
              <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#6C757D' }}>
                +244
              </span>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="923 000 000"
                className="w-full h-12 pl-20 pr-4 rounded-lg border transition-all outline-none"
                style={{ borderColor: touched.phone && !validatePhone(formData.phone) ? '#DC3545' : '#D1D5DB' }}
                onFocus={focusStyle}
                onBlur={(e) => {
                  handleBlur('phone');
                  e.target.style.borderColor = touched.phone && !validatePhone(formData.phone) ? '#DC3545' : '#D1D5DB';
                  resetShadow(e);
                }}
              />
            </div>
            {touched.phone && !validatePhone(formData.phone) && (
              <p className="text-xs mt-1" style={{ color: '#DC3545' }}>O telefone deve ter pelo menos 9 dígitos</p>
            )}
          </div>

          {/* Bilhete de Identidade */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#0A3956' }}>
              Bilhete de Identidade (BI)
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6C757D' }} />
              <input
                type="text"
                value={formData.bi}
                onChange={(e) => handleChange('bi', e.target.value.toUpperCase())}
                placeholder="123456789LA045"
                maxLength={14}
                className="w-full h-12 pl-10 pr-12 rounded-lg border transition-all outline-none"
                style={{
                  borderColor: formData.bi && !validateBI(formData.bi) ? '#DC3545'
                             : formData.bi &&  validateBI(formData.bi) ? '#28A745'
                             : '#D1D5DB'
                }}
                onFocus={focusStyle}
                onBlur={(e) => {
                  handleBlur('bi');
                  if (formData.bi) {
                    e.target.style.borderColor = validateBI(formData.bi) ? '#28A745' : '#DC3545';
                  } else {
                    e.target.style.borderColor = '#D1D5DB';
                  }
                  resetShadow(e);
                }}
              />
              {formData.bi && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {validateBI(formData.bi)
                    ? <CheckCircle className="w-5 h-5" style={{ color: '#28A745' }} />
                    : <XCircle    className="w-5 h-5" style={{ color: '#DC3545' }} />
                  }
                </div>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: '#6C757D' }}>Ex: 123456789HO045</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#0A3956' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6C757D' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-10 pr-12 rounded-lg border transition-all outline-none"
                style={{ borderColor: '#D1D5DB' }}
                onFocus={focusStyle}
                onBlur={(e) => { handleBlur('password'); e.target.style.borderColor = '#D1D5DB'; resetShadow(e); }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword
                  ? <EyeOff className="w-5 h-5" style={{ color: '#6C757D' }} />
                  : <Eye    className="w-5 h-5" style={{ color: '#6C757D' }} />
                }
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  <div className="h-1 flex-1 rounded transition-all" style={{
                    backgroundColor: passwordStrength >= 1
                      ? (passwordStrength === 1 ? '#DC3545' : passwordStrength === 2 ? '#FFC107' : '#28A745')
                      : '#E5E7EB'
                  }} />
                  <div className="h-1 flex-1 rounded transition-all" style={{
                    backgroundColor: passwordStrength >= 2
                      ? (passwordStrength === 2 ? '#FFC107' : '#28A745')
                      : '#E5E7EB'
                  }} />
                  <div className="h-1 flex-1 rounded transition-all" style={{
                    backgroundColor: passwordStrength === 3 ? '#28A745' : '#E5E7EB'
                  }} />
                </div>
                <p className="text-xs" style={{
                  color: passwordStrength === 1 ? '#DC3545' : passwordStrength === 2 ? '#FFC107' : '#28A745'
                }}>
                  {passwordStrength === 1 ? 'Senha fraca' : passwordStrength === 2 ? 'Senha média' : 'Senha forte'}
                </p>
              </div>
            )}
          </div>

          {/* Confirmar Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#0A3956' }}>
              Confirmar Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6C757D' }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-10 pr-12 rounded-lg border transition-all outline-none"
                style={{
                  borderColor: formData.confirmPassword && !passwordsMatch ? '#DC3545'
                             : formData.confirmPassword &&  passwordsMatch ? '#28A745'
                             : '#D1D5DB'
                }}
                onFocus={focusStyle}
                onBlur={(e) => {
                  handleBlur('confirmPassword');
                  if (formData.confirmPassword) {
                    e.target.style.borderColor = passwordsMatch ? '#28A745' : '#DC3545';
                  } else {
                    e.target.style.borderColor = '#D1D5DB';
                  }
                  resetShadow(e);
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword
                  ? <EyeOff className="w-5 h-5" style={{ color: '#6C757D' }} />
                  : <Eye    className="w-5 h-5" style={{ color: '#6C757D' }} />
                }
              </button>
              {formData.confirmPassword && (
                <div className="absolute right-11 top-1/2 -translate-y-1/2">
                  {passwordsMatch
                    ? <CheckCircle className="w-5 h-5" style={{ color: '#28A745' }} />
                    : <XCircle    className="w-5 h-5" style={{ color: '#DC3545' }} />
                  }
                </div>
              )}
            </div>
            {touched.confirmPassword && formData.confirmPassword && !passwordsMatch && (
              <p className="text-xs mt-1" style={{ color: '#DC3545' }}>As senhas não coincidem</p>
            )}
          </div>

          {/* Checkbox de Termos */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 cursor-pointer"
              style={{ accentColor: '#F69220' }}
            />
            <label htmlFor="terms" className="text-sm cursor-pointer" style={{ color: '#6C757D' }}>
              Li e aceito os{' '}
              <a href="/terms" className="font-medium hover:underline" style={{ color: '#F69220' }}>
                Termos e Condições
              </a>
            </label>
          </div>

          {/* Botão Principal */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full h-12 rounded-lg font-bold text-white transition-all disabled:opacity-60"
            style={{ backgroundColor: '#F69220' }}
            onMouseEnter={(e) => { if (isFormValid && !isLoading) e.currentTarget.style.backgroundColor = '#E07D10'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F69220'; }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                A criar conta...
              </span>
            ) : 'Criar Conta'}
          </button>

          {/* Erro — abaixo do botão */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 rounded-lg p-3 text-sm text-center">
              {error}
            </div>
          )}

          {/* Sucesso — abaixo do botão */}
          {success && (
            <div className="bg-green-50 border border-green-300 text-green-600 rounded-lg p-3 text-sm text-center">
              {success}
            </div>
          )}

        </form>

        {/* Rodapé */}
        <div className="mt-6 text-center text-sm" style={{ color: '#6C757D' }}>
          Já tem conta?{' '}
          <Link to="/login" className="font-bold hover:underline" style={{ color: '#F69220' }}>
            Entrar
          </Link>
        </div>

      </div>
    </div>
  );
}