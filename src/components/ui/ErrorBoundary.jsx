import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="px-4 py-20 max-w-lg mx-auto text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-[#F5F5F0] font-semibold mb-2">Something went wrong</h2>
          <p className="text-[#888880] text-sm mb-4">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <pre className="text-left text-xs text-red-400 bg-[#1A1A1A] p-3 rounded-xl overflow-auto mb-4">
            {this.state.error?.stack?.slice(0, 400)}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.history.back() }}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-xl text-sm"
          >
            ← Go Back
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
