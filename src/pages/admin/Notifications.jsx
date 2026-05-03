// src/pages/admin/Notifications.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Send, CheckCircle, XCircle, Clock,
  Search, RefreshCw, AlertCircle, ChevronRight,
  ChevronLeft, X, WifiOff, AlertTriangle,
  MessageSquare, User, Filter, Plus, Eye, EyeOff
} from 'lucide-react';
import api from '../../services/api';

// ─── Constantes ───────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#0A3956', '#F69220', '#28A745', '#6C63FF', '#DC3545', '#17A2B8'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const STATUS_CONFIG = {
  SENT:    { bg: '#D4EDDA', text: '#155724', icon: CheckCircle, label: 'Enviado'  },
  FAILED:  { bg: '#F8D7DA', text: '#721C24', icon: XCircle,    label: 'Falhado'  },
  PENDING: { bg: '#FFF3CD', text: '#856404', icon: Clock,       label: 'Pendente' },
};

const TEMPLATE_CONFIG = {
  inscricao:          { label: 'Inscrição',          color: '#0A3956', requiresTarget: true  },
  pagamento_aprovado: { label: 'Pagamento Aprovado',  color: '#28A745', requiresTarget: true  },
  texto_livre:        { label: 'Texto Livre',          color: '#F69220', requiresTarget: false },
};

