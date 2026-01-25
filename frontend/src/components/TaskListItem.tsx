import { Card, Tag, Button, Space, Progress, Image, Popconfirm } from 'antd'
import { CheckOutlined, CalendarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import type { PlantTask } from '../types/api'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface TaskListItemProps {
  task: PlantTask
  onComplete: (taskId: number) => void
}

const taskTypeMap: Record<string, { text: string; color: string }> = {
  watering: { text: '浇水', color: 'blue' },
  fertilizing: { text: '施肥', color: 'green' },
  pruning: { text: '修剪', color: 'orange' },
  repotting: { text: '换盆', color: 'purple' },
  pest_control: { text: '病虫害防治', color: 'red' },
  other: { text: '其他', color: 'default' },
}

const TaskListItem = ({ task, onComplete }: TaskListItemProps) => {
  const taskTypeInfo = taskTypeMap[task.taskType] || { text: task.taskType, color: 'default' }

  const getUrgency = () => {
    const now = dayjs()
    const dueDate = dayjs(task.dueDate)
    const daysDiff = dueDate.diff(now, 'day')

    if (daysDiff < 0) {
      return { text: '逾期', color: 'error', progress: 100 }
    } else if (daysDiff === 0) {
      return { text: '今日到期', color: 'warning', progress: 90 }
    } else if (daysDiff <= 3) {
      return { text: '即将到期', color: 'processing', progress: 70 }
    } else {
      return { text: '正常', color: 'default', progress: 30 }
    }
  }

  const urgency = getUrgency()
  const dueDate = dayjs(task.dueDate)

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title={
        <Space>
          <Tag color={taskTypeInfo.color}>{taskTypeInfo.text}</Tag>
          <span>{task.plantName || `植物 #${task.plantId}`}</span>
        </Space>
      }
      extra={
        <Space>
          <Tag color={urgency.color}>{urgency.text}</Tag>
        </Space>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {task.plant?.primaryImage && (
          <Image
            src={task.plant.primaryImage.url}
            alt={task.plant.name}
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        )}
        <div style={{ flex: 1 }}>
          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            <Space>
              <CalendarOutlined />
              <span>
                {dueDate.format('YYYY-MM-DD HH:mm')}
                <span style={{ color: '#999', marginLeft: 8 }}>({dueDate.fromNow()})</span>
              </span>
            </Space>
            {urgency.text !== '正常' && (
              <Progress percent={urgency.progress} status={urgency.color as any} showInfo={false} size="small" />
            )}
            {task.notes && <div style={{ color: '#666', fontSize: '12px' }}>{task.notes}</div>}
          </Space>
        </div>
        <Popconfirm
          title="完成任务"
          description="确定标记此任务为已完成？"
          onConfirm={() => onComplete(task.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="primary" icon={<CheckOutlined />}>
            完成
          </Button>
        </Popconfirm>
      </div>
    </Card>
  )
}

export default TaskListItem
