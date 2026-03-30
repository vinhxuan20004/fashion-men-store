import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Upload, X, ChevronLeft, ShoppingBag, Tag, Layers, Star, Info, Image as ImageIcon, Sparkles } from 'lucide-react'
import { productAPI, categoryAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AdminProductCreatePage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      variants: [{ size: '', color: '', colorCode: '#000000', stock: 0, sku: '' }],
      isFeatured: false
    }
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants'
  })

  useEffect(() => {
    categoryAPI.getAll().then(res => {
      setCategories(res.data.data.categories || [])
    }).catch(() => {})
  }, [])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(prev => [...prev, ...files])
    const previews = files.map(f => URL.createObjectURL(f))
    setImagePreviews(prev => [...prev, ...previews])
  }

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const productData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        salePrice: data.salePrice ? parseFloat(data.salePrice) : undefined,
        category: data.category,
        brand: data.brand,
        material: data.material,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isFeatured: data.isFeatured || false,
        variants: data.variants.map(v => ({
          size: v.size,
          color: v.color,
          colorCode: v.colorCode,
          stock: parseInt(v.stock) || 0,
          sku: v.sku
        }))
      }

      const res = await productAPI.create(productData)
      const productId = res.data.data.product?._id || res.data.data._id

      if (imageFiles.length > 0) {
        const formData = new FormData()
        imageFiles.forEach(file => formData.append('images', file))
        await productAPI.uploadImages(productId, formData)
      }

      toast.success('Tạo sản phẩm thành công!')
      navigate('/admin/products')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tạo sản phẩm thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-6">
      {/* Form Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div>
           <Link to="/admin/products" className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] hover:text-primary-600 transition-colors mb-4 group">
             <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             Quay lại kho hàng
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                <Plus className="w-5 h-5" />
             </div>
             <h1 className="text-2xl font-bold text-slate-900 uppercase">Thêm sản phẩm mới</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button
             type="button"
             onClick={() => navigate('/admin/products')}
             className="px-6 py-3 bg-white text-slate-400 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-50 transition-all duration-300 active:scale-95"
           >
             Hủy bỏ
           </button>
           <button 
             form="product-form"
             type="submit" 
             disabled={loading} 
             className="group px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 active:scale-95 flex items-center gap-3"
           >
             {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
             {loading ? 'Đang xử lý...' : 'Xác nhận tạo'}
           </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Info Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl shadow-slate-100/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-bl-[5rem] flex items-center justify-center opacity-50">
                <Info className="w-12 h-12 text-slate-200" />
             </div>
             
             <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-3">
               <Layers className="w-5 h-5 text-primary-600" />
               Thông tin chi tiết sản phẩm
             </h2>

             <div className="space-y-8 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên sản phẩm *</label>
                  <input
                    {...register('name', { required: 'Vui lòng nhập tên sản phẩm' })}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all shadow-inner"
                    placeholder="VD: ÁO SƠ MI NAM SLIM-FIT LUXURY"
                  />
                  {errors.name && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mt-1 ml-2">{errors.name.message}</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mô tả sản phẩm</label>
                  <textarea
                    {...register('description')}
                    rows={6}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all shadow-inner resize-none"
                    placeholder="Nhập mô tả sản phẩm tinh tế và thu hút khách hàng..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thương hiệu</label>
                      <input
                        {...register('brand')}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all shadow-inner"
                        placeholder="VD: MEN COUTURE"
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chất liệu</label>
                      <input
                        {...register('material')}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:bg-white transition-all shadow-inner"
                        placeholder="VD: 100% COTTON LỤA"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Variants Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl shadow-slate-100/50">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <Tag className="w-5 h-5 text-primary-600" />
                  Biến thể & Kho hàng
                </h2>
                <button
                  type="button"
                  onClick={() => appendVariant({ size: '', color: '', colorCode: '#000000', stock: 0, sku: '' })}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-900 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  THÊM BIẾN THỂ
                </button>
             </div>

             <div className="space-y-6">
                {variantFields.map((field, idx) => (
                  <div key={field.id} className="p-8 bg-slate-50/50 border border-slate-50 rounded-[2rem] relative group/item hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-500">
                    <div className="flex items-center justify-between mb-8">
                       <span className="text-[9px] font-black text-white bg-slate-900 px-4 py-1.5 rounded-full tracking-[0.2em]">BIẾN THỂ #{idx + 1}</span>
                       {variantFields.length > 1 && (
                         <button
                           type="button"
                           onClick={() => removeVariant(idx)}
                           className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/item:opacity-100 shadow-sm"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kích cỡ</label>
                          <select
                            {...register(`variants.${idx}.size`)}
                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-100 appearance-none shadow-sm cursor-pointer"
                          >
                            <option value="">CHỌN</option>
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Màu sắc</label>
                          <input
                            {...register(`variants.${idx}.color`)}
                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-100 shadow-sm"
                            placeholder="Tên màu"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mã màu</label>
                          <input
                            type="color"
                            {...register(`variants.${idx}.colorCode`)}
                            className="w-full h-[46px] p-1 bg-white border border-slate-100 rounded-xl cursor-pointer shadow-sm"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tồn kho *</label>
                          <input
                            type="number"
                            {...register(`variants.${idx}.stock`, { min: 0 })}
                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-100 shadow-sm"
                            placeholder="0"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU</label>
                          <input
                            {...register(`variants.${idx}.sku`)}
                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-100 shadow-sm"
                            placeholder="ORDER-01"
                          />
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-10">
          {/* Price Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/40 border border-white/5">
             <h3 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-10">Định giá sản phẩm</h3>
             <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Giá gốc (₫) *</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-white/20">₫</span>
                    <input
                      type="number"
                      {...register('price', { required: 'Vui lòng nhập giá', min: { value: 0, message: 'Giá không hợp lệ' } })}
                      className="w-full pl-12 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-xl font-black text-white focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:bg-white/10 transition-all"
                      placeholder="0"
                    />
                  </div>
                  {errors.price && <p className="text-red-400 text-[9px] font-black uppercase tracking-widest">{errors.price.message}</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Giá khuyến mãi (₫)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-white/20">₫</span>
                    <input
                      type="number"
                      {...register('salePrice')}
                      className="w-full pl-12 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-xl font-black text-white focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:bg-white/10 transition-all"
                      placeholder="Optional"
                    />
                  </div>
                </div>
             </div>
          </div>

          {/* Collection & Status */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-100/50">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Phân loại & Trạng thái</h3>
             <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Danh mục *</label>
                  <div className="relative group">
                     <Layers className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-600 transition-colors pointer-events-none" />
                     <select
                       {...register('category', { required: 'Vui lòng chọn danh mục' })}
                       className="w-full pl-14 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner cursor-pointer"
                     >
                       <option value="">CHỌN DANH MỤC</option>
                       {categories.map(c => <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>)}
                     </select>
                  </div>
                  {errors.category && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest">{errors.category.message}</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tags liên quan</label>
                  <input
                    {...register('tags')}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner"
                    placeholder="VD: sơ mi, công sở, mùa hè"
                   />
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl group cursor-pointer hover:bg-slate-900 transition-all duration-500">
                   <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400 group-hover:scale-125 transition-transform" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:text-white">Nổi bật</span>
                   </div>
                   <input
                     type="checkbox"
                     {...register('isFeatured')}
                     className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary-600 focus:ring-0 cursor-pointer"
                   />
                </div>
             </div>
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-100/50">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thư viện hình ảnh</h3>
                <ImageIcon className="w-5 h-5 text-slate-200" />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-[3/4] group">
                    <img src={preview} alt="" className="w-full h-full object-cover rounded-2xl shadow-md border border-slate-100" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-2 left-2 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-widest rounded-lg">COVER</div>
                    )}
                  </div>
                ))}
                
                <label className="aspect-[3/4] border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all group">
                   <Upload className="w-6 h-6 text-slate-300 group-hover:text-primary-600 group-hover:-translate-y-1 transition-all mb-2" />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TẢI ẢNH LÊN</span>
                   <input
                     type="file"
                     multiple
                     accept="image/*"
                     onChange={handleImageChange}
                     className="sr-only"
                   />
                </label>
             </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminProductCreatePage

