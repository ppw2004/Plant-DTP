import api from './api'
import type {
  IdentificationResult,
  Identification,
  IdentificationListResponse,
  IdentificationFilters,
  IdentificationFeedbackData,
  CreatePlantFromIdentificationData,
  Plant
} from '../types/api'

/**
 * 识别植物
 * @param file 图片文件
 * @param includeDetails 是否包含详细信息（百科）
 * @returns 识别结果
 */
export const identifyPlant = async (
  file: File,
  includeDetails: boolean = true
): Promise<IdentificationResult> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('includeDetails', String(includeDetails))

  const response = await api.post<{ data: IdentificationResult }>(
    '/identify',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data.data
}

/**
 * 获取识别历史列表
 * @param filters 筛选条件
 * @returns 识别历史列表
 */
export const getIdentifications = async (
  filters?: IdentificationFilters
): Promise<IdentificationListResponse> => {
  const response = await api.get<{ data: IdentificationListResponse }>(
    '/identifications',
    { params: filters }
  )

  return response.data.data
}

/**
 * 获取单个识别记录详情
 * @param id 识别记录ID
 * @returns 识别记录详情
 */
export const getIdentification = async (
  id: number
): Promise<Identification> => {
  const response = await api.get<{ data: Identification }>(
    `/identifications/${id}`
  )

  return response.data.data
}

/**
 * 提交识别反馈
 * @param id 识别记录ID
 * @param feedback 反馈数据
 * @returns 更新后的识别记录
 */
export const submitIdentificationFeedback = async (
  id: number,
  feedback: IdentificationFeedbackData
): Promise<Identification> => {
  const response = await api.post<{ data: Identification }>(
    `/identifications/${id}/feedback`,
    feedback
  )

  return response.data.data
}

/**
 * 基于识别结果创建植物
 * @param id 识别记录ID
 * @param data 创建植物数据
 * @returns 创建的植物
 */
export const createPlantFromIdentification = async (
  id: number,
  data: CreatePlantFromIdentificationData
): Promise<Plant> => {
  const response = await api.post<{ data: Plant }>(
    `/identifications/${id}/create-plant`,
    data
  )

  return response.data.data
}

/**
 * 删除识别记录
 * @param id 识别记录ID
 */
export const deleteIdentification = async (id: number): Promise<void> => {
  await api.delete(`/identifications/${id}`)
}
