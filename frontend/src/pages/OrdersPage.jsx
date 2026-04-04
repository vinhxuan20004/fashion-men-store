import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, ShoppingBag, Clock, CheckCircle2, Truck, XCircle, Search } from 'lucide-react'
import { orderAPI } from '../services/api'
import {
  formatCurrency,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentMethodLabel
} from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Pagination from '../components/common/Pagination'

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả đơn hàng' },
  { value: 'PENDING', label: 'Chờ xác nhận', icon: Clock },
  { value: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle2 },
  { value: 'SHIPPING', label: 'Đang giao', icon: Truck },
  { value: 'DELIVERED', label: 'Đã giao', icon: CheckCircle2 },
  { value: 'CANCELLED', label: 'Đã hủy', icon: XCircle }
]

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchOrders()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: 10 }
      if (statusFilter) params.status = statusFilter
      const response = await orderAPI.getUserOrders(params)
      const data = response.data.data
      setOrders(data.orders || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="bg-slate-50 border-b border-slate-100 py-12 mb-12">
        <div className="container-custom">
           <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-primary-600"></span>
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Lịch sử mua sắm</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tighter uppercase italic">Đơn hàng của tôi</h1>
        </div>
      </div>

      <div className="container-custom pb-20">
        {/* Status Filters - Premium Pills */}
        <div className="flex flex-wrap gap-3 mb-12 animate-fade-in">
          {STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter.value
            return (
              <button
                key={filter.value}
                onClick={() => { setStatusFilter(filter.value); setCurrentPage(1) }}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-sm ${
                  active
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                    : 'bg-white border border-slate-100 text-slate-400 hover:border-primary-600 hover:text-primary-600'
                }`}
              >
                {filter.icon && <filter.icon className="w-4 h-4" />}
                {filter.label}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <LoadingSpinner />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Đang tải lịch sử đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-50 rounded-[4rem] py-32 text-center border-2 border-dashed border-slate-200 animate-fade-in">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200/50">
               <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-3xl font-display font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Bạn chưa có đơn hàng nào</h3>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">Hãy bắt đầu hành trình phong cách của bạn ngay hôm nay bằng cách khám phá bộ sưu tập mới nhất.</p>
            <Link to="/products" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
              MUA SẮM NGAY
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, idx) => (
              <div 
                key={order._id} 
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 animate-fade-in group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-50">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Mã đơn hàng</p>
                      <p className="text-lg font-display font-black text-slate-900 uppercase italic tracking-tight">#{order.orderNumber || order._id?.slice(-8)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Ngày đặt</p>
                      <p className="text-xs font-bold text-slate-900">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-sm ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items Horizontal Scroll */}
                <div className="flex gap-4 overflow-x-auto pb-6 mb-6 custom-scrollbar no-scrollbar">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex-shrink-0 group/item relative">
                       <div className="w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden relative shadow-sm border border-slate-100">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0].startsWith('http') ? item.product.images[0] : `http://localhost:5000${item.product.images[0]}`}
                            alt={item.product?.name}
                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute top-1 right-1 bg-slate-900 text-white text-[9px] font-black w-5 h-5 rounded-lg flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                          {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 5 && (
                    <div className="flex-shrink-0 w-20 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest border border-dashed border-slate-200">
                      +{order.items.length - 5}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-10">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Thanh toán</p>
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{getPaymentMethodLabel(order.paymentMethod)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Tổng cộng</p>
                      <p className="text-xl font-display font-black text-primary-600 tracking-tighter italic price-bold">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to={`/orders/${order._id}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-slate-50 hover:bg-slate-900 text-slate-900 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-sm active:scale-95"
                  >
                    XEM CHI TIẾT
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}

            <div className="pt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage

