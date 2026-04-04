import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Grid2X2, LayoutList, X, Search, ChevronDown } from 'lucide-react'
import { productAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import ProductFilter from '../components/product/ProductFilter'
import Pagination from '../components/common/Pagination'
import LoadingSpinner from '../components/common/LoadingSpinner'

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
  { value: 'averageRating_desc', label: 'Đánh giá cao nhất' },
  { value: 'name_asc', label: 'Tên A-Z' }
]

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const currentPage = parseInt(searchParams.get('page') || '1')
  const sortParam = searchParams.get('sort') || 'createdAt_desc'
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const size = searchParams.get('size') || ''
  const color = searchParams.get('color') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  const filters = { category, size, color, minPrice, maxPrice }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const [sortField, sortOrder] = sortParam.split('_')
      const params = {
        page: currentPage,
        limit: 12,
        sortBy: sortField,
        sortOrder: sortOrder || 'desc',
        ...(search && { search }),
        ...(category && { category }),
        ...(size && { size }),
        ...(color && { color }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice })
      }
      const response = await productAPI.getAll(params)
      const data = response.data.data
      setProducts(data.products || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalProducts(data.pagination?.total || 0)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, sortParam, search, category, size, color, minPrice, maxPrice])

  useEffect(() => {
    fetchProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchProducts])

  const updateFilter = (newFilters) => {
    const params = {}
    searchParams.forEach((value, key) => { params[key] = value })
    Object.assign(params, newFilters, { page: '1' })
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key]
    })
    setSearchParams(params)
  }

  const handleSort = (value) => {
    updateFilter({ sort: value })
  }

  const handlePage = (page) => {
    const params = {}
    searchParams.forEach((value, key) => { params[key] = value })
    setSearchParams({ ...params, page: page.toString() })
  }

  const handleReset = () => {
    const params = {}
    if (search) params.search = search
    setSearchParams(params)
  }

  const activeFilterCount = [category, size, color, minPrice, maxPrice].filter(Boolean).length

  return (
    <div className="bg-white min-h-screen">
      {/* Search Result Banner - Editorial Style */}
      {(search || category) && (
        <div className="bg-slate-50 border-b border-slate-100 py-12 mb-8 animate-fade-in">
          <div className="container-custom">
            <div className="inline-flex items-center gap-2 mb-4">
               <span className="w-8 h-px bg-primary-600"></span>
               <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Kết quả tìm kiếm</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tighter uppercase italic">
              {search ? `"${search}"` : (products[0]?.category?.name || 'Bộ sưu tập')}
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">Tìm thấy {totalProducts} sản phẩm phù hợp</p>
          </div>
        </div>
      )}

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Desktop Filter Sidebar - Clean & Sharp */}
          <aside className="hidden lg:block w-72 flex-shrink-0 animate-fade-in">
            <div className="sticky top-28">
              <ProductFilter
                filters={filters}
                onChange={updateFilter}
                onReset={handleReset}
              />
            </div>
          </aside>

          {/* Products Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar - Modern Minimalist */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowMobileFilter(true)}
                  className="lg:hidden flex items-center gap-3 px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-black text-slate-900 uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Lọc
                  {activeFilterCount > 0 && (
                    <span className="bg-primary-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                
                {!search && !category && (
                  <h1 className="hidden md:block text-2xl font-display font-black text-slate-900 uppercase italic tracking-tighter">
                    Tất cả sản phẩm
                  </h1>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <select
                    value={sortParam}
                    onChange={(e) => handleSort(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-100 rounded-2xl pl-6 pr-12 py-3 text-xs font-black text-slate-900 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer shadow-sm group-hover:bg-slate-100"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
                </div>

                <div className="hidden sm:flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-md scale-105' : 'text-slate-300 hover:text-slate-500'}`}
                  >
                    <Grid2X2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-md scale-105' : 'text-slate-300 hover:text-slate-500'}`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Bar */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-3 mb-8 animate-slide-up">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-2">Đang lọc:</span>
                {category && (
                  <span className="group inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-primary-100 shadow-sm animate-fade-in">
                    Danh mục
                    <button onClick={() => updateFilter({ category: '' })} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {size && (
                  <span className="group inline-flex items-center gap-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-slate-900/10 animate-fade-in">
                    Size: {size}
                    <button onClick={() => updateFilter({ size: '' })} className="hover:text-primary-400 transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="group inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-indigo-100 shadow-sm animate-fade-in">
                    Giá
                    <button onClick={() => updateFilter({ minPrice: '', maxPrice: '' })} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button 
                  onClick={handleReset} 
                  className="text-[10px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest underline decoration-2 underline-offset-4 ml-2 transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {/* Products Grid - Editorial Presentation */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-8">
                <LoadingSpinner />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Tuyển tập đang được chuẩn bị...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="animate-fade-in">
                <div className={`grid gap-x-6 gap-y-10 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-1'
                }`}>
                  {products.map((product, idx) => (
                    <div key={product._id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePage}
                />
              </div>
            ) : (
              <div className="bg-slate-50 rounded-[4rem] py-32 text-center border-2 border-dashed border-slate-200 animate-fade-in">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200/50">
                   <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-3xl font-display font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">Bộ sưu tập của chúng tôi hiện chưa có mục bạn đang tìm kiếm. Hãy thử điều chỉnh bộ lọc hoặc từ khóa khác.</p>
                <button
                  onClick={handleReset}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                >
                  Khám phá toàn bộ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal - Premium Slide-out */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowMobileFilter(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white overflow-y-auto animate-slide-left shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-slate-100">
              <h3 className="font-display font-black text-slate-900 uppercase italic tracking-tighter">Bộ lọc tuyển chọn</h3>
              <button 
                onClick={() => setShowMobileFilter(false)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <ProductFilter
                filters={filters}
                onChange={(f) => { updateFilter(f); setShowMobileFilter(false) }}
                onReset={() => { handleReset(); setShowMobileFilter(false) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsPage

