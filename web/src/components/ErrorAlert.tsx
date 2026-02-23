import { useState } from 'react';
import { classifyError } from '../utils/appError';
import './ErrorAlert.css';

interface ErrorAlertProps {
    error: string | Error | unknown;
    onDismiss?: () => void;
}

export default function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
    const [expanded, setExpanded] = useState(false);
    const classified = classifyError(error);

    const categoryIcon: Record<string, string> = {
        path_not_found: '📂',
        path_invalid: '⚠️',
        server_unreachable: '🔌',
        server_oom: '💾',
        no_files_found: '🔍',
        no_files_selected: '🔍',
        export_failed: '❌',
        download_failed: '⬇️',
        permission_denied: '🔒',
        unknown: '⚠️',
    };

    const icon = categoryIcon[classified.category] ?? '⚠️';

    return (
        <div className="error-alert" role="alert" aria-live="assertive">
            <div className="error-alert-header">
                <span className="error-alert-icon">{icon}</span>
                <span className="error-alert-title">{classified.title}</span>
                <div className="error-alert-actions">
                    <button
                        className="error-alert-toggle"
                        onClick={() => setExpanded((v) => !v)}
                        aria-expanded={expanded}
                        title={expanded ? 'Hide details' : 'Show help'}
                    >
                        {expanded ? 'Hide help ▲' : 'How to fix ▼'}
                    </button>
                    {onDismiss && (
                        <button
                            className="error-alert-dismiss"
                            onClick={onDismiss}
                            aria-label="Dismiss error"
                            title="Dismiss"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <p className="error-alert-message">{classified.message}</p>

            {expanded && (
                <div className="error-alert-guidance">
                    <p className="error-alert-guidance-title">Suggestions:</p>
                    <ol className="error-alert-suggestions">
                        {classified.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ol>
                    {classified.docsLink && (
                        <a
                            href={classified.docsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="error-alert-docs-link"
                        >
                            📖 View documentation
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
