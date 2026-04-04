import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartAPI } from '../services/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

const CART_STORAGE_KEY = 'guest_cart'

const loadGuestCart = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const saveGuestCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [cartId, setCartId] = useState(null)
  const [voucher, setVoucher] = useState(null)
  const [loading, setLoading] = useState(false)

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const cartSubtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.salePrice || item.product?.price || item.price || 0
    return sum + price * item.quantity
  }, 0)

  const discount = voucher
    ? voucher.type === 'PERCENTAGE'
      ? cartSubtotal * (voucher.value / 100)
      : voucher.value
    : 0

  const shipping = cartSubtotal > 0 ? (cartSubtotal >= 500000 ? 0 : 30000) : 0
  const cartTotal = cartSubtotal - discount + shipping

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems(loadGuestCart())
      return
    }
    setLoading(true)
    try {
      const response = await cartAPI.getCart()
      const cartData = response.data.data?.cart || response.data.cart || response.data
      setCartItems(cartData.items || [])
      setCartId(cartData._id || cartData.id)
      if (cartData.appliedVoucher) {
        setVoucher(cartData.appliedVoucher)
      } else {
        setVoucher(null)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const syncCart = useCallback(async () => {
    const guestItems = loadGuestCart()
    if (guestItems.length === 0) return

    try {
      // Use for...of to handle items sequentially
      for (const item of guestItems) {
        if (item.productId && item.variantId) {
          await cartAPI.addItem({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          })
        }
      }
      localStorage.removeItem(CART_STORAGE_KEY)
      await fetchCart()
      toast.success('Đã đồng bộ giỏ hàng của bạn!')
    } catch (error) {
      console.error('Failed to sync cart:', error)
    }
  }, [fetchCart])

  useEffect(() => {
    if (isAuthenticated) {
      syncCart()
    } else {
      fetchCart()
    }
  }, [isAuthenticated, syncCart, fetchCart])

  const addToCart = async (productId, variantId, quantity = 1, productData = null) => {
    if (!productId || !variantId) {
      toast.error('Thông tin sản phẩm không hợp lệ')
      return { success: false }
    }

    if (!isAuthenticated) {
      const existing = cartItems.find(
        (item) => item.productId === productId && item.variantId === variantId
      )
      let newItems
      if (existing) {
        newItems = cartItems.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newItems = [
          ...cartItems,
          { productId, variantId, quantity, product: productData, id: Date.now().toString() }
        ]
      }
      setCartItems(newItems)
      saveGuestCart(newItems)
      toast.success('Đã thêm vào giỏ hàng!')
      return { success: true }
    }

    try {
      await cartAPI.addItem({ productId, variantId, quantity })
      await fetchCart()
      toast.success('Đã thêm vào giỏ hàng!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể thêm vào giỏ hàng'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      const newItems = cartItems.filter((item) => item.id !== itemId)
      setCartItems(newItems)
      saveGuestCart(newItems)
      toast.success('Đã xóa khỏi giỏ hàng')
      return
    }

    try {
      await cartAPI.removeItem(itemId)
      await fetchCart()
      toast.success('Đã xóa khỏi giỏ hàng')
    } catch (error) {
      toast.error('Không thể xóa sản phẩm')
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return

    if (!isAuthenticated) {
      const newItems = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
      setCartItems(newItems)
      saveGuestCart(newItems)
      return
    }

    try {
      await cartAPI.updateItem(itemId, { quantity })
      await fetchCart()
    } catch (error) {
      toast.error('Không thể cập nhật số lượng')
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated) {
      setCartItems([])
      localStorage.removeItem(CART_STORAGE_KEY)
      return
    }

    try {
      await cartAPI.clearCart()
      setCartItems([])
      setVoucher(null)
    } catch (error) {
      toast.error('Không thể xóa giỏ hàng')
    }
  }

  const applyVoucher = async (code) => {
    try {
      const response = await cartAPI.applyVoucher(code)
      const voucherData = response.data.data?.voucher || response.data.voucher || response.data
      setVoucher(voucherData)
      toast.success('Áp dụng voucher thành công!')
      return { success: true, voucher: voucherData }
    } catch (error) {
      const message = error.response?.data?.message || 'Voucher không hợp lệ'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const removeVoucher = () => {
    setVoucher(null)
  }

  const value = {
    cartItems,
    cartId,
    cartCount,
    cartSubtotal,
    cartTotal,
    discount,
    shipping,
    voucher,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    applyVoucher,
    removeVoucher
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
