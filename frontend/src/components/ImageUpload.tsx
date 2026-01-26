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

  // 检测是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

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
    console.log('handleUploadFile called, fileList:', fileList)
    if (fileList.length === 0) {
      message.warning('请选择要上传的图片')
      return
    }

    const file = fileList[0].originFileObj
    console.log('originFileObj:', file)
    if (!file) {
      message.error('文件选择失败：originFileObj 为空')
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      message.error('只支持 JPG, PNG, GIF, WebP 格式的图片')
      return
    }

    // Validate file size (max 15MB to account for mobile photos)
    const maxSize = 15 * 1024 * 1024
    if (file.size > maxSize) {
      message.error('图片大小不能超过 15MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    if (caption) {
      formData.append('description', caption)
    }
    console.log('FormData created, entries:', Array.from(formData.entries()))
    console.log('FormData has file?', formData.has('file'))
    console.log('File size:', file.size, 'bytes (', (file.size / 1024 / 1024).toFixed(2), 'MB)')
    console.log('File type:', file.type)
    console.log('User agent:', navigator.userAgent)

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
        onError: (error: any) => {
          console.error('Upload failed with error:', error)
          console.error('Error response:', error?.response)
          console.error('Error status:', error?.response?.status)
          console.error('Error data:', error?.response?.data)
          setUploading(false)

          // Show specific error message
          if (error?.response?.status === 413) {
            message.error('文件太大，请选择小于15MB的图片')
          } else if (error?.response?.status === 0 || error?.code === 'ERR_NETWORK') {
            message.error('网络连接失败，请检查网络或稍后重试')
          }
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
    beforeUpload: (file: any) => {
      console.log('beforeUpload called with file:', file)
      // Create UploadFile object with proper structure
      const uploadFile: UploadFile = {
        uid: file.uid || `${Date.now()}`,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file),
        originFileObj: file, // Important: keep reference to actual file
      }
      console.log('Setting fileList to:', [uploadFile])
      setFileList([uploadFile])
      return false // Prevent auto upload
    },
    fileList,
    maxCount: 1,
    accept: 'image/*',
    // 移动端优化：添加capture属性，允许直接拍照
    ...(isMobile && { capture: 'environment' as any }),
    // 确保在移动端也能正常选择文件
    multiple: false,
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
                  {isMobile ? (
                    // 移动端：使用普通Upload按钮
                    <Upload {...uploadProps} style={{ width: '100%' }}>
                      <Button icon={<UploadOutlined />} block size="large">
                        点击选择图片{isMobile && '或拍照'}
                      </Button>
                    </Upload>
                  ) : (
                    // 桌面端：使用拖拽上传
                    <Upload.Dragger {...uploadProps} style={{ marginBottom: 16 }}>
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                      </p>
                      <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                      <p className="ant-upload-hint">支持 JPG、PNG、GIF、WebP 格式，最大 15MB</p>
                    </Upload.Dragger>
                  )}
                  {fileList.length > 0 && (
                    <div style={{ textAlign: 'center', color: '#52c41a', fontSize: '12px' }}>
                      已选择: {fileList[0].name} ({((fileList[0].originFileObj?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
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
                    size={isMobile ? 'large' : 'middle'}
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
