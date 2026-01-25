import api from './api'
import type { Room, RoomFormData, RoomStats, PaginatedResponse, PaginationParams } from '../types/api'

// Get all rooms with pagination
export const getRooms = async (params?: PaginationParams): Promise<PaginatedResponse<Room>> => {
  const response = await api.get<{ data: PaginatedResponse<Room> }>('/rooms/', { params })
  return response.data.data
}

// Get a single room by ID
export const getRoom = async (id: number): Promise<Room> => {
  const response = await api.get<{ data: Room }>(`/rooms/${id}`)
  return response.data.data
}

// Create a new room
export const createRoom = async (data: RoomFormData): Promise<Room> => {
  const response = await api.post<{ data: Room }>('/rooms/', data)
  return response.data.data
}

// Update a room
export const updateRoom = async (id: number, data: Partial<RoomFormData>): Promise<Room> => {
  const response = await api.patch<{ data: Room }>(`/rooms/${id}`, data)
  return response.data.data
}

// Delete a room
export const deleteRoom = async (id: number): Promise<void> => {
  await api.delete(`/rooms/${id}`)
}

// Get room statistics
export const getRoomStats = async (): Promise<RoomStats> => {
  const response = await api.get<{ data: RoomStats }>('/rooms/stats')
  return response.data.data
}
