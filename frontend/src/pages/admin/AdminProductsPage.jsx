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
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-px bg-primary-600"></span>
            <span className="text-[11px] font-medium text-primary-600 tracking-tight">Kho hàng & Sản phẩm</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Quản lý kho sản phẩm</h1>
          <p className="text-slate-400 font-normal text-xs mt-1.5 flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-primary-600" />
            Hiện có {totalProducts} sản phẩm trong hệ thống
          </p>
        </div>

        <Link 
          to="/admin/products/create" 
          className="group flex items-center justify-center gap-2.5 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium shadow-sm shadow-slate-900/10 hover:bg-primary-600 transition-all duration-300 active:scale-95"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          Thêm sản phẩm mới
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-100 p-3.5 flex flex-wrap gap-4 shadow-sm animate-fade-in delay-100">
        <form onSubmit={handleSearch} className="flex-1 min-w-[280px] relative group text-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all"
          />
          <button type="submit" className="hidden">Tìm</button>
        </form>
        
        <div className="flex items-center gap-2 min-w-[180px] relative group text-xs">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary-600 transition-colors pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-600 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm animate-fade-in delay-200">
        {loading ? (
          <div className="py-24">
             <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 shadow-inner text-slate-200">
               <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Kho hàng trống</h3>
            <p className="text-xs text-slate-400 font-medium">Không tìm thấy sản phẩm nào phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[11px] font-medium text-slate-400 capitalize tracking-tight">Sản phẩm</th>
                  <th className="text-left px-6 py-4 text-[11px] font-medium text-slate-400 capitalize tracking-tight hidden md:table-cell">Danh mục</th>
                  <th className="text-left px-6 py-4 text-[11px] font-medium text-slate-400 capitalize tracking-tight">Giá bán</th>
                  <th className="text-left px-6 py-4 text-[11px] font-medium text-slate-400 capitalize tracking-tight hidden sm:table-cell">Kho</th>
                  <th className="text-left px-6 py-4 text-[11px] font-medium text-slate-400 capitalize tracking-tight hidden lg:table-cell">Trạng thái</th>
                  <th className="text-right px-6 py-4 text-[11px] font-medium text-slate-400 capitalize tracking-tight">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((product) => {
                  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0
                  const image = product.images?.[0] ? getImageUrl(product.images[0]) : null

                  return (
                    <tr key={product._id} className="group hover:bg-slate-50 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-14 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 group-hover:shadow-md transition-all duration-300">
                            {image ? (
                              <img src={image} alt={product.name} className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none' }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2">
                               <p className="text-[10px] font-medium text-slate-400">{product.brand || 'No Brand'}</p>
                               {product.isFeatured && (
                                 <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                               )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded capitalize">
                          {product.category?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-slate-900">{formatCurrency(product.salePrice || product.price)}</p>
                          {product.salePrice && product.salePrice < product.price && (
                            <p className="text-[10px] text-slate-400 font-normal line-through">{formatCurrency(product.price)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex flex-col gap-1.5">
                           <span className={`text-[10px] font-semibold ${totalStock === 0 ? 'text-red-500' : totalStock < 10 ? 'text-amber-500' : 'text-emerald-600'}`}>
                             {totalStock} đơn vị
                           </span>
                           <div className="w-12 h-1 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                              <div 
                                className={`h-full transition-all duration-1000 ${totalStock === 0 ? 'bg-red-500 w-0' : totalStock < 10 ? 'bg-amber-500 w-1/3' : 'bg-emerald-500 w-full'}`} 
                              />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                           {product.isActive !== false ? (
                             <div className="flex items-center gap-1.5 text-emerald-600 px-2.5 py-1 bg-emerald-50/50 border border-emerald-100 rounded-full text-[10px] font-medium">
                                <Eye className="w-3 h-3" />
                                Hiển thị
                             </div>
                           ) : (
                             <div className="flex items-center gap-1.5 text-slate-400 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-medium">
                                <EyeOff className="w-3 h-3" />
                                Đã ẩn
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95"
                            title="CHỈNH SỬA"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(product._id)}
                            className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm active:scale-95"
                            title="XÓA"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
         <p className="text-[11px] font-medium text-slate-400 tracking-tight">
            Trang {currentPage} / {totalPages}
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

