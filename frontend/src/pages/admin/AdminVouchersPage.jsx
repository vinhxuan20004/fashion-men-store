import React, { useState, useEffect, useCallback } from 'react'
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Clock, 
  Percent, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Search,
  Users,
  BarChart3,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react'
import { voucherAPI } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const AdminVouchersPage = () => {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalVouchers, setTotalVouchers] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: 0,
    minOrderValue: 0,
    maxDiscount: null,
    usageLimit: null,
    startDate: '',
    endDate: '',
    isActive: true
  })

  const fetchVouchers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await voucherAPI.getAll({ page: currentPage, limit: 12, search })
      const data = res.data.data
      setVouchers(data.vouchers || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalVouchers(data.pagination?.total || 0)
    } catch (error) {
      toast.error('Không thể tải danh sách voucher')
    } finally {
      setLoading(false)
    }
  }, [currentPage, search])

  useEffect(() => {
    fetchVouchers()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchVouchers])

  const handleOpenModal = (voucher = null) => {
    if (voucher) {
      setEditingVoucher(voucher)
      setFormData({
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        minOrderValue: voucher.minOrderValue || 0,
        maxDiscount: voucher.maxDiscount || null,
        usageLimit: voucher.usageLimit || null,
        startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().split('T')[0] : '',
        endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().split('T')[0] : '',
        isActive: voucher.isActive
      })
    } else {
      setEditingVoucher(null)
      setFormData({
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        minOrderValue: 0,
        maxDiscount: null,
        usageLimit: null,
        startDate: '',
        endDate: '',
        isActive: true
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingVoucher) {
        await voucherAPI.update(editingVoucher._id, formData)
        toast.success('Cập nhật voucher thành công')
      } else {
        await voucherAPI.create(formData)
        toast.success('Tạo voucher thành công')
      }
      setShowModal(false)
      fetchVouchers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) return
    try {
      await voucherAPI.delete(id)
      toast.success('Xóa voucher thành công')
      fetchVouchers()
    } catch (error) {
      toast.error('Không thể xóa voucher')
    }
  }

  const isExpired = (endDate) => new Date(endDate) < new Date()

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary-600"></span>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Chương trình ưu đãi</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase">Quản lý Voucher</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary-600" />
            Hệ thống đang chạy {vouchers.filter(v => v.isActive && !isExpired(v.endDate)).length} chương trình khuyến mãi
          </p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all duration-300 flex items-center gap-3 active:scale-95 group"
        >
           <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
           TẠO VOUCHER MỚI
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-wrap gap-4 shadow-xl shadow-slate-100/50 animate-fade-in delay-100">
        <div className="flex-1 min-w-[280px] relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã voucher..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div className="py-24"><LoadingSpinner /></div>
      ) : vouchers.length === 0 ? (
        <div className="py-32 text-center flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-50 shadow-sm animate-fade-in delay-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner text-slate-200">
             <Ticket className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Chưa có mã giảm giá</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bắt đầu tạo chiến dịch khuyến mãi đầu tiên của bạn</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-fade-in delay-200">
           {vouchers.map((voucher, idx) => {
             const expired = isExpired(voucher.endDate)
             const usagePercentage = voucher.usageLimit ? (voucher.usedCount / voucher.usageLimit) * 100 : 0
             
             return (
               <div 
                 key={voucher._id} 
                 className={`bg-white rounded-[2.5rem] border overflow-hidden shadow-xl shadow-slate-100/50 group hover:border-primary-100 transition-all duration-500 relative flex flex-col ${expired ? 'border-slate-50' : 'border-slate-100'}`}
                 style={{ animationDelay: `${idx * 50}ms` }}
               >
                  {/* Status Badges */}
                  <div className="absolute top-6 right-8 flex items-center gap-2 z-10">
                     {expired ? (
                        <span className="px-4 py-1.5 bg-red-50 text-red-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-red-100">Đã hết hạn</span>
                     ) : !voucher.isActive ? (
                        <span className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[8px] font-black uppercase tracking-widest">Đã ẩn</span>
                     ) : (
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">Đang chạy</span>
                     )}
                  </div>

                  {/* Top Section */}
                  <div className="p-8 pb-4 relative">
                     <div className="flex items-start gap-6">
                        <div className={`w-20 h-24 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 ${expired ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white'}`}>
                           {voucher.type === 'PERCENTAGE' ? <Percent className="w-6 h-6 mb-2" /> : <CreditCard className="w-6 h-6 mb-2" />}
                           <span className="text-sm font-black">
                              {voucher.type === 'PERCENTAGE' ? `-${voucher.value}%` : `-${formatCurrency(voucher.value)}`}
                           </span>
                        </div>
                        <div className="pt-2">
                           <h3 className="text-2xl font-black text-slate-900 uppercase group-hover:text-primary-600 transition-colors">
                             {voucher.code}
                           </h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                              {voucher.type === 'PERCENTAGE' ? 'GIẢM THEO %' : 'GIẢM TRỰC TIẾP'}
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              HSD: {formatDate(voucher.endDate)}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Middle Section: Stats */}
                  <div className="px-8 py-6 flex-1 space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex flex-col items-center text-center">
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã dùng</span>
                           <span className="text-sm font-black text-slate-900">{voucher.usedCount || 0} lần</span>
                        </div>
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex flex-col items-center text-center">
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Giá tối thiểu</span>
                           <span className="text-sm font-black text-slate-900">{formatCurrency(voucher.minOrderValue)}</span>
                        </div>
                     </div>

                     {voucher.usageLimit && (
                        <div className="space-y-2">
                           <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              <span>Tiến độ sử dụng</span>
                              <span>{voucher.usedCount} / {voucher.usageLimit}</span>
                           </div>
                           <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                              <div 
                                className={`h-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-red-400' : 'bg-primary-600'}`} 
                                style={{ width: `${usagePercentage}%` }}
                              />
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="p-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <button 
                           onClick={() => handleOpenModal(voucher)}
                           className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-900 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                         >
                            <Edit className="w-3.5 h-3.5" />
                            CHỈNH SỬA
                         </button>
                      </div>
                      <button 
                        onClick={() => handleDelete(voucher._id)}
                        className="w-10 h-10 rounded-xl border border-slate-100 text-slate-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
               </div>
             )
           })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between animate-fade-in delay-300">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             TRANG {currentPage} / {totalPages}
           </p>
           <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Modal - Editorial Glassmorphism style */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in overflow-y-auto">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
           <div className="bg-white rounded-[3rem] w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl animate-scale-up border border-white/20">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <Ticket className="w-6 h-6 text-primary-600" />
                    {editingVoucher ? 'CẬP NHẬT VOUCHER' : 'TẠO VOUCHER MỚI'}
                 </h2>
                 <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                    <XCircle className="w-4 h-4" />
                 </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mã voucher (In hoa) *</label>
                       <input
                         required
                         type="text"
                         value={formData.code}
                         onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                         className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner"
                         placeholder="VD: SPRING2024"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Loại giảm giá</label>
                       <select
                         value={formData.type}
                         onChange={(e) => setFormData({...formData, type: e.target.value})}
                         className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner cursor-pointer"
                       >
                          <option value="PERCENTAGE">GIẢM THEO PHẦN TRĂM (%)</option>
                          <option value="FIXED">GIẢM THEO SỐ TIỀN CỐ ĐỊNH (VNĐ)</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                          Giá trị ({formData.type === 'PERCENTAGE' ? '%' : '₫'})
                       </label>
                       <input
                         required
                         type="number"
                         value={formData.value}
                         onChange={(e) => setFormData({...formData, value: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Đơn tối thiểu</label>
                       <input
                         type="number"
                         value={formData.minOrderValue}
                         onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tối đa giảm</label>
                       <input
                         type="number"
                         value={formData.maxDiscount || ''}
                         onChange={(e) => setFormData({...formData, maxDiscount: e.target.value ? Number(e.target.value) : null})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner"
                         placeholder="Dành cho %"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Giới hạn sử dụng</label>
                       <input
                         type="number"
                         value={formData.usageLimit || ''}
                         onChange={(e) => setFormData({...formData, usageLimit: e.target.value ? Number(e.target.value) : null})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner"
                         placeholder="Để trống nếu không giới hạn"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Trạng thái</label>
                       <div 
                         className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all cursor-pointer ${formData.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                         onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                       >
                          <span className="text-[10px] font-black uppercase tracking-widest">{formData.isActive ? 'Hoạt động' : 'Đang ẩn'}</span>
                          {formData.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ngày bắt đầu</label>
                       <input
                         required
                         type="date"
                         value={formData.startDate}
                         onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ngày kết thúc</label>
                       <input
                         required
                         type="date"
                         value={formData.endDate}
                         onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner"
                       />
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-50 flex items-center justify-end gap-6">
                    <button 
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                    >
                       Hủy bỏ
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="px-12 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-3"
                    >
                       {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                       {editingVoucher ? 'CẬP NHẬT VOUCHER' : 'XÁC NHẬN TẠO MỚI'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}

export default AdminVouchersPage
