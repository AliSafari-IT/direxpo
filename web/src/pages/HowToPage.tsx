import './HowToPage.css';

export default function HowToPage() {
    return (
        <div className="howto-page">
            <div className="howto-container">
                <div className="howto-header">
                    <h1>How To Use</h1>
                    <p>Learn how to use MD Exporter on the web and CLI</p>
                </div>

                <div className="howto-section">
                    <h2>🌐 Web Interface</h2>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h4>Enter Target Path</h4>
                                <p>Specify the directory you want to export. Examples:</p>
                                <code>D:\my-project\src</code>
                                <code>/home/user/project</code>
                            </div>
                        </div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h4>Choose File Type</h4>
                                <p>Select which files to include:</p>
                                <ul>
                                    <li><strong>All Files</strong> - Everything</li>
                                    <li><strong>TypeScript/React</strong> - .ts, .tsx, .js, .jsx</li>
                                    <li><strong>CSS</strong> - .css files</li>
                                    <li><strong>Markdown</strong> - .md files</li>
                                    <li><strong>JSON</strong> - .json files</li>
                                    <li><strong>Custom Pattern</strong> - Use glob patterns</li>
                                </ul>
                            </div>
                        </div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h4>Configure Options</h4>
                                <p>Set exclusions and size limits:</p>
                                <ul>
                                    <li>Exclude directories (comma-separated)</li>
                                    <li>Max file size in MB</li>
                                    <li>Include folder structure (optional)</li>
                                    <li>Tree-only export (optional)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h4>Export & Download</h4>
                                <p>Click "Export" and then:</p>
                                <ul>
                                    <li>Download the markdown file</li>
                                    <li>Or copy content to clipboard</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="howto-section">
                    <h2>💻 Command Line Interface</h2>
                    <div className="cli-section">
                        <h4>Installation</h4>
                        <pre><code>npm install -g @asafarim/md-exporter</code></pre>

                        <h4>Basic Usage</h4>
                        <pre><code>md-exporter --target ./src</code></pre>

                        <h4>With Options</h4>
                        <pre><code>md-exporter --target ./src \
  --filter tsx \
  --exclude node_modules,.git,dist \
  --max-size 5 \
  --include-tree</code></pre>

                        <h4>Tree-Only Export</h4>
                        <pre><code>md-exporter --target ./src --tree-only</code></pre>

                        <h4>Custom Pattern</h4>
                        <pre><code>md-exporter --target ./src \
  --filter glob \
  --pattern "**/*.ts"</code></pre>

                        <h4>Available Options</h4>
                        <div className="options-table">
                            <div className="option-row">
                                <div className="option-name"><code>--target</code></div>
                                <div className="option-desc">Target directory path (required)</div>
                            </div>
                            <div className="option-row">
                                <div className="option-name"><code>--filter</code></div>
                                <div className="option-desc">File type: all, tsx, css, md, json, glob</div>
                            </div>
                            <div className="option-row">
                                <div className="option-name"><code>--pattern</code></div>
                                <div className="option-desc">Glob pattern (when filter=glob)</div>
                            </div>
                            <div className="option-row">
                                <div className="option-name"><code>--exclude</code></div>
                                <div className="option-desc">Comma-separated directories to exclude</div>
                            </div>
                            <div className="option-row">
                                <div className="option-name"><code>--max-size</code></div>
                                <div className="option-desc">Max file size in MB</div>
                            </div>
                            <div className="option-row">
                                <div className="option-name"><code>--include-tree</code></div>
                                <div className="option-desc">Include folder structure</div>
                            </div>
                            <div className="option-row">
                                <div className="option-name"><code>--tree-only</code></div>
                                <div className="option-desc">Export only folder structure</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="howto-section">
                    <h2>💡 Tips & Tricks</h2>
                    <div className="tips-grid">
                        <div className="tip-card">
                            <h4>📁 Quick Project Overview</h4>
                            <p>Use tree-only export to quickly share your project structure without code.</p>
                        </div>
                        <div className="tip-card">
                            <h4>🔍 Focus on Specific Files</h4>
                            <p>Use custom patterns to export only the files you care about.</p>
                        </div>
                        <div className="tip-card">
                            <h4>📚 Documentation</h4>
                            <p>Include folder structure for better navigation in your documentation.</p>
                        </div>
                        <div className="tip-card">
                            <h4>⚡ Large Projects</h4>
                            <p>Use size limits and exclusions to keep exports manageable.</p>
                        </div>
                        <div className="tip-card">
                            <h4>🤖 Automation</h4>
                            <p>Use the CLI in scripts for automated documentation generation.</p>
                        </div>
                        <div className="tip-card">
                            <h4>🔄 Version Control</h4>
                            <p>Commit exports to track how your project structure evolves.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
