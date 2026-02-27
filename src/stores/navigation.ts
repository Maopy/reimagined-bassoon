import { create } from 'zustand'

interface NavigationState {
  currentRoute: string
  setCurrentRoute: (route: string) => void
}

export const useNavigationStore = create<NavigationState>(set => ({
  currentRoute: 'home',
  setCurrentRoute: (route: string) => set({ currentRoute: route })
}))
