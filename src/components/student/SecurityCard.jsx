import { useState } from 'react';
import { Lock, X, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

export default function SecurityCard() {
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');
  const [showPass, setShowPass]     = useState({ current: false, new: false, confirm: false });
  const [form, setForm]             = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleShow(field) {
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  function openModal() {
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
    setSuccess(false);
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.patch('/students/me/password', {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      setSuccess(true);
      setTimeout(() => setShowModal(false), 2000);
    } catch (err) {
      setError(err.message || 'Erro ao alterar senha. Verifica a senha actual.');
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { name: 'currentPassword', label: 'Senha actual',   key: 'current' },
    { name: 'newPassword',     label: 'Nova senha',      key: 'new'     },
    { name: 'confirmPassword', label: 'Confirmar senha', key: 'confirm' },
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#F69220] p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Lock className="text-[#0A3956]" size={24} />
            <h2 className="text-[#0A3956] font-semibold text-base">Segurança</h2>
          </div>
          <button
            onClick={openModal}
            className="px-5 py-2.5 border-2 border-[#F69220] text-[#F69220] rounded-lg font-semibold hover:bg-[#FFF4E6] transition-colors text-sm"
          >
            Alterar Senha
          </button>
        </div>

        <div className="bg-[#F8FAFC] p-5 rounded-lg">
          <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-3">SENHA</div>
          <div className="text-[#1A1A2E] text-lg mb-3 tracking-[0.3em]">••••••••</div>
          <p className="text-xs text-[#6B7280]">
            Por segurança, recomendamos alterar a senha regularmente.
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#0A3956] font-bold text-lg">Alterar Senha</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="bg-[#D4EDDA] text-[#155724] p-4 rounded-lg text-center font-semibold">
                Senha alterada com sucesso ✅
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 bg-red-50 text-[#DC3545] text-sm px-4 py-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2 block">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          name={field.name}
                          type={showPass[field.key] ? 'text' : 'password'}
                          value={form[field.name]}
                          onChange={handleChange}
                          className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-[#F69220] bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShow(field.key)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPass[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border-2 border-gray-300 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-[#F69220] text-white rounded-lg text-sm font-semibold hover:bg-[#E08210] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving && <Loader2 size={15} className="animate-spin" />}
                    Guardar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
