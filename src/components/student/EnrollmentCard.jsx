import { useState, useEffect } from 'react'
import {
  BookOpen,
  ClipboardList,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  GraduationCap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import EditSubjectsModal from './EditSubjectsModal'

const formatCurrency = (value) => Number(value).toLocaleString('pt-PT') + ' Kz'

const SCHOLARSHIP_LABELS = {
  NONE: 'Sem bolsa',
  PARTIAL_50: 'Bolsa 50%',
  PARTIAL_75: 'Bolsa 75%',
  FULL: 'Bolsa Total ✅',
}

const STATUS_LABELS = {
  ACTIVE: 'Activa',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Concluída',
}

const STATUS_STYLES = {
  ACTIVE: 'bg-[#D4EDDA] text-[#155724]',
  CANCELLED: 'bg-[#F8D7DA] text-[#721C24]',
  COMPLETED: 'bg-[#CCE5FF] text-[#004085]',
}

const ENROLLMENT_NEW_PATH = '/student/enrollment/new'

// ─── Modal de Nova Candidatura ───────────────────────────────
function AddApplicationModal({ targetId, onClose, onSuccess }) {
  const [universities, setUniversities] = useState([])
  const [faculties, setFaculties] = useState([])
  const [courses, setCourses] = useState([])

  const [loadingUnis, setLoadingUnis] = useState(true)
  const [loadingFac, setLoadingFac] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [selectedUniId, setSelectedUniId] = useState('')
  const [selectedFacId, setSelectedFacId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [customUniversity, setCustomUniversity] = useState('')
  const [customFaculty, setCustomFaculty] = useState('')
  const [customCourse, setCustomCourse] = useState('')
  const [useCustomUni, setUseCustomUni] = useState(false)
  const [useCustomFac, setUseCustomFac] = useState(false)
  const [useCustomCourse, setUseCustomCourse] = useState(false)

  useEffect(() => {
    api
      .get('/enrollment/universities')
      .then((res) => setUniversities(res.data))
      .catch(() => {})
      .finally(() => setLoadingUnis(false))
  }, [])

  useEffect(() => {
    if (!selectedUniId) {
      setFaculties([])
      setSelectedFacId('')
      return
    }
    setLoadingFac(true)
    setFaculties([])
    setSelectedFacId('')
    setCourses([])
    setSelectedCourseId('')
    api
      .get(`/enrollment/faculties?universityId=${selectedUniId}`)
      .then((res) => setFaculties(res.data))
      .catch(() => {})
      .finally(() => setLoadingFac(false))
  }, [selectedUniId])

  useEffect(() => {
    if (!selectedFacId) {
      setCourses([])
      setSelectedCourseId('')
      return
    }
    setLoadingCourses(true)
    setCourses([])
    setSelectedCourseId('')
    api
      .get(`/enrollment/courses?facultyId=${selectedFacId}`)
      .then((res) => setCourses(res.data))
      .catch(() => {})
      .finally(() => setLoadingCourses(false))
  }, [selectedFacId])

  const uniOk = useCustomUni
    ? customUniversity.trim() !== ''
    : selectedUniId !== ''
  const facOk = useCustomFac
    ? customFaculty.trim() !== ''
    : selectedFacId !== ''
  const courseOk = useCustomCourse
    ? customCourse.trim() !== ''
    : selectedCourseId !== ''
  const canSubmit = uniOk && facOk && courseOk && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      const body = {
        targetId,
        ...(useCustomUni
          ? { customUniversity: customUniversity.trim() }
          : { universityId: selectedUniId }),
        ...(useCustomFac
          ? { customFaculty: customFaculty.trim() }
          : { facultyId: selectedFacId }),
        ...(useCustomCourse
          ? { customCourse: customCourse.trim() }
          : { courseId: selectedCourseId }),
      }
      await api.post('/enrollment/applications', body)
      onSuccess()
    } catch (err) {
      setError(err?.response?.data?.error || 'Erro ao adicionar candidatura.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#0A3956]">Nova Candidatura</h3>
          <button
            onClick={onClose}
            className="text-[#6C757D] hover:text-[#0A3956] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Universidade */}
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
                  {loadingUnis
                    ? 'A carregar...'
                    : 'Selecciona uma universidade'}
                </option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => {
                setUseCustomUni(!useCustomUni)
                setCustomUniversity('')
                setSelectedUniId('')
                setSelectedFacId('')
                setSelectedCourseId('')
                setUseCustomFac(false)
                setUseCustomCourse(false)
                setCustomFaculty('')
                setCustomCourse('')
              }}
              className="text-[#F69220] underline text-sm mt-2 hover:opacity-70 transition-opacity"
            >
              {useCustomUni
                ? '← Escolher da lista'
                : 'A universidade não está na lista? Escreve aqui'}
            </button>
          </div>

          {/* Faculdade */}
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
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => {
                setUseCustomFac(!useCustomFac)
                setCustomFaculty('')
                setSelectedFacId('')
                setSelectedCourseId('')
                setUseCustomCourse(false)
                setCustomCourse('')
              }}
              disabled={!uniOk}
              className="text-[#F69220] underline text-sm mt-2 hover:opacity-70 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {useCustomFac
                ? '← Escolher da lista'
                : 'A faculdade não está na lista? Escreve aqui'}
            </button>
          </div>

          {/* Curso */}
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
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => {
                setUseCustomCourse(!useCustomCourse)
                setCustomCourse('')
                setSelectedCourseId('')
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

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-[#0A3956] text-[#0A3956] rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex-1 px-6 py-3 rounded-lg transition-all font-semibold ${
              canSubmit
                ? 'bg-[#F69220] text-white hover:bg-[#e58419]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <Loader2 className="animate-spin mx-auto" size={20} />
            ) : (
              'Adicionar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── EnrollmentCard Principal ────────────────────────────────
export default function EnrollmentCard({ targets, loading, error, onRefresh }) {
  const navigate = useNavigate()
  const [modalTargetId, setModalTargetId] = useState(null)
  const [editSubjectsTarget, setEditSubjectsTarget] = useState(null)
  const currentYear = new Date().getFullYear()
  const hasCurrentYear = targets?.some(
    (t) => t.year === currentYear && t.status !== 'CANCELLED'
  )

  const handleApplicationSuccess = () => {
    setModalTargetId(null)
    onRefresh && onRefresh()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#F69220] p-6">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="text-[#0A3956]" size={24} />
          <h2 className="text-[#0A3956] font-semibold text-base">
            Minha Inscrição
          </h2>
        </div>
        <div className="flex items-center justify-center py-10 text-[#6B7280] gap-3">
          <Loader2 className="animate-spin" size={22} />
          <span className="text-sm">A carregar inscrição...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#F69220] p-6">
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="text-[#0A3956]" size={24} />
          <h2 className="text-[#0A3956] font-semibold text-base">
            Minha Inscrição
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-red-50 text-[#DC3545] px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#F69220] p-6 hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-[#0A3956]" size={24} />
            <h2 className="text-[#0A3956] font-semibold text-base">
              Minha Inscrição
            </h2>
          </div>
          {!hasCurrentYear && targets?.length > 0 && (
            <button
              onClick={() => navigate(ENROLLMENT_NEW_PATH)}
              className="px-5 py-2.5 bg-[#F69220] text-white rounded-lg font-semibold hover:bg-[#E08210] transition-colors text-sm"
            >
              Nova Inscrição
            </button>
          )}
        </div>

        {/* Sem inscrições — banner apelativo */}
        {(!targets || targets.length === 0) && (
          <div className="relative overflow-hidden bg-gradient-to-br from-[#EBF4FF] to-[#F0F7FF] border border-[#BFDBFE] rounded-xl p-8 text-center">
            {/* Círculos decorativos */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#1565A8]/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#F69220]/5 rounded-full" />

            {/* Ícone */}
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-white border border-[#BFDBFE] rounded-2xl shadow-sm mb-5">
              <GraduationCap className="text-[#1565A8]" size={32} />
            </div>

            {/* Título */}
            <h3 className="text-[#0A3956] font-bold text-lg mb-2">
              Faça a sua inscrição para {currentYear}
            </h3>

            {/* Descrição */}
            <p className="text-[#6B7280] text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              Ainda não está inscrito para este ano lectivo. Inscreva-se agora
              para garantir o seu lugar e começar a preparação.
            </p>

            {/* Botão */}
            <button
              onClick={() => navigate(ENROLLMENT_NEW_PATH)}
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#F69220] hover:bg-[#E08210] text-white font-bold rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 text-sm"
            >
              <GraduationCap size={16} />
              Inscrever Agora
            </button>

            {/* Nota */}
            <p className="text-[#9CA3AF] text-xs mt-4">
              Processo rápido — menos de 2 minutos
            </p>
          </div>
        )}

        {/* Lista de inscrições */}
        <div className="space-y-4">
          {targets?.map((target) => {
            const isPaid = target.payment?.status === 'PAID'
            const isFull = target.scholarshipType === 'FULL'

            return (
              <div
                key={target.id}
                className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-5"
              >
                {/* Title row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#0A3956] text-white px-4 py-1 rounded-full text-[13px] font-bold">
                      Inscrição {target.year}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[target.status]}`}
                    >
                      {STATUS_LABELS[target.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#6B7280] text-xs">
                    <BookOpen size={14} />
                    <span>{target.subjectCount} disciplinas</span>
                  </div>
                </div>

                <div className="h-px bg-[#E5E7EB] my-4" />

                {/* Subjects */}
                <div className="mb-5">
                  <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-3">
                    DISCIPLINAS INSCRITAS
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {target.subjects?.map((s) => (
                      <span
                        key={s.id}
                        className="bg-[#E8EEF2] text-[#0A3956] px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {s.subject?.name || s.name || '—'}
                      </span>
                    ))}
                  </div>
                  {!isPaid && target.status === 'ACTIVE' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setEditSubjectsTarget(target)}
                        className="text-[#F69220] text-xs hover:underline"
                      >
                        ✏️ Editar disciplinas
                      </button>
                    </div>
                  )}
                  {isPaid && (
                    <p className="text-xs text-[#6B7280] italic mt-1">
                      Edição bloqueada — pagamento concluído.
                    </p>
                  )}
                </div>

                <div className="h-px bg-[#E5E7EB] my-4" />

                {/* Applications */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">
                      CANDIDATURAS A UNIVERSIDADES
                    </div>
                    <button
                      onClick={() => setModalTargetId(target.id)}
                      className="px-3 py-1 border border-[#F69220] text-[#F69220] rounded text-[11px] font-medium hover:bg-[#FFF4E6] transition-colors"
                    >
                      + Adicionar Candidatura
                    </button>
                  </div>

                  {target.applications?.length === 0 || !target.applications ? (
                    <div className="text-center py-6">
                      <GraduationCap
                        className="mx-auto text-[#D1D5DB] mb-2"
                        size={32}
                      />
                      <p className="text-[#6B7280] text-xs">
                        Nenhuma candidatura adicionada.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {target.applications.map((app) => (
                        <div
                          key={app.id}
                          className="bg-white border border-[#E5E7EB] rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-[#0A3956] text-sm">
                              {app.university?.name ||
                                app.customUniversity ||
                                'Universidade'}
                            </h4>
                            <button className="text-[#DC3545] hover:bg-red-50 p-1 rounded transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                                FACULDADE
                              </div>
                              <div className="text-[#1A1A2E] text-[13px]">
                                {app.faculty?.name || app.customFaculty || '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                                CURSO
                              </div>
                              <div className="text-[#1A1A2E] text-[13px]">
                                {app.course?.name || app.customCourse || '—'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-px bg-[#E5E7EB] my-4" />

                {/* Financial Info */}
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-3">
                    INFORMAÇÃO FINANCEIRA
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg">
                      <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2">
                        PREÇO BASE
                      </div>
                      <div className="text-[#1A1A2E] font-medium text-sm">
                        {formatCurrency(target.totalAmount)}
                      </div>
                    </div>
                    <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg">
                      <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2">
                        BOLSA
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          isFull
                            ? 'bg-[#D4EDDA] text-[#155724]'
                            : 'bg-[#FFF3CD] text-[#856404]'
                        }`}
                      >
                        {SCHOLARSHIP_LABELS[target.scholarshipType]}
                      </span>
                    </div>
                    <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg">
                      <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-2">
                        VALOR A PAGAR
                      </div>
                      <div className="text-[#0A3956] font-bold text-lg">
                        {formatCurrency(target.finalAmount)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B7280] italic">
                    Valor calculado com base nas disciplinas inscritas e bolsa
                    atribuída.
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modais */}
      {modalTargetId && (
        <AddApplicationModal
          targetId={modalTargetId}
          onClose={() => setModalTargetId(null)}
          onSuccess={handleApplicationSuccess}
        />
      )}
      {editSubjectsTarget && (
        <EditSubjectsModal
          target={editSubjectsTarget}
          onClose={() => setEditSubjectsTarget(null)}
          onSuccess={() => {
            setEditSubjectsTarget(null)
            onRefresh && onRefresh()
          }}
        />
      )}
    </>
  )
}
