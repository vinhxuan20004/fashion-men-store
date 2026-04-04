import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Mail, TrendingUp, Zap, Award, Instagram, Search } from 'lucide-react'
import { productAPI, categoryAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const HomePage = () => {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [email, setEmail] = useState('')
  const [currentHeaderSlide, setCurrentHeaderSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1600&q=80',
      title: 'Bộ sưu tập sơ mi cao cấp',
      subtitle: 'Nâng tầm phong cách quý ông 2024'
    },
    {
      image: 'https://images.unsplash.com/photo-1516826435551-36a8a09e4575?w=1600&q=80',
      title: 'Phụ kiện và giày da thật',
      subtitle: 'Chi tiết tạo nên sự khác biệt'
    },
    {
      image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&q=80',
      title: 'Phong cách minimalist',
      subtitle: 'Đơn giản là đỉnh cao của tinh tế'
    }
  ]

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentHeaderSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(slideTimer)
  }, [heroSlides.length])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productAPI.getAll({ sort: 'createdAt_desc', limit: 12 }),
          categoryAPI.getAll()
        ])
        setFeaturedProducts(prodRes.data.data.products || [])
        setCategories(catRes.data.data.categories || [])
      } catch (error) {
        console.error('Failed to fetch home data:', error)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchData()
  }, [])

  const handleHeaderSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (email) {
      toast.success('Đăng ký nhận tin thành công! Chào mừng bạn đến với Men\'s Fashion.')
      setEmail('')
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Slider */}
      <section className="relative h-[450px] lg:h-[600px] overflow-hidden group">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentHeaderSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-slate-900/40 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover scale-105 transition-transform duration-[10s] ease-linear"
              style={{ transform: index === currentHeaderSlide ? 'scale(1.1)' : 'scale(1)' }}
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
              <span className="text-[10px] text-white tracking-wide mb-4 animate-slide-up opacity-0 delay-100" style={{ animation: 'slideUp 0.8s forwards 0.2s' }}>
                {slide.subtitle}
              </span>
              <h1 className="text-4xl lg:text-6xl font-display text-white tracking-tight mb-8 max-w-4xl animate-slide-up opacity-0 delay-300" style={{ animation: 'slideUp 0.8s forwards 0.4s' }}>
                {slide.title}
              </h1>
              <Link
                to="/products"
                className="px-10 py-3.5 bg-white text-slate-900 text-[11px] font-bold tracking-tight rounded-lg hover:bg-primary-600 hover:text-white transition-all delay-500 opacity-0"
                style={{ animation: 'slideUp 0.8s forwards 0.6s' }}
              >
                Khám phá ngay →
              </Link>
            </div>
          </div>
        ))}
        {/* Slider Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentHeaderSlide(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentHeaderSlide ? 'w-12 bg-white' : 'w-4 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Centered Search Bar */}
      <section className="py-12 bg-white -mt-8 relative z-40">
        <div className="container-custom">
          <form onSubmit={handleHeaderSearch} className="max-w-2xl mx-auto group">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Khám phá phong cách của bạn..."
                className="w-full pl-14 pr-8 py-5 bg-white border-2 border-slate-100 rounded-full text-sm text-slate-900 shadow-2xl shadow-slate-200/50 transition-all focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-8 py-2.5 rounded-lg text-[10px] font-bold tracking-tight hover:bg-primary-600 transition-all active:scale-95 shadow-sm"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Category Grid - Horizontal Cards */}
      <section className="py-10 bg-white">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-8 px-2">
            <div className="space-y-1">
              <h2 className="text-xl font-display text-slate-900 tracking-tight">
                Danh mục nổi bật
              </h2>
              <p className="text-[10px] text-slate-400">
                Sản phẩm được yêu thích nhất
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.slice(0, 4).map((cat, i) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="group relative h-48 rounded-3xl overflow-hidden bg-slate-100 hover:shadow-2xl transition-all"
              >
                <img
                  src={i % 2 === 0 ? 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' : 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={cat.name}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent z-10 transition-opacity group-hover:opacity-90" />
                <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center px-10 text-white space-y-2">
                  <span className="text-[10px] tracking-wide opacity-70 title-case">Khám phá ngay</span>
                  <h3 className="text-2xl font-display tracking-tight title-case">{cat.name?.toLowerCase()}</h3>
                  <div className="w-10 h-1 bg-primary-500 rounded-full transition-all group-hover:w-20" />
                </div>
                <ArrowRight className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-white opacity-0 -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0 z-20" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - High Density Grid */}
      <main className="py-20 bg-white">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10 px-2">
            <div className="space-y-1">
              <h2 className="text-xl font-display text-slate-900 tracking-tight">
                Sản phẩm nổi bật
              </h2>
              <p className="text-[10px] text-slate-400">
                Cập nhật mỗi ngày • Miễn phí vận chuyển đơn từ 500k
              </p>
            </div>
            <Link to="/products" className="text-[10px] text-primary-600 hover:underline decoration-2 underline-offset-4">
              Xem tất cả →
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[3/4] bg-slate-50 rounded-xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
              {featuredProducts.slice(0, 12).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang cập nhật sản phẩm mới...</p>
            </div>
          )}
        </div>
      </main>

      {/* Trust Badges - Simplified */}
      <section className="py-12 border-t border-slate-50 bg-slate-50/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Giao nhanh', desc: 'Đơn từ 500k' },
              { icon: Award, title: 'Bảo hành', desc: '12 tháng' },
              { icon: RefreshCw, title: 'Đổi trả', desc: '30 ngày' },
              { icon: Headphones, title: 'Hỗ trợ', desc: '24/7' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-4 md:justify-start justify-center">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-xl shadow-slate-200">
                  <badge.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-slate-900 text-sm leading-none mb-1 force-bold">
                    {badge.title}
                  </h4>
                  <p className="text-[13px] text-slate-400 leading-none force-bold">
                    {badge.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-white border-y border-slate-50">
        <div className="container-custom">
          <div className="max-w-xl mx-auto text-center space-y-8">
            <div className="space-y-2">
              <h3 className="text-sm text-slate-900">
                Gia nhập cộng đồng quý ông.
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Nhận ưu đãi 10% cho đơn hàng đầu tiên <br/>& cập nhật xu hướng mới nhất.
              </p>
            </div>
            
            <form onSubmit={handleNewsletter} className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-full focus-within:ring-4 focus-within:ring-primary-50 focus-within:border-primary-200 transition-all">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address..."
                required
                className="flex-1 bg-transparent px-6 py-3.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-slate-900 text-white px-10 py-3 rounded-lg text-[10px] font-bold tracking-tight hover:bg-primary-600 transition-all active:scale-95 shadow-sm"
              >
                Đăng ký →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Social Feed */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10 px-2">
            <div className="space-y-1">
              <h3 className="text-sm text-slate-900">
                Phong cách cùng chúng tôi
              </h3>
              <p className="text-[11px] text-slate-400">
                Tag #MENSFASHION để có cơ hội được featured.
              </p>
            </div>
            <a href="#" className="flex items-center gap-2 text-[11px] text-slate-900 hover:text-primary-600 transition-colors">
              Instagram @mensfashion <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              'https://images.unsplash.com/photo-1516826435551-36a8a09e4575?w=500&q=80',
              'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=500&q=80',
              'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&q=80',
              'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=500&q=80',
              'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=500&q=80',
            ].map((img, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-3xl bg-slate-100 border border-slate-50 transition-all hover:shadow-2xl hover:-translate-y-2">
                <img src={img} alt="Social Feed" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

