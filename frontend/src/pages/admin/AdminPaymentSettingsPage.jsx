import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { 
  CreditCard, 
  Building2, 
  User as UserIcon, 
  Hash, 
  Type, 
  Save, 
  Loader2, 
  Info, 
  AlertCircle,
  Banknote,
  CheckCircle2,
  Truck
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminPaymentSettingsPage = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Bank Transfer states
  const [bankSettings, setBankSettings] = useState({
    accountNo: '',
    accountHolder: '',
    bankName: '',
    bankId: '',
    prefix: 'MADH'
  })

  // Payment methods status
  const [methodStatus, setMethodStatus] = useState({
    bankTransfer: true,
    cod: true,
    vnpay: true,
    momo: true
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getSettings({ group: 'payment' })
      const settings = res.data.data.settings || []
      
      const bankSetting = settings.find(s => s.key === 'payment_bank_transfer')
      if (bankSetting && bankSetting.value) {
        setBankSettings(bankSetting.value)
      }

      const statusSetting = settings.find(s => s.key === 'payment_methods_status')
      if (statusSetting && statusSetting.value) {
        setMethodStatus(statusSetting.value)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Không thể tải cấu hình thanh toán')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.updateSettings({
        settings: [
          {
            key: 'payment_bank_transfer',
            value: bankSettings,
            group: 'payment',
            description: 'Thông tin chuyển khoản ngân hàng'
          },
          {
            key: 'payment_methods_status',
            value: methodStatus,
            group: 'payment',
            description: 'Trạng thái bật/tắt các phương thức thanh toán'
          }
        ]
      })
      toast.success('Cập nhật cấu hình thành công')
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error('Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusToggle = (method) => {
    setMethodStatus(prev => ({ ...prev, [method]: !prev[method] }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setBankSettings(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Đang tải cấu hình...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Phương thức thanh toán</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý cách khách hàng thanh toán cho đơn hàng của họ</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 gap-8">
          {/* General Payment Methods status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-base font-bold text-slate-800">Trạng thái thanh toán</h2>
                <p className="text-xs text-slate-500">Bật/tắt các phương thức thanh toán hiển thị cho khách hàng</p>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* COD Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                         <Truck className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-700">Thanh toán khi nhận hàng (COD)</p>
                         <p className="text-[10px] text-slate-400 font-medium italic">Thu tiền mặt khi giao hàng</p>
                      </div>
                   </div>
                   <button
                      type="button"
                      onClick={() => handleStatusToggle('cod')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-primary-500 ${methodStatus.cod ? 'bg-primary-600' : 'bg-slate-300'}`}
                   >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${methodStatus.cod ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                </div>

                {/* Bank Transfer Toggle (Independent of details) */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                         <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-700">Chuyển khoản ngân hàng</p>
                         <p className="text-[10px] text-slate-400 font-medium italic">Chuyển khoản thủ công vào TK</p>
                      </div>
                   </div>
                   <button
                      type="button"
                      onClick={() => handleStatusToggle('bankTransfer')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-primary-500 ${methodStatus.bankTransfer ? 'bg-primary-600' : 'bg-slate-300'}`}
                   >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${methodStatus.bankTransfer ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                </div>
             </div>
          </div>

          {/* Bank Transfer Details Section */}
          <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md ${!methodStatus.bankTransfer ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Thông tin chuyển khoản</h2>
                  <p className="text-xs text-slate-500">Cấu hình tài khoản nhận tiền</p>
                </div>
              </div>
              {methodStatus.bankTransfer ? (
                <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã kích hoạt
                </div>
              ) : (
                <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  Đang tắt
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-3 h-3" />
                    Ngân hàng
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={bankSettings.bankName}
                    onChange={handleChange}
                    placeholder="VD: Vietcombank, Techcombank..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none"
                    required={methodStatus.bankTransfer}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Hash className="w-3 h-3" />
                    Mã ngân hàng (Bank ID)
                  </label>
                  <input
                    type="text"
                    name="bankId"
                    value={bankSettings.bankId}
                    onChange={handleChange}
                    placeholder="VD: VCB, TCB, MB, ABB..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none"
                    required={methodStatus.bankTransfer}
                  />
                  <p className="text-[9px] text-slate-400 font-medium italic mt-1 ml-1 leading-relaxed">
                    Dùng để tạo mã VietQR. <a href="https://vietqr.io/danh-sach-bin-cac-ngan-hang/" target="_blank" rel="noreferrer" className="text-primary-600 underline">Xem danh sách tại đây</a>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Hash className="w-3 h-3" />
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    name="accountNo"
                    value={bankSettings.accountNo}
                    onChange={handleChange}
                    placeholder="Nhập số tài khoản của bạn"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none"
                    required={methodStatus.bankTransfer}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <UserIcon className="w-3 h-3" />
                    Chủ tài khoản
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={bankSettings.accountHolder}
                    onChange={handleChange}
                    placeholder="Tên in trên thẻ/ứng dụng"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none uppercase"
                    required={methodStatus.bankTransfer}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Type className="w-3 h-3" />
                    Tiền tố nội dung (Prefix)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="prefix"
                      value={bankSettings.prefix}
                      onChange={handleChange}
                      placeholder="VD: THANHTOAN"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                       <div className="group relative">
                          <Info className="w-4 h-4 text-slate-300 hover:text-slate-500 transition-colors cursor-help" />
                          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-[10px] text-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                            Nội dung chuyển khoản sẽ có dạng: <strong>{bankSettings.prefix} [Mã đơn hàng]</strong>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-900">Lưu ý về bảo mật</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Đảm bảo các thông tin trên là chính xác để tránh nhầm lẫn trong quá trình xác nhận thanh toán. Hệ thống sẽ hiển thị thông tin này tại trang thanh toán cho khách hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="group relative flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-primary-600 transition-all duration-300 disabled:opacity-70 active:scale-95 overflow-hidden"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 group-hover:animate-bounce" />
            )}
            <span>{saving ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
            
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminPaymentSettingsPage
