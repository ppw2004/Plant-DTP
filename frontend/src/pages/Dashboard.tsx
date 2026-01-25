import { Card, Row, Col, Statistic, List, Typography, Button, Space, Empty } from 'antd'
import {
  EnvironmentOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDashboardStats } from '../hooks/useDashboard'
import { useTaskList } from '../hooks/useTasks'
import TaskListItem from '../components/TaskListItem'

const { Title, Paragraph } = Typography

const Dashboard = () => {
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: taskList, isLoading: tasksLoading } = useTaskList()

  const todayTasks = taskList?.todayTasks?.slice(0, 5) || []
  const allTasksLoaded = !tasksLoading

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  return (
    <div>
      <Title level={2}>仪表板</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <div
              onClick={() => handleNavigate('/rooms')}
              style={{ cursor: 'pointer' }}
            >
              <Statistic
                title="总房间数"
                value={stats?.totalRooms || 0}
                prefix={<EnvironmentOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <div
              onClick={() => handleNavigate('/plants')}
              style={{ cursor: 'pointer' }}
            >
              <Statistic
                title="总植物数"
                value={stats?.totalPlants || 0}
                prefix={<InfoCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <div
              onClick={() => handleNavigate('/tasks')}
              style={{ cursor: 'pointer' }}
            >
              <Statistic
                title="今日任务"
                value={stats?.todayTasksCount || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <div
              onClick={() => handleNavigate('/tasks')}
              style={{ cursor: 'pointer' }}
            >
              <Statistic
                title="逾期任务"
                value={stats?.overdueTasksCount || 0}
                prefix={<WarningOutlined />}
                valueStyle={{ color: stats?.overdueTasksCount ? '#cf1322' : '#52c41a' }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card
            title="今日任务"
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={() => handleNavigate('/tasks')}
              >
                查看全部
              </Button>
            }
          >
            {allTasksLoaded && todayTasks.length === 0 ? (
              <Empty description="今日暂无任务" />
            ) : (
              <List
                loading={tasksLoading}
                dataSource={todayTasks}
                renderItem={(task) => <TaskListItem task={task} onComplete={() => {}} />}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="快速开始">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                block
                icon={<EnvironmentOutlined />}
                onClick={() => handleNavigate('/rooms')}
              >
                管理房间
              </Button>
              <Button
                block
                icon={<InfoCircleOutlined />}
                onClick={() => handleNavigate('/plants')}
              >
                管理植物
              </Button>
              <Button
                block
                icon={<ClockCircleOutlined />}
                onClick={() => handleNavigate('/tasks')}
              >
                查看任务
              </Button>
            </Space>
          </Card>

          <Card title="系统状态" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> 后端服务运行中
              </Paragraph>
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> 数据库连接正常
              </Paragraph>
              <Paragraph>
                API 文档:{' '}
                <a
                  href="http://localhost:12801/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  http://localhost:12801/docs
                </a>
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
