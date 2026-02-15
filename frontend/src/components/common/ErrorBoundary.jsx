import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100%',
                    width: '100%',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'rgba(239, 68, 68, 0.05)',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    padding: '2rem'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', textAlign: 'center' }}>
                        An unexpected error occurred in this module. Our team has been notified.
                        <br /><span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{this.state.error?.message}</span>
                    </p>
                    <button
                        onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Reload Component
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
