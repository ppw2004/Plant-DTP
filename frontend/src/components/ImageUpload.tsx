import { useEffect, useState } from 'react'
import { Modal, List, Card, Image, Button, Space, Input, message, Upload, Tabs, Tag } from 'antd'
import { PlusOutlined, UploadOutlined, LinkOutlined, StarOutlined, StarFilled, DeleteOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { usePlantImages, useAddImage, useUploadImage, useDeleteImage, useSetPrimaryImage } from '../hooks/useImages'
import type { PlantImage } from '../types/api'

interface ImageUploadProps {
  visible: boolean
  onClose: () => void
  plantId: number
}

const ImageUpload = ({ visible, onClose, plantId }: ImageUploadProps) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list')
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  const { data: images, isLoading } = usePlantImages(plantId)
  const addImage = useAddImage()
  const uploadImage = useUploadImage()
  const deleteImage = useDeleteImage()
  const setPrimaryImage = useSetPrimaryImage()

  useEffect(() => {
    if (!visible) {
      setActiveTab('list')
      setImageUrl('')
      setCaption('')
      setFileList([])
      setUploading(false)
    }
  }, [visible])

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      message.warning('请输入图片URL')
      return
    }

    addImage.mutate(
      {
        plantId,
        data: {
          url: imageUrl,
          caption: caption || undefined,
        },
      },
      {
        onSuccess: () => {
          setImageUrl('')
          setCaption('')
          setActiveTab('list')
        },
      }
    )
  }

  const handleUploadFile = () => {
    if (fileList.length === 0) {
      message.warning('请选择要上传的图片')
      return
    }

    const file = fileList[0].originFileObj
    if (!file) {
      message.error('文件选择失败')
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      message.error('只支持 JPG, PNG, GIF, WebP 格式的图片')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      message.error('图片大小不能超过 10MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    if (caption) {
      formData.append('description', caption)
    }

    uploadImage.mutate(
      {
        plantId,
        formData,
      },
      {
        onSuccess: () => {
          setFileList([])
          setCaption('')
          setUploading(false)
          setActiveTab('list')
        },
        onError: () => {
          setUploading(false)
        },
      }
    )
  }

  const handleDelete = (image: PlantImage) => {
    if (image.isPrimary && images && images.length > 1) {
      message.warning('主图不能删除，请先设置其他图片为主图')
      return
    }

    Modal.confirm({
      title: '删除图片',
      content: '确定要删除这张图片吗？',
      onOk: () => {
        deleteImage.mutate({ plantId, imageId: image.id })
      },
    })
  }

  const handleSetPrimary = (imageId: number) => {
    setPrimaryImage.mutate({ plantId, imageId })
  }

  const uploadProps = {
    onRemove: () => {
      setFileList([])
    },
    beforeUpload: (file: UploadFile) => {
      setFileList([file])
      return false
    },
    fileList,
    maxCount: 1,
    accept: 'image/*',
  }

  const tabItems = [
    {
      key: 'list',
      label: `图片列表 (${images?.length || 0})`,
      children: (
        <List
          loading={isLoading}
          grid={{ gutter: 16, column: 2 }}
          dataSource={images || []}
          renderItem={(image) => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <div style={{ position: 'relative' }}>
                    <Image
                      src={image.url}
                      alt={image.caption || '图片'}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                    {image.isPrimary && (
                      <Tag
                        color="gold"
                        icon={<StarFilled />}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                        }}
                      >
                        主图
                      </Tag>
                    )}
                  </div>
                }
                actions={[
                  !image.isPrimary && (
                    <Button
                      key="primary"
                      type="text"
                      icon={<StarOutlined />}
                      onClick={() => handleSetPrimary(image.id)}
                    >
                      设为主图
                    </Button>
                  ),
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(image)}
                  >
                    删除
                  </Button>
                ].filter(Boolean)}
              >
                <Card.Meta
                  description={
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {image.caption || '无描述'}
                      {image.takenAt && (
                        <div>拍摄日期: {new Date(image.takenAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'add',
      label: '添加图片',
      children: (
        <Tabs
          defaultActiveKey="url"
          items={[
            {
              key: 'url',
              label: (
                <span>
                  <LinkOutlined />
                  URL方式
                </span>
              ),
              children: (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input.TextArea
                    rows={3}
                    placeholder="请输入图片URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Input.TextArea
                    rows={2}
                    placeholder="图片描述（可选）"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddImageUrl}
                    loading={addImage.isPending}
                    block
                  >
                    添加图片
                  </Button>
                </Space>
              ),
            },
            {
              key: 'file',
              label: (
                <span>
                  <UploadOutlined />
                  文件上传
                </span>
              ),
              children: (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Upload.Dragger {...uploadProps} style={{ marginBottom: 16 }}>
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                    <p className="ant-upload-hint">支持 JPG、PNG、GIF、WebP 格式，最大 10MB</p>
                  </Upload.Dragger>
                  <Input.TextArea
                    rows={2}
                    placeholder="图片描述（可选）"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={handleUploadFile}
                    loading={uploading || uploadImage.isPending}
                    disabled={fileList.length === 0}
                    block
                  >
                    上传图片
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <Modal
      title="图片管理"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <Tabs activeKey={activeTab} items={tabItems} onChange={(key) => setActiveTab(key as any)} />
    </Modal>
  )
}

export default ImageUpload
