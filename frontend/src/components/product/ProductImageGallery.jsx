import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { getImageUrl } from '../../utils/helpers'

const ProductImageGallery = ({ images = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })

  const displayImages =
    images.length > 0
      ? images.map(getImageUrl)
      : ['https://via.placeholder.com/600x800?text=No+Image']

  const selectedImage = displayImages[selectedIndex]

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[3/4] cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={selectedImage}
          alt="Product"
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed
              ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
              : {}
          }
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/600x800?text=No+Image'
          }}
        />

        {!isZoomed && (
          <div className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5">
            <ZoomIn className="w-4 h-4" />
          </div>
        )}

        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === selectedIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === selectedIndex
                  ? 'border-primary-600'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={img}
                alt={`Ảnh ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x120?text=Img'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductImageGallery
