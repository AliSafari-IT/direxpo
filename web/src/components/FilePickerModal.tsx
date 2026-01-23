import { useState, useEffect } from 'react';
import './FilePickerModal.css';

interface TreeNode {
    type: 'dir' | 'file';
    name: string;
    relPath: string;
    size?: number;
    hasChildren?: boolean;
}

interface FilePickerModalProps {
    isOpen: boolean;
    targetPath: string;
    excludeCsv: string;
    fileTypeFilter: string;
    initialSelected: Set<string>;
    onCancel: () => void;
    onApply: (selected: Set<string>) => void;
}

interface LoadedNode extends TreeNode {
    children?: TreeNode[];
    isExpanded?: boolean;
    isLoading?: boolean;
}

export default function FilePickerModal({
    isOpen,
    targetPath,
    excludeCsv,
    fileTypeFilter,
    initialSelected,
    onCancel,
    onApply
}: FilePickerModalProps) {
    const [rootNodes, setRootNodes] = useState<LoadedNode[]>([]);
    const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
    const [loadedChildren, setLoadedChildren] = useState<Map<string, TreeNode[]>>(new Map());
    const [selection, setSelection] = useState<Set<string>>(new Set(initialSelected));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen && targetPath) {
            loadRootNodes();
        }
    }, [isOpen, targetPath, excludeCsv, fileTypeFilter]);

    const loadRootNodes = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({
                root: targetPath,
                rel: '',
                filter: fileTypeFilter,
                exclude: excludeCsv
            });
            const response = await fetch(`/api/tree/children?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to load: ${response.statusText}`);
            }
            const data = await response.json();
            setRootNodes(data.nodes);
            setLoadedChildren(new Map([['', data.nodes]]));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load directory');
        } finally {
            setLoading(false);
        }
    };

    const loadChildren = async (relPath: string) => {
        if (loadedChildren.has(relPath)) {
            return;
        }

        try {
            const params = new URLSearchParams({
                root: targetPath,
                rel: relPath,
                filter: fileTypeFilter,
                exclude: excludeCsv
            });
            const response = await fetch(`/api/tree/children?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to load: ${response.statusText}`);
            }
            const data = await response.json();
            setLoadedChildren(prev => new Map(prev).set(relPath, data.nodes));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load directory');
        }
    };

    const toggleExpand = async (node: TreeNode) => {
        if (node.type !== 'dir') return;

        const newExpanded = new Set(expandedDirs);
        if (expandedDirs.has(node.relPath)) {
            newExpanded.delete(node.relPath);
        } else {
            newExpanded.add(node.relPath);
            await loadChildren(node.relPath);
        }
        setExpandedDirs(newExpanded);
    };

    const toggleSelection = (node: TreeNode) => {
        if (node.type !== 'file') return;

        const newSelection = new Set(selection);
        if (selection.has(node.relPath)) {
            newSelection.delete(node.relPath);
        } else {
            newSelection.add(node.relPath);
        }
        console.log('FilePickerModal - Toggle selection:', node.relPath, 'New selection size:', newSelection.size);
        setSelection(newSelection);
    };

    const selectAll = (nodes: TreeNode[]) => {
        const newSelection = new Set(selection);
        const addFiles = (nodeList: TreeNode[]) => {
            for (const node of nodeList) {
                if (node.type === 'file') {
                    newSelection.add(node.relPath);
                }
                const children = loadedChildren.get(node.relPath);
                if (children) {
                    addFiles(children);
                }
            }
        };
        addFiles(nodes);
        setSelection(newSelection);
    };

    const clearSelection = () => {
        setSelection(new Set());
    };

    const handleApply = () => {
        console.log('FilePickerModal - Apply clicked, selection:', Array.from(selection));
        onApply(selection);
    };

    const matchesSearch = (node: TreeNode): boolean => {
        if (!searchQuery) return true;
        return node.name.toLowerCase().includes(searchQuery.toLowerCase());
    };

    const renderTree = (nodes: TreeNode[], depth: number = 0): JSX.Element[] => {
        return nodes
            .filter(matchesSearch)
            .map(node => {
                const isExpanded = expandedDirs.has(node.relPath);
                const children = loadedChildren.get(node.relPath);
                const isSelected = selection.has(node.relPath);

                return (
                    <div key={node.relPath} className="tree-node">
                        <div 
                            className="tree-node-content" 
                            style={{ paddingLeft: `${depth * 20 + 8}px` }}
                        >
                            {node.type === 'dir' ? (
                                <>
                                    <button
                                        className="expand-button"
                                        onClick={() => toggleExpand(node)}
                                        aria-expanded={isExpanded}
                                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                    >
                                        {isExpanded ? '▼' : '▶'}
                                    </button>
                                    <span className="node-icon">📁</span>
                                    <span className="node-name">{node.name}</span>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelection(node)}
                                        className="file-checkbox"
                                    />
                                    <span className="node-icon">📄</span>
                                    <span className="node-name">{node.name}</span>
                                    {node.size !== undefined && (
                                        <span className="node-size">
                                            ({(node.size / 1024).toFixed(1)} KB)
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                        {node.type === 'dir' && isExpanded && children && (
                            <div className="tree-children">
                                {renderTree(children, depth + 1)}
                            </div>
                        )}
                    </div>
                );
            });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Select Files to Export</h2>
                    <button className="close-button" onClick={onCancel} aria-label="Close">
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <div className="modal-toolbar">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="selection-info">
                            {selection.size} file{selection.size !== 1 ? 's' : ''} selected
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button onClick={() => selectAll(rootNodes)} className="btn-secondary">
                            Select All Visible
                        </button>
                        <button onClick={clearSelection} className="btn-secondary">
                            Clear Selection
                        </button>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="tree-container">
                        {loading ? (
                            <div className="loading-message">Loading directory structure...</div>
                        ) : rootNodes.length === 0 ? (
                            <div className="empty-message">No files found</div>
                        ) : (
                            renderTree(rootNodes)
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onCancel} className="btn-secondary">
                        Cancel
                    </button>
                    <button 
                        onClick={handleApply} 
                        className="btn-primary"
                        disabled={selection.size === 0}
                    >
                        Apply Selection ({selection.size})
                    </button>
                </div>
            </div>
        </div>
    );
}
