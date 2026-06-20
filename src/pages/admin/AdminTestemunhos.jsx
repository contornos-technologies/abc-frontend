import { useState, useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  MessageSquareQuote,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import api from '../../services/api'
import { useAdminNotifications } from '../../context/AdminNotificationsContext'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  )
}

function TestimonialCard({ item, onAction, onDelete }) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleAction(approved) {
    setLoading(true)
    try {
      await api.patch(`/admin/testimonials/${item.id}`, { approved })
      onAction(item.id, approved)
    } catch {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        'Tens a certeza que queres apagar este testemunho? Esta acção não pode ser desfeita.'
      )
    )
      return
    setDeleting(true)
    try {
      await api.delete(`/admin/testimonials/${item.id}`)
      onDelete(item.id)
    } catch {
      setDeleting(false)
    }
  }

  const initials =
    item.name
      ?.trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || '?'

  const date = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#DEE2E6] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0A3956] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0A3956] truncate">
            {item.name}
          </p>
          <p className="text-xs text-[#6C757D] truncate">{item.university}</p>
        </div>
        {date && (
          <span className="ml-auto text-xs text-[#6C757D] flex-shrink-0">
            {date}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => handleAction(true)}
          disabled={loading || deleting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#28A745] text-white hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          Aprovar
        </button>
        <button
          onClick={() => handleAction(false)}
          disabled={loading || deleting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#DC3545] text-white hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          Rejeitar
        </button>
        <button
          onClick={handleDelete}
          disabled={loading || deleting}
          title="Apagar testemunho"
          className="ml-auto flex items-center justify-center w-9 h-9 rounded-lg text-[#6C757D] hover:bg-red-50 hover:text-[#DC3545] transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function PublishedCard({ item, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (
      !window.confirm(
        'Tens a certeza que queres apagar este testemunho publicado? Esta acção não pode ser desfeita.'
      )
    )
      return
    setDeleting(true)
    try {
      await api.delete(`/admin/testimonials/${item.id}`)
      onDelete(item.id)
    } catch {
      setDeleting(false)
    }
  }

  const initials =
    item.name
      ?.trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || '?'

  const date = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#DEE2E6] p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0A3956] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0A3956] truncate">
            {item.name}
          </p>
          <p className="text-xs text-[#6C757D] truncate">{item.university}</p>
        </div>
        {date && (
          <span className="ml-auto text-xs text-[#6C757D] flex-shrink-0">
            {date}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#28A745] font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          Publicado
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Apagar testemunho"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[#6C757D] hover:bg-red-50 hover:text-[#DC3545] transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function AdminTestemunhos() {
  const [tab, setTab] = useState('pending')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { decrementTestimonials } = useAdminNotifications()

  async function fetchItems() {
    setLoading(true)
    setError(false)
    try {
      const param = tab === 'pending' ? '?approved=false' : '?approved=true'
      const res = await api.get(`/admin/testimonials${param}`)
      const data = res.data?.data ?? res.data
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [tab])

  function handleAction(id, approved) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    decrementTestimonials() // aprovar ou rejeitar, ambos saem da lista de pendentes
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    if (tab === 'pending') decrementTestimonials() // só decrementa o badge se ainda estava pendente
  }

  return (
    <div className="bg-[#F8F9FA] min-h-full p-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <MessageSquareQuote className="w-6 h-6 text-[#0A3956]" />
          <h1 className="text-2xl font-bold text-[#0A3956]">Testemunhos</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-[#DEE2E6] rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('pending')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'pending'
                ? 'bg-[#0A3956] text-white shadow-sm'
                : 'text-[#6C757D] hover:text-[#0A3956] hover:bg-gray-50'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setTab('published')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'published'
                ? 'bg-[#0A3956] text-white shadow-sm'
                : 'text-[#6C757D] hover:text-[#0A3956] hover:bg-gray-50'
            }`}
          >
            Publicados
          </button>
        </div>

        {/* Estado de erro */}
        {error && (
          <div className="bg-white border border-[#DC3545]/30 rounded-xl p-5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#DC3545] flex-shrink-0" />
            <p className="text-sm text-gray-700 flex-1">
              Erro ao carregar os testemunhos.
            </p>
            <button
              onClick={fetchItems}
              className="flex items-center gap-1.5 text-sm font-medium text-[#0A3956] hover:text-[#0D4A6E] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Lista */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item) =>
              tab === 'pending' ? (
                <TestimonialCard
                  key={item.id}
                  item={item}
                  onAction={handleAction}
                  onDelete={handleDelete}
                />
              ) : (
                <PublishedCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                />
              )
            )}
          </div>
        )}

        {/* Lista vazia */}
        {!loading && !error && items.length === 0 && (
          <div className="bg-white rounded-xl border border-[#DEE2E6] p-10 text-center">
            <MessageSquareQuote className="w-10 h-10 text-[#DEE2E6] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#0A3956]">
              {tab === 'pending'
                ? 'Nenhum testemunho pendente'
                : 'Nenhum testemunho publicado'}
            </p>
            <p className="text-xs text-[#6C757D] mt-1">
              {tab === 'pending'
                ? 'Todos os testemunhos foram moderados.'
                : 'Ainda não há testemunhos aprovados.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
