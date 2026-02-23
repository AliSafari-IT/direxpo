import express from 'express';
import { resolve, join, normalize, sep, relative } from 'path';
import { stat, mkdir, writeFile, readFile, readdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { once } from 'events';
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
    selectionPayload?: {
        selectedFiles: string[];
        selectedFolders: string[];
        excludedFiles: string[];
    };
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
    let maxSizeMb = 0;
    if (input.maxSizeMb !== undefined && typeof input.maxSizeMb === 'number') {
        maxSizeMb = input.maxSizeMb;
    } else if (input.maxSize !== undefined && typeof input.maxSize === 'number') {
        maxSizeMb = input.maxSize / (1024 * 1024);
    }
    if (maxSizeMb > 0 && isFinite(maxSizeMb)) {
        normalized.maxSize = maxSizeMb;
    }
    return normalized;
}

async function writeChunk(writeStream: ReturnType<typeof createWriteStream>, chunk: string): Promise<void> {
    if (!writeStream.write(chunk)) {
        await once(writeStream, 'drain');
    }
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


async function resolveSelectionPayload(
    rootAbs: string,
    payload: { selectedFiles: string[]; selectedFolders: string[]; excludedFiles: string[] },
    excludePatterns: string[],
    maxSizeMb: number
): Promise<{ valid: string[]; skipped: SkippedFile[] }> {
    const allFiles = new Set<string>();
    const skipped: SkippedFile[] = [];
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    for (const file of payload.selectedFiles) {
        allFiles.add(file);
    }

    for (const folder of payload.selectedFolders) {
        const folderAbs = resolveWithinRoot(rootAbs, folder);
        if (!folderAbs) {
            skipped.push({ relPath: folder, reason: 'Invalid folder path' });
            continue;
        }

        try {
            const files = await getAllFilesInFolder(folderAbs, rootAbs, excludePatterns);
            files.forEach(f => allFiles.add(f));
        } catch (error) {
            skipped.push({ relPath: folder, reason: 'Failed to read folder' });
        }
    }

    for (const excluded of payload.excludedFiles) {
        allFiles.delete(excluded);
    }

    const valid: string[] = [];
    for (const relPath of allFiles) {
        const fullPath = resolveWithinRoot(rootAbs, relPath);
        if (!fullPath) {
            skipped.push({ relPath, reason: 'Invalid path' });
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

async function getAllFilesInFolder(
    folderAbs: string,
    rootAbs: string,
    excludePatterns: string[]
): Promise<string[]> {
    const files: string[] = [];
    
    async function traverse(dirPath: string) {
        const entries = await readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = join(dirPath, entry.name);
            const relPath = relative(rootAbs, fullPath).replace(/\\/g, '/');
            
            if (isExcluded(relPath, excludePatterns)) {
                continue;
            }

            if (entry.isDirectory()) {
                await traverse(fullPath);
            } else if (entry.isFile()) {
                files.push(relPath);
            }
        }
    }
    
    await traverse(folderAbs);
    return files;
}

// Extensions that are always treated as readable text/code
const TEXT_EXTENSIONS = new Set([
    // Web
    'html', 'htm', 'xhtml', 'xml', 'svg', 'css', 'scss', 'sass', 'less',
    // Scripts / compiled
    'js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
    // Backend
    'py', 'rb', 'php', 'java', 'kt', 'kts', 'scala', 'groovy',
    'cs', 'fs', 'fsx', 'vb', 'cpp', 'cc', 'cxx', 'c', 'h', 'hpp',
    'go', 'rs', 'swift', 'dart', 'm', 'mm',
    'lua', 'pl', 'pm', 'r', 'jl', 'ex', 'exs', 'erl', 'hrl',
    'hs', 'lhs', 'clj', 'cljs', 'elm', 'ml', 'mli',
    // Shell / config
    'sh', 'bash', 'zsh', 'fish', 'ps1', 'psm1', 'psd1', 'bat', 'cmd',
    // Data / config
    'json', 'json5', 'jsonc', 'yaml', 'yml', 'toml', 'ini', 'cfg',
    'conf', 'config', 'env', 'properties', 'plist',
    // Docs / text
    'md', 'mdx', 'markdown', 'txt', 'rst', 'adoc', 'tex', 'csv', 'tsv',
    // Build / infra
    'dockerfile', 'makefile', 'cmake', 'gradle', 'bazel', 'bzl',
    'tf', 'tfvars', 'hcl', 'nix', 'lock',
    // Misc code
    'graphql', 'gql', 'proto', 'thrift', 'avsc', 'wasm_text', 'wat',
    'sql', 'prisma', 'pug', 'jade', 'haml', 'ejs', 'hbs', 'mustache',
    'njk', 'twig', 'liquid', 'erb',
    // Editor / project
    'editorconfig', 'eslintrc', 'prettierrc', 'babelrc', 'npmrc',
    'gitignore', 'gitattributes', 'htaccess',
]);

// Files with no extension that are always text
const TEXT_BASENAMES = new Set([
    'dockerfile', 'makefile', 'gemfile', 'rakefile', 'procfile',
    'vagrantfile', 'brewfile', 'jenkinsfile', 'caddyfile',
    '.gitignore', '.gitattributes', '.editorconfig', '.npmrc',
    '.env', '.env.local', '.env.example', '.htaccess',
]);

async function isBinaryFile(fullPath: string, ext: string): Promise<boolean> {
    // Known text extension — definitely not binary
    if (TEXT_EXTENSIONS.has(ext.toLowerCase())) return false;

    // Known text basename
    const basename = fullPath.split(/[\/\\]/).pop()?.toLowerCase() ?? '';
    if (TEXT_BASENAMES.has(basename)) return false;

    // Unknown extension: sniff first 8 KB for null bytes
    try {
        const { open } = await import('fs/promises');
        const fh = await open(fullPath, 'r');
        try {
            const buf = Buffer.alloc(8192);
            const { bytesRead } = await fh.read(buf, 0, 8192, 0);
            for (let i = 0; i < bytesRead; i++) {
                if (buf[i] === 0) return true;
            }
            return false;
        } finally {
            await fh.close();
        }
    } catch {
        return true; // Can't read → treat as binary to be safe
    }
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
    
    let included = 0;
    
    relPaths.sort();
    
    const writeStream = createWriteStream(outputPath, 'utf-8');
    
    await writeChunk(writeStream, '# Selected Files Export\n\n');
    
    let skippedBinary = 0;
    let skippedError = 0;

    // Process files sequentially and respect stream backpressure
    for (const relPath of relPaths) {
        const fullPath = join(rootAbs, relPath);
        const ext = relPath.split('.').pop() ?? '';

        try {
            if (await isBinaryFile(fullPath, ext)) {
                skippedBinary++;
                await writeChunk(writeStream, `## ${relPath}\n\n`);
                await writeChunk(writeStream, `> *Binary file — content not exported.*\n\n`);
                continue;
            }

            const content = await readFile(fullPath, 'utf-8');
            included++;

            const needsNewline = !content.endsWith('\n');
            const codeBlockEnd = needsNewline ? '\n```\n\n' : '```\n\n';

            await writeChunk(writeStream, `## ${relPath}\n\n`);
            await writeChunk(writeStream, '```' + ext + '\n');
            await writeChunk(writeStream, content);
            await writeChunk(writeStream, codeBlockEnd);
        } catch (error) {
            skippedError++;
            await writeChunk(writeStream, `## ${relPath}\n\n`);
            await writeChunk(writeStream, `*Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}*\n\n`);
        }
    }

    await new Promise<void>((resolve, reject) => {
        writeStream.on('error', reject);
        writeStream.end(() => resolve());
    });

    // Use the actual on-disk file size — string .length counts UTF-16 code units,
    // not UTF-8 bytes, and any later prependToFile call would not be counted anyway.
    const { size: bytesWritten } = await stat(outputPath);

    return {
        outputMarkdownPath: outputPath,
        report: {
            included,
            bytesWritten,
            counts: {
                totalMatched: relPaths.length,
                included,
                skippedBinary,
                skippedLarge: 0,
                skippedError,
            }
        }
    };
}

async function prependToFile(filePath: string, prefix: string): Promise<void> {
    const tmpPath = filePath + '.tmp';
    const writeStream = createWriteStream(tmpPath, 'utf-8');
    await writeChunk(writeStream, prefix);
    const { createReadStream } = await import('fs');
    const { rename } = await import('fs/promises');
    await new Promise<void>((resolve, reject) => {
        const readStream = createReadStream(filePath);
        readStream.on('error', reject);
        readStream.on('end', () => {
            writeStream.end(() => resolve());
        });
        readStream.on('data', (chunk: Buffer | string) => {
            if (!writeStream.write(chunk)) {
                readStream.pause();
                writeStream.once('drain', () => readStream.resume());
            }
        });
    });
    await rename(tmpPath, filePath);
}

export function createExportRouter(opts: { outputDir?: string } = {}) {
    const router = express.Router();
    const OUTPUT_DIR = resolve(opts.outputDir ?? join(process.cwd(), '.output'));
    
    mkdir(OUTPUT_DIR, { recursive: true }).catch(() => {});
    
    router.post('/run', async (req, res) => {
        try {
            const body = req.body;
            if (!body || typeof body !== 'object' || !body.options) {
                return res.status(400).json({ error: 'Request body must contain an options object.' });
            }

            const { options }: { options: ExportOptions } = body;

            if (!options.targetPath || typeof options.targetPath !== 'string' || !options.targetPath.trim()) {
                return res.status(400).json({ error: 'targetPath is required and must be a non-empty string.' });
            }

            const { includeTree, treeOnly, selectionPayload, ...baseOptions } = options;
            
            const rootAbs = resolveRoot(baseOptions.targetPath);

            // Validate the target path exists and is a directory before doing any work
            try {
                const rootStat = await stat(rootAbs);
                if (!rootStat.isDirectory()) {
                    return res.status(400).json({
                        error: `Target path is not a directory: ${baseOptions.targetPath}`,
                    });
                }
            } catch (e: any) {
                if (e.code === 'ENOENT') {
                    return res.status(400).json({
                        error: `Target path does not exist: ${baseOptions.targetPath}`,
                    });
                }
                if (e.code === 'EACCES' || e.code === 'EPERM') {
                    return res.status(400).json({
                        error: `Permission denied reading target path: ${baseOptions.targetPath}`,
                    });
                }
                throw e;
            }

            const normalizedOpts = normalizeOptions(baseOptions);
            const excludePatterns = parseExcludePatterns(baseOptions.exclude);
            const maxSizeMb = normalizedOpts.maxSize || 50;
            
            let filePaths: string[] = [];
            let skipped: SkippedFile[] = [];
            
            if (selectionPayload) {
                const result = await resolveSelectionPayload(
                    rootAbs,
                    selectionPayload,
                    excludePatterns,
                    maxSizeMb
                );
                filePaths = result.valid;
                skipped = result.skipped;
                
                if (filePaths.length === 0) {
                    return res.status(400).json({
                        error: 'No valid files selected',
                        skipped
                    });
                }
            }
            
            if (treeOnly) {
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
                const { size: treeBytesWritten } = await stat(outputPath);
                
                res.json({
                    outputPath,
                    report: {
                        included: paths.length,
                        bytesWritten: treeBytesWritten,
                        treeOnly: true,
                    },
                    exportedCount: paths.length,
                    skipped
                });
                return;
            }
            
            if (filePaths.length === 0) {
                filePaths = await discoverFiles(normalizedOpts);
                if (filePaths.length === 0) {
                    return res.status(400).json({
                        error: 'No files matched the current filters. Try changing the File Type filter, adjusting the exclude list, or selecting files manually.',
                    });
                }
            }

            let result = await exportSelectedFiles(rootAbs, filePaths, OUTPUT_DIR, maxSizeMb);

            if (includeTree && result.outputMarkdownPath) {
                try {
                    const treeSection = generateTreeSection(filePaths, baseOptions.targetPath);
                    if (treeSection) {
                        await prependToFile(result.outputMarkdownPath, treeSection + '\n');
                    }
                } catch {
                }
            }

            // Re-stat after prependToFile so bytesWritten reflects the final on-disk size
            const { size: finalBytesWritten } = await stat(result.outputMarkdownPath);
            
            res.json({
                outputPath: result.outputMarkdownPath,
                report: { ...result.report, bytesWritten: finalBytesWritten },
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
