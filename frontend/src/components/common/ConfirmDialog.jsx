import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger'
}) => {
  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    primary: 'bg-primary-600 hover:bg-primary-700 text-white'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <p className="text-gray-600 text-center">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${variantClasses[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
