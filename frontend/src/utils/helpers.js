export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

export const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export const getOrderStatusLabel = (status) => {
  if (!status) return ''
  const labels = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao hàng',
    DELIVERED: 'Đã giao hàng',
    CANCELLED: 'Đã hủy',
    RETURNED: 'Đã hoàn trả'
  }
  return labels[status] || status || ''
}

export const getOrderStatusColor = (status) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPING: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    RETURNED: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getPaymentMethodLabel = (method) => {
  const labels = {
    COD: 'Thanh toán khi nhận hàng',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng'
  }
  return labels[method] || method
}

export const getPaymentStatusLabel = (status, paymentMethod) => {
  if (paymentMethod === 'COD' && status === 'PENDING') {
    return 'Thanh toán khi nhận hàng'
  }
  const labels = {
    PENDING: 'Chờ thanh toán',
    PAID: 'Đã thanh toán',
    FAILED: 'Thanh toán thất bại',
    REFUNDED: 'Đã hoàn tiền'
  }
  return labels[status] || status
}

export const getPaymentStatusColor = (status) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const slugify = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-product.jpg'
  if (imagePath.startsWith('http')) return imagePath
  return `http://localhost:5000${imagePath}`
}
