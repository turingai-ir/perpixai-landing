import { Component, type ReactNode } from 'react'

/** WebGL can fail to start (blocked, unsupported, out of memory): hand over to the static Pixo image. */
export class StageBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
