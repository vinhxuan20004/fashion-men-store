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
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-0.5 bg-primary-600 rounded-full"></span>
            <span className="text-[11px] font-semibold text-primary-600 capitalize tracking-tight">Cộng đồng & Đánh giá</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Quản lý đánh giá</h1>
          <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Đang hiển thị {totalReviews} nhận xét từ khách hàng
          </div>
        </div>

        <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-100">
           <button 
             onClick={() => {setStatusFilter(''); setCurrentPage(1)}}
             className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === '' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
              Tất cả
           </button>
           <button 
             onClick={() => {setStatusFilter('pending'); setCurrentPage(1)}}
             className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
              Chờ duyệt
           </button>
           <button 
             onClick={() => {setStatusFilter('approved'); setCurrentPage(1)}}
             className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
              Đã duyệt
           </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24"><LoadingSpinner /></div>
      ) : reviews.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-5 text-slate-200">
             <Star className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Chưa có đánh giá nào</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Các nhận xét từ khách hàng sẽ xuất hiện tại đây</p>
        </div>
      ) : (
        <div className="space-y-5">
           {reviews.map((review, idx) => (
             <div 
               key={review._id} 
               className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm group hover:border-primary-100 transition-all duration-300 relative flex flex-col md:flex-row gap-8 overflow-hidden"
             >
                {/* Visual Status Indicator */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 transition-all duration-300 ${review.isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                {/* Left: User & Product Info */}
                <div className="md:w-56 space-y-6">
                   <div>
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 overflow-hidden shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-all">
                            {review.user?.avatar ? <img src={review.user.avatar} className="w-full h-full object-cover" /> : <User className="w-5 h-5" />}
                         </div>
                         <div>
                            <h4 className="text-xs font-semibold text-slate-800 capitalize truncate w-32">{review.user?.name}</h4>
                            <p className="text-[10px] font-medium text-slate-400 capitalize">{formatDate(review.createdAt)}</p>
                         </div>
                      </div>
                   </div>

                   <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white transition-all">
                      <div className="flex items-center gap-2.5">
                         <ShoppingBag className="w-4 h-4 text-primary-600 shrink-0" />
                         <span className="text-[11px] font-semibold text-slate-700 capitalize truncate">{review.product?.name}</span>
                      </div>
                   </div>
                </div>

                {/* Middle: Content */}
                <div className="flex-1 space-y-5 pt-1">
                   <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                         <Star 
                           key={s} 
                           className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`} 
                         />
                      ))}
                   </div>
                   
                   <p className="text-sm font-normal text-slate-600 leading-relaxed italic">
                      "{review.comment || "Không có nhận xét chi tiết"}"
                   </p>

                   {review.images && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 pt-1">
                         {review.images.map((img, i) => (
                            <img key={i} src={img} alt="" className="w-14 h-18 object-cover rounded-lg border border-slate-100 shadow-sm hover:scale-105 transition-transform cursor-pointer" />
                         ))}
                      </div>
                   )}
                </div>

                {/* Right: Actions */}
                <div className="md:w-44 flex md:flex-col justify-center gap-2.5">
                   {!review.isApproved && (
                      <button 
                         onClick={() => handleApprove(review._id)}
                         className="flex-1 px-5 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                         <CheckCircle2 className="w-4 h-4" />
                         Duyệt
                      </button>
                   )}
                   <button 
                      onClick={() => handleDelete(review._id)}
                      className={`flex-1 px-5 py-2 bg-white text-slate-400 border border-slate-100 rounded-xl text-xs font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 ${review.isApproved ? 'md:order-last' : ''}`}
                   >
                      <Trash2 className="w-4 h-4" />
                      Xóa bỏ
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-6">
           <p className="text-xs font-medium text-slate-400 capitalize">
             Trang {currentPage} / {totalPages}
           </p>
           <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  )
}

export default AdminReviewsPage
