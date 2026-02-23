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
    const { includeTree, treeOnly, maxSize, selectionPayload, ...baseOptions } = options as any;

    const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            options: {
                ...baseOptions,
                maxSize: maxSize ? maxSize * 1024 * 1024 : undefined,
                includeTree,
                treeOnly,
                selectionPayload,
            }
        }),
    });

    if (!response.ok) {
        let message = `Export failed (${response.status})`;
        try {
            const body = await response.json();
            if (body?.error) message = body.error;
        } catch {
            message = `Export failed: ${response.statusText}`;
        }
        throw new Error(message);
    }

    return response.json();
}

export async function downloadMarkdown(filename: string): Promise<Blob> {
    const response = await fetch(`/api/download/${encodeURIComponent(filename)}`);

    if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
}

export async function getMarkdownContent(filename: string): Promise<string> {
    const response = await fetch(`/api/download/${encodeURIComponent(filename)}`);

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
        let message = `Failed to open file: ${response.statusText}`;
        try {
            const body = await response.json();
            if (body?.error) message = body.error;
        } catch { /* ignore */ }
        throw new Error(message);
    }
}
