import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Printer,
  FileText,
  BadgeCheck
} from 'lucide-react'
import { orderAPI } from '../../services/api'
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminOrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getById(id)
        setOrder(res.data.data.order)
      } catch (error) {
        toast.error('Không thể tải thông tin đơn hàng')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const handleUpdateStatus = async (status) => {
    setUpdating(true)
    try {
      await orderAPI.updateStatus(id, status)
      const res = await orderAPI.getById(id)
      setOrder(res.data.data.order)
      toast.success(`Đã cập nhật đơn hàng thành: ${getOrderStatusLabel(status)}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>
  if (!order) return (
    <div className="py-20 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-black text-slate-900 uppercase">Không tìm thấy đơn hàng</h2>
      <Link to="/admin/orders" className="text-primary-600 font-bold uppercase tracking-widest text-[10px] mt-4 block hover:underline">Quay lại danh sách</Link>
    </div>
  )

  const steps = [
    { status: 'PENDING', label: 'Chờ xác nhận', icon: Clock },
    { status: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle2 },
    { status: 'SHIPPING', label: 'Đang giao hàng', icon: Truck },
    { status: 'DELIVERED', label: 'Đã giao hàng', icon: BadgeCheck }
  ]

  const currentStepIndex = steps.findIndex(s => s.status === order.orderStatus)
  const isCancelled = order.orderStatus === 'CANCELLED'

  const nextStatusMap = {
    'PENDING': 'CONFIRMED',
    'CONFIRMED': 'SHIPPING',
    'SHIPPING': 'DELIVERED'
  }

  const nextStatus = nextStatusMap[order.orderStatus]

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link to="/admin/orders" className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-primary-600 transition-colors mb-4 group">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             Quay lại danh sách
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-black text-slate-900 uppercase">
              ĐƠN HÀNG #{order.orderNumber || order._id.slice(-8).toUpperCase()}
            </h1>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getOrderStatusColor(order.orderStatus)}`}>
              {getOrderStatusLabel(order.orderStatus)}
            </div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-600" />
            Ngày đặt: {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-4">
           {nextStatus && (
             <button
               onClick={() => handleUpdateStatus(nextStatus)}
               disabled={updating}
               className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 active:scale-95"
             >
               XÁC NHẬN: {getOrderStatusLabel(nextStatus).toUpperCase()}
             </button>
           )}
           {['PENDING', 'CONFIRMED'].includes(order.orderStatus) && (
             <button
               onClick={() => handleUpdateStatus('CANCELLED')}
               disabled={updating}
               className="px-8 py-4 bg-white text-red-500 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-all duration-300 disabled:opacity-50 active:scale-95"
             >
               HỦY ĐƠN HÀNG
             </button>
           )}
        </div>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-100/50">
          <div className="flex items-center justify-between max-w-4xl mx-auto relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
            <div 
               className="absolute top-1/2 left-0 h-1 bg-primary-600 -translate-y-1/2 z-0 rounded-full transition-all duration-1000" 
               style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isPast = idx < currentStepIndex
              const isCurrent = idx === currentStepIndex
              
              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                    isPast ? 'bg-primary-600 text-white' : 
                    isCurrent ? 'bg-slate-900 text-white scale-110' : 
                    'bg-white text-slate-300 border border-slate-100'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="mt-4 text-center">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Order Items */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-100/60">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <ShoppingBag className="w-5 h-5 text-primary-600" />
                 Sản phẩm trong đơn ({order.items?.length || 0})
               </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-8 flex items-center gap-8 group hover:bg-slate-50/30 transition-colors">
                  <div className="w-24 h-32 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src={item.productImage?.startsWith('http') ? item.productImage : `http://localhost:5000${item.productImage}`} 
                      alt={item.productName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-[0.1em] mb-2">{item.productName}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Size: <span className="text-slate-900">{item.variant?.size}</span></span>
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: item.variant?.color }} /> Màu: <span className="text-slate-900">{item.variant?.color}</span></span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> SL: <span className="text-slate-900">x{item.quantity}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">{formatCurrency(item.price)}</p>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Tổng: {formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid md:grid-cols-2 gap-10">
             <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] flex items-center justify-center">
                   <User className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Thông tin khách hàng</h3>
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                         <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Họ tên</p>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{order.user?.name || order.shippingAddress.name}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                         <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Email</p>
                        <p className="text-xs font-black text-slate-900 tracking-widest lowercase">{order.user?.email || 'N/A'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                         <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Số điện thoại</p>
                        <p className="text-xs font-black text-slate-900 tracking-widest">{order.user?.phone || order.shippingAddress.phone || 'N/A'}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] flex items-center justify-center">
                   <MapPin className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Địa chỉ giao hàng</h3>
                <div className="space-y-4">
                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                         <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-loose">
                          {order.shippingAddress.address}<br />
                          {order.shippingAddress.ward}, {order.shippingAddress.district}<br />
                          {order.shippingAddress.city}
                        </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-10">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-600/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
             <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-10 relative z-10 flex items-center justify-between">
                THANH TOÁN
                <CreditCard className="w-5 h-5 text-primary-400" />
             </h3>

             <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
                   <span>TỔNG TIỀN HÀNG</span>
                   <span className="text-white">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
                   <span>GIẢM GIÁ</span>
                   <span className="text-emerald-400">-{formatCurrency(order.discountAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
                   <span>PHÍ VẬN CHUYỂN</span>
                   <span className="text-white">{formatCurrency(order.shippingFee)}</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex items-end justify-between">
                   <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">TỔNG CỘNG</span>
                   <span className="text-3xl font-black">{formatCurrency(order.total)}</span>
                </div>
             </div>

             <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                   <span className="text-white/40">Phương thức</span>
                   <span className="text-white">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                   <span className="text-white/40">Trạng thái</span>
                   <span className={order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}>
                     {order.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                   </span>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Ghi chú đơn hàng</h3>
             <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest leading-relaxed">
                   {order.notes || "KHÔNG CÓ GHI CHÚ TỪ KHÁCH HÀNG"}
                </p>
             </div>
             
             <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                   <div className="flex items-center gap-3">
                      <Printer className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">In hóa đơn (PDF)</span>
                   </div>
                   <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-primary-600 transition-colors" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetailPage
