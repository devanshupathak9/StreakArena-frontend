import { create } from 'zustand'

let toastIdCounter = 0

const useUiStore = create((set) => ({
  toasts: [],
  modals: {},

  addToast: (toast) => {
    const id = ++toastIdCounter
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  openModal: (key) => {
    set((state) => ({
      modals: { ...state.modals, [key]: true },
    }))
  },

  closeModal: (key) => {
    set((state) => ({
      modals: { ...state.modals, [key]: false },
    }))
  },
}))

export default useUiStore
