import { useEffect } from 'react'
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd'
import dayjs from 'dayjs'
import { useCreatePlant, useUpdatePlant, usePlant } from '../hooks/usePlants'
import { useRooms } from '../hooks/useRooms'
import { useUIStore } from '../store/uiStore'
import type { PlantFormData } from '../types/api'

const HEALTH_STATUS_OPTIONS = [
  { label: '健康', value: 'healthy' },
  { label: '需要关注', value: 'needs_attention' },
  { label: '紧急', value: 'critical' },
]

const PlantFormModal = () => {
  const [form] = Form.useForm()
  const { plantModalVisible, editingPlantId, closePlantModal } = useUIStore()

  const createPlant = useCreatePlant()
  const updatePlant = useUpdatePlant()
  const { data: plant } = usePlant(editingPlantId!)
  const { data: roomsData } = useRooms({ pageSize: 100 })

  const rooms = roomsData?.items || []
  const isEdit = !!editingPlantId

  useEffect(() => {
    if (plantModalVisible) {
      if (plant && isEdit) {
        form.setFieldsValue({
          name: plant.name,
          scientificName: plant.scientificName || '',
          description: plant.description || '',
          roomId: plant.roomId,
          purchaseDate: plant.purchaseDate ? dayjs(plant.purchaseDate) : null,
          healthStatus: plant.healthStatus,
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          healthStatus: 'healthy',
        })
      }
    }
  }, [plantModalVisible, plant, isEdit, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data: PlantFormData = {
        ...values,
        purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : undefined,
      }

      if (isEdit && editingPlantId) {
        updatePlant.mutate({ id: editingPlantId, data })
      } else {
        createPlant.mutate(data)
      }

      closePlantModal()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    closePlantModal()
  }

  const roomOptions = rooms.map((room) => ({
    label: `${room.icon} ${room.name}`,
    value: room.id,
  }))

  return (
    <Modal
      title={isEdit ? '编辑植物' : '添加植物'}
      open={plantModalVisible}
      onCancel={handleCancel}
      footer={
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={createPlant.isPending || updatePlant.isPending}
          >
            {isEdit ? '更新' : '创建'}
          </Button>
        </Space>
      }
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="植物名称"
          name="name"
          rules={[{ required: true, message: '请输入植物名称' }]}
        >
          <Input placeholder="例如：龟背竹" />
        </Form.Item>

        <Form.Item label="学名" name="scientificName">
          <Input placeholder="例如：Monstera deliciosa（可选）" />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input.TextArea rows={3} placeholder="植物的描述信息（可选）" />
        </Form.Item>

        <Form.Item
          label="所属房间"
          name="roomId"
          rules={[{ required: true, message: '请选择房间' }]}
        >
          <Select
            options={roomOptions}
            placeholder="选择房间"
            notFoundContent={rooms.length === 0 ? '暂无房间，请先创建房间' : null}
          />
        </Form.Item>

        <Form.Item label="购买日期" name="purchaseDate">
          <DatePicker style={{ width: '100%' }} placeholder="选择购买日期（可选）" />
        </Form.Item>

        <Form.Item
          label="健康状态"
          name="healthStatus"
          rules={[{ required: true, message: '请选择健康状态' }]}
        >
          <Select options={HEALTH_STATUS_OPTIONS} placeholder="选择健康状态" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PlantFormModal
