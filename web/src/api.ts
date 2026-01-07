import type { ExportOptions } from '@asafarim/md-exporter';

export type RunOptions = ExportOptions & {
    includeTree?: boolean;
    treeOnly?: boolean;
};

export interface RunExportResponse {
    outputPath: string;
    report: any;
    content?: string;
}

export async function runExport(options: RunOptions): Promise<RunExportResponse> {
    const { includeTree, maxSize, ...baseOptions } = options;

    const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            options: {
                ...baseOptions,
                maxSize: maxSize ? maxSize * 1024 * 1024 : undefined,
                includeTree,
            }
        }),
    });

    if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.json();
}

export async function downloadMarkdown(filename: string): Promise<Blob> {
    const response = await fetch(`/api/download/${filename}`);

    if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
}

export async function getMarkdownContent(filename: string): Promise<string> {
    const response = await fetch(`/api/download/${filename}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
    }

    return response.text();
}

export async function openFile(filename: string): Promise<void> {
    const response = await fetch('/api/open-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
        throw new Error(`Failed to open file: ${response.statusText}`);
    }
}
