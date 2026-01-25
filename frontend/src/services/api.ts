import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'

// camelCase to snake_case converter
function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (obj instanceof Date) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key) => {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      acc[snakeKey] = toSnakeCase(obj[key])
      return acc
    }, {})
  }

  return obj
}

// Create axios instance
export const api = axios.create({
  baseURL: 'http://localhost:12801/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Convert request data from camelCase to snake_case
    if (config.data && typeof config.data === 'object') {
      config.data = toSnakeCase(config.data)
    }

    // Convert URL parameters from camelCase to snake_case
    if (config.params && typeof config.params === 'object') {
      config.params = toSnakeCase(config.params)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // Handle error responses
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as any

      // Custom error messages based on error type
      if (data?.detail) {
        // Check for specific error types and show friendly messages
        const detail = data.detail

        // Foreign key violation (deleting referenced data)
        if (typeof detail === 'string' && detail.includes('foreign key constraint')) {
          if (detail.includes('plants')) {
            message.error('无法删除房间：该房间下还有植物，请先删除或移动这些植物')
          } else if (detail.includes('plant_configs')) {
            message.error('无法删除植物：该植物还有养护配置，请先删除配置')
          } else {
            message.error('无法删除：该数据还被其他记录引用，请先删除关联数据')
          }
          return Promise.reject(error)
        }

        // Validation error
        if (data.error?.code === 'VALIDATION_ERROR') {
          message.error(data.detail || '请检查输入数据')
          return Promise.reject(error)
        }

        // Default backend message
        message.error(detail)
      } else if (status >= 500) {
        message.error('服务器错误，请稍后重试')
      } else if (status === 404) {
        message.error('请求的资源不存在')
      } else if (status === 403) {
        message.error('没有权限执行此操作')
      } else if (status === 401) {
        message.error('未授权，请重新登录')
      } else {
        message.error('请求失败，请稍后重试')
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络设置')
    } else {
      message.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default api
