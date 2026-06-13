import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Search, RefreshCw, AlertCircle, X,
  Filter, WifiOff, Clock, CheckCircle, MessageSquare,
  Send, ChevronRight, Inbox, User, AtSign, Calendar
} from 'lucide-react';
import api from '../../services/api';
import { useAdminNotifications } from '../../context/AdminNotificationsContext';

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  NEW:     { bg: '#FFF3CD', text: '#856404', label: 'Nova'       },
  READ:    { bg: '#F3F4F6', text: '#374151', label: 'Lida'       },
  REPLIED: { bg: '#D4EDDA', text: '#155724', label: 'Respondida' },
};

const FILTER_OPTIONS = [
  { value: '',        label: 'Todas'       },
  { value: 'NEW',     label: 'Novas'       },
  { value: 'READ',    label: 'Lidas'       },
  { value: 'REPLIED', label: 'Respondidas' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getErrorMessage = (err) => {
  if (!navigator.onLine || err?.code === 'ERR_NETWORK') {
    return { title: 'Sem ligação à internet', message: 'Verifica a tua ligação e tenta novamente.', icon: WifiOff };
  }
  const status = err?.response?.status;
  if (status === 401) return { title: 'Sessão expirada', message: 'Serás redirecionado para o login.', icon: AlertCircle };
  if (status === 404) return { title: 'Mensagem não encontrada', message: 'Esta mensagem já não existe.', icon: AlertCircle };
  if (status === 409) return { title: 'Já respondida', message: 'Esta mensagem já foi respondida anteriormente.', icon: AlertCircle };
  if (status >= 500)  return { title: 'Erro no servidor', message: 'Ocorreu um problema interno. Tenta novamente mais tarde.', icon: AlertCircle };
  return { title: 'Erro inesperado', message: 'Algo correu mal. Tenta novamente.', icon: AlertCircle };
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 last:border-0">
            <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-24 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Badge de estado ──────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.READ;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Modal de Detalhe ─────────────────────────────────────────────────────────

function MessageModal({ message, onClose, onReplied }) {
  const [replyText, setReplyText]   = useState('');
  const [sending, setSending]       = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(false);
  const isReplied = message.status === 'REPLIED';

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    setReplyError(null);
    try {
      await api.post(`/admin/contact-messages/${message.id}/reply`, { replyText });
      setReplySuccess(true);
      setReplyText('');
      onReplied(message.id);
    } catch (err) {
      if (err.response?.status === 401) { onClose(); return; }
      setReplyError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const ErrIcon = replyError?.icon || AlertCircle;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#DEE2E6] flex-shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-base font-bold text-[#0A3956] truncate">{message.subject}</h2>
            <p className="text-xs text-[#6C757D] mt-0.5">{formatDate(message.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={message.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={18} className="text-[#6C757D]" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Info do remetente */}
          <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2.5">
              <User size={14} className="text-[#6C757D] flex-shrink-0" />
              <span className="text-sm font-semibold text-[#0A3956]">{message.name}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <AtSign size={14} className="text-[#6C757D] flex-shrink-0" />
              <span className="text-sm text-[#6C757D]">{message.email}</span>
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <p className="text-xs text-[#6C757D] uppercase tracking-wide font-semibold mb-2">Mensagem</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-white border border-[#DEE2E6] rounded-xl p-4">
              {message.message}
            </p>
          </div>

          {/* Resposta enviada — só se já respondida */}
          {isReplied && message.replyText && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={13} className="text-[#28A745]" />
                <p className="text-xs text-[#28A745] uppercase tracking-wide font-semibold">
                  Resposta enviada
                </p>
                {message.repliedAt && (
                  <span className="text-xs text-[#6C757D] ml-auto">{formatDate(message.repliedAt)}</span>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed bg-[#D4EDDA]/40 border border-[#28A745]/20 rounded-xl p-4 whitespace-pre-wrap">
                {message.replyText}
              </p>
            </div>
          )}

          {/* Campo de resposta — oculto se já respondida */}
          {!isReplied && !replySuccess && (
            <div>
              <label className="block text-xs text-[#6C757D] uppercase tracking-wide font-semibold mb-2">
                Escrever resposta
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={e => { setReplyText(e.target.value); setReplyError(null); }}
                placeholder="Escreve a tua resposta aqui..."
                className="w-full border border-[#DEE2E6] rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] resize-none transition-colors"
              />
              {replyError && (
                <div className="flex items-start gap-2.5 bg-[#F8D7DA] border border-[#F5C6CB] rounded-xl px-4 py-3 mt-3">
                  <ErrIcon size={15} className="text-[#DC3545] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#721C24]">{replyError.title}</p>
                    <p className="text-xs text-[#721C24] mt-0.5">{replyError.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sucesso no envio */}
          {replySuccess && (
            <div className="flex items-center gap-3 bg-[#D4EDDA] border border-[#28A745]/30 rounded-xl px-4 py-3">
              <CheckCircle size={16} className="text-[#28A745] flex-shrink-0" />
              <p className="text-sm font-semibold text-[#155724]">Resposta enviada com sucesso!</p>
            </div>
          )}
        </div>

        {/* Botões */}
        {!isReplied && !replySuccess && (
          <div className="px-6 pb-6 pt-2 flex flex-col gap-2 flex-shrink-0 border-t border-[#DEE2E6]">
            <button
              onClick={handleSend}
              disabled={sending || !replyText.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#0A3956' }}
            >
              {sending
                ? <><RefreshCw size={14} className="animate-spin" /> A enviar...</>
                : <><Send size={14} /> Enviar Resposta</>
              }
            </button>
            <button
              onClick={onClose}
              disabled={sending}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-[#6C757D] hover:bg-gray-100 transition-colors disabled:opacity-60"
            >
              Fechar
            </button>
          </div>
        )}

        {(isReplied || replySuccess) && (
          <div className="px-6 pb-6 pt-2 flex-shrink-0 border-t border-[#DEE2E6]">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-[#6C757D] hover:bg-gray-100 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ContactMessages() {
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [pageError, setPageError]     = useState(null);
  const [selectedId, setSelectedId]   = useState(null);
  const [modalMessage, setModalMessage] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('');

  const { refreshUnreadMessages } = useAdminNotifications();

  // ── Carregar lista ────────────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const url = filter ? `/admin/contact-messages?status=${filter}` : '/admin/contact-messages';
      const res = await api.get(url);
      const data = res.data?.data ?? res.data;
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401) { window.location.href = '/portal/acesso'; return; }
      setPageError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // ── Abrir mensagem ────────────────────────────────────────────────────────
  const handleOpen = async (msg) => {
    setSelectedId(msg.id);
    setModalLoading(true);
    try {
      const [detalheRes] = await Promise.all([
        api.get(`/admin/contact-messages/${msg.id}`),
        msg.status === 'NEW'
          ? api.patch(`/admin/contact-messages/${msg.id}/read`).catch(() => {})
          : Promise.resolve(),
      ]);
      const data = detalheRes.data?.data ?? detalheRes.data;
      setModalMessage(data);

      // Actualizar estado na lista local
      if (msg.status === 'NEW') {
        setMessages(prev =>
          prev.map(m => m.id === msg.id ? { ...m, status: 'READ' } : m)
        );
        refreshUnreadMessages();
      }
    } catch (err) {
      if (err.response?.status === 401) { window.location.href = '/portal/acesso'; return; }
    } finally {
      setModalLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    setModalMessage(null);
  };

  // ── Após responder ────────────────────────────────────────────────────────
  const handleReplied = (id) => {
    setMessages(prev =>
      prev.map(m => m.id === id ? { ...m, status: 'REPLIED' } : m)
    );
    if (modalMessage) {
      setModalMessage(prev => ({ ...prev, status: 'REPLIED' }));
    }
  };

  // ── Filtro de pesquisa local ──────────────────────────────────────────────
  const filtered = messages.filter(m => {
    const q = search.toLowerCase();
    return (
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q)
    );
  });

  const activeFilters = filter !== ''
    ? [{ key: 'status', label: FILTER_OPTIONS.find(f => f.value === filter)?.label }]
    : [];

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return <PageSkeleton />;

  // ── Erro de página ────────────────────────────────────────────────────────
  if (pageError) {
    const ErrIcon = pageError.icon || AlertCircle;
    return (
      <div className="p-4 md:p-6 max-w-[1200px] mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-[#F8D7DA] border border-[#F5C6CB] rounded-2xl p-6 max-w-md w-full text-center">
          <ErrIcon size={36} className="text-[#DC3545] mx-auto mb-3" />
          <p className="font-bold text-[#721C24] text-lg">{pageError.title}</p>
          <p className="text-sm text-[#721C24] mt-2">{pageError.message}</p>
          <button
            onClick={loadMessages}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
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
      {/* Modal de detalhe */}
      {modalLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-8 flex items-center gap-3 shadow-xl">
            <RefreshCw size={18} className="animate-spin text-[#0A3956]" />
            <span className="text-sm font-medium text-[#0A3956]">A carregar mensagem...</span>
          </div>
        </div>
      )}

      {modalMessage && !modalLoading && (
        <MessageModal
          message={modalMessage}
          onClose={handleClose}
          onReplied={handleReplied}
        />
      )}

      <div className="p-4 md:p-6 max-w-[1200px] mx-auto bg-[#F8F9FA] min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A3956]">Mensagens de Contacto</h1>
            <p className="text-sm text-[#6C757D] mt-0.5">{messages.length} mensagem{messages.length !== 1 ? 's' : ''} recebida{messages.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={loadMessages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#6C757D] border border-[#DEE2E6] bg-white hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Pesquisa */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" />
              <input
                type="text"
                placeholder="Pesquisar por nome, email ou assunto..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956]"
              />
            </div>

            {/* Filtro de estado */}
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" />
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="pl-8 pr-8 py-2 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] bg-white appearance-none cursor-pointer"
              >
                {FILTER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags de filtros activos */}
          {(activeFilters.length > 0 || search) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.map(f => (
                <span key={f.key} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#0A3956] text-xs font-medium rounded-full">
                  {f.label}
                  <button onClick={() => setFilter('')} className="hover:text-[#DC3545] transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#0A3956] text-xs font-medium rounded-full">
                  "{search}"
                  <button onClick={() => setSearch('')} className="hover:text-[#DC3545] transition-colors">
                    <X size={11} />
                  </button>
                </span>
              )}
              <button
                onClick={() => { setFilter(''); setSearch(''); }}
                className="text-xs text-[#6C757D] hover:text-[#DC3545] underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-[#6C757D] mb-2 px-1">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== messages.length && ` de ${messages.length}`}
        </p>

        {/* TABELA — Desktop */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hidden md:block">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6C757D]">
              <Inbox size={40} className="mb-3 opacity-30" />
              <p className="font-medium">Nenhuma mensagem encontrada</p>
              <p className="text-sm mt-1">Tenta ajustar os filtros de pesquisa</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#DEE2E6]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Remetente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Assunto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide hidden lg:table-cell">Data</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(msg => (
                  <tr
                    key={msg.id}
                    onClick={() => handleOpen(msg)}
                    className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-blue-50 transition-colors group ${msg.status === 'NEW' ? 'bg-[#FFFBF0]' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className={`text-[#0A3956] truncate max-w-[160px] ${msg.status === 'NEW' ? 'font-semibold' : 'font-medium'}`}>
                        {msg.name}
                      </p>
                      <p className="text-xs text-[#6C757D] truncate max-w-[160px]">{msg.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-gray-700 truncate max-w-[240px] ${msg.status === 'NEW' ? 'font-semibold' : ''}`}>
                        {msg.subject}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={msg.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6C757D] hidden lg:table-cell">
                      {formatDate(msg.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0A3956] transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* CARDS — Mobile */}
        <div className="flex flex-col gap-3 md:hidden">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-14 text-[#6C757D]">
              <Inbox size={36} className="mb-3 opacity-30" />
              <p className="font-medium">Nenhuma mensagem encontrada</p>
            </div>
          ) : (
            filtered.map(msg => (
              <div
                key={msg.id}
                onClick={() => handleOpen(msg)}
                className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer active:bg-blue-50 transition-colors ${msg.status === 'NEW' ? 'border-l-4 border-[#F69220]' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className={`text-[#0A3956] truncate ${msg.status === 'NEW' ? 'font-semibold' : 'font-medium'}`}>
                      {msg.name}
                    </p>
                    <p className="text-xs text-[#6C757D] truncate">{msg.email}</p>
                  </div>
                  <StatusBadge status={msg.status} />
                </div>
                <p className={`text-sm text-gray-700 truncate mb-2 ${msg.status === 'NEW' ? 'font-semibold' : ''}`}>
                  {msg.subject}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6C757D]">{formatDate(msg.createdAt)}</span>
                  <ChevronRight size={16} className="text-[#6C757D]" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
}
