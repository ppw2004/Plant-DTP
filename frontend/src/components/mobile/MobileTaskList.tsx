import { List, Empty, SwipeAction, Dialog } from 'antd-mobile'
import { CheckCircleOutline, ClockCircleOutline } from 'antd-mobile-icons'
import { useNavigate } from 'react-router-dom'
import type { PlantTask } from '../../types/api'

interface MobileTaskListProps {
  tasks: PlantTask[]
  isLoading?: boolean
}

/**
 * 移动端任务列表组件
 *
 * 特点：
 * - 滑动操作（完成/推迟）
 * - 状态图标
 * - 逾期高亮
 */
export default function MobileTaskList({ tasks, isLoading }: MobileTaskListProps) {
  const navigate = useNavigate()

  const handleComplete = async (task: PlantTask) => {
    const result = await Dialog.confirm({
      content: `确认完成"${task.taskType}"？`,
    })

    if (result) {
      // TODO: 调用完成任务API
      console.log('Complete task:', task.id)
    }
  }

  const handleSnooze = (task: PlantTask) => {
    // TODO: 实现推迟功能
    console.log('Snooze task:', task.id)
  }

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        加载中...
      </div>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Empty
        description="暂无任务"
        style={{ padding: '60px 0' }}
      />
    )
  }

  return (
    <List style={{ '--padding-left': '0', '--padding-right': '0' }}>
      {tasks.map(task => (
        <SwipeAction
          key={task.id}
          rightActions={[
            {
              key: 'complete',
              text: '完成',
              color: '#52c41a',
              onClick: () => handleComplete(task)
            },
            {
              key: 'snooze',
              text: '推迟',
              color: '#ffcf28',
              onClick: () => handleSnooze(task)
            }
          ]}
        >
          <List.Item
            onClick={() => navigate(`/mobile/plants/${task.plant?.id}`)}
            style={{
              padding: '16px',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: new Date(task.dueDate) < new Date() && task.status !== 'completed' ? '#fff2f0' : '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* 任务图标 */}
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: new Date(task.dueDate) < new Date() && task.status !== 'completed' ? '#ffccc7' : '#e6f7ff',
              }}>
                {new Date(task.dueDate) < new Date() && task.status !== 'completed' ? (
                  <ClockCircleOutline style={{ color: '#ff4d4f', fontSize: 20 }} />
                ) : (
                  <CheckCircleOutline style={{ color: '#1890ff', fontSize: 20 }} />
                )}
              </div>

              {/* 任务信息 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15,
                  fontWeight: 500,
                  marginBottom: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {task.taskType}
                </div>
                <div style={{
                  fontSize: 12,
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span>{task.plant?.name || '未关联植物'}</span>
                  <span>•</span>
                  <span>{task.taskType}</span>
                </div>
              </div>

              {/* 到期时间 */}
              <div style={{
                fontSize: 12,
                color: new Date(task.dueDate) < new Date() && task.status !== 'completed' ? '#ff4d4f' : '#999',
                whiteSpace: 'nowrap',
              }}>
                {new Date(task.dueDate).toLocaleDateString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit'
                })}
              </div>
            </div>
          </List.Item>
        </SwipeAction>
      ))}
    </List>
  )
}
