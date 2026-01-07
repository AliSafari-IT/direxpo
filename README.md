# direxpo: a folder dir/contents to markdown exporter

A powerful tool for converting code projects into beautifully formatted Markdown files with optional folder structure visualization.

## 🚀 Features

- **Modern Web Interface**: Professional multi-page SPA with ASafariM design tokens
- **Folder Structure Tree**: Optional hierarchical tree visualization with box-drawing characters
- **Smart Filtering**: Filter by file types (TypeScript, CSS, Markdown, JSON, etc.)
- **Custom Patterns**: Support for glob patterns and custom exclusions
- **Tree-Only Export**: Export just the folder structure without file contents
- **File Size Control**: Set maximum file size limits
- **One-Click Actions**: Download, copy to clipboard, or open in default editor
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 📁 Project Structure

```
direxpo/
├─ server/                    # Backend API server
│  ├─ src/
│  │  ├─ server.ts           # Express server with export endpoints
│  │  ├─ file-discoverer.ts  # File discovery and filtering
│  │  └─ tree-builder.ts     # Tree structure generation
│  ├─ package.json
│  └─ tsconfig.json
├─ web/                       # Frontend React application
│  ├─ src/
│  │  ├─ components/
│  │  │  └─ Navbar.tsx       # Navigation component
│  │  ├─ pages/
│  │  │  ├─ ExportPage.tsx   # Main export interface
│  │  │  ├─ FeaturesPage.tsx # Feature showcase
│  │  │  ├─ HowToPage.tsx    # Usage documentation
│  │  │  └─ GettingStartedPage.tsx # Welcome page
│  │  ├─ api.ts              # API client functions
│  │  ├─ App.tsx             # Main app with routing
│  │  └─ main.tsx            # React entry point
│  ├─ index.html
│  └─ package.json
├─ package.json               # Root workspace configuration
└─ README.md                  # This file
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/AliSafari-IT/direxpo.git
   cd direxpo
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development servers**

   ```bash
   pnpm dev
   ```

   This will start both the web interface and API server:
   - Web UI: <http://localhost:5198>
   - API Server: <http://localhost:5199>

## 🌐 Web Interface

The modern web interface provides an intuitive way to export your projects:

### Pages

- **Export** (`/`) - Main export tool with all options
- **Features** (`/features`) - Feature showcase and capabilities
- **How To** (`/how-to`) - Usage guide for CLI and web interface
- **Getting Started** (`/getting-started`) - Welcome and quick start guide

### Export Options

| Option | Description |
|--------|-------------|
| **Target Path** | Directory to export (absolute or relative) |
| **Filter** | File type filtering (All, TypeScript/React, CSS, Markdown, JSON, Custom) |
| **Glob Pattern** | Custom file patterns (when filter is set to "Custom") |
| **Exclude Directories** | Comma-separated list of directories to exclude |
| **Max File Size** | Maximum file size in MB |
| **Include Folder Structure** | Add hierarchical tree at the top of the export |
| **Tree Only** | Export only the folder structure (no file contents) |

### Tree Structure Format

When folder structure is enabled, the export includes a beautiful tree visualization:

```
direxpo/
├─ server/
│  ├─ src/
│  │  ├─ file-discoverer.ts
│  │  ├─ server.ts
│  │  └─ tree-builder.ts
│  └─ package.json
├─ web/
│  ├─ src/
│  │  ├─ components/
│  │  │  └─ Navbar.tsx
│  │  ├─ pages/
│  │  │  └─ ExportPage.tsx
│  │  └── App.tsx
│  └─ package.json
└─ package.json
```

## � Tutorial & Getting Started

### Quick Start (5 minutes)

#### Step 1: Start the Application

```bash
# Navigate to the project directory
cd direxpo

# Install dependencies (first time only)
pnpm install

# Start both web UI and API server
pnpm dev
```

The application will be available at:
- **Web UI**: http://localhost:5198
- **API Server**: http://localhost:5199

#### Step 2: Export Your First Project

1. Open http://localhost:5198 in your browser
2. Navigate to the **Export** page (default landing page)
3. Enter a target path (e.g., `./src` or `C:\Users\YourName\Projects\MyApp`)
4. Select export options:
   - **Filter**: Choose file types (All, TypeScript/React, CSS, Markdown, JSON)
   - **Max File Size**: Set to 50 MB (default)
   - **Include Folder Structure**: Check to add a tree visualization
5. Click **Export**
6. Download the generated Markdown file or copy to clipboard

#### Step 3: Customize Your Export

Try these common scenarios:

**Scenario A: Export only TypeScript/React files with structure**
- Target Path: `./src`
- Filter: `TypeScript/React`
- Include Folder Structure: ✓
- Result: Clean markdown with folder tree and only .ts/.tsx files

**Scenario B: Export project documentation**
- Target Path: `./docs`
- Filter: `Markdown`
- Exclude: `node_modules,.git`
- Result: All markdown files in a single document

**Scenario C: Get folder structure only (no file contents)**
- Target Path: `./`
- Tree Only: ✓
- Result: Lightweight folder hierarchy visualization

### Web Interface Tutorial

#### The Export Page

The main export interface has four sections:

**1. Target Path Input**
```
Enter the directory you want to export.
Examples:
  - Relative: ./src, ../projects/myapp
  - Absolute: /home/user/projects/app, C:\Users\User\Projects\App
```

**2. Filter Options**
- **All**: Include every file type
- **TypeScript/React**: Only .ts, .tsx, .js, .jsx files
- **CSS**: Only .css, .scss, .less files
- **Markdown**: Only .md files
- **JSON**: Only .json files
- **Custom**: Use glob patterns for advanced filtering

**3. Advanced Options**
- **Exclude Directories**: Comma-separated list (default: `node_modules,.git,dist`)
- **Max File Size**: Files larger than this are skipped (in MB)
- **Include Folder Structure**: Prepend a tree visualization
- **Tree Only**: Export only the folder structure (no file contents)

**4. Action Buttons**
- **Export**: Generate the markdown file
- **Download**: Save to your computer
- **Copy**: Copy to clipboard
- **Open**: Open in your default editor

#### Understanding the Output

A typical export looks like:

```markdown
# Export Report

**Target Path**: ./src
**Filter**: TypeScript/React
**Total Files**: 12
**Total Size**: 45.2 KB

---

## Folder Structure

src/
├─ components/
│  ├─ Button.tsx
│  ├─ Card.tsx
│  └─ Modal.tsx
├─ pages/
│  ├─ Home.tsx
│  └─ About.tsx
├─ utils/
│  ├─ helpers.ts
│  └─ constants.ts
└─ App.tsx

---

## File Contents

### src/components/Button.tsx

\`\`\`tsx
import React from 'react';

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};
\`\`\`

[... more files ...]
```

### Programmatic Usage (JavaScript/TypeScript)

#### Using the Web API

```typescript
// api.ts - Example client code

import { runExport, downloadMarkdown, getMarkdownContent } from './api';

// Example 1: Run export and get response
async function exportProject() {
  try {
    const response = await runExport({
      targetPath: './src',
      filter: 'tsx',
      exclude: ['node_modules', 'dist'],
      maxSize: 50,
      includeTree: true,
      treeOnly: false,
    });

    console.log('Export completed!');
    console.log(`Output: ${response.outputPath}`);
    console.log(`Files included: ${response.report.included}`);
  } catch (error) {
    console.error('Export failed:', error);
  }
}

// Example 2: Get markdown content as string
async function getExportContent() {
  try {
    const filename = 'export_2024-01-06T152234.md';
    const content = await getMarkdownContent(filename);
    console.log(content);
  } catch (error) {
    console.error('Failed to fetch content:', error);
  }
}

// Example 3: Download file to disk
async function downloadExport() {
  try {
    const filename = 'export_2024-01-06T152234.md';
    const blob = await downloadMarkdown(filename);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
}

// Example 4: Open file in default editor
async function openExportInEditor() {
  try {
    const filename = 'export_2024-01-06T152234.md';
    await openFile(filename);
  } catch (error) {
    console.error('Failed to open file:', error);
  }
}
```

#### Using the REST API Directly

```bash
# Example 1: Basic export
curl -X POST http://localhost:5199/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "targetPath": "./src",
      "filter": "tsx",
      "exclude": ["node_modules", "dist"],
      "maxSize": 50,
      "includeTree": true
    }
  }'

# Example 2: Tree-only export
curl -X POST http://localhost:5199/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "targetPath": "./",
      "treeOnly": true
    }
  }'

# Example 3: Custom glob pattern
curl -X POST http://localhost:5199/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "targetPath": "./src",
      "filter": "glob",
      "pattern": "**/*.{ts,tsx,css}",
      "exclude": ["node_modules", ".git", "dist"],
      "maxSize": 100
    }
  }'

# Example 4: Download generated file
curl -X GET http://localhost:5199/api/download/export_2024-01-06T152234.md \
  -o export.md

# Example 5: Open file in editor
curl -X POST http://localhost:5199/api/open-file \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "export_2024-01-06T152234.md"
  }'
```

### Real-World Examples

#### Example 1: Document a React Component Library

```bash
# Export all React components with structure
curl -X POST http://localhost:5199/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "targetPath": "./src/components",
      "filter": "tsx",
      "exclude": ["node_modules", ".test.tsx"],
      "maxSize": 100,
      "includeTree": true
    }
  }'
```

**Use case**: Create documentation for your component library by exporting all components with their folder structure.

#### Example 2: Backup Project Structure

```bash
# Get complete folder structure without file contents
curl -X POST http://localhost:5199/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "targetPath": "./",
      "treeOnly": true,
      "exclude": ["node_modules", ".git", "dist", "build"]
    }
  }'
```

**Use case**: Quick snapshot of your project structure for documentation or sharing.

#### Example 3: Export Configuration Files

```bash
# Export all JSON and YAML configuration files
curl -X POST http://localhost:5199/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "targetPath": "./",
      "filter": "glob",
      "pattern": "**/*.{json,yaml,yml,config.js}",
      "exclude": ["node_modules", "dist"],
      "maxSize": 50,
      "includeTree": true
    }
  }'
```

**Use case**: Collect all configuration files for review or migration.

#### Example 4: Export Specific Feature Module

```bash
# Export a specific feature with all its files
curl -X POST http://localhost:5199/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "targetPath": "./src/features/auth",
      "filter": "tsx",
      "exclude": ["node_modules", ".test.tsx"],
      "maxSize": 100,
      "includeTree": true
    }
  }'
```

**Use case**: Share a specific feature module with team members or for code review.

## �💻 CLI Usage

The tool also supports command-line usage through the `@asafarim/md-exporter` package.

### Basic Usage

```bash
npx @asafarim/direxpo export <target-path>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--filter` | string | `all` | File type filter (`all`, `tsx`, `css`, `md`, `json`) |
| `--pattern` | string | - | Custom glob pattern (when filter is `glob`) |
| `--exclude` | string | `node_modules,.git,dist` | Directories to exclude |
| `--max-size` | number | `5` | Maximum file size in MB |
| `--include-tree` | boolean | `false` | Include folder structure |
| `--tree-only` | boolean | `false` | Export only folder structure |
| `--out-dir` | string | `./output` | Output directory |

### Examples

```bash
# Export all files
npx @asafarim/direxpo export ./src

# Export TypeScript files with folder structure
npx @asafarim/direxpo export ./src --filter tsx --include-tree

# Export only folder structure
npx @asafarim/direxpo export ./src --tree-only

# Custom pattern with exclusions
npx @asafarim/direxpo export ./src --pattern "**/*.{ts,tsx}" --exclude "node_modules,dist"
```

## 🔧 API Reference

The server provides RESTful endpoints for programmatic access.

### Endpoints

#### POST `/api/run`

Execute an export operation.

**Request Body:**

```json
{
  "options": {
    "targetPath": "./src",
    "filter": "tsx",
    "pattern": "**/*.{ts,tsx}",
    "exclude": ["node_modules", "dist"],
    "maxSize": 5,
    "includeTree": true,
    "treeOnly": false
  }
}
```

**Response:**

```json
{
  "outputPath": "D:\\path\\to\\output.md",
  "report": {
    "included": 42,
    "bytesWritten": 15342,
    "treeOnly": false
  }
}
```

#### POST `/api/discover`

Discover files matching export options (without exporting).

**Request Body:**

```json
{
  "options": {
    "targetPath": "./src",
    "filter": "tsx",
    "exclude": ["node_modules"]
  }
}
```

**Response:**

```json
{
  "files": [
    "src/components/Button.tsx",
    "src/pages/Home.tsx"
  ]
}
```

#### GET `/api/download/:filename`

Download generated markdown file.

#### POST `/api/open-file`

Open file in default system application.

**Request Body:**

```json
{
  "filename": "export_2024-01-06T152234.md"
}
```

## 🎨 Design System

The web interface uses ASafariM design tokens for consistent styling:

- **Colors**: `--asm-color-primary-500`, `--asm-color-surface`, etc.
- **Typography**: `--asm-font-family-primary`, `--asm-font-size-lg`, etc.
- **Spacing**: `--asm-space-4`, `--asm-space-6`, etc.
- **Effects**: `--asm-effect-shadow-md`, `--asm-radius-lg`, etc.

No hardcoded values are used - everything follows the design token system.

## 🚀 Development

### Project Structure

- **Monorepo**: Uses pnpm workspaces
- **TypeScript**: Full type safety
- **React 18**: Modern frontend with hooks
- **Express**: Backend API server
- **Vite**: Fast development and build tool

### Scripts

```json
{
  "dev": "concurrently \"pnpm run exmd:web\" \"pnpm run exmd:server\"",
  "exmd:web": "pnpm -C web dev",
  "exmd:server": "pnpm -C server dev",
  "build": "pnpm -C web build && pnpm -C server build",
  "start": "concurrently \"pnpm run exmd:web:prod\" \"pnpm run exmd:server:prod\""
}
```

### Adding New Features

1. **Backend**: Add endpoints in `server/src/server.ts`
2. **Frontend**: Create components in `web/src/components/`
3. **Pages**: Add pages in `web/src/pages/`
4. **API**: Update `web/src/api.ts` for new endpoints
5. **Routing**: Update `web/src/App.tsx` for new pages

### Code Style

- Use ASafariM design tokens for all styling
- Follow TypeScript best practices
- Use semantic HTML elements
- Implement proper error handling
- Add loading states and user feedback

## 🔒 Security Considerations

- **File Access**: Server only accesses specified target directories
- **Path Validation**: Prevents directory traversal attacks
- **File Size Limits**: Configurable maximum file size protection
- **Exclusions**: Default exclusions for sensitive directories (`.git`, `node_modules`)

## 🐛 Troubleshooting

### Common Issues

**"File not found" error**

- Check that the target path exists
- Use absolute paths or ensure relative paths are correct
- Verify file permissions

**Empty export**

- Check filter settings
- Verify exclude patterns aren't too restrictive
- Ensure files match the size limit

**Tree structure not showing**

- Ensure `includeTree` or `treeOnly` is enabled
- Check that files were discovered successfully

**Server connection issues**

- Ensure API server is running on port 5199
- Check for firewall or port conflicts
- Verify CORS configuration

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=direxpo:* pnpm dev
```

## 📝 License

This project is licensed under the MIT License - see the package.json for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/AliSafari-IT/direxpo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AliSafari-IT/direxpo/discussions)
- **Author**: Ali Safari

---

Made with ❤️ using ASafariM design tokens and modern web technologies.
