import api from './api'
import type { Plant, PlantFormData, PaginatedResponse, PlantFilters } from '../types/api'

// Get all plants with filters
export const getPlants = async (params?: PlantFilters): Promise<PaginatedResponse<Plant>> => {
  const response = await api.get<{ data: PaginatedResponse<Plant> }>('/plants/', { params })
  return response.data.data
}

// Get archived plants
export const getArchivedPlants = async (params?: PlantFilters): Promise<PaginatedResponse<Plant>> => {
  const response = await api.get<{ data: PaginatedResponse<Plant> }>('/plants/', {
    params: { ...params, is_active: false }
  })
  return response.data.data
}

// Get a single plant by ID
export const getPlant = async (id: number): Promise<Plant> => {
  const response = await api.get<{ data: Plant }>(`/plants/${id}`)
  return response.data.data
}

// Create a new plant
export const createPlant = async (data: PlantFormData): Promise<Plant> => {
  const response = await api.post<{ data: Plant }>('/plants/', data)
  return response.data.data
}

// Update a plant
export const updatePlant = async (id: number, data: Partial<PlantFormData>): Promise<Plant> => {
  const response = await api.patch<{ data: Plant }>(`/plants/${id}`, data)
  return response.data.data
}

// Archive a plant (soft delete)
export const archivePlant = async (id: number): Promise<void> => {
  await api.delete(`/plants/${id}`)
}

// Restore a plant from archive
export const restorePlant = async (id: number): Promise<Plant> => {
  const response = await api.post<{ data: Plant }>(`/plants/${id}/restore`, {})
  return response.data.data
}

// Permanently delete a plant
export const permanentDeletePlant = async (id: number): Promise<void> => {
  await api.delete(`/plants/${id}/permanent`)
}
