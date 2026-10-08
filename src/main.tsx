import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Error Boundary для предотвращения белого экрана
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/50 rounded-xl p-8 max-w-md text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-red-400 mb-2">
              Что-то пошло не так
            </h1>
            <p className="text-gray-300 mb-4 text-sm">
              Произошла ошибка при загрузке приложения.
            </p>
            <details className="text-left text-xs text-gray-500 mb-4">
              <summary className="cursor-pointer hover:text-gray-300">
                Подробности ошибки
              </summary>
              <pre className="mt-2 p-2 bg-black/50 rounded overflow-auto text-red-300">
                {this.state.error?.message}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:from-blue-400 hover:to-cyan-400 transition-all"
            >
              🔄 Перезагрузить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
