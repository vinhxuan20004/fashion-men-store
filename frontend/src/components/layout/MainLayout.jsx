import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  LayoutDashboard,
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { categoryAPI } from '../../services/api'

const MainLayout = ({ children }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [catMenuOpen, setCatMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [scrolled, setScrolled] = useState(false)

  const userMenuRef = useRef(null)
  const catMenuRef = useRef(null)

  useEffect(() => {
    categoryAPI.getAll().then((res) => {
      setCategories(res.data.data.categories || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
      if (catMenuRef.current && !catMenuRef.current.contains(e.target)) {
        setCatMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  const navLinkClass = (path) =>
    `relative text-sm font-semibold transition-all duration-300 hover:text-primary-600 ${
      location.pathname === path ? 'text-primary-600' : 'text-slate-600'
    }`

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass py-2 shadow-lg shadow-slate-200/20' : 'bg-white py-4'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center h-14 gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <span className="text-2xl font-display font-bold tracking-[0.05em] text-slate-900 uppercase">
                MEN'S <span className="text-primary-600 group-hover:text-primary-700 transition-colors">FASHION</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8 ml-10">
              <Link to="/" className={navLinkClass('/')}>
                Trang chủ
                {location.pathname === '/' && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-600 rounded-full animate-fade-in" />}
              </Link>
              <Link to="/products" className={navLinkClass('/products')}>
                Sản phẩm
                {location.pathname === '/products' && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-600 rounded-full animate-fade-in" />}
              </Link>

              {/* Categories Dropdown */}
              <div ref={catMenuRef} className="relative">
                <button
                  onClick={() => setCatMenuOpen(!catMenuOpen)}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors group"
                >
                  Danh mục
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${catMenuOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
                </button>
                {catMenuOpen && (
                  <div className="absolute top-full left-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-slide-up">
                    <div className="px-4 py-2 mb-2 border-b border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bộ sưu tập</span>
                    </div>
                    {Array.isArray(categories) && categories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/products?category=${cat._id}`}
                        onClick={() => setCatMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-600 hover:bg-primary-50 hover:text-primary-700 transition-all rounded-lg mx-2"
                      >
                        {cat.name}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </Link>
                    ))}
                    {(!Array.isArray(categories) || categories.length === 0) && (
                      <p className="px-4 py-2 text-sm text-slate-400 italic">Không có danh mục</p>
                    )}
                  </div>
                )}
              </div>
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm ml-auto mr-4 group">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm phong cách của bạn..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white group-hover:bg-slate-100"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              </div>
            </form>

            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-3 border border-slate-200 rounded-full hover:border-primary-300 transition-all duration-300 bg-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                      <span className="font-bold text-xs">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <ChevronDown className={`hidden md:block w-4 h-4 text-slate-400 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-slide-up">
                      <div className="px-5 py-4 border-b border-slate-50 mb-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-all rounded-lg mx-2"
                      >
                        <User className="w-4 h-4 opacity-70" />
                        Hồ sơ của tôi
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-all rounded-lg mx-2"
                      >
                        <Package className="w-4 h-4 opacity-70" />
                        Đơn hàng
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-all rounded-lg mx-2"
                      >
                        <Settings className="w-4 h-4 opacity-70" />
                        Cài đặt
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-primary-600 hover:bg-primary-50 transition-all rounded-lg mx-2"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Quản trị viên
                        </Link>
                      )}
                      <div className="border-t border-slate-50 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all rounded-lg mx-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-4 ml-2">
                  <Link
                    to="/login"
                    className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary py-2 px-5 text-sm"
                  >
                    Tham gia ngay
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-primary-600 transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

      </header>
      
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-0 bg-white z-[100] animate-fade-in overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
            <span className="text-xl font-display font-bold tracking-[0.05em] text-slate-900 uppercase">
              MEN'S <span className="text-primary-600">FASHION</span>
            </span>
            <button 
              onClick={() => setMobileOpen(false)}
              className="p-2 text-slate-600 hover:text-primary-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-100"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </form>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Điều hướng</h3>
                <nav className="flex flex-col gap-4">
                  <Link to="/" className="text-xl font-bold text-slate-900">Trang chủ</Link>
                  <Link to="/products" className="text-xl font-bold text-slate-900">Tất cả sản phẩm</Link>
                </nav>
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Danh mục</h3>
                <nav className="flex flex-col gap-3">
                  {Array.isArray(categories) && categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/products?category=${cat._id}`}
                      className="text-base font-medium text-slate-600 hover:text-primary-600"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {!isAuthenticated ? (
                <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
                  <Link to="/login" className="w-full text-center py-4 border border-slate-200 rounded-2xl font-bold text-slate-700">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="w-full text-center py-4 bg-primary-600 text-white rounded-2xl font-bold">
                    Tạo tài khoản
                  </Link>
                </div>
              ) : (
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <Link to="/profile" className="flex items-center gap-3 text-lg font-bold text-slate-700">
                    <User className="w-5 h-5 text-primary-600" />
                    Hồ sơ của tôi
                  </Link>
                  <Link to="/orders" className="flex items-center gap-3 text-lg font-bold text-slate-700">
                    <Package className="w-5 h-5 text-primary-600" />
                    Đơn hàng
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 text-lg font-bold text-slate-700">
                    <Settings className="w-5 h-5 text-primary-600" />
                    Cài đặt
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-3 text-lg font-bold text-primary-600">
                      <LayoutDashboard className="w-5 h-5" />
                      Quản trị viên
                    </Link>
                  )}
                  <div className="pt-2 border-t border-slate-50 mt-4">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-lg font-bold text-red-500"
                    >
                      <LogOut className="w-5 h-5" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-dark text-slate-300 mt-20 pt-20 pb-10">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div className="space-y-6">
              <Link to="/" className="inline-block">
                <span className="text-2xl font-display font-bold tracking-[0.05em] text-white uppercase">
                  MEN'S <span className="text-primary-500">FASHION</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
                Nâng tầm phong cách quý ông hiện đại với những thiết kế đẳng cấp, 
                chất liệu cao cấp và dịch vụ tận tâm. Khám phá bản sắc riêng của bạn cùng chúng tôi.
              </p>
              <div className="flex gap-4">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-300">
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                Khám phá
              </h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/" className="hover:text-primary-400 hover:translate-x-1 transition-all inline-block">Trang chủ</Link></li>
                <li><Link to="/products" className="hover:text-primary-400 hover:translate-x-1 transition-all inline-block">Bộ sưu tập mới</Link></li>
                <li><Link to="/products?featured=true" className="hover:text-primary-400 hover:translate-x-1 transition-all inline-block">Sản phẩm nổi bật</Link></li>
                <li><Link to="/cart" className="hover:text-primary-400 hover:translate-x-1 transition-all inline-block">Giỏ hàng</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></span>
                Chăm sóc khách hàng
              </h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-primary-400 hover:translate-x-1 transition-all inline-block">Chính sách đổi trả</a></li>
                <li><a href="#" className="hover:text-primary-400 hover:translate-x-1 transition-all inline-block">Chính sách vận chuyển</a></li>
                <li><a href="#" className="hover:text-primary-400 hover:translate-x-1 transition-all inline-block">Bảo mật thông tin</a></li>
                <li><a href="#" className="hover:text-primary-400 hover:translate-x-1 transition-all inline-block">Hướng dẫn chọn size</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Liên hệ với chúng tôi
              </h4>
              <ul className="space-y-5 text-sm">
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-shrink-0 items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-400" />
                  </div>
                  <span className="text-slate-400">123 Đường Thời Trang, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-shrink-0 items-center justify-center">
                    <Phone className="w-5 h-5 text-primary-400" />
                  </div>
                  <a href="tel:+84901234567" className="text-slate-400 hover:text-white transition-colors">0901 234 567 <br/><span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">(Hotline 24/7)</span></a>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-shrink-0 items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-400" />
                  </div>
                  <a href="mailto:info@mensfashion.vn" className="text-slate-400 hover:text-white transition-colors">info@mensfashion.vn</a>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-shrink-0 items-center justify-center">
                    <Clock className="w-5 h-5 text-primary-400" />
                  </div>
                  <span className="text-slate-400">08:00 - 21:00 <br/><span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Thứ 2 - Chủ nhật</span></span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500 font-medium italic">
              Designed with ❤️ by Men's Fashion Team
            </p>
            <p className="text-xs text-slate-500">
              © 2024 Men's Fashion Store. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/VNPAY_LOGO.png" alt="VNPay" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
              <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout

