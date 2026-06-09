import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, BookOpen, Clock, Settings,
  Plus, Trash2, GripVertical, ChevronDown, AlertCircle,
  FileText, Eye, EyeOff, Layers, BarChart2, Pencil, X,
  Building2, GraduationCap,
} from 'lucide-react';
import api from '../../services/api';

// ─── Constantes ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Informações Gerais', icon: FileText },
  { id: 2, label: 'Secções & Disciplinas', icon: Layers },
  { id: 3, label: 'Revisão & Publicação', icon: Eye },
];

const SCORING_MODES = [
  {
    value: 'SIMPLE',
    label: 'Simples',
    description: 'Todas as questões valem o mesmo. Nota calculada automaticamente.',
    icon: BarChart2,
    color: '#0A3956',
  },
  {
    value: 'WEIGHTED',
    label: 'Por Secções',
    description: 'Cada secção tem um peso diferente na nota final.',
    icon: Layers,
    color: '#F69220',
  },
  {
    value: 'DRAFT',
    label: 'Rascunho',
    description: 'Sem nota calculada. Ideal para provas em construção.',
    icon: Pencil,
    color: '#6C757D',
  },
];

const WEIGHT_TYPES = [
  { value: 'PERCENTAGE', label: 'Percentagem (%)', description: 'Ex: Matemática 40%, Física 35%' },
  { value: 'FIXED_SCORE', label: 'Pontuação Fixa', description: 'Ex: Matemática 8 pontos, Física 7 pontos' },
];

