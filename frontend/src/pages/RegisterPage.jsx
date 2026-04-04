import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const RegisterPage = () => {
  const { register: registerUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/')
  }, [isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password
    })
    setLoading(false)
    if (result.success) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900">Tạo tài khoản</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Tham gia Men's Fashion Store để mua sắm dễ dàng hơn
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Họ và tên
              </label>
              <input
                type="text"
                {...register('name', {
                  required: 'Vui lòng nhập họ tên',
                  minLength: { value: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
                })}
                placeholder="Nguyễn Văn A"
                className="input-field"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Vui lòng nhập email',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email không hợp lệ'
                  }
                })}
                placeholder="your@email.com"
                className="input-field"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Vui lòng nhập mật khẩu',
                    minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một chữ số'
                    }
                  })}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Vui lòng xác nhận mật khẩu',
                    validate: (value) => value === password || 'Mật khẩu không khớp'
                  })}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('terms', { required: 'Vui lòng đồng ý điều khoản' })}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-600"
              />
              <span className="text-sm text-gray-600">
                Tôi đồng ý với{' '}
                <a href="#" className="text-primary-600 hover:underline">điều khoản sử dụng</a>{' '}
                và{' '}
                <a href="#" className="text-primary-600 hover:underline">chính sách bảo mật</a>
              </span>
            </label>
            {errors.terms && (
              <p className="text-red-500 text-xs">{errors.terms.message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang đăng ký...
                </span>
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
