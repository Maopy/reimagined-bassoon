import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from './components/theme-provider'
import { setupGlobalErrorHandling } from './lib/logger'
import App from './App'
import './App.css'

// 初始化全局错误捕获
setupGlobalErrorHandling()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // 缓存优化：数据在 5 分钟内保持新鲜
      staleTime: 1000 * 60 * 5,
      // 缓存保留 10 分钟
      gcTime: 1000 * 60 * 10,
      // 失败时重试 2 次
      retry: 2,
      // 指数退避重试延迟
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 3000),
    },
    mutations: {
      // 乐观更新失败时回滚
      retry: 1,
    },
  },
})

// 为视频查询设置默认值
queryClient.setQueryDefaults(['videoInfo'], {
  staleTime: 1000 * 60 * 10, // 10 分钟内相同 URL 不重新获取
  gcTime: 1000 * 60 * 30,    // 保留 30 分钟
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
