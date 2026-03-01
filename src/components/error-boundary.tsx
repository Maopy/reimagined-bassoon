'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <div className="bg-destructive/10 text-destructive rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2">出错了</h2>
            <p className="text-sm mb-4 text-muted-foreground">
              {this.state.error?.message || '未知错误'}
            </p>
            <Button onClick={this.handleReset} variant="outline" size="sm">
              重试
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
