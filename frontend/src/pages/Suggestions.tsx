import { useState } from 'react'
import { Card, Form, Input, Select, Button, message, Space, Divider, Tag, Empty } from 'antd'
import { PlusOutlined, MessageOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useSuggestions, useCreateSuggestion } from '../hooks/useSuggestions'
import type { Suggestion } from '../types/api'

const { TextArea } = Input

const CATEGORY_OPTIONS = [
  { label: '功能请求', value: '功能请求' },
  { label: '问题反馈', value: '问题反馈' },
  { label: '改进建议', value: '改进建议' },
  { label: '其他', value: '其他' },
]

const PRIORITY_OPTIONS = [
  { label: '低优先级', value: 'low' },
  { label: '中优先级', value: 'medium' },
  { label: '高优先级', value: 'high' },
]

const STATUS_MAP: Record<string, { text: string; color: string }> = {
  pending: { text: '待处理', color: 'default' },
  reviewing: { text: '审核中', color: 'processing' },
  implemented: { text: '已实现', color: 'success' },
  rejected: { text: '已拒绝', color: 'error' },
}

const PRIORITY_MAP: Record<string, { text: string; color: string }> = {
  low: { text: '低', color: 'default' },
  medium: { text: '中', color: 'warning' },
  high: { text: '高', color: 'error' },
}

const Suggestions = () => {
  const [form] = Form.useForm()
  const { data: suggestionsData, isLoading } = useSuggestions()
  const createSuggestion = useCreateSuggestion()
  const [showForm, setShowForm] = useState(false)

  const suggestions = suggestionsData?.items || []

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await createSuggestion.mutateAsync(values)
      message.success('感谢您的建议！我们会认真考虑。')
      form.resetFields()
      setShowForm(false)
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h2>💬 留言板</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(!showForm)}>
          {showForm ? '收起表单' : '我要提建议'}
        </Button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 24 }} title="提交建议或反馈">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              category: '功能请求',
              priority: 'medium',
            }}
            onFinish={handleSubmit}
          >
            <Form.Item
              label="标题"
              name="title"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input placeholder="简要描述您的建议或问题" maxLength={200} showCount />
            </Form.Item>

            <Form.Item
              label="类别"
              name="category"
              rules={[{ required: true, message: '请选择类别' }]}
            >
              <Select options={CATEGORY_OPTIONS} placeholder="选择类别" />
            </Form.Item>

            <Form.Item
              label="优先级"
              name="priority"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select options={PRIORITY_OPTIONS} placeholder="选择优先级" />
            </Form.Item>

            <Form.Item
              label="详细内容"
              name="content"
              rules={[{ required: true, message: '请输入详细内容' }]}
            >
              <TextArea
                rows={6}
                placeholder="请详细描述您的建议、发现的问题或想要的功能..."
                maxLength={5000}
                showCount
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={createSuggestion.isPending}
                icon={<MessageOutlined />}
                size="large"
              >
                提交建议
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      <Divider />

      <div style={{ marginBottom: 16 }}>
        <h3>建议列表 ({suggestions.length})</h3>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>加载中...</div>
      ) : suggestions.length === 0 ? (
        <Card>
          <Empty
            description="还没有建议，成为第一个提建议的人吧！"
            style={{ margin: '40px 0' }}
          />
        </Card>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {suggestions.map((suggestion) => {
            const statusInfo = STATUS_MAP[suggestion.status] || { text: suggestion.status, color: 'default' }
            const priorityInfo = PRIORITY_MAP[suggestion.priority] || { text: suggestion.priority, color: 'default' }

            return (
              <Card
                key={suggestion.id}
                size="small"
                type={suggestion.status === 'implemented' ? 'inner' : undefined}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                      <Space size="small">
                        <span style={{ fontWeight: 'bold', fontSize: 16 }}>{suggestion.title}</span>
                        <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                        <Tag color={priorityInfo.color}>{priorityInfo.text}优先级</Tag>
                        <Tag>{suggestion.category}</Tag>
                      </Space>
                    </div>
                    <div style={{ color: '#666', whiteSpace: 'pre-wrap' }}>{suggestion.content}</div>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                      提交时间: {new Date(suggestion.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </Space>
      )}
    </div>
  )
}

export default Suggestions
