import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  Ticket,
  Star,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', label: 'Sản phẩm', icon: Package },
  { path: '/admin/categories', label: 'Danh mục', icon: Tag },
  { path: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { path: '/admin/users', label: 'Người dùng', icon: Users },
  { path: '/admin/vouchers', label: 'Voucher', icon: Ticket },
  { path: '/admin/reviews', label: 'Đánh giá', icon: Star }
]

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-800">
        <Link to="/" className="block">
          <span className="text-lg font-bold text-white tracking-tight">
            MEN'S <span className="text-primary-500">FASHION</span>
          </span>
        </Link>
        <p className="text-xs text-gray-400 mt-1">Bảng quản trị</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-900/30 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Desktop Sidebar - Fixed but allowed to be natural */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 h-screen fixed top-0 left-0 z-40 border-r border-white/5">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-72 bg-gray-900 z-10 animate-slide-right shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 bg-white/5 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area Wrapper - Natural Scroll */}
      <div className="flex flex-col lg:pl-64 min-h-screen">
        {/* Top Header - Fixed for accessibility */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 bg-white/80 backdrop-blur-md border-b border-gray-200 h-14 flex items-center gap-4 px-4 lg:px-6 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest hidden md:block">
              {navItems.find(item => isActive(item))?.label || 'Quản lý'}
            </h1>

            <div className="flex items-center gap-2 sm:gap-4">
              <button className="relative p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              
              <div className="h-6 w-px bg-gray-100 mx-1 hidden sm:block" />
              
              <Link
                to="/"
                className="text-[10px] font-black text-slate-400 hover:text-primary-600 transition-colors hidden sm:block uppercase tracking-widest"
              >
                Xem shop
              </Link>

              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                 <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center text-[10px] font-black text-white uppercase shadow-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="hidden lg:block">
                   <p className="text-[10px] font-black text-gray-900 uppercase leading-none">{user?.name}</p>
                   <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Natural Content Area */}
        <main className="flex-1 pt-20 p-4 lg:p-10 bg-slate-50/30">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
