import { useState, useEffect, useRef } from 'react';
import './FilePickerModal.css';

interface TreeNode {
    type: 'dir' | 'file';
    name: string;
    relPath: string;
    size?: number;
    hasChildren?: boolean;
}

export interface SelectionPayload {
    selectedFiles: string[];
    selectedFolders: string[];
    excludedFiles: string[];
    excludedFolders: string[];
}

export interface SelectionStats {
    effectiveFiles: number;
    hasUnloadedFolders: boolean;
}

function normalizePath(path: string): string {
    if (!path) return '';
    return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+/g, '/');
}

function hasSelectedAncestor(path: string, selectedFolders: Set<string>): boolean {
    for (const folder of selectedFolders) {
        if (folder !== '' && path.startsWith(folder + '/')) {
            return true;
        }
    }
    return false;
}

function hasExcludedAncestor(path: string, excludedFolders: Set<string>): boolean {
    for (const folder of excludedFolders) {
        if (folder !== '' && path.startsWith(folder + '/')) {
            return true;
        }
    }
    return false;
}

function isFolderEffectivelySelected(folderPath: string, selectedFolders: Set<string>): boolean {
    if (selectedFolders.has(folderPath)) return true;
    for (const folder of selectedFolders) {
        if (folder === '' || folderPath.startsWith(folder + '/')) {
            return true;
        }
    }
    return false;
}

function isFolderEffectivelyExcluded(folderPath: string, excludedFolders: Set<string>): boolean {
    if (excludedFolders.has(folderPath)) return true;
    return hasExcludedAncestor(folderPath, excludedFolders);
}


interface FilePickerModalProps {
    isOpen: boolean;
    targetPath: string;
    excludeCsv: string;
    fileTypeFilter: string;
    initialPayload?: SelectionPayload | null;
    onCancel: () => void;
    onApply: (payload: SelectionPayload, stats: SelectionStats) => void;
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
    initialPayload,
    onCancel,
    onApply
}: FilePickerModalProps) {
    const [rootNodes, setRootNodes] = useState<LoadedNode[]>([]);
    const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
    const [loadedChildren, setLoadedChildren] = useState<Map<string, TreeNode[]>>(new Map());
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(
        new Set(initialPayload?.selectedFiles || [])
    );
    const [selectedFolders, setSelectedFolders] = useState<Set<string>>(
        new Set(initialPayload?.selectedFolders || [])
    );
    const [excludedFiles, setExcludedFiles] = useState<Set<string>>(
        new Set(initialPayload?.excludedFiles || [])
    );
    const [excludedFolders, setExcludedFolders] = useState<Set<string>>(
        new Set(initialPayload?.excludedFolders || [])
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen && targetPath) {
            if (!initialPayload) {
                setSelectedFiles(new Set());
                setSelectedFolders(new Set());
                setExcludedFiles(new Set());
                setExcludedFolders(new Set());
            } else {
                setSelectedFiles(new Set((initialPayload.selectedFiles || []).map(normalizePath)));
                setSelectedFolders(new Set((initialPayload.selectedFolders || []).map(normalizePath)));
                setExcludedFiles(new Set((initialPayload.excludedFiles || []).map(normalizePath)));
                setExcludedFolders(new Set((initialPayload.excludedFolders || []).map(normalizePath)));
            }
            loadRootNodes();
            if (initialPayload && (initialPayload.selectedFolders.length > 0 || initialPayload.selectedFiles.length > 0)) {
                ensurePathsLoadedAndExpanded(initialPayload);
            }
        }
    }, [isOpen, targetPath, excludeCsv, fileTypeFilter, initialPayload]);

    const ensurePathsLoadedAndExpanded = async (payload: SelectionPayload) => {
        const pathsToExpand = new Set<string>();
        
        for (const folder of payload.selectedFolders) {
            const parts = folder.split('/');
            for (let i = 0; i < parts.length - 1; i++) {
                pathsToExpand.add(parts.slice(0, i + 1).join('/'));
            }
        }
        
        for (const file of payload.selectedFiles) {
            const parts = file.split('/');
            for (let i = 0; i < parts.length - 1; i++) {
                pathsToExpand.add(parts.slice(0, i + 1).join('/'));
            }
        }
        
        for (const file of payload.excludedFiles) {
            const parts = file.split('/');
            for (let i = 0; i < parts.length - 1; i++) {
                pathsToExpand.add(parts.slice(0, i + 1).join('/'));
            }
        }
        
        const newExpanded = new Set(expandedDirs);
        for (const path of pathsToExpand) {
            newExpanded.add(path);
            await loadChildren(path);
        }
        setExpandedDirs(newExpanded);
    };

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
            const normalizedNodes = data.nodes.map((node: TreeNode) => ({
                ...node,
                relPath: normalizePath(node.relPath)
            }));
            setRootNodes(normalizedNodes);
            setLoadedChildren(new Map([['', normalizedNodes]]));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load directory');
        } finally {
            setLoading(false);
        }
    };

    const loadChildren = async (relPath: string) => {
        const normalizedPath = normalizePath(relPath);
        if (loadedChildren.has(normalizedPath)) {
            return;
        }

        try {
            const params = new URLSearchParams({
                root: targetPath,
                rel: normalizedPath,
                filter: fileTypeFilter,
                exclude: excludeCsv
            });
            const response = await fetch(`/api/tree/children?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to load: ${response.statusText}`);
            }
            const data = await response.json();
            const normalizedNodes = data.nodes.map((node: TreeNode) => ({
                ...node,
                relPath: normalizePath(node.relPath)
            }));
            setLoadedChildren(prev => new Map(prev).set(normalizedPath, normalizedNodes));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load directory');
        }
    };
    
    const loadTree = () => {
        loadRootNodes();
    };

    const isFileEffectivelySelected = (filePath: string): boolean => {
        if (excludedFiles.has(filePath)) return false;
        if (hasExcludedAncestor(filePath, excludedFolders)) return false;
        if (selectedFiles.has(filePath)) return true;
        return isFolderEffectivelySelected(filePath, selectedFolders) && !hasExcludedAncestor(filePath, excludedFolders);
    };

    const getAllLoadedFilesUnder = (folderPath: string): string[] => {
        const files: string[] = [];
        const traverse = (path: string) => {
            const children = loadedChildren.get(path);
            if (!children) return;
            
            for (const child of children) {
                if (child.type === 'file') {
                    files.push(child.relPath);
                } else {
                    traverse(child.relPath);
                }
            }
        };
        traverse(folderPath);
        return files;
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

    const toggleFileSelection = (filePath: string) => {
        const normalizedPath = normalizePath(filePath);
        const hasAncestorFolder = Array.from(selectedFolders).some(folder => 
            normalizedPath.startsWith(folder + '/') || normalizedPath === folder
        );

        if (hasAncestorFolder) {
            const newExcluded = new Set(excludedFiles);
            if (excludedFiles.has(normalizedPath)) {
                newExcluded.delete(normalizedPath);
            } else {
                newExcluded.add(normalizedPath);
            }
            setExcludedFiles(newExcluded);
        } else {
            const newSelected = new Set(selectedFiles);
            if (selectedFiles.has(normalizedPath)) {
                newSelected.delete(normalizedPath);
            } else {
                newSelected.add(normalizedPath);
            }
            setSelectedFiles(newSelected);
        }
    };

    const toggleFolderSelection = (folderPath: string) => {
        const normalizedFolder = normalizePath(folderPath);
        const newFolders = new Set(selectedFolders);
        const newFiles = new Set(selectedFiles);
        const newExcluded = new Set(excludedFiles);
        const newExcludedFolders = new Set(excludedFolders);

        const hasAncestorFolder = hasSelectedAncestor(normalizedFolder, selectedFolders);
        const isDirectlySelected = selectedFolders.has(normalizedFolder);

        if (hasAncestorFolder) {
            // Folder is covered by a selected ancestor: toggle exclusion
            if (newExcludedFolders.has(normalizedFolder)) {
                // Remove exclusion
                newExcludedFolders.delete(normalizedFolder);
                // Clean up any excludedFiles under this folder
                Array.from(newExcluded).forEach(path => {
                    if (path.startsWith(normalizedFolder + '/')) {
                        newExcluded.delete(path);
                    }
                });
            } else {
                // Add exclusion
                newExcludedFolders.add(normalizedFolder);
                // Clean up selectedFiles under this folder
                Array.from(newFiles).forEach(path => {
                    if (path.startsWith(normalizedFolder + '/')) {
                        newFiles.delete(path);
                    }
                });
            }
        } else if (isDirectlySelected) {
            // Folder is explicitly selected: deselect it
            newFolders.delete(normalizedFolder);
            // Clean up excludedFiles under this folder
            Array.from(newExcluded).forEach(path => {
                if (path.startsWith(normalizedFolder + '/') || path === normalizedFolder) {
                    newExcluded.delete(path);
                }
            });
            // Clean up excludedFolders under this folder
            Array.from(newExcludedFolders).forEach(path => {
                if (path.startsWith(normalizedFolder + '/') || path === normalizedFolder) {
                    newExcludedFolders.delete(path);
                }
            });
        } else {
            // Folder is not selected: select it
            newFolders.add(normalizedFolder);
            // Clean up selectedFiles under this folder (redundant with folder selection)
            Array.from(newFiles).forEach(path => {
                if (path.startsWith(normalizedFolder + '/') || path === normalizedFolder) {
                    newFiles.delete(path);
                }
            });
            // Clean up excludedFiles under this folder
            Array.from(newExcluded).forEach(path => {
                if (path.startsWith(normalizedFolder + '/') || path === normalizedFolder) {
                    newExcluded.delete(path);
                }
            });
            // Clean up excludedFolders under this folder
            Array.from(newExcludedFolders).forEach(path => {
                if (path.startsWith(normalizedFolder + '/') || path === normalizedFolder) {
                    newExcludedFolders.delete(path);
                }
            });
        }

        setSelectedFolders(newFolders);
        setSelectedFiles(newFiles);
        setExcludedFiles(newExcluded);
        setExcludedFolders(newExcludedFolders);
    };

    const getFolderCheckState = (folderPath: string): { checked: boolean; indeterminate: boolean } => {
        // If folder is effectively excluded, show as unchecked
        if (isFolderEffectivelyExcluded(folderPath, excludedFolders)) {
            return { checked: false, indeterminate: false };
        }

        const isEffectivelySelected = isFolderEffectivelySelected(folderPath, selectedFolders);
        
        if (isEffectivelySelected) {
            // Check if any descendant is excluded
            const hasExcludedDescendantFolder = Array.from(excludedFolders).some(f => f.startsWith(folderPath + '/'));
            const hasExcludedDescendantFile = Array.from(excludedFiles).some(f => f.startsWith(folderPath + '/'));
            
            if (hasExcludedDescendantFolder || hasExcludedDescendantFile) {
                return { checked: true, indeterminate: true };
            }

            const loadedFiles = getAllLoadedFilesUnder(folderPath);
            if (loadedFiles.length === 0) {
                return { checked: true, indeterminate: false };
            }
            const allSelected = loadedFiles.every(f => isFileEffectivelySelected(f));
            if (allSelected) {
                return { checked: true, indeterminate: false };
            } else {
                return { checked: true, indeterminate: true };
            }
        }

        const hasSelectedDescendantFolder = Array.from(selectedFolders).some(f => f.startsWith(folderPath + '/'));
        const hasSelectedDescendantFile = Array.from(selectedFiles).some(f => f.startsWith(folderPath + '/'));
        const hasExcludedDescendantFolder = Array.from(excludedFolders).some(f => f.startsWith(folderPath + '/'));
        const hasExcludedDescendantFile = Array.from(excludedFiles).some(f => f.startsWith(folderPath + '/'));
        
        if (hasSelectedDescendantFolder || hasSelectedDescendantFile || hasExcludedDescendantFolder || hasExcludedDescendantFile) {
            return { checked: false, indeterminate: true };
        }

        const loadedFiles = getAllLoadedFilesUnder(folderPath);
        const selectedCount = loadedFiles.filter(f => isFileEffectivelySelected(f)).length;
        
        if (selectedCount === 0) {
            return { checked: false, indeterminate: false };
        } else if (selectedCount === loadedFiles.length) {
            return { checked: true, indeterminate: false };
        } else {
            return { checked: false, indeterminate: true };
        }
    };

    const selectAll = (nodes: TreeNode[]) => {
        const newFiles = new Set(selectedFiles);
        const addFiles = (nodeList: TreeNode[]) => {
            for (const node of nodeList) {
                if (node.type === 'file') {
                    newFiles.add(node.relPath);
                }
                const children = loadedChildren.get(node.relPath);
                if (children) {
                    addFiles(children);
                }
            }
        };
        addFiles(nodes);
        setSelectedFiles(newFiles);
    };

    const clearSelection = () => {
        setSelectedFiles(new Set());
        setSelectedFolders(new Set());
        setExcludedFiles(new Set());
        setExcludedFolders(new Set());
    };

    const getEffectiveSelectionCount = (): { count: number; hasUnloadedFolders: boolean } => {
        let count = 0;
        const countedFiles = new Set<string>();
        let hasUnloadedFolders = false;

        for (const file of selectedFiles) {
            const hasAncestor = Array.from(selectedFolders).some(f => file.startsWith(f + '/'));
            if (!hasAncestor && !excludedFiles.has(file) && !hasExcludedAncestor(file, excludedFolders)) {
                countedFiles.add(file);
                count++;
            }
        }

        const countFilesUnder = (folderPath: string): boolean => {
            const children = loadedChildren.get(folderPath);
            if (!children) {
                return true;
            }
            
            let hasUnloadedSubfolders = false;
            for (const child of children) {
                if (child.type === 'file') {
                    if (!excludedFiles.has(child.relPath) && !hasExcludedAncestor(child.relPath, excludedFolders) && !countedFiles.has(child.relPath)) {
                        countedFiles.add(child.relPath);
                        count++;
                    }
                } else {
                    if (!isFolderEffectivelyExcluded(child.relPath, excludedFolders)) {
                        const isUnloaded = countFilesUnder(child.relPath);
                        if (isUnloaded) {
                            hasUnloadedSubfolders = true;
                        }
                    }
                }
            }
            return hasUnloadedSubfolders;
        };

        for (const folder of selectedFolders) {
            const isUnloaded = countFilesUnder(folder);
            if (isUnloaded) {
                hasUnloadedFolders = true;
            }
        }

        return { count, hasUnloadedFolders };
    };

    const handleApply = () => {
        const { count, hasUnloadedFolders } = getEffectiveSelectionCount();
        const payload: SelectionPayload = {
            selectedFiles: Array.from(selectedFiles),
            selectedFolders: Array.from(selectedFolders),
            excludedFiles: Array.from(excludedFiles),
            excludedFolders: Array.from(excludedFolders)
        };
        const stats: SelectionStats = {
            effectiveFiles: count,
            hasUnloadedFolders
        };
        onApply(payload, stats);
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
                const filteredChildren = children?.filter(matchesSearch);
                const hasVisibleChildren = filteredChildren && filteredChildren.length > 0;

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
                                        {isExpanded && hasVisibleChildren ? '▼' : '▶'}
                                    </button>
                                    <FolderCheckbox
                                        folderPath={node.relPath}
                                        checkState={getFolderCheckState(node.relPath)}
                                        onToggle={() => toggleFolderSelection(node.relPath)}
                                    />
                                    <span className="node-icon">📁</span>
                                    <span className="node-name">{node.name}</span>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="checkbox"
                                        checked={isFileEffectivelySelected(node.relPath)}
                                        onChange={() => toggleFileSelection(node.relPath)}
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
                        {node.type === 'dir' && isExpanded && hasVisibleChildren && (
                            <div className="tree-children">
                                {renderTree(filteredChildren, depth + 1)}
                            </div>
                        )}
                    </div>
                );
            });
    };

    function FolderCheckbox({ checkState, onToggle }: { 
        folderPath: string;
        checkState: { checked: boolean; indeterminate: boolean };
        onToggle: () => void;
    }) {
        const checkboxRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (checkboxRef.current) {
                checkboxRef.current.indeterminate = checkState.indeterminate;
            }
        }, [checkState.indeterminate]);

        return (
            <input
                ref={checkboxRef}
                type="checkbox"
                checked={checkState.checked}
                onChange={onToggle}
                className="folder-checkbox"
            />
        );
    }
    
    const refreshTree = () => {
        setExpandedDirs(new Set<string>());
        setLoadedChildren(new Map<string, TreeNode[]>());
        loadTree();
    };

    // Refresh emoji
    const refreshIcon = '🔄';

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
                            {(() => {
                                const { count, hasUnloadedFolders } = getEffectiveSelectionCount();
                                return `${count}${hasUnloadedFolders ? '+' : ''} file${count !== 1 ? 's' : ''} selected`;
                            })()}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <div className="modal-actions-left">
                            <button onClick={() => selectAll(rootNodes)} className="btn-secondary">
                            Select All Visible
                        </button>
                        <button onClick={clearSelection} className="btn-secondary">
                            Clear Selection
                        </button>
                        </div>
                        <div className="modal-actions-right">
                            {/* TODO: Add refresh tree icon button */}
                            <button onClick={refreshTree} className="btn-ghost">
                                {'🔄'}
                            </button>
                        </div>
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
                        disabled={selectedFiles.size === 0 && selectedFolders.size === 0}
                    >
                        Apply Selection ({(() => {
                            const { count, hasUnloadedFolders } = getEffectiveSelectionCount();
                            return `${count}${hasUnloadedFolders ? '+' : ''}`;
                        })()})
                    </button>
                </div>
            </div>
        </div>
    );
}
