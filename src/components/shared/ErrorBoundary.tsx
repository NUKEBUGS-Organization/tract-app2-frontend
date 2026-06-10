import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errorMsg: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMsg: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMsg: error.message ?? 'Unknown error',
    }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-tract-alabaster px-4 font-inter">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tract-red-light">
            <AlertTriangle className="h-8 w-8 text-tract-red" strokeWidth={1.75} />
          </div>
          <div className="max-w-md text-center">
            <h1 className="mb-3 font-playfair text-[28px] font-bold text-tract-obsidian">Something went wrong</h1>
            <p className="mb-6 font-inter text-[14px] text-gray-500">
              An unexpected error occurred. Please refresh the page or contact support if the problem persists.
            </p>
            {import.meta.env.DEV ? (
              <p className="mb-6 break-words rounded-[8px] bg-tract-red-light px-4 py-3 text-left font-mono text-[12px] text-tract-red">
                {this.state.errorMsg}
              </p>
            ) : null}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-tract-gold px-6 py-3 font-inter text-[12px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-yellow-600"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh page
            </button>
            <a
              href="/login"
              className="flex items-center gap-2 border border-gray-200 bg-white px-6 py-3 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-50"
            >
              Back to login
            </a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
