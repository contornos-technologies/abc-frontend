import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Clock,
  Send,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowLeft,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// ─── KaTeX helpers ────────────────────────────────────────────────────────────

function renderLatex(text) {
  if (!text) return ''

  let result = text

  // $$...$$ — display mode (bloco)
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), {
        displayMode: true,
        throwOnError: false,
        trust: true,
      })
    } catch {
      return _
    }
  })

  // $...$ — inline mode
  result = result.replace(/\$([^$\n]+?)\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), {
        displayMode: false,
        throwOnError: false,
        trust: true,
      })
    } catch {
      return _
    }
  })

  return result
}

function MathText({ text, className = '' }) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderLatex(text) }}
    />
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ATTEMPT_KEY = 'abc_attempt_id'
const OPTION_LABELS = ['A', 'B', 'C', 'D']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function Shimmer({ className = '' }) {
  return (
    <div className={`animate-pulse bg-[#E7EDF5] rounded-lg ${className}`} />
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F4F8FC]">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E7EDF5] h-16 flex items-center px-6 gap-4 shadow-sm">
        <Shimmer className="h-6 w-48 rounded-full" />
        <div className="flex-1" />
        <Shimmer className="h-10 w-28 rounded-xl" />
        <div className="flex-1" />
        <Shimmer className="h-9 w-28 rounded-full" />
      </div>
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-[#E7EDF5] h-12 flex items-center px-6 gap-6">
        {['w-20', 'w-16', 'w-16'].map((w, i) => (
          <Shimmer key={i} className={`h-4 ${w}`} />
        ))}
      </div>
      <div className="pt-28 pb-20 px-4 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#E7EDF5] p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between mb-5">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-7 w-24 rounded-full" />
          </div>
          <Shimmer className="h-5 w-full mb-2" />
          <Shimmer className="h-5 w-3/4 mb-7" />
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#E7EDF5]"
              >
                <Shimmer className="w-8 h-8 rounded-full flex-shrink-0" />
                <Shimmer className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7EDF5] h-16 flex items-center justify-between px-6">
        <Shimmer className="h-8 w-24 rounded-full" />
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Shimmer key={i} className="w-2.5 h-2.5 rounded-full" />
          ))}
        </div>
        <Shimmer className="h-8 w-24 rounded-full" />
      </div>
    </div>
  )
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({ simulation, timeLeft, answeredCount, totalCount, onSubmit }) {
  const isUnderFiveMin = timeLeft < 300
  const isUnderOneMin = timeLeft < 60

  const timerColor = isUnderOneMin
    ? 'text-[#DC3545]'
    : isUnderFiveMin
      ? 'text-[#F7941D]'
      : 'text-[#071C35]'
  const timerBg = isUnderOneMin
    ? 'bg-red-50 border border-red-200'
    : isUnderFiveMin
      ? 'bg-orange-50 border border-orange-200'
      : 'bg-[#F4F8FC] border border-[#E7EDF5]'

  const canSubmit = answeredCount > 0
  const facultyLabel =
    simulation.targetFaculty?.name ?? simulation.targetFacultyName ?? null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E7EDF5] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Título + badge */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {facultyLabel && (
            <span className="hidden sm:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EEF4FF] text-[#1565A8] border border-blue-100 shrink-0">
              {facultyLabel}
            </span>
          )}
          <h1 className="text-sm font-semibold text-[#071C35] truncate leading-tight">
            {simulation.title}
          </h1>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timerBg} shrink-0`}
        >
          <Clock size={16} className={timerColor} />
          <span
            className={`text-xl font-bold tabular-nums tracking-wide ${timerColor}`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Progresso + submeter */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="text-sm text-[#5F6D7E] hidden sm:block whitespace-nowrap">
            <span className="font-semibold text-[#071C35]">
              {answeredCount}
            </span>
            {' / '}
            <span>{totalCount}</span>
            {' questões respondidas'}
          </span>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
              canSubmit
                ? 'bg-[#F7941D] text-white hover:bg-[#e5841a] active:scale-95 shadow-sm'
                : 'bg-[#E7EDF5] text-[#A0AEC0] cursor-not-allowed'
            }`}
          >
            <Send size={15} />
            <span>Submeter</span>
          </button>
        </div>
      </div>
    </header>
  )
}

