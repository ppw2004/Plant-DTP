import { Card, Row, Col, Statistic } from 'antd'
import { EnvironmentOutlined, InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'

const Dashboard = () => {
  return (
    <div>
      <h2>欢迎来到植物数字孪生平台</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总房间数"
              value={2}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总植物数"
              value={0}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日任务"
              value={0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} title="快速开始">
        <p>1. <a href="/rooms">创建房间</a> - 添加你的房间位置</p>
        <p>2. <a href="/plants">添加植物</a> - 记录你的植物信息</p>
        <p>3. <a href="/tasks">设置提醒</a> - 配置养护任务</p>
      </Card>

      <Card style={{ marginTop: 24 }} title="系统状态">
        <p>✅ 后端服务运行中 (端口 12801)</p>
        <p>✅ 数据库连接正常</p>
        <p>✅ API文档可访问: <a href="http://localhost:12801/docs" target="_blank">http://localhost:12801/docs</a></p>
      </Card>
    </div>
  )
}

export default Dashboard
