import { Card, Grid } from 'antd-mobile'
import {
  EnvironmentOutline,
  UnorderedListOutline,
  CheckCircleOutline,
  ClockCircleOutline,
} from 'antd-mobile-icons'
import { useNavigate } from 'react-router-dom'
import { useDashboardStats } from '../../hooks/useDashboard'
import { useTaskList } from '../../hooks/useTasks'

/**
 * 移动端首页 - 仪表板
 *
 * 功能：
 * - 显示统计数据
 * - 快速访问入口
 * - 今日任务列表
 */
export default function MobileDashboard() {
  const navigate = useNavigate()
  const { data: stats } = useDashboardStats()
  const { data: taskList } = useTaskList()

  const todayTasks = taskList?.todayTasks?.slice(0, 5) || []

  return (
    <div style={{ padding: 16, paddingBottom: 66 }}>
      {/* 欢迎信息 */}
      <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, margin: 0 }}>
        👋 欢迎回来！
      </h3>

      {/* 统计卡片 */}
      <Grid columns={2} gap={16}>
        <Grid.Item>
          <Card
            onClick={() => navigate('/mobile/rooms')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ textAlign: 'center' }}>
              <EnvironmentOutline style={{ fontSize: 32, color: '#1890ff' }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                {stats?.totalRooms || 0}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>房间</div>
            </div>
          </Card>
        </Grid.Item>

        <Grid.Item>
          <Card
            onClick={() => navigate('/mobile/plants')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ textAlign: 'center' }}>
              <UnorderedListOutline style={{ fontSize: 32, color: '#52c41a' }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                {stats?.totalPlants || 0}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>植物</div>
            </div>
          </Card>
        </Grid.Item>

        <Grid.Item>
          <Card
            onClick={() => navigate('/mobile/tasks?filter=today')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutline style={{ fontSize: 32, color: '#faad14' }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                {taskList?.todayTasks?.length || 0}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>今日任务</div>
            </div>
          </Card>
        </Grid.Item>

        <Grid.Item>
          <Card
            onClick={() => navigate('/mobile/tasks?filter=overdue')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutline style={{ fontSize: 32, color: '#ff4d4f' }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                {taskList?.overdueTasks?.length || 0}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>逾期任务</div>
            </div>
          </Card>
        </Grid.Item>
      </Grid>

      {/* 今日任务 */}
      {todayTasks.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>今日任务</div>
          {todayTasks.map(task => (
            <div
              key={task.id}
              onClick={() => navigate('/mobile/tasks')}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 500 }}>{task.taskType}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                {task.plant?.name || task.plantName}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* 空状态 */}
      {todayTasks.length === 0 && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
            <div style={{ fontSize: 48 }}>🎉</div>
            <div style={{ marginTop: 16 }}>今日暂无任务</div>
          </div>
        </Card>
      )}
    </div>
  )
}
