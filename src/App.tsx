import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

// 引入 shadcn 组件 (假设你已经安装)
import { Button } from '@/components/ui/button'

import './App.css'

// --- 模拟两个“页面”组件 ---

// 1. 首页 Dashboard
function Dashboard() {
  return (
    <div className='p-4 space-y-4'>
      <h2 className='text-2xl font-bold'>仪表盘</h2>
      <div className='grid grid-cols-2 gap-4'>
        <div className='p-6 border rounded-lg shadow-sm bg-card text-card-foreground'>
          <div className='text-sm text-muted-foreground'>系统状态</div>
          <div className='text-2xl font-bold text-green-500'>运行中</div>
        </div>
        {/* 更多卡片... */}
      </div>
    </div>
  )
}

// 2. 设置页 (使用 Query 获取数据)
function Settings() {
  // TanStack Query 正常工作，不需要路由
  const { data, isLoading } = useQuery({
    queryKey: ['app-version'],
    queryFn: () =>
      invoke<string>('get_app_version') // 假设 Rust 端有个命令
        .catch(() => 'v1.0.0 (Mock)') // 模拟返回值
  })

  return (
    <div className='p-4 space-y-4'>
      <h2 className='text-2xl font-bold'>设置</h2>
      <div className='p-4 border rounded'>当前版本: {isLoading ? '检查中...' : data}</div>
    </div>
  )
}

// --- 主 APP 布局 ---

export default function App() {
  // 使用简单的 state 来控制当前显示哪个 View
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard')

  return (
    <div className='flex h-screen w-screen overflow-hidden bg-background text-foreground'>
      {/* 侧边栏 */}
      <aside className='w-64 border-r bg-muted/40 p-4 flex flex-col gap-2'>
        <div className='text-xl font-bold px-4 py-2 mb-4'>My Tauri App</div>

        <Button
          variant={currentView === 'dashboard' ? 'default' : 'ghost'}
          className='justify-start'
          onClick={() => setCurrentView('dashboard')}
        >
          仪表盘
        </Button>

        <Button
          variant={currentView === 'settings' ? 'default' : 'ghost'}
          className='justify-start'
          onClick={() => setCurrentView('settings')}
        >
          系统设置
        </Button>
      </aside>

      {/* 主内容区域 */}
      <main className='flex-1 overflow-auto'>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'settings' && <Settings />}
      </main>
    </div>
  )
}
