import api from './api'
import type { Plant, PlantFormData, PaginatedResponse, PlantFilters } from '../types/api'

// Get all plants with filters
export const getPlants = async (params?: PlantFilters): Promise<PaginatedResponse<Plant>> => {
  const response = await api.get<{ data: PaginatedResponse<Plant> }>('/plants/', { params })
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

// Delete a plant
export const deletePlant = async (id: number): Promise<void> => {
  await api.delete(`/plants/${id}`)
}
