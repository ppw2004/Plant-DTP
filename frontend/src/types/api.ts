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

// ==================== Suggestion Types ====================

export type SuggestionCategory = '功能请求' | '问题反馈' | '改进建议' | '其他'
export type SuggestionStatus = 'pending' | 'reviewing' | 'implemented' | 'rejected'
export type SuggestionPriority = 'low' | 'medium' | 'high'

export interface Suggestion {
  id: number
  title: string
  content: string
  category: SuggestionCategory
  status: SuggestionStatus
  priority: SuggestionPriority
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SuggestionFormData {
  title: string
  content: string
  category?: SuggestionCategory
  priority?: SuggestionPriority
}

export interface SuggestionFilters {
  skip?: number
  limit?: number
}

// ==================== Plant Identification Types ====================

export interface PlantPrediction {
  rank: number
  name: string
  scientificName?: string
  confidence: number
  baikeUrl?: string
  description?: string
}

export interface IdentificationResult {
  requestId: string
  predictions: PlantPrediction[]
  processingTime: number
  cached: boolean
  identificationId: number
}

export interface Identification {
  id: number
  imageUrl: string
  imageHash?: string
  apiProvider: string
  requestId?: string
  predictions: PlantPrediction[]
  selectedPlantId?: number
  feedback?: 'correct' | 'incorrect' | 'skipped'
  correctName?: string
  processingTime?: number
  cached: boolean
  createdAt: string
  updatedAt: string
  selectedPlant?: {
    id: number
    name: string
    primaryImageUrl?: string
  }
}

export interface IdentificationListResponse {
  items: Identification[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IdentificationFilters {
  page?: number
  limit?: number
  userId?: number
  plantId?: number
}

export interface IdentificationFeedbackData {
  feedback: 'correct' | 'incorrect' | 'skipped'
  plantId?: number
  correctName?: string
}

export interface CreatePlantFromIdentificationData {
  roomId: number
  shelfId?: number
  purchaseDate?: string
  healthStatus?: 'healthy' | 'good' | 'fair' | 'poor' | 'critical'
}
