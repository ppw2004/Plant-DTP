import api from './api'
import type { PlantConfig, PlantConfigFormData } from '../types/api'

// Get all configs for a plant
export const getPlantConfigs = async (plantId: number): Promise<PlantConfig[]> => {
  const response = await api.get<{ data: { items: PlantConfig[] } }>(`/plants/${plantId}/configs`)
  return response.data.data.items
}

// Get a single config by ID
export const getConfig = async (configId: number): Promise<PlantConfig> => {
  const response = await api.get<{ data: PlantConfig }>(`/configs/${configId}`)
  return response.data.data
}

// Create a new config
export const createConfig = async (plantId: number, data: PlantConfigFormData): Promise<PlantConfig> => {
  const response = await api.post<{ data: PlantConfig }>(`/plants/${plantId}/configs`, data)
  return response.data.data
}

// Update a config
export const updateConfig = async (
  configId: number,
  data: Partial<PlantConfigFormData>
): Promise<PlantConfig> => {
  const response = await api.patch<{ data: PlantConfig }>(`/configs/${configId}`, data)
  return response.data.data
}

// Delete a config
export const deleteConfig = async (configId: number): Promise<void> => {
  await api.delete(`/configs/${configId}`)
}

// Complete a task (mark as done)
export const completeTask = async (
  configId: number,
  note?: string
): Promise<PlantConfig> => {
  const response = await api.post<{ data: PlantConfig }>(`/configs/${configId}/complete`, null, {
    params: note ? { note } : undefined
  })
  return response.data.data
}
