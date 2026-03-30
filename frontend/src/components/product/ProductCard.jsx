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
      className="group relative flex flex-col bg-white rounded-2xl transition-all duration-500 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-100 group-hover:shadow-2xl group-hover:shadow-slate-200/50 transition-all duration-500">
        <Link to={`/products/${slug}`} className="block h-full w-full">
          <img
            src={isHovered ? secondImage : mainImage}
            alt={name}
            className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isHovered ? 'scale-110' : 'scale-100'}`}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=500&q=80'
            }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <div className="bg-primary-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-primary-600/30 uppercase tracking-wider">
              SALE {discountPercent}%
            </div>
          )}
          {product.isFeatured && (
            <div className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-slate-900/30 uppercase tracking-wider">
              NEW
            </div>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-primary-600 hover:text-white transition-all shadow-md active:scale-90">
            <Heart className="w-4 h-4" />
          </button>
          <Link to={`/products/${slug}`} className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-primary-600 hover:text-white transition-all shadow-md active:scale-90">
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Add to Cart Button Overlay with Size Selection */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-all duration-500 z-10">
          {variants && variants.length > 0 ? (
            <div className="flex flex-col gap-2">
              {/* Quick Size Pick (Only if multiple sizes) */}
              <div className="flex flex-wrap justify-center gap-1.5 p-2 bg-white/90 backdrop-blur-md rounded-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                {variants.slice(0, 5).map((v) => (
                  <button
                    key={v._id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (v.stock > 0) addToCart(_id, v._id, 1, product);
                    }}
                    disabled={v.stock === 0}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center ${
                      v.stock > 0 
                        ? 'bg-slate-50 text-slate-900 hover:bg-primary-600 hover:text-white' 
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(e);
                }}
                disabled={isAdding}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    CHỌN SIZE NHANH
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="w-full bg-slate-900/90 backdrop-blur-sm text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest text-center shadow-xl">
              HẾT HÀNG
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 px-1">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {brand || 'Men\'s Fashion'}
          </p>
          {averageRating > 0 && (
            <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
              <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-bold text-slate-700">{averageRating}</span>
            </div>
          )}
        </div>

        <Link to={`/products/${slug}`} className="block group/title">
          <h3 className="font-display font-bold text-slate-900 text-sm mb-2 line-clamp-1 group-hover/title:text-primary-600 transition-colors leading-tight uppercase tracking-tight">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-3">
          <p className="font-display font-black text-slate-900">
            {formatCurrency(displayPrice)}
          </p>
          {hasDiscount && (
            <p className="text-xs text-slate-400 line-through font-medium">
              {formatCurrency(price)}
            </p>
          )}
        </div>
        
        {/* Color Variants Dot Preview */}
        <div className="flex gap-1.5 mt-3">
          {variants?.reduce((acc, curr) => {
            if (!acc.find(v => v.colorCode === curr.colorCode)) acc.push(curr);
            return acc;
          }, []).slice(0, 4).map((v, i) => (
            <div 
              key={i} 
              className="w-3 h-3 rounded-full border border-slate-200 ring-2 ring-transparent group-hover:ring-slate-100 transition-all"
              style={{ backgroundColor: v.colorCode }}
              title={v.color}
            />
          ))}
          {variants?.length > 4 && <span className="text-[8px] font-bold text-slate-400">+{variants.length - 4}</span>}
        </div>
      </div>
    </div>
  )
}

export default ProductCard

