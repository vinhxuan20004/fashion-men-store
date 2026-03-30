import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { CreditCard, Truck, Smartphone, ChevronRight, Lock, MapPin, ShieldCheck, ArrowLeft } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { orderAPI, paymentAPI } from '../services/api'
import { formatCurrency, getImageUrl } from '../utils/helpers'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  {
    id: 'COD',
    label: 'Thanh toán khi nhận hàng',
    description: 'Trả tiền mặt trực tiếp khi shipper giao hàng tới tay bạn.',
    icon: Truck,
    color: 'bg-slate-900'
  },
  {
    id: 'VNPAY',
    label: 'Cổng thanh toán VNPay',
    description: 'Thanh toán an toàn qua ATM, Visa, Mastercard hoặc QR Pay.',
    icon: CreditCard,
    color: 'bg-blue-600'
  },
  {
    id: 'MOMO',
    label: 'Ví điện tử MoMo',
    description: 'Thanh toán siêu nhanh qua ứng dụng MoMo trên điện thoại.',
    icon: Smartphone,
    color: 'bg-pink-600'
  }
]

const CheckoutPage = () => {
  const { cartItems, cartSubtotal, cartTotal, discount, shipping, voucher, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      district: user?.address?.district || ''
    }
  })

  const onSubmit = async (formData) => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          district: formData.district,
          city: formData.city
        },
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.product?._id || item.productId,
          variantId: item.variant?._id || item.variantId,
          quantity: item.quantity
        })),
        ...(voucher && { voucherCode: voucher.code })
      }

      const orderRes = await orderAPI.create(orderData)
      const order = orderRes.data.order || orderRes.data
      const orderId = order._id || order.id

      if (paymentMethod === 'COD') {
        await clearCart()
        toast.success('Đặt hàng thành công!')
        navigate(`/orders/${orderId}`)
      } else if (paymentMethod === 'VNPAY') {
        const payRes = await paymentAPI.createVnpay(orderId)
        const paymentUrl = payRes.data.paymentUrl || payRes.data.url
        if (paymentUrl) {
          await clearCart()
          window.location.href = paymentUrl
        } else {
          toast.error('Không thể tạo link thanh toán VNPay')
        }
      } else if (paymentMethod === 'MOMO') {
        const payRes = await paymentAPI.createMomo(orderId)
        const paymentUrl = payRes.data.paymentUrl || payRes.data.payUrl || payRes.data.url
        if (paymentUrl) {
          await clearCart()
          window.location.href = paymentUrl
        } else {
          toast.error('Không thể tạo link thanh toán MoMo')
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center animate-fade-in">
        <h2 className="text-4xl font-display font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Giỏ hàng trống</h2>
        <Link to="/products" className="btn-primary py-3 px-8 text-xs inline-flex items-center gap-2">
           QUAY LẠI MUA SẮM
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Checkout Header */}
      <div className="bg-slate-50 border-b border-slate-100 py-12 mb-12">
        <div className="container-custom">
           <Link to="/cart" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 hover:text-primary-600 transition-colors">
              <ArrowLeft className="w-3 h-3" />
              QUAY LẠI GIỎ HÀNG
           </Link>
           <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tighter uppercase italic">Thanh toán</h1>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             Giao dịch bảo mật & Mã hóa 256-bit
           </p>
        </div>
      </div>

      <div className="container-custom pb-20">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            {/* Left: Shipping & Payment Information */}
            <div className="lg:col-span-7 space-y-12 mb-12 lg:mb-0">
              {/* Shipping Address Section */}
              <section className="animate-fade-in">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                      <MapPin className="w-5 h-5" />
                   </div>
                   <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Địa chỉ giao hàng</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Nơi chúng tôi gửi gắm phong cách cho bạn</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên người nhận</label>
                    <input
                      {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
                      className="w-full bg-white border border-white rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-sm placeholder:text-slate-300"
                      placeholder="NGUYỄN VĂN A"
                    />
                    {errors.fullName && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.fullName.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại liên lạc</label>
                    <input
                      {...register('phone', {
                        required: 'Vui lòng nhập số điện thoại',
                        pattern: { value: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                      })}
                      className="w-full bg-white border border-white rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-sm placeholder:text-slate-300"
                      placeholder="0901 234 567"
                      type="tel"
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.phone.message}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ (Số nhà, tên đường, phường/xã)</label>
                    <input
                      {...register('street', { required: 'Vui lòng nhập địa chỉ' })}
                      className="w-full bg-white border border-white rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-sm placeholder:text-slate-300"
                      placeholder="123 ĐƯỜNG ABC, PHƯỜNG X, QUẬN Y"
                    />
                    {errors.street && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.street.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quận / Huyện</label>
                    <input
                      {...register('district', { required: 'Vui lòng nhập quận/huyện' })}
                      className="w-full bg-white border border-white rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-sm placeholder:text-slate-300"
                      placeholder="QUẬN 1"
                    />
                    {errors.district && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.district.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tỉnh / Thành phố</label>
                    <input
                      {...register('city', { required: 'Vui lòng nhập tỉnh/thành phố' })}
                      className="w-full bg-white border border-white rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-sm placeholder:text-slate-300"
                      placeholder="TP. HỒ CHÍ MINH"
                    />
                    {errors.city && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.city.message}</p>}
                  </div>
                </div>
              </section>

              {/* Payment Method Selection */}
              <section className="animate-fade-in delay-100">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                      <CreditCard className="w-5 h-5" />
                   </div>
                   <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Phương thức thanh toán</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lựa chọn cách thức thuận tiện nhất cho bạn</p>
                   </div>
                </div>

                <div className="space-y-4">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon
                    const active = paymentMethod === method.id
                    return (
                      <label
                        key={method.id}
                        className={`group relative flex items-center gap-6 p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${
                          active
                            ? 'border-slate-900 bg-white shadow-xl shadow-slate-200/50'
                            : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={active}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          active ? method.color + ' text-white scale-110 shadow-lg' : 'bg-white text-slate-300 group-hover:text-slate-500'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-black uppercase tracking-widest transition-colors ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                            {method.label}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-relaxed opacity-70">
                            {method.description}
                          </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                          active ? 'border-primary-600' : 'border-slate-200'
                        }`}>
                          {active && <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </section>
            </div>

            {/* Right: Order Summary Sticky */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 sticky top-28 backdrop-blur-3xl shadow-2xl shadow-slate-200/50">
                 <h2 className="text-2xl font-display font-black text-slate-900 tracking-tighter uppercase italic mb-8">Đơn hàng của bạn</h2>

                 <div className="space-y-6 mb-10 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                   {cartItems.map((item) => {
                     const product = item.product || {}
                     const price = product.salePrice || product.price || item.price || 0
                     const image = product.images?.[0]
                       ? getImageUrl(product.images[0])
                       : 'https://via.placeholder.com/60x80?text=img'

                     return (
                       <div key={item._id || item.id} className="flex gap-6 group animate-fade-in">
                         <div className="relative flex-shrink-0">
                           <img
                             src={image}
                             alt={product.name}
                             className="w-16 h-20 object-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-300"
                             onError={(e) => { e.target.src = 'https://via.placeholder.com/60x80?text=img' }}
                           />
                           <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-slate-50">
                             {item.quantity}
                           </span>
                         </div>
                         <div className="flex-1 min-w-0 flex flex-col justify-center">
                           <p className="text-xs font-black text-slate-900 uppercase tracking-widest line-clamp-1 italic italic">{product.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                             {item.size && `Size: ${item.size}`}
                             {item.color && ` | ${item.color}`}
                           </p>
                           <p className="text-sm font-display font-black text-primary-600 mt-2 tracking-tighter italic font-display">
                             {formatCurrency(price * item.quantity)}
                           </p>
                         </div>
                       </div>
                     )
                   })}
                 </div>

                 <div className="space-y-4 mb-10 pb-8 border-b border-slate-200/50">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Tạm tính</span>
                      <span className="text-slate-900">{formatCurrency(cartSubtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        <span>Mã giảm giá</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Phí giao hàng</span>
                      <span className={shipping === 0 ? 'text-emerald-600' : 'text-slate-900'}>
                        {shipping === 0 ? 'MIỄN PHÍ' : formatCurrency(shipping)}
                      </span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center mb-10">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Tổng thanh toán</span>
                    <span className="text-3xl font-display font-black text-primary-600 tracking-tighter italic">
                      {formatCurrency(cartTotal)}
                    </span>
                 </div>

                 <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-primary-600 active:scale-[0.98] transition-all shadow-2xl shadow-slate-900/20 group disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        XÁC NHẬN ĐẶT HÀNG
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-[9px] text-slate-300 font-bold text-center mt-6 uppercase tracking-[0.2em] leading-relaxed">
                    Bằng việc nhấn đặt hàng, bạn đồng ý với <br/> các điều khoản & chính sách của Men's Fashion Studio.
                  </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage

