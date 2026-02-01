import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Toast, DotLoading } from 'antd-mobile'
import { CameraOutline, PictureOutline } from 'antd-mobile-icons'
import { useIdentifyPlant } from '../../hooks/useIdentifications'

/**
 * 移动端植物识别页面
 * 功能：拍照或选择图片进行植物识别
 */
export default function MobileIdentify() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isIdentifying, setIsIdentifying] = useState(false)

  const identifyMutation = useIdentifyPlant()

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      Toast.show('请选择图片文件')
      return
    }

    // 验证文件大小（4MB限制）
    if (file.size > 4 * 1024 * 1024) {
      Toast.show('图片大小不能超过4MB')
      return
    }

    setSelectedFile(file)

    // 预览图片
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  // 触发相机
  const triggerCamera = () => {
    fileInputRef.current?.click()
  }

  // 开始识别
  const handleIdentify = async () => {
    if (!selectedFile) {
      Toast.show('请先选择图片')
      return
    }

    setIsIdentifying(true)

    try {
      const result = await identifyMutation.mutateAsync({
        file: selectedFile,
        includeDetails: true,
      })

      // 跳转到识别结果页面
      navigate(`/mobile/identify/result/${result.identificationId}`, {
        state: { result },
      })
    } catch (error) {
      console.error('识别失败:', error)
    } finally {
      setIsIdentifying(false)
    }
  }

  // 重新选择
  const handleReset = () => {
    setSelectedImage(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div style={{ padding: 16, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部导航 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 0',
          position: 'relative',
        }}
      >
        <button
          onClick={() => navigate('/mobile')}
          style={{
            position: 'absolute',
            left: 0,
            background: 'none',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: '#333',
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>植物识别</h1>
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 图片预览区域 */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#f5f5f5',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {selectedImage ? (
            <>
              <img
                src={selectedImage}
                alt="预览"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
              {!isIdentifying && (
                <Button
                  color="danger"
                  fill="outline"
                  size="small"
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                  onClick={handleReset}
                >
                  重新选择
                </Button>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#999' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
              <div>请选择或拍摄植物照片</div>
            </div>
          )}

          {/* 识别中遮罩 */}
          {isIdentifying && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <DotLoading color="#1677ff" />
              <div style={{ fontSize: 16, color: '#666' }}>正在识别中...</div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!selectedImage ? (
            <>
              <Button
                block
                size="large"
                color="primary"
                onClick={triggerCamera}
                style={{ height: 56 }}
              >
                <CameraOutline style={{ fontSize: 24, marginRight: 8 }} />
                拍照识别
              </Button>

              <Button
                block
                size="large"
                color="default"
                onClick={triggerFileSelect}
                style={{ height: 56 }}
              >
                <PictureOutline style={{ fontSize: 24, marginRight: 8 }} />
                从相册选择
              </Button>

              <div
                style={{
                  fontSize: 13,
                  color: '#999',
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                支持 JPG、PNG、BMP、GIF、WebP 格式
                <br />
                文件大小不超过 4MB
              </div>
            </>
          ) : (
            <>
              <Button
                block
                size="large"
                color="primary"
                onClick={handleIdentify}
                disabled={isIdentifying}
                style={{ height: 56 }}
              >
                {isIdentifying ? '识别中...' : '开始识别'}
              </Button>

              <Button
                block
                size="large"
                color="default"
                fill="outline"
                onClick={handleReset}
                disabled={isIdentifying}
                style={{ height: 56 }}
              >
                重新选择
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  )
}
