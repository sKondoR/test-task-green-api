import { create } from 'zustand'

export interface ToastItem {
  id: number
  text: string
}

interface ToastState {
  toasts: ToastItem[]
  dismiss: (id: number) => void
}

const TOAST_DURATION_MS = 3000
let nextId = 1

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

/** Показывает короткое уведомление внизу экрана. */
export function showToast(text: string): void {
  const id = nextId++
  useToastStore.setState((state) => ({ toasts: [...state.toasts, { id, text }] }))
  setTimeout(() => useToastStore.getState().dismiss(id), TOAST_DURATION_MS)
}
