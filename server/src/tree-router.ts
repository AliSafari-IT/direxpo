import express from 'express';
import { readdir, stat } from 'fs/promises';
import { join, resolve, relative, normalize, sep } from 'path';

interface TreeNode {
    type: 'dir' | 'file';
    name: string;
    relPath: string;
    size?: number;
    hasChildren?: boolean;
}

interface TreeResponse {
    root: string;
    rel: string;
    nodes: TreeNode[];
}

function parseExcludePatterns(exclude: string): string[] {
    return exclude
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

function isExcluded(name: string, relPath: string, excludePatterns: string[]): boolean {
    for (const pattern of excludePatterns) {
        if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
            if (regex.test(name) || regex.test(relPath)) {
                return true;
            }
        } else {
            const segments = relPath.split(sep);
            if (segments.includes(pattern) || name === pattern) {
                return true;
            }
        }
    }
    return false;
}

function resolveRoot(targetPath: string): string {
    return normalize(resolve(targetPath));
}

function resolveWithinRoot(rootAbs: string, relPath: string): string | null {
    if (relPath && relPath.includes('\0')) {
        return null;
    }
    
    if (!relPath || relPath.trim() === '') {
        return normalize(rootAbs);
    }
    
    const normalized = normalize(relPath);
    if (normalized.startsWith('..') || normalized.includes(`${sep}..${sep}`) || normalized.includes(`${sep}..`)) {
        return null;
    }
    
    const fullPath = normalize(resolve(rootAbs, normalized));
    const rootNorm = normalize(rootAbs);
    
    if (process.platform === 'win32') {
        if (!fullPath.toLowerCase().startsWith(rootNorm.toLowerCase())) {
            return null;
        }
    } else {
        if (!fullPath.startsWith(rootNorm)) {
            return null;
        }
    }
    
    return fullPath;
}

function matchesFilter(filename: string, filter: string): boolean {
    if (filter === 'all') return true;
    
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (filter) {
        case 'tsx':
            return ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx';
        case 'css':
            return ext === 'css' || ext === 'scss' || ext === 'sass' || ext === 'less';
        case 'md':
            return ext === 'md' || ext === 'markdown';
        case 'json':
            return ext === 'json';
        default:
            return true;
    }
}

export function createTreeRouter() {
    const router = express.Router();
    
    router.get('/children', async (req, res) => {
        try {
            const { root, rel = '', filter = 'all', exclude = '' } = req.query;
            
            if (!root || typeof root !== 'string') {
                return res.status(400).json({ error: 'root parameter is required' });
            }
            
            const rootAbs = resolveRoot(root);
            const relPath = typeof rel === 'string' ? rel : '';
            const excludePatterns = parseExcludePatterns(typeof exclude === 'string' ? exclude : '');
            
            const targetPath = resolveWithinRoot(rootAbs, relPath);
            if (!targetPath) {
                return res.status(400).json({ error: 'Invalid path' });
            }
            
            const stats = await stat(targetPath);
            if (!stats.isDirectory()) {
                return res.status(400).json({ error: 'Path is not a directory' });
            }
            
            const entries = await readdir(targetPath, { withFileTypes: true });
            const nodes: TreeNode[] = [];
            
            for (const entry of entries) {
                const entryRelPath = relPath ? join(relPath, entry.name) : entry.name;
                
                if (isExcluded(entry.name, entryRelPath, excludePatterns)) {
                    continue;
                }
                
                if (entry.isDirectory()) {
                    nodes.push({
                        type: 'dir',
                        name: entry.name,
                        relPath: entryRelPath,
                        hasChildren: true
                    });
                } else if (entry.isFile()) {
                    if (matchesFilter(entry.name, typeof filter === 'string' ? filter : 'all')) {
                        const filePath = join(targetPath, entry.name);
                        const fileStats = await stat(filePath);
                        nodes.push({
                            type: 'file',
                            name: entry.name,
                            relPath: entryRelPath,
                            size: fileStats.size
                        });
                    }
                }
            }
            
            nodes.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'dir' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
            
            const response: TreeResponse = {
                root: rootAbs,
                rel: relPath,
                nodes
            };
            
            res.json(response);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    
    return router;
}
