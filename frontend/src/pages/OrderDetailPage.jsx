import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Package, MapPin, CreditCard, Check, Clock, X, ChevronLeft, AlertCircle, ShieldCheck, Truck, ShoppingBag, Receipt } from 'lucide-react'
import { orderAPI } from '../services/api'
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getImageUrl
} from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Chờ xác nhận', icon: Clock },
  { key: 'CONFIRMED', label: 'Đã xác nhận', icon: Check },
  { key: 'SHIPPING', label: 'Đang giao', icon: Truck },
  { key: 'DELIVERED', label: 'Đã giao', icon: ShoppingBag }
]

const OrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchOrder()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await orderAPI.getById(id)
      setOrder(response.data.data.order || response.data.data)
    } catch (error) {
      toast.error('Không thể tải đơn hàng')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy')
      return
    }
    setCancelling(true)
    try {
      await orderAPI.cancel(id, cancelReason)
      toast.success('Đã hủy đơn hàng')
      fetchOrder()
      setCancelOpen(false)
      setCancelReason('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
  if (!order) return null

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.orderStatus)
  const isCancelled = order.orderStatus === 'CANCELLED'
  const canCancel = order.orderStatus === 'PENDING'

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="bg-slate-50 border-b border-slate-100 py-12 mb-12">
        <div className="container-custom">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <button
                  onClick={() => navigate('/orders')}
                  className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 hover:text-primary-600 transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" />
                  QUAY LẠI DANH SÁCH
                </button>
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tighter uppercase italic">
                    Đơn hàng #{order.orderNumber || order._id?.slice(-8)}
                  </h1>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm ${getOrderStatusColor(order.orderStatus)}`}>
                    {getOrderStatusLabel(order.orderStatus)}
                  </span>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">
                  Đặt ngày {formatDateTime(order.createdAt)}
                </p>
              </div>

              {canCancel && (
                <button
                  onClick={() => setCancelOpen(true)}
                  className="px-8 py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:border-red-500 hover:text-red-500 transition-all active:scale-95 shadow-sm"
                >
                  HỦY ĐƠN HÀNG
                </button>
              )}
           </div>
        </div>
      </div>

      <div className="container-custom pb-20">
        {!isCancelled && (
          <div className="bg-slate-50 rounded-[3rem] p-10 mb-12 border border-slate-100 shadow-xl shadow-slate-100/50">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-10 italic">Lộ trình vận chuyển</h2>
            <div className="relative flex items-center justify-between max-w-4xl mx-auto px-4">
               {/* Background Line */}
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full" />
               <div 
                 className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 rounded-full transition-all duration-1000 ease-out" 
                 style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
               />

              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon
                const isCompleted = idx <= currentStepIndex
                const isActive = idx === currentStepIndex
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isCompleted
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                        : 'bg-white text-slate-300 border border-slate-100'
                    } ${isActive ? 'scale-125 ring-8 ring-primary-50 active-pulse' : ''}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="absolute -bottom-10 whitespace-nowrap text-center">
                      <p className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                        isCompleted ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-10 mb-12 flex items-start gap-6 animate-fade-in shadow-xl shadow-red-100/30">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm shrink-0">
               <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-red-900 uppercase italic tracking-tight mb-2">Đơn hàng đã bị hủy</h2>
              {order.cancelReason && (
                <p className="text-sm text-red-700/70 font-medium">Lý do từ chối: <span className="font-bold underline">{order.cancelReason}</span></p>
              )}
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-12">
            {/* Products Section */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                    <Package className="w-5 h-5" />
                 </div>
                 <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Sản phẩm trong đơn</h2>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-100/50">
                <div className="divide-y divide-slate-50">
                  {order.items?.map((item, idx) => {
                    const product = item.product || {}
                    const name = product.name || item.productName || 'Sản phẩm'
                    const price = item.price || product.salePrice || product.price || 0
                    const image = product.images?.[0] 
                      ? getImageUrl(product.images[0]) 
                      : (item.productImage ? getImageUrl(item.productImage) : null)

                    return (
                      <div key={idx} className="p-8 flex items-center gap-8 group">
                        <Link to={product.slug ? `/products/${product.slug}` : '#'} className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                          <img 
                             src={image} 
                             alt={name} 
                             className="w-24 h-32 object-cover rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100"
                             onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&q=80' }} 
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={product.slug ? `/products/${product.slug}` : '#'} className="text-lg font-display font-black text-slate-900 hover:text-primary-600 transition-colors uppercase italic line-clamp-1 leading-tight mb-2">
                             {name}
                          </Link>
                          <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {item.variant?.size && <p>SIZE: <span className="text-slate-900">{item.variant.size}</span></p>}
                            {item.variant?.color && <p>MÀU: <span className="text-slate-900">{item.variant.color}</span></p>}
                            <p>SỐ LƯỢNG: <span className="text-slate-900">{item.quantity}</span></p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                             <p className="text-xl font-display font-black text-primary-600 italic tracking-tighter price-bold">
                               {formatCurrency(price * item.quantity)}
                             </p>
                             <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Đơn giá: {formatCurrency(price)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* Shipping Info Section */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                    <MapPin className="w-5 h-5" />
                 </div>
                 <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Thông tin nhận hàng</h2>
              </div>

              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Người nhận hàng</p>
                      <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">{order.shippingAddress?.fullName}</h3>
                      <p className="text-sm font-bold text-slate-500 tracking-wide">{order.shippingAddress?.phone}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Địa chỉ giao hàng</p>
                      <p className="text-sm font-bold text-slate-900 leading-relaxed italic">{order.shippingAddress?.street}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {order.shippingAddress?.district}, {order.shippingAddress?.city}
                      </p>
                   </div>
                </div>
              </div>
            </section>
          </div>

          {/* Checkout Totals Sidebar */}
          <div className="lg:col-span-4 mt-16 lg:mt-0">
            <div className="bg-slate-900 text-white rounded-[3rem] p-10 sticky top-28 shadow-2xl shadow-slate-900/30 overflow-hidden group">
               {/* Decorative Gradient */}
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-600/20 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
               
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-8">
                    <Receipt className="w-5 h-5 text-primary-400" />
                    <h2 className="text-lg font-display font-black tracking-tighter uppercase italic">Thanh toán</h2>
                 </div>

                 <div className="space-y-6 mb-10 pb-10 border-b border-white/10">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Phương thức</span>
                      <span className="text-white">{getPaymentMethodLabel(order.paymentMethod)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Trạng thái</span>
                      <span className={`px-4 py-1.5 rounded-full ring-1 ring-inset ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {getPaymentStatusLabel(order.paymentStatus, order.paymentMethod)}
                      </span>
                    </div>
                 </div>

                 <div className="space-y-4 mb-10 text-sm">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Giá trị đơn</span>
                     <span className="price-bold">{formatCurrency(order.subtotal)}</span>
                   </div>
                   {order.discountAmount > 0 && (
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-400">
                       <span>Giảm giá</span>
                       <span className="price-bold">-{formatCurrency(order.discountAmount)}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Vận chuyển</span>
                     <span className={`price-bold ${order.shippingFee === 0 ? 'text-emerald-400' : ''}`}>
                       {order.shippingFee === 0 ? 'MIỄN PHÍ' : formatCurrency(order.shippingFee)}
                     </span>
                   </div>
                 </div>

                 <div className="flex justify-between items-end mb-10">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Thanh toán</span>
                    <span className="text-3xl font-display font-black text-primary-400 tracking-tighter italic price-bold">
                      {formatCurrency(order.total)}
                    </span>
                 </div>

                 <div className="bg-white/5 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                       Giao dịch đã được xác thực <br/> & bảo mật bởi Men Studio
                    </p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Dialog Redesigned */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-fade-in">
          <div className="absolute inset-0" onClick={() => setCancelOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-lg z-10 shadow-[0_32px_128px_-15px_rgba(0,0,0,0.3)] animate-slide-up">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center shadow-inner">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-black text-slate-900 uppercase italic tracking-tight">Hủy đơn hàng</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Vui lòng cho chúng tôi biết lý do của bạn</p>
              </div>
            </div>
            
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 ml-1">Lý do hủy đơn *</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="VÍ DỤ: TÔI MUỐN THAY ĐỔI ĐỊA CHỈ, ĐỔI SIZE..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all shadow-inner placeholder:text-slate-300 mb-8"
            />
            
            <div className="flex gap-4">
              <button
                onClick={() => { setCancelOpen(false); setCancelReason('') }}
                className="flex-1 py-5 bg-slate-50 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
              >
                QUAY LẠI
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-slate-900/20 disabled:opacity-50"
              >
                {cancelling ? 'XỬ THỦ...' : 'XÁC NHẬN HỦY'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetailPage
