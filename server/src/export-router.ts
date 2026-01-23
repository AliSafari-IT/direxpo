import express from 'express';
import { runExport } from '@asafarim/md-exporter';
import { readFile, writeFile, mkdir, stat } from 'fs/promises';
import { join, resolve, normalize, sep } from 'path';
import { discoverFiles, generateTreeSection } from '@asafarim/direxpo-core';

interface ExportOptions {
    targetPath: string;
    filter?: string;
    pattern?: string;
    exclude?: string | string[];
    maxSize?: number;
    maxSizeMb?: number;
    includeTree?: boolean;
    treeOnly?: boolean;
    selectedFiles?: string[];
}

interface SkippedFile {
    relPath: string;
    reason: string;
}

function normalizeOptions(input: any) {
    const normalized: any = {
        targetPath: input.targetPath,
    };
    if (input.filter) {
        normalized.filter = input.filter;
    }
    if (input.pattern && typeof input.pattern === 'string' && input.pattern.trim()) {
        normalized.pattern = input.pattern.trim();
        if (!input.filter) {
            normalized.filter = 'glob';
        }
    }
    if (input.exclude) {
        let excludeArray: string[] = [];
        if (typeof input.exclude === 'string') {
            excludeArray = input.exclude
                .split(/[,\n]+/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0);
        } else if (Array.isArray(input.exclude)) {
            excludeArray = input.exclude
                .map((s: any) => (typeof s === 'string' ? s.trim() : ''))
                .filter((s: string) => s.length > 0);
        }
        if (excludeArray.length > 0) {
            normalized.exclude = excludeArray;
        }
    }
    let maxSizeBytes = 0;
    if (input.maxSizeMb !== undefined && typeof input.maxSizeMb === 'number') {
        maxSizeBytes = input.maxSizeMb;
    } else if (input.maxSize !== undefined && typeof input.maxSize === 'number') {
        maxSizeBytes = input.maxSize / (1024 * 1024);
    }
    if (maxSizeBytes > 0 && isFinite(maxSizeBytes)) {
        normalized.maxSize = maxSizeBytes;
    }
    return normalized;
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

function parseExcludePatterns(exclude: string | string[] | undefined): string[] {
    if (!exclude) return [];
    if (Array.isArray(exclude)) return exclude;
    return exclude.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

function isExcluded(relPath: string, excludePatterns: string[]): boolean {
    const segments = relPath.split(sep);
    for (const pattern of excludePatterns) {
        if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
            if (regex.test(relPath)) {
                return true;
            }
        } else {
            if (segments.includes(pattern)) {
                return true;
            }
        }
    }
    return false;
}

async function validateSelectedFiles(
    rootAbs: string,
    selectedFiles: string[],
    excludePatterns: string[],
    maxSizeMb: number
): Promise<{ valid: string[], skipped: SkippedFile[] }> {
    const valid: string[] = [];
    const skipped: SkippedFile[] = [];
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    
    for (const relPath of selectedFiles) {
        if (!relPath || relPath.trim() === '') {
            skipped.push({ relPath, reason: 'Empty path' });
            continue;
        }
        
        const fullPath = resolveWithinRoot(rootAbs, relPath);
        if (!fullPath) {
            skipped.push({ relPath, reason: 'Path outside root or invalid' });
            continue;
        }
        
        if (isExcluded(relPath, excludePatterns)) {
            skipped.push({ relPath, reason: 'Excluded by pattern' });
            continue;
        }
        
        try {
            const stats = await stat(fullPath);
            if (!stats.isFile()) {
                skipped.push({ relPath, reason: 'Not a file' });
                continue;
            }
            
            if (maxSizeBytes > 0 && stats.size > maxSizeBytes) {
                skipped.push({ relPath, reason: `Exceeds max size (${maxSizeMb}MB)` });
                continue;
            }
            
            valid.push(relPath);
        } catch (error) {
            skipped.push({ relPath, reason: 'File not found or inaccessible' });
        }
    }
    
    return { valid, skipped };
}

async function exportSelectedFiles(
    rootAbs: string,
    relPaths: string[],
    outputDir: string,
    maxSizeMb: number
): Promise<any> {
    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '')
        .slice(0, -5);
    const filename = `selected_${timestamp}.md`;
    const outputPath = join(outputDir, filename);
    
    let markdown = '# Selected Files Export\n\n';
    let bytesRead = 0;
    let included = 0;
    
    relPaths.sort();
    
    for (const relPath of relPaths) {
        const fullPath = join(rootAbs, relPath);
        
        try {
            const content = await readFile(fullPath, 'utf-8');
            bytesRead += content.length;
            included++;
            
            const ext = relPath.split('.').pop() || '';
            markdown += `## ${relPath}\n\n`;
            markdown += '```' + ext + '\n';
            markdown += content;
            if (!content.endsWith('\n')) {
                markdown += '\n';
            }
            markdown += '```\n\n';
        } catch (error) {
            markdown += `## ${relPath}\n\n`;
            markdown += `*Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}*\n\n`;
        }
    }
    
    await writeFile(outputPath, markdown, 'utf-8');
    
    return {
        outputMarkdownPath: outputPath,
        report: {
            included,
            bytesWritten: markdown.length,
            counts: {
                totalMatched: relPaths.length,
                included,
                skippedBinary: 0,
                skippedLarge: 0,
                skippedError: 0
            }
        }
    };
}

