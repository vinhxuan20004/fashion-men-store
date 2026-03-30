import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

// Public Pages
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CartPage from './pages/CartPage'
import VnpayReturnPage from './pages/VnpayReturnPage'
import MomoReturnPage from './pages/MomoReturnPage'

// User Pages
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ProfilePage from './pages/ProfilePage'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminProductCreatePage from './pages/admin/AdminProductCreatePage'
import AdminProductEditPage from './pages/admin/AdminProductEditPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminVouchersPage from './pages/admin/AdminVouchersPage'
import AdminReviewsPage from './pages/admin/AdminReviewsPage'

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path="/products"
        element={
          <MainLayout>
            <ProductsPage />
          </MainLayout>
        }
      />
      <Route
        path="/products/:slug"
        element={
          <MainLayout>
            <ProductDetailPage />
          </MainLayout>
        }
      />
      <Route
        path="/login"
        element={
          <MainLayout>
            <LoginPage />
          </MainLayout>
        }
      />
      <Route
        path="/register"
        element={
          <MainLayout>
            <RegisterPage />
          </MainLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <MainLayout>
            <CartPage />
          </MainLayout>
        }
      />
      <Route
        path="/payment/vnpay-return"
        element={
          <MainLayout>
            <VnpayReturnPage />
          </MainLayout>
        }
      />
      <Route
        path="/payment/momo-return"
        element={
          <MainLayout>
            <MomoReturnPage />
          </MainLayout>
        }
      />

      {/* Protected User Routes */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MainLayout>
              <OrdersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <OrderDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminProductsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/create"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminProductCreatePage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminProductEditPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminCategoriesPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminOrdersPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminOrderDetailPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/vouchers"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminVouchersPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminReviewsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
