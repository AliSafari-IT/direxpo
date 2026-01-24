import { describe, it, expect } from 'vitest';

// Helper functions exported from FilePickerModal
function isUnder(prefix: string, path: string): boolean {
    if (prefix === '') return true;
    return path === prefix || path.startsWith(prefix + '/');
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

function isFolderEffectivelyExcluded(folderPath: string, excludedFolders: Set<string>): boolean {
    if (excludedFolders.has(folderPath)) return true;
    return hasExcludedAncestor(folderPath, excludedFolders);
}

function isFileEffectivelySelected(
    filePath: string,
    selectedFiles: Set<string>,
    selectedFolders: Set<string>,
    excludedFiles: Set<string>,
    excludedFolders: Set<string>
): boolean {
    if (excludedFiles.has(filePath)) return false;
    if (hasExcludedAncestor(filePath, excludedFolders)) return false;
    if (selectedFiles.has(filePath)) return true;
    
    // Check if file is under a selected folder
    for (const folder of selectedFolders) {
        if (folder === '' || filePath.startsWith(folder + '/')) {
            return true;
        }
    }
    return false;
}

describe('Folder Exclusion Logic', () => {
    it('should exclude files under an excluded folder', () => {
        const selectedFolders = new Set(['server']);
        const excludedFolders = new Set(['server/src']);
        const selectedFiles = new Set<string>();
        const excludedFiles = new Set<string>();

        const file1 = 'server/src/a.ts';
        const file2 = 'server/src/b.ts';
        const file3 = 'server/output/c.ts';

        expect(isFileEffectivelySelected(file1, selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(false);
        expect(isFileEffectivelySelected(file2, selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(false);
        expect(isFileEffectivelySelected(file3, selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(true);
    });

    it('should exclude files when parent folder is excluded', () => {
        const selectedFolders = new Set(['server']);
        const excludedFolders = new Set(['server/src']);
        const selectedFiles = new Set<string>();
        const excludedFiles = new Set<string>();

        const file = 'server/src/tree-router.ts';
        expect(isFolderEffectivelyExcluded('server/src', excludedFolders)).toBe(true);
        expect(isFileEffectivelySelected(file, selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(false);
    });

    it('should respect explicit file exclusions', () => {
        const selectedFolders = new Set(['server']);
        const excludedFolders = new Set<string>();
        const selectedFiles = new Set<string>();
        const excludedFiles = new Set(['.gitignore']);

        const file1 = 'server/.gitignore';
        const file2 = 'server/src/a.ts';

        expect(isFileEffectivelySelected(file1, selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(false);
        expect(isFileEffectivelySelected(file2, selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(true);
    });

    it('should handle nested excluded folders', () => {
        const selectedFolders = new Set(['server']);
        const excludedFolders = new Set(['server/src', 'server/src/routes']);
        const selectedFiles = new Set<string>();
        const excludedFiles = new Set<string>();

        const file1 = 'server/src/a.ts';
        const file2 = 'server/src/routes/b.ts';
        const file3 = 'server/output/c.ts';

        expect(isFileEffectivelySelected(file1, selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(false);
        expect(isFileEffectivelySelected(file2, selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(false);
        expect(isFileEffectivelySelected(file3, selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(true);
    });

    it('should detect excluded ancestors correctly', () => {
        const excludedFolders = new Set(['server/src']);

        expect(hasExcludedAncestor('server/src/a.ts', excludedFolders)).toBe(true);
        expect(hasExcludedAncestor('server/src/routes/b.ts', excludedFolders)).toBe(true);
        expect(hasExcludedAncestor('server/output/c.ts', excludedFolders)).toBe(false);
    });

    it('should detect selected ancestors correctly', () => {
        const selectedFolders = new Set(['server']);

        expect(hasSelectedAncestor('server/src/a.ts', selectedFolders)).toBe(true);
        expect(hasSelectedAncestor('server/output/c.ts', selectedFolders)).toBe(true);
        expect(hasSelectedAncestor('web/src/a.ts', selectedFolders)).toBe(false);
    });

    it('should handle isUnder utility correctly', () => {
        expect(isUnder('', 'server/src/a.ts')).toBe(true);
        expect(isUnder('server', 'server')).toBe(true);
        expect(isUnder('server', 'server/src/a.ts')).toBe(true);
        expect(isUnder('server', 'web/src/a.ts')).toBe(false);
        expect(isUnder('server/src', 'server/src/a.ts')).toBe(true);
        expect(isUnder('server/src', 'server/src')).toBe(true);
    });

    it('should compute effective selection with mixed inclusions and exclusions', () => {
        const selectedFolders = new Set(['server', 'web']);
        const excludedFolders = new Set(['server/src', 'web/node_modules']);
        const selectedFiles = new Set(['README.md']);
        const excludedFiles = new Set<string>();

        // Files that should be selected
        expect(isFileEffectivelySelected('server/output/a.ts', selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(true);
        expect(isFileEffectivelySelected('web/src/App.tsx', selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(true);
        expect(isFileEffectivelySelected('README.md', selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(true);

        // Files that should NOT be selected
        expect(isFileEffectivelySelected('server/src/a.ts', selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(false);
        expect(isFileEffectivelySelected('web/node_modules/pkg/index.js', selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(false);
        expect(isFileEffectivelySelected('other/file.txt', selectedFiles, selectedFolders, excludedFiles, excludedFolders)).toBe(false);
    });
});
