import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Package, Filter, MoreHorizontal, ArrowUpRight, ShoppingBag, Eye, EyeOff, Star } from 'lucide-react'
import { productAPI, categoryAPI } from '../../services/api'
import { formatCurrency, getImageUrl } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const AdminProductsPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    categoryAPI.getAll().then(res => {
      setCategories(res.data.data.categories || [])
    }).catch(() => {})
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: 10 }
      if (search) params.search = search
      if (categoryFilter) params.category = categoryFilter
      const res = await productAPI.getAll(params)
      const data = res.data.data
      setProducts(data.products || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalProducts(data.pagination?.total || 0)
    } catch (error) {
      toast.error('Không thể tải sản phẩm')
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, categoryFilter])

  useEffect(() => {
    fetchProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchProducts])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await productAPI.delete(deleteTarget)
      toast.success('Đã xóa sản phẩm')
      fetchProducts()
    } catch (error) {
      toast.error('Không thể xóa sản phẩm')
    }
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary-600"></span>
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.3em]">Kho hàng & Sản phẩm</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 uppercase">Quản lý kho sản phẩm</h1>
          <p className="text-slate-400 font-semibold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary-600" />
            Hiện có {totalProducts} sản phẩm trong hệ thống
          </p>
        </div>

        <Link 
          to="/admin/products/create" 
          className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all duration-300 active:scale-95"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          Thêm sản phẩm mới
        </Link>
      </div>

      {/* Modern Filter Bar */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-wrap gap-4 shadow-xl shadow-slate-100/50 animate-fade-in delay-100">
        <form onSubmit={handleSearch} className="flex-1 min-w-[280px] relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên, thương hiệu hoặc mã..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all shadow-inner"
          />
          <button type="submit" className="hidden">Tìm</button>
        </form>
        
        <div className="flex items-center gap-2 min-w-[200px] relative group">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
            className="w-full pl-14 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-900 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Premium Data Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-100/60 animate-fade-in delay-200">
        {loading ? (
          <div className="py-24">
             <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner text-slate-200">
               <Package className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Kho hàng trống</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sản phẩm</th>
                  <th className="text-left px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Danh mục</th>
                  <th className="text-left px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Giá bán</th>
                  <th className="text-left px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">Kho</th>
                  <th className="text-left px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Trạng thái</th>
                  <th className="text-right px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((product) => {
                  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0
                  const image = product.images?.[0] ? getImageUrl(product.images[0]) : null

                  return (
                    <tr key={product._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                            {image ? (
                              <img src={image} alt={product.name} className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none' }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 tracking-widest line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2">
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{product.brand || 'No Brand'}</p>
                               {product.isFeatured && (
                                 <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                               )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                          {product.category?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900 tracking-tight">{formatCurrency(product.salePrice || product.price)}</p>
                          {product.salePrice && product.salePrice < product.price && (
                            <p className="text-[10px] text-slate-300 font-bold line-through">{formatCurrency(product.price)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden sm:table-cell">
                        <div className="flex flex-col gap-1">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${totalStock === 0 ? 'text-red-500' : totalStock < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                             {totalStock} ĐƠN VỊ
                           </span>
                           <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${totalStock === 0 ? 'bg-red-500 w-0' : totalStock < 10 ? 'bg-amber-500 w-1/3' : 'bg-emerald-500 w-full'}`} 
                              />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                           {product.isActive !== false ? (
                             <div className="flex items-center gap-1.5 text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-full text-[9px] font-black uppercase tracking-widest">
                                <Eye className="w-3 h-3" />
                                HIỂN THỊ
                             </div>
                           ) : (
                             <div className="flex items-center gap-1.5 text-slate-400 px-3 py-1.5 bg-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest">
                                <EyeOff className="w-3 h-3" />
                                ĐÃ ẨN
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-90"
                            title="CHỈNH SỬA"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(product._id)}
                            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm active:scale-90"
                            title="XÓA"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between animate-fade-in delay-300">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
           TRANG {currentPage} / {totalPages}
         </p>
         <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống? Hành động này không thể hoàn tác."
        confirmText="Xác nhận xóa"
        variant="danger"
      />
    </div>
  )
}

export default AdminProductsPage

