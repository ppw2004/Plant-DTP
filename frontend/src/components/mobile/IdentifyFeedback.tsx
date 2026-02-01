import { useState } from 'react'
import { Modal, Button, Input, Select, Space, Toast } from 'antd-mobile'
import { CheckOutline, CloseOutline, SkipOutline } from 'antd-mobile-icons'
import { useSubmitFeedback } from '../../hooks/useIdentifications'
import { useCreatePlantFromIdentification } from '../../hooks/useIdentifications'
import { useRooms } from '../../hooks/useRooms'
import type { PlantPrediction, IdentificationFeedbackData } from '../../types/api'

interface IdentifyFeedbackProps {
  visible: boolean
  onClose: () => void
  identificationId: number
  prediction: PlantPrediction
  onCreatePlant?: () => void
}

/**
 * 识别反馈组件
 */
export default function IdentifyFeedback({
  visible,
  onClose,
  identificationId,
  prediction,
  onCreatePlant,
}: IdentifyFeedbackProps) {
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | 'skipped' | null>(null)
  const [correctName, setCorrectName] = useState('')
  const [roomId, setRoomId] = useState<number | undefined>()

  const { data: roomsData } = useRooms()
  const submitFeedbackMutation = useSubmitFeedback()
  const createPlantMutation = useCreatePlantFromIdentification()

  const rooms = roomsData?.items || []

  const handleFeedbackSubmit = async () => {
    if (!feedbackType) {
      Toast.show('请选择反馈类型')
      return
    }

    const feedbackData: IdentificationFeedbackData = {
      feedback: feedbackType,
    }

    // 如果选择错误，可以填写正确名称
    if (feedbackType === 'incorrect' && correctName) {
      feedbackData.correctName = correctName
    }

    try {
      await submitFeedbackMutation.mutateAsync({
        id: identificationId,
        feedback: feedbackData,
      })

      // 如果是正确反馈且选择了房间，直接创建植物
      if (feedbackType === 'correct' && roomId) {
        await createPlantMutation.mutateAsync({
          id: identificationId,
          data: {
            roomId,
            healthStatus: 'healthy',
          },
        })

        onCreatePlant?.()
        onClose()
        return
      }

      onClose()
    } catch (error) {
      console.error('反馈提交失败:', error)
    }
  }

  const handleSkip = () => {
    setFeedbackType('skipped')
    handleFeedbackSubmit()
  }

  return (
    <Modal
      visible={visible}
      content={
        <div style={{ padding: '16px 0' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
            识别结果反馈
          </div>

          {/* 当前识别结果 */}
          <div
            style={{
              padding: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600 }}>{prediction.name}</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
              置信度: {Math.round(prediction.confidence * 100)}%
            </div>
          </div>

          {!feedbackType ? (
            <>
              {/* 反馈按钮 */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  block
                  color="success"
                  size="large"
                  onClick={() => setFeedbackType('correct')}
                >
                  <CheckOutline /> 识别正确
                </Button>

                <Button
                  block
                  color="warning"
                  size="large"
                  onClick={() => setFeedbackType('incorrect')}
                >
                  <CloseOutline /> 识别错误
                </Button>

                <Button
                  block
                  color="default"
                  size="large"
                  onClick={handleSkip}
                >
                  <SkipOutline /> 跳过
                </Button>
              </Space>
            </>
          ) : (
            <>
              {/* 详细反馈表单 */}
              {feedbackType === 'correct' && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>
                    是否要将此识别结果添加到植物库？
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 14, marginBottom: 8, color: '#333' }}>
                      选择房间 <span style={{ color: '#ff4d4f' }}>*</span>
                    </div>
                    <Select
                      placeholder="请选择房间"
                      value={roomId}
                      onChange={(value: string | null) => setRoomId(value ? Number(value) : undefined)}
                      options={rooms.map((room) => ({
                        label: room.name,
                        value: String(room.id),
                      }))}
                    />
                  </div>

                  <Button
                    block
                    color="primary"
                    disabled={!roomId}
                    loading={createPlantMutation.isPending}
                    onClick={handleFeedbackSubmit}
                  >
                    创建植物
                  </Button>

                  <Button
                    block
                    color="default"
                    fill="outline"
                    style={{ marginTop: 8 }}
                    onClick={handleFeedbackSubmit}
                  >
                    仅提交反馈
                  </Button>
                </div>
              )}

              {feedbackType === 'incorrect' && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>
                    请告诉我们正确的植物名称
                  </div>

                  <Input
                    placeholder="输入正确的植物名称"
                    value={correctName}
                    onChange={(value: string) => setCorrectName(value)}
                    style={{ marginBottom: 16 }}
                  />

                  <Button
                    block
                    color="primary"
                    loading={submitFeedbackMutation.isPending}
                    onClick={handleFeedbackSubmit}
                  >
                    提交反馈
                  </Button>
                </div>
              )}
            </>
          )}

          {/* 返回按钮 */}
          {feedbackType && (
            <Button
              block
              color="default"
              fill="outline"
              style={{ marginTop: 12 }}
              onClick={() => setFeedbackType(null)}
            >
              返回
            </Button>
          )}
        </div>
      }
      closeOnMaskClick
      onClose={onClose}
    />
  )
}