// ─── Anonymous Banner ─────────────────────────────────────────────────────────

function AnonymousBanner({ onDismiss }) {
  return (
    <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Info size={15} className="text-[#1565A8] shrink-0" />
          <p className="text-sm text-[#071C35]">
            Estás a fazer esta prova sem conta. Regista-te para guardar os teus
            resultados.{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#F7941D] hover:underline whitespace-nowrap"
            >
              Criar conta
            </Link>
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-full text-[#A0AEC0] hover:text-[#5F6D7E] hover:bg-blue-100 transition-colors shrink-0"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Section Tabs ─────────────────────────────────────────────────────────────

function SectionTabs({
  sections,
  activeSectionId,
  answers,
  flagged,
  onSelectSection,
}) {
  const getSectionStatus = (section) => {
    const total = section.questions.length
    const answered = section.questions.filter((q) => answers[q.id]).length
    const hasFlagged = section.questions.some((q) => flagged.has(q.id))
    if (hasFlagged) return 'flagged'
    if (answered === total) return 'all-answered'
    if (answered > 0) return 'some-answered'
    return 'none'
  }

  return (
    <div className="bg-white border-b border-[#E7EDF5] shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide gap-0">
          {sections.map((section) => {
            const isActive = section.id === activeSectionId
            const status = getSectionStatus(section)
            const dotColor =
              status === 'flagged'
                ? 'bg-[#F7941D]'
                : status === 'all-answered'
                  ? 'bg-[#1565A8]'
                  : status === 'some-answered'
                    ? 'bg-[#1565A8] opacity-50'
                    : 'bg-[#A0AEC0]'

            return (
              <button
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150 shrink-0 ${
                  isActive
                    ? 'border-[#1565A8] text-[#1565A8] font-semibold'
                    : 'border-transparent text-[#5F6D7E] hover:text-[#071C35] hover:border-[#E7EDF5]'
                }`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${dotColor}`}
                />
                {section.subject?.name ??
                  section.subject?.code ??
                  section.subject ??
                  '—'}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  questionNumber,
  totalInSection,
  selectedOptionId,
  isFlagged,
  onSelectOption,
  onToggleFlag,
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E7EDF5] p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-3">
        <p className="text-xs font-medium text-[#A0AEC0] tracking-wide uppercase">
          Questão {questionNumber} de {totalInSection}
        </p>
        <button
          onClick={onToggleFlag}
          title={isFlagged ? 'Remover marcação' : 'Marcar questão'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 shrink-0 ${
            isFlagged
              ? 'bg-orange-50 text-[#F7941D] border border-orange-200'
              : 'bg-[#F4F8FC] text-[#A0AEC0] border border-[#E7EDF5] hover:text-[#F7941D] hover:border-orange-200'
          }`}
        >
          <Bookmark size={13} fill={isFlagged ? '#F7941D' : 'none'} />
          <span>{isFlagged ? 'Marcada' : 'Marcar'}</span>
        </button>
      </div>

      {/* Enunciado com suporte KaTeX */}
      <MathText
        text={question.content}
        className="block text-[#071C35] text-base sm:text-lg leading-relaxed mb-5 font-medium"
      />

      {/* Imagem da questão (se existir) */}
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="Imagem da questão"
          className="rounded-xl border border-[#E7EDF5] max-h-64 w-auto object-contain mb-5"
        />
      )}

      {/* MULTIPLE_CHOICE */}
      {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
        <div className="flex flex-col gap-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id
            return (
              <button
                key={option.id}
                onClick={() => onSelectOption(option.id)}
                className={`flex items-center gap-4 w-full text-left px-4 py-4 rounded-xl border-2 transition-all duration-150 group ${
                  isSelected
                    ? 'border-[#1565A8] bg-blue-50'
                    : 'border-[#E7EDF5] bg-white hover:border-[#1565A8]/40 hover:bg-blue-50/30'
                }`}
              >
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#1565A8] text-white'
                      : 'bg-[#F4F8FC] text-[#5F6D7E] group-hover:bg-[#1565A8]/10 group-hover:text-[#1565A8]'
                  }`}
                >
                  {OPTION_LABELS[idx] ?? idx + 1}
                </span>
                <div className="flex-1 flex flex-col gap-1">
                  <MathText
                    text={option.content}
                    className={`text-sm leading-relaxed ${isSelected ? 'text-[#1565A8] font-medium' : 'text-[#071C35]'}`}
                  />
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt=""
                      className="mt-1 rounded-lg max-h-20 object-contain"
                    />
                  )}
                </div>
                {isSelected && (
                  <Check
                    size={18}
                    className="text-[#1565A8] shrink-0"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* TRUE_FALSE — itera sobre options reais, usa option.id directamente */}
      {question.questionType === 'TRUE_FALSE' && (
        <div className="flex gap-4">
          {question.options?.map((option) => {
            const isSelected = selectedOptionId === option.id
            const isTrue =
              option.content?.toLowerCase().includes('verdad') ||
              option.content?.toLowerCase().includes('true') ||
              option.content === 'V'
            return (
              <button
                key={option.id}
                onClick={() => onSelectOption(option.id)}
                className={`flex-1 py-4 rounded-full border-2 text-sm font-semibold transition-all duration-150 ${
                  isSelected
                    ? isTrue
                      ? 'bg-[#1565A8] border-[#1565A8] text-white'
                      : 'bg-[#DC3545] border-[#DC3545] text-white'
                    : isTrue
                      ? 'bg-white border-[#E7EDF5] text-[#071C35] hover:border-[#1565A8]/40 hover:bg-blue-50/30'
                      : 'bg-white border-[#E7EDF5] text-[#071C35] hover:border-red-200 hover:bg-red-50/30'
                }`}
              >
                <MathText text={option.content} />
              </button>
            )
          })}
        </div>
      )}

      {/* SHORT_ANSWER — suporte futuro */}
      {question.questionType === 'SHORT_ANSWER' && (
        <textarea
          placeholder="Escreve a tua resposta..."
          value={selectedOptionId ?? ''}
          onChange={(e) => onSelectOption(e.target.value)}
          rows={4}
          className="w-full border border-[#E7EDF5] rounded-xl px-4 py-3 text-sm text-[#071C35] placeholder:text-[#A0AEC0] outline-none focus:border-[#1565A8] focus:ring-1 focus:ring-[#1565A8]/20 resize-none transition-all"
        />
      )}
    </div>
  )
}

// ─── Navigation Footer ────────────────────────────────────────────────────────

function NavigationFooter({
  section,
  currentQuestionIndex,
  answers,
  flagged,
  isFirstQuestion,
  isLastQuestion,
  onPrev,
  onNext,
  onJumpTo,
}) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7EDF5]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Anterior */}
        <button
          onClick={onPrev}
          disabled={isFirstQuestion}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 shrink-0 ${
            isFirstQuestion
              ? 'text-[#A0AEC0] cursor-not-allowed'
              : 'text-[#5F6D7E] hover:text-[#071C35] hover:bg-[#F4F8FC]'
          }`}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Dot grid — clicável para saltar */}
        <div className="flex-1 flex justify-center overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-full">
            {section.questions.map((q, idx) => {
              const isActive = idx === currentQuestionIndex
              const isAnswered = !!answers[q.id]
              const isFlagged = flagged.has(q.id)

              let cls =
                'rounded-full transition-all duration-150 cursor-pointer '
              if (isActive)
                cls += 'w-3 h-3 bg-[#1565A8] ring-2 ring-[#1565A8]/30'
              else if (isFlagged)
                cls += 'w-2.5 h-2.5 bg-[#F7941D] hover:scale-125'
              else if (isAnswered)
                cls += 'w-2.5 h-2.5 bg-[#1565A8] hover:scale-125'
              else
                cls +=
                  'w-2.5 h-2.5 bg-[#E7EDF5] hover:bg-[#A0AEC0] hover:scale-125'

              return (
                <button
                  key={q.id}
                  onClick={() => onJumpTo(idx)}
                  title={`Questão ${idx + 1}`}
                  className={cls}
                />
              )
            })}
          </div>
        </div>

        {/* Seguinte */}
        <button
          onClick={onNext}
          disabled={isLastQuestion}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 shrink-0 ${
            isLastQuestion
              ? 'bg-[#E7EDF5] text-[#A0AEC0] cursor-not-allowed'
              : 'bg-[#1565A8] text-white hover:bg-[#1256a0] active:scale-95 shadow-sm'
          }`}
        >
          <span className="hidden sm:inline">Seguinte</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </footer>
  )
}

