import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  ArrowUpRight,
  Calendar,
  Layers,
  Activity,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import { adminAPI } from '../../services/api'
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const PIE_COLORS = ['#fbbf24', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#64748b']

const StatCard = ({ title, value, icon: Icon, trend, color, prefix = '', delay = 0 }) => (
  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 animate-fade-in group" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center justify-between mb-8">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${color} shadow-lg group-hover:scale-110`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">{prefix}{value}</p>
    </div>
  </div>
)

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [orderStats, setOrderStats] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [dashRes, revRes, statsRes, topRes, recentRes] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getRevenue({ period: 'daily', days: 30 }),
          adminAPI.getOrderStats(),
          adminAPI.getTopProducts(),
          adminAPI.getRecentOrders()
        ])

        const statsData = dashRes.data.data || {}
        setDashboard(statsData)
        
        const revDataRaw = revRes.data.data?.revenue || []
        setRevenueData(revDataRaw.map(d => ({
          name: d.date || `${d._id?.day}/${d._id?.month}` || 'N/A',
          revenue: d.revenue || d.total || 0,
          orders: d.orderCount || d.count || 0
        })))

        const dist = statsRes.data.data?.distribution || []
        setOrderStats(dist.map(s => ({
          name: getOrderStatusLabel(s.status || s._id),
          value: s.count || 0
        })))

        setTopProducts(topRes.data.data?.products || [])
        setRecentOrders(recentRes.data.data?.orders || [])
      } catch (error) {
        console.error('Dashboard load error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )

  const stats = dashboard || {}

  const formatRevenueTick = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">{label}</p>
          <p className="text-lg font-black text-primary-400 mb-1">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
            {payload[1] ? `${payload[1].value} Đơn hàng` : ''}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary-600"></span>
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.3em]">Hệ thống quản trị</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 uppercase">Bảng điều khiển</h1>
          <p className="text-slate-400 font-semibold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-600" />
            Dữ liệu được cập nhật theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
           <Calendar className="w-5 h-5 text-slate-400" />
           <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">
             {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          title="Doanh thu trọn đời"
          value={formatCurrency(stats.totalRevenue || 0)}
          icon={DollarSign}
          trend={stats.revenueGrowth}
          color="bg-slate-900"
          delay={0}
        />
        <StatCard
          title="Tháng này"
          value={formatCurrency(stats.monthlyRevenue || 0)}
          icon={TrendingUp}
          color="bg-primary-600"
          delay={100}
        />
        <StatCard
          title="Tổng đơn hàng"
          value={(stats.totalOrders || 0).toLocaleString()}
          icon={ShoppingBag}
          trend={stats.ordersGrowth}
          color="bg-emerald-500"
          delay={200}
        />
        <StatCard
          title="Người dùng"
          value={(stats.totalUsers || 0).toLocaleString()}
          icon={Users}
          trend={stats.usersGrowth}
          color="bg-indigo-500"
          delay={300}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-2xl shadow-slate-100/50 animate-fade-in delay-400 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 blur-[100px] rounded-full -mr-20 -mt-20" />
           
           <div className="relative z-10 flex items-center justify-between mb-12">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  Biểu đồ doanh thu 30 ngày
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Phân tích xu hướng kinh doanh gần đây</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                 <ArrowUpRight className="w-5 h-5 text-slate-400" />
              </div>
           </div>

          {revenueData.length > 0 ? (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    dy={15}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatRevenueTick}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4, shadow: '0 0 20px rgba(79, 70, 229, 0.4)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    strokeWidth={0}
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-300 font-black uppercase tracking-widest text-[10px]">
              <Layers className="w-12 h-12 mb-4 opacity-20" />
              Chưa có dữ liệu thống kê
            </div>
          )}
        </div>

        {/* Status Distribution Pie */}
        <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl shadow-slate-900/40 animate-fade-in delay-500 relative overflow-hidden group">
           <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-600/10 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
           
           <h2 className="text-sm font-black text-white uppercase tracking-widest mb-10 relative z-10">Tỷ lệ đơn hàng</h2>
           
           {orderStats.length > 0 ? (
            <div className="h-[350px] relative z-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStats}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {orderStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '1rem', color: '#fff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-600 font-black uppercase tracking-widest text-[10px] relative z-10">
               <Activity className="w-12 h-12 mb-4 opacity-10" />
               Không có dữ liệu
            </div>
          )}
        </div>
      </div>

      {/* Bottom Lists Row */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Best Sellers */}
        <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 animate-fade-in delay-600">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Sản phẩm bán chạy</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Dựa trên khối lượng đơn hàng</p>
              </div>
              <Link to="/admin/products" className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all text-slate-400">
                 <ArrowRight className="w-5 h-5" />
              </Link>
           </div>

           {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((p, idx) => (
                <div key={p._id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-6 group hover:translate-x-2 transition-transform duration-300">
                  <div className="relative">
                     <span className="absolute -top-2 -left-2 w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black z-10 shadow-lg">
                        {idx + 1}
                     </span>
                     <img
                        src={p.images?.[0]?.startsWith('http') ? p.images[0] : (p.images?.[0] ? `http://localhost:5000${p.images[0]}` : 'https://via.placeholder.com/60x80')}
                        alt={p.name}
                        className="w-16 h-20 object-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/60x80' }}
                     />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest line-clamp-1 mb-1">{p.name}</p>
                    <div className="flex items-center gap-3">
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ĐÃ BÁN: <span className="text-slate-900">{p.soldCount || 0}</span></p>
                       <span className="w-1 h-1 bg-slate-200 rounded-full" />
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">STOCK: <span className={p.totalStock < 10 ? 'text-red-500' : 'text-emerald-500'}>{p.totalStock || 0}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary-600">{formatCurrency(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">Chưa có dữ liệu bán hàng</div>
          )}
        </div>

        {/* Recent Orders List */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-slate-100/50 animate-fade-in delay-700">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Đơn hàng mới nhất</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Theo dõi hoạt động của người dùng</p>
              </div>
              <Link to="/admin/orders" className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all text-slate-400">
                 <ArrowRight className="w-5 h-5" />
              </Link>
           </div>

           {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.slice(0, 5).map((order) => (
                <Link
                  key={order._id}
                  to={`/admin/orders/${order._id}`}
                  className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-3xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                       <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-widest group-hover:text-primary-600 transition-colors">
                        #{order.orderNumber || order._id?.slice(-8)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                        {order.user?.name || 'KHÁCH'} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 mb-2">{formatCurrency(order.totalAmount)}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-sm ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">Giỏ hàng đang chờ đợi...</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage

