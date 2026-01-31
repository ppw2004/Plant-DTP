import { useState, useEffect, useRef } from 'react'
import {
  Modal,
  List,
  Image,
  Button,
  Toast,
  Tabs,
  Tag,
  Space,
  Grid,
  Dialog,
  TextArea
} from 'antd-mobile'
import { CameraOutline, DeleteOutline, StarOutline } from 'antd-mobile-icons'
import { usePlantImages, useUploadImage, useDeleteImage, useSetPrimaryImage } from '../../hooks/useImages'
import type { PlantImage } from '../../types/api'

interface MobileImageUploadProps {
  visible: boolean
  onClose: () => void
  plantId: number
}

/**
 * 移动端图片上传组件
 *
 * 功能：
 * - 查看图片列表
 * - 拍照或从相册选择上传
 * - 设置主图
 * - 删除图片
 */
export default function MobileImageUpload({ visible, onClose, plantId }: MobileImageUploadProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list')
  const [caption, setCaption] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: images, isLoading } = usePlantImages(plantId)
  const uploadImage = useUploadImage()
  const deleteImage = useDeleteImage()
  const setPrimaryImage = useSetPrimaryImage()

  // 重置状态
  useEffect(() => {
    if (!visible) {
      setActiveTab('list')
      setCaption('')
      setSelectedFile(null)
      setPreviewUrl('')
      setUploading(false)
    }
  }, [visible])

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      Toast.show({ content: '只支持 JPG, PNG, GIF, WebP 格式的图片' })
      return
    }

    // 验证文件大小（最大15MB）
    const maxSize = 15 * 1024 * 1024
    if (file.size > maxSize) {
      Toast.show({ content: '图片大小不能超过 15MB' })
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // 上传图片
  const handleUpload = () => {
    if (!selectedFile) {
      Toast.show({ content: '请选择要上传的图片' })
      return
    }

    console.log('=== Mobile Image Upload Start ===')
    console.log('selectedFile:', selectedFile)
    console.log('File name:', selectedFile.name)
    console.log('File type:', selectedFile.type)
    console.log('File size:', selectedFile.size)

    setUploading(true)
    const formData = new FormData()

    // 直接使用 File 对象，不使用 Blob 包装
    formData.append('file', selectedFile)

    if (caption.trim()) {
      formData.append('description', caption)
    }

    // 详细的调试日志
    console.log('FormData created')
    console.log('FormData has file?', formData.has('file'))
    console.log('FormData entries:', Array.from(formData.entries()))

    // 检查文件是否正确添加
    const fileInFormData = formData.get('file') as File
    console.log('File in FormData:', fileInFormData)
    console.log('File in FormData name:', fileInFormData?.name)
    console.log('File in FormData size:', fileInFormData?.size)
    console.log('File in FormData type:', fileInFormData?.type)

    uploadImage.mutate(
      { plantId, formData },
      {
        onSuccess: () => {
          console.log('✓ Upload mutation success')
          Toast.show({ content: '上传成功', icon: 'success' })
          setSelectedFile(null)
          setPreviewUrl('')
          setCaption('')
          setUploading(false)
          setActiveTab('list')
        },
        onError: (error: any) => {
          console.error('✗ Upload mutation error:', error)
          setUploading(false)

          // 显示具体错误信息
          const responseData = error?.response?.data
          let errorMessage = '上传失败，请重试'

          if (responseData?.error?.message) {
            errorMessage = responseData.error.message
          } else if (responseData?.error?.detail) {
            errorMessage = responseData.error.detail
          } else if (responseData?.detail) {
            if (typeof responseData.detail === 'string') {
              errorMessage = responseData.detail
            } else if (Array.isArray(responseData.detail)) {
              errorMessage = responseData.detail.map((e: any) => e.msg || e).join(', ')
            } else if (responseData.detail.msg) {
              errorMessage = responseData.detail.msg
            }
          }

          Toast.show({ content: errorMessage })
        },
        onSettled: () => {
          console.log('✓ Upload mutation settled')
          // 确保 loading 状态被重置
          setUploading(false)
        }
      }
    )
  }

  // 删除图片
  const handleDelete = (image: PlantImage) => {
    if (image.isPrimary && images && images.length > 1) {
      Toast.show({ content: '主图不能删除，请先设置其他图片为主图' })
      return
    }

    Dialog.confirm({
      content: '确定要删除这张图片吗？',
      onConfirm: () => {
        deleteImage.mutate({ plantId, imageId: image.id })
      }
    })
  }

  // 设置主图
  const handleSetPrimary = (imageId: number) => {
    setPrimaryImage.mutate({ plantId, imageId })
  }

  // 拍照或选择图片
  const handleSelectImage = () => {
    fileInputRef.current?.click()
  }

  return (
    <Modal
      visible={visible}
      content={
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as any)}
          style={{ '--title-font-size': '16px' }}
        >
          <Tabs.Tab title={`图片列表 (${images?.length || 0})`} key="list">
            <List>
              {isLoading ? (
                <List.Item style={{ justifyContent: 'center', padding: '40px 0' }}>
                  加载中...
                </List.Item>
              ) : images && images.length > 0 ? (
                images.map((image) => (
                  <List.Item key={image.id}>
                    <div style={{ width: '100%' }}>
                      <div style={{ position: 'relative' }}>
                        <Image
                          src={image.url}
                          alt={image.caption || '图片'}
                          width="100%"
                          height={200}
                          fit="cover"
                          style={{ borderRadius: 8 }}
                        />
                        {image.isPrimary && (
                          <Tag
                            color="gold"
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
                      <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                        {image.caption || '无描述'}
                      </div>
                      <Grid columns={2} gap={8} style={{ marginTop: 12 }}>
                        {!image.isPrimary && (
                          <Grid.Item>
                            <Button
                              size="small"
                              fill="outline"
                              onClick={() => handleSetPrimary(image.id)}
                            >
                              <StarOutline style={{ marginRight: 4 }} />
                              设为主图
                            </Button>
                          </Grid.Item>
                        )}
                        <Grid.Item>
                          <Button
                            size="small"
                            color="danger"
                            fill="outline"
                            onClick={() => handleDelete(image)}
                          >
                            <DeleteOutline style={{ marginRight: 4 }} />
                            删除
                          </Button>
                        </Grid.Item>
                      </Grid>
                    </div>
                  </List.Item>
                ))
              ) : (
                <List.Item style={{ justifyContent: 'center', padding: '40px 0', color: '#999' }}>
                  还没有图片，快去添加吧！
                </List.Item>
              )}
            </List>
          </Tabs.Tab>

          <Tabs.Tab title="上传图片" key="upload">
            <Space direction="vertical" style={{ width: '100%', padding: '16px 0' }}>
              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {/* 预览或选择按钮 */}
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    width="100%"
                    height={250}
                    fit="contain"
                    style={{ borderRadius: 8 }}
                  />
                  <Button
                    fill="outline"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl('')
                    }}
                  >
                    重新选择
                  </Button>
                </>
              ) : (
                <div
                  onClick={handleSelectImage}
                  style={{
                    width: '100%',
                    height: 200,
                    border: '2px dashed #ddd',
                    borderRadius: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <CameraOutline style={{ fontSize: 48, color: '#999', marginBottom: 12 }} />
                  <div style={{ color: '#666', marginBottom: 4 }}>点击选择图片</div>
                  <div style={{ fontSize: 12, color: '#999' }}>支持从相册选择或拍照</div>
                </div>
              )}

              {/* 图片描述 */}
              <TextArea
                placeholder="图片描述（可选）"
                value={caption}
                onChange={setCaption}
                rows={3}
              />

              {/* 文件信息 */}
              {selectedFile && (
                <div style={{ fontSize: 12, color: '#52c41a' }}>
                  已选择: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}

              {/* 上传按钮 */}
              <Button
                block
                color="primary"
                size="large"
                onClick={handleUpload}
                loading={uploading}
                disabled={!selectedFile}
              >
                上传图片
              </Button>

              {/* 提示信息 */}
              <div style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
                支持 JPG、PNG、GIF、WebP 格式，最大 15MB
              </div>
            </Space>
          </Tabs.Tab>
        </Tabs>
      }
      closeOnMaskClick
      onClose={onClose}
      bodyStyle={{ minHeight: '60vh' }}
    />
  )
}
