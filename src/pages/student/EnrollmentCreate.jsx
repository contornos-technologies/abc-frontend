import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, ChevronLeft,
  GraduationCap, Trash2, X, Loader2
} from 'lucide-react';
import api from '../../services/api';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const PRICE_TABLE = { 1: 10000, 2: 13000, 3: 15000 };

const getPrice = (count) => {
  if (count === 0) return null;
  return PRICE_TABLE[count] ?? 17000;
};

const formatKz = (value) =>
  Number(value).toLocaleString('pt-PT') + ' Kz';

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export default function EnrollmentCreate() {
  const navigate = useNavigate();

  // ── Steps ────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);

  // ── Dados da API ─────────────────────────────────────────────
  const [subjects, setSubjects]       = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingUnis, setLoadingUnis]         = useState(false);

  // ── Step 1 — Disciplinas ─────────────────────────────────────
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // ── Step 2 — Candidaturas ────────────────────────────────────
  const [applications, setApplications] = useState([]);
  const [isModalOpen, setIsModalOpen]   = useState(false);

  // Modal — estado do formulário
  const [faculties, setFaculties]   = useState([]);
  const [courses, setCourses]       = useState([]);
  const [loadingFac, setLoadingFac] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [selectedUniId, setSelectedUniId]     = useState('');
  const [selectedFacId, setSelectedFacId]     = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [customUniversity, setCustomUniversity] = useState('');
  const [customFaculty, setCustomFaculty]       = useState('');
  const [customCourse, setCustomCourse]         = useState('');
  const [useCustomUni, setUseCustomUni]         = useState(false);
  const [useCustomFac, setUseCustomFac]         = useState(false);
  const [useCustomCourse, setUseCustomCourse]   = useState(false);

  // ── Submissão final ──────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Carregar disciplinas ao montar ───────────────────────────
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/enrollment/subjects');
        setSubjects(res.data);
      } catch {
        // silencioso — array vazio
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // ── Carregar universidades ao entrar no step 2 ───────────────
  useEffect(() => {
    if (currentStep !== 2 || universities.length > 0) return;
    const fetchUnis = async () => {
      setLoadingUnis(true);
      try {
        const res = await api.get('/enrollment/universities');
        setUniversities(res.data);
      } catch {
        // silencioso
      } finally {
        setLoadingUnis(false);
      }
    };
    fetchUnis();
  }, [currentStep]);

  // ── Carregar faculdades quando universidade é seleccionada ───
  useEffect(() => {
    if (!selectedUniId) { setFaculties([]); setSelectedFacId(''); return; }
    const fetchFac = async () => {
      setLoadingFac(true);
      setFaculties([]);
      setSelectedFacId('');
      setCourses([]);
      setSelectedCourseId('');
      try {
        const res = await api.get(`/enrollment/faculties?universityId=${selectedUniId}`);
        setFaculties(res.data);
      } catch {
        // silencioso
      } finally {
        setLoadingFac(false);
      }
    };
    fetchFac();
  }, [selectedUniId]);

  // ── Carregar cursos quando faculdade é seleccionada ─────────
  useEffect(() => {
    if (!selectedFacId) { setCourses([]); setSelectedCourseId(''); return; }
    const fetchCourses = async () => {
      setLoadingCourses(true);
      setCourses([]);
      setSelectedCourseId('');
      try {
        const res = await api.get(`/enrollment/courses?facultyId=${selectedFacId}`);
        setCourses(res.data);
      } catch {
        // silencioso
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [selectedFacId]);

  // ─────────────────────────────────────────────
  // HANDLERS — Step 1
  // ─────────────────────────────────────────────

  const toggleSubject = (id) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // ─────────────────────────────────────────────
  // HANDLERS — Modal candidatura
  // ─────────────────────────────────────────────

  const resetModal = () => {
    setSelectedUniId('');
    setSelectedFacId('');
    setSelectedCourseId('');
    setCustomUniversity('');
    setCustomFaculty('');
    setCustomCourse('');
    setUseCustomUni(false);
    setUseCustomFac(false);
    setUseCustomCourse(false);
    setFaculties([]);
    setCourses([]);
  };

  const openModal = () => { resetModal(); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); resetModal(); };

  // Verificar se o modal pode ser submetido
  const uniOk    = useCustomUni ? customUniversity.trim() !== '' : selectedUniId !== '';
  const facOk    = useCustomFac ? customFaculty.trim() !== ''    : selectedFacId !== '';
  const courseOk = useCustomCourse ? customCourse.trim() !== ''  : selectedCourseId !== '';
  const canAddApplication = uniOk && facOk && courseOk;

  const handleAddApplication = () => {
    if (!canAddApplication) return;

    // Encontrar nomes para exibição local
    const uniName    = useCustomUni
      ? customUniversity
      : universities.find((u) => u.id === selectedUniId)?.name || '';
    const facName    = useCustomFac
      ? customFaculty
      : faculties.find((f) => f.id === selectedFacId)?.name || '';
    const courseName = useCustomCourse
      ? customCourse
      : courses.find((c) => c.id === selectedCourseId)?.name || '';

    // Construir payload para o backend — REGRA CRÍTICA: nunca ID + custom ao mesmo tempo
    const appPayload = {
      ...(useCustomUni
        ? { customUniversity: customUniversity.trim() }
        : { universityId: selectedUniId }),
      ...(useCustomFac
        ? { customFaculty: customFaculty.trim() }
        : { facultyId: selectedFacId }),
      ...(useCustomCourse
        ? { customCourse: customCourse.trim() }
        : { courseId: selectedCourseId }),
    };

    setApplications((prev) => [
      ...prev,
      {
        _localId: Date.now(), // apenas para key do React
        uniName,
        facName,
        courseName,
        payload: appPayload,
      },
    ]);

    closeModal();
  };

  const removeApplication = (localId) => {
    setApplications((prev) => prev.filter((a) => a._localId !== localId));
  };

  // ─────────────────────────────────────────────
  // SUBMISSÃO FINAL
  // ─────────────────────────────────────────────

  const handleSubmit = async () => {
    if (selectedSubjects.length === 0) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const body = {
        subjectIds: selectedSubjects,
        applications: applications.map((a) => a.payload),
      };

      const res = await api.post('/enrollment/create', body);
      // O backend devolve { target: { ... } }
      const target = res.data.target;
      navigate('/student/enrollment/success', { state: { target } });
    } catch (err) {
      const msg = err?.response?.data?.error;
      if (err?.response?.status === 409) {
        setSubmitError('Já tens uma inscrição activa para este ano.');
      } else {
        setSubmitError(msg || 'Erro ao criar inscrição. Tenta novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  const price = getPrice(selectedSubjects.length);

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <Link
            to="/student/profile"
            className="flex items-center gap-2 text-[#0A3956] mb-4 hover:opacity-70 transition-opacity w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-3xl font-bold text-[#0A3956] mb-6">Nova Inscrição</h1>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 max-w-md">
            <div className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              currentStep === 1 ? 'bg-[#F69220] text-white' : 'border-2 border-gray-300 text-gray-500'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep === 1 ? 'bg-white text-[#F69220]' : 'bg-gray-300 text-white'
              }`}>1</div>
              <span className="font-semibold">Disciplinas</span>
            </div>

            <div className="h-0.5 w-12 bg-gray-300" />

            <div className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              currentStep === 2 ? 'bg-[#F69220] text-white' : 'border-2 border-gray-300 text-gray-500'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep === 2 ? 'bg-white text-[#F69220]' : 'bg-gray-300 text-white'
              }`}>2</div>
              <span className="font-semibold">Candidaturas</span>
            </div>
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className="bg-white rounded-xl shadow-md border-t-4 border-[#F69220] p-6 md:p-8">

          {/* ── STEP 1 — Disciplinas ── */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-[#0A3956] mb-1">
                Selecciona as tuas disciplinas
              </h2>
              <p className="text-[#6C757D] mb-6">Podes escolher entre 1 e 9 disciplinas</p>

              {loadingSubjects ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#F69220]" size={32} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {subjects.map((subject) => {
                      const isSelected = selectedSubjects.includes(subject.id);
                      return (
                        <button
                          key={subject.id}
                          onClick={() => toggleSubject(subject.id)}
                          className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? 'border-[#F69220] bg-orange-50'
                              : 'border-gray-200 bg-white hover:border-[#F69220] hover:shadow-sm'
                          }`}
                        >
                          {/* Checkbox */}
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
                          <p className="text-[#0A3956] font-semibold pr-8">{subject.name}</p>
                          <p className="text-[#6C757D] text-sm">{subject.code}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pricing Summary */}
                  {price ? (
                    <div className="bg-orange-50 border-l-4 border-[#F69220] p-5 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[#0A3956] font-semibold">
                          {selectedSubjects.length}{' '}
                          {selectedSubjects.length === 1 ? 'disciplina seleccionada' : 'disciplinas seleccionadas'}
                        </span>
                        <span className="text-[#F69220] font-bold text-lg">{formatKz(price)}</span>
                      </div>
                      <p className="text-[#6C757D] text-sm">Preço actualizado automaticamente</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[#6C757D]">
                      Selecciona pelo menos 1 disciplina para continuar
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── STEP 2 — Candidaturas ── */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-[#0A3956] mb-1">
                Adiciona as tuas candidaturas
              </h2>
              <p className="text-[#6C757D] mb-6">
                Opcional — podes adicionar mais tarde no teu perfil
              </p>

              {/* Erro de submissão */}
              {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {submitError}
                </div>
              )}

              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 text-[#F69220] mx-auto mb-4" />
                  <p className="text-[#6C757D] mb-6">Ainda não adicionaste nenhuma candidatura</p>
                  <button
                    onClick={openModal}
                    className="bg-[#F69220] text-white px-6 py-3 rounded-lg hover:bg-[#e58419] transition-colors font-semibold"
                  >
                    + Adicionar Candidatura
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app._localId}
                      className="bg-white border-t-4 border-[#F69220] rounded-lg shadow-sm p-5 flex justify-between items-start"
                    >
                      <div>
                        <h3 className="text-[#0A3956] font-bold mb-1">{app.uniName}</h3>
                        <p className="text-[#6C757D] text-sm">{app.facName}</p>
                        <p className="text-[#6C757D] text-sm">{app.courseName}</p>
                      </div>
                      <button
                        onClick={() => removeApplication(app._localId)}
                        className="text-[#DC3545] hover:opacity-70 transition-opacity p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={openModal}
                    className="w-full bg-[#F69220] text-white px-6 py-3 rounded-lg hover:bg-[#e58419] transition-colors font-semibold"
                  >
                    + Adicionar Candidatura
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Botões de Navegação ── */}
        <div className="flex justify-between items-center mt-6">
          {currentStep === 1 ? (
            <div />
          ) : (
            <button
              onClick={() => setCurrentStep(1)}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 border-2 border-[#0A3956] text-[#0A3956] rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>
          )}

          {currentStep === 1 ? (
            <button
              onClick={() => setCurrentStep(2)}
              disabled={selectedSubjects.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-semibold ml-auto ${
                selectedSubjects.length > 0
                  ? 'bg-[#F69220] text-white hover:bg-[#e58419]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Próximo
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-[#28A745] text-white rounded-lg hover:bg-[#218838] transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A criar inscrição...
                </>
              ) : (
                'Concluir inscrição'
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Modal — Nova Candidatura ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0A3956]">Nova Candidatura</h3>
              <button
                onClick={closeModal}
                className="text-[#6C757D] hover:text-[#0A3956] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">

              {/* ── Universidade ── */}
              <div>
                <label className="block text-[#0A3956] font-semibold mb-2">
                  Universidade
                </label>
                {useCustomUni ? (
                  <input
                    type="text"
                    value={customUniversity}
                    onChange={(e) => setCustomUniversity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F69220]"
                    placeholder="Nome da universidade"
                    autoFocus
                  />
                ) : (
                  <select
                    value={selectedUniId}
                    onChange={(e) => setSelectedUniId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F69220] bg-white"
                  >
                    <option value="">
                      {loadingUnis ? 'A carregar...' : 'Selecciona uma universidade'}
                    </option>
                    {universities.map((uni) => (
                      <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => {
                    setUseCustomUni(!useCustomUni);
                    setCustomUniversity('');
                    setSelectedUniId('');
                    // Reset dependentes
                    setSelectedFacId('');
                    setSelectedCourseId('');
                    setUseCustomFac(false);
                    setUseCustomCourse(false);
                    setCustomFaculty('');
                    setCustomCourse('');
                  }}
                  className="text-[#F69220] underline text-sm mt-2 hover:opacity-70 transition-opacity"
                >
                  {useCustomUni
                    ? '← Escolher da lista'
                    : 'A universidade não está na lista? Escreve aqui'}
                </button>
              </div>

              {/* ── Faculdade ── */}
              <div>
                <label className="block text-[#0A3956] font-semibold mb-2">
                  Faculdade
                </label>
                {useCustomFac ? (
                  <input
                    type="text"
                    value={customFaculty}
                    onChange={(e) => setCustomFaculty(e.target.value)}
                    disabled={!uniOk}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F69220] disabled:bg-[#F8F9FA] disabled:cursor-not-allowed"
                    placeholder="Nome da faculdade"
                  />
                ) : (
                  <select
                    value={selectedFacId}
                    onChange={(e) => setSelectedFacId(e.target.value)}
                    disabled={!uniOk || useCustomUni || loadingFac}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F69220] disabled:bg-[#F8F9FA] disabled:cursor-not-allowed bg-white"
                  >
                    <option value="">
                      {loadingFac ? 'A carregar...' : 'Selecciona uma faculdade'}
                    </option>
                    {faculties.map((fac) => (
                      <option key={fac.id} value={fac.id}>{fac.name}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => {
                    setUseCustomFac(!useCustomFac);
                    setCustomFaculty('');
                    setSelectedFacId('');
                    setSelectedCourseId('');
                    setUseCustomCourse(false);
                    setCustomCourse('');
                  }}
                  disabled={!uniOk}
                  className="text-[#F69220] underline text-sm mt-2 hover:opacity-70 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {useCustomFac
                    ? '← Escolher da lista'
                    : 'A faculdade não está na lista? Escreve aqui'}
                </button>
              </div>

              {/* ── Curso ── */}
              <div>
                <label className="block text-[#0A3956] font-semibold mb-2">
                  Curso
                </label>
                {useCustomCourse ? (
                  <input
                    type="text"
                    value={customCourse}
                    onChange={(e) => setCustomCourse(e.target.value)}
                    disabled={!facOk}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F69220] disabled:bg-[#F8F9FA] disabled:cursor-not-allowed"
                    placeholder="Nome do curso"
                  />
                ) : (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    disabled={!facOk || useCustomFac || loadingCourses}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F69220] disabled:bg-[#F8F9FA] disabled:cursor-not-allowed bg-white"
                  >
                    <option value="">
                      {loadingCourses ? 'A carregar...' : 'Selecciona um curso'}
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => {
                    setUseCustomCourse(!useCustomCourse);
                    setCustomCourse('');
                    setSelectedCourseId('');
                  }}
                  disabled={!facOk}
                  className="text-[#F69220] underline text-sm mt-2 hover:opacity-70 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {useCustomCourse
                    ? '← Escolher da lista'
                    : 'O curso não está na lista? Escreve aqui'}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-6 py-3 border-2 border-[#0A3956] text-[#0A3956] rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddApplication}
                disabled={!canAddApplication}
                className={`flex-1 px-6 py-3 rounded-lg transition-all font-semibold ${
                  canAddApplication
                    ? 'bg-[#F69220] text-white hover:bg-[#e58419]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
