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
  UserPlus
} from 'lucide-react'
import { authAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: 12 }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      
      const res = await authAPI.getAllUsers(params)
      const data = res.data.data
      setUsers(data.users || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalUsers(data.pagination?.total || 0)
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng')
      console.error(error)
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

  const handleToggleStatus = async (user) => {
    try {
      await authAPI.updateUserStatus(user._id, !user.isActive)
      toast.success(`Đã ${user.isActive ? 'khóa' : 'mở khóa'} tài khoản ${user.name}`)
      fetchUsers()
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái người dùng')
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

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary-600"></span>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Hệ thống người dùng</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase">Quản lý tài khoản</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-600" />
            Đang quản lý {totalUsers} người dùng trong hệ thống
          </p>
        </div>

        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all duration-300 flex items-center gap-3 active:scale-95 group">
           <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
           THÊM QUẢN TRỊ VIÊN
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-wrap gap-4 shadow-xl shadow-slate-100/50 animate-fade-in delay-100">
        <form onSubmit={handleSearch} className="flex-1 min-w-[280px] relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all shadow-inner"
          />
        </form>
        
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }}
                className="pl-14 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner cursor-pointer min-w-[180px]"
              >
                <option value="">TẤT CẢ VAI TRÒ</option>
                <option value="USER">KHÁCH HÀNG</option>
                <option value="ADMIN">QUẢN TRỊ</option>
              </select>
           </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="py-24"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in delay-200">
           {users.map((user, idx) => (
             <div 
               key={user._id} 
               className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/50 group hover:border-primary-100 transition-all duration-500 relative overflow-hidden"
               style={{ animationDelay: `${idx * 50}ms` }}
             >
                {/* Status Indicator */}
                <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] rounded-full opacity-20 transition-all duration-1000 group-hover:opacity-40 ${user.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                
                <div className="flex justify-between items-start relative z-10 mb-8">
                   <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-black text-slate-300 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:scale-110 transition-all duration-500 overflow-hidden shadow-inner">
                         {user.avatar ? (
                           <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                         ) : user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}>
                         <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      </div>
                   </div>

                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleStatus(user)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${user.isActive ? 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500' : 'bg-red-50 text-red-500 hover:bg-emerald-50 hover:text-emerald-500'}`}
                        title={user.isActive ? "Khóa tài khoản" : "Mở khóa"}
                      >
                         {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                   </div>
                </div>

                <div className="space-y-6 relative z-10">
                   <div>
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors truncate">
                        {user.name}
                      </h3>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5 ${user.role === 'ADMIN' ? 'text-primary-600' : 'text-slate-400'}`}>
                        {user.role === 'ADMIN' ? <ShieldAlert className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        {user.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}
                      </p>
                   </div>

                   <div className="space-y-3 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-3 text-slate-500 transition-all group-hover:translate-x-1">
                         <Mail className="w-3.5 h-3.5 text-slate-300" />
                         <span className="text-[10px] font-bold tracking-widest truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 transition-all group-hover:translate-x-1 delay-75">
                         <Phone className="w-3.5 h-3.5 text-slate-300" />
                         <span className="text-[10px] font-bold tracking-widest">{user.phone || 'CHƯA CẬP NHẬT'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 transition-all group-hover:translate-x-1 delay-150">
                         <Calendar className="w-3.5 h-3.5 text-slate-300" />
                         <span className="text-[10px] font-bold tracking-widest uppercase">{formatDate(user.createdAt)}</span>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex bg-slate-50 p-1 rounded-xl">
                          <button 
                            onClick={() => handleUpdateRole(user, 'USER')}
                            className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${user.role === 'USER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                             User
                          </button>
                          <button 
                            onClick={() => handleUpdateRole(user, 'ADMIN')}
                            className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${user.role === 'ADMIN' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                             Admin
                          </button>
                       </div>
                       
                       <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                          <ChevronRight className="w-4 h-4" />
                       </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
         <div className="py-32 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner text-slate-200">
               <Users className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Không tìm thấy người dùng</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
         </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between animate-fade-in delay-300">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
           TRANG {currentPage} / {totalPages}
         </p>
         <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}

export default AdminUsersPage
