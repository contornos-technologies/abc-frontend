import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Upload,
  Download,
  BookOpen,
  Clock,
  BarChart2,
  Layers,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  X,
  Check,
  Archive,
  MoreVertical,
  HelpCircle,
  ToggleLeft,
  AlignLeft,
  Loader2,
} from 'lucide-react'
import api from '../../services/api'

// ─── Constantes ───────────────────────────────────────────────────────────────

const SCORING_LABELS = {
  SIMPLE: 'Simples',
  WEIGHTED: 'Por Secções',
  DRAFT: 'Rascunho',
}
const QTYPE_LABELS = {
  MULTIPLE_CHOICE: 'Escolha Múltipla',
  TRUE_FALSE: 'Verdadeiro/Falso',
  SHORT_ANSWER: 'Resposta Curta',
}
const QTYPE_ICONS = {
  MULTIPLE_CHOICE: HelpCircle,
  TRUE_FALSE: ToggleLeft,
  SHORT_ANSWER: AlignLeft,
}

const SECTION_COLORS = [
  '#0A3956',
  '#F69220',
  '#28A745',
  '#DC3545',
  '#6610f2',
  '#20c997',
  '#fd7e14',
  '#0dcaf0',
  '#d63384',
]

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ExamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Tabs: 'questions' | 'stats'
  const [activeTab, setActiveTab] = useState('questions')

  // Modais
  const [modalQuestion, setModalQuestion] = useState(null)
  const [modalDelete, setModalDelete] = useState(null)
  const [modalImport, setModalImport] = useState(null)
  const [modalArchive, setModalArchive] = useState(false)
  const [modalPublish, setModalPublish] = useState(false)  // ✅ NOVO

  // ─── Carregar dados ──────────────────────────────────────────────────────

  const loadExam = async () => {
    setLoading(true)
    setError('')

    try {
      const ts = Date.now()

      const [examRes, qRes] = await Promise.all([
        api.get(`/admin/exams/${id}?t=${ts}`),
        api.get(`/admin/exams/${id}/questions?t=${ts}`),
      ])

      // Normalizar resposta — suporta { data: {...} } e {...} directamente
      const examData = examRes.data?.data ?? examRes.data

      // ✅ CORRIGIDO V12.5 — Bug principal: questões a 0 após import
      //
      // O endpoint GET /admin/exams/:id/questions devolve:
      //   { sections: [{ id, questions: [...] }], unassignedQuestions: [...] }
      // NÃO devolve um array plano — por isso qData era sempre [].
      //
      // Solução: extrair questões de dentro de cada secção (flatMap)
      // e garantir que cada questão tem sectionId (pode estar apenas na secção pai).
      const qRaw = qRes.data?.data ?? qRes.data

      const questoesDasSeccoes = Array.isArray(qRaw?.sections)
        ? qRaw.sections.flatMap((s) =>
            Array.isArray(s.questions)
              ? s.questions.map((q) => ({
                  ...q,
                  sectionId: q.sectionId ?? s.id,
                }))
              : []
          )
        : []

      const questoesSemSeccao = Array.isArray(qRaw?.unassignedQuestions)
        ? qRaw.unassignedQuestions
        : []

      const qData = [...questoesDasSeccoes, ...questoesSemSeccao]

      // DEBUG TEMPORÁRIO — apagar depois
      console.log(
        '[loadExam] sections:',
        examData?.sections?.map((s) => ({ id: s.id, name: s.name }))
      )
      console.log(
        '[loadExam] qData tipo:',
        typeof qData,
        Array.isArray(qData) ? 'é array' : 'NÃO é array'
      )
      console.log(
        '[loadExam] qData raw (primeiros 400 chars):',
        JSON.stringify(qRes.data).substring(0, 400)
      )
      console.log('[loadExam] questions sample:', qData.slice(0, 2))
      console.log(
        '[loadExam] total questões extraídas:',
        qData.length,
        '| das secções:',
        questoesDasSeccoes.length,
        '| sem secção:',
        questoesSemSeccao.length
      )

      if (!examData || typeof examData !== 'object' || !examData.id) {
        setError(
          'Resposta inválida do servidor. Verifica se o backend está a correr correctamente.'
        )
        setExam(null)
        return
      }

      setExam(examData)
      setQuestions(qData)
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/portal/acesso')
        return
      }
      if (err.response?.status === 404) {
        setError(
          'Prova não encontrada. Pode ter sido apagada ou o ID está incorrecto.'
        )
      } else {
        setError(
          `Não foi possível carregar a prova. ${err.response?.data?.error ?? err.message ?? ''}`
        )
      }
      setExam(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExam()
  }, [id])

  // ─── Arquivar ────────────────────────────────────────────────────────────

  const handleArchive = async () => {
    try {
      await api.patch(`/admin/exams/${id}/archive`)
      setModalArchive(false)
      loadExam()
    } catch (err) {
      if (err.response?.status === 401) navigate('/portal/acesso')
    }
  }

  // ─── Publicar ────────────────────────────────────────────────────────────  // ✅ NOVO

  const handlePublish = async ({ scoringMode, isPublic }) => {
    try {
      await api.put(`/admin/exams/${id}`, { scoringMode, isPublic })
      setModalPublish(false)
      loadExam()
    } catch (err) {
      if (err.response?.status === 401) navigate('/portal/acesso')
    }
  }

  // ─── Apagar questão ──────────────────────────────────────────────────────

  const handleDeleteQuestion = async (qId) => {
    try {
      await api.delete(`/admin/questions/${qId}`)
      setQuestions((qs) => qs.filter((q) => q.id !== qId))
      setModalDelete(null)
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/portal/acesso')
        return
      }
      if (err.response?.status === 409) {
        setModalDelete(null)
        setError(
          'Esta questão tem respostas de estudantes e não pode ser apagada.'
        )
      }
    }
  }

  // ─── Agrupar questões por secção ─────────────────────────────────────────

  const getSectionColor = (idx) => SECTION_COLORS[idx % SECTION_COLORS.length]

  const sections = exam?.sections ?? []
  const questionsBySectionId = {}
  questions.forEach((q) => {
    const sid = q.sectionId ?? q.section?.id ?? '__none__'
    if (!questionsBySectionId[sid]) questionsBySectionId[sid] = []
    questionsBySectionId[sid].push(q)
  })

  // ─── Loading ─────────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />

  if (error || !exam)
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => navigate('/admin/exams')}
              style={btnSecondary}
            >
              <ArrowLeft size={14} /> Voltar às Provas
            </button>
          </div>
          <ErrorCard
            message={error || 'Não foi possível carregar a prova.'}
            onRetry={loadExam}
          />
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: '#6C757D',
              textAlign: 'center',
            }}
          >
            ID da prova:{' '}
            <code
              style={{
                background: '#F0F0F0',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              {id}
            </code>
          </div>
        </div>
      </div>
    )

  const totalQuestions = questions.length
  const disciplinas = [
    ...new Set(sections.map((s) => s.subject?.name).filter(Boolean)),
  ]

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* ── Erro global (não-bloqueante) ── */}
        {error && (
          <div style={errorBanner}>
            <AlertCircle size={15} /> {error}
            <button
              onClick={() => setError('')}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#DC3545',
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Cabeçalho ── */}
        <ExamHeader
          exam={exam}
          totalQuestions={totalQuestions}
          disciplinas={disciplinas}
          onBack={() => navigate('/admin/exams')}
          onArchive={() => setModalArchive(true)}
          onPublish={() => setModalPublish(true)}
        />

        {/* ── KPIs ── */}
        <KPIRow
          exam={exam}
          totalQuestions={totalQuestions}
          disciplinas={disciplinas}
        />

        {/* ── Tabs ── */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            marginBottom: 0,
            borderBottom: '2px solid #DEE2E6',
          }}
        >
          {[
            { key: 'questions', label: 'Questões', count: totalQuestions },
            { key: 'stats', label: 'Estatísticas' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 20px',
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === tab.key ? '#0A3956' : '#6C757D',
                borderBottom:
                  activeTab === tab.key
                    ? '2px solid #0A3956'
                    : '2px solid transparent',
                marginBottom: -2,
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  style={{
                    background: activeTab === tab.key ? '#0A3956' : '#DEE2E6',
                    color: activeTab === tab.key ? 'white' : '#6C757D',
                    borderRadius: 20,
                    padding: '1px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Conteúdo da Tab ── */}
        <div style={{ marginTop: 24 }}>
          {activeTab === 'questions' && (
            <QuestionsTab
              exam={exam}
              sections={sections}
              questionsBySectionId={questionsBySectionId}
              getSectionColor={getSectionColor}
              onAddQuestion={(sectionId) =>
                setModalQuestion({ mode: 'create', sectionId })
              }
              onEditQuestion={(question) =>
                setModalQuestion({
                  mode: 'edit',
                  sectionId: question.sectionId ?? question.section?.id,
                  question,
                })
              }
              onDeleteQuestion={(qId) => setModalDelete(qId)}
              onImportSection={(sectionId, sectionName) =>
                setModalImport({ sectionId, sectionName })
              }
            />
          )}
          {activeTab === 'stats' && (
            <StatsTab examId={id} navigate={navigate} />
          )}
        </div>
      </div>

      {/* ── Modais ── */}
      {modalQuestion && (
        <QuestionModal
          mode={modalQuestion.mode}
          sectionId={modalQuestion.sectionId}
          question={modalQuestion.question}
          examId={id}
          scoringMode={exam?.scoringMode}
          onClose={() => setModalQuestion(null)}
          onSaved={(q) => {
            if (modalQuestion.mode === 'create') {
              setQuestions((qs) => [...qs, q])
            } else {
              setQuestions((qs) => qs.map((x) => (x.id === q.id ? q : x)))
            }
            setModalQuestion(null)
          }}
          navigate={navigate}
        />
      )}

      {modalDelete && (
        <ConfirmModal
          title="Apagar Questão"
          message="Tens a certeza que queres apagar esta questão? Esta acção não pode ser desfeita."
          confirmLabel="Apagar"
          confirmColor="#DC3545"
          onConfirm={() => handleDeleteQuestion(modalDelete)}
          onCancel={() => setModalDelete(null)}
        />
      )}

      {modalImport && (
        <ImportModal
          examId={id}
          sectionId={modalImport.sectionId}
          sectionName={modalImport.sectionName}
          onClose={() => setModalImport(null)}
          onImported={async () => {
            setModalImport(null)
            await loadExam()
          }}
          navigate={navigate}
        />
      )}

      {modalArchive && (
        <ConfirmModal
          title="Arquivar Prova"
          message="A prova ficará arquivada e deixará de estar disponível para os estudantes. Podes desarquivá-la mais tarde."
          confirmLabel="Arquivar"
          confirmColor="#F69220"
          onConfirm={handleArchive}
          onCancel={() => setModalArchive(false)}
        />
      )}

      {/* ✅ NOVO — Modal de publicação */}
      {modalPublish && (
        <PublishModal
          exam={exam}
          onConfirm={handlePublish}
          onCancel={() => setModalPublish(false)}
        />
      )}
    </div>
  )
}

// ─── ExamHeader ───────────────────────────────────────────────────────────────

function ExamHeader({ exam, totalQuestions, disciplinas, onBack, onArchive, onPublish }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <button onClick={onBack} style={btnSecondary}>
          <ArrowLeft size={14} /> Voltar
        </button>
        {exam?.isArchived && (
          <span
            style={{
              background: '#FFF3CD',
              border: '1px solid #F69220',
              color: '#856404',
              borderRadius: 20,
              padding: '3px 12px',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Arquivada
          </span>
        )}
        {exam?.isPublic ? (
          <span
            style={{
              background: '#D1E7DD',
              border: '1px solid #28A745',
              color: '#0F5132',
              borderRadius: 20,
              padding: '3px 12px',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Eye size={11} /> Pública
          </span>
        ) : (
          <span
            style={{
              background: '#F8F9FA',
              border: '1px solid #DEE2E6',
              color: '#6C757D',
              borderRadius: 20,
              padding: '3px 12px',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <EyeOff size={11} /> Privada
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#0A3956',
              margin: '0 0 6px',
            }}
          >
            {exam?.title}
          </h1>
          {exam?.description && (
            <p
              style={{
                fontSize: 13,
                color: '#6C757D',
                margin: '0 0 10px',
                maxWidth: 600,
              }}
            >
              {exam.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {disciplinas.map((d) => (
              <span
                key={d}
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1e40af',
                  borderRadius: 20,
                  padding: '3px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* ✅ ALTERADO — botões de acção */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {!exam?.isArchived && !exam?.isPublic && (
            <button
              onClick={onPublish}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: '#28A745',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Eye size={14} /> Publicar Prova
            </button>
          )}
          {!exam?.isArchived && (
            <button
              onClick={onArchive}
              style={{
                ...btnSecondary,
                color: '#F69220',
                borderColor: '#F6922050',
              }}
            >
              <Archive size={14} /> Arquivar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── KPI Row ──────────────────────────────────────────────────────────────────

function KPIRow({ exam, totalQuestions, disciplinas }) {
  const kpis = [
    {
      label: 'Questões',
      value: totalQuestions,
      color: '#0A3956',
      icon: BookOpen,
    },
    {
      label: 'Duração',
      value: `${exam?.duration} min`,
      color: '#0A3956',
      icon: Clock,
    },
    {
      label: 'Disciplinas',
      value: disciplinas.length || '—',
      color: '#0A3956',
      icon: Layers,
    },
    {
      label: 'Avaliação',
      value: SCORING_LABELS[exam?.scoringMode] ?? '—',
      color: '#0A3956',
      icon: BarChart2,
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
        marginBottom: 28,
      }}
    >
      {kpis.map((k, i) => {
        const Icon = k.icon
        const isFirst = i === 0
        return (
          <div
            key={k.label}
            style={{
              background: 'white',
              borderRadius: 12,
              border: '1px solid #DEE2E6',
              borderTop: `3px solid ${isFirst ? '#F69220' : k.color}`,
              padding: '16px 18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 8,
              }}
            >
              <Icon size={14} color={isFirst ? '#F69220' : k.color} />
              <span
                style={{
                  fontSize: 11,
                  color: '#6C757D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                }}
              >
                {k.label}
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0A3956' }}>
              {k.value}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Questions Tab ────────────────────────────────────────────────────────────

function QuestionsTab({
  exam,
  sections,
  questionsBySectionId,
  getSectionColor,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onImportSection,
}) {
  if (sections.length === 0) {
    return (
      <div
        style={{ textAlign: 'center', padding: '60px 20px', color: '#6C757D' }}
      >
        <Layers size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
          Esta prova não tem secções
        </div>
        <div style={{ fontSize: 13 }}>
          As secções são criadas na página de criação da prova.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {sections.map((section, idx) => {
        const color = getSectionColor(idx)
        const sectionQuestions = questionsBySectionId[section.id] ?? []
        return (
          <SectionBlock
            key={section.id}
            section={section}
            color={color}
            questions={sectionQuestions}
            scoringMode={exam?.scoringMode}
            weightType={exam?.weightType}
            onAddQuestion={() => onAddQuestion(section.id)}
            onEditQuestion={onEditQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onImport={() => onImportSection(section.id, section.name)}
          />
        )
      })}
    </div>
  )
}

// ─── Section Block ────────────────────────────────────────────────────────────

function SectionBlock({
  section,
  color,
  questions,
  scoringMode,
  weightType,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onImport,
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 14,
        border: '1px solid #DEE2E6',
        borderTop: `4px solid ${color}`,
        overflow: 'hidden',
      }}
    >
      {/* Cabeçalho da Secção */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: `${color}06`,
          borderBottom: collapsed ? 'none' : '1px solid #DEE2E6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6C757D',
              display: 'flex',
            }}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* ✅ CORRIGIDO V12.5: String() evita crash "Objects are not valid as React child" */}
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0A3956' }}>
                {String(section.name ?? '')}
              </span>
              <span
                style={{
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  color,
                  borderRadius: 20,
                  padding: '2px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {String(section.subject?.name ?? '')}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#6C757D', marginTop: 2 }}>
              {questions.length}{' '}
              {questions.length === 1 ? 'questão' : 'questões'}
              {scoringMode === 'WEIGHTED' && section.weight != null && (
                <>
                  {' '}
                  ·{' '}
                  <strong style={{ color }}>
                    {section.weight}
                    {weightType === 'PERCENTAGE' ? '%' : ' pts'}
                  </strong>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Botões de acção por secção */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={onImport}
            title={`Importar questões para ${section.name}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'white',
              color: '#6C757D',
              border: '1.5px solid #DEE2E6',
              borderRadius: 8,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FileSpreadsheet size={13} /> Importar Excel/JSON
          </button>
          <button
            onClick={onAddQuestion}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: color,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={13} /> Adicionar Questão
          </button>
        </div>
      </div>

      {/* Lista de Questões */}
      {!collapsed && (
        <div>
          {questions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 20px',
                color: '#6C757D',
              }}
            >
              <HelpCircle size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                Nenhuma questão nesta secção
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Clica em "Adicionar Questão" ou "Importar Excel/JSON" para
                começar
              </div>
            </div>
          ) : (
            questions.map((q, qIdx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={qIdx + 1}
                color={color}
                onEdit={() => onEditQuestion(q)}
                onDelete={() => onDeleteQuestion(q.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({ question, index, color, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = QTYPE_ICONS[question.questionType] ?? HelpCircle

  // Ordenar opções TRUE_FALSE para garantir Verdadeiro no índice 0
  const sortedOptions =
    question.questionType === 'TRUE_FALSE' && question.options?.length > 0
      ? [...question.options].sort((a, b) =>
          a.content === 'Verdadeiro' ? -1 : 1
        )
      : question.options

  return (
    <div
      style={{
        borderBottom: '1px solid #F0F0F0',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          padding: '14px 20px',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Número */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            flexShrink: 0,
            background: `${color}15`,
            border: `1.5px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color,
          }}
        >
          {index}
        </div>

        {/* Enunciado */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              color: '#374151',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {/* ✅ CORRIGIDO V12.5: String() evita crash "Objects are not valid as React child" */}
            {String(question.content ?? '')}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 6,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: '#F8F9FA',
                border: '1px solid #DEE2E6',
                borderRadius: 20,
                padding: '2px 9px',
                fontSize: 11,
                color: '#6C757D',
              }}
            >
              <Icon size={10} /> {QTYPE_LABELS[question.questionType]}
            </span>
            {sortedOptions?.length > 0 && (
              <span style={{ fontSize: 11, color: '#6C757D' }}>
                {sortedOptions.length} opções
              </span>
            )}
          </div>
        </div>

        {/* Acções */}
        <div
          style={{ display: 'flex', gap: 6, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onEdit} style={iconBtn('#0A3956')}>
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} style={iconBtn('#DC3545')}>
            <Trash2 size={13} />
          </button>
          <div
            style={{
              marginLeft: 4,
              color: '#6C757D',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Opções expandidas */}
      {expanded &&
        question.questionType !== 'SHORT_ANSWER' &&
        sortedOptions?.length > 0 && (
          <div
            style={{
              padding: '0 20px 16px 62px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {sortedOptions.map((opt, i) => (
              <div
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: opt.isCorrect ? '#D1E7DD' : '#F8F9FA',
                  border: `1px solid ${opt.isCorrect ? '#28A745' : '#DEE2E6'}`,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: opt.isCorrect ? '#28A745' : '#DEE2E6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: opt.isCorrect ? 'white' : '#6C757D',
                  }}
                >
                  {opt.isCorrect ? (
                    <Check size={11} />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: opt.isCorrect ? '#0F5132' : '#374151',
                    fontWeight: opt.isCorrect ? 600 : 400,
                  }}
                >
                  {/* ✅ CORRIGIDO V12.5: String() evita crash "Objects are not valid as React child" */}
                  {String(opt.content ?? '')}
                </span>
                {opt.isCorrect && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      color: '#28A745',
                      fontWeight: 600,
                    }}
                  >
                    Correcta
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  )
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────

function StatsTab({ examId, navigate }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics/exams/average-scores'),
      api.get('/admin/analytics/exams/score-distribution'),
    ])
      .then(([avgRes, distRes]) => {
        const avgs = avgRes.data?.data ?? avgRes.data ?? []
        const dists = distRes.data?.data ?? distRes.data ?? []
        const avgEntry = Array.isArray(avgs)
          ? avgs.find((e) => e.examId === examId)
          : null
        const distEntry = Array.isArray(dists)
          ? dists.find((e) => e.examId === examId)
          : null
        setStats({ avg: avgEntry, dist: distEntry })
      })
      .catch((err) => {
        if (err.response?.status === 401) navigate('/portal/acesso')
        setStats({})
      })
      .finally(() => setLoading(false))
  }, [examId])

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: '#6C757D',
          padding: 40,
          justifyContent: 'center',
        }}
      >
        <Loader2 size={18} className="animate-spin" /> A carregar
        estatísticas...
      </div>
    )

  if (!stats?.avg && !stats?.dist)
    return (
      <div
        style={{ textAlign: 'center', padding: '60px 20px', color: '#6C757D' }}
      >
        <BarChart2 size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
          Sem dados ainda
        </div>
        <div style={{ fontSize: 13 }}>
          As estatísticas aparecem quando os estudantes fizerem esta prova.
        </div>
      </div>
    )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {stats.avg && (
        <div style={cardStyle}>
          <div style={cardLabel}>Nota Média</div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#0A3956',
              margin: '8px 0 4px',
            }}
          >
            {Number(stats.avg.averageScore ?? 0).toFixed(1)}
            <span style={{ fontSize: 16, color: '#6C757D', fontWeight: 400 }}>
              {' '}
              / 20
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#6C757D' }}>
            {stats.avg.totalAttempts ?? 0} tentativas submetidas
          </div>
        </div>
      )}
      {stats.dist && (
        <div style={cardStyle}>
          <div style={cardLabel}>Distribuição de Notas</div>
          <ScoreDistBar distribution={stats.dist} />
        </div>
      )}
    </div>
  )
}

function ScoreDistBar({ distribution }) {
  const ranges = [
    { label: '0–5', key: 'range_0_5', color: '#DC3545' },
    { label: '5–10', key: 'range_5_10', color: '#F69220' },
    { label: '10–15', key: 'range_10_15', color: '#0A3956' },
    { label: '15–20', key: 'range_15_20', color: '#28A745' },
  ]
  const total = ranges.reduce((s, r) => s + (distribution[r.key] ?? 0), 0)

  return (
    <div style={{ marginTop: 12 }}>
      {ranges.map((r) => {
        const val = distribution[r.key] ?? 0
        const pct = total > 0 ? Math.round((val / total) * 100) : 0
        return (
          <div
            key={r.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                width: 36,
                fontSize: 12,
                color: '#6C757D',
                textAlign: 'right',
              }}
            >
              {r.label}
            </span>
            <div
              style={{
                flex: 1,
                background: '#F0F0F0',
                borderRadius: 4,
                height: 14,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: r.color,
                  borderRadius: 4,
                  transition: 'width 0.5s',
                }}
              />
            </div>
            <span
              style={{
                width: 28,
                fontSize: 12,
                fontWeight: 600,
                color: r.color,
              }}
            >
              {val}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Modal: Criar/Editar Questão ─────────────────────────────────────────────

function QuestionModal({
  mode,
  sectionId,
  question,
  examId,
  scoringMode,
  onClose,
  onSaved,
  navigate,
}) {
  const isEdit = mode === 'edit'

  const initOptions = () => {
    if (!question?.options?.length) {
      return [
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
      ]
    }
    if (question.questionType === 'TRUE_FALSE') {
      return [...question.options]
        .sort((a, b) => (a.content === 'Verdadeiro' ? -1 : 1))
        .map((o) => ({ content: o.content, isCorrect: o.isCorrect }))
    }
    return question.options.map((o) => ({
      content: o.content,
      isCorrect: o.isCorrect,
    }))
  }

  const [qType, setQType] = useState(
    question?.questionType ?? 'MULTIPLE_CHOICE'
  )
  const [content, setContent] = useState(question?.content ?? '')
  const [options, setOptions] = useState(initOptions)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setCorrect = (idx) =>
    setOptions((opts) => opts.map((o, i) => ({ ...o, isCorrect: i === idx })))
  const updateOption = (idx, val) =>
    setOptions((opts) =>
      opts.map((o, i) => (i === idx ? { ...o, content: val } : o))
    )
  const addOption = () =>
    setOptions((o) => [...o, { content: '', isCorrect: false }])
  const removeOption = (idx) => setOptions((o) => o.filter((_, i) => i !== idx))

  const validate = () => {
    if (!content.trim()) return 'O enunciado da questão é obrigatório.'
    if (qType === 'MULTIPLE_CHOICE') {
      if (options.length < 2) return 'Adiciona pelo menos 2 opções.'
      if (options.some((o) => !o.content.trim()))
        return 'Preenche todas as opções.'
      if (!options.some((o) => o.isCorrect)) return 'Marca a opção correcta.'
    }
    if (qType === 'TRUE_FALSE') {
      if (!options.some((o) => o.isCorrect))
        return 'Indica se é Verdadeiro ou Falso.'
    }
    return ''
  }

  const handleSave = async () => {
    const e = validate()
    if (e) {
      setError(e)
      return
    }
    setSaving(true)
    setError('')
    try {
      let payload = { content: content.trim(), questionType: qType, sectionId }
      if (qType === 'MULTIPLE_CHOICE') payload.options = options
      if (qType === 'TRUE_FALSE')
        payload.options = [
          { content: 'Verdadeiro', isCorrect: options[0]?.isCorrect ?? false },
          { content: 'Falso', isCorrect: !(options[0]?.isCorrect ?? false) },
        ]

      let res
      if (isEdit) {
        res = await api.put(`/admin/questions/${question.id}`, payload)
      } else {
        res = await api.post(`/admin/exams/${examId}/questions`, payload)
      }
      const saved = res.data?.data ?? res.data
      onSaved(saved)
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/portal/acesso')
        return
      }
      setError(err.response?.data?.error || 'Erro ao guardar questão.')
      setSaving(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: 'white',
          borderRadius: 16,
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #DEE2E6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: '#0A3956',
            }}
          >
            {isEdit ? 'Editar Questão' : 'Nova Questão'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6C757D',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{ ...errorBanner, marginBottom: 16 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Tipo */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Tipo de Questão</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                marginTop: 6,
              }}
            >
              {Object.entries(QTYPE_LABELS).map(([val, label]) => {
                const Icon = QTYPE_ICONS[val]
                const sel = qType === val
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setQType(val)
                      setError('')
                    }}
                    style={{
                      background: sel ? '#0A395608' : 'white',
                      border: `2px solid ${sel ? '#0A3956' : '#DEE2E6'}`,
                      borderRadius: 8,
                      padding: '10px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: sel ? '#0A3956' : '#6C757D',
                    }}
                  >
                    <Icon size={13} /> {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Enunciado */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              Enunciado <span style={{ color: '#DC3545' }}>*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreve a questão aqui..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', marginTop: 6 }}
            />
          </div>

          {/* MULTIPLE_CHOICE */}
          {qType === 'MULTIPLE_CHOICE' && (
            <div>
              <label style={labelStyle}>
                Opções de Resposta <span style={{ color: '#DC3545' }}>*</span>
              </label>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {options.map((opt, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <button
                      type="button"
                      onClick={() => setCorrect(i)}
                      title="Marcar como correcta"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        flexShrink: 0,
                        border: `2px solid ${opt.isCorrect ? '#28A745' : '#DEE2E6'}`,
                        background: opt.isCorrect ? '#28A745' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.isCorrect && <Check size={12} color="white" />}
                    </button>
                    <input
                      value={opt.content}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Opção ${String.fromCharCode(65 + i)}`}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(i)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#DC3545',
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'none',
                      border: '1.5px dashed #DEE2E6',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#6C757D',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={13} /> Adicionar opção
                  </button>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#6C757D', marginTop: 8 }}>
                Clica no círculo para marcar a resposta correcta
              </div>
            </div>
          )}

          {/* TRUE_FALSE */}
          {qType === 'TRUE_FALSE' && (
            <div>
              <label style={labelStyle}>Resposta Correcta</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {['Verdadeiro', 'Falso'].map((label, i) => {
                  const sel =
                    i === 0 ? options[0]?.isCorrect : !options[0]?.isCorrect
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        setOptions([
                          { content: 'Verdadeiro', isCorrect: i === 0 },
                          { content: 'Falso', isCorrect: i === 1 },
                        ])
                      }
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: `2px solid ${sel ? '#0A3956' : '#DEE2E6'}`,
                        background: sel ? '#0A395608' : 'white',
                        fontWeight: 600,
                        fontSize: 13,
                        color: sel ? '#0A3956' : '#6C757D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      {sel && <Check size={13} />}
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* SHORT_ANSWER */}
          {qType === 'SHORT_ANSWER' && (
            <div
              style={{
                background: '#F8F9FA',
                borderRadius: 8,
                padding: 14,
                fontSize: 13,
                color: '#6C757D',
              }}
            >
              <AlignLeft size={14} style={{ marginRight: 6 }} />
              As questões de resposta curta não têm opções — o estudante escreve
              a resposta livremente.
            </div>
          )}
        </div>

        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #DEE2E6',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button onClick={onClose} style={btnGhost}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? (
              'A guardar...'
            ) : (
              <>
                <Check size={14} />{' '}
                {isEdit ? 'Guardar Alterações' : 'Criar Questão'}
              </>
            )}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

// ─── Modal: Importar Excel (por secção) ──────────────────────────────────────

function ImportModal({
  examId,
  sectionId,
  sectionName,
  onClose,
  onImported,
  navigate,
}) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handleDownloadTemplate = async () => {
    try {
      const params = sectionId ? `?sectionId=${sectionId}` : ''
      const res = await api.get(
        `/admin/exams/${examId}/questions/import/template${params}`,
        { responseType: 'blob' }
      )
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const safeName = sectionName
        ? sectionName.replace(/[^a-zA-Z0-9]/g, '_')
        : 'template'
      a.href = url
      a.download = `template_${safeName}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      if (err.response?.status === 401) navigate('/portal/acesso')
      setError('Não foi possível descarregar o template.')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      // ✅ CORRIGIDO V12.5: NÃO passar Content-Type manual — o browser define o boundary automaticamente.
      // Passar { headers: { 'Content-Type': 'multipart/form-data' } } corrompe o boundary
      // e o multer não consegue ler o ficheiro (req.file chega undefined no backend).
      const res = await api.post(
        `/admin/exams/${examId}/questions/import`,
        formData
      )
      setResult(res.data?.data ?? res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/portal/acesso')
        return
      }
      setError(err.response?.data?.error || 'Erro ao importar ficheiro.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'white',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #DEE2E6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileSpreadsheet size={18} color="#0A3956" />
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0A3956',
                  lineHeight: 1.2,
                }}
              >
                Importar Questões via Excel/JSON
              </h2>
              {sectionName && (
                <div style={{ fontSize: 12, color: '#6C757D', marginTop: 2 }}>
                  Secção:{' '}
                  <strong style={{ color: '#0A3956' }}>{sectionName}</strong>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6C757D',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {!result ? (
            <>
              {sectionName && (
                <div
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 12,
                    color: '#1e40af',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <CheckCircle2
                    size={14}
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <span>
                    O template já vem com a coluna <strong>sectionId</strong>{' '}
                    pré-preenchida para a secção <strong>{sectionName}</strong>.
                    Não precisas de alterar essa coluna.
                  </span>
                </div>
              )}

              {/* Passo 1 */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#0A3956',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    1
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: '#0A3956' }}
                  >
                    Descarrega o template Excel
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: '#6C757D',
                    margin: '0 0 10px 30px',
                  }}
                >
                  O template já tem o formato correcto com as colunas
                  necessárias
                  {sectionName && (
                    <>
                      {' '}
                      e a secção <strong>{sectionName}</strong> pré-selecionada
                    </>
                  )}
                  .
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  style={{ ...btnSecondary, marginLeft: 30 }}
                >
                  <Download size={13} /> Descarregar Template
                </button>
              </div>

              <div
                style={{ borderTop: '1px solid #F0F0F0', margin: '0 0 20px' }}
              />

              {/* Passo 2 */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#0A3956',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    2
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: '#0A3956' }}
                  >
                    Preenche e faz upload do ficheiro
                  </span>
                </div>

                {error && (
                  <div style={{ ...errorBanner, marginBottom: 12 }}>
                    <AlertCircle size={13} /> {error}
                  </div>
                )}

                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    marginLeft: 30,
                    border: `2px dashed ${file ? '#0A3956' : '#DEE2E6'}`,
                    borderRadius: 10,
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: file ? '#0A395605' : 'white',
                    transition: 'all 0.15s',
                  }}
                >
                  {file ? (
                    <>
                      <FileSpreadsheet
                        size={28}
                        color="#0A3956"
                        style={{ marginBottom: 8 }}
                      />
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0A3956',
                        }}
                      >
                        {file.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#6C757D' }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload
                        size={28}
                        color="#DEE2E6"
                        style={{ marginBottom: 8 }}
                      />
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#6C757D',
                        }}
                      >
                        Clica para seleccionar o ficheiro
                      </div>
                      <div style={{ fontSize: 12, color: '#B0B0B0' }}>
                        .xlsx ou .json
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    setFile(e.target.files[0])
                    setError('')
                  }}
                />
              </div>
            </>
          ) : (
            /* Resultado */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle2
                size={40}
                color="#28A745"
                style={{ marginBottom: 12 }}
              />
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#0A3956',
                  marginBottom: 6,
                }}
              >
                Importação concluída!
              </div>
              <div style={{ fontSize: 13, color: '#6C757D' }}>
                {result.summary?.imported ??
                  result.imported?.length ??
                  result.count ??
                  '?'}{' '}
                questões importadas
                {sectionName && (
                  <>
                    {' '}
                    para <strong>{sectionName}</strong>
                  </>
                )}
                .
              </div>
              {result.errors?.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    background: '#FFF5F5',
                    border: '1px solid #DC3545',
                    borderRadius: 8,
                    padding: 12,
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#DC3545',
                      marginBottom: 6,
                    }}
                  >
                    Linhas com erros:
                  </div>
                  {result.errors.map((e, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12,
                        color: '#DC3545',
                        marginBottom: 4,
                      }}
                    >
                      • Linha {e.linha}
                      {e.content ? ` — "${e.content}"` : ''}:{' '}
                      {Array.isArray(e.erros)
                        ? e.erros.join(', ')
                        : String(e.erros)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #DEE2E6',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          {result ? (
            <button onClick={onImported} style={btnPrimary}>
              <Check size={14} /> Fechar e Actualizar
            </button>
          ) : (
            <>
              <button onClick={onClose} style={btnGhost}>
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                style={{ ...btnPrimary, opacity: !file || uploading ? 0.6 : 1 }}
              >
                {uploading ? (
                  'A importar...'
                ) : (
                  <>
                    <Upload size={14} /> Importar
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </Overlay>
  )
}

// ─── Modal: Confirmação ───────────────────────────────────────────────────────

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}) {
  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'white',
          borderRadius: 16,
          padding: 28,
        }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0A3956',
            marginTop: 0,
            marginBottom: 10,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: '#6C757D',
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnGhost}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{ ...btnPrimary, background: confirmColor }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

// ─── Modal: Publicar Prova ────────────────────────────────────────────────────  // ✅ NOVO

function PublishModal({ exam, onConfirm, onCancel }) {
  const isDraft = exam?.scoringMode === 'DRAFT'
  const [scoringMode, setScoringMode] = useState(isDraft ? 'SIMPLE' : exam?.scoringMode)
  const [saving, setSaving] = useState(false)

  const handleConfirm = async () => {
    setSaving(true)
    await onConfirm({ scoringMode, isPublic: true })
    setSaving(false)
  }

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'white',
          borderRadius: 16,
          padding: 28,
        }}
      >
        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Eye size={18} color="#28A745" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0A3956', margin: 0 }}>
            Publicar Prova
          </h2>
        </div>

        <p style={{ fontSize: 13, color: '#6C757D', marginBottom: 20, lineHeight: 1.6 }}>
          A prova ficará visível e disponível para os estudantes fazerem simulações.
          Esta acção pode ser revertida arquivando a prova.
        </p>

        {/* Escolha do modo de avaliação — só se ainda for DRAFT */}
        {isDraft && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0A3956', marginBottom: 10 }}>
              Modo de Avaliação
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { value: 'SIMPLE', label: 'Simples', desc: 'Todas as questões valem igual' },
                { value: 'WEIGHTED', label: 'Por Secções', desc: 'Cada secção tem peso diferente' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScoringMode(opt.value)}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    border: `2px solid ${scoringMode === opt.value ? '#0A3956' : '#DEE2E6'}`,
                    background: scoringMode === opt.value ? '#0A395608' : 'white',
                    borderRadius: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0A3956', marginBottom: 2 }}>
                    {scoringMode === opt.value && <Check size={12} style={{ marginRight: 4, display: 'inline' }} />}
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#6C757D' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnGhost}>
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            style={{
              ...btnPrimary,
              background: '#28A745',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Eye size={14} /> {saving ? 'A publicar...' : 'Publicar'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

// ─── Overlay ──────────────────────────────────────────────────────────────────

function Overlay({ children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {children}
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  const sk = (w, h, r = 8) => (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: '#E9ECEF',
        animation: 'pulse 1.5s infinite',
      }}
    />
  )
  return (
    <div style={pageStyle}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {sk(80, 34)}
          {sk(200, 28)}
        </div>
        {sk('100%', 80, 12)}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 14,
            marginTop: 20,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>{sk('100%', 80, 12)}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorCard({ message, onRetry }) {
  return (
    <div
      style={{
        background: '#FFF5F5',
        border: '1px solid #DC3545',
        borderRadius: 12,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <AlertCircle size={28} color="#DC3545" style={{ marginBottom: 10 }} />
      <div
        style={{
          fontSize: 14,
          color: '#DC3545',
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        {message}
      </div>
      <button onClick={onRetry} style={btnPrimary}>
        Tentar novamente
      </button>
    </div>
  )
}

// ─── Estilos base ─────────────────────────────────────────────────────────────

const pageStyle = { background: '#F8F9FA', minHeight: '100vh', padding: 24 }
const cardStyle = {
  background: 'white',
  borderRadius: 12,
  border: '1px solid #DEE2E6',
  padding: '18px 20px',
}
const cardLabel = {
  fontSize: 11,
  fontWeight: 600,
  color: '#6C757D',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}
const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1.5px solid #DEE2E6',
  borderRadius: 8,
  fontSize: 13,
  color: '#374151',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'white',
}
const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#0A3956',
  display: 'block',
}
const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  background: '#0A3956',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '10px 20px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}
const btnSecondary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  background: 'white',
  color: '#0A3956',
  border: '1.5px solid #DEE2E6',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}
const btnGhost = {
  background: 'none',
  border: 'none',
  color: '#6C757D',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  padding: '10px 14px',
}
const errorBanner = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  background: '#fff5f5',
  border: '1px solid #DC3545',
  borderRadius: 8,
  padding: '10px 14px',
  color: '#DC3545',
  fontSize: 13,
}
const iconBtn = (color) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color,
  padding: '5px',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
})
