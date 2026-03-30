# Men's Fashion Store - MERN Premium Edition

A high-end, production-ready e-commerce platform for men's fashion, featuring a "Premium Minimalist" aesthetic and a powerful administrative suite.

## 🌟 Key Features

### Storefront
- **Editorial Experience**: Staggered category grids and animated product showcases.
- **Micro-Interactions**: Glassmorphism overlays, "Quick Size Pick", and effortless cart management.
- **Full Search & Filter**: Sophisticated filtering by category, price, size, and color.
- **Product Storytelling**: Dedicated product detail pages with "Related Products" and customer reviews.

### Admin Dashboard
- **Executive Analytics**: Real-time revenue charts and order distribution metrics.
- **Full Inventory Control**: Manage product variants (Size/SKU/Stock) and rich category mappings.
- **Marketing Tools**: Comprehensive Voucher/Coupon engine (Percentage/Fixed, Usage limits).
- **Customer Engagement**: Moderation system for customer reviews and order lifecycle tracking.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Interactions**: CSS Animations, Framer-motion inspired transitions.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary (For image uploads, optional)

### 2. Environment Setup
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Installation
```bash
# In /backend
npm install

# In /frontend
npm install
```

### 4. Running the Project
```bash
# In /backend
npm run dev

# In /frontend
npm run dev
```

### 5. Administrative Access
- **Email**: `admin@antigravity.com`
- **Password**: `Admin@123456`

## 📁 Project Architecture

```text
mens-fashion-store/
├── backend/
│   ├── src/
│   │   ├── config/       # Database & Config
│   │   ├── controllers/  # API Logic
│   │   ├── models/       # Mongoose Schemas
│   │   ├── routes/       # API Endpoints
│   │   └── middleware/   # Auth & Error handling
│   └── uploads/          # Local storage for images
└── frontend/
    ├── src/
    │   ├── components/   # UI & Layout components
    │   ├── contexts/     # Auth & Cart state
    │   ├── pages/        # Storefront & Admin views
    │   ├── services/     # API Integration
    │   └── utils/        # Formatting & Helpers
```

---

*Designed and engineered with passion by **Antigravity**.*
