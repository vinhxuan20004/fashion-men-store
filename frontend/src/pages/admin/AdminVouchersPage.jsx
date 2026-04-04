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
import DatePicker, { registerLocale } from 'react-datepicker'
import vi from 'date-fns/locale/vi'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('vi', vi)

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
    
    // Normalize data (ensure values are numbers/nulls)
    const processedData = {
      ...formData,
      value: Number(formData.value),
      minOrderValue: Number(formData.minOrderValue),
      maxDiscount: formData.type === 'FIXED' ? null : (formData.maxDiscount ? Number(formData.maxDiscount) : null),
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
    }

    try {
      if (editingVoucher) {
        await voucherAPI.update(editingVoucher._id, processedData)
        toast.success('Cập nhật voucher thành công')
      } else {
        await voucherAPI.create(processedData)
        toast.success('Tạo voucher thành công')
      }
      setShowModal(false)
      fetchVouchers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thông tin voucher chưa hợp lệ')
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
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-0.5 bg-primary-600 rounded-full"></span>
            <span className="text-[11px] font-semibold text-primary-600 capitalize tracking-tight">Chương trình ưu đãi</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Quản lý voucher</h1>
          <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-2">
            <Ticket className="w-3.5 h-3.5" />
            Đang chạy {vouchers.filter(v => v.isActive && !isExpired(v.endDate)).length} chương trình khuyến mãi
          </div>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium shadow-sm hover:bg-primary-600 transition-all duration-300 flex items-center gap-2.5 active:scale-95 group"
        >
           <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
           Tạo voucher mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 flex flex-wrap gap-4 shadow-sm">
        <div className="flex-1 min-w-[280px] relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã voucher..."
            className="w-full pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div className="py-24"><LoadingSpinner /></div>
      ) : vouchers.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-5 text-slate-200">
             <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Chưa có mã giảm giá nào</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Bắt đầu tạo chiến dịch khuyến mãi đầu tiên của bạn</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {vouchers.map((voucher, idx) => {
             const expired = isExpired(voucher.endDate)
             const usagePercentage = voucher.usageLimit ? (voucher.usedCount / voucher.usageLimit) * 100 : 0
             
             return (
               <div 
                 key={voucher._id} 
                 className={`bg-white rounded-xl border border-slate-100 p-5 shadow-sm group hover:border-primary-100 transition-all duration-300 relative flex flex-col ${expired ? 'opacity-70 grayscale-[0.3]' : ''}`}
               >
                  {/* Status Badges */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                     {expired ? (
                        <span className="px-2.5 py-0.5 bg-red-50 text-red-600 rounded-md text-[10px] font-medium capitalize ring-1 ring-inset ring-red-500/10">Đã hết hạn</span>
                     ) : !voucher.isActive ? (
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-medium capitalize">Đã ẩn</span>
                     ) : (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-medium capitalize ring-1 ring-inset ring-emerald-500/10">Đang chạy</span>
                     )}
                  </div>

                  {/* Top Section */}
                  <div className="flex items-start gap-5 mb-6">
                     <div className={`w-16 h-20 rounded-xl flex flex-col items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-105 ${expired ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`}>
                        {voucher.type === 'PERCENTAGE' ? <Percent className="w-5 h-5 mb-1.5" /> : <CreditCard className="w-5 h-5 mb-1.5" />}
                        <span className="text-[11px] font-semibold">
                           {voucher.type === 'PERCENTAGE' ? `-${voucher.value}%` : `-${formatCurrency(voucher.value)}`}
                        </span>
                     </div>
                     <div className="pt-1 select-all">
                        <h3 className="text-base font-semibold text-slate-800 transition-colors">
                          {voucher.code}
                        </h3>
                        <div className="mt-2 flex flex-col gap-1.5">
                           <p className="text-[10px] font-medium text-slate-400 capitalize flex items-center gap-1.5">
                             <Clock className="w-3 h-3" />
                             HSD: {formatDate(voucher.endDate)}
                           </p>
                           <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                              {voucher.type === 'PERCENTAGE' ? 'Giảm phần trăm' : 'Giảm tiền mặt'}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Middle Section: Stats */}
                  <div className="flex-1 space-y-6 pt-4 border-t border-slate-50">
                     <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                           <span className="text-[9px] font-medium text-slate-400 capitalize mb-1">Đã dùng</span>
                           <span className="text-xs font-semibold text-slate-800">{voucher.usedCount || 0} lần</span>
                        </div>
                        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                           <span className="text-[9px] font-medium text-slate-400 capitalize mb-1">Đơn tối thiểu</span>
                           <span className="text-xs font-semibold text-slate-800">{formatCurrency(voucher.minOrderValue)}</span>
                        </div>
                     </div>

                     {voucher.usageLimit && (
                        <div className="space-y-2 px-1">
                           <div className="flex justify-between text-[10px] font-medium text-slate-400 capitalize">
                              <span>Số lượng còn lại</span>
                              <span>{voucher.usedCount} / {voucher.usageLimit}</span>
                           </div>
                           <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-red-500' : 'bg-primary-600'}`} 
                                style={{ width: `${usagePercentage}%` }}
                              />
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-6 mt-6 border-t border-slate-50 flex items-center justify-between">
                      <button 
                         onClick={() => handleOpenModal(voucher)}
                         className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 border border-slate-100 rounded-xl text-[11px] font-medium hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                      >
                         <Edit className="w-3.5 h-3.5" />
                         Chỉnh sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(voucher._id)}
                        className="w-9 h-9 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
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
        <div className="flex items-center justify-between pt-6">
           <p className="text-xs font-medium text-slate-400 capitalize">
             Trang {currentPage} / {totalPages}
           </p>
           <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Modal Re-design */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in overflow-y-auto">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
           <div className="bg-white rounded-xl w-full max-w-xl relative z-10 overflow-hidden shadow-2xl animate-scale-up border border-slate-100">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                 <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-primary-600" />
                    {editingVoucher ? 'Cập nhật voucher' : 'Tạo voucher mới'}
                 </h2>
                 <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all">
                    <XCircle className="w-4 h-4" />
                 </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-slate-400 capitalize ml-1">Mã voucher *</label>
                       <input
                         required
                         type="text"
                         value={formData.code}
                         onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold tracking-wider text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                         placeholder="VD: SPRING2024"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-slate-400 capitalize ml-1">Loại giảm giá</label>
                       <select
                         value={formData.type}
                         onChange={(e) => setFormData({...formData, type: e.target.value})}
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner cursor-pointer"
                       >
                          <option value="PERCENTAGE">Giảm theo %</option>
                          <option value="FIXED">Giảm tiền mặt (₫)</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-slate-400 capitalize ml-1">
                          Giá trị ({formData.type === 'PERCENTAGE' ? '%' : '₫'})
                       </label>
                       <input
                         required
                         type="number"
                         value={formData.value}
                         onChange={(e) => setFormData({...formData, value: e.target.value})}
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-slate-400 capitalize ml-1">Đơn tối thiểu</label>
                       <input
                         type="number"
                         value={formData.minOrderValue}
                         onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})}
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-slate-400 capitalize ml-1">Tối đa giảm</label>
                       <input
                         type="number"
                         value={formData.maxDiscount || ''}
                         onChange={(e) => setFormData({...formData, maxDiscount: e.target.value ? Number(e.target.value) : null})}
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                         placeholder="Chỉ cho %"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-slate-400 capitalize ml-1">Giới hạn sử dụng</label>
                       <input
                         type="number"
                         value={formData.usageLimit || ''}
                         onChange={(e) => setFormData({...formData, usageLimit: e.target.value ? Number(e.target.value) : null})}
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                         placeholder="VD: 100"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-slate-400 capitalize ml-1">Trạng thái</label>
                       <div 
                         className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${formData.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                         onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                       >
                          <span className="text-xs font-medium capitalize">{formData.isActive ? 'Hoạt động' : 'Tạm ẩn'}</span>
                          {formData.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                       </div>
                    </div>
                 </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-slate-400 capitalize ml-1">Ngày bắt đầu</label>
                       <DatePicker
                         selected={formData.startDate ? new Date(formData.startDate) : null}
                         onChange={(date) => setFormData({...formData, startDate: date ? date.toISOString().split('T')[0] : ''})}
                         dateFormat="dd/MM/yyyy"
                         locale="vi"
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                         placeholderText="Ngày bắt đầu"
                         required
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-slate-400 capitalize ml-1">Ngày kết thúc</label>
                       <DatePicker
                         selected={formData.endDate ? new Date(formData.endDate) : null}
                         onChange={(date) => setFormData({...formData, endDate: date ? date.toISOString().split('T')[0] : ''})}
                         dateFormat="dd/MM/yyyy"
                         locale="vi"
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                         placeholderText="Ngày kết thúc"
                         required
                       />
                    </div>
                  </div>

                 <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-5">
                    <button 
                       type="button"
                       onClick={() => setShowModal(false)}
                       className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                       Hủy bỏ
                    </button>
                    <button 
                       type="submit"
                       disabled={submitting}
                       className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium shadow-sm hover:bg-primary-600 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2.5"
                    >
                       {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                       {editingVoucher ? 'Cập nhật voucher' : 'Xác nhận tạo mới'}
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
