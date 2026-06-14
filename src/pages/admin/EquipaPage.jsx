import { useState, useEffect, useCallback } from 'react'
import {
  Users2,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import AdminUserModal from '../../components/admin/AdminUserModal'

// ─── Tags de role e estado (Secção 5.5) ───────────────────────────────────────

function RoleTag({ role }) {
  if (role === 'SUPER_ADMIN') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        Super Admin
      </span>
    )
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1565A8] border border-blue-200">
      Admin
    </span>
  )
}

function StatusTag({ isActive }) {
  if (isActive) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-[#28A745] border border-green-200">
        Activo
      </span>
    )
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-[#DC3545] border border-red-200">
      Inactivo
    </span>
  )
}

// ─── Skeleton de tabela ────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-4 border-b border-[#DEE2E6] last:border-0"
        >
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-4 bg-gray-200 rounded w-48 ml-auto" />
          <div className="h-5 bg-gray-200 rounded-full w-20" />
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="flex gap-2 ml-auto">
            <div className="h-7 w-7 bg-gray-200 rounded-lg" />
            <div className="h-7 w-7 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Toast simples ─────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const colors =
    type === 'error'
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-green-50 border-green-200 text-[#28A745]'

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 border rounded-xl px-4 py-3 shadow-md text-sm max-w-sm ${colors}`}
    >
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function EquipaPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // Filtros
  const [filterRole, setFilterRole] = useState('')
  const [filterActive, setFilterActive] = useState('')

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)

  // Confirmação de remoção
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Toast
  const [toast, setToast] = useState(null) // { message, type }

  const showToast = (message, type = 'error') => setToast({ message, type })

  // ── Fetch admins ─────────────────────────────────────────────────────────────

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    try {
      const params = {}
      if (filterRole) params.role = filterRole
      if (filterActive !== '') params.isActive = filterActive

      const res = await api.get('/admin/users', { params })
      const data = res.data?.data ?? res.data
      setAdmins(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/portal/acesso')
        return
      }
      if (err.response?.status === 403) {
        navigate('/admin')
        return
      }
      setFetchError('Não foi possível carregar a equipa. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }, [filterRole, filterActive, navigate])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  // ── Remover admin ─────────────────────────────────────────────────────────────

  async function handleDelete(adminId) {
    setDeleting(true)
    try {
      await api.delete(`/admin/users/${adminId}`)
      setAdmins((prev) => prev.filter((a) => a.id !== adminId))
      setConfirmDeleteId(null)
      showToast('Admin removido com sucesso.', 'success')
    } catch (err) {
      setConfirmDeleteId(null)
      if (err.response?.status === 401) {
        navigate('/portal/acesso')
        return
      }
      if (err.response?.status === 409) {
        showToast(
          'Este admin tem dados associados e não pode ser removido. Desactiva a conta em vez disso.'
        )
      } else {
        showToast('Não foi possível remover o admin. Tenta novamente.')
      }
    } finally {
      setDeleting(false)
    }
  }

  // ── Abrir modal ───────────────────────────────────────────────────────────────

  function openCreate() {
    setSelectedAdmin(null)
    setModalOpen(true)
  }

  function openEdit(admin) {
    setSelectedAdmin(admin)
    setModalOpen(true)
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#F8F9FA] min-h-full p-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users2 className="w-6 h-6 text-[#0A3956]" />
            <h1 className="text-2xl font-bold text-[#0A3956]">Equipa</h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#0A3956] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0D4A6E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Admin
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] transition"
          >
            <option value="">Todas as funções</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>

          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="border border-[#DEE2E6] rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3956]/20 focus:border-[#0A3956] transition"
          >
            <option value="">Todos os estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-[#DEE2E6] overflow-hidden">
          {/* Estado de erro no GET */}
          {fetchError && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="flex items-center gap-2 text-[#DC3545] bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{fetchError}</span>
              </div>
              <button
                onClick={fetchAdmins}
                className="flex items-center gap-2 text-sm text-[#0A3956] font-semibold hover:underline"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>
            </div>
          )}

          {/* Skeleton */}
          {loading && <TableSkeleton />}

          {/* Lista vazia */}
          {!loading && !fetchError && admins.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#6C757D]">
              <Users2 className="w-10 h-10 text-[#DEE2E6]" />
              <p className="text-sm">Nenhum admin encontrado.</p>
            </div>
          )}

          {/* Tabela com dados */}
          {!loading && !fetchError && admins.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DEE2E6] bg-[#F8F9FA]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">
                    Nome
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">
                    Função
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">
                    Criado em
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, idx) => (
                  <tr
                    key={admin.id}
                    className={`border-b border-[#DEE2E6] last:border-0 hover:bg-[#F8F9FA] transition-colors ${
                      confirmDeleteId === admin.id ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-[#0A3956]">
                      {admin.fullName}
                      {admin.id === user?.userId && (
                        <span className="ml-2 text-xs text-[#6C757D] font-normal">
                          (tu)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#6C757D]">{admin.email}</td>
                    <td className="px-6 py-4">
                      <RoleTag role={admin.role} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusTag isActive={admin.isActive} />
                    </td>
                    <td className="px-6 py-4 text-[#6C757D]">
                      {new Date(admin.createdAt).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4">
                      {confirmDeleteId === admin.id ? (
                        /* Confirmação inline */
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-[#DC3545] font-medium">
                            Tens a certeza?
                          </span>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            disabled={deleting}
                            className="px-3 py-1 text-xs font-semibold bg-[#DC3545] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                          >
                            {deleting ? 'A remover...' : 'Remover'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={deleting}
                            className="px-3 py-1 text-xs font-medium text-[#6C757D] hover:text-[#0A3956] transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        /* Botões normais */
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEdit(admin)}
                            title="Editar"
                            className="p-1.5 rounded-lg text-[#0A3956] hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setConfirmDeleteId(admin.id)}
                            title={
                              admin.id === user?.userId
                                ? 'Não podes remover a tua própria conta'
                                : 'Remover'
                            }
                            disabled={admin.id === user?.userId}
                            className={`p-1.5 rounded-lg transition-colors ${
                              admin.id === user?.userId
                                ? 'text-[#DEE2E6] cursor-not-allowed'
                                : 'text-[#6C757D] hover:bg-red-50 hover:text-[#DC3545]'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <AdminUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchAdmins}
        selectedAdmin={selectedAdmin}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
