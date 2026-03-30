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
  LayoutGrid
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
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary-600"></span>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Phân loại sản phẩm</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase">Quản lý danh mục</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary-600" />
            Đang hiển thị {categories.length} danh mục hiện có
          </p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all duration-300 flex items-center gap-3 active:scale-95 group"
        >
           <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
           THÊM DANH MỤC MỚI
        </button>
      </div>

      {loading ? (
        <div className="py-24"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in delay-100">
           {categories.map((category, idx) => (
             <div 
               key={category._id} 
               className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-100/50 group hover:border-primary-100 transition-all duration-500 relative flex flex-col"
               style={{ animationDelay: `${idx * 50}ms` }}
             >
                {/* Visual Accent */}
                <div className={`h-2 transition-all duration-500 ${category.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                
                <div className="p-8 flex-1 space-y-8">
                   <div className="flex justify-between items-start">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-inner">
                         {category.image ? (
                           <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                         ) : <Tag className="w-8 h-8" />}
                      </div>
                      <div className="flex items-center gap-2">
                         <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${category.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {category.isActive ? 'Hoạt động' : 'Đang ẩn'}
                         </div>
                      </div>
                   </div>

                   <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                         SẮP XẾP: #{category.order || 0}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 leading-relaxed mt-4 line-clamp-2 uppercase tracking-widest">
                        {category.description || "KHÔNG CÓ MÔ TẢ ĐƯỢC CẬP NHẬT CHO DANH MỤC NÀY"}
                      </p>
                   </div>

                   <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                       <button 
                         onClick={() => handleOpenModal(category)}
                         className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-900 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                       >
                          <Edit className="w-3.5 h-3.5" />
                          CHỈNH SỬA
                       </button>
                       <button 
                         onClick={() => handleDelete(category._id)}
                         className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-300 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-90"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Modal - Editorial Glassmorphism style */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
           <div className="bg-white rounded-[3rem] w-full max-w-xl relative z-10 overflow-hidden shadow-2xl animate-scale-up border border-white/20">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {editingCategory ? 'CẬP NHẬT DANH MỤC' : 'TẠO DANH MỤC MỚI'}
                 </h2>
                 <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tên danh mục *</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner"
                      placeholder="VD: ÁO SƠ MI"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mô tả</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner resize-none"
                      placeholder="Mô tả ngắn gọn về danh mục..."
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Thứ tự sắp xếp</label>
                       <input
                         type="number"
                         value={formData.order}
                         onChange={(e) => setFormData({...formData, order: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Trạng thái</label>
                       <div 
                         className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all cursor-pointer ${formData.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                         onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                       >
                          <span className="text-[10px] font-black uppercase tracking-widest">{formData.isActive ? 'Hoạt động' : 'Đang ẩn'}</span>
                          {formData.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-50 flex items-center justify-end gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-8 py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                       HỦY BỎ
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-3"
                    >
                       {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                       {editingCategory ? 'CẬP NHẬT' : 'TẠO MỚI'}
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
