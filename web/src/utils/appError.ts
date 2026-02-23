export type ErrorCategory =
    | 'path_not_found'
    | 'path_invalid'
    | 'server_unreachable'
    | 'server_oom'
    | 'no_files_found'
    | 'no_files_selected'
    | 'export_failed'
    | 'download_failed'
    | 'permission_denied'
    | 'unknown';

export interface ClassifiedError {
    category: ErrorCategory;
    title: string;
    message: string;
    suggestions: string[];
    docsLink?: string;
}

const PATTERNS: Array<{ test: (msg: string) => boolean; result: Omit<ClassifiedError, 'message'> }> = [
    {
        test: (m) => /target path does not exist|path does not exist/i.test(m),
        result: {
            category: 'path_not_found',
            title: 'Path does not exist',
            suggestions: [
                'Check that the target path exists on disk.',
                'Use an absolute path (e.g. C:\\Users\\you\\project or /home/you/project).',
                'Make sure there are no typos — drive letters and folder names are case-sensitive on Linux/macOS.',
                'On Windows, verify the drive letter is correct (e.g. C:, D:).',
            ],
        },
    },
    {
        test: (m) => /not a directory/i.test(m),
        result: {
            category: 'path_invalid',
            title: 'Path is not a directory',
            suggestions: [
                'The target path points to a file, not a folder.',
                'Enter the path to the parent folder instead.',
            ],
        },
    },
    {
        test: (m) => /no files matched|no files found/i.test(m),
        result: {
            category: 'no_files_found',
            title: 'No files matched',
            suggestions: [
                'Change the File Type filter to "All Files".',
                'Remove or relax entries in the Exclude list.',
                'If using a custom glob pattern, verify it matches files in the target directory.',
                'Use File Selection to manually pick files.',
            ],
        },
    },
    {
        test: (m) => /ENOENT|no such file|not found|cannot find/i.test(m),
        result: {
            category: 'path_not_found',
            title: 'Path not found',
            suggestions: [
                'Check that the target path exists on disk.',
                'Use an absolute path (e.g. C:\\Users\\you\\project or /home/you/project).',
                'Make sure there are no typos in the path.',
            ],
        },
    },
    {
        test: (m) => /EACCES|EPERM|permission denied|access denied/i.test(m),
        result: {
            category: 'permission_denied',
            title: 'Permission denied',
            suggestions: [
                'Run the app with sufficient permissions to read the target directory.',
                'On Windows, try running the terminal as Administrator.',
                'On Linux/macOS, check folder ownership with ls -la.',
            ],
        },
    },
    {
        test: (m) => /ECONNRESET|ECONNREFUSED|fetch|network|proxy error|failed to fetch/i.test(m),
        result: {
            category: 'server_unreachable',
            title: 'Cannot reach the server',
            suggestions: [
                'Make sure the server is running: pnpm dev (or pnpm exmd:server).',
                'The server should be listening on http://localhost:5199.',
                'Check the terminal for server-side errors.',
                'If you just started the app, wait a few seconds and try again.',
            ],
        },
    },
    {
        test: (m) => /heap out of memory|heap limit|out of memory|OOM/i.test(m),
        result: {
            category: 'server_oom',
            title: 'Server ran out of memory',
            suggestions: [
                'The selected directory is too large. Use File Selection to pick specific files/folders.',
                'Add more directories to the Exclude list (e.g. node_modules, dist, .git).',
                'Reduce the Max File Size limit.',
                'Restart the server: pnpm exmd:server.',
            ],
        },
    },
    {
        test: (m) => /no valid files|no files selected|0 files/i.test(m),
        result: {
            category: 'no_files_selected',
            title: 'No files selected',
            suggestions: [
                'Open File Selection and check at least one file or folder.',
                'Make sure excluded files do not cover your entire selection.',
                'Verify the target path contains files matching your pattern.',
            ],
        },
    },
    {
        test: (m) => /export failed|500|internal server/i.test(m),
        result: {
            category: 'export_failed',
            title: 'Export failed',
            suggestions: [
                'Check the server terminal for a detailed error message.',
                'Make sure the target path is accessible by the server process.',
                'Try a smaller selection or add more exclusions.',
            ],
        },
    },
    {
        test: (m) => /download failed|blob|fetch.*download/i.test(m),
        result: {
            category: 'download_failed',
            title: 'Download failed',
            suggestions: [
                'The export file may have been deleted or moved.',
                'Run the export again and try downloading immediately.',
            ],
        },
    },
];

export function classifyError(raw: string | Error | unknown): ClassifiedError {
    const msg = raw instanceof Error ? raw.message : typeof raw === 'string' ? raw : String(raw);

    for (const { test, result } of PATTERNS) {
        if (test(msg)) {
            return { ...result, message: msg };
        }
    }

    return {
        category: 'unknown',
        title: 'Something went wrong',
        message: msg,
        suggestions: [
            'Check the browser console for more details.',
            'Check the server terminal for error output.',
            'Restart the server with pnpm exmd:server and try again.',
        ],
    };
}
