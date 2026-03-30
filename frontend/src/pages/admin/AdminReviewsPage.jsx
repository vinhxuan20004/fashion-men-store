import React, { useState, useEffect, useCallback } from 'react'
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Filter, 
  Search, 
  MoreHorizontal,
  ChevronRight,
  User,
  ShoppingBag,
  ExternalLink,
  ThumbsUp,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { reviewAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: 10 }
      if (statusFilter !== '') params.isApproved = statusFilter === 'approved'
      
      const res = await reviewAPI.getAll(params)
      const data = res.data.data
      setReviews(data.reviews || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalReviews(data.pagination?.total || 0)
    } catch (error) {
      toast.error('Không thể tải danh sách đánh giá')
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter])

  useEffect(() => {
    fetchReviews()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchReviews])

  const handleApprove = async (id) => {
    try {
      await reviewAPI.approve(id)
      toast.success('Đã duyệt đánh giá')
      fetchReviews()
    } catch (error) {
      toast.error('Không thể duyệt đánh giá')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return
    try {
      await reviewAPI.delete(id)
      toast.success('Đã xóa đánh giá')
      fetchReviews()
    } catch (error) {
      toast.error('Không thể xóa đánh giá')
    }
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary-600"></span>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Cộng đồng & Đánh giá</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase">Quản lý Đánh giá</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary-600" />
            Đang hiển thị {totalReviews} nhận xét từ khách hàng
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
           <button 
             onClick={() => {setStatusFilter(''); setCurrentPage(1)}}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === '' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-400 hover:text-slate-600'}`}
           >
              Tất cả
           </button>
           <button 
             onClick={() => {setStatusFilter('pending'); setCurrentPage(1)}}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-slate-600'}`}
           >
              Chờ duyệt
           </button>
           <button 
             onClick={() => {setStatusFilter('approved'); setCurrentPage(1)}}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'approved' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-600'}`}
           >
              Đã duyệt
           </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24"><LoadingSpinner /></div>
      ) : reviews.length === 0 ? (
        <div className="py-32 text-center flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-50 shadow-sm animate-fade-in">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner text-slate-200">
             <Star className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Chưa có đánh giá nào</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Các đánh giá từ khách hàng sẽ xuất hiện tại đây</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in delay-100">
           {reviews.map((review, idx) => (
             <div 
               key={review._id} 
               className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/50 group hover:border-primary-100 transition-all duration-500 relative flex flex-col md:flex-row gap-8 overflow-hidden"
               style={{ animationDelay: `${idx * 50}ms` }}
             >
                {/* Visual Status Line */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 transition-all duration-500 ${review.isApproved ? 'bg-emerald-400' : 'bg-amber-400'}`} />

                {/* Left: User & Product Info */}
                <div className="md:w-64 space-y-6">
                   <div>
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all overflow-hidden shadow-inner">
                            {review.user?.avatar ? <img src={review.user.avatar} className="w-full h-full object-cover" /> : <User className="w-5 h-5" />}
                         </div>
                         <div>
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{review.user?.name}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(review.createdAt)}</p>
                         </div>
                      </div>
                   </div>

                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                         <ShoppingBag className="w-4 h-4 text-primary-600 shrink-0" />
                         <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate">{review.product?.name}</span>
                      </div>
                   </div>
                </div>

                {/* Middle: Content */}
                <div className="flex-1 space-y-6 pt-2">
                   <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                         <Star 
                           key={s} 
                           className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`} 
                         />
                      ))}
                   </div>
                   
                   <p className="text-xs font-medium text-slate-600 leading-relaxed uppercase tracking-widest">
                      "{review.comment || "KHÔNG CÓ NHẬN XÉT CHI TIẾT"}"
                   </p>

                   {review.images && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                         {review.images.map((img, i) => (
                            <img key={i} src={img} alt="" className="w-16 h-20 object-cover rounded-xl border border-slate-100 shadow-sm hover:scale-105 transition-transform cursor-pointer" />
                         ))}
                      </div>
                   )}
                </div>

                {/* Right: Actions */}
                <div className="md:w-48 flex md:flex-col justify-center gap-3">
                   {!review.isApproved && (
                      <button 
                         onClick={() => handleApprove(review._id)}
                         className="flex-1 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                      >
                         <CheckCircle2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                         DUYỆT NGAY
                      </button>
                   )}
                   <button 
                      onClick={() => handleDelete(review._id)}
                      className={`flex-1 px-6 py-3 bg-white text-slate-400 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn ${review.isApproved ? 'md:order-last' : ''}`}
                   >
                      <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      XÓA BỎ
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between animate-fade-in delay-300">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             TRANG {currentPage} / {totalPages}
           </p>
           <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  )
}

export default AdminReviewsPage
