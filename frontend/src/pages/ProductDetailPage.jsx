import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Share2, ChevronRight, Minus, Plus, Star, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { productAPI, reviewAPI } from '../services/api'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import ProductCard from '../components/product/ProductCard'
import ProductImageGallery from '../components/product/ProductImageGallery'
import StarRating from '../components/product/StarRating'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const ProductDetailPage = () => {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const { isAuthenticated, user } = useAuth()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingCart, setAddingCart] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [submitReview, setSubmitReview] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const prodRes = await productAPI.getOne(slug)
        const prod = prodRes.data.data?.product || prodRes.data.product || prodRes.data
        setProduct(prod)

        const [revRes, relRes] = await Promise.all([
          reviewAPI.getProductReviews(prod._id, { limit: 20, status: 'APPROVED' }),
          productAPI.getAll({ category: prod.category?._id || prod.category, limit: 4 })
        ])
        
        const revData = revRes.data.data || revRes.data
        const relData = relRes.data.data || relRes.data
        setReviews(revData.reviews || [])
        setRelatedProducts((relData.products || relData || []).filter(p => p._id !== prod._id))

        if (prod.variants?.length > 0) {
          setSelectedVariant(prod.variants[0])
          setSelectedSize(prod.variants[0].size || '')
          setSelectedColor(prod.variants[0].color || '')
        }
      } catch (error) {
        toast.error('Không thể tải sản phẩm')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  const handleVariantSelect = (size, color) => {
    const variant = product.variants?.find(
      (v) => (size ? v.size === size : true) && (color ? v.color === color : true)
    )
    if (variant) {
      setSelectedVariant(variant)
      if (size) setSelectedSize(size)
      if (color) setSelectedColor(color)
    }
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Vui lòng chọn kích cỡ và màu sắc')
      return
    }
    if (selectedVariant.stock === 0) {
      toast.error('Sản phẩm này đã hết hàng')
      return
    }
    setAddingCart(true)
    await addToCart(product._id, selectedVariant._id, quantity, product)
    setAddingCart(false)
  }

  const onReviewSubmit = async (data) => {
    setSubmitReview(true)
    try {
      await reviewAPI.create({
        productId: product._id,
        rating: parseInt(data.rating),
        comment: data.comment
      })
      toast.success('Đánh giá đã được gửi, chờ kiểm duyệt')
      reset()
      const revRes = await reviewAPI.getProductReviews(product._id, { limit: 20, status: 'APPROVED' })
      const revData = revRes.data.data || revRes.data
      setReviews(revData.reviews || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá')
    } finally {
      setSubmitReview(false)
    }
  }

  if (loading) return <LoadingSpinner fullScreen text="Đang mở hộp quà..." />
  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center container-custom">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <ShoppingCart className="w-8 h-8 text-slate-300" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Không tìm thấy sản phẩm</h2>
      <p className="text-slate-500 mb-8">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
      <Link to="/products" className="btn-primary px-8 py-3">Quay lại cửa hàng</Link>
    </div>
  )

  const displayPrice = product.salePrice || product.price
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0

  const uniqueSizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean))]
  const uniqueColors = [...new Set(product.variants?.map(v => v.color).filter(Boolean))]

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb - Clean & Minimal */}
      <div className="border-b border-slate-50">
        <nav className="container-custom py-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link to="/products" className="hover:text-primary-600 transition-colors">Collections</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-900 truncate max-w-[150px]">{product.name}</span>
        </nav>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Left Column: Image Gallery (6/12) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="sticky top-24">
              <ProductImageGallery images={product.images || []} />
              
              {/* Desktop Quick Trust Grid */}
              <div className="hidden lg:grid grid-cols-2 gap-4 mt-8">
                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary-600 shadow-sm transition-transform group-hover:scale-110">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">Giao hàng miễn phí</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Cho đơn hàng trên 500.000đ</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:scale-110">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">Đổi trả 30 ngày</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Hoàn tiền 100% nếu lỗi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Detail (5/12) */}
          <div className="lg:col-span-5">
            <div className="space-y-8 animate-fade-in">
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  {product.category && (
                    <Link
                      to={`/products?category=${product.category._id || product.category}`}
                      className="inline-block text-[10px] font-black tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full uppercase hover:bg-primary-100 transition-colors"
                    >
                      {product.category.name || product.category}
                    </Link>
                  )}
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all active:scale-90 shadow-sm">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 hover:border-primary-100 transition-all active:scale-90 shadow-sm">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-display font-black text-slate-900 tracking-tighter leading-tight uppercase italic">
                  {product.name}
                </h1>

                <div className="flex items-center gap-6">
                  {product.averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                           <Star key={s} className={`w-3.5 h-3.5 ${s <= product.averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-black text-slate-900">{product.averageRating}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">({reviews.length} đánh giá)</span>
                    </div>
                  )}
                  {product.brand && (
                    <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                      <Award className="w-4 h-4 text-primary-600" />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{product.brand}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-2">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-display font-black text-primary-600 tracking-tighter price-bold">
                    {formatCurrency(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <div className="flex flex-col mb-1">
                      <span className="text-sm font-bold text-slate-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Tiết kiệm {Math.round((product.price - product.salePrice) / 1000)}k</span>
                    </div>
                  )}
                </div>
                {hasDiscount && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg animate-pulse">SIÊU ƯU ĐÃI -{discountPercent}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-fade-in">Ưu đãi có hạn từ Men's Fashion</span>
                  </div>
                )}
              </div>

              {/* Details List */}
              <ul className="grid grid-cols-2 gap-y-4 gap-x-8 text-xs font-bold uppercase tracking-widest pt-4">
                <li className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Trạng thái</span>
                  <span className={`${selectedVariant?.stock > 0 ? 'text-green-600' : 'text-red-500 text-secondary-600'}`}>
                    {selectedVariant?.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Chất liệu</span>
                  <span className="text-slate-900">{product.material || 'Premium Fabric'}</span>
                </li>
                <li className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Mã SP</span>
                  <span className="text-slate-900">#MF{product._id?.substring(18).toUpperCase()}</span>
                </li>
                <li className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Giao hàng</span>
                  <span className="text-slate-900">2-3 ngày</span>
                </li>
              </ul>

              {/* Selectors */}
              <div className="space-y-6 pt-6">
                {/* Size Selector */}
                {uniqueSizes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Chọn Kích Cỡ</h3>
                      <button className="text-[10px] font-bold text-primary-600 underline uppercase tracking-widest">Bảng tư vấn size</button>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {uniqueSizes.map((size) => {
                        const variantsWithSize = product.variants?.filter(v => v.size === size)
                        const hasStock = variantsWithSize?.some(v => v.stock > 0)
                        const active = selectedSize === size
                        return (
                          <button
                            key={size}
                            onClick={() => hasStock && handleVariantSelect(size, selectedColor)}
                            disabled={!hasStock}
                            className={`min-w-[50px] h-12 flex items-center justify-center rounded-xl font-black text-xs transition-all duration-300 border-2 ${
                              active
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20'
                                : hasStock
                                ? 'bg-white border-slate-100 text-slate-600 hover:border-primary-400 hover:text-primary-600'
                                : 'bg-slate-50 border-slate-50 text-slate-200 line-through cursor-not-allowed opacity-50'
                            }`}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {uniqueColors.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Chọn Màu Sắc</h3>
                    <div className="flex flex-wrap gap-3">
                      {uniqueColors.map((color) => {
                        const variant = product.variants?.find(
                          v => v.color === color && (selectedSize ? v.size === selectedSize : true)
                        )
                        const hasStock = variant?.stock > 0
                        const active = selectedColor === color
                        return (
                          <button
                            key={color}
                            onClick={() => hasStock && handleVariantSelect(selectedSize, color)}
                            disabled={!hasStock}
                            className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 border-2 ${
                              active
                                ? 'border-primary-600 bg-primary-50'
                                : hasStock
                                ? 'border-slate-50 bg-slate-50 hover:border-primary-200'
                                : 'opacity-40 cursor-not-allowed grayscale'
                            }`}
                          >
                            {variant?.colorCode && (
                              <span
                                className={`w-5 h-5 rounded-full border border-slate-200 shadow-sm transition-transform ${active ? 'scale-125' : 'group-hover:scale-110'}`}
                                style={{ backgroundColor: variant.colorCode }}
                              />
                            )}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-primary-700' : 'text-slate-600'}`}>{color}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity & Add to Cart */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4">
                  <div className="md:col-span-4 flex items-center justify-between px-4 py-2.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 hover:text-primary-600 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-lg text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariant?.stock || 99, quantity + 1))}
                      className="p-1 hover:text-primary-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={addingCart || !selectedVariant || selectedVariant?.stock === 0}
                    className="md:col-span-8 btn-primary !py-3 !rounded-lg flex items-center justify-center gap-3 shadow-sm hover:translate-y-0"
                  >
                    {addingCart ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        THÊM VÀO GIỎ HÀNG
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Secure Checkout Badge */}
              <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-slate-100 rounded-3xl">
                <div className="flex items-center gap-2 text-green-600">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Thanh toán bảo mật an toàn 100%</span>
                </div>
                <div className="flex gap-4 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/VNPAY_LOGO.png" alt="VNPay" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sections: Description & Reviews */}
        <div className="mt-32 grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-16">
            {/* Description - Premium Typography */}
            {product.description && (
              <section className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-display font-black text-slate-900 tracking-tighter uppercase italic">Câu Chuyện Sản Phẩm</h2>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div
                  className="prose prose-slate max-w-none text-slate-500 font-medium leading-loose text-lg"
                  dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }}
                />
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-6">
                    {product.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 px-4 py-2 rounded-full border border-slate-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Visual Specs / Features if any */}
            <div className="grid grid-cols-2 gap-8 pt-12">
               <div className="flex gap-6 p-7 rounded-3xl bg-slate-900 text-white shadow-sm transition-all hover:scale-[1.02] duration-300">
                  <div className="text-primary-500"><ShieldCheck className="w-8 h-8" /></div>
                  <div className="space-y-2">
                    <h5 className="font-black uppercase tracking-widest text-sm italic">Thiết Kế Độc Quyền</h5>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Mẫu thiết kế được đăng ký bản quyền bởi Men's Fashion Studio.</p>
                  </div>
               </div>
               <div className="flex gap-6 p-7 rounded-3xl bg-primary-600 text-white shadow-sm transition-all hover:scale-[1.02] duration-300">
                  <div className="text-white"><Award className="w-8 h-8" /></div>
                  <div className="space-y-2">
                    <h5 className="font-black uppercase tracking-widest text-sm italic">Premium Quality</h5>
                    <p className="text-slate-100/70 text-xs font-medium leading-relaxed">Sử dụng 100% sợi cotton cao cấp kháng khuẩn và thoáng khí.</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            {/* Reviews Section - Modern Card List */}
            <section className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-black text-slate-900 tracking-tighter uppercase italic">Đánh Giá</h2>
                <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black tracking-widest">{reviews.length}</div>
              </div>

              {product.averageRating > 0 && (
                <div className="p-7 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-around text-center">
                  <div className="space-y-1">
                    <p className="text-5xl font-display font-black text-slate-900 tracking-tighter">{product.averageRating.toFixed(1)}</p>
                    <div className="flex justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 text-yellow-500 fill-yellow-500" />)}
                    </div>
                  </div>
                  <div className="w-px h-16 bg-slate-200" />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-900 uppercase">Hài lòng 100%</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dựa trên {reviews.length} phản hồi</p>
                  </div>
                </div>
              )}

              {/* Review List */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white ring-4 ring-slate-100">
                            <span className="font-black text-xs">{review.user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{review.user?.name || 'Customer'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-100'}`} />)}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <Star className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic text-sm">Trở thành người đầu tiên chia sẻ cảm nhận về siêu phẩm này!</p>
                  </div>
                )}
              </div>

              {/* Add Review Form - Premium Look */}
              <div className="pt-8 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 italic outline-indigo-200 outline-none">Viết cảm nhận của bạn</h3>
                {isAuthenticated ? (
                  <form onSubmit={handleSubmit(onReviewSubmit)} className="bg-slate-50 p-7 rounded-3xl border border-slate-100 space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bạn đánh giá sản phẩm này ra sao?</label>
                      <div className="flex flex-wrap gap-2">
                        {[5, 4, 3, 2, 1].map(v => (
                          <label key={v} className="relative cursor-pointer group">
                             <input type="radio" value={v} {...register('rating', { required: true })} className="peer sr-only" />
                             <div className="px-4 py-2 border-2 border-white bg-white peer-checked:bg-primary-600 peer-checked:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                               {v} SAO
                             </div>
                          </label>
                        ))}
                      </div>
                      {errors.rating && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Vui lòng chọn mức độ hài lòng</p>}
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chia sẻ trải nghiệm của bạn</label>
                      <textarea
                        {...register('comment', { required: 'Bạn chưa nhập nhận xét' })}
                        rows={4}
                        placeholder="Chất vải, đường may, form dáng..."
                        className="w-full p-6 pb-2 bg-white rounded-2xl border border-white focus:outline-none focus:ring-4 focus:ring-primary-100 font-medium text-sm transition-all text-secondary-500"
                      />
                      {errors.comment && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.comment.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={submitReview}
                      className="w-full btn-primary !py-3 !rounded-lg !text-[11px] shadow-sm flex items-center justify-center gap-3"
                    >
                      {submitReview ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'GỬI ĐÁNH GIÁ NGAY'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 font-bold mb-6 italic text-sm">Gia nhập cộng đồng Men's Fashion để nâng tầm tiếng nói của bạn!</p>
                    <Link to="/login" className="btn-primary px-8 py-2.5 text-xs tracking-tight shadow-none">ĐĂNG NHẬP NGAY</Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Related Products - Horizontal Showcase */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-24 border-t border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 px-4">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2">
                  <span className="w-10 h-1 bg-primary-600 rounded-full"></span>
                  <span className="text-xs font-black text-primary-600 uppercase tracking-widest italic">Có thể bạn sẽ thích</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 tracking-tighter uppercase italic">Sản phẩm liên quan</h2>
              </div>
              <Link to="/products" className="text-sm font-black text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-[0.2em] mb-2 underline underline-offset-8">Khám phá toàn bộ</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 px-4">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage

