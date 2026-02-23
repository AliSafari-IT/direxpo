import { useState, useRef, useEffect } from 'react';
import type { ExportOptions } from '@asafarim/md-exporter';
import { runExport, downloadMarkdown, getMarkdownContent, openFile } from '../api';
import FilePickerModal, { type SelectionPayload, type SelectionStats } from '../components/FilePickerModal';
import ErrorAlert from '../components/ErrorAlert';
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

    useEffect(() => {
        if (selectionPayload) {
            // Recalculate stats when payload changes
            const calculateStats = async () => {
                try {
                    const response = await fetch('/api/discover', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            options: {
                                targetPath,
                                selectionPayload,
                                filter,
                                exclude: exclude,
                                maxSize
                            }
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const effectiveCount = data.files ? data.files.length : 0;
                        const hasUnloaded = selectionPayload.selectedFolders.length > 0;
                        
                        setSelectionStats({
                            effectiveFiles: effectiveCount,
                            hasUnloadedFolders: hasUnloaded
                        });
                    }
                } catch (error) {
                    console.error('Failed to recalculate stats:', error);
                }
            };
            
            calculateStats();
        }
    }, [selectionPayload, targetPath, filter, exclude, maxSize]);

    const removeFileFromSelection = (filePath: string) => {
        if (!selectionPayload) return;
        
        const normalizedPath = filePath.replace(/\\/g, '/');
        const isUnderSelectedFolder = selectionPayload.selectedFolders.some(folder => 
            folder === '' || normalizedPath.startsWith(folder + '/')
        );
        
        const newPayload = { ...selectionPayload };
        
        if (isUnderSelectedFolder) {
            // Add to excludedFiles if under a selected folder
            newPayload.excludedFiles = [...newPayload.excludedFiles, normalizedPath].filter((v, i, a) => a.indexOf(v) === i);
        } else {
            // Remove from selectedFiles if not under a selected folder
            newPayload.selectedFiles = newPayload.selectedFiles.filter(f => f !== normalizedPath);
        }
        
        setSelectionPayload(newPayload);
    };

    const removeFolderFromSelection = (folderPath: string) => {
        if (!selectionPayload) return;
        
        const normalizedPath = folderPath.replace(/\\/g, '/');
        const newPayload = { ...selectionPayload };
        
        // Remove folder from selected folders
        newPayload.selectedFolders = newPayload.selectedFolders.filter(f => f !== normalizedPath);
        
        // Remove any excluded files that were under this folder
        newPayload.excludedFiles = newPayload.excludedFiles.filter(file => 
            !file.startsWith(normalizedPath + '/')
        );
        
        // Remove any excluded folders that were under this folder
        newPayload.excludedFolders = newPayload.excludedFolders.filter(folder => 
            !folder.startsWith(normalizedPath + '/')
        );
        
        // Remove any selected files that were under this folder
        newPayload.selectedFiles = newPayload.selectedFiles.filter(file => 
            !file.startsWith(normalizedPath + '/')
        );
        
        setSelectionPayload(newPayload);
    };

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
                                                <div className="selection-summary-header">
                                                    <div className="selection-summary-title">
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
                                                    <div className="selection-actions">
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

                                                {(selectionPayload.selectedFolders.length > 0 || selectionPayload.selectedFiles.length > 0 || selectionPayload.excludedFiles.length > 0) && (
                                                    <div className="selection-details">
                                                        {selectionPayload.selectedFolders.length > 0 && (
                                                            <div className="selection-group">
                                                                <div className="selection-group-label">📁 Folders</div>
                                                                <div className="selection-tags">
                                                                    {selectionPayload.selectedFolders.map(folder => (
                                                                        <span key={folder} className="selection-tag">
                                                                            {folder}
                                                                            <button
                                                                                onClick={() => removeFolderFromSelection(folder)}
                                                                                className="selection-tag-remove"
                                                                                title="Remove folder"
                                                                                aria-label={`Remove ${folder}`}
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {selectionPayload.selectedFiles.length > 0 && (
                                                            <div className="selection-group">
                                                                <div className="selection-group-label">📄 Files</div>
                                                                <div className="selection-tags">
                                                                    {selectionPayload.selectedFiles.slice(0, 5).map(file => (
                                                                        <span key={file} className="selection-tag">
                                                                            {file}
                                                                            <button
                                                                                onClick={() => removeFileFromSelection(file)}
                                                                                className="selection-tag-remove"
                                                                                title="Remove file"
                                                                                aria-label={`Remove ${file}`}
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                    {selectionPayload.selectedFiles.length > 5 && (
                                                                        <span className="selection-more">+{selectionPayload.selectedFiles.length - 5} more</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {selectionPayload.excludedFiles.length > 0 && (
                                                            <div className="selection-group">
                                                                <div className="selection-group-label">🚫 Excluded</div>
                                                                <div className="selection-tags">
                                                                    {selectionPayload.excludedFiles.slice(0, 5).map(file => (
                                                                        <span key={file} className="selection-tag excluded-tag">
                                                                            {file}
                                                                            <button
                                                                                onClick={() => {
                                                                                    const newPayload = { ...selectionPayload };
                                                                                    newPayload.excludedFiles = newPayload.excludedFiles.filter(f => f !== file);
                                                                                    setSelectionPayload(newPayload);
                                                                                }}
                                                                                className="excluded-tag-restore"
                                                                                title="Restore file"
                                                                                aria-label={`Restore ${file}`}
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                    {selectionPayload.excludedFiles.length > 5 && (
                                                                        <span className="selection-more">+{selectionPayload.excludedFiles.length - 5} more</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
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

                    {error && <ErrorAlert error={error} onDismiss={() => setError('')} />}

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
                                {(result.report?.counts?.skippedBinary > 0) && (
                                    <p>
                                        <strong>Binary Files Skipped:</strong> {result.report.counts.skippedBinary} <span style={{ color: 'var(--asm-color-text-muted)', fontSize: 'var(--asm-font-size-sm)' }}>(path listed, content omitted)</span>
                                    </p>
                                )}
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
