import React from 'react'
import { Star } from 'lucide-react'

const StarRating = ({ rating = 0, maxStars = 5, size = 'sm', showValue = false }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const stars = []
  for (let i = 1; i <= maxStars; i++) {
    const filled = i <= Math.floor(rating)
    const half = !filled && i - 0.5 <= rating
    stars.push(
      <span key={i} className="relative inline-block">
        <Star
          className={`${sizeClasses[size]} text-gray-200 fill-gray-200`}
        />
        {(filled || half) && (
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: filled ? '100%' : '50%' }}
          >
            <Star
              className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`}
            />
          </span>
        )}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">{stars}</div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}

export default StarRating
