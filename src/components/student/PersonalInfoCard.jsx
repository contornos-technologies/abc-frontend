import { useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function PersonalInfoCard({ student, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const [form, setForm] = useState({
    fullName:  student?.fullName  || '',
    email:     student?.user?.email || '',
    phone:     student?.phone     || '',
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleEdit() {
    setForm({
      fullName: student?.fullName     || '',
      email:    student?.user?.email  || '',
      phone:    student?.phone        || '',
    });
    setError('');
    setSuccess(false);
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setError('');
  }

  async function handleSave() {
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Nome e email são obrigatórios.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.patch('/students/me', {
        fullName: form.fullName.trim(),
        email:    form.email.trim(),
        phone:    form.phone.trim() || null,
      });
      setSuccess(true);
      setIsEditing(false);
      onUpdate && onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao guardar. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#F69220] p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="text-[#0A3956]" size={24} />
          <h2 className="text-[#0A3956] font-semibold text-base">Informações Pessoais</h2>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="px-5 py-2.5 border-2 border-[#F69220] text-[#F69220] rounded-lg font-semibold hover:bg-[#FFF4E6] transition-colors text-sm"
          >
            Editar Perfil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 border-2 border-gray-300 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[#F69220] text-white rounded-lg text-sm font-semibold hover:bg-[#E08210] transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Guardar
            </button>
          </div>
        )}
      </div>

      {/* Feedback */}
      {success && (
        <div className="mb-4 bg-[#D4EDDA] text-[#155724] px-4 py-3 rounded-lg text-sm font-semibold">
          Perfil actualizado com sucesso ✅
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 text-[#DC3545] px-4 py-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Campos */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'NOME COMPLETO',         value: student?.fullName || '—' },
            { label: 'EMAIL',                 value: student?.user?.email || '—' },
            { label: 'BILHETE DE IDENTIDADE', value: student?.bi || '—' },
            { label: 'TELEFONE',              value: student?.phone || '—' },
          ].map((info) => (
            <div key={info.label} className="bg-[#F8FAFC] p-4 rounded-lg">
              <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2">
                {info.label}
              </div>
              <div className="text-[#1A1A2E] font-medium text-sm">{info.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2 block">
              NOME COMPLETO
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#F69220] bg-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2 block">
              EMAIL
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#F69220] bg-white"
            />
          </div>

          {/* BI — não editável */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2 block">
              BILHETE DE IDENTIDADE
            </label>
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#6B7280]">
              {student?.bi || '—'}
              <span className="text-[10px] ml-2 italic">(não editável)</span>
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2 block">
              TELEFONE
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#F69220] bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}