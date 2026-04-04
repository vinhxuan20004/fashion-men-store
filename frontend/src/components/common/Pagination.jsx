import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-20">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-12 h-12 rounded-2xl border-2 border-slate-100 bg-white text-slate-400 hover:border-primary-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-100 transition-all duration-300 active:scale-90 shadow-sm"
        aria-label="Trang trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="w-12 h-12 flex items-center justify-center text-slate-300 font-black tracking-widest">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`w-12 h-12 rounded-2xl border-2 text-xs font-black transition-all duration-300 active:scale-90 ${
                  currentPage === page
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-primary-400 hover:text-primary-600 shadow-sm'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-12 h-12 rounded-2xl border-2 border-slate-100 bg-white text-slate-400 hover:border-primary-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-100 transition-all duration-300 active:scale-90 shadow-sm"
        aria-label="Trang sau"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

export default Pagination

