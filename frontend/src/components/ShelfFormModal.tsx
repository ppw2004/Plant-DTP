import { Modal, Form, InputNumber, Input } from 'antd'
import { useEffect } from 'react'

const { TextArea } = Input

interface ShelfFormModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description: string; capacity: number }) => Promise<void>
  initialValue?: { name: string; description: string; capacity: number }
}

const ShelfFormModal = ({ visible, onClose, onSubmit, initialValue }: ShelfFormModalProps) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      if (initialValue) {
        form.setFieldsValue(initialValue)
      } else {
        form.resetFields()
      }
    }
  }, [visible, initialValue, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await onSubmit(values)
      form.resetFields()
      onClose()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <Modal
      title={initialValue ? '编辑花架' : '创建花架'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="花架名称"
          name="name"
          rules={[{ required: true, message: '请输入花架名称' }]}
        >
          <Input placeholder="例如：客厅-窗边花架" maxLength={100} />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <TextArea placeholder="花架的位置、光照等描述" rows={3} maxLength={500} />
        </Form.Item>

        <Form.Item
          label="容量"
          name="capacity"
          rules={[{ required: true, message: '请输入容量' }]}
          initialValue={10}
        >
          <InputNumber min={1} max={100} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ShelfFormModal
