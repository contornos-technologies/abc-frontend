import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, BookOpen, Clock, Eye, EyeOff,
  Archive, AlertCircle, ChevronRight, FileText,
} from 'lucide-react';
import api from '../../services/api';

// ─── Constantes ───────────────────────────────────────────────────────────────

const SCORING_LABELS = {
  SIMPLE: 'Simples',
  WEIGHTED: 'Por Secções',
  DRAFT: 'Rascunho',
};

const SCORING_COLORS = {
  SIMPLE: '#0A3956',
  WEIGHTED: '#F69220',
  DRAFT: '#6C757D',
};

// ─── Hook responsivo ──────────────────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ExamsList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // ─── Carregar provas ────────────────────────────────────────────────────────

  const loadExams = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/exams');
      const data = res.data?.data ?? res.data;
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
      setError('Não foi possível carregar as provas. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExams(); }, []);

  // ─── Filtros ────────────────────────────────────────────────────────────────

  const filtered = exams.filter(exam => {
    const matchSearch = exam.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'public' ? exam.isPublic && !exam.isArchived :
      filterStatus === 'private' ? !exam.isPublic && !exam.isArchived :
      filterStatus === 'archived' ? exam.isArchived : true;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: exams.length,
    public: exams.filter(e => e.isPublic && !e.isArchived).length,
    private: exams.filter(e => !e.isPublic && !e.isArchived).length,
    archived: exams.filter(e => e.isArchived).length,
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: isMobile ? 16 : 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Cabeçalho ── */}
        <div style={{
          display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 12 : 0,
          marginBottom: 24,
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#0A3956', margin: '0 0 4px' }}>
              Provas de Simulação
            </h1>
            <p style={{ fontSize: 13, color: '#6C757D', margin: 0 }}>
              {exams.length === 0
                ? 'Nenhuma prova criada ainda'
                : `${exams.length} ${exams.length === 1 ? 'prova encontrada' : 'provas encontradas'}`}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/exams/new')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0A3956', color: 'white',
              border: 'none', borderRadius: 8,
              padding: '10px 20px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#0D4A6E'}
            onMouseLeave={e => e.currentTarget.style.background = '#0A3956'}
          >
            <Plus size={16} /> Nova Prova
          </button>
        </div>

        {/* ── Erro ── */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff5f5', border: '1px solid #DC3545',
            borderRadius: 10, padding: '12px 16px',
            color: '#DC3545', fontSize: 13, marginBottom: 20,
          }}>
            <AlertCircle size={16} /> {error}
            <button
              onClick={loadExams}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: '#DC3545', fontWeight: 600, cursor: 'pointer', fontSize: 13,
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* ── Filtros + Pesquisa ── */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: 12, marginBottom: 20,
        }}>
          {/* Tabs de filtro — scroll horizontal em mobile */}
          <div style={{
            display: 'flex', gap: 4,
            background: 'white', border: '1px solid #DEE2E6',
            borderRadius: 10, padding: 4,
            overflowX: isMobile ? 'auto' : 'visible',
          }}>
            {[
              { key: 'all', label: 'Todas' },
              { key: 'public', label: 'Públicas' },
              { key: 'private', label: 'Privadas' },
              { key: 'archived', label: 'Arquivadas' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                style={{
                  background: filterStatus === f.key ? '#0A3956' : 'none',
                  color: filterStatus === f.key ? 'white' : '#6C757D',
                  border: 'none', borderRadius: 7,
                  padding: '6px 12px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {f.label}
                <span style={{
                  background: filterStatus === f.key ? 'rgba(255,255,255,0.2)' : '#F0F0F0',
                  color: filterStatus === f.key ? 'white' : '#6C757D',
                  borderRadius: 20, padding: '1px 7px',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Pesquisa */}
          <div style={{ position: 'relative', width: isMobile ? '100%' : 260 }}>
            <Search size={14} style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: '#6C757D',
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar por título..."
              style={{
                width: '100%', padding: '9px 12px 9px 34px',
                border: '1.5px solid #DEE2E6', borderRadius: 8,
                fontSize: 13, color: '#374151', outline: 'none',
                boxSizing: 'border-box', background: 'white',
              }}
            />
          </div>
        </div>

        {/* ── Lista de Provas ── */}
        {filtered.length === 0 ? (
          <EmptyState
            hasExams={exams.length > 0}
            onCreateNew={() => navigate('/admin/exams/new')}
          />
        ) : isMobile ? (
          /* ── MOBILE: Cards ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(exam => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onClick={() => navigate(`/admin/exams/${exam.id}`)}
              />
            ))}
          </div>
        ) : (
          /* ── DESKTOP: Tabela ── */
          <div style={{
            background: 'white', borderRadius: 14,
            border: '1px solid #DEE2E6', overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            {/* Cabeçalho da tabela */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 80px 100px 110px 44px',
              padding: '10px 20px',
              background: '#F8F9FA',
              borderBottom: '1px solid #DEE2E6',
            }}>
              {['Prova', 'Disciplinas', 'Questões', 'Duração', 'Estado', ''].map((col, i) => (
                <div key={i} style={{
                  fontSize: 11, fontWeight: 600, color: '#6C757D',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {col}
                </div>
              ))}
            </div>
            {/* Linhas */}
            {filtered.map((exam, idx) => (
              <ExamRow
                key={exam.id}
                exam={exam}
                isLast={idx === filtered.length - 1}
                onClick={() => navigate(`/admin/exams/${exam.id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Desktop: Linha da tabela ─────────────────────────────────────────────────

function ExamRow({ exam, isLast, onClick }) {
  const [hovered, setHovered] = useState(false);
  const disciplinas = exam.sections?.map(s => s.subject?.name).filter(Boolean) ?? [];
  const scoringColor = SCORING_COLORS[exam.scoringMode] ?? '#6C757D';
  const scoringLabel = SCORING_LABELS[exam.scoringMode] ?? '—';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 80px 100px 110px 44px',
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : '1px solid #F0F0F0',
        background: hovered ? '#F8FAFF' : 'white',
        cursor: 'pointer', transition: 'background 0.1s',
        alignItems: 'center',
      }}
    >
      {/* Título */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0A3956', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          {exam.isArchived && <Archive size={13} color="#F69220" />}
          {exam.title}
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: `${scoringColor}12`, border: `1px solid ${scoringColor}25`,
          color: scoringColor, borderRadius: 20, padding: '2px 9px',
          fontSize: 11, fontWeight: 600,
        }}>
          {scoringLabel}
        </span>
      </div>

      {/* Disciplinas */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {disciplinas.length === 0 ? (
          <span style={{ fontSize: 12, color: '#B0B0B0' }}>—</span>
        ) : disciplinas.slice(0, 2).map((d, i) => (
          <span key={i} style={{
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            color: '#1e40af', borderRadius: 20, padding: '2px 9px',
            fontSize: 11, fontWeight: 500,
          }}>{d}</span>
        ))}
        {disciplinas.length > 2 && (
          <span style={{
            background: '#F8F9FA', border: '1px solid #DEE2E6',
            color: '#6C757D', borderRadius: 20, padding: '2px 9px', fontSize: 11,
          }}>+{disciplinas.length - 2}</span>
        )}
      </div>

      {/* Questões */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <BookOpen size={13} color="#6C757D" />
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
          {exam.totalQuestions ?? exam._count?.questions ?? '—'}
        </span>
      </div>

      {/* Duração */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Clock size={13} color="#6C757D" />
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
          {exam.duration ? `${exam.duration} min` : '—'}
        </span>
      </div>

      {/* Estado */}
      <div><StatusBadge exam={exam} /></div>

      {/* Seta */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ChevronRight size={16} color={hovered ? '#0A3956' : '#DEE2E6'} style={{ transition: 'color 0.15s' }} />
      </div>
    </div>
  );
}

// ─── Mobile: Card de prova ────────────────────────────────────────────────────

function ExamCard({ exam, onClick }) {
  const disciplinas = exam.sections?.map(s => s.subject?.name).filter(Boolean) ?? [];
  const scoringColor = SCORING_COLORS[exam.scoringMode] ?? '#6C757D';
  const scoringLabel = SCORING_LABELS[exam.scoringMode] ?? '—';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white', borderRadius: 12,
        border: '1px solid #DEE2E6',
        borderLeft: `4px solid ${scoringColor}`,
        padding: '16px',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Linha topo: título + seta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, marginRight: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0A3956', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            {exam.isArchived && <Archive size={13} color="#F69220" />}
            {exam.title}
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: `${scoringColor}12`, border: `1px solid ${scoringColor}25`,
            color: scoringColor, borderRadius: 20, padding: '2px 9px',
            fontSize: 11, fontWeight: 600,
          }}>
            {scoringLabel}
          </span>
        </div>
        <ChevronRight size={18} color="#DEE2E6" />
      </div>

      {/* Linha meio: disciplinas */}
      {disciplinas.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {disciplinas.map((d, i) => (
            <span key={i} style={{
              background: '#EFF6FF', border: '1px solid #BFDBFE',
              color: '#1e40af', borderRadius: 20, padding: '2px 9px',
              fontSize: 11, fontWeight: 500,
            }}>{d}</span>
          ))}
        </div>
      )}

      {/* Linha fundo: questões + duração + estado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <BookOpen size={13} color="#6C757D" />
            <span style={{ fontSize: 12, color: '#6C757D' }}>
              {exam.totalQuestions ?? exam._count?.questions ?? '—'} questões
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={13} color="#6C757D" />
            <span style={{ fontSize: 12, color: '#6C757D' }}>
              {exam.duration ? `${exam.duration} min` : '—'}
            </span>
          </div>
        </div>
        <StatusBadge exam={exam} />
      </div>
    </div>
  );
}

// ─── Badge de estado (partilhado) ─────────────────────────────────────────────

function StatusBadge({ exam }) {
  if (exam.isArchived) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: '#FFF3CD', border: '1px solid #F69220',
      color: '#856404', borderRadius: 20, padding: '4px 12px',
      fontSize: 12, fontWeight: 600,
    }}>
      <Archive size={11} /> Arquivada
    </span>
  );
  if (exam.isPublic) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: '#D1E7DD', border: '1px solid #28A745',
      color: '#0F5132', borderRadius: 20, padding: '4px 12px',
      fontSize: 12, fontWeight: 600,
    }}>
      <Eye size={11} /> Pública
    </span>
  );
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: '#F8F9FA', border: '1px solid #DEE2E6',
      color: '#6C757D', borderRadius: 20, padding: '4px 12px',
      fontSize: 12, fontWeight: 600,
    }}>
      <EyeOff size={11} /> Privada
    </span>
  );
}

// ─── Estado Vazio ─────────────────────────────────────────────────────────────

function EmptyState({ hasExams, onCreateNew }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14,
      border: '2px dashed #DEE2E6',
      padding: '60px 20px', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: '#0A395608', border: '1px solid #DEE2E6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <FileText size={24} color="#0A3956" style={{ opacity: 0.4 }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0A3956', marginBottom: 6 }}>
        {hasExams ? 'Nenhuma prova encontrada' : 'Nenhuma prova criada ainda'}
      </div>
      <div style={{ fontSize: 13, color: '#6C757D', marginBottom: 24 }}>
        {hasExams
          ? 'Tenta ajustar os filtros ou a pesquisa.'
          : 'Cria a primeira prova de simulação para os teus estudantes.'}
      </div>
      {!hasExams && (
        <button
          onClick={onCreateNew}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#0A3956', color: 'white',
            border: 'none', borderRadius: 8,
            padding: '10px 22px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={15} /> Criar Primeira Prova
        </button>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  const isMobile = window.innerWidth <= 768;
  const sk = (w, h, r = 6) => (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: '#E9ECEF', animation: 'pulse 1.5s infinite',
    }} />
  );
  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: isMobile ? 16 : 24 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sk(200, 26, 8)}{sk(140, 16, 6)}
          </div>
          {sk(130, 40, 8)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
          {sk(isMobile ? '100%' : 300, 40, 10)}
          {!isMobile && sk(220, 40, 8)}
        </div>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 12, border: '1px solid #DEE2E6', padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sk('70%', 16)}{sk('30%', 20, 20)}
                  <div style={{ display: 'flex', gap: 8 }}>{sk(60, 20, 20)}{sk(60, 20, 20)}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {sk(100, 14)}{sk(70, 24, 20)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #DEE2E6', overflow: 'hidden' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 80px 100px 110px 44px',
                padding: '16px 20px', borderBottom: '1px solid #F0F0F0', alignItems: 'center', gap: 8,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {sk('60%', 14)}{sk('30%', 18, 20)}
                </div>
                {sk('70%', 20, 20)}{sk(40, 14)}{sk(60, 14)}{sk(80, 24, 20)}{sk(16, 16, 4)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
