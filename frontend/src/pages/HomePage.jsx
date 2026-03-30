import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Mail, TrendingUp, Zap, Award } from 'lucide-react'
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productAPI.getFeatured(),
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

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (email) {
      toast.success('Đăng ký nhận tin thành công! Chào mừng bạn đến với Men\'s Fashion.')
      setEmail('')
    }
  }

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section - Editorial Style */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-slate-50 -skew-x-12 translate-x-1/4 -z-10" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-60 -z-10 animate-pulse" />
        
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in flex flex-col items-center md:items-start text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 animate-slide-up mb-2 mx-auto md:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-700">Bộ Sưu Tập Xuân Hè 2024</span>
              </div>
              
              <h1 className="font-display uppercase py-20 flex flex-col gap-12">
                <span className="block text-4xl md:text-5xl font-light text-slate-400 tracking-[0.4em] animate-slide-up !leading-normal">
                  ĐỊNH NGHĨA
                </span>
                <span className="block text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 tracking-normal !leading-normal">
                  BẢN SẮC
                </span>
                <span className="block text-6xl md:text-8xl font-bold text-slate-900 tracking-normal !leading-normal">
                  QUÝ ÔNG.
                </span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
                Khám phá thế giới thời trang nam cao cấp, nơi sự lịch lãm giao thoa cùng phong cách hiện đại. Từng chi tiết được chế tác để tôn vinh sự tự tin của bạn.
              </p>
              
              <div className="flex flex-wrap gap-5 pt-4">
                <Link
                  to="/products"
                  className="group relative inline-flex items-center justify-center px-8 py-5 font-black text-white bg-slate-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:bg-primary-600 hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    MUA SẮM NGAY
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  to="/products?featured=true"
                  className="inline-flex items-center justify-center px-8 py-5 font-black text-slate-900 bg-white border-2 border-slate-100 rounded-2xl shadow-xl shadow-slate-200/20 transition-all duration-300 hover:border-primary-600 hover:text-primary-600 hover:-translate-y-1"
                >
                  XEM NỔI BẬT
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-8 border-t border-slate-100">
                <div>
                  <p className="text-3xl font-black text-slate-900">50k+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Khách hàng</p>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <div>
                  <p className="text-3xl font-black text-slate-900">120+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thương hiệu</p>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <div>
                  <p className="text-3xl font-black text-slate-900">4.9/5</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đánh giá</p>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in delay-200">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=90" 
                  alt="Men Fashion Hero" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
                
                {/* Floating Card */}
                <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-2xl animate-slide-up group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Sản phẩm bán chạy</span>
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden ring-2 ring-primary-500/10">
                          <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-bold text-slate-900 mb-1 leading-tight uppercase">"Phong cách không chỉ là quần áo, nó là thái độ."</h3>
                </div>
              </div>
              
              {/* Secondary Image Blob */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-3xl overflow-hidden border-8 border-white shadow-2xl animate-float hidden lg:block">
                <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80" alt="Detail" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y border-slate-50 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Miễn phí giao hàng', desc: 'Đơn hàng từ 500k' },
              { icon: Shield, title: 'Bảo hành 12 tháng', desc: 'Sản phẩm chính hãng' },
              { icon: RefreshCw, title: 'Đổi trả 30 ngày', desc: 'Thủ tục nhanh chóng' },
              { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Tận tâm, chuyên nghiệp' },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center md:flex-row md:items-start gap-4 text-center md:text-left group">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <badge.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-sm mb-1 uppercase tracking-tight">{badge.title}</h4>
                  <p className="text-xs text-slate-400 font-medium">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories - Staggered Editorial Grid */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-0" />
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-20">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2">
                <span className="w-10 h-1 bg-primary-600 rounded-full"></span>
                <span className="text-xs font-display font-bold text-primary-600 uppercase tracking-widest">Tuyển Tập Phong Cách</span>
              </div>
              <h2 className="font-display uppercase flex flex-col gap-8">
                <span className="block text-2xl md:text-3xl font-light text-primary-600 tracking-[0.4em] !leading-normal">
                  KHÁM PHÁ
                </span>
                <span className="block text-5xl md:text-7xl font-bold text-slate-900 tracking-normal !leading-normal">
                  BẢN SẮC RIÊNG
                </span>
              </h2>
            </div>
            <p className="text-slate-500 font-medium max-w-sm border-l-2 border-primary-600 pl-6 py-2">
              Sự kết hợp hoàn hảo giữa kỹ nghệ may mặc thủ công và tầm nhìn thời trang đương đại.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[800px]">
            {categories.slice(0, 4).map((cat, i) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className={`group relative overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-700 bg-white ${
                  i === 0 ? 'md:col-span-7 md:row-span-1' : 
                  i === 1 ? 'md:col-span-5 md:row-span-2' :
                  i === 2 ? 'md:col-span-4 md:row-span-1' :
                  'md:col-span-3 md:row-span-1'
                }`}
              >
                <div className="h-full w-full relative overflow-hidden">
                  <img 
                    src={cat.image || `https://images.unsplash.com/photo-${1580000000000 + (i*1000)}?w=1000&q=80`} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-40 group-hover:opacity-70 transition-opacity" />
                  
                  <div className="absolute bottom-0 left-0 p-10 w-full translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3">{cat.productCount || 12} SIÊU PHẨM</p>
                    <h3 className="text-4xl font-display font-black text-white uppercase italic leading-tight">{cat.name}</h3>
                    <div className="mt-6 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">KHÁM PHÁ NGAY</span>
                      <ArrowRight className="w-5 h-5 text-primary-500" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals - Dynamic Showcase */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Animated Background Text */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[20vw] font-black text-slate-50 uppercase tracking-tighter select-none whitespace-nowrap pointer-events-none -z-10 animate-pulse">
          NEW ARRIVALS 2024
        </div>
        
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-20 text-center md:text-left">
            <div>
              <h2 className="text-5xl md:text-7xl font-display font-bold text-slate-900 leading-tight uppercase italic">Sản phẩm mới nhất</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em] mt-2 italic">Cập nhật mỗi tuần · Số lượng có hạn</p>
            </div>
            <Link to="/products?sort=createdAt_desc" className="group flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all active:scale-95 shadow-2xl shadow-slate-900/20">
              XEM TOÀN BỘ TUYỂN TẬP
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {featuredProducts.slice(4, 8).map((product, idx) => (
              <div key={product._id} className="animate-fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Horizontal Scroll / Grid */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2">
                <span className="w-10 h-1 bg-primary-600 rounded-full"></span>
                <span className="text-xs font-black text-primary-600 uppercase tracking-widest text-indigo-600">Sản phẩm tiêu biểu</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-display font-bold text-slate-900 leading-tight uppercase italic">Bộ Sưu Tập Nổi Bật</h2>
            </div>
            <Link
              to="/products"
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-slate-100 font-bold text-slate-600 hover:border-primary-600 hover:text-primary-600 transition-all active:scale-95"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-slate-50 rounded-2xl animate-pulse" />)}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">Đang cập nhật sản phẩm mới...</p>
            </div>
          )}
        </div>
      </section>

      {/* Promotion Split Banners */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group relative h-[450px] rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=1000&q=80" alt="Shirt collection" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-transparent to-transparent opacity-80" />
              <div className="relative h-full flex flex-col justify-end p-12">
                <span className="inline-block px-3 py-1 rounded-full bg-primary-600 text-[10px] font-black text-white uppercase tracking-widest mb-6 w-fit">Giảm giá 40%</span>
                <h3 className="text-5xl font-display font-bold text-white mb-6 leading-tight italic uppercase">Sơ Mi <br />Công Sở</h3>
                <Link to="/products?category=shirt" className="group/btn flex items-center gap-3 text-white font-bold hover:text-primary-400 transition-colors w-fit">
                  Khám phá ngay <span className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-slate-900 transition-all"><ArrowRight className="w-4 h-4" /></span>
                </Link>
              </div>
            </div>
            
            <div className="group relative h-[450px] rounded-[3rem] overflow-hidden bg-primary-900 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000&q=80" alt="Denim collection" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-transparent to-transparent opacity-80" />
              <div className="relative h-full flex flex-col justify-end p-12">
                <span className="inline-block px-3 py-1 rounded-full bg-secondary-500 text-[10px] font-black text-white uppercase tracking-widest mb-6 w-fit">Premium Quality</span>
                <h3 className="text-5xl font-display font-bold text-white mb-6 leading-tight italic uppercase">Denim <br />Cổ Điển</h3>
                <Link to="/products?category=denim" className="group/btn flex items-center gap-3 text-white font-bold hover:text-primary-400 transition-colors w-fit">
                  Xem bộ sưu tập <span className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-slate-900 transition-all"><ArrowRight className="w-4 h-4" /></span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Premium Features */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-24 space-y-4">
            <span className="text-xs font-black text-primary-500 uppercase tracking-[0.3em]">Tại sao chọn chúng tôi?</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight uppercase italic">Cam Kết Chất Lượng Đỉnh Cao</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                icon: Award,
                title: 'Vật Liệu Thượng Hạng',
                desc: 'Chúng tôi chỉ sử dụng những loại vải cao cấp nhất, bền bỉ và thoải mái tối đa cho quý ông.'
              },
              {
                icon: TrendingUp,
                title: 'Thiết Kế Đột Phá',
                desc: 'Luôn cập nhật xu hướng thời trang quốc tế, kết hợp nét cổ điển cùng phong cách đương đại.'
              },
              {
                icon: Zap,
                title: 'Dịch Vụ Tận Tâm',
                desc: 'Giao hàng siêu tốc, hỗ trợ đổi trả linh hoạt và chăm sóc khách hàng 24/7 chuyên nghiệp.'
              }
            ].map((item, i) => (
              <div key={i} className="relative group text-center space-y-6">
                <div className="mx-auto w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                  <item.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter - Glassmorphism */}
      <section className="py-32 bg-white relative">
        <div className="container-custom">
          <div className="relative rounded-[4rem] overflow-hidden py-24 px-8 bg-slate-900">
             <img src="https://images.unsplash.com/photo-1550995694-3f5f4a7b1bd2?w=1600&q=80" alt="newsletter bg" className="absolute inset-0 w-full h-full object-cover opacity-20" />
             <div className="relative max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
               <div className="bg-primary-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-10 border border-primary-500/20">
                 <Mail className="w-8 h-8 text-primary-500" />
               </div>
               <h2 className="font-display leading-tight uppercase">
                 <span className="block text-2xl md:text-3xl font-light text-primary-500 tracking-[0.3em] mb-4">
                   Gia Nhập Cộng Đồng
                 </span>
                 <span className="block text-4xl md:text-6xl font-bold text-white tracking-tight">
                   QUÝ ÔNG HIỆN ĐẠI
                 </span>
               </h2>
               <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
                 Nhận ưu đãi 10% cho đơn hàng đầu tiên và cập nhật sớm nhất các bộ sưu tập giới hạn mỗi mùa.
               </p>
               
               <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto pt-6">
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="Email của bạn..."
                   required
                   className="flex-1 px-8 py-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:bg-white/20 transition-all text-sm font-bold"
                 />
                 <button
                   type="submit"
                   className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary-600/40 active:scale-95 transition-all"
                 >
                   ĐĂNG KÝ NGAY
                 </button>
               </form>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] italic">Chúng tôi cam kết bảo mật 100% dữ liệu của bạn.</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

