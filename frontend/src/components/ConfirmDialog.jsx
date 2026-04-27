import Modal from './Modal'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Yes, Continue',
  cancelText = 'Cancel',
  danger = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 text-sm">{message}</p>

      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm()
            onClose()
          }}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
            danger
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}