const SUBJECT_COLORS = [
  '#0A3956', '#F69220', '#28A745', '#DC3545',
  '#6610f2', '#fd7e14', '#20c997', '#0dcaf0',
  '#d63384',
];

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ExamCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]);

  // ✅ V13.4 — universidades e faculdades para os dropdowns
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);       // faculdades da universidade seleccionada
  const [loadingFaculties, setLoadingFaculties] = useState(false);

  // Step 1 — Informações gerais
  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: '',
    scoringMode: '',
    weightType: 'PERCENTAGE',
    isPublic: false,
    targetUniversityId: '',  // ✅ V13.4
    targetFacultyId: '',     // ✅ V13.4
  });

  // Step 2 — Secções
  const [sections, setSections] = useState([]);

  // Carregar disciplinas disponíveis
  useEffect(() => {
    api.get('/enrollment/subjects')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setSubjects(Array.isArray(data) ? data : []);
      })
      .catch(() => setSubjects([]));
  }, []);

  // ✅ V13.4 — Carregar universidades
  useEffect(() => {
    api.get('/enrollment/universities')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setUniversities(Array.isArray(data) ? data : []);
      })
      .catch(() => setUniversities([]));
  }, []);

  // ✅ V13.4 — Carregar faculdades quando universidade muda
  useEffect(() => {
    if (!form.targetUniversityId) {
      setFaculties([]);
      setForm(f => ({ ...f, targetFacultyId: '' }));
      return;
    }
    setLoadingFaculties(true);
    api.get('/enrollment/faculties', { params: { universityId: form.targetUniversityId } })
      .then(res => {
        const data = res.data?.data ?? res.data;
        setFaculties(Array.isArray(data) ? data : []);
      })
      .catch(() => setFaculties([]))
      .finally(() => setLoadingFaculties(false));
    // Limpar faculdade seleccionada quando universidade muda
    setForm(f => ({ ...f, targetFacultyId: '' }));
  }, [form.targetUniversityId]);

  // ─── Handlers Step 1 ───────────────────────────────────────────────────────

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setError('');
  };

  const validateStep1 = () => {
    if (!form.title.trim()) return 'O título é obrigatório.';
    if (!form.duration || isNaN(form.duration) || Number(form.duration) < 1)
      return 'Indica uma duração válida (em minutos).';
    if (!form.scoringMode) return 'Escolhe o modo de avaliação.';
    return '';
  };

  // ─── Handlers Step 2 ───────────────────────────────────────────────────────

  const addSection = () => {
    setSections(s => [
      ...s,
      {
        id: Date.now(),
        name: '',
        subjectId: '',
        weight: '',
        color: SUBJECT_COLORS[s.length % SUBJECT_COLORS.length],
      },
    ]);
  };

  const removeSection = id => setSections(s => s.filter(sec => sec.id !== id));

  const updateSection = (id, key, val) => {
    setSections(s => s.map(sec => sec.id === id ? { ...sec, [key]: val } : sec));
    setError('');
  };

  const validateStep2 = () => {
    if (sections.length === 0) return 'Adiciona pelo menos uma secção/disciplina.';
    for (const sec of sections) {
      if (!sec.name.trim()) return 'Todas as secções precisam de um nome.';
      if (!sec.subjectId) return 'Associa uma disciplina a cada secção.';
      if (form.scoringMode === 'WEIGHTED' && (!sec.weight || isNaN(sec.weight) || Number(sec.weight) <= 0))
        return 'Define o peso de cada secção.';
    }
    if (form.scoringMode === 'WEIGHTED' && form.weightType === 'PERCENTAGE') {
      const total = sections.reduce((sum, s) => sum + Number(s.weight || 0), 0);
      if (Math.abs(total - 100) > 0.1) return `A soma das percentagens deve ser 100%. Actual: ${total}%`;
    }
    return '';
  };

  // ─── Submissão Final ───────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        duration: Number(form.duration),
        scoringMode: form.scoringMode,
        weightType: form.scoringMode === 'WEIGHTED' ? form.weightType : undefined,
        isPublic: form.isPublic,
        // ✅ V13.4 — enviar apenas se preenchidos
        targetUniversityId: form.targetUniversityId || undefined,
        targetFacultyId:    form.targetFacultyId    || undefined,
        sections: sections.map(sec => ({
          name: sec.name.trim(),
          subjectId: sec.subjectId,
          weight: form.scoringMode === 'WEIGHTED' ? Number(sec.weight) : undefined,
        })),
      };
      const res = await api.post('/admin/exams', payload);
      const examId = res.data?.data?.id ?? res.data?.id;
      navigate(`/admin/exams/${examId}`);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
      setError(err.response?.data?.error || 'Erro ao criar a prova. Tenta novamente.');
      setSaving(false);
    }
  };

  // ─── Navegação entre steps ─────────────────────────────────────────────────

  const goNext = () => {
    if (step === 1) {
      const e = validateStep1();
      if (e) { setError(e); return; }
    }
    if (step === 2) {
      const e = validateStep2();
      if (e) { setError(e); return; }
    }
    setError('');
    setStep(s => s + 1);
  };

  const goBack = () => { setError(''); setStep(s => s - 1); };

  // ─── Cálculo de percentagem total ─────────────────────────────────────────

  const totalPct = sections.reduce((sum, s) => sum + Number(s.weight || 0), 0);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* ── Cabeçalho ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button
            onClick={() => navigate('/admin/exams')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'white', border: '1px solid #DEE2E6',
              borderRadius: 8, padding: '8px 14px',
              color: '#0A3956', fontWeight: 600, fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={15} /> Voltar
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A3956', margin: 0 }}>
              Nova Prova
            </h1>
            <p style={{ fontSize: 13, color: '#6C757D', margin: 0 }}>
              Preenche os passos abaixo para criar uma prova de simulação
            </p>
          </div>
        </div>

        {/* ── Stepper ── */}
        <StepBar step={step} />

        {/* ── Erro global ── */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff5f5', border: '1px solid #DC3545',
            borderRadius: 10, padding: '12px 16px',
            color: '#DC3545', fontSize: 13, marginBottom: 20,
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── Conteúdo do Step ── */}
        <div style={{
          background: 'white', borderRadius: 16,
          border: '1px solid #DEE2E6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          padding: 32, marginBottom: 24,
        }}>
          {step === 1 && (
            <Step1
              form={form}
              setField={setField}
              universities={universities}
              faculties={faculties}
              loadingFaculties={loadingFaculties}
            />
          )}
          {step === 2 && (
            <Step2
              sections={sections}
              subjects={subjects}
              scoringMode={form.scoringMode}
              weightType={form.weightType}
              setWeightType={v => setField('weightType', v)}
              totalPct={totalPct}
              addSection={addSection}
              removeSection={removeSection}
              updateSection={updateSection}
            />
          )}
          {step === 3 && (
            <Step3
              form={form}
              sections={sections}
              subjects={subjects}
              universities={universities}
              faculties={faculties}
            />
          )}
        </div>

        {/* ── Botões de Navegação ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {step > 1 && (
              <button onClick={goBack} style={btnSecondary}>
                <ArrowLeft size={15} /> Anterior
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/admin/exams')} style={btnGhost}>
              Cancelar
            </button>
            {step < 3 ? (
              <button onClick={goNext} style={btnPrimary}>
                Continuar <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'A criar...' : <><Check size={15} /> Criar Prova</>}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── StepBar ─────────────────────────────────────────────────────────────────

function StepBar({ step }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'white', borderRadius: 14,
      border: '1px solid #DEE2E6',
      padding: '16px 24px', marginBottom: 24,
      gap: 0,
    }}>
      {STEPS.map((s, i) => {
        const done = step > s.id;
        const active = step === s.id;
        const Icon = s.icon;
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#28A745' : active ? '#0A3956' : '#F8F9FA',
                border: `2px solid ${done ? '#28A745' : active ? '#0A3956' : '#DEE2E6'}`,
                transition: 'all 0.2s',
                flexShrink: 0,
              }}>
                {done
                  ? <Check size={14} color="white" />
                  : <Icon size={14} color={active ? 'white' : '#6C757D'} />
                }
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6C757D', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Passo {s.id}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#0A3956' : done ? '#28A745' : '#6C757D' }}>
                  {s.label}
                </div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 20px',
                background: step > s.id ? '#28A745' : '#DEE2E6',
                borderRadius: 2, transition: 'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 — Informações Gerais ──────────────────────────────────────────────

function Step1({ form, setField, universities, faculties, loadingFaculties }) {
  return (
    <div>
      <SectionTitle icon={FileText} title="Informações da Prova"
        subtitle="Define o título, duração, modo de avaliação e a faculdade alvo desta prova." />

      <div style={{ display: 'grid', gap: 20 }}>

        {/* Título */}
        <Field label="Título da Prova" required>
          <input
            value={form.title}
            onChange={e => setField('title', e.target.value)}
            placeholder="Ex: Simulação ISPU Engenharia Civil — Março 2026"
            style={inputStyle}
          />
        </Field>

        {/* Descrição */}
        <Field label="Descrição" hint="Opcional — contexto adicional sobre esta prova">
          <textarea
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            placeholder="Ex: Prova modelo baseada nos exames dos últimos 3 anos do ISPU..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </Field>

        {/* ✅ V13.4 — Universidade + Faculdade em cascata */}
        <div style={{
          background: '#F8FBFF', border: '1px solid #E0ECF8',
          borderRadius: 10, padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Building2 size={15} color="#0A3956" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0A3956' }}>
              Universidade / Faculdade Alvo
            </span>
            <span style={{ fontSize: 12, color: '#6C757D' }}>— Opcional</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Universidade */}
            <div>
              <label style={labelStyle}>Universidade / Instituto</label>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <select
                  value={form.targetUniversityId}
                  onChange={e => setField('targetUniversityId', e.target.value)}
                  style={{ ...inputStyle, appearance: 'none', paddingRight: 32 }}
                >
                  <option value="">Nenhuma (prova geral)</option>
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6C757D', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Faculdade — só activo após universidade seleccionada */}
            <div>
              <label style={{
                ...labelStyle,
                color: !form.targetUniversityId ? '#ADB5BD' : '#0A3956',
              }}>
                Faculdade / Curso
              </label>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <select
                  value={form.targetFacultyId}
                  onChange={e => setField('targetFacultyId', e.target.value)}
                  disabled={!form.targetUniversityId || loadingFaculties}
                  style={{
                    ...inputStyle,
                    appearance: 'none', paddingRight: 32,
                    background: !form.targetUniversityId ? '#F8F9FA' : 'white',
                    color: !form.targetUniversityId ? '#ADB5BD' : '#374151',
                    cursor: !form.targetUniversityId ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="">
                    {loadingFaculties
                      ? 'A carregar...'
                      : !form.targetUniversityId
                        ? 'Selecciona uma universidade primeiro'
                        : faculties.length === 0
                          ? 'Nenhuma faculdade disponível'
                          : 'Seleccionar faculdade...'}
                  </option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#ADB5BD', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div style={{ fontSize: 12, color: '#6C757D', marginTop: 10, paddingTop: 10, borderTop: '1px solid #E0ECF8' }}>
            Esta informação aparece no card da simulação e permite filtrar por faculdade na página pública.
          </div>
        </div>

        {/* Duração */}
        <Field label="Duração" required hint="Tempo total em minutos que o estudante tem para fazer a prova">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 160 }}>
              <Clock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6C757D' }} />
              <input
                type="number"
                min={1}
                value={form.duration}
                onChange={e => setField('duration', e.target.value)}
                placeholder="Ex: 120"
                style={{ ...inputStyle, paddingLeft: 36 }}
              />
            </div>
            {form.duration && !isNaN(form.duration) && Number(form.duration) > 0 && (
              <span style={{ fontSize: 13, color: '#6C757D' }}>
                = {Math.floor(form.duration / 60) > 0 ? `${Math.floor(form.duration / 60)}h ` : ''}
                {form.duration % 60 > 0 ? `${form.duration % 60}min` : ''}
              </span>
            )}
          </div>
        </Field>

        {/* Modo de Avaliação */}
        <Field label="Modo de Avaliação" required hint="Define como a nota final é calculada">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {SCORING_MODES.map(mode => {
              const Icon = mode.icon;
              const selected = form.scoringMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setField('scoringMode', mode.value)}
                  style={{
                    background: selected ? `${mode.color}08` : 'white',
                    border: `2px solid ${selected ? mode.color : '#DEE2E6'}`,
                    borderRadius: 12, padding: '16px 14px',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: selected ? mode.color : '#F8F9FA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 10, transition: 'all 0.15s',
                  }}>
                    <Icon size={18} color={selected ? 'white' : '#6C757D'} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: selected ? mode.color : '#0A3956', marginBottom: 4 }}>
                    {mode.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#6C757D', lineHeight: 1.4 }}>
                    {mode.description}
                  </div>
                  {selected && (
                    <div style={{
                      marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: mode.color, borderRadius: 20,
                      padding: '2px 10px', fontSize: 11, color: 'white', fontWeight: 600,
                    }}>
                      <Check size={10} /> Seleccionado
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Visibilidade */}
        <Field label="Visibilidade" hint="Define se os estudantes podem ver e fazer esta prova">
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { value: false, label: 'Privada', desc: 'Apenas visível para admins', icon: EyeOff },
              { value: true, label: 'Pública', desc: 'Visível e disponível para estudantes', icon: Eye },
            ].map(opt => {
              const Icon = opt.icon;
              const selected = form.isPublic === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setField('isPublic', opt.value)}
                  style={{
                    flex: 1, background: selected ? '#0A395608' : 'white',
                    border: `2px solid ${selected ? '#0A3956' : '#DEE2E6'}`,
                    borderRadius: 10, padding: '12px 16px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={18} color={selected ? '#0A3956' : '#6C757D'} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: selected ? '#0A3956' : '#374151' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 12, color: '#6C757D' }}>{opt.desc}</div>
                  </div>
                  {selected && <Check size={14} color="#0A3956" style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </div>
        </Field>

      </div>
    </div>
  );
}

// ─── Step 2 — Secções & Disciplinas ──────────────────────────────────────────

function Step2({ sections, subjects, scoringMode, weightType, setWeightType, totalPct, addSection, removeSection, updateSection }) {
  return (
    <div>
      <SectionTitle icon={Layers} title="Secções & Disciplinas"
        subtitle="Cada secção agrupa questões de uma disciplina. Podes ter múltiplas disciplinas numa só prova." />

      {scoringMode === 'WEIGHTED' && (
        <div style={{
          background: '#FFF8EC', border: '1px solid #F69220',
          borderRadius: 10, padding: '14px 18px', marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0A3956', marginBottom: 10 }}>
            Como defines os pesos das secções?
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {WEIGHT_TYPES.map(wt => (
              <button
                key={wt.value}
                type="button"
                onClick={() => setWeightType(wt.value)}
                style={{
                  flex: 1, background: weightType === wt.value ? '#0A3956' : 'white',
                  border: `1.5px solid ${weightType === wt.value ? '#0A3956' : '#DEE2E6'}`,
                  borderRadius: 8, padding: '10px 14px',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: weightType === wt.value ? 'white' : '#0A3956' }}>
                  {wt.label}
                </div>
                <div style={{ fontSize: 12, color: weightType === wt.value ? 'rgba(255,255,255,0.75)' : '#6C757D' }}>
                  {wt.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sections.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            border: '2px dashed #DEE2E6', borderRadius: 12, color: '#6C757D',
          }}>
            <Layers size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Nenhuma secção criada</div>
            <div style={{ fontSize: 13 }}>Clica em "Adicionar Secção" para começar</div>
          </div>
        )}

        {sections.map((sec, idx) => (
          <SectionRow
            key={sec.id}
            sec={sec}
            idx={idx}
            subjects={subjects}
            scoringMode={scoringMode}
            weightType={weightType}
            totalPct={totalPct}
            onRemove={() => removeSection(sec.id)}
            onChange={(key, val) => updateSection(sec.id, key, val)}
          />
        ))}
      </div>

      {scoringMode === 'WEIGHTED' && weightType === 'PERCENTAGE' && sections.length > 0 && (
        <WeightBar sections={sections} totalPct={totalPct} />
      )}

      <button
        type="button"
        onClick={addSection}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', marginTop: 16,
          background: 'white', border: '2px dashed #0A3956',
          borderRadius: 10, padding: '12px 18px',
          color: '#0A3956', fontWeight: 600, fontSize: 13,
          cursor: 'pointer', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F0F7FF'}
        onMouseLeave={e => e.currentTarget.style.background = 'white'}
      >
        <Plus size={16} /> Adicionar Secção
      </button>
    </div>
  );
}

function SectionRow({ sec, idx, subjects, scoringMode, weightType, totalPct, onRemove, onChange }) {
  return (
    <div style={{
      border: `2px solid ${sec.color}30`,
      borderLeft: `4px solid ${sec.color}`,
      borderRadius: 10, padding: '16px 18px',
      background: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ paddingTop: 8, color: '#6C757D', cursor: 'grab', flexShrink: 0 }}>
          <GripVertical size={16} />
        </div>

        <div style={{ flex: 1, display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nome da Secção</label>
              <input
                value={sec.name}
                onChange={e => onChange('name', e.target.value)}
                placeholder={`Ex: Álgebra, Cinemática, Secção ${idx + 1}...`}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Disciplina</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={sec.subjectId}
                  onChange={e => onChange('subjectId', e.target.value)}
                  style={{ ...inputStyle, appearance: 'none', paddingRight: 32 }}
                >
                  <option value="">Seleccionar disciplina...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6C757D', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          {scoringMode === 'WEIGHTED' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 160 }}>
                <label style={labelStyle}>
                  {weightType === 'PERCENTAGE' ? 'Peso (%)' : 'Pontuação'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    min={0}
                    max={weightType === 'PERCENTAGE' ? 100 : undefined}
                    value={sec.weight}
                    onChange={e => onChange('weight', e.target.value)}
                    placeholder={weightType === 'PERCENTAGE' ? 'Ex: 40' : 'Ex: 8'}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: 13, color: '#6C757D', fontWeight: 500 }}>
                    {weightType === 'PERCENTAGE' ? '%' : 'pts'}
                  </span>
                </div>
              </div>
              {weightType === 'PERCENTAGE' && sec.weight && totalPct > 0 && (
                <div style={{ marginTop: 18, fontSize: 12, color: sec.color, fontWeight: 600 }}>
                  {Math.round((Number(sec.weight) / 100) * 20 * 10) / 10} / 20 valores
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#DC3545', padding: 4, flexShrink: 0,
            borderRadius: 6, marginTop: 6,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function WeightBar({ sections, totalPct }) {
  const ok = Math.abs(totalPct - 100) < 0.1;
  return (
    <div style={{
      marginTop: 18,
      background: ok ? '#f0fff4' : '#fff5f5',
      border: `1px solid ${ok ? '#28A745' : '#DC3545'}`,
      borderRadius: 10, padding: '14px 18px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0A3956' }}>Distribuição de Pesos</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: ok ? '#28A745' : '#DC3545' }}>
          {totalPct}% / 100%
        </span>
      </div>
      <div style={{ height: 8, background: '#DEE2E6', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
        {sections.filter(s => s.weight).map(s => (
          <div key={s.id} style={{
            width: `${Math.min(Number(s.weight), 100)}%`,
            background: s.color, transition: 'width 0.3s',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
        {sections.filter(s => s.name).map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6C757D' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
            {s.name || 'Sem nome'}: {s.weight || 0}%
          </div>
        ))}
      </div>
      {!ok && <div style={{ fontSize: 12, color: '#DC3545', marginTop: 6 }}>
        A soma deve ser exactamente 100%. Faltam {(100 - totalPct).toFixed(1)}%.
      </div>}
    </div>
  );
}

// ─── Step 3 — Revisão ─────────────────────────────────────────────────────────

function Step3({ form, sections, subjects, universities, faculties }) {
  const scoreLabel = { SIMPLE: 'Simples', WEIGHTED: 'Por Secções', DRAFT: 'Rascunho' };
  const getSubjectName = id => subjects.find(s => s.id === id)?.name ?? '—';

  // ✅ V13.4 — nomes para mostrar na revisão
  const universityName = universities.find(u => u.id === form.targetUniversityId)?.name;
  const facultyName    = faculties.find(f => f.id === form.targetFacultyId)?.name;

  return (
    <div>
      <SectionTitle icon={Eye} title="Revisão Final"
        subtitle="Confirma os detalhes antes de criar a prova. Poderás editá-la depois em qualquer altura." />

      <div style={{
        background: '#F8F9FA', borderRadius: 12,
        border: '1px solid #DEE2E6', padding: 24, marginBottom: 24,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <ReviewItem label="Título" value={form.title} />
          <ReviewItem label="Duração" value={`${form.duration} min`} />
          <ReviewItem label="Modo de Avaliação" value={scoreLabel[form.scoringMode]} />
          <ReviewItem label="Visibilidade" value={form.isPublic ? 'Pública' : 'Privada'} />
          {/* ✅ V13.4 */}
          {universityName && (
            <ReviewItem label="Universidade / Instituto" value={universityName} />
          )}
          {facultyName && (
            <ReviewItem label="Faculdade" value={facultyName} />
          )}
          {!universityName && (
            <ReviewItem label="Universidade / Faculdade" value="Prova Geral (sem faculdade específica)" />
          )}
          {form.description && (
            <div style={{ gridColumn: '1 / -1' }}>
              <ReviewItem label="Descrição" value={form.description} />
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: '#0A3956', marginBottom: 12 }}>
        Secções ({sections.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sections.map((sec) => (
          <div key={sec.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'white', border: `1px solid ${sec.color}30`,
            borderLeft: `4px solid ${sec.color}`,
            borderRadius: 8, padding: '12px 16px',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0A3956' }}>{sec.name}</div>
              <div style={{ fontSize: 12, color: '#6C757D' }}>{getSubjectName(sec.subjectId)}</div>
            </div>
            {form.scoringMode === 'WEIGHTED' && (
              <div style={{
                background: `${sec.color}15`, border: `1px solid ${sec.color}30`,
                borderRadius: 20, padding: '4px 14px',
                fontSize: 13, fontWeight: 700, color: sec.color,
              }}>
                {sec.weight}{form.weightType === 'PERCENTAGE' ? '%' : ' pts'}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        background: '#EFF6FF', border: '1px solid #BFDBFE',
        borderRadius: 10, padding: '14px 16px', marginTop: 20,
        fontSize: 13, color: '#1e40af',
      }}>
        <BookOpen size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Após criar a prova, serás redirecionado para a página de detalhe onde poderás
          adicionar as questões a cada secção — manualmente ou por importação Excel.
        </span>
      </div>
    </div>
  );
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #DEE2E6' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: '#0A395608',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color="#0A3956" />
        </div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0A3956', margin: 0 }}>{title}</h2>
      </div>
      <p style={{ fontSize: 13, color: '#6C757D', margin: 0, paddingLeft: 46 }}>{subtitle}</p>
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <label style={labelStyle}>{label}{required && <span style={{ color: '#DC3545' }}> *</span>}</label>
        {hint && <span style={{ fontSize: 12, color: '#6C757D' }}>— {hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6C757D', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#0A3956' }}>{value}</div>
    </div>
  );
}

// ─── Estilos base ─────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1.5px solid #DEE2E6', borderRadius: 8,
  fontSize: 13, color: '#374151',
  outline: 'none', boxSizing: 'border-box',
  background: 'white', transition: 'border-color 0.15s',
};

const labelStyle = {
  fontSize: 13, fontWeight: 600, color: '#0A3956', display: 'block',
};

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  background: '#0A3956', color: 'white',
  border: 'none', borderRadius: 8,
  padding: '10px 22px', fontSize: 13, fontWeight: 600,
  cursor: 'pointer',
};

const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  background: 'white', color: '#0A3956',
  border: '1.5px solid #DEE2E6', borderRadius: 8,
  padding: '10px 18px', fontSize: 13, fontWeight: 600,
  cursor: 'pointer',
};

const btnGhost = {
  background: 'none', border: 'none',
  color: '#6C757D', fontSize: 13, fontWeight: 500,
  cursor: 'pointer', padding: '10px 14px',
};
