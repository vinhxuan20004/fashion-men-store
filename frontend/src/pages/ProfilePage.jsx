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
      phone: user?.phone || ''
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Tài khoản của tôi</h1>

      {/* User Avatar */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-white rounded-xl border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-2xl font-black text-primary-700">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 ${
            user?.role === 'ADMIN'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'info'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4" />
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'password'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          Đổi mật khẩu
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {activeTab === 'info' ? (
          <form onSubmit={submitInfo(onInfoSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
              <input
                {...regInfo('name', {
                  required: 'Vui lòng nhập họ tên',
                  minLength: { value: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
                })}
                className="input-field"
                placeholder="Nguyễn Văn A"
              />
              {infoErrors.name && <p className="text-red-500 text-xs mt-1">{infoErrors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                {...regInfo('email', {
                  required: 'Vui lòng nhập email',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' }
                })}
                type="email"
                className="input-field"
              />
              {infoErrors.email && <p className="text-red-500 text-xs mt-1">{infoErrors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
              <input
                {...regInfo('phone', {
                  pattern: { value: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                })}
                type="tel"
                className="input-field"
                placeholder="0901234567"
              />
              {infoErrors.phone && <p className="text-red-500 text-xs mt-1">{infoErrors.phone.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loadingInfo}
              className="btn-primary flex items-center gap-2"
            >
              {loadingInfo ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loadingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
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
  )
}

export default ProfilePage
