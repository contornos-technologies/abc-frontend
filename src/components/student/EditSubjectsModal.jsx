import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function EditSubjectsModal({ target, onClose, onSuccess }) {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // IDs das disciplinas actualmente inscritas
  const currentIds = target.subjects?.map((s) => s.subjectId) || [];

  // Carregar todas as disciplinas disponíveis
  useEffect(() => {
    api.get('/enrollment/subjects')
      .then((res) => {
        setSubjects(res.data);
        setSelected(currentIds);
      })
      .catch(() => setError('Erro ao carregar disciplinas.'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const hasChanged = JSON.stringify([...selected].sort()) !== JSON.stringify([...currentIds].sort());

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/enrollment/targets/${target.id}/subjects`, {
        subjectIds: selected,
      });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || 'Erro ao actualizar disciplinas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#0A3956]">Editar Disciplinas</h3>
            <p className="text-[#6B7280] text-sm mt-1">Inscrição {target.year}</p>
          </div>
          <button onClick={onClose} className="text-[#6C757D] hover:text-[#0A3956] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#F69220]" size={32} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {subjects.map((subject) => {
                const isSelected = selected.includes(subject.id);
                return (
                  <button
                    key={subject.id}
                    onClick={() => toggle(subject.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[#F69220] bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-[#F69220] hover:shadow-sm'
                    }`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-[#F69220] border-[#F69220]' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <p className="text-[#0A3956] font-semibold pr-8 text-sm">{subject.name}</p>
                    <p className="text-[#6C757D] text-xs">{subject.code}</p>
                  </button>
                );
              })}
            </div>

            {/* Resumo */}
            <div className="bg-orange-50 border-l-4 border-[#F69220] p-4 rounded-lg mb-6">
              <p className="text-[#0A3956] text-sm font-semibold">
                {selected.length} {selected.length === 1 ? 'disciplina seleccionada' : 'disciplinas seleccionadas'}
              </p>
            </div>
          </>
        )}

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-[#0A3956] text-[#0A3956] rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!hasChanged || selected.length === 0 || submitting}
            className={`flex-1 px-6 py-3 rounded-lg transition-all font-semibold ${
              hasChanged && selected.length > 0 && !submitting
                ? 'bg-[#F69220] text-white hover:bg-[#e58419]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Guardar alterações'}
          </button>
        </div>

      </div>
    </div>
  );
}