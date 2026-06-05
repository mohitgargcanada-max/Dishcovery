import { create } from 'zustand'

export const useUIStore = create((set) => ({
  toasts: [],
  sidebarOpen: false,

  addToast: (message, type = 'info') => {
    const id = Date.now()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3500)
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
