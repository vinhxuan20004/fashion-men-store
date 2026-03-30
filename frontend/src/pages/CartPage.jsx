import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus, Tag, ShoppingBag, ArrowRight, X, ChevronRight } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency, getImageUrl } from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const CartPage = () => {
  const {
    cartItems,
    cartSubtotal,
    cartTotal,
    discount,
    shipping,
    voucher,
    loading,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyVoucher,
    removeVoucher
  } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [voucherCode, setVoucherCode] = useState('')
  const [applyingVoucher, setApplyingVoucher] = useState(false)

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã voucher')
      return
    }
    setApplyingVoucher(true)
    await applyVoucher(voucherCode.trim())
    setApplyingVoucher(false)
    setVoucherCode('')
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để tiếp tục')
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
      return
    }
    navigate('/checkout')
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center animate-fade-in">
        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl shadow-slate-200/50">
           <ShoppingBag className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-4xl font-display font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Giỏ hàng trống</h2>
        <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">Hãy lấp đầy giỏ hàng của bạn bằng những siêu phẩm mới nhất từ bộ sưu tập của chúng tôi.</p>
        <Link to="/products" className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/20 active:scale-95 group">
          KHÁM PHÁ NGAY
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="bg-slate-50 border-b border-slate-100 py-12 mb-12">
        <div className="container-custom">
           <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
              <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-900">Giỏ hàng</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tighter uppercase italic self-start">
             Túi đồ của bạn
           </h1>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">
             Có {cartItems.length} sản phẩm tuyển chọn
           </p>
        </div>
      </div>

      <div className="container-custom pb-20">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-50">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest italic">Sản phẩm trong giỏ</h3>
               <button
                onClick={clearCart}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                Xóa sạch giỏ hàng
              </button>
            </div>

            <div className="divide-y divide-slate-50">
              {cartItems.map((item) => {
                const product = item.product || {}
                const price = product.salePrice || product.price || item.price || 0
                const image = product.images?.[0]
                  ? getImageUrl(product.images[0])
                  : 'https://via.placeholder.com/100x120?text=No+Image'

                return (
                  <div key={item._id || item.id} className="py-8 first:pt-0 animate-fade-in group">
                    <div className="flex gap-8">
                      <Link to={`/products/${product.slug}`} className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={image}
                          alt={product.name || 'Sản phẩm'}
                          className="w-24 h-32 md:w-32 md:h-40 object-cover rounded-3xl shadow-lg shadow-slate-200/50"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/100x120?text=No+Image' }}
                        />
                        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-slate-900/5" />
                      </Link>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <Link
                              to={`/products/${product.slug}`}
                              className="text-lg font-display font-black text-slate-900 hover:text-primary-600 transition-colors line-clamp-2 leading-tight tracking-tight uppercase italic"
                            >
                              {product.name || 'Sản phẩm'}
                            </Link>
                            <button
                              onClick={() => removeFromCart(item._id || item.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            {item.size && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KÍCH CỠ:</span>
                                <span className="text-xs font-bold text-slate-900">{item.size}</span>
                              </div>
                            )}
                            {item.color && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MÀU SẮC:</span>
                                <span className="text-xs font-bold text-slate-900">{item.color}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                          <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                            <button
                              onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white text-slate-400 hover:text-slate-900 transition-all active:scale-90 disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white text-slate-400 hover:text-slate-900 transition-all active:scale-90"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thành tiền</div>
                             <div className="text-xl font-display font-black text-primary-600 tracking-tighter italic">
                               {formatCurrency(price * item.quantity)}
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-5 mt-16 lg:mt-0">
            <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 sticky top-28 backdrop-blur-3xl shadow-2xl shadow-slate-200/50">
               <h2 className="text-2xl font-display font-black text-slate-900 tracking-tighter uppercase italic mb-8">Tổng cộng đơn hàng</h2>

               {/* Voucher Section */}
               <div className="mb-10">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                    <Tag className="w-4 h-4" />
                    Ưu đãi & Voucher
                  </label>
                  
                  {voucher ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-3xl pl-6 pr-3 py-3 animate-slide-up">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">{voucher.code}</span>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">Giảm {formatCurrency(discount)}</span>
                      </div>
                      <button onClick={removeVoucher} className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-emerald-600 hover:text-red-500 transition-colors shadow-sm active:scale-90">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="MÃ GIẢM GIÁ"
                        className="flex-1 bg-white border border-white rounded-2xl px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-sm placeholder:text-slate-300"
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={applyingVoucher}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                      >
                        {applyingVoucher ? '...' : 'ÁP DỤNG'}
                      </button>
                    </div>
                  )}
               </div>

               {/* Pricing Breakdown */}
               <div className="space-y-4 mb-10 pb-10 border-b border-slate-200/50 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tạm tính</span>
                    <span className="font-black text-slate-900">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Giảm giá voucher</span>
                      <span className="font-black text-emerald-600">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Phí vận chuyển</span>
                    <span className={`font-black ${shipping === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {shipping === 0 ? 'MIỄN PHÍ' : formatCurrency(shipping)}
                    </span>
                  </div>
                  {shipping === 0 && cartSubtotal > 0 && (
                    <div className="bg-emerald-50 text-[10px] text-emerald-700 font-black uppercase tracking-widest px-4 py-2 rounded-xl text-center shadow-sm">
                      Bạn đã đủ điều kiện miễn phí vận chuyển
                    </div>
                  )}
               </div>

               <div className="flex justify-between items-center mb-10">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Tổng thanh toán</span>
                  <span className="text-3xl font-display font-black text-primary-600 tracking-tighter italic">
                    {formatCurrency(cartTotal)}
                  </span>
               </div>

               <div className="space-y-4">
                  <button
                    onClick={handleCheckout}
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-primary-600 active:scale-[0.98] transition-all shadow-2xl shadow-slate-900/20 group"
                  >
                    TIẾN HÀNH THANH TOÁN
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <Link
                    to="/products"
                    className="block text-center text-[10px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-widest mt-6 transition-colors underline decoration-2 underline-offset-8"
                  >
                    QUAY LẠI MUA SẮM
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage

