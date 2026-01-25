import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import * as roomService from '../services/roomService'
import type { RoomFormData, PaginationParams } from '../types/api'

// Get all rooms
export const useRooms = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['rooms', params],
    queryFn: () => roomService.getRooms(params),
  })
}

// Get room statistics
export const useRoomStats = () => {
  return useQuery({
    queryKey: ['roomStats'],
    queryFn: () => roomService.getRoomStats(),
  })
}

// Get single room
export const useRoom = (id: number) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => roomService.getRoom(id),
    enabled: !!id,
  })
}

// Create room
export const useCreateRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RoomFormData) => roomService.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      queryClient.invalidateQueries({ queryKey: ['roomStats'] })
      message.success('房间创建成功')
    },
  })
}

// Update room
export const useUpdateRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoomFormData> }) =>
      roomService.updateRoom(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      queryClient.invalidateQueries({ queryKey: ['room', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['roomStats'] })
      message.success('房间更新成功')
    },
  })
}

// Delete room
export const useDeleteRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => roomService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      queryClient.invalidateQueries({ queryKey: ['roomStats'] })
      message.success('房间删除成功')
    },
  })
}
