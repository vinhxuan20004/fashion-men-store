import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  Info, 
  Smartphone,
  ShieldCheck,
  Building2,
  User as UserIcon,
  Hash,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { orderAPI, siteAPI } from '../services/api'
import { formatCurrency } from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const PaymentQRPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [bankInfo, setBankInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          orderAPI.getById(id),
          siteAPI.getPublicSettings()
        ])

        const orderData = orderRes.data.data.order || orderRes.data.data
        setOrder(orderData)

        const settings = settingsRes.data.data.settings || {}
        setBankInfo(settings.payment_bank_transfer)

      } catch (error) {
        console.error('Failed to fetch payment data:', error)
        toast.error('Không thể tải thông tin thanh toán')
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, navigate])

  // Polling for payment status
  useEffect(() => {
    if (loading || !order || order.paymentStatus === 'PAID') return

    const pollInterval = setInterval(async () => {
      try {
        const res = await orderAPI.getById(id)
        const updatedOrder = res.data.data.order || res.data.data
        
        if (updatedOrder.paymentStatus === 'PAID') {
          setOrder(updatedOrder)
          toast.success('Thanh toán thành công!')
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(pollInterval)
  }, [id, loading, order])

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Đã sao chép!')
    setTimeout(() => setCopiedField(null), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <LoadingSpinner />
    </div>
  )

  if (!order || !bankInfo) return null

  const transferContent = `${bankInfo.prefix || 'MADH'} ${order.orderNumber || order._id?.slice(-8)}`
  const qrUrl = `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-compact2.png?amount=${order.total}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankInfo.accountHolder)}`

  const isPaid = order.paymentStatus === 'PAID'

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-10 mb-8 md:mb-12">
        <div className="container-custom">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <button
                  onClick={() => navigate(`/orders/${id}`)}
                  className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 hover:text-primary-600 transition-colors group"
                >
                  <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  QUAY LẠI ĐƠN HÀNG
                </button>
                <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tighter uppercase italic">
                  Thanh toán chuyển khoản
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
                   Đơn hàng #{order.orderNumber || order._id?.slice(-8)}
                   <span className="w-1 h-1 bg-slate-300 rounded-full" />
                   <span className="price-bold">{formatCurrency(order.total)}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                 <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-3 transition-all duration-500 shadow-sm border ${
                   isPaid 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                    : 'bg-amber-50 border-amber-100 text-amber-600 animate-pulse'
                 }`}>
                    {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {isPaid ? 'Đã nhận thanh toán' : 'Chờ chuyển khoản...'}
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left: QR Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
               <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-primary-600/10 to-emerald-600/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <img 
                    src={qrUrl} 
                    alt="VietQR Payment" 
                    className="relative w-full max-w-[320px] aspect-square rounded-[2rem] shadow-xl border border-slate-100"
                  />
               </div>
               
               <div className="mt-8 flex flex-col items-center text-center space-y-4">
                  <div className="flex items-center gap-2 text-primary-600">
                    <Smartphone className="w-5 h-5" />
                    <span className="text-sm font-black uppercase tracking-widest italic">Quét mã để thanh toán</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Sử dụng các ứng dụng Ngân hàng hoặc Ví điện tử <br/> để quét mã VietQR phía trên.
                  </p>
               </div>

               <div className="mt-10 w-full p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Giao dịch an toàn</p>
                    <p className="text-[10px] font-bold text-slate-600 leading-tight">Mã QR chính xác từ vietqr.io & bảo mật theo tiêu chuẩn Napas 24/7.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right: Transfer Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Bank Info Card */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                  <Building2 className="w-48 h-48" />
               </div>

               <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic mb-10 flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  Thông tin chuyển khoản thủ công
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
                  {/* Account No */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Hash className="w-3 h-3" />
                       SỐ TÀI KHOẢN
                    </p>
                    <div className="flex items-center justify-between group/field">
                       <p className="text-xl font-display font-black text-slate-900 tracking-tight">{bankInfo.accountNo}</p>
                       <button 
                         onClick={() => handleCopy(bankInfo.accountNo, 'accountNo')}
                         className="p-2 text-slate-300 hover:text-primary-600 transition-colors"
                       >
                         {copiedField === 'accountNo' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                       </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Building2 className="w-3 h-3" />
                       SỐ TIỀN THANH TOÁN
                    </p>
                    <div className="flex items-center justify-between">
                       <p className="text-xl font-display font-black text-primary-600 tracking-tight italic underline decoration-primary-200 decoration-4 underline-offset-4 price-bold">
                         {formatCurrency(order.total)}
                       </p>
                       <button 
                         onClick={() => handleCopy(order.total.toString(), 'amount')}
                         className="p-2 text-slate-300 hover:text-primary-600 transition-colors"
                       >
                         {copiedField === 'amount' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                       </button>
                    </div>
                  </div>

                  {/* Account Holder */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <UserIcon className="w-3 h-3" />
                       NGƯỜI THỤ HƯỞNG
                    </p>
                    <p className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{bankInfo.accountHolder}</p>
                  </div>

                  {/* Bank Name */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Building2 className="w-3 h-3" />
                       NGÂN HÀNG
                    </p>
                    <p className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{bankInfo.bankName} ({bankInfo.bankId})</p>
                  </div>

                  {/* Transfer Note */}
                  <div className="md:col-span-2 p-6 bg-slate-900 text-white rounded-3xl space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC)</p>
                    <div className="flex items-center justify-between">
                       <p className="text-lg font-display font-black text-primary-400 tracking-widest">{transferContent}</p>
                       <button 
                         onClick={() => handleCopy(transferContent, 'note')}
                         className="p-2 text-primary-400 hover:text-white transition-colors"
                       >
                         {copiedField === 'note' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                       </button>
                    </div>
                  </div>
               </div>
            </div>

            {/* Steps & Important Info */}
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-900/10">
               <div className="flex items-center gap-3 mb-8">
                  <Info className="w-5 h-5 text-primary-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest italic">Lưu ý quan trọng</h3>
               </div>
               
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                     <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase tracking-wider">Vui lòng chuyển <span className="text-white underline decoration-primary-500">ĐÚNG CHÍNH XÁC</span> số tiền & nội dung như trên để hệ thống tự động xác nhận.</p>
                  </div>
                  <div className="flex gap-4">
                     <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                     <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase tracking-wider">Trạng thái thanh toán sẽ tự động cập nhật sau 3-5 phút kể từ khi giao dịch thành công.</p>
                  </div>
                  <div className="flex gap-4">
                     <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                     <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase tracking-wider">Nếu gặp bất kỳ khó khăn nào, vui lòng liên hệ hotline: <span className="text-primary-400 font-black tracking-widest">0901 234 567</span>.</p>
                  </div>
               </div>

               <div className="mt-12 flex justify-center">
                  <Link 
                    to={`/orders/${id}`}
                    className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] hover:text-primary-400 transition-all group"
                  >
                    XEM CHI TIẾT ĐƠN HÀNG 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentQRPage
