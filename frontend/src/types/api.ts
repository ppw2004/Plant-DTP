// ==================== Base Types ====================

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ==================== Room Types ====================

export type LocationType = 'indoor' | 'outdoor' | 'balcony' | 'greenhouse'

export interface Room {
  id: number
  name: string
  description: string | null
  locationType: LocationType
  icon: string
  color: string
  plantCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface RoomFormData {
  name: string
  description?: string
  locationType: LocationType
  icon?: string
  color?: string
  sortOrder?: number
}

export interface RoomStats {
  totalRooms: number
  roomCountsByType: Record<string, number>
  roomsWithMostPlants: Array<{ id: number; name: string; plantCount: number }>
}

// ==================== Shelf Types ====================

export interface PlantShelf {
  id: number
  roomId: number
  name: string
  description: string | null
  sortOrder: number
  capacity: number
  isActive: boolean
  isDefault: boolean
  plantCount?: number
  plants?: Plant[]
}

export interface PlantShelfFormData {
  name: string
  description?: string
  sortOrder?: number
  capacity?: number
}

// ==================== Plant Types ====================

export type HealthStatus = 'healthy' | 'needs_attention' | 'critical'

export interface Plant {
  id: number
  name: string
  scientificName: string | null
  description: string | null
  roomId: number
  roomName?: string
  shelfId?: number | null
  shelfOrder: number
  purchaseDate: string | null
  healthStatus: HealthStatus
  imageCount?: number
  primaryImage?: PlantImage
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PlantFormData {
  name: string
  scientificName?: string
  description?: string
  roomId: number
  purchaseDate?: string
  healthStatus: HealthStatus
}

export interface PlantFilters extends PaginationParams {
  roomId?: number
  healthStatus?: HealthStatus
  search?: string
}

// ==================== PlantImage Types ====================

export interface PlantImage {
  id: number
  plantId: number
  url: string
  thumbnailUrl: string | null
  caption: string | null
  isPrimary: boolean
  fileSize: number | null
  width: number | null
  height: number | null
  takenAt: string | null
  sortOrder: number
  createdAt?: string
}

export interface PlantImageFormData {
  url: string
  caption?: string
  isPrimary?: boolean
  takenAt?: string
}

export interface ImageUploadFormData {
  file: File
  caption?: string
  isPrimary?: boolean
  takenAt?: string
}

// ==================== Task Types ====================

export interface PlantTask {
  id: number
  plantId: number
  plantName?: string
  plant?: Plant
  configId: number
  taskType: string
  dueDate: string
  status: 'pending' | 'completed' | 'skipped'
  completedAt: string | null
  notes: string | null
  createdAt?: string
}

// ==================== TaskType Types ====================

export interface TaskType {
  id: number
  name: string
  code: string
  icon: string | null
  description: string | null
  defaultInterval: number
  isSystem: boolean
  sortOrder: number
}

// ==================== Config Types ====================

export interface PlantConfig {
  id: number
  plantId: number
  taskTypeId: number
  taskTypeName?: string
  taskTypeIcon?: string
  intervalDays: number
  windowPeriod: number
  lastDoneAt: string | null
  nextDueAt: string | null
  isActive: boolean
  season: string | null
  notes: string | null
  createdAt?: string
  updatedAt?: string
}

export interface PlantConfigFormData {
  taskTypeId: number
  intervalDays: number
  windowPeriod?: number
  isActive?: boolean
  season?: string
  notes?: string
}

export interface TaskListResponse {
  todayTasks: PlantTask[]
  upcomingTasks: PlantTask[]
  overdueTasks: PlantTask[]
}

// ==================== Dashboard Types ====================

export interface DashboardStats {
  totalRooms: number
  totalPlants: number
  todayTasksCount: number
  overdueTasksCount: number
  upcomingTasksCount: number
}