const STATUS_OPTIONS = ['Todos', 'SENT', 'FAILED', 'PENDING'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getErrorMessage = (err) => {
  if (!navigator.onLine || err.code === 'ERR_NETWORK') {
    return {
      title: 'Sem ligação à internet',
      message: 'Verifica a tua ligação e tenta novamente.',
      icon: WifiOff,
    };
  }
  if (err.code === 'ECONNABORTED') {
    return {
      title: 'Tempo de resposta esgotado',
      message: 'O servidor demorou demasiado. Tenta novamente.',
      icon: Clock,
    };
  }

  const status = err.response?.status;
  const serverMessage = err.response?.data?.error || err.response?.data?.message || '';

  if (serverMessage.includes('Authentication Error') || serverMessage.includes('token')) {
    return {
      title: 'Erro de autenticação WhatsApp',
      message: 'O token do WhatsApp Business expirou. O administrador do sistema precisa de actualizar o token nas variáveis de ambiente do Railway.',
      icon: AlertTriangle,
    };
  }
  if (serverMessage.includes('phone number not in allowed list')) {
    return {
      title: 'Número não autorizado',
      message: 'Este número de telemóvel não está na lista de números permitidos pelo WhatsApp Business em modo de teste. Adiciona o número no painel do Facebook Developers.',
      icon: AlertTriangle,
    };
  }
  if (serverMessage.includes('targetId')) {
    return {
      title: 'Inscrição obrigatória',
      message: 'Este template requer que selecciones uma inscrição específica do estudante.',
      icon: AlertCircle,
    };
  }
  if (status === 400) {
    return {
      title: 'Dados inválidos',
      message: serverMessage || 'Verifica os dados e tenta novamente.',
      icon: AlertCircle,
    };
  }
  if (status === 401 || status === 403) {
    return {
      title: 'Sessão expirada',
      message: 'A tua sessão expirou. Serás redirecionado para o login.',
      icon: AlertCircle,
    };
  }
  if (status === 404) {
    return {
      title: 'Estudante não encontrado',
      message: 'O estudante seleccionado já não existe no sistema.',
      icon: AlertCircle,
    };
  }
  if (status >= 500) {
    return {
      title: 'Erro no servidor',
      message: 'Ocorreu um problema interno. Tenta novamente mais tarde.',
      icon: AlertCircle,
    };
  }
  return {
    title: 'Erro inesperado',
    message: serverMessage || 'Algo correu mal. Tenta novamente ou contacta o suporte.',
    icon: AlertCircle,
  };
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function TemplateBadge({ template }) {
  const cfg = TEMPLATE_CONFIG[template] || { label: template, color: '#6C757D' };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function KpiCard({ label, value, color, icon: Icon, sub }) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="rounded-lg p-2 flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-[#6B7280] mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-[#0A3956] leading-tight">{value}</p>
        {sub && <p className="text-xs text-[#6C757D] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 last:border-0">
            <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modal de Nova Notificação ────────────────────────────────────────────────

function SendModal({ onClose, onSuccess }) {
  const [students, setStudents]     = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [template, setTemplate]     = useState('inscricao');
  const [studentId, setStudentId]   = useState('');
  const [targetId, setTargetId]     = useState('');
  const [message, setMessage]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const selectedStudent = students.find(s => s.id === studentId);
  const requiresTarget  = TEMPLATE_CONFIG[template]?.requiresTarget;
  const isTextoLivre    = template === 'texto_livre';

  // Carregar lista de estudantes
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/students');
        const data = res.data?.data ?? res.data;
        setStudents(Array.isArray(data) ? data : []);
      } catch {
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    load();
  }, []);

  // Reset targetId quando muda o estudante ou template
  useEffect(() => { setTargetId(''); }, [studentId, template]);

  const handleSubmit = async () => {
    setError(null);

    if (!studentId) {
      setError({ title: 'Estudante obrigatório', message: 'Selecciona um estudante para enviar a notificação.', icon: AlertTriangle });
      return;
    }
    if (requiresTarget && !targetId) {
      setError({ title: 'Inscrição obrigatória', message: 'Este template requer que selecciones uma inscrição do estudante.', icon: AlertTriangle });
      return;
    }
    if (isTextoLivre && !message.trim()) {
      setError({ title: 'Mensagem obrigatória', message: 'Escreve a mensagem que queres enviar ao estudante.', icon: AlertTriangle });
      return;
    }

    setLoading(true);
    try {
      const body = { studentId, template };
      if (requiresTarget) body.targetId = targetId;
      if (isTextoLivre)   body.message  = message.trim();
      await api.post('/admin/notifications/whatsapp', body);
      onSuccess();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        onClose();
        window.location.href = '/portal/acesso';
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const ErrorIcon = error?.icon || AlertCircle;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full flex flex-col"
        style={{ maxWidth: '480px', maxHeight: 'calc(100vh - 32px)' }}
      >
        {/* Header fixo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DEE2E6] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#0A395618' }}>
              <Send size={16} style={{ color: '#0A3956' }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0A3956]">Nova Notificação</h2>
              <p className="text-xs text-[#6C757D]">Enviar mensagem WhatsApp ao estudante</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-2 flex-shrink-0">
            <X size={18} className="text-[#6C757D]" />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-[#0A3956] mb-1.5">
              Tipo de mensagem
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TEMPLATE_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => { setTemplate(key); setError(null); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-center transition-all"
                  style={{
                    borderColor: template === key ? cfg.color : '#DEE2E6',
                    backgroundColor: template === key ? `${cfg.color}10` : 'white',
                  }}
                >
                  <MessageSquare size={16} style={{ color: template === key ? cfg.color : '#6C757D' }} />
                  <span className="text-xs font-medium leading-tight" style={{ color: template === key ? cfg.color : '#6C757D' }}>
                    {cfg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Estudante */}
          <div>
            <label className="block text-sm font-medium text-[#0A3956] mb-1.5">
              Estudante
            </label>
            {loadingStudents ? (
              <Skeleton className="h-10 w-full rounded-lg" />
            ) : (
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" />
                <select
                  value={studentId}
                  onChange={e => { setStudentId(e.target.value); setError(null); }}
                  className="w-full pl-8 pr-4 py-2.5 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] bg-white appearance-none"
                >
                  <option value="">Seleccionar estudante...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} — {s.bi}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Inscrição — só se o template precisar e houver estudante seleccionado */}
          {requiresTarget && studentId && (
            <div>
              <label className="block text-sm font-medium text-[#0A3956] mb-1.5">
                Inscrição do estudante
              </label>
              {selectedStudent?.targets?.length > 0 ? (
                <select
                  value={targetId}
                  onChange={e => { setTargetId(e.target.value); setError(null); }}
                  className="w-full px-3 py-2.5 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] bg-white"
                >
                  <option value="">Seleccionar inscrição...</option>
                  {selectedStudent.targets.map(t => (
                    <option key={t.id} value={t.id}>
                      Ano {t.year} — {t.subjectCount} disc. — {Number(t.finalAmount).toLocaleString('pt-PT')} Kz
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#FFF3CD] border border-[#FFEEBA] rounded-lg">
                  <AlertTriangle size={14} className="text-[#856404] flex-shrink-0" />
                  <p className="text-xs text-[#856404]">Este estudante não tem inscrições registadas.</p>
                </div>
              )}
            </div>
          )}

          {/* Mensagem — só para texto_livre */}
          {isTextoLivre && (
            <div>
              <label className="block text-sm font-medium text-[#0A3956] mb-1.5">
                Mensagem
              </label>
              <textarea
                value={message}
                onChange={e => { setMessage(e.target.value); setError(null); }}
                placeholder="Escreve aqui a mensagem a enviar ao estudante..."
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] resize-none"
              />
              <p className="text-xs text-[#6C757D] mt-1">{message.length} caracteres</p>
            </div>
          )}

          {/* Info do estudante seleccionado */}
          {selectedStudent && (
            <div className="flex items-center gap-3 bg-[#F8F9FA] rounded-lg px-3 py-2.5 border border-[#DEE2E6]">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: avatarColor(selectedStudent.fullName || '') }}
              >
                {(selectedStudent.fullName || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#0A3956] truncate">{selectedStudent.fullName}</p>
                <p className="text-xs text-[#6C757D]">{selectedStudent.phone || 'Sem telefone'}</p>
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="flex items-start gap-2.5 bg-[#F8D7DA] border border-[#F5C6CB] rounded-lg px-3 py-2.5">
              <ErrorIcon size={15} className="text-[#DC3545] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#721C24]">{error.title}</p>
                <p className="text-xs text-[#721C24] mt-0.5">{error.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Botões fixos em baixo */}
        <div className="px-5 pb-5 pt-3 border-t border-[#DEE2E6] flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#0A3956' }}
          >
            {loading
              ? <><RefreshCw size={14} className="animate-spin" /> A enviar...</>
              : <><Send size={14} /> Enviar Notificação</>
            }
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-medium text-[#6C757D] hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Linha de Notificação com detalhe de erro expansível ──────────────────────

function NotificationRow({ notif }) {
  const [expanded, setExpanded] = useState(false);
  const name  = notif.student?.fullName || 'Sem nome';
  const color = avatarColor(name);
  const haserror = notif.status === 'FAILED' && notif.errorMessage;

  return (
    <>
      {/* Linha desktop */}
      <tr className="border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors group">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: color }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-[#0A3956] truncate max-w-[160px]">{name}</p>
              <p className="text-xs text-[#6C757D]">{notif.phone || notif.student?.phone || '—'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <TemplateBadge template={notif.template} />
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={notif.status} />
        </td>
        <td className="px-4 py-3 text-xs text-[#6C757D] hidden lg:table-cell">
          {notif.sentBy?.email || '—'}
        </td>
        <td className="px-4 py-3 text-xs text-[#6C757D] hidden md:table-cell">
          {formatDate(notif.sentAt || notif.createdAt)}
        </td>
        <td className="px-4 py-3">
          {haserror && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-xs text-[#DC3545] hover:underline"
            >
              {expanded ? <EyeOff size={13} /> : <Eye size={13} />}
              {expanded ? 'Ocultar' : 'Ver erro'}
            </button>
          )}
        </td>
      </tr>

      {/* Linha de detalhe do erro */}
      {expanded && haserror && (
        <tr className="bg-[#FFF5F5]">
          <td colSpan={6} className="px-4 py-3">
            <div className="flex items-start gap-2 text-xs text-[#721C24]">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Detalhe do erro:</p>
                <p className="font-mono break-all">{notif.errorMessage}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Card mobile de notificação
function NotificationCard({ notif }) {
  const [expanded, setExpanded] = useState(false);
  const name  = notif.student?.fullName || 'Sem nome';
  const color = avatarColor(name);
  const haserror = notif.status === 'FAILED' && notif.errorMessage;

  return (
    <div
      className="bg-white rounded-xl shadow-sm p-4"
      style={{ borderLeft: `3px solid ${STATUS_CONFIG[notif.status]?.bg || '#DEE2E6'}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0A3956] truncate">{name}</p>
          <p className="text-xs text-[#6C757D]">{notif.phone || notif.student?.phone || '—'}</p>
        </div>
        <StatusBadge status={notif.status} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <TemplateBadge template={notif.template} />
          <span className="text-xs text-[#6C757D]">{formatDate(notif.sentAt || notif.createdAt)}</span>
        </div>
        {haserror && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-xs text-[#DC3545] hover:underline ml-2"
          >
            {expanded ? <EyeOff size={12} /> : <Eye size={12} />}
            {expanded ? 'Ocultar' : 'Ver erro'}
          </button>
        )}
      </div>

      {expanded && haserror && (
        <div className="mt-3 flex items-start gap-2 bg-[#FFF5F5] rounded-lg px-3 py-2.5 border border-[#F5C6CB]">
          <AlertCircle size={13} className="text-[#DC3545] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#721C24] font-mono break-all">{notif.errorMessage}</p>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination]       = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading]             = useState(true);
  const [pageError, setPageError]         = useState(null);
  const [showModal, setShowModal]         = useState(false);

  // Filtros
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Carregar notificações ──────────────────────────────────────────────────
  const loadData = useCallback(async (page = 1) => {
    setLoading(true);
    setPageError(null);
    try {
      const res = await api.get('/admin/notifications', {
        params: { page, limit: 20 },
      });
      const data = res.data?.data ?? res.data;
      const pag  = res.data?.pagination;
      setNotifications(Array.isArray(data) ? data : []);
      if (pag) setPagination(pag);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/portal/acesso'); return; }
      setPageError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadData(currentPage); }, [loadData, currentPage]);

  // ── Após envio bem sucedido ────────────────────────────────────────────────
  const handleSendSuccess = () => {
    setShowModal(false);
    setCurrentPage(1);
    loadData(1);
  };

  // ── Filtros locais ─────────────────────────────────────────────────────────
  const filtered = notifications.filter(n => {
    const name = n.student?.fullName?.toLowerCase() || '';
    const q    = search.toLowerCase();
    return (
      (!q || name.includes(q)) &&
      (statusFilter === 'Todos' || n.status === statusFilter)
    );
  });

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const totalSent    = notifications.filter(n => n.status === 'SENT').length;
  const totalFailed  = notifications.filter(n => n.status === 'FAILED').length;
  const totalPending = notifications.filter(n => n.status === 'PENDING').length;

  if (loading) return <PageSkeleton />;

  if (pageError) {
    const ErrIcon = pageError.icon || AlertCircle;
    return (
      <div className="p-4 md:p-6 max-w-[1200px] mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#F8D7DA] border border-[#F5C6CB] rounded-2xl p-6 max-w-md w-full text-center">
          <ErrIcon size={36} className="text-[#DC3545] mx-auto mb-3" />
          <p className="font-bold text-[#721C24] text-lg">{pageError.title}</p>
          <p className="text-sm text-[#721C24] mt-2">{pageError.message}</p>
          <button
            onClick={() => loadData(1)}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#0A3956' }}
          >
            <RefreshCw size={14} /> Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <SendModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSendSuccess}
        />
      )}

      <div className="p-4 md:p-6 max-w-[1200px] mx-auto bg-[#F8F9FA] min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A3956]">Notificações</h1>
            <p className="text-sm text-[#6C757D] mt-0.5">{pagination.total} notificações registadas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0A3956' }}
          >
            <Plus size={15} />
            Nova Notificação
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard label="Enviadas com Sucesso" value={totalSent}    color="#28A745" icon={CheckCircle}
            sub={`${pagination.total} no total`} />
          <KpiCard label="Falhadas"              value={totalFailed}  color="#DC3545" icon={XCircle}
            sub="Ver detalhe do erro em cada linha" />
          <KpiCard label="Pendentes"             value={totalPending} color="#F69220" icon={Clock}
            sub="Aguardam processamento" />
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" />
              <input
                type="text"
                placeholder="Pesquisar por nome do estudante..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956]"
              />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" />
              <select
                value={statusFilter}
                onChange={e => setStatus(e.target.value)}
                className="pl-8 pr-8 py-2 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] bg-white appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>
                    {s === 'Todos' ? 'Todos os estados' : STATUS_CONFIG[s]?.label || s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#6C757D] mb-2 px-1">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== notifications.length && ` de ${notifications.length}`}
        </p>

        {/* TABELA — Desktop */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hidden md:block">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6C757D]">
              <Bell size={40} className="mb-3 opacity-30" />
              <p className="font-medium">Nenhuma notificação encontrada</p>
              <p className="text-sm mt-1">Tenta ajustar os filtros ou envia a primeira notificação</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: '#0A3956' }}
              >
                <Plus size={14} /> Nova Notificação
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#DEE2E6]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Estudante</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Template</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide hidden lg:table-cell">Enviado por</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide hidden md:table-cell">Data</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(notif => (
                  <NotificationRow key={notif.id} notif={notif} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* CARDS — Mobile */}
        <div className="flex flex-col gap-3 md:hidden">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-14 text-[#6C757D]">
              <Bell size={36} className="mb-3 opacity-30" />
              <p className="font-medium">Nenhuma notificação encontrada</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: '#0A3956' }}
              >
                <Plus size={14} /> Nova Notificação
              </button>
            </div>
          ) : (
            filtered.map(notif => (
              <NotificationCard key={notif.id} notif={notif} />
            ))
          )}
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-[#DEE2E6] bg-white text-[#0A3956] disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={15} /> Anterior
            </button>
            <span className="text-sm text-[#6C757D]">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-[#DEE2E6] bg-white text-[#0A3956] disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Próxima <ChevronRight size={15} />
            </button>
          </div>
        )}

      </div>
    </>
  );
}
