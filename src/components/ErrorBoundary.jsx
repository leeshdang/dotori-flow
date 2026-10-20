import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '';
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.hash = '';
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }}>
          <div style={{
            maxWidth: 500,
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #dfe1e6',
            borderRadius: 8,
            padding: 32,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(9, 30, 66, 0.12)'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#ffebe6',
              color: '#de350b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#172b4d', marginBottom: 8 }}>
              화면을 불러오는 중 일시적인 문제가 발생했습니다
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#5e6c84', marginBottom: 24, lineHeight: 1.5 }}>
              메인 화면으로 안전하게 돌아가거나 새로고침하여 계속 이용하실 수 있습니다.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={this.handleReset}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RotateCcw size={15} />
                새로고침
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={this.handleGoHome}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Home size={15} />
                메인 보드로 이동
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
