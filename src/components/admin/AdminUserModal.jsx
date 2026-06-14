import { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminUserModal({ isOpen, onClose, onSuccess, selectedAdmin }) {
  const { user } = useAuth();
  const isEditing = selectedAdmin !== null && selectedAdmin !== undefined;
  const isOwnAccount = selectedAdmin?.id === user?.userId;

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ADMIN',
    isActive: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setShowPassword(false);
    if (isEditing) {
      setForm({
        fullName: selectedAdmin.fullName,
        email: selectedAdmin.email,
        password: '',
        role: selectedAdmin.role,
        isActive: selectedAdmin.isActive,
      });
    } else {
      setForm({ fullName: '', email: '', password: '', role: 'ADMIN', isActive: true });
    }
  }, [isOpen, selectedAdmin]);

  function getErrorMessage(err) {
    if (!err.response) return 'Sem ligação. Verifica a tua internet e tenta novamente.';
    const status = err.response?.status;
    const serverMsg = err.response?.data?.error;
    if (status === 401) return null; // tratado no catch
    if (status === 403) return 'Não tens permissão para esta acção.';
    if (status === 409) return 'Este email já está em uso.';
    if (status === 400) return serverMsg || 'Dados inválidos. Verifica os campos e tenta novamente.';
    if (status >= 500) return 'Erro no servidor. Tenta novamente mais tarde.';
    return serverMsg || 'Ocorreu um erro inesperado. Tenta novamente.';
  }

  async function handleSubmit() {
    setError('');

    // Validação local
    if (!isEditing) {
      if (!form.fullName.trim()) return setError('O nome completo é obrigatório.');
      if (!form.email.trim()) return setError('O email é obrigatório.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Introduz um email válido.');
      if (!form.password) return setError('A password é obrigatória.');
      if (form.password.length < 8) return setError('A password deve ter pelo menos 8 caracteres.');
    } else {
      if (form.password && form.password.length < 8) return setError('A nova password deve ter pelo menos 8 caracteres.');
    }

    setLoading(true);
    try {
      if (!isEditing) {
        await api.post('/admin/users', {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
      } else {
        const body = { role: form.role, isActive: form.isActive };
        if (form.password) body.password = form.password;
        await api.patch(`/admin/users/${selectedAdmin.id}`, body);
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.status === 401) {
        onClose();
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fundo escurecido */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md z-10">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEE2E6]">
          <h2 className="text-base font-semibold text-[#0A3956]">
            {isEditing ? 'Editar Admin' : 'Novo Admin'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6C757D] hover:text-[#0A3956] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Erro global */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Nome — só no criar */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-semibold text-[#0A3956] mb-1">
                Nome completo
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="Ex: João Ferreira"
                className="w-full border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] transition"
              />
            </div>
          )}

          {/* Email — só no criar */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-semibold text-[#0A3956] mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@abc.ao"
                className="w-full border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] transition"
              />
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-[#0A3956] mb-1">
              Função
            </label>
            {isOwnAccount ? (
              <div className="w-full border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-[#6C757D] bg-gray-50 cursor-not-allowed">
                {form.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                <p className="text-xs text-[#6C757D] mt-1">
                  Não podes alterar a tua própria função.
                </p>
              </div>
            ) : (
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] transition bg-white"
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            )}
          </div>

          {/* Estado — só no editar */}
          {isEditing && (
            <div>
              <label className="block text-sm font-semibold text-[#0A3956] mb-1">
                Estado
              </label>
              {isOwnAccount ? (
                <div className="w-full border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-[#6C757D] bg-gray-50 cursor-not-allowed">
                  {form.isActive ? 'Activo' : 'Inactivo'}
                  <p className="text-xs text-[#6C757D] mt-1">
                    Não podes desactivar a tua própria conta.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      form.isActive ? 'bg-[#28A745]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        form.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${form.isActive ? 'text-[#28A745]' : 'text-[#DC3545]'}`}>
                    {form.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-[#0A3956] mb-1">
              {isEditing ? 'Nova password' : 'Password'}
              {isEditing && (
                <span className="font-normal text-[#6C757D] ml-1">(opcional)</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder={isEditing ? 'Deixa vazio para não alterar' : 'Mínimo 8 caracteres'}
                className="w-full border border-[#DEE2E6] rounded-lg px-3 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#0A3956] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#DEE2E6]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-[#6C757D] hover:text-[#0A3956] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold bg-[#0A3956] text-white rounded-lg hover:bg-[#0D4A6E] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}