import { Component, type ReactNode, type ErrorInfo } from 'react';
import { classifyError } from '../utils/appError';
import './ErrorBoundary.css';

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    detailsOpen: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null, detailsOpen: false };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });
        console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null, detailsOpen: false });
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        const classified = classifyError(this.state.error);

        return (
            <div className="error-boundary" role="alert">
                <div className="error-boundary-card">
                    <div className="error-boundary-icon">💥</div>
                    <h2 className="error-boundary-title">
                        {this.props.fallbackTitle ?? classified.title}
                    </h2>
                    <p className="error-boundary-message">{classified.message}</p>

                    <div className="error-boundary-suggestions">
                        <p className="error-boundary-suggestions-label">What you can try:</p>
                        <ol>
                            {classified.suggestions.map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ol>
                    </div>

                    <div className="error-boundary-actions">
                        <button className="btn-primary" onClick={this.handleReset}>
                            Try again
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => this.setState((s) => ({ detailsOpen: !s.detailsOpen }))}
                        >
                            {this.state.detailsOpen ? 'Hide details' : 'Show details'}
                        </button>
                    </div>

                    {this.state.detailsOpen && (
                        <details open className="error-boundary-details">
                            <summary>Stack trace</summary>
                            <pre>{this.state.error?.stack}</pre>
                            {this.state.errorInfo && (
                                <>
                                    <summary>Component stack</summary>
                                    <pre>{this.state.errorInfo.componentStack}</pre>
                                </>
                            )}
                        </details>
                    )}
                </div>
            </div>
        );
    }
}
