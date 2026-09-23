"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Family records screen failed", error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-stone-900">
          <h1 className="text-2xl font-semibold">We hit a snag</h1>
          <p className="mt-2 text-sm text-stone-600">
            This page ran into an unexpected problem. Your saved family records are not affected.
          </p>
          <button
            type="button"
            className="mt-6 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white"
            onClick={() => this.setState({ failed: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