export function createExportRouter(opts: { outputDir?: string } = {}) {
    const router = express.Router();
    const OUTPUT_DIR = resolve(opts.outputDir ?? join(process.cwd(), '.output'));
    
    mkdir(OUTPUT_DIR, { recursive: true }).catch(() => {});
    
    router.post('/run', async (req, res) => {
        try {
            const { options }: { options: ExportOptions } = req.body;
            const { includeTree, treeOnly, selectedFiles, ...baseOptions } = options;
            
            const rootAbs = resolveRoot(baseOptions.targetPath);
            const excludePatterns = parseExcludePatterns(baseOptions.exclude);
            const maxSizeMb = baseOptions.maxSizeMb || baseOptions.maxSize || 50;
            
            let filePaths: string[] = [];
            let skipped: SkippedFile[] = [];
            
            if (selectedFiles && selectedFiles.length > 0) {
                const validation = await validateSelectedFiles(rootAbs, selectedFiles, excludePatterns, maxSizeMb);
                filePaths = validation.valid;
                skipped = validation.skipped;
                
                if (filePaths.length === 0) {
                    return res.status(400).json({
                        error: 'No valid files selected',
                        skipped
                    });
                }
            }
            
            if (treeOnly) {
                const normalizedOpts = normalizeOptions(baseOptions);
                const paths = filePaths.length > 0
                    ? filePaths
                    : await discoverFiles(normalizedOpts);
                const treeSection = generateTreeSection(paths, baseOptions.targetPath);
                const timestamp = new Date()
                    .toISOString()
                    .replace(/[:.]/g, '')
                    .slice(0, -5);
                const filename = `tree_${timestamp}.md`;
                const outputPath = join(OUTPUT_DIR, filename);
                await writeFile(outputPath, treeSection, 'utf-8');
                
                res.json({
                    outputPath,
                    report: {
                        included: paths.length,
                        bytesWritten: treeSection.length,
                        treeOnly: true,
                    },
                    exportedCount: paths.length,
                    skipped
                });
                return;
            }
            
            const normalizedOpts = normalizeOptions(baseOptions);
            
            let result;
            
            if (filePaths.length > 0) {
                result = await exportSelectedFiles(rootAbs, filePaths, OUTPUT_DIR, maxSizeMb);
            } else {
                result = await runExport({
                    ...normalizedOpts,
                    outDir: OUTPUT_DIR,
                });
            }
            
            if (includeTree && result.outputMarkdownPath) {
                const paths = filePaths.length > 0
                    ? filePaths
                    : await discoverFiles(normalizedOpts);
                if (paths.length) {
                    try {
                        const markdownContent = await readFile(result.outputMarkdownPath, 'utf-8');
                        const treeSection = generateTreeSection(paths, baseOptions.targetPath);
                        if (treeSection) {
                            await writeFile(
                                result.outputMarkdownPath,
                                treeSection + '\n' + markdownContent,
                                'utf-8'
                            );
                        }
                    } catch {
                    }
                }
            }
            
            res.json({
                outputPath: result.outputMarkdownPath,
                report: result.report,
                exportedCount: filePaths.length || (result.report as any)?.included || 0,
                skipped
            });
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    
    return router;
}
