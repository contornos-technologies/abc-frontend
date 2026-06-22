import { useState, useEffect, useRef, useCallback } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'
import {
  MessageSquare,
  Search,
  CheckCheck,
  Archive,
  Send,
  ChevronDown,
  RefreshCw,
  User,
} from 'lucide-react'

const STATUS_LABELS = {
  OPEN: { label: 'Aberta', color: 'bg-green-100 text-green-800' },
  RESOLVED: { label: 'Resolvida', color: 'bg-gray-100 text-gray-600' },
  ARCHIVED: { label: 'Arquivada', color: 'bg-yellow-100 text-yellow-800' },
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('pt-AO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminWhatsApp() {
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('OPEN')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingConv, setLoadingConv] = useState(false)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  // ── Carregar lista ──────────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      if (search) params.set('search', search)
      const { data } = await api.get(`/whatsapp/conversations?${params}`)
      setConversations(data)
    } catch {
      // silencioso — não bloquear UX
    } finally {
      setLoadingList(false)
    }
  }, [filterStatus, search])

  useEffect(() => {
    setLoadingList(true)
    loadConversations()
  }, [loadConversations])

  // ── Polling da conversa activa (5s) ────────────────────────────────────────
  useEffect(() => {
    if (!selected) return
    pollRef.current = setInterval(() => loadMessages(selected.id, false), 5000)
    return () => clearInterval(pollRef.current)
  }, [selected])

  // ── Abrir conversa ──────────────────────────────────────────────────────────
  async function openConversation(conv) {
    setSelected(conv)
    setLoadingConv(true)
    await loadMessages(conv.id, true)
  }

  async function loadMessages(id, scrollToBottom = true) {
    try {
      const { data } = await api.get(`/whatsapp/conversations/${id}`)
      setMessages(data.messages)
      if (scrollToBottom) {
        // Actualizar conversa seleccionada com unread reset
        setSelected((prev) =>
          prev?.id === id ? { ...prev, unreadCount: 0 } : prev
        )
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
        )
      }
      if (scrollToBottom)
        setTimeout(() => messagesEndRef.current?.scrollIntoView(), 50)
    } catch {
      // silencioso
    } finally {
      setLoadingConv(false)
    }
  }

  // ── Enviar mensagem ─────────────────────────────────────────────────────────
  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || !selected || sending) return
    setSending(true)
    try {
      const { data } = await api.post(
        `/whatsapp/conversations/${selected.id}/messages`,
        { body: input.trim() }
      )
      setMessages((prev) => [...prev, data])
      setInput('')
      setTimeout(() => messagesEndRef.current?.scrollIntoView(), 50)
      // Actualizar preview na lista
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? {
                ...c,
                messages: [
                  {
                    body: input.trim(),
                    direction: 'OUTBOUND',
                    createdAt: new Date().toISOString(),
                  },
                ],
                lastMessageAt: new Date().toISOString(),
              }
            : c
        )
      )
    } catch {
      alert('Erro ao enviar mensagem.')
    } finally {
      setSending(false)
    }
  }

  // ── Acções de conversa ──────────────────────────────────────────────────────
  async function handleResolve() {
    if (!selected) return
    await api.patch(`/whatsapp/conversations/${selected.id}/resolve`)
    setSelected((prev) => ({ ...prev, status: 'RESOLVED' }))
    setConversations((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status: 'RESOLVED' } : c))
    )
  }

  async function handleArchive() {
    if (!selected) return
    await api.patch(`/whatsapp/conversations/${selected.id}/archive`)
    setSelected(null)
    setConversations((prev) => prev.filter((c) => c.id !== selected.id))
  }

  // ── Filtrar localmente por pesquisa ────────────────────────────────────────
  const filtered = conversations.filter(
    (c) =>
      c.student?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  )

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
        {/* ── Sidebar: lista de conversas ───────────────────────────── */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">
          {/* Cabeçalho da sidebar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-base font-semibold text-[#0A3956]">
                WhatsApp
              </h1>
              <button
                onClick={loadConversations}
                className="p-1.5 text-gray-400 hover:text-[#0A3956] rounded transition"
                title="Actualizar"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {/* Pesquisa */}
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A3956]"
              />
            </div>

            {/* Filtros de estado */}
            <div className="flex gap-1">
              {['OPEN', 'RESOLVED', 'ARCHIVED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`flex-1 py-1 text-xs rounded-md transition ${
                    filterStatus === s
                      ? 'bg-[#0A3956] text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {STATUS_LABELS[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="p-6 text-center text-sm text-gray-400">
                A carregar...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                Nenhuma conversa{' '}
                {STATUS_LABELS[filterStatus]?.label?.toLowerCase()}
              </div>
            ) : (
              filtered.map((conv) => {
                const preview = conv.messages?.[0]
                const isActive = selected?.id === conv.id
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 transition ${
                      isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-[#0A3956] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {conv.student?.fullName?.charAt(0) ?? '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {conv.student?.fullName ?? conv.phone}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                            {timeAgo(conv.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-gray-500 truncate">
                            {preview?.direction === 'OUTBOUND' && '→ '}
                            {preview?.body ?? 'Sem mensagens'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-1 flex-shrink-0 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Painel de conversa ────────────────────────────────────── */}
        {selected ? (
          <div className="flex-1 flex flex-col">
            {/* Cabeçalho da conversa */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0A3956] flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {selected.student?.fullName?.charAt(0) ?? '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selected.student?.fullName ?? selected.phone}
                  </p>
                  <p className="text-xs text-gray-400">{selected.phone}</p>
                </div>
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[selected.status]?.color}`}
                >
                  {STATUS_LABELS[selected.status]?.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selected.status !== 'RESOLVED' && (
                  <button
                    onClick={handleResolve}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition"
                  >
                    <CheckCheck size={14} />
                    Resolver
                  </button>
                )}
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  <Archive size={14} />
                  Arquivar
                </button>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loadingConv ? (
                <div className="text-center text-sm text-gray-400 mt-10">
                  A carregar mensagens...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-gray-400 mt-10">
                  <MessageSquare
                    size={32}
                    className="mx-auto mb-2 text-gray-300"
                  />
                  Sem mensagens ainda
                </div>
              ) : (
                messages.map((msg) => {
                  const isOut = msg.direction === 'OUTBOUND'
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3.5 py-2 rounded-2xl text-sm ${
                          isOut
                            ? 'bg-[#0A3956] text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.body}</p>
                        <p
                          className={`text-xs mt-1 ${isOut ? 'text-blue-200' : 'text-gray-400'}`}
                        >
                          {formatTime(msg.createdAt)}
                          {isOut && msg.status === 'READ' && (
                            <CheckCheck
                              size={11}
                              className="inline ml-1 text-blue-300"
                            />
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSend} className="flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escreve uma mensagem..."
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A3956] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="px-4 py-2.5 bg-[#0A3956] text-white rounded-xl hover:bg-[#0c4a73] disabled:opacity-40 transition flex items-center gap-2 text-sm"
                >
                  <Send size={15} />
                  {sending ? 'A enviar...' : 'Enviar'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Estado vazio */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} className="mb-3 text-gray-300" />
            <p className="text-sm">Selecciona uma conversa para começar</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
