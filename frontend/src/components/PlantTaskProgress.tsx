import { Space } from 'antd'
import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration'
import { usePlantConfigs } from '../hooks/usePlantConfigs'
import type { CSSProperties } from 'react'

dayjs.extend(durationPlugin)

interface PlantTaskProgressProps {
  plantId: number
}

interface TaskCountdown {
  taskType: string
  taskIcon: string
  lastDoneAt: string | null
  nextDueAt: string | null
  intervalDays: number
  windowPeriod: number
  elapsedHours: number
  totalHours: number
  remainingHours: number
  progressPercent: number
  isOverdue: boolean
  inWindow: boolean
  windowStart: dayjs.Dayjs | null
  windowEnd: dayjs.Dayjs | null
  windowStartPercent: number
  windowEndPercent: number
}

const PlantTaskProgress = ({ plantId }: PlantTaskProgressProps) => {
  const { configs } = usePlantConfigs(plantId)

  // 计算每个养护任务的倒计时
  const taskCountdowns: TaskCountdown[] = configs
    .filter((config) => config.isActive)
    .map((config) => {
      const now = dayjs()
      const lastDone = config.lastDoneAt ? dayjs(config.lastDoneAt) : now
      const nextDue = config.nextDueAt ? dayjs(config.nextDueAt) : null

      // 计算窗口期
      const windowPeriod = config.windowPeriod || 0
      const windowStart = nextDue ? nextDue.subtract(windowPeriod / 2, 'day') : null
      const windowEnd = nextDue ? nextDue.add(windowPeriod / 2, 'day') : null

      // 计算已过时间（小时）
      const elapsedHours = now.diff(lastDone, 'hour', true)
      // 计算总间隔时间（小时）
      const totalHours = config.intervalDays * 24
      // 计算剩余时间（小时）
      const remainingHours = nextDue ? now.diff(nextDue, 'hour', true) * -1 : totalHours - elapsedHours

      // 计算进度百分比
      const progressPercent = Math.min(Math.round((elapsedHours / totalHours) * 100), 100)

      // 计算窗口期的百分比位置
      let windowStartPercent = 0
      let windowEndPercent = 0
      if (windowStart && windowEnd && lastDone && nextDue) {
        const totalDuration = nextDue.diff(lastDone, 'hour')
        windowStartPercent = Math.round((windowStart.diff(lastDone, 'hour') / totalDuration) * 100)
        windowEndPercent = Math.round((windowEnd.diff(lastDone, 'hour') / totalDuration) * 100)
      }

      // 判断是否在窗口期内
      const inWindow = windowStart && windowEnd && now.isAfter(windowStart) && now.isBefore(windowEnd)
      const inWindowBool = Boolean(inWindow)

      // 判断是否逾期（超出窗口期结束时间）
      const isOverdue = windowEnd ? now.isAfter(windowEnd) : false

      return {
        taskType: config.taskTypeName || '未知任务',
        taskIcon: config.taskTypeIcon || '📋',
        lastDoneAt: config.lastDoneAt,
        nextDueAt: config.nextDueAt,
        intervalDays: config.intervalDays,
        windowPeriod,
        elapsedHours,
        totalHours,
        remainingHours: Math.max(remainingHours, 0),
        progressPercent,
        isOverdue,
        inWindow: inWindowBool,
        windowStart,
        windowEnd,
        windowStartPercent,
        windowEndPercent,
      }
    })
    .filter((task) => task.nextDueAt) // 只显示有到期时间的任务

  if (taskCountdowns.length === 0) {
    return null
  }

  // 格式化时间显示
  const formatDuration = (hours: number): string => {
    const days = Math.floor(hours / 24)
    const hrs = Math.floor(hours % 24)
    const mins = Math.round((hours % 1) * 60)

    if (days > 0) {
      return mins > 0 ? `${days}天${hrs}小时${mins}分钟` : `${days}天${hrs}小时`
    } else if (hrs > 0) {
      return mins > 0 ? `${hrs}小时${mins}分钟` : `${hrs}小时`
    } else {
      return `${mins}分钟`
    }
  }

  // 格式化已过时间
  const formatElapsedTime = (hours: number): string => {
    const days = Math.floor(hours / 24)
    const hrs = Math.floor(hours % 24)

    if (days > 0) {
      return hrs > 0 ? `${days}天${hrs}小时` : `${days}天`
    } else {
      return `${hrs}小时`
    }
  }

  // 获取状态文本
  const getStatusText = (task: TaskCountdown): string => {
    if (task.isOverdue) return `已逾期 ${formatDuration(Math.abs(task.remainingHours))}`
    if (task.inWindow) return `📅 窗口期内（最佳时间）`
    if (task.windowPeriod > 0 && task.windowStart) {
      const hoursUntilWindow = dayjs().diff(task.windowStart, 'hour')
      if (hoursUntilWindow >= 0 && hoursUntilWindow < 24) {
        return `即将进入窗口期`
      }
    }
    return `还剩 ${formatDuration(task.remainingHours)}`
  }

  // 获取状态颜色
  const getStatusColor = (task: TaskCountdown): string => {
    if (task.isOverdue) return '#ff4d4f'
    if (task.inWindow) return '#faad14'
    if (task.windowPeriod > 0 && task.windowStart) {
      const hoursUntilWindow = dayjs().diff(task.windowStart, 'hour')
      if (hoursUntilWindow >= 0 && hoursUntilWindow < 24) return '#faad14'
    }
    return '#52c41a'
  }

  // 自定义进度条组件
  const CustomProgressBar = ({ task }: { task: TaskCountdown }) => {
    // 计算渐变色停止点
    const getGradientStops = (): string => {
      if (task.isOverdue) {
        return '#ff4d4f 0%, #ff4d4f 100%'
      }

      const greenEnd = task.windowPeriod > 0 ? task.windowStartPercent : 100
      const yellowStart = task.windowPeriod > 0 ? task.windowStartPercent : 100

      if (task.windowPeriod === 0) {
        return '#52c41a 0%, #52c41a 100%'
      }

      return `#52c41a 0%, #52c41a ${greenEnd}%, #faad14 ${yellowStart}%, #faad14 100%`
    }

    const containerStyle: CSSProperties = {
      position: 'relative',
      width: '100%',
      height: '10px',
      backgroundColor: '#f0f0f0',
      borderRadius: '5px',
      overflow: 'visible',
    }

    const barStyle: CSSProperties = {
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: '100%',
      borderRadius: '5px',
      background: `linear-gradient(to right, ${getGradientStops()})`,
      transition: 'all 0.3s ease',
    }

    // 当前位置标记点
    const dotStyle: CSSProperties = {
      position: 'absolute',
      left: `${Math.min(task.progressPercent, 100)}%`,
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: '14px',
      height: '14px',
      backgroundColor: '#000',
      border: '2px solid #fff',
      borderRadius: '50%',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      zIndex: 2,
      transition: 'left 0.3s ease',
      cursor: 'pointer',
    }

    // 窗口期标记线
    const windowMarkers = task.windowPeriod > 0 && !task.isOverdue && (
      <>
        <div
          style={{
            position: 'absolute',
            left: `${task.windowStartPercent}%`,
            top: '-2px',
            bottom: '-2px',
            width: '2px',
            backgroundColor: 'rgba(250, 173, 20, 0.5)',
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${task.windowEndPercent}%`,
            top: '-2px',
            bottom: '-2px',
            width: '2px',
            backgroundColor: 'rgba(250, 173, 20, 0.5)',
            zIndex: 1,
          }}
        />
      </>
    )

    return (
      <div style={{ position: 'relative', paddingTop: '6px', paddingBottom: '6px' }}>
        <div style={containerStyle}>
          <div style={barStyle} />
        </div>
        {windowMarkers}
        <div style={dotStyle} title={`当前位置：${task.progressPercent}%`} />
      </div>
    )
  }

  return (
    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666', fontWeight: 500 }}>
        📅 养护倒计时
      </div>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {taskCountdowns.map((task, index) => (
          <div key={index}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: '#333' }}>
                {task.taskIcon} {task.taskType}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: getStatusColor(task),
                  fontWeight: 500,
                }}
              >
                {getStatusText(task)}
              </span>
            </div>
            <CustomProgressBar task={task} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
              <span style={{ fontSize: '10px', color: '#999' }}>
                已过 {formatElapsedTime(task.elapsedHours)} / 共 {task.intervalDays}天
                {task.windowPeriod > 0 && ` (窗口期±${task.windowPeriod / 2}天)`}
              </span>
              <span style={{ fontSize: '10px', color: '#999' }}>
                {task.progressPercent}%
              </span>
            </div>
          </div>
        ))}
      </Space>
    </div>
  )
}

export default PlantTaskProgress
