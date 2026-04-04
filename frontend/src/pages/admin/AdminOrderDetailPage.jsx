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
  BadgeCheck,
  ChevronLeft,
  ArrowUpRight,
  Tag
} from 'lucide-react'
import { orderAPI } from '../../services/api'
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor, getImageUrl } from '../../utils/helpers'
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

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>
  if (!order) return (
    <div className="py-20 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-slate-800">Không tìm thấy đơn hàng</h2>
      <Link to="/admin/orders" className="text-primary-600 font-medium text-xs mt-4 block hover:underline">Quay lại danh sách</Link>
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

  const statusLabels = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'SHIPPING': 'Đang giao hàng',
    'DELIVERED': 'Đã giao hàng'
  }

  const allStatuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED']
  const currentIndex = allStatuses.indexOf(order.orderStatus)
  const availableStatuses = allStatuses.filter((_, idx) => idx > currentIndex)

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { padding: 0 !important; background: white !important; }
          .max-w-6xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .shadow-sm, .shadow-xl, .shadow-2xl { shadow: none !important; box-shadow: none !important; }
          .border { border: 1px solid #f1f5f9 !important; }
          .bg-slate-50, .bg-slate-50\\/30 { background-color: #f8fafc !important; }
          /* Hide navigation and buttons */
          header, nav, footer, .sidebar, .back-link, button, select, .no-print { display: none !important; }
          /* More specific cleanup */
          .pb-10 { padding-bottom: 0 !important; }
          .space-y-10 > * + * { margin-top: 1.5rem !important; }
        }
      `}} />
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <Link to="/admin/orders" className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-primary-600 transition-colors mb-2 group no-print">
             <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             Quay lại danh sách
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-800">
              Đơn hàng #{order.orderNumber || order._id.slice(-8).toUpperCase()}
            </h1>
            <div className={`px-3 py-1 rounded-xl text-xs font-medium capitalize ring-1 ring-inset ${getOrderStatusColor(order.orderStatus).includes('emerald') ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20'}`}>
              {getOrderStatusLabel(order.orderStatus)?.toLowerCase() || ''}
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(order.createdAt)}
            </span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              {order.items?.length || 0} sản phẩm
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 no-print">
            {availableStatuses.length > 0 && !isCancelled && (
              <div className="relative group">
                <select
                  disabled={updating}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  value=""
                  className="appearance-none pl-5 pr-12 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xl hover:bg-slate-800 transition-all duration-300 disabled:opacity-50 cursor-pointer border-none outline-none ring-offset-2 focus:ring-2 focus:ring-slate-900"
                >
                  <option value="" disabled>Cập nhật trạng thái</option>
                  {availableStatuses.map(status => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 group-hover:text-white transition-colors duration-300">
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>
            )}
            
            {['PENDING', 'CONFIRMED', 'SHIPPING'].includes(order.orderStatus) && (
              <button
                onClick={() => handleUpdateStatus('CANCELLED')}
                disabled={updating}
                className="px-5 py-2.5 bg-white text-red-500 border border-slate-100 rounded-xl text-xs font-semibold hover:bg-red-50 hover:border-red-100 transition-all duration-300 disabled:opacity-50 active:scale-95 no-print"
              >
                Hủy đơn
              </button>
            )}
         </div>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between max-w-4xl mx-auto relative px-10">
            {/* Background line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
            
            {/* Active progress line */}
            <div 
               className="absolute top-1/2 left-0 h-0.5 bg-primary-600 -translate-y-1/2 z-0 transition-all duration-700" 
               style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isPast = idx < currentStepIndex
              const isCurrent = idx === currentStepIndex
              
              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    isPast ? 'bg-primary-600 text-white' : 
                    isCurrent ? 'bg-slate-900 text-white shadow-lg scale-110' : 
                    'bg-white text-slate-300 border border-slate-100 shadow-sm'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="absolute -bottom-8 whitespace-nowrap">
                    <p className={`text-[11px] font-medium transition-colors ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="h-8" /> {/* Spacer for bottom labels */}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
               <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2.5">
                 <ShoppingBag className="w-4.5 h-4.5 text-primary-600" />
                 Sản phẩm trong đơn ({order.items?.length || 0})
               </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items?.map((item, idx) => {
                const product = item.product || {}
                const image = product.images?.[0] 
                  ? getImageUrl(product.images[0]) 
                  : (item.productImage ? getImageUrl(item.productImage) : null)
                
                return (
                  <div key={idx} className="p-5 flex items-center gap-6 group hover:bg-slate-50/30 transition-colors">
                    <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-slate-100">
                      <Link to={product.slug ? `/products/${product.slug}` : '#'}>
                        <img 
                          src={image} 
                          alt={item.productName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                    </div>
                    <div className="flex-1">
                      <Link to={product.slug ? `/products/${product.slug}` : '#'}>
                        <p className="text-sm font-medium text-slate-900 mb-1.5 hover:text-primary-600 transition-colors">{item.productName}</p>
                      </Link>
                    <div className="flex flex-wrap gap-4 text-[11px] font-medium text-slate-400">
                      <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Kích cỡ: <span className="text-slate-700">{item.variant?.size}</span></span>
                      <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full border border-slate-200" style={{ backgroundColor: item.variant?.color }} /> Màu: <span className="text-slate-700">{item.variant?.color}</span></span>
                      <span className="flex items-center gap-1.5">Số lượng: <span className="text-slate-700">{item.quantity}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.price)}</p>
                    <p className="text-[10px] font-medium text-slate-300 capitalize mt-0.5">Tổng: {formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid md:grid-cols-2 gap-8">
             <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                   <User className="w-6 h-6 text-slate-200" />
                </div>
                <h3 className="text-xs font-semibold text-slate-400 capitalize tracking-tight mb-5">Thông tin khách hàng</h3>
                <div className="space-y-4">
                   <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                         <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-slate-300 capitalize">Họ tên</p>
                        <p className="text-sm font-normal text-slate-700">{order.user?.name || order.shippingAddress.name}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                         <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-slate-300 capitalize">Email</p>
                        <p className="text-sm font-normal text-slate-700 break-all">{order.user?.email || 'N/A'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                         <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-slate-300 capitalize">Số điện thoại</p>
                        <p className="text-sm font-normal text-slate-700">{order.user?.phone || order.shippingAddress.phone || 'N/A'}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                   <MapPin className="w-6 h-6 text-slate-200" />
                </div>
                <h3 className="text-xs font-semibold text-slate-400 capitalize tracking-tight mb-5">Địa chỉ giao hàng</h3>
                <div className="space-y-4">
                   <div className="flex gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
                         <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-normal text-slate-700 leading-relaxed">
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
        <div className="space-y-8">
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm relative overflow-hidden group">
             <h3 className="text-sm font-semibold text-slate-800 mb-6 flex items-center justify-between">
                Thanh toán
                <CreditCard className="w-4.5 h-4.5 text-primary-600" />
             </h3>

             <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                   <span>Tiền hàng</span>
                   <span className="text-slate-700">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                   <span>Giảm giá</span>
                   <span className="text-emerald-500">-{formatCurrency(order.discountAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                   <span>Phí vận chuyển</span>
                   <span className="text-slate-700">{formatCurrency(order.shippingFee)}</span>
                </div>
                <div className="h-px bg-slate-50 my-2" />
                <div className="flex items-center justify-between pt-1">
                   <span className="text-xs font-semibold text-slate-800 capitalize">Tổng cộng</span>
                   <span className="text-xl font-semibold text-slate-900">{formatCurrency(order.total)}</span>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-50 space-y-3.5">
                <div className="flex items-center justify-between text-[11px] font-medium">
                   <span className="text-slate-400 capitalize">Phương thức</span>
                   <span className="text-slate-700">{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán Online'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium">
                   <span className="text-slate-400 capitalize">Trạng thái</span>
                   <span className={`px-2 py-0.5 rounded-md text-[10px] ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                     {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                   </span>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
             <h3 className="text-xs font-semibold text-slate-400 capitalize tracking-tight mb-5">Ghi chú đơn hàng</h3>
             <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-normal text-slate-600 leading-relaxed">
                   {order.notes || "Không có ghi chú từ khách hàng"}
                </p>
             </div>
             
             <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <button 
                  onClick={handlePrint}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group no-print"
                >
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-primary-600 transition-colors">
                        <Printer className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-700">In hóa đơn (PDF)</span>
                   </div>
                   <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition-colors" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetailPage
