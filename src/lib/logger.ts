/**
 * 前端日志工具
 * 生产环境使用 Tauri 日志插件，开发环境使用 console
 */

const IS_DEV = import.meta.env.DEV

export const logger = {
  debug: (...args: unknown[]) => {
    if (IS_DEV) {
      console.debug('[DEBUG]', ...args)
    }
    // 生产环境可以通过 Tauri API 发送到 Rust 日志
  },

  info: (...args: unknown[]) => {
    console.info('[INFO]', ...args)
  },

  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args)
  },

  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args)
    // 可以在这里添加错误上报逻辑
  },
}

/**
 * 捕获全局错误
 */
export function setupGlobalErrorHandling() {
  window.addEventListener('error', (event) => {
    logger.error('Global error:', event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled rejection:', event.reason)
  })
}
