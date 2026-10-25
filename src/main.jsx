import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#060b18',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '560px',
            backgroundColor: '#0a152e',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ color: '#00f0ff', fontSize: '22px', fontWeight: 900, marginBottom: '12px' }}>
              Blueprint by QuintoNodo Tech
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
              Se detectó un conflicto en el almacenamiento de sesión de tu navegador. Pulsa el botón para restaurar la sesión limpia:
            </p>
            <div style={{
              background: '#060b18',
              padding: '12px',
              borderRadius: '12px',
              color: '#ef4444',
              fontSize: '12px',
              textAlign: 'left',
              marginBottom: '24px',
              overflow: 'auto',
              maxHeight: '120px',
              fontFamily: 'monospace'
            }}>
              {this.state.error?.message || 'Error de ejecución'}
            </div>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#0070f3',
                backgroundImage: 'linear-gradient(to right, #0070f3, #00f0ff)',
                color: '#060b18',
                fontWeight: 900,
                fontSize: '14px',
                padding: '12px 28px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Restablecer &amp; Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
