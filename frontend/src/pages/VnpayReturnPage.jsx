import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { paymentAPI } from '../services/api'

const VnpayReturnPage = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [orderId, setOrderId] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const processReturn = async () => {
      try {
        const params = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })

        const response = await paymentAPI.vnpayReturn(params)
        const resBody = response.data
        const resultData = resBody.data || {}

        if (resBody.success || params.vnp_ResponseCode === '00') {
          setStatus('success')
          setOrderId(resultData.orderId || params.vnp_TxnRef)
          setMessage(resBody.message || 'Thanh toán thành công!')
        } else {
          setStatus('failed')
          setMessage(resBody.message || 'Thanh toán thất bại')
        }
      } catch (error) {
        const code = searchParams.get('vnp_ResponseCode')
        if (code === '00') {
          setStatus('success')
          setMessage('Thanh toán VNPay thành công!')
        } else {
          setStatus('failed')
          setMessage('Thanh toán thất bại hoặc bị hủy')
        }
      }
    }

    processReturn()
  }, [])

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-primary-600 animate-spin" />
          <p className="text-gray-600 font-medium">Đang xử lý kết quả thanh toán...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Thanh toán thành công!</h1>
          <p className="text-gray-500">{message}</p>
          {orderId && (
            <p className="text-sm text-gray-500">
              Mã đơn hàng: <span className="font-semibold text-gray-900">#{orderId.slice(-8)}</span>
            </p>
          )}
          <div className="flex gap-3 mt-4">
            {orderId && (
              <Link
                to={`/orders/${orderId}`}
                className="btn-primary"
              >
                Xem đơn hàng
              </Link>
            )}
            <Link to="/products" className="btn-secondary">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Thanh toán thất bại</h1>
          <p className="text-gray-500">{message}</p>
          <div className="flex gap-3 mt-4">
            <Link to="/cart" className="btn-primary">
              Quay lại giỏ hàng
            </Link>
            <Link to="/orders" className="btn-secondary">
              Đơn hàng của tôi
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default VnpayReturnPage
