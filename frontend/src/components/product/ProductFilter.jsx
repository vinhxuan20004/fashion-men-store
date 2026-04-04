import React, { useState, useEffect } from 'react'
import { categoryAPI } from '../../services/api'
import { Filter, X, ChevronDown, Check } from 'lucide-react'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const COLORS = [
  { name: 'Trắng', value: 'Trắng', code: '#FFFFFF' },
  { name: 'Đen', value: 'Đen', code: '#000000' },
  { name: 'Xám', value: 'Xám', code: '#9CA3AF' },
  { name: 'Navy', value: 'Navy', code: '#1E3A5F' },
  { name: 'Xanh', value: 'Xanh', code: '#3B82F6' },
  { name: 'Đỏ', value: 'Đỏ', code: '#EF4444' },
  { name: 'Nâu', value: 'Nâu', code: '#92400E' },
  { name: 'Be', value: 'Beige', code: '#D4B896' },
  { name: 'Than', value: 'Than', code: '#36454F' }
]

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-50 py-6 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <h4 className="text-[13px] text-slate-900 uppercase tracking-wide group-hover:text-primary-600 transition-colors force-bold">{title}</h4>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  )
}

const ProductFilter = ({ filters, onChange, onReset }) => {
  const [categories, setCategories] = useState([])
  const [minPrice, setMinPrice] = useState(filters.minPrice || '')
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '')

  useEffect(() => {
    categoryAPI.getAll().then((res) => {
      setCategories(res.data.data.categories || [])
    }).catch(() => {})
  }, [])

  const handleCategoryChange = (catId) => {
    const current = filters.category ? filters.category.split(',').filter(Boolean) : []
    const updated = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId]
    onChange({ category: updated.join(',') })
  }

  const handleSizeChange = (size) => {
    const current = filters.size ? filters.size.split(',').filter(Boolean) : []
    const updated = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size]
    onChange({ size: updated.join(',') })
  }

  const handleColorChange = (color) => {
    const current = filters.color ? filters.color.split(',').filter(Boolean) : []
    const updated = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color]
    onChange({ color: updated.join(',') })
  }

  const handlePriceApply = () => {
    onChange({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined })
  }

  const selectedCategories = filters.category ? filters.category.split(',').filter(Boolean) : []
  const selectedSizes = filters.size ? filters.size.split(',').filter(Boolean) : []
  const selectedColors = filters.color ? filters.color.split(',').filter(Boolean) : []

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-900" />
          <h3 className="text-[17px] text-slate-900 uppercase italic tracking-tighter force-bold">Bộ lọc</h3>
        </div>
        <button
          onClick={onReset}
          className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {/* Categories */}
        <FilterSection title="Danh mục">
          <div className="space-y-3 px-1">
            {categories.map((cat) => {
              const active = selectedCategories.includes(cat._id)
              return (
                <label key={cat._id} className="flex items-center group cursor-pointer">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => handleCategoryChange(cat._id)}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 border-2 border-slate-200 rounded-md transition-all group-hover:border-primary-400 peer-checked:bg-primary-600 peer-checked:border-primary-600" />
                    <Check className={`absolute w-3 h-3 text-white transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <span className={`ml-3 text-[15px] transition-colors force-bold ${active ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    {cat.name?.toLowerCase()}
                  </span>
                  {cat.productCount !== undefined && (
                    <span className="ml-auto text-[10px] font-black text-slate-300 group-hover:text-slate-400 transition-colors">{cat.productCount}</span>
                  )}
                </label>
              )
            })}
          </div>
        </FilterSection>

        {/* Sizes */}
        <FilterSection title="Kích cỡ">
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map((size) => {
              const active = selectedSizes.includes(size)
              return (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`h-11 text-[13px] rounded-lg border-2 transition-all duration-300 force-bold ${
                    active
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10'
                      : 'border-slate-100 text-slate-400 hover:border-primary-600 hover:text-primary-600'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </FilterSection>

        {/* Colors */}
        <FilterSection title="Màu sắc">
          <div className="grid grid-cols-5 gap-3">
            {COLORS.map((color) => {
              const active = selectedColors.includes(color.value)
              return (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  title={color.name}
                  className={`group relative w-full aspect-square rounded-full flex items-center justify-center transition-all ${
                    active ? 'ring-2 ring-primary-600 ring-offset-2' : 'hover:scale-110'
                  }`}
                >
                  <div 
                    className="w-full h-full rounded-full border border-slate-100 shadow-inner"
                    style={{ backgroundColor: color.code }}
                  />
                  {active && <Check className={`absolute w-3 h-3 ${color.value === 'white' ? 'text-slate-900' : 'text-white'}`} />}
                </button>
              )
            })}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Khoảng giá">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Từ</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-3.5 text-[15px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-300 force-bold"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-300 uppercase force-bold">Đến</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-3.5 text-[15px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-300 force-bold"
                />
              </div>
            </div>
            
            <button
              onClick={handlePriceApply}
              className="w-full btn-primary !py-2.5 !rounded-lg text-[11px]"
            >
              Áp dụng lọc giá
            </button>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { label: 'Dưới 200k', min: '', max: 200000 },
                { label: '200k - 500k', min: 200000, max: 500000 },
                { label: '500k - 1M', min: 500000, max: 1000000 },
                { label: 'Trên 1M', min: 1000000, max: '' }
              ].map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    setMinPrice(range.min)
                    setMaxPrice(range.max)
                    onChange({ minPrice: range.min || undefined, maxPrice: range.max || undefined })
                  }}
                  className="text-[13px] uppercase tracking-tight py-2.5 rounded-lg bg-white border border-slate-100 text-slate-500 hover:border-primary-600 hover:text-primary-600 transition-all force-bold"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  )
}

export default ProductFilter

