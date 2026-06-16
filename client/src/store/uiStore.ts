import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  modalOpen: string | null
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>
  toggleSidebar: () => void
  openModal: (id: string) => void
  closeModal: () => void
  addToast: (message: string, type: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  modalOpen: null,
  toasts: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  openModal: (id) => set({ modalOpen: id }),

  closeModal: () => set({ modalOpen: null }),

  addToast: (message, type) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 5000)
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
