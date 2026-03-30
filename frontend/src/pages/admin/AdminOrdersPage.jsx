import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  ShoppingBag, 
  Filter, 
  Eye, 
  Calendar, 
  CreditCard, 
  User, 
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react'
import { orderAPI } from '../../services/api'
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: 10 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      
      const res = await orderAPI.getAll(params)
      const data = res.data.data
      setOrders(data.orders || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalOrders(data.pagination?.total || 0)
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, statusFilter])

  useEffect(() => {
    fetchOrders()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchOrders])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchOrders()
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-3.5 h-3.5" />
      case 'CONFIRMED': return <CheckCircle2 className="w-3.5 h-3.5" />
      case 'SHIPPING': return <Truck className="w-3.5 h-3.5" />
      case 'DELIVERED': return <CheckCircle2 className="w-3.5 h-3.5" />
      case 'CANCELLED': return <XCircle className="w-3.5 h-3.5" />
      default: return <AlertCircle className="w-3.5 h-3.5" />
    }
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary-600"></span>
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.3em]">Quản lý bán hàng</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 uppercase">Danh sách đơn hàng</h1>
          <p className="text-slate-400 font-semibold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary-600" />
            Tổng cộng có {totalOrders} đơn hàng được ghi nhận
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-6 py-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Cần xử lý</span>
              <span className="text-xl font-bold text-primary-600 leading-none">{orders.filter(o => o.orderStatus === 'PENDING').length}</span>
           </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-wrap gap-4 shadow-xl shadow-slate-100/50 animate-fade-in delay-100">
        <form onSubmit={handleSearch} className="flex-1 min-w-[280px] relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách hàng hoặc SĐT..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all shadow-inner"
          />
        </form>
        
        <div className="flex items-center gap-2 min-w-[200px] relative group">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
            className="w-full pl-14 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner cursor-pointer"
          >
            <option value="">TẤT CẢ TRẠNG THÁI</option>
            <option value="PENDING">ĐANG CHỜ</option>
            <option value="CONFIRMED">ĐÃ XÁC NHẬN</option>
            <option value="SHIPPING">ĐANG GIAO</option>
            <option value="DELIVERED">ĐÃ GIAO</option>
            <option value="CANCELLED">ĐÃ HỦY</option>
          </select>
        </div>
      </div>

      {/* Premium Orders Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-100/60 animate-fade-in delay-200">
        {loading ? (
          <div className="py-24">
             <LoadingSpinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner text-slate-200">
               <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">Không có đơn hàng</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Hệ thống chưa ghi nhận đơn hàng nào phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Đơn hàng</th>
                  <th className="text-left px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Khách hàng</th>
                  <th className="text-left px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ngày đặt</th>
                  <th className="text-left px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tổng tiền</th>
                  <th className="text-left px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Thanh toán</th>
                  <th className="text-left px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                  <th className="text-right px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 tracking-widest group-hover:text-primary-600 transition-colors">
                          #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {order.items?.length || 0} sản phẩm
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                             {order.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{order.user?.name || 'Khách'}</span>
                            <span className="text-[9px] font-bold text-slate-400 tracking-widest">{order.user?.phone || order.shippingAddress?.phone || 'N/A'}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{formatDate(order.createdAt)}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-sm font-bold text-slate-900 tracking-tight">{formatCurrency(order.total)}</p>
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell">
                       <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                            {order.paymentMethod}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${getOrderStatusColor(order.orderStatus)}`}>
                          {getStatusIcon(order.orderStatus)}
                          {getOrderStatusLabel(order.orderStatus)}
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center justify-end">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-90"
                            title="CHI TIẾT"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between animate-fade-in delay-300">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           Trang {currentPage} / {totalPages}
         </p>
         <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}

export default AdminOrdersPage
