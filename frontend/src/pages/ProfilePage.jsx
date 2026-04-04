import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register: regInfo,
    handleSubmit: submitInfo,
    formState: { errors: infoErrors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        district: user?.address?.district || '',
        city: user?.address?.city || ''
      }
    }
  })

  const {
    register: regPass,
    handleSubmit: submitPass,
    watch,
    reset: resetPass,
    formState: { errors: passErrors }
  } = useForm()

  const newPassword = watch('newPassword')

  const onInfoSubmit = async (data) => {
    setLoadingInfo(true)
    // The backend expects address as an object, which react-hook-form will provide
    // due to the 'address.street' etc. naming convention in regInfo.
    await updateUser(data)
    setLoadingInfo(false)
  }

  const onPasswordSubmit = async (data) => {
    setLoadingPassword(true)
    try {
      await authAPI.changePassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      toast.success('Đổi mật khẩu thành công!')
      resetPass()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setLoadingPassword(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Tài khoản của tôi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* User Avatar */}
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-4 border-2 border-primary-100 p-1">
              <div className="w-full h-full rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-black italic">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{user?.name}</h2>
              <p className="text-gray-500 text-sm mb-3">{user?.email}</p>
              <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                user?.role === 'ADMIN'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-primary-100 text-primary-700'
              }`}>
                {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
              </span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-col gap-1 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'info'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'password'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              Đổi mật khẩu
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Tab Content */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full">
            {activeTab === 'info' ? (
              <form onSubmit={submitInfo(onInfoSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Họ và tên</label>
                    <input
                      {...regInfo('name', {
                        required: 'Vui lòng nhập họ tên',
                        minLength: { value: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
                      })}
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-600 focus:ring-0 transition-all placeholder:text-gray-400 placeholder:font-medium"
                      placeholder="Nguyễn Văn A"
                    />
                    {infoErrors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{infoErrors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Email</label>
                    <input
                      {...regInfo('email', {
                        required: 'Vui lòng nhập email',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' }
                      })}
                      type="email"
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-400 focus:ring-0 cursor-not-allowed"
                      disabled
                    />
                    {infoErrors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{infoErrors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Số điện thoại</label>
                    <input
                      {...regInfo('phone', {
                        pattern: { value: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                      })}
                      type="tel"
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-600 focus:ring-0 transition-all placeholder:text-gray-400 placeholder:font-medium"
                      placeholder="0901234567"
                    />
                    {infoErrors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{infoErrors.phone.message}</p>}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 mb-6">Địa chỉ giao hàng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Địa chỉ cụ thể (Số nhà, tên đường)</label>
                      <input
                        {...regInfo('address.street')}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-600 focus:ring-0 transition-all placeholder:text-gray-400 placeholder:font-medium"
                        placeholder="123 Đường ABC..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Quận / Huyện</label>
                      <input
                        {...regInfo('address.district')}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-600 focus:ring-0 transition-all placeholder:text-gray-400 placeholder:font-medium"
                        placeholder="Quận 1"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Thành phố / Tỉnh</label>
                      <input
                        {...regInfo('address.city')}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-600 focus:ring-0 transition-all placeholder:text-gray-400 placeholder:font-medium"
                        placeholder="TP. Hồ Chí Minh"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loadingInfo}
                    className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loadingInfo ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {loadingInfo ? 'ĐANG LƯU...' : 'LƯU THÔNG TIN'}
                  </button>
                </div>
              </form>
            ) : (
          <form onSubmit={submitPass(onPasswordSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
              <div className="relative">
                <input
                  {...regPass('currentPassword', { required: 'Vui lòng nhập mật khẩu hiện tại' })}
                  type={showOld ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passErrors.currentPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
              <div className="relative">
                <input
                  {...regPass('newPassword', {
                    required: 'Vui lòng nhập mật khẩu mới',
                    minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một chữ số'
                    }
                  })}
                  type={showNew ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passErrors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input
                  {...regPass('confirmPassword', {
                    required: 'Vui lòng xác nhận mật khẩu',
                    validate: (v) => v === newPassword || 'Mật khẩu không khớp'
                  })}
                  type={showConfirm ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passErrors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loadingPassword}
              className="btn-primary flex items-center gap-2"
            >
              {loadingPassword ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {loadingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
