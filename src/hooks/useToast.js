import useUiStore from '../store/uiStore'

const useToast = () => {
  const { addToast, removeToast } = useUiStore()

  const showToast = (message, type = 'info') => {
    return addToast({ message, type })
  }

  const showSuccess = (message) => showToast(message, 'success')
  const showError = (message) => showToast(message, 'error')
  const showInfo = (message) => showToast(message, 'info')
  const showWarning = (message) => showToast(message, 'warning')

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast,
  }
}

export default useToast
