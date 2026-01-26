import { create } from 'zustand'
import type { HealthStatus, LocationType } from '../types/api'

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void

  // Room modal state
  roomModalVisible: boolean
  editingRoomId: number | null
  openRoomModal: (roomId?: number) => void
  closeRoomModal: () => void

  // Plant modal state
  plantModalVisible: boolean
  editingPlantId: number | null
  openPlantModal: (plantId?: number) => void
  closePlantModal: () => void

  // Plant filters
  plantFilters: {
    search: string
    roomId: number | null
    healthStatus: HealthStatus | null
  }
  setPlantFilters: (filters: Partial<UIState['plantFilters']>) => void
  clearPlantFilters: () => void

  // Room filter
  roomLocationFilter: LocationType | ''
  setRoomLocationFilter: (filter: LocationType | '') => void

  // Image modal state
  imageModalVisible: boolean
  imageModalPlantId: number | null
  openImageModal: (plantId: number) => void
  closeImageModal: () => void

  // Task filter
  taskFilter: 'today' | 'upcoming' | 'overdue'
  setTaskFilter: (filter: 'today' | 'upcoming' | 'overdue') => void
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar state
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Room modal state
  roomModalVisible: false,
  editingRoomId: null,
  openRoomModal: (roomId) => set({ roomModalVisible: true, editingRoomId: roomId ?? null }),
  closeRoomModal: () => set({ roomModalVisible: false, editingRoomId: null }),

  // Plant modal state
  plantModalVisible: false,
  editingPlantId: null,
  openPlantModal: (plantId) => set({ plantModalVisible: true, editingPlantId: plantId ?? null }),
  closePlantModal: () => set({ plantModalVisible: false, editingPlantId: null }),

  // Plant filters
  plantFilters: {
    search: '',
    roomId: null,
    healthStatus: null,
  },
  setPlantFilters: (filters) =>
    set((state) => ({
      plantFilters: { ...state.plantFilters, ...filters },
    })),
  clearPlantFilters: () =>
    set({
      plantFilters: {
        search: '',
        roomId: null,
        healthStatus: null,
      },
    }),

  // Room filter
  roomLocationFilter: '',
  setRoomLocationFilter: (filter) => set({ roomLocationFilter: filter }),

  // Image modal state
  imageModalVisible: false,
  imageModalPlantId: null,
  openImageModal: (plantId) => set({ imageModalVisible: true, imageModalPlantId: plantId }),
  closeImageModal: () => set({ imageModalVisible: false, imageModalPlantId: null }),

  // Task filter
  taskFilter: 'today',
  setTaskFilter: (filter) => set({ taskFilter: filter }),
}))
