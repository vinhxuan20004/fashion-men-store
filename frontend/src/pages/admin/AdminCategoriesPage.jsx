import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Tag, 
  List, 
  ChevronRight, 
  Layers, 
  Image as ImageIcon, 
  Eye, 
  EyeOff, 
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Search,
  LayoutGrid,
  RefreshCw
} from 'lucide-react'
import { categoryAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', order: 0, isActive: true })
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await categoryAPI.getAll()
      const data = res.data.data
      setCategories(data.categories || [])
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ 
        name: category.name, 
        description: category.description || '', 
        order: category.order || 0, 
        isActive: category.isActive 
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', description: '', order: 0, isActive: true })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData)
        toast.success('Cập nhật danh mục thành công')
      } else {
        await categoryAPI.create(formData)
        toast.success('Tạo danh mục thành công')
      }
      setShowModal(false)
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return
    try {
      await categoryAPI.delete(id)
      toast.success('Xóa danh mục thành công')
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa danh mục')
    }
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-px bg-primary-600"></span>
            <span className="text-[11px] font-medium text-primary-600 tracking-tight">Phân loại sản phẩm</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Quản lý danh mục</h1>
          <p className="text-slate-400 font-normal text-xs mt-1.5 flex items-center gap-2">
            <LayoutGrid className="w-3.5 h-3.5 text-primary-600" />
            Đang hiển thị {categories.length} danh mục hiện có
          </p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium shadow-sm shadow-slate-900/10 hover:bg-primary-600 transition-all duration-300 flex items-center gap-2.5 active:scale-95 group"
        >
           <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
           Thêm danh mục mới
        </button>
      </div>

      {loading ? (
        <div className="py-24"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in delay-100">
           {categories.map((category, idx) => (
             <div 
               key={category._id} 
               className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm group hover:border-primary-100 hover:shadow-md transition-all duration-300 relative flex flex-col"
               style={{ animationDelay: `${idx * 50}ms` }}
             >
                {/* Visual Accent */}
                <div className={`h-1 transition-all duration-500 ${category.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                
                <div className="p-5 flex-1 space-y-5">
                   <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                         {category.image ? (
                           <img src={category.image} alt={category.name} className="w-full h-full object-cover rounded-lg" />
                         ) : <Tag className="w-5 h-5" />}
                      </div>
                      <div className="flex items-center gap-2">
                         <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize border ${category.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {category.isActive ? 'Hoạt động' : 'Đang ẩn'}
                         </div>
                      </div>
                   </div>

                   <div>
                      <h3 className="text-base font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-medium text-slate-400 tracking-tight">Thứ tự: {category.order || 0}</span>
                      </div>
                      <p className="text-xs font-normal text-slate-500 leading-relaxed mt-3 line-clamp-2">
                        {category.description || "Chưa có mô tả được cập nhật cho danh mục này"}
                      </p>
                   </div>

                   <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                       <button 
                         onClick={() => handleOpenModal(category)}
                         className="flex items-center gap-2 px-3.5 py-2 bg-white text-slate-700 border border-slate-100 rounded-xl text-xs font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
                       >
                          <Edit className="w-3.5 h-3.5" />
                          Chỉnh sửa
                       </button>
                       <button 
                         onClick={() => handleDelete(category._id)}
                         className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-90"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

       {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
           <div className="bg-white rounded-xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-scale-up">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                 <h2 className="text-lg font-semibold text-slate-800">
                    {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                 </h2>
                 <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 ml-1">Tên danh mục *</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all"
                      placeholder="VD: Áo sơ mi"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 ml-1">Mô tả</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all resize-none"
                      placeholder="Mô tả ngắn gọn về danh mục..."
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-slate-400 ml-1">Thứ tự sắp xếp</label>
                       <input
                         type="number"
                         value={formData.order}
                         onChange={(e) => setFormData({...formData, order: e.target.value})}
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-slate-400 ml-1">Trạng thái</label>
                       <div 
                         className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer ${formData.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                         onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                       >
                          <span className="text-xs font-medium">{formData.isActive ? 'Hoạt động' : 'Đang ẩn'}</span>
                          {formData.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                       </div>
                    </div>
                 </div>

                 <div className="pt-2 flex items-center justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-5 py-2 bg-white text-slate-500 border border-slate-100 rounded-xl text-xs font-medium hover:bg-slate-50 transition-all"
                    >
                       Hủy bỏ
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium shadow-sm shadow-slate-900/10 hover:bg-primary-600 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                    >
                       {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                       {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategoriesPage
