import { Modal, Form, Select, InputNumber, Switch, Button, Input } from 'antd'
import { useEffect } from 'react'
import { useTaskTypes } from '../hooks/useTaskTypes'
import type { PlantConfig, PlantConfigFormData, TaskType } from '../types/api'

interface PlantConfigModalProps {
  visible: boolean
  plantId: number
  plantName: string
  config?: PlantConfig
  onCancel: () => void
  onOk: (data: PlantConfigFormData) => void
  loading?: boolean
}

const PlantConfigModal = ({
  visible,
  plantName,
  config,
  onCancel,
  onOk,
  loading,
}: PlantConfigModalProps) => {
  const [form] = Form.useForm()
  const { data: taskTypes, isLoading: taskTypesLoading } = useTaskTypes()

  const isEdit = !!config

  useEffect(() => {
    if (visible) {
      if (config) {
        form.setFieldsValue({
          taskTypeId: config.taskTypeId,
          intervalDays: config.intervalDays,
          windowPeriod: config.windowPeriod,
          isActive: config.isActive,
          season: config.season,
          notes: config.notes,
        })
      } else {
        form.resetFields()
      }
    }
  }, [visible, config, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onOk(values)
    } catch (error) {
      // Form validation failed
    }
  }

  const handleTaskTypeChange = (taskTypeId: number) => {
    const taskType = taskTypes?.find((tt) => tt.id === taskTypeId)
    if (taskType && !isEdit) {
      form.setFieldsValue({
        intervalDays: taskType.defaultInterval,
      })
    }
  }

  return (
    <Modal
      title={isEdit ? '编辑养护配置' : '添加养护配置'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk} loading={loading}>
          {isEdit ? '保存' : '添加'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: '24px' }}>
        <Form.Item
          label="植物名称"
          style={{ marginBottom: '8px' }}
        >
          <span>{plantName}</span>
        </Form.Item>

        <Form.Item
          name="taskTypeId"
          label="任务类型"
          rules={[{ required: true, message: '请选择任务类型' }]}
        >
          <Select
            placeholder="请选择任务类型"
            loading={taskTypesLoading}
            onChange={handleTaskTypeChange}
            options={taskTypes?.map((tt: TaskType) => ({
              label: `${tt.icon} ${tt.name}`,
              value: tt.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="intervalDays"
          label="间隔天数"
          rules={[
            { required: true, message: '请输入间隔天数' },
            { type: 'number', min: 1, max: 365, message: '间隔天数必须在 1-365 之间' },
          ]}
          extra="每隔多少天执行一次此任务"
        >
          <InputNumber
            min={1}
            max={365}
            style={{ width: '100%' }}
            placeholder="例如：7 表示每 7 天一次"
          />
        </Form.Item>

        <Form.Item
          name="windowPeriod"
          label="窗口期（天）"
          rules={[{ type: 'number', min: 0, max: 30, message: '窗口期必须在 0-30 之间' }]}
          initialValue={0}
          extra="允许的时间范围，例如窗口期2天表示±1天都可以执行"
          tooltip="0表示严格按照间隔天数，2天表示到期日前后各1天（共3天窗口期）"
        >
          <InputNumber
            min={0}
            max={30}
            style={{ width: '100%' }}
            placeholder="例如：2 表示前后各1天"
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="启用状态"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>

        <Form.Item
          name="season"
          label="季节"
          extra="可选，适用于特定季节的养护任务"
        >
          <Select
            placeholder="选择季节（可选）"
            allowClear
            options={[
              { label: '春季', value: 'spring' },
              { label: '夏季', value: 'summer' },
              { label: '秋季', value: 'autumn' },
              { label: '冬季', value: 'winter' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="备注"
          extra="可选，添加额外的说明"
        >
          <Input.TextArea
            placeholder="例如：施肥时使用液体肥料，稀释后使用"
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PlantConfigModal
