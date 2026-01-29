import { useState } from 'react'
import { Card, Row, Col, Statistic, Tabs, Empty, Button } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useTaskList } from '../hooks/useTasks'
import { useCompleteTask } from '../hooks/useTasks'
import { useDashboardStats } from '../hooks/useDashboard'
import TaskListItem from '../components/TaskListItem'
import type { PlantTask } from '../types/api'

type TaskTab = 'today' | 'upcoming' | 'overdue'

const Tasks = () => {
  const [activeTab, setActiveTab] = useState<TaskTab>('today')
  const { data: taskList, isLoading, refetch } = useTaskList()
  const completeTask = useCompleteTask()
  const { data: stats } = useDashboardStats()

  const todayTasks = taskList?.todayTasks || []
  const upcomingTasks = taskList?.upcomingTasks || []
  const overdueTasks = taskList?.overdueTasks || []

  const handleComplete = (taskId: number) => {
    completeTask.mutate({ taskId })
  }

  const tabItems = [
    {
      key: 'today',
      label: (
        <span>
          今日任务 <span style={{ color: '#1890ff' }}>({todayTasks.length})</span>
        </span>
      ),
      children: (
        <TaskList tasks={todayTasks} onComplete={handleComplete} loading={isLoading} />
      ),
    },
    {
      key: 'upcoming',
      label: (
        <span>
          即将到期 <span style={{ color: '#52c41a' }}>({upcomingTasks.length})</span>
        </span>
      ),
      children: (
        <TaskList tasks={upcomingTasks} onComplete={handleComplete} loading={isLoading} />
      ),
    },
    {
      key: 'overdue',
      label: (
        <span>
          逾期任务 <span style={{ color: '#cf1322' }}>({overdueTasks.length})</span>
        </span>
      ),
      children: (
        <TaskList tasks={overdueTasks} onComplete={handleComplete} loading={isLoading} />
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2>养护任务</h2>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          刷新
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日任务"
              value={stats?.todayTasksCount || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="即将到期"
              value={stats?.upcomingTasksCount || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="逾期任务"
              value={stats?.overdueTasksCount || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: stats?.overdueTasksCount ? '#cf1322' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} items={tabItems} onChange={(key) => setActiveTab(key as TaskTab)} />
      </Card>
    </div>
  )
}

interface TaskListProps {
  tasks: PlantTask[]
  onComplete: (taskId: number) => void
  loading?: boolean
}

const TaskList = ({ tasks, onComplete, loading }: TaskListProps) => {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px 0' }}>加载中...</div>
  }

  if (tasks.length === 0) {
    return (
      <Empty
        description="暂无任务"
        style={{ padding: '40px 0' }}
      />
    )
  }

  return (
    <div style={{ padding: '16px 0' }}>
      {tasks.map((task) => (
        <TaskListItem key={task.id} task={task} onComplete={onComplete} />
      ))}
    </div>
  )
}

export default Tasks
