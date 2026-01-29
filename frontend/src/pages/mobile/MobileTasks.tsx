import { Tabs } from 'antd-mobile'
import { useTaskList } from '../../hooks/useTasks'
import MobileTaskList from '../../components/mobile/MobileTaskList'

/**
 * 移动端任务列表页
 *
 * 功能：
 * - Tab切换（今日/即将到期/逾期）
 * - 任务列表
 * - 滑动操作（完成/推迟）
 */
export default function MobileTasks() {
  const { taskList, isLoading } = useTaskList()

  const todayTasks = taskList?.todayTasks || []
  const upcomingTasks = taskList?.upcomingTasks || []
  const overdueTasks = taskList?.overdueTasks || []

  return (
    <div style={{ paddingBottom: 66 }}>
      <Tabs defaultActiveKey='today'>
        <Tabs.Tab title={`今日 ${todayTasks.length > 0 ? `(${todayTasks.length})` : ''}`} key='today'>
          <MobileTaskList tasks={todayTasks} isLoading={isLoading} />
        </Tabs.Tab>

        <Tabs.Tab title={`即将到期 ${upcomingTasks.length > 0 ? `(${upcomingTasks.length})` : ''}`} key='upcoming'>
          <MobileTaskList tasks={upcomingTasks} isLoading={isLoading} />
        </Tabs.Tab>

        <Tabs.Tab title={`逾期 ${overdueTasks.length > 0 ? `(${overdueTasks.length})` : ''}`} key='overdue'>
          <MobileTaskList tasks={overdueTasks} isLoading={isLoading} />
        </Tabs.Tab>
      </Tabs>
    </div>
  )
}
