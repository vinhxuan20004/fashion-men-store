import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { formatCurrency, getImageUrl } from '../../utils/helpers'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  if (!product) return null

  const {
    _id,
    slug,
    name,
    price,
    salePrice,
    images,
    category,
    averageRating,
    reviewCount,
    variants,
    brand
  } = product

  const displayPrice = salePrice || price
  const hasDiscount = salePrice && salePrice < price
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice) / price) * 100)
    : 0

  const mainImage = images?.[0]
    ? getImageUrl(images[0])
    : 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80'

  const secondImage = images?.[1]
    ? getImageUrl(images[1])
    : mainImage

  const defaultVariant = variants?.[0]

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!defaultVariant) return

    setIsAdding(true)
    await addToCart(_id, defaultVariant._id, 1, product)
    setIsAdding(false)
  }

  return (
    <div 
      className="group relative flex flex-col bg-white rounded-lg transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-slate-50 border border-slate-100 transition-all">
        <Link to={`/products/${slug}`} className="block h-full w-full">
          <img
            src={isHovered ? secondImage : mainImage}
            alt={name}
            className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isHovered ? 'scale-105' : 'scale-100'}`}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=500&q=80'
            }}
          />
        </Link>

        {/* Discount Badge - Minimal */}
        {hasDiscount && (
          <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm tracking-tight">
            -{discountPercent}%
          </div>
        )}

        {/* Quick View Button - Discrete */}
        <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <button 
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm active:scale-90"
          >
            {isAdding ? <div className="w-2.5 h-2.5 border border-slate-900 border-t-transparent rounded-full animate-spin" /> : <ShoppingCart className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-2 px-1">
        <p className="text-[9px] text-slate-400 tracking-wide leading-none mb-1 title-case">
          {(brand || 'Men\'s Fashion')?.toLowerCase()}
        </p>

        <Link to={`/products/${slug}`} className="block">
          <h3 className="font-sans text-slate-800 text-[11px] mb-1 line-clamp-1 leading-tight tracking-tight hover:text-primary-600 transition-colors title-case">
            {name?.toLowerCase()}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5">
          <p className="text-[12px] price-bold">
            {formatCurrency(displayPrice)}
          </p>
          {hasDiscount && (
            <p className="text-[10px] text-slate-300 line-through">
              {formatCurrency(price)}
            </p>
          )}
        </div>

        {/* Color Variants Dot Preview - Smaller */}
        <div className="flex gap-1 mt-2 mb-1">
          {variants?.reduce((acc, curr) => {
            if (!acc.find(v => v.colorCode === curr.colorCode)) acc.push(curr);
            return acc;
          }, []).slice(0, 4).map((v, i) => (
            <div 
              key={i} 
              className="w-2 h-2 rounded-full border border-slate-100 shadow-inner"
              style={{ backgroundColor: v.colorCode }}
              title={v.color}
            />
          ))}
          {variants?.length > 4 && <span className="text-[7px] font-bold text-slate-300">+{variants.length - 4}</span>}
        </div>
      </div>
    </div>
  )
}

export default ProductCard

