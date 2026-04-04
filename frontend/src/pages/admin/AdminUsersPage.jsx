import React, { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Shield, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Phone, 
  Calendar,
  Lock,
  Unlock,
  ChevronRight,
  UserPlus,
  Mail as MailIcon,
  Smartphone,
  Edit2,
  Trash2,
  History,
  Key,
  Info,
  ExternalLink,
  Package,
  ShoppingBag,
  Clock,
  ChevronLeft
} from 'lucide-react'
import { authAPI, orderAPI } from '../../services/api'
import { formatDate, formatCurrency, getOrderStatusLabel, getOrderStatusColor } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import toast from 'react-hot-toast'

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  // Edit User Modal State
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('profile') // 'profile', 'password', 'history'
  const [userOrders, setUserOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  
  // Edit Form State
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)

  // Confirm Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [userToToggle, setUserToToggle] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: 10 }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      
      const res = await authAPI.getAllUsers(params)
      const data = res.data.data
      setUsers(data.users || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalUsers(data.pagination?.total || 0)
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, roleFilter])

  useEffect(() => {
    fetchUsers()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchUsers])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const handleToggleStatus = (user) => {
    if (user.isActive) {
      setUserToToggle(user)
      setIsConfirmOpen(true)
    } else {
      // Direct unlock as it's safe
      performToggleStatus(user)
    }
  }

  const performToggleStatus = async (user) => {
    const action = user.isActive ? 'khóa' : 'mở khóa'
    try {
      await authAPI.updateUserStatus(user._id, !user.isActive)
      toast.success(`Đã ${action} tài khoản ${user.name}`)
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái người dùng')
    }
  }

  const handleUpdateRole = async (user, newRole) => {
    try {
      if (user.role === newRole) return
      await authAPI.updateUserRole(user._id, newRole)
      toast.success(`Đã cập nhật quyền cho ${user.name} thành ${newRole}`)
      fetchUsers()
    } catch (error) {
      toast.error('Không thể cập nhật quyền người dùng')
    }
  }

  // --- Edit Logic ---
  const openEditModal = (user) => {
    setSelectedUser(user)
    setEditForm({ name: user.name, email: user.email, phone: user.phone || '' })
    setPasswordForm({ password: '', confirmPassword: '' })
    setActiveTab('profile')
    setIsEditModalOpen(true)
  }

  const fetchUserOrders = async (userId) => {
    setLoadingOrders(true)
    try {
      const res = await orderAPI.getAll({ user: userId, limit: 50 })
      setUserOrders(res.data.data.orders || [])
    } catch (error) {
      toast.error('Không thể tải lịch sử mua hàng')
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    if (isEditModalOpen && activeTab === 'history' && selectedUser) {
      fetchUserOrders(selectedUser._id)
    }
  }, [isEditModalOpen, activeTab, selectedUser])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authAPI.updateUserAdmin(selectedUser._id, editForm)
      toast.success('Cập nhật thông tin thành công')
      fetchUsers()
      setIsEditModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passwordForm.password !== passwordForm.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp')
    }
    setSaving(true)
    try {
      await authAPI.updateUserPasswordAdmin(selectedUser._id, passwordForm.password)
      toast.success('Đã đặt lại mật khẩu thành công')
      setIsEditModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể đặt lại mật khẩu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-0.5 bg-primary-600 rounded-full"></span>
            <span className="text-[11px] font-semibold text-primary-600 capitalize tracking-tight">Hệ thống khách hàng</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Quản lý tài khoản</h1>
          <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            Đang quản lý {totalUsers} người dùng trong hệ thống
          </div>
        </div>

        <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium shadow-sm hover:bg-primary-600 transition-all duration-300 flex items-center gap-2.5 active:scale-95 group">
           <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
           Thêm quản trị viên
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-wrap gap-4 shadow-sm items-center">
        <form onSubmit={handleSearch} className="flex-1 min-w-[300px] relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className="w-full pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
          />
        </form>
        
        <div className="flex items-center gap-3">
            <div className="relative group">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary-600 transition-colors pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }}
                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-600 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner cursor-pointer min-w-[160px]"
              >
                <option value="">Tất cả vai trò</option>
                <option value="USER">Khách hàng</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
        </div>
      </div>

      {/* Users List (Table style) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24"><LoadingSpinner /></div>
        ) : users.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-5 text-slate-200">
               <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Không tìm thấy người dùng</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc vai trò</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-tight">Người dùng</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-tight">Vai trò</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-tight">Liên hệ</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-tight">Ngày tham gia</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-tight">Trạng thái</th>
                  <th className="px-6 py-4 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-tight">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-400 border border-slate-200 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                          <p className="text-[11px] font-medium text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold capitalize ring-1 ring-inset ${user.role === 'ADMIN' ? 'bg-primary-50 text-primary-700 ring-primary-500/10' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                        {user.role === 'ADMIN' ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {user.role === 'ADMIN' ? 'Admin' : 'User'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Smartphone className="w-3 h-3 text-slate-300" />
                          <span>{user.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-medium text-slate-500 capitalize">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className={`text-[11px] font-semibold capitalize ${user.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                          {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <div className="flex bg-slate-100 p-0.5 rounded-lg mr-2">
                            <button 
                              onClick={() => handleUpdateRole(user, 'USER')}
                              className={`px-2 py-1 rounded-md text-[9px] font-semibold capitalize transition-all ${user.role === 'USER' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                               User
                            </button>
                            <button 
                              onClick={() => handleUpdateRole(user, 'ADMIN')}
                              className={`px-2 py-1 rounded-md text-[9px] font-semibold capitalize transition-all ${user.role === 'ADMIN' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                               Admin
                            </button>
                          </div>
                          
                          <button 
                             onClick={() => openEditModal(user)}
                             className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-all shadow-none"
                             title="Chỉnh sửa thông tin"
                          >
                             <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button 
                             onClick={() => handleToggleStatus(user)}
                             disabled={user._id === currentUser._id}
                             className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                               user._id === currentUser._id 
                                 ? 'opacity-20 cursor-not-allowed text-slate-300' 
                                 : user.isActive 
                                   ? 'text-slate-300 hover:bg-red-50 hover:text-red-500' 
                                   : 'text-emerald-500 hover:bg-emerald-50'
                             }`}
                             title={user._id === currentUser._id ? "Bạn không thể tự khóa chính mình" : (user.isActive ? "Khóa tài khoản" : "Mở khóa")}
                          >
                             {user.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
         <p className="text-xs font-medium text-slate-400 capitalize">
           Trang {currentPage} / {totalPages}
         </p>
         <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Chỉnh sửa người dùng</h2>
                  <p className="text-xs font-medium text-slate-400">{selectedUser.name} • {selectedUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all hover:border-slate-300"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 bg-white">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 text-xs font-semibold transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === 'profile' ? 'border-primary-600 text-primary-600 bg-primary-50/30' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <Info className="w-3.5 h-3.5" />
                Thông tin cơ bản
              </button>
              <button 
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-4 text-xs font-semibold transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === 'password' ? 'border-primary-600 text-primary-600 bg-primary-50/30' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <Key className="w-3.5 h-3.5" />
                Đổi mật khẩu
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-4 text-xs font-semibold transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === 'history' ? 'border-primary-600 text-primary-600 bg-primary-50/30' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <History className="w-3.5 h-3.5" />
                Lịch sử mua hàng
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 ml-1">Họ và tên *</label>
                      <input 
                        required
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 ml-1">Email (Gmail) *</label>
                      <input 
                        required
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 ml-1">Số điện thoại</label>
                      <input 
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                        placeholder="N/A"
                      />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex justify-end gap-4">
                    <button 
                      type="button" 
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-6 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-primary-600 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <LoadingSpinner size="xs" color="white" />}
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-700">
                     <Lock className="w-5 h-5 shrink-0" />
                     <p className="text-xs font-medium leading-relaxed">
                       Việc đặt lại mật khẩu sẽ có hiệu lực ngay lập tức. Hãy thông báo cho người dùng mật khẩu mới sau khi thay đổi.
                     </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 ml-1">Mật khẩu mới *</label>
                      <input 
                        required
                        type="password"
                        value={passwordForm.password}
                        onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                        placeholder="Nhập mật khẩu mới..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 ml-1">Xác nhận mật khẩu *</label>
                      <input 
                        required
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                        placeholder="Xác nhận mật khẩu mới..."
                      />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex justify-end gap-4">
                    <button 
                      type="button" 
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-6 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-primary-600 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <LoadingSpinner size="xs" color="white" />}
                      Đặt lại mật khẩu
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4 min-h-[300px]">
                  {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center pt-10 text-slate-400">
                      <LoadingSpinner size="sm" />
                      <p className="text-xs font-medium mt-4">Đang tải lịch sử mua hàng...</p>
                    </div>
                  ) : userOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-10 text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-medium">Người dùng này chưa có đơn hàng nào.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl overflow-hidden bg-white">
                       {userOrders.map((order) => {
                         const firstItem = order.items?.[0] || {}
                         const otherItemsCount = (order.items?.length || 1) - 1
                         
                         return (
                           <div key={order._id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                             <div className="flex items-center gap-4">
                               <div className="w-12 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                                  {firstItem.productImage ? (
                                    <img 
                                      src={firstItem.productImage.startsWith('http') ? firstItem.productImage : `http://localhost:5000${firstItem.productImage}`} 
                                      alt={firstItem.productName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.src = 'https://via.placeholder.com/60x80' }}
                                    />
                                  ) : (
                                    <Package className="w-5 h-5 text-slate-300" />
                                  )}
                               </div>
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <p className="text-xs font-semibold text-slate-800">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
                                     <span className={`px-2 py-0.5 rounded text-[9px] font-semibold capitalize ${getOrderStatusColor(order.orderStatus).includes('emerald') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                        {getOrderStatusLabel(order.orderStatus).toLowerCase()}
                                     </span>
                                  </div>
                                  <p className="text-[11px] font-medium text-slate-600 line-clamp-1 mb-1.5">
                                     {firstItem.productName || 'Sản phẩm không xác định'}
                                     {otherItemsCount > 0 && <span className="text-slate-400 ml-1">+ {otherItemsCount} sản phẩm khác</span>}
                                  </p>
                                  <div className="flex items-center gap-3">
                                     <p className="text-[10px] font-medium text-slate-300 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(order.createdAt)}
                                     </p>
                                     <p className="text-[10px] font-semibold text-slate-900">{formatCurrency(order.total)}</p>
                                  </div>
                               </div>
                             </div>
                             <button 
                                onClick={() => {
                                  window.open(`/admin/orders/${order._id}`, '_blank')
                                }}
                                className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-300 hover:bg-slate-900 hover:text-white transition-all shadow-sm group-hover:scale-105"
                             >
                                <ExternalLink className="w-3.5 h-3.5" />
                             </button>
                           </div>
                         )
                       })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Locking */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => performToggleStatus(userToToggle)}
        title="Xác nhận khóa tài khoản"
        message={`Bạn có chắc chắn muốn khóa tài khoản của ${userToToggle?.name}? Người dùng sẽ không thể đăng nhập cho đến khi được mở lại.`}
        confirmText="Khóa tài khoản"
        cancelText="Hủy bỏ"
        variant="danger"
      />
    </div>
  )
}

export default AdminUsersPage
