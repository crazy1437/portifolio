import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-cream-50 px-4">
          <div className="card-pop max-w-md p-10 text-center">
            <div className="text-6xl">🍳</div>
            <h1 className="mt-4 font-display text-3xl font-black">Something burned</h1>
            <p className="mt-2 font-semibold text-pulp-700">
              An unexpected error interrupted your order. The kitchen apologizes.
            </p>
            <button onClick={() => window.location.assign("/")} className="btn-pepper mt-6">
              Back to safety
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
