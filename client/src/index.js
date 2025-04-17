import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '5px',
          border: '1px solid #f5c6cb'
        }}>
          <h1>Something went wrong.</h1>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
            <summary>Error Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));

// Enable React strict mode for development
const renderApp = () => {
  try {
    console.log('Starting to render React app...');
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('React app rendered successfully');
  } catch (err) {
    console.error('Fatal error rendering React application:', err);
    
    // Render a simple fallback UI in case of catastrophic errors
    root.render(
      <div style={{ padding: '20px', margin: '20px' }}>
        <h1>Application Error</h1>
        <p>The application failed to load. Please try again later.</p>
        <pre>{err.toString()}</pre>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }
};

// Attempt to render the app
renderApp();

// Add global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});
