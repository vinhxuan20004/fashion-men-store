import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { Save, Plus, Trash2, Upload, X, ChevronLeft, ShoppingBag, Tag, Layers, Star, Info, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react'
import { productAPI, categoryAPI } from '../../services/api'
import { getImageUrl } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminProductEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      variants: [{ size: '', color: '', colorCode: '#000000', stock: 0, sku: '' }],
      isFeatured: false,
      isActive: true
    }
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants'
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryAPI.getAll(),
          productAPI.getOne(id)
        ])
        
        setCategories(catRes.data.data.categories || [])
        
        const product = prodRes.data.data.product
        if (product) {
          reset({
            name: product.name,
            description: product.description,
            price: product.price,
            salePrice: product.salePrice,
            category: product.category?._id || product.category,
            brand: product.brand,
            material: product.material,
            tags: product.tags?.join(', '),
            isFeatured: product.isFeatured,
            isActive: product.isActive,
            variants: product.variants?.length > 0 ? product.variants : [{ size: '', color: '', colorCode: '#000000', stock: 0, sku: '' }]
          })
          setExistingImages(product.images || [])
        }
      } catch (error) {
        toast.error('Không thể tải thông tin sản phẩm')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, reset])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(prev => [...prev, ...files])
    const previews = files.map(f => URL.createObjectURL(f))
    setImagePreviews(prev => [...prev, ...previews])
  }

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imgUrl) => {
    setExistingImages(prev => prev.filter(img => img !== imgUrl))
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    if (data.salePrice && parseFloat(data.salePrice) >= parseFloat(data.price)) {
      return toast.error('Giá khuyến mãi phải nhỏ hơn giá gốc')
    }

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
        isActive: data.isActive || false,
        variants: data.variants.map(v => ({
          size: v.size,
          color: v.color,
          colorCode: v.colorCode,
          stock: parseInt(v.stock) || 0,
          sku: v.sku
        })),
        images: existingImages // Keep existing images
      }

      await productAPI.update(id, productData)

      // Upload new images if any
      if (imageFiles.length > 0) {
        const formData = new FormData()
        imageFiles.forEach(file => formData.append('images', file))
        await productAPI.uploadImages(id, formData)
      }

      toast.success('Cập nhật sản phẩm thành công!')
      navigate('/admin/products')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      {/* Form Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
           <Link to="/admin/products" className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-primary-600 transition-colors mb-2 group">
             <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             Quay lại kho hàng
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-sm shadow-slate-900/10">
                <RefreshCw className="w-4 h-4" />
             </div>
             <h1 className="text-xl font-semibold text-slate-800">Chỉnh sửa sản phẩm</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button
             type="button"
             onClick={() => navigate('/admin/products')}
             className="px-5 py-2 bg-white text-slate-500 border border-slate-100 rounded-xl text-xs font-medium hover:bg-slate-50 transition-all duration-300 active:scale-95"
           >
             Hủy bỏ
           </button>
           <button 
             form="product-form"
             type="submit" 
             disabled={submitting} 
             className="group px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium shadow-sm shadow-slate-900/10 hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 active:scale-95 flex items-center gap-2.5"
           >
             {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
             {submitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
           </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Info Card */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm relative overflow-hidden">
             <h2 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-3">
               <Layers className="w-5 h-5 text-primary-600" />
               Thông tin cơ bản
             </h2>

             <div className="space-y-5 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Tên sản phẩm *</label>
                  <input
                    {...register('name', { required: 'Vui lòng nhập tên sản phẩm' })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all"
                    placeholder="VD: Áo sơ mi nam Slim-fit"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-medium mt-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Mô tả sản phẩm</label>
                  <textarea
                    {...register('description')}
                    rows={5}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all resize-none"
                    placeholder="Nhập mô tả sản phẩm..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">Thương hiệu</label>
                      <input
                        {...register('brand')}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all"
                        placeholder="VD: Men Couture"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">Chất liệu</label>
                      <input
                        {...register('material')}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all"
                        placeholder="VD: 100% Cotton"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Variants Card */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-3">
                  <Tag className="w-5 h-5 text-primary-600" />
                  Biến thể & Kho hàng
                </h2>
                <button
                  type="button"
                  onClick={() => appendVariant({ size: '', color: '', colorCode: '#000000', stock: 0, sku: '' })}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 text-slate-700 border border-slate-100 rounded-xl text-xs font-medium hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm biến thể
                </button>
             </div>

             <div className="space-y-4">
                {variantFields.map((field, idx) => (
                  <div key={field.id} className="p-4.5 bg-slate-50/50 border border-slate-100 rounded-xl relative group/item hover:bg-white hover:border-primary-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-medium text-slate-400 bg-white border border-slate-100 px-2.5 py-0.5 rounded-md capitalize tracking-tight">Phiên bản #{idx + 1}</span>
                       {variantFields.length > 1 && (
                         <button
                           type="button"
                           onClick={() => removeVariant(idx)}
                           className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/item:opacity-100 shadow-sm"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                       )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">Kích cỡ</label>
                          <input
                            {...register(`variants.${idx}.size`)}
                            list="size-suggestions"
                            placeholder="S, M, 32..."
                            className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 shadow-sm"
                          />
                          <datalist id="size-suggestions">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '29', '30', '31', '32', '33', '34', '35', '36'].map(s => <option key={s} value={s} />)}
                          </datalist>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">Màu sắc</label>
                          <input
                            {...register(`variants.${idx}.color`)}
                            className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 shadow-sm"
                            placeholder="Tên màu"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">Mã màu</label>
                          <input
                            type="color"
                            {...register(`variants.${idx}.colorCode`)}
                            className="w-full h-[36px] p-1 bg-white border border-slate-100 rounded-lg cursor-pointer shadow-sm"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">Tồn kho *</label>
                          <input
                            type="number"
                            {...register(`variants.${idx}.stock`, { min: 0 })}
                            className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 shadow-sm"
                            placeholder="0"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">SKU</label>
                          <input
                            {...register(`variants.${idx}.sku`)}
                            className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 shadow-sm"
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
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
             <h3 className="text-sm font-semibold text-slate-800 mb-6">Định giá</h3>
             <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Giá gốc (₫) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-300">₫</span>
                    <input
                      type="number"
                      {...register('price', { required: 'Vui lòng nhập giá', min: { value: 0, message: 'Giá không hợp lệ' } })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all"
                      placeholder="0"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-[10px] font-medium mt-1">{errors.price.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Giá khuyến mãi (₫)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-300">₫</span>
                    <input
                      type="number"
                      {...register('salePrice', { 
                        validate: value => !value || parseFloat(value) < parseFloat(watch('price')) || 'Giá khuyến mãi phải nhỏ hơn giá gốc'
                      })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all"
                      placeholder="Không bắt buộc"
                    />
                  </div>
                  {errors.salePrice && <p className="text-red-500 text-[10px] font-medium mt-1">{errors.salePrice.message}</p>}
                </div>
             </div>
          </div>

          {/* Collection & Status */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
             <h3 className="text-sm font-semibold text-slate-800 mb-6">Phân loại & Hiển thị</h3>
             <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Danh mục *</label>
                  <div className="relative group">
                     <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors pointer-events-none" />
                     <select
                       {...register('category', { required: 'Vui lòng chọn danh mục' })}
                       className="w-full pl-12 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium text-slate-900 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer"
                     >
                       <option value="">Chọn danh mục</option>
                       {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                     </select>
                  </div>
                  {errors.category && <p className="text-red-500 text-[10px] font-medium mt-1">{errors.category.message}</p>}
                </div>

                <div className="space-y-3.5">
                   <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-all group">
                      <div className="flex items-center gap-3">
                         <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                         <span className="text-xs font-medium text-slate-700">Sản phẩm nổi bật</span>
                      </div>
                      <input
                        type="checkbox"
                        {...register('isFeatured')}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                   </div>

                   <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-all group">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500" />
                         <span className="text-xs font-medium text-slate-700">Đang kích hoạt</span>
                      </div>
                      <input
                        type="checkbox"
                        {...register('isActive')}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
             <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-slate-800">Hình ảnh</h3>
                <ImageIcon className="w-5 h-5 text-slate-300" />
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                {/* Existing Images */}
                {existingImages.map((imgUrl, idx) => (
                  <div key={`existing-${idx}`} className="relative aspect-[3/4] group">
                    <img src={getImageUrl(imgUrl)} alt="" className="w-full h-full object-cover rounded-lg border border-slate-100" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(imgUrl)}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-md shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-[9px] font-medium text-white capitalize tracking-tight rounded">Chính</div>
                    )}
                  </div>
                ))}

                {/* New Image Previews */}
                {imagePreviews.map((preview, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-[3/4] group">
                    <img src={preview} alt="" className="w-full h-full object-cover rounded-lg border border-emerald-200 ring-2 ring-emerald-50" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-md shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-600/80 backdrop-blur-md text-[9px] font-medium text-white capitalize tracking-tight rounded">Mới</div>
                  </div>
                ))}
                
                <label className="aspect-[3/4] border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-200 hover:bg-slate-50 transition-all group shadow-inner">
                   <Upload className="w-5 h-5 text-slate-300 group-hover:text-primary-600 transition-colors mb-1" />
                   <span className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">Thêm ảnh</span>
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

export default AdminProductEditPage
