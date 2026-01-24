import { useState, useRef, useEffect } from 'react';
import type { ExportOptions } from '@asafarim/md-exporter';
import { runExport, downloadMarkdown, getMarkdownContent, openFile } from '../api';
import FilePickerModal, { type SelectionPayload, type SelectionStats } from '../components/FilePickerModal';
import './ExportPage.css';

export default function ExportPage() {
    const [targetPath, setTargetPath] = useState('');
    const [filter, setFilter] = useState<ExportOptions['filter']>('all');
    const [pattern, setPattern] = useState('');
    const [exclude, setExclude] = useState('node_modules,.git,dist,bin,obj,logs,uploads,appsettings*.*');
    const [maxSize, setMaxSize] = useState(50);
    const [includeTree, setIncludeTree] = useState(false);
    const [treeOnly, setTreeOnly] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [selectionPayload, setSelectionPayload] = useState<SelectionPayload | null>(null);
    const [selectionStats, setSelectionStats] = useState<SelectionStats | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastTargetPath, setLastTargetPath] = useState('');
    const resultRef = useRef<HTMLDivElement>(null);
    const isHostedDemo = typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname);

    useEffect(() => {
        if (result && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    useEffect(() => {
        if (targetPath !== lastTargetPath) {
            if (selectionPayload) {
                setSelectionPayload(null);
                setSelectionStats(null);
            }
            setLastTargetPath(targetPath);
        }
    }, [targetPath, lastTargetPath]);

    const handleExport = async () => {
        if (!targetPath.trim()) {
            setError('Please enter a target path');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const options: any = {
                targetPath,
                filter,
                pattern: filter === 'glob' ? pattern : undefined,
                exclude: exclude.split(',').map(s => s.trim()),
                maxSize,
                includeTree: includeTree || treeOnly,
                treeOnly,
            };

            if (selectionPayload) {
                options.selectionPayload = selectionPayload;
            }
            
            console.log('Export - options:', options);

            const response = await runExport(options);
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!result?.outputPath) return;

        try {
            const filename = result.outputPath.split('\\').pop() || 'export.md';
            const blob = await downloadMarkdown(filename);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Download failed');
        }
    };

    const handleCopyContent = async () => {
        if (!result?.outputPath) return;

        try {
            const filename = result.outputPath.split('\\').pop() || 'export.md';
            const content = await getMarkdownContent(filename);
            await navigator.clipboard.writeText(content);
            alert('Markdown content copied to clipboard!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Copy failed');
        }
    };

    const handleOpenFile = async () => {
        if (!result?.outputPath) return;

        try {
            const filename = result.outputPath.split('\\').pop() || 'export.md';
            await openFile(filename);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to open file');
        }
    };

    return (
        <div className="export-page">
            <div className="export-container">
                <div className="export-header">
                    {isHostedDemo ? (
                        <div className="demo-sun-badge" role="status" aria-live="polite">
                            <div className="demo-sun-core">
                                <span className="demo-sun-title">Demo</span>
                                <span className="demo-sun-text">
                                    Run <code>pnpm dev</code> locally to export files
                                </span>
                            </div>
                        </div>
                    ) : null}
                    <h1>Export Your Code</h1>
                    <p>Convert your project into a beautifully formatted Markdown file</p>
                </div>

                <div className="export-content">
                    <div className="export-form">
                        <div className="form-group">
                            <label htmlFor="targetPath">Target Path *</label>
                            <input
                                type="text"
                                id="targetPath"
                                value={targetPath}
                                onChange={(e) => setTargetPath(e.target.value)}
                                placeholder="e.g., D:\my-project\src or /home/user/project"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="filter">File Type</label>
                                <select
                                    id="filter"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as ExportOptions['filter'])}
                                >
                                    <option value="all">All Files</option>
                                    <option value="tsx">TypeScript/React</option>
                                    <option value="css">CSS</option>
                                    <option value="md">Markdown</option>
                                    <option value="json">JSON</option>
                                    <option value="glob">Custom Pattern</option>
                                </select>
                            </div>

                            {filter === 'glob' && (
                                <div className="form-group">
                                    <label htmlFor="pattern">Pattern</label>
                                    <input
                                        type="text"
                                        id="pattern"
                                        value={pattern}
                                        onChange={(e) => setPattern(e.target.value)}
                                        placeholder="e.g., **/*.ts"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="exclude">Exclude Directories</label>
                            <input
                                type="text"
                                id="exclude"
                                value={exclude}
                                onChange={(e) => setExclude(e.target.value)}
                                placeholder="Comma-separated, e.g., node_modules,.git,dist"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="maxSize">Max File Size (MB)</label>
                                <input
                                    type="number"
                                    id="maxSize"
                                    value={maxSize}
                                    onChange={(e) => setMaxSize(Number(e.target.value))}
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="options-section">
                            <h3>Export Options</h3>

                            <div className="form-group checkbox">
                                <input
                                    type="checkbox"
                                    id="includeTree"
                                    checked={includeTree}
                                    onChange={(e) => setIncludeTree(e.target.checked)}
                                    disabled={treeOnly}
                                />
                                <label htmlFor="includeTree">Include folder structure at top</label>
                            </div>

                            <div className="form-group checkbox">
                                <input
                                    type="checkbox"
                                    id="treeOnly"
                                    checked={treeOnly}
                                    onChange={(e) => setTreeOnly(e.target.checked)}
                                />
                                <label htmlFor="treeOnly">
                                    <strong>Tree Only</strong> - Export only the folder structure
                                </label>
                            </div>

                            {treeOnly && (
                                <div className="alert alert-info">
                                    📁 Only the folder structure will be exported. File contents will be excluded.
                                </div>
                            )}
                        </div>

                        <div className="selection-section">
                            <h3>File Selection</h3>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                disabled={!targetPath.trim() || loading}
                                className="btn-secondary"
                                style={{ marginBottom: 'var(--asm-space-3)' }}
                            >
                                📂 Select Files...
                            </button>
                            {(() => {
                                const hasSelection = !!selectionPayload && (selectionPayload.selectedFiles.length > 0 || selectionPayload.selectedFolders.length > 0);
                                return (
                                    <>
                                        {hasSelection && (
                                            <div className="selection-summary">
                                                <div>
                                                    <div>
                                                        {selectionPayload.selectedFolders.length > 0 ? (
                                                            <>
                                                                Selected: {selectionStats?.effectiveFiles || 0}{selectionStats?.hasUnloadedFolders ? '+' : ''} file{(selectionStats?.effectiveFiles || 0) !== 1 ? 's' : ''}, {selectionPayload.selectedFolders.length} folder{selectionPayload.selectedFolders.length !== 1 ? 's' : ''}
                                                            </>
                                                        ) : (
                                                            <>
                                                                Selected: {selectionPayload.selectedFiles.length} file{selectionPayload.selectedFiles.length !== 1 ? 's' : ''}
                                                            </>
                                                        )}
                                                    </div>
                                                    {(selectionPayload.selectedFolders.length > 0 || selectionPayload.selectedFiles.length > 0) && (
                                                        <div style={{ fontSize: '0.85em', color: '#666', marginTop: '0.5em', maxHeight: '60px', overflow: 'auto' }}>
                                                            {selectionPayload.selectedFolders.length > 0 && (
                                                                <div>
                                                                    <strong>Folders:</strong> {selectionPayload.selectedFolders.join(', ')}
                                                                </div>
                                                            )}
                                                            {selectionPayload.selectedFiles.length > 0 && (
                                                                <div>
                                                                    <strong>Files:</strong> {selectionPayload.selectedFiles.slice(0, 3).join(', ')}{selectionPayload.selectedFiles.length > 3 ? ` +${selectionPayload.selectedFiles.length - 3} more` : ''}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '1em', marginTop: '0.5em' }}>
                                                    <button
                                                        onClick={() => setIsModalOpen(true)}
                                                        className="link-button"
                                                    >
                                                        Review / Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectionPayload(null);
                                                            setSelectionStats(null);
                                                        }}
                                                        className="link-button"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {!hasSelection && (
                                            <p className="hint-text">Leave empty to export all files matching filters</p>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={loading}
                            className="btn-primary export-button"
                        >
                            {loading ? 'Exporting...' : 'Export'}
                        </button>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    {result && (
                        <div className="export-result" ref={resultRef}>
                            <div className="alert alert-success">
                                ✅ Export successful!
                            </div>
                            <div className="result-info">
                                <p>
                                    <strong>Output:</strong> 
                                    <span className="output-path-container">
                                        {result.outputPath}
                                        <button 
                                            onClick={handleOpenFile}
                                            className="icon-button open-file-btn"
                                            title="Open file in default editor"
                                        >
                                            📂
                                        </button>
                                    </span>
                                </p>
                                <p>
                                    <strong>Files Included:</strong> {result.report?.included}
                                </p>
                                <p>
                                    <strong>Bytes Written:</strong> {result.report?.bytesWritten?.toLocaleString()}
                                </p>
                            </div>
                            <div className="result-actions">
                                <button onClick={handleDownload} className="btn-primary">
                                    ⬇️ Download Markdown
                                </button>
                                <button onClick={handleCopyContent} className="btn-secondary">
                                    📋 Copy to Clipboard
                                </button>
                                <button onClick={handleOpenFile} className="btn-secondary">
                                    📂 Open File
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <FilePickerModal
                isOpen={isModalOpen}
                targetPath={targetPath}
                excludeCsv={exclude}
                fileTypeFilter={filter || 'all'}
                initialPayload={selectionPayload}
                onCancel={() => setIsModalOpen(false)}
                onApply={(payload, stats) => {
                    console.log('ExportPage - onApply received payload:', payload, 'stats:', stats);
                    setSelectionPayload(payload);
                    setSelectionStats(stats);
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