// ─── Submit Modal ─────────────────────────────────────────────────────────────

function SubmitModal({
  sections,
  answers,
  flagged,
  onClose,
  onConfirm,
  submitting,
}) {
  const allQuestions = sections.flatMap((s) => s.questions)
  const totalCount = allQuestions.length
  const answeredCount = allQuestions.filter((q) => answers[q.id]).length
  const unansweredCount = totalCount - answeredCount
  const flaggedCount = allQuestions.filter((q) => flagged.has(q.id)).length
  const pct =
    totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#071C35]/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#E7EDF5] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7EDF5]">
          <h2 className="text-base font-semibold text-[#071C35]">
            Submeter prova
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F4F8FC] text-[#A0AEC0] hover:text-[#5F6D7E] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {unansweredCount > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200">
              <AlertTriangle
                size={18}
                className="text-[#F7941D] shrink-0 mt-0.5"
              />
              <p className="text-sm text-[#071C35]">
                Tens{' '}
                <strong>
                  {unansweredCount}{' '}
                  {unansweredCount === 1 ? 'questão' : 'questões'} por responder
                </strong>
                . Podes continuar a resolver antes de submeter.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-0">
            <div className="flex items-center justify-between py-3 border-b border-[#E7EDF5]">
              <div className="flex items-center gap-2 text-sm text-[#5F6D7E]">
                <CheckCircle size={16} className="text-[#15803D]" />
                <span>Respondidas</span>
              </div>
              <span className="text-sm font-semibold text-[#071C35]">
                {answeredCount} / {totalCount}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#E7EDF5]">
              <div className="flex items-center gap-2 text-sm text-[#5F6D7E]">
                <X size={16} className="text-[#DC3545]" />
                <span>Por responder</span>
              </div>
              <span
                className={`text-sm font-semibold ${unansweredCount > 0 ? 'text-[#DC3545]' : 'text-[#15803D]'}`}
              >
                {unansweredCount}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-sm text-[#5F6D7E]">
                <Bookmark size={16} className="text-[#F7941D]" />
                <span>Marcadas para revisão</span>
              </div>
              <span className="text-sm font-semibold text-[#071C35]">
                {flaggedCount}
              </span>
            </div>
          </div>

          <div className="w-full h-2 bg-[#E7EDF5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#15803D] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-[#A0AEC0] text-center">{pct}% completo</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#E7EDF5] bg-[#F4F8FC]">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-full border border-[#E7EDF5] bg-white text-sm font-medium text-[#5F6D7E] hover:bg-[#F4F8FC] hover:text-[#071C35] transition-colors disabled:opacity-50"
          >
            Continuar a responder
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#F7941D] text-white text-sm font-semibold hover:bg-[#e5841a] active:scale-95 transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                A submeter...
              </span>
            ) : (
              <>
                <Send size={15} />
                Submeter prova
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Contornos Footer ─────────────────────────────────────────────────────────

function ContornosFooter() {
  return (
    <div className="flex items-center justify-center py-3 pb-20">
      <a
        href="https://contornos.design"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-[#C0CBD8] hover:text-[#8899aa] transition-colors"
        style={{ fontSize: 10 }}
      >
        Desenvolvido por
        <span className="font-semibold tracking-tight ml-0.5">
          CONTORNOS Designs
        </span>
      </a>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SimulationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [simulation, setSimulation] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [activeSectionId, setActiveSectionId] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const timerRef = useRef(null)
  const isAnonymous = !user

  // ── 1. Carregar prova e fazer start ────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)

        const simRes = await api.get(`/simulations/${id}`)
        const simData = simRes.data?.data ?? simRes.data

        // Normalizar secções
        const normalized = {
          ...simData,
          sections:
            simData.sections?.map((s) => {
              const fromQBS = simData.questionsBySection?.find(
                (q) => q.sectionId === s.id
              )
              return {
                ...s,
                questions: s.questions ?? fromQBS?.questions ?? [],
              }
            }) ?? [],
        }

        setSimulation(normalized)
        setActiveSectionId(normalized.sections?.[0]?.id ?? null)

        const startRes = await api.post(`/simulations/${id}/start`)
        const startData = startRes.data?.data ?? startRes.data
        const aId = startData.attemptId
        setAttemptId(aId)
        setTimeLeft((startData.duration ?? simData.duration) * 60)

        if (!user) {
          localStorage.setItem(ATTEMPT_KEY, aId)
        }
      } catch (e) {
        setError(
          e.response?.data?.message ?? 'Não foi possível carregar a simulação.'
        )
      } finally {
        setLoading(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // ── 2. Timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null || loading) return
    if (timeLeft <= 0) {
      setShowModal(true)
      return
    }
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft, loading])

  // ── Dados derivados ────────────────────────────────────────────────────────
  const allQuestions =
    simulation?.sections?.flatMap((s) => s.questions ?? []) ?? []
  const answeredCount = allQuestions.filter(
    (q) => q?.id && answers[q.id]
  ).length

  const activeSection = simulation?.sections.find(
    (s) => s.id === activeSectionId
  )
  const currentQuestion = activeSection?.questions[questionIndex]

  const sectionIndex =
    simulation?.sections.findIndex((s) => s.id === activeSectionId) ?? 0
  const isFirstQuestion = sectionIndex === 0 && questionIndex === 0
  const isLastSection = sectionIndex === (simulation?.sections.length ?? 1) - 1
  const isLastQuestion =
    isLastSection &&
    questionIndex === (activeSection?.questions.length ?? 1) - 1

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePrev = useCallback(() => {
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1)
    } else if (sectionIndex > 0) {
      const prev = simulation.sections[sectionIndex - 1]
      setActiveSectionId(prev.id)
      setQuestionIndex(prev.questions.length - 1)
    }
  }, [questionIndex, sectionIndex, simulation])

  const handleNext = useCallback(() => {
    if (questionIndex < (activeSection?.questions.length ?? 0) - 1) {
      setQuestionIndex((i) => i + 1)
    } else if (!isLastSection) {
      const next = simulation.sections[sectionIndex + 1]
      setActiveSectionId(next.id)
      setQuestionIndex(0)
    }
  }, [questionIndex, activeSection, sectionIndex, isLastSection, simulation])

  const handleSelectSection = (sId) => {
    setActiveSectionId(sId)
    setQuestionIndex(0)
  }

  const handleSelectOption = (optionId) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }))
  }

  const handleToggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id)
      else next.add(currentQuestion.id)
      return next
    })
  }

  const handleSubmitConfirm = async () => {
    try {
      setSubmitting(true)
      clearInterval(timerRef.current)

      const answersPayload = Object.entries(answers).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })
      )

      await api.post(`/simulations/${attemptId}/submit`, {
        answers: answersPayload,
      })

      setShowModal(false)
      navigate(`/simulation/${id}/results?attemptId=${attemptId}`)
    } catch (e) {
      if (e.response?.status === 409) {
        navigate(`/simulation/${id}/results?attemptId=${attemptId}`)
        return
      }
      setError('Erro ao submeter a prova. Tenta novamente.')
      setSubmitting(false)
    }
  }

  // ── Offsets para os elementos fixed ───────────────────────────────────────
  const bannerHeight = isAnonymous && !bannerDismissed ? 44 : 0
  const topOffset = 64 + bannerHeight + 48

  // ── Estados de erro e loading ──────────────────────────────────────────────
  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-[#E7EDF5] p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={28} className="text-[#DC3545]" />
          </div>
          <h2 className="text-base font-semibold text-[#071C35] mb-2">Erro</h2>
          <p className="text-sm text-[#5F6D7E] mb-6">{error}</p>
          <button
            onClick={() => navigate('/simulations')}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-full bg-[#1565A8] text-white text-sm font-semibold hover:bg-[#1256a0] transition-colors"
          >
            <ArrowLeft size={15} />
            Voltar às simulações
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-[#F4F8FC]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Top Bar (fixed) ── */}
      <TopBar
        simulation={simulation}
        timeLeft={timeLeft ?? 0}
        answeredCount={answeredCount}
        totalCount={allQuestions.length}
        onSubmit={() => setShowModal(true)}
      />

      {/* ── Banner anónimo (fixed, logo abaixo do topbar) ── */}
      {isAnonymous && !bannerDismissed && (
        <div className="fixed left-0 right-0 z-40" style={{ top: 64 }}>
          <AnonymousBanner onDismiss={() => setBannerDismissed(true)} />
        </div>
      )}

      {/* ── Section Tabs (fixed, logo abaixo do banner) ── */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: 64 + bannerHeight }}
      >
        <SectionTabs
          sections={simulation.sections}
          activeSectionId={activeSectionId}
          answers={answers}
          flagged={flagged}
          onSelectSection={handleSelectSection}
        />
      </div>

      {/* ── Conteúdo principal ── */}
      <main className="px-4 pb-6" style={{ paddingTop: topOffset + 20 }}>
        <div className="max-w-3xl mx-auto">
          {currentQuestion ? (
            <>
              <QuestionCard
                question={currentQuestion}
                questionNumber={questionIndex + 1}
                totalInSection={activeSection.questions.length}
                selectedOptionId={answers[currentQuestion.id]}
                isFlagged={flagged.has(currentQuestion.id)}
                onSelectOption={handleSelectOption}
                onToggleFlag={handleToggleFlag}
              />
              <p className="text-xs text-[#A0AEC0] text-center mt-3">
                {activeSection.subject?.name ??
                  activeSection.subject?.code ??
                  'Secção'}{' '}
                · {activeSection.questions.length} questões
              </p>
            </>
          ) : (
            <p className="text-center text-sm text-[#A0AEC0] py-12">
              Sem questões nesta secção.
            </p>
          )}
        </div>
      </main>

      {/* ── Footer Contornos ── */}
      <ContornosFooter />

      {/* ── Navigation Footer (fixed, bottom) ── */}
      {activeSection && (
        <NavigationFooter
          section={activeSection}
          currentQuestionIndex={questionIndex}
          answers={answers}
          flagged={flagged}
          isFirstQuestion={isFirstQuestion}
          isLastQuestion={isLastQuestion}
          onPrev={handlePrev}
          onNext={handleNext}
          onJumpTo={setQuestionIndex}
        />
      )}

      {/* ── Submit Modal ── */}
      {showModal && (
        <SubmitModal
          sections={simulation.sections}
          answers={answers}
          flagged={flagged}
          onClose={() => !submitting && setShowModal(false)}
          onConfirm={handleSubmitConfirm}
          submitting={submitting}
        />
      )}
    </div>
  )
}
