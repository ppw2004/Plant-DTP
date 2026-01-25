import { useEffect } from 'react'
import { Modal, Form, Input, Select, ColorPicker, Button, Space } from 'antd'
import { useCreateRoom, useUpdateRoom, useRoom } from '../hooks/useRooms'
import { useUIStore } from '../store/uiStore'
import type { RoomFormData } from '../types/api'

const LOCATION_OPTIONS = [
  { label: '室内', value: 'indoor' },
  { label: '室外', value: 'outdoor' },
  { label: '阳台', value: 'balcony' },
  { label: '温室', value: 'greenhouse' },
]

const ICON_OPTIONS = [
  { label: '🛋️ 客厅', value: '🛋️' },
  { label: '🛏️ 卧室', value: '🛏️' },
  { label: '🍳 厨房', value: '🍳' },
  { label: '🚿 浴室', value: '🚿' },
  { label: '📚 书房', value: '📚' },
  { label: '☀️ 阳台', value: '☀️' },
  { label: '🌿 花园', value: '🌿' },
  { label: '🏠 其他', value: '🏠' },
]

const RoomFormModal = () => {
  const [form] = Form.useForm()
  const { roomModalVisible, editingRoomId, closeRoomModal } = useUIStore()

  const createRoom = useCreateRoom()
  const updateRoom = useUpdateRoom()
  const { data: room } = useRoom(editingRoomId!)

  const isEdit = !!editingRoomId

  useEffect(() => {
    if (roomModalVisible) {
      if (room && isEdit) {
        form.setFieldsValue({
          name: room.name,
          description: room.description || '',
          locationType: room.locationType,
          icon: room.icon,
          color: room.color,
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          locationType: 'indoor',
          icon: '🏠',
          color: '#1890ff',
        })
      }
    }
  }, [roomModalVisible, room, isEdit, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const colorHex = typeof values.color === 'string' ? values.color : values.color?.toHexString()
      const data: RoomFormData = {
        ...values,
        color: colorHex || '#1890ff',
      }

      if (isEdit && editingRoomId) {
        updateRoom.mutate({ id: editingRoomId, data })
      } else {
        createRoom.mutate(data)
      }

      closeRoomModal()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    closeRoomModal()
  }

  return (
    <Modal
      title={isEdit ? '编辑房间' : '添加房间'}
      open={roomModalVisible}
      onCancel={handleCancel}
      footer={
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={createRoom.isPending || updateRoom.isPending}
          >
            {isEdit ? '更新' : '创建'}
          </Button>
        </Space>
      }
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="房间名称"
          name="name"
          rules={[{ required: true, message: '请输入房间名称' }]}
        >
          <Input placeholder="例如：客厅阳台" />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input.TextArea rows={3} placeholder="房间的描述信息（可选）" />
        </Form.Item>

        <Form.Item
          label="位置类型"
          name="locationType"
          rules={[{ required: true, message: '请选择位置类型' }]}
        >
          <Select options={LOCATION_OPTIONS} placeholder="选择位置类型" />
        </Form.Item>

        <Form.Item
          label="图标"
          name="icon"
          rules={[{ required: true, message: '请选择图标' }]}
        >
          <Select options={ICON_OPTIONS} placeholder="选择图标" />
        </Form.Item>

        <Form.Item
          label="颜色"
          name="color"
          rules={[{ required: true, message: '请选择颜色' }]}
        >
          <ColorPicker showText format="hex" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RoomFormModal
