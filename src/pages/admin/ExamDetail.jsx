import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft, Plus, Edit2, Trash2, FileText, AlertCircle,
  Loader2, X, BookOpen, CheckCircle, Upload, Download,
  ClipboardList, ChevronDown, ChevronUp, ArchiveIcon, Clock
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

function getErrorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.status === 404) return 'Recurso não encontrado.';
  if (err.response?.status === 500) return 'Erro interno do servidor. Tente novamente.';
  return 'Ocorreu um erro. Verifique a ligação e tente novamente.';
}

const SCORING_LABELS = { SIMPLE: 'Simples', WEIGHTED: 'Ponderado', DRAFT: 'Rascunho' };
const SCORING_COLORS = {
  SIMPLE: 'bg-blue-100 text-blue-700',
  WEIGHTED: 'bg-purple-100 text-purple-700',
  DRAFT: 'bg-gray-100 text-gray-500',
};

// Schema real: questionType (não "type")
const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Escolha Múltipla' },
  { value: 'TRUE_FALSE',      label: 'Verdadeiro / Falso' },
  { value: 'SHORT_ANSWER',    label: 'Resposta Curta' },
];

// Extrai a opção correcta de um array de Option[] (schema real)
function getCorrectOption(options) {
  return options?.find(o => o.isCorrect) || null;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonQuestion() {
  return (
    <div className="bg-white rounded-xl border border-[#DEE2E6] p-4 space-y-3">
      <div className="h-4 bg-gray-200 animate-pulse rounded-md w-3/4" />
      <div className="h-3 bg-gray-200 animate-pulse rounded-md w-1/3" />
      <div className="h-3 bg-gray-200 animate-pulse rounded-md w-1/2" />
    </div>
  );
}

// ─── Modal Questão ────────────────────────────────────────────────────────────
// Schema real da Question:
//   content (não text), questionType (não type)
//   options: Option[] → { id, content, isCorrect }
//   NÃO tem: points, explanation, correctAnswer directamente

function QuestionModal({ question, examId, onClose, onSaved }) {
  const isEdit = !!question;

  // Para edição, reconstruímos o estado a partir do schema real
  const initialOptions = question?.options?.length
    ? question.options.map(o => ({ content: o.content, isCorrect: o.isCorrect }))
    : [{ content: '', isCorrect: false }, { content: '', isCorrect: false },
       { content: '', isCorrect: false }, { content: '', isCorrect: false }];

  const initialCorrectIndex = question?.options
    ? question.options.findIndex(o => o.isCorrect)
    : -1;

  const [form, setForm] = useState({
    content: question?.content || '',                          // campo real: content
    questionType: question?.questionType || 'MULTIPLE_CHOICE', // campo real: questionType
    options: initialOptions,
    correctOptionIndex: initialCorrectIndex >= 0 ? initialCorrectIndex : 0,
    trueFalseAnswer: '',  // para TRUE_FALSE
  });

  // Se for TRUE_FALSE em edição, detecta a resposta
  useEffect(() => {
    if (question?.questionType === 'TRUE_FALSE' && question?.options?.length) {
      const correct = question.options.find(o => o.isCorrect);
      if (correct) {
        setForm(f => ({ ...f, trueFalseAnswer: correct.content }));
      }
    }
  }, []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleOptionChange(index, value) {
    setForm(f => {
      const options = [...f.options];
      options[index] = { ...options[index], content: value };
      return { ...f, options };
    });
  }

  function addOption() {
    if (form.options.length < 6) {
      setForm(f => ({ ...f, options: [...f.options, { content: '', isCorrect: false }] }));
    }
  }

  function removeOption(index) {
    if (form.options.length > 2) {
      setForm(f => {
        const options = f.options.filter((_, i) => i !== index);
        const correctOptionIndex = Math.min(f.correctOptionIndex, options.length - 1);
        return { ...f, options, correctOptionIndex };
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.content.trim()) return setError('O enunciado é obrigatório.');

    let payload;

    if (form.questionType === 'MULTIPLE_CHOICE') {
      const filled = form.options.filter(o => o.content.trim());
      if (filled.length < 2) return setError('Precisa de pelo menos 2 opções preenchidas.');

      // Monta opções com isCorrect para o backend
      const optionsPayload = form.options
        .filter(o => o.content.trim())
        .map((o, i) => ({
          content: o.content.trim(),
          isCorrect: i === form.correctOptionIndex,
        }));

      if (!optionsPayload.some(o => o.isCorrect)) {
        return setError('Selecciona a opção correcta.');
      }

      payload = {
        content: form.content.trim(),
        questionType: form.questionType,
        options: optionsPayload,
      };
    } else if (form.questionType === 'TRUE_FALSE') {
      if (!form.trueFalseAnswer) return setError('Selecciona Verdadeiro ou Falso.');
      payload = {
        content: form.content.trim(),
        questionType: form.questionType,
        options: [
          { content: 'Verdadeiro', isCorrect: form.trueFalseAnswer === 'Verdadeiro' },
          { content: 'Falso',      isCorrect: form.trueFalseAnswer === 'Falso' },
        ],
      };
    } else {
      // SHORT_ANSWER — sem opções
      payload = {
        content: form.content.trim(),
        questionType: form.questionType,
      };
    }

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/admin/questions/${question.id}`, payload);
      } else {
        await api.post(`/admin/exams/${examId}/questions`, payload);
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEE2E6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0A3956] flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-[#0A3956]">
              {isEdit ? 'Editar Questão' : 'Nova Questão'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Enunciado — campo real: content */}
          <div>
            <label className="block text-sm font-semibold text-[#0A3956] mb-1">
              Enunciado <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={3}
              placeholder="Escreve o enunciado da questão..."
              className="w-full border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#0A3956] transition-colors resize-none"
            />
          </div>

          {/* Tipo — campo real: questionType */}
          <div>
            <label className="block text-sm font-semibold text-[#0A3956] mb-1">Tipo de Questão</label>
            <select
              value={form.questionType}
              onChange={e => setForm(f => ({ ...f, questionType: e.target.value, correctOptionIndex: 0, trueFalseAnswer: '' }))}
              className="w-full border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#0A3956] bg-white transition-colors"
            >
              {QUESTION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Opções — Escolha Múltipla */}
          {form.questionType === 'MULTIPLE_CHOICE' && (
            <div>
              <label className="block text-sm font-semibold text-[#0A3956] mb-2">
                Opções <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {/* Radio para marcar a correcta */}
                    <input
                      type="radio"
                      name="correctOption"
                      checked={form.correctOptionIndex === i}
                      onChange={() => setForm(f => ({ ...f, correctOptionIndex: i }))}
                      className="w-4 h-4 accent-[#28A745] flex-shrink-0"
                      title="Marcar como correcta"
                    />
                    <span className="w-6 h-6 rounded-full bg-[#0A3956]/10 flex items-center justify-center text-xs font-bold text-[#0A3956] flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <input
                      value={opt.content}
                      onChange={e => handleOptionChange(i, e.target.value)}
                      placeholder={`Opção ${String.fromCharCode(65 + i)}`}
                      className="flex-1 border border-[#DEE2E6] rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#0A3956] transition-colors"
                    />
                    {form.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Clica no círculo à esquerda para marcar a resposta correcta.</p>
              {form.options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-xs font-semibold text-[#0A3956] hover:text-[#0D4A6E] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar opção
                </button>
              )}
            </div>
          )}

          {/* Verdadeiro / Falso */}
          {form.questionType === 'TRUE_FALSE' && (
            <div>
              <label className="block text-sm font-semibold text-[#0A3956] mb-2">
                Resposta Correcta <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {['Verdadeiro', 'Falso'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, trueFalseAnswer: val }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                      form.trueFalseAnswer === val
                        ? 'bg-[#0A3956] text-white border-[#0A3956]'
                        : 'border-[#DEE2E6] text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {val === 'Verdadeiro' ? '✓ Verdadeiro' : '✗ Falso'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resposta Curta — sem opções no schema */}
          {form.questionType === 'SHORT_ANSWER' && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-600">
              As questões de resposta curta não têm opções pré-definidas. A correcção é feita manualmente pelo professor.
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#0A3956] text-white text-sm font-semibold rounded-lg hover:bg-[#0D4A6E] transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Guardar Alterações' : 'Adicionar Questão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Confirmar Apagar Questão ──────────────────────────────────────────

function DeleteModal({ question, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-[#0A3956]">Apagar Questão</h3>
          <p className="text-sm text-gray-500">
            Tens a certeza que queres apagar esta questão? Esta acção não pode ser desfeita.
          </p>
          {/* Campo real: content (não text) */}
          <p className="text-sm font-medium text-gray-700 bg-gray-50 rounded-lg px-3 py-2 w-full text-left line-clamp-2">
            "{question.content}"
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[#DEE2E6] text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Apagar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Import Excel ──────────────────────────────────────────────────────

function ImportModal({ examId, onClose, onImported }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  async function handleDownloadTemplate() {
    setDownloadingTemplate(true);
    try {
      const res = await api.get(`/admin/exams/${examId}/questions/import/template`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_questoes.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Erro ao descarregar template.');
    } finally {
      setDownloadingTemplate(false);
    }
  }

  async function handleUpload() {
    if (!file) return setError('Selecciona um ficheiro Excel.');
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/admin/exams/${examId}/questions/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Backend devolve: { success, summary: { total, imported, failed }, errors[] }
      setResult(res.data);
      if (res.data?.summary?.imported > 0) {
        setTimeout(() => onImported(), 1500);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEE2E6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0A3956] flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-[#0A3956]">Importar via Excel</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
              <p className="font-semibold">Importação concluída!</p>
              <p>Total: {result.summary?.total} | Importadas: {result.summary?.imported} | Falhas: {result.summary?.failed}</p>
            </div>
          )}

          {/* Step 1 */}
          <div className="bg-[#F8F9FA] rounded-xl p-4">
            <p className="text-sm font-semibold text-[#0A3956] mb-1">1. Descarregar template</p>
            <p className="text-xs text-gray-500 mb-3">
              Usa o template oficial para garantir o formato correcto.
            </p>
            <button
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
              className="flex items-center gap-2 px-4 py-2 border border-[#0A3956] text-[#0A3956] text-sm font-semibold rounded-lg hover:bg-[#0A3956] hover:text-white transition-colors disabled:opacity-60"
            >
              {downloadingTemplate
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />}
              Template Excel
            </button>
          </div>

          {/* Step 2 */}
          <div className="bg-[#F8F9FA] rounded-xl p-4">
            <p className="text-sm font-semibold text-[#0A3956] mb-1">2. Carregar ficheiro preenchido</p>
            <p className="text-xs text-gray-500 mb-3">
              Aceita ficheiros .xlsx e .xls até 5MB.
            </p>
            <div
              className="border-2 border-dashed border-[#DEE2E6] rounded-xl p-6 text-center cursor-pointer hover:border-[#0A3956] transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              {file
                ? <p className="text-sm font-semibold text-[#0A3956]">{file.name}</p>
                : <p className="text-sm text-gray-400">Clica para seleccionar ou arrasta aqui</p>
              }
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="flex items-center gap-2 px-5 py-2 bg-[#F69220] text-white text-sm font-semibold rounded-lg hover:bg-[#e07d10] transition-colors disabled:opacity-60"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              Importar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
// Schema real: content, questionType, options: Option[]{ content, isCorrect }

function QuestionCard({ question, index, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  // Campo real: questionType (não type)
  const typeLabel = QUESTION_TYPES.find(t => t.value === question.questionType)?.label || question.questionType;

  // Opção correcta vem do array de Option com isCorrect: true
  const correctOption = getCorrectOption(question.options);

  return (
    <div className="bg-white rounded-xl border border-[#DEE2E6] shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 p-4">

        {/* Número */}
        <div className="w-8 h-8 rounded-lg bg-[#0A3956] flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">{index + 1}</span>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Campo real: content (não text) */}
          <p className="text-sm font-medium text-gray-800 leading-snug">{question.content}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#0A3956]/10 text-[#0A3956]">
              {typeLabel}
            </span>
            {/* Opção correcta (schema real: options[].isCorrect) */}
            {correctOption && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                {correctOption.content}
              </span>
            )}
          </div>

          {/* Opções expandíveis — options é Option[] com .content e .isCorrect */}
          {question.questionType === 'MULTIPLE_CHOICE' && question.options?.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 text-xs text-[#0A3956] font-semibold hover:opacity-70 transition-opacity"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? 'Ocultar opções' : `Ver opções (${question.options.length})`}
              </button>
              {expanded && (
                <div className="mt-2 space-y-1">
                  {question.options.map((opt, i) => (
                    <div
                      key={opt.id || i}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                        opt.isCorrect
                          ? 'bg-green-50 text-green-700 font-semibold'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span className="font-bold">{String.fromCharCode(65 + i)}.</span>
                      {/* Campo real: opt.content (não opt.text) */}
                      {opt.content}
                      {opt.isCorrect && <CheckCircle className="w-3 h-3 ml-auto" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRUE_FALSE — mostra as opções se expandido */}
          {question.questionType === 'TRUE_FALSE' && question.options?.length > 0 && expanded && (
            <div className="mt-2 space-y-1">
              {question.options.map((opt, i) => (
                <div
                  key={opt.id || i}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                    opt.isCorrect ? 'bg-green-50 text-green-700 font-semibold' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {opt.content}
                  {opt.isCorrect && <CheckCircle className="w-3 h-3 ml-auto" />}
                </div>
              ))}
            </div>
          )}

          {question.questionType === 'TRUE_FALSE' && question.options?.length > 0 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-2 flex items-center gap-1 text-xs text-[#0A3956] font-semibold hover:opacity-70 transition-opacity"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? 'Ocultar' : 'Ver resposta'}
            </button>
          )}
        </div>

        {/* Acções */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(question)}
            className="p-1.5 text-gray-400 hover:text-[#0A3956] hover:bg-[#0A3956]/10 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(question)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Apagar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingExam, setLoadingExam] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState('');

  const [modalQuestion, setModalQuestion] = useState(false);
  const [modalEditQuestion, setModalEditQuestion] = useState(null);
  const [modalDeleteQuestion, setModalDeleteQuestion] = useState(null);
  const [modalImport, setModalImport] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── fetch exam ─────────────────────────────────────────────────────────────
  async function fetchExam() {
    setLoadingExam(true);
    try {
      const res = await api.get(`/admin/exams/${id}`);
      setExam(res.data?.data ?? res.data);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
      if (err.response?.status === 404) { navigate('/admin/exams'); return; }
      setError(getErrorMessage(err));
    } finally {
      setLoadingExam(false);
    }
  }

  // ── fetch questions ────────────────────────────────────────────────────────
  async function fetchQuestions() {
    setLoadingQuestions(true);
    try {
      const res = await api.get(`/admin/exams/${id}/questions`);
      setQuestions(res.data?.data ?? res.data ?? []);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
      setError(getErrorMessage(err));
    } finally {
      setLoadingQuestions(false);
    }
  }

  useEffect(() => {
    fetchExam();
    fetchQuestions();
  }, [id]);

  // ── delete question ────────────────────────────────────────────────────────
  async function handleDeleteQuestion() {
    setDeleting(true);
    try {
      await api.delete(`/admin/questions/${modalDeleteQuestion.id}`);
      setModalDeleteQuestion(null);
      fetchQuestions();
    } catch (err) {
      if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
      // Regra de negócio 19: questões com respostas não se apagam (409)
      if (err.response?.status === 409) {
        setError('Esta questão tem respostas de estudantes e não pode ser apagada.');
      } else {
        setError(getErrorMessage(err));
      }
      setModalDeleteQuestion(null);
    } finally {
      setDeleting(false);
    }
  }

  // ── disciplinas do exam (schema real: sections[].subject.name) ─────────────
  function getSubjectNames() {
    if (!exam?.sections?.length) return '—';
    return exam.sections.map(s => s.subject?.name).filter(Boolean).join(', ') || '—';
  }

  return (
    <div className="p-6 max-w-[900px] mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/exams')}
          className="p-2 text-gray-400 hover:text-[#0A3956] hover:bg-[#0A3956]/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0 flex-1">
          {loadingExam
            ? <div className="h-6 bg-gray-200 animate-pulse rounded-md w-48" />
            : <h1 className="text-xl font-bold text-[#0A3956] truncate">{exam?.title}</h1>
          }
          {loadingExam
            ? <div className="h-4 bg-gray-200 animate-pulse rounded-md w-32 mt-1" />
            : <p className="text-sm text-[#6C757D]">{getSubjectNames()}</p>
          }
        </div>
        {exam && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SCORING_COLORS[exam.scoringMode] || 'bg-gray-100 text-gray-500'}`}>
            {SCORING_LABELS[exam.scoringMode] || exam.scoringMode}
          </span>
        )}
        {exam?.isArchived && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
            <ArchiveIcon className="w-3 h-3" />
            Arquivada
          </span>
        )}
      </div>

      {/* ── Info da Prova ────────────────────────────────────────────────── */}
      {!loadingExam && exam && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: 'Questões',
              // Campo real: questions[] ou _count.questions
              value: Array.isArray(exam.questions)
                ? exam.questions.length
                : (exam._count?.questions ?? questions.length),
              icon: <ClipboardList className="w-4 h-4 text-[#F69220]" />
            },
            {
              label: 'Duração',
              // Campo real: duration (minutos)
              value: exam.duration ? `${exam.duration} min` : '—',
              icon: <Clock className="w-4 h-4 text-[#0A3956]" />
            },
            {
              label: 'Disciplina(s)',
              value: getSubjectNames(),
              icon: <BookOpen className="w-4 h-4 text-green-500" />
            },
            {
              label: 'Avaliação',
              value: SCORING_LABELS[exam.scoringMode] || '—',
              icon: <FileText className="w-4 h-4 text-purple-500" />
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#DEE2E6] shadow-sm px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                {item.icon}
                <span className="text-xs text-[#6C757D] font-medium uppercase tracking-wide">{item.label}</span>
              </div>
              <p className="text-lg font-bold text-[#0A3956] truncate">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Descrição ───────────────────────────────────────────────────── */}
      {exam?.description && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
          {exam.description}
        </div>
      )}

      {/* ── Erro ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button onClick={() => { setError(''); fetchExam(); fetchQuestions(); }} className="text-sm font-semibold text-red-600 hover:text-red-800">
            Tentar novamente
          </button>
        </div>
      )}

      {/* ── Header Questões ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#0A3956]">
          Questões {!loadingQuestions && <span className="text-[#6C757D] font-normal">({questions.length})</span>}
        </h2>
        {!exam?.isArchived && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalImport(true)}
              className="flex items-center gap-2 px-3 py-2 border border-[#DEE2E6] text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar Excel</span>
            </button>
            <button
              onClick={() => setModalQuestion(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A3956] text-white text-sm font-semibold rounded-lg hover:bg-[#0D4A6E] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Questão</span>
              <span className="sm:hidden">Adicionar</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Lista Questões ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        {loadingQuestions
          ? [...Array(4)].map((_, i) => <SkeletonQuestion key={i} />)
          : questions.length === 0
          ? (
            <div className="flex flex-col items-center gap-3 py-20 bg-white rounded-xl border border-[#DEE2E6]">
              <ClipboardList className="w-12 h-12 text-gray-200" />
              <p className="text-sm text-gray-400 text-center">
                {exam?.isArchived
                  ? 'Esta prova está arquivada e não pode receber novas questões.'
                  : 'Ainda não há questões. Clica em "Adicionar Questão" ou importa via Excel.'}
              </p>
            </div>
          )
          : questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              onEdit={setModalEditQuestion}
              onDelete={setModalDeleteQuestion}
            />
          ))
        }
      </div>

      {/* ── Modais ──────────────────────────────────────────────────────── */}
      {modalQuestion && (
        <QuestionModal
          examId={id}
          onClose={() => setModalQuestion(false)}
          onSaved={() => { setModalQuestion(false); fetchQuestions(); }}
        />
      )}
      {modalEditQuestion && (
        <QuestionModal
          question={modalEditQuestion}
          examId={id}
          onClose={() => setModalEditQuestion(null)}
          onSaved={() => { setModalEditQuestion(null); fetchQuestions(); }}
        />
      )}
      {modalDeleteQuestion && (
        <DeleteModal
          question={modalDeleteQuestion}
          onClose={() => setModalDeleteQuestion(null)}
          onConfirm={handleDeleteQuestion}
          loading={deleting}
        />
      )}
      {modalImport && (
        <ImportModal
          examId={id}
          onClose={() => setModalImport(false)}
          onImported={() => { setModalImport(false); fetchQuestions(); }}
        />
      )}
    </div>
  );
}
