import './GettingStartedPage.css';

export default function GettingStartedPage() {
    const isHostedDemo = typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname);

    return (
        <div className="getting-started-page">
            <div className="getting-started-container">
                <section className="hero-section">
                    <div className="hero-content">
                        {!isHostedDemo ? (
                            <div className="demo-badge" role="status" aria-live="polite">
                                <span className="demo-indicator">Live demo</span>
                                <p>
                                    This view cannot export files. Run <code>pnpm dev</code> locally to unlock the full experience.
                                </p>
                            </div>
                        ) : null}
                        <p className="hero-eyebrow">Ship documentation instantly</p>
                        <h1>Welcome to direxpo</h1>
                        <p>Convert entire repositories into polished Markdown blueprints for onboarding, reviews, and sharing.</p>
                        <div className="hero-actions">
                            <a
                                className="hero-button btn-primary"
                                href="https://github.com/AliSafari-IT/direxpo"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Clone the repo
                            </a>
                            <a
                                className="hero-button btn-secondary"
                                href="https://alisafari-it.github.io/direxpo/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View live demo
                            </a>
                        </div>
                        <ul className="hero-highlights">
                            <li>✨ Tree view + contents in one file</li>
                            <li>⚡ Fast exports with smart filters</li>
                            <li>🔒 Runs locally—your code never leaves</li>
                        </ul>
                    </div>
                    <div className="hero-visual">
                        <div className="visual-card">
                            <div className="visual-chip">direxpo</div>
                            <p className="visual-title">./src</p>
                            <p className="visual-subtitle">components ─ hooks ─ api</p>
                            <div className="visual-meta">
                                <span>📁 124 files</span>
                                <span>🕒 2.4s</span>
                            </div>
                            <p className="visual-hint">Export ready → markdown.md</p>
                        </div>
                    </div>
                </section>

                <section className="important-notice">
                    <div className="notice-box warning">
                        <div className="notice-headline">
                            <span className="notice-pill">Important</span>
                            <h3>GitHub Pages Demo vs Local Setup</h3>
                        </div>
                        <p>
                            The GitHub Pages demo (<strong>https://alisafari-it.github.io/direxpo/</strong>) is a <strong>read-only preview</strong>
                            of the web interface. It <strong>cannot export files</strong> because it lacks a backend server to access your local file system.
                        </p>
                        <div className="notice-steps">
                            <p><strong>To unlock exports:</strong></p>
                            <ol>
                                <li>Clone the repository from GitHub</li>
                                <li>Install dependencies locally</li>
                                <li>Run the development server with <code>pnpm dev</code></li>
                                <li>Visit <code>http://localhost:5198</code></li>
                            </ol>
                        </div>
                    </div>
                </section>

                <section className="setup-section">
                    <div className="section-heading">
                        <h2>🚀 Local Setup (5 Minutes)</h2>
                        <p>Follow the four-step flow to run direxpo locally and unlock blazing fast exports.</p>
                    </div>
                    <div className="setup-steps">
                        <article className="setup-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h4>Clone the repository</h4>
                                <pre>
                                    <code>git clone https://github.com/AliSafari-IT/direxpo.git
cd direxpo</code>
                                </pre>
                            </div>
                        </article>

                        <article className="setup-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h4>Install dependencies</h4>
                                <pre>
                                    <code>pnpm install</code>
                                </pre>
                                <p><strong>Tip:</strong> Requires Node.js 18+ and pnpm (<code>npm install -g pnpm</code>).</p>
                            </div>
                        </article>

                        <article className="setup-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h4>Start dev server</h4>
                                <pre>
                                    <code>pnpm dev</code>
                                </pre>
                                <p>This boots both the API server and the web UI at <code>http://localhost:5198</code>.</p>
                            </div>
                        </article>

                        <article className="setup-step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h4>Start exporting</h4>
                                <p>
                                    Enter any directory path and export its contents to Markdown. Try the project itself with <code>./</code>.
                                </p>
                            </div>
                        </article>
                    </div>
                </section>

                <section className="use-cases-section">
                    <div className="section-heading">
                        <h2>📋 Use Cases & Examples</h2>
                        <p>Mix and match filters, patterns, and paths to cover every documentation workflow.</p>
                    </div>

                    <div className="use-cases-grid">
                        <article className="use-case-card">
                            <div className="use-case-header">
                                <div className="use-case-icon">📚</div>
                                <div>
                                    <p className="use-case-label">Component docs</p>
                                    <h3>Document a React Component Library</h3>
                                </div>
                            </div>
                            <p>Export all your React components with folder structure for easy documentation.</p>
                            <div className="code-tags">
                                <span className="code-tag">Path ./src/components</span>
                                <span className="code-tag">Filter TypeScript/React</span>
                                <span className="code-tag">Folder structure</span>
                            </div>
                            <div className="code-example">
                                <p><strong>Steps</strong></p>
                                <ol>
                                    <li>Path: <code>./src/components</code></li>
                                    <li>Filter: <code>TypeScript/React</code></li>
                                    <li>Enable: <code>Include Folder Structure</code></li>
                                </ol>
                                <p><strong>Result:</strong> Markdown with every .tsx organized for your design system.</p>
                            </div>
                        </article>

                        <article className="use-case-card">
                            <div className="use-case-header">
                                <div className="use-case-icon">🎓</div>
                                <div>
                                    <p className="use-case-label">Learning</p>
                                    <h3>Share Project Structure for Learning</h3>
                                </div>
                            </div>
                            <p>Quick overview of how a project is organized without file contents.</p>
                            <div className="code-tags">
                                <span className="code-tag">Path ./</span>
                                <span className="code-tag">Tree only</span>
                                <span className="code-tag">Exclude node_modules</span>
                            </div>
                            <div className="code-example">
                                <p><strong>Steps</strong></p>
                                <ol>
                                    <li>Path: <code>./</code></li>
                                    <li>Enable: <code>Tree Only</code></li>
                                    <li>Exclude: <code>node_modules,.git,dist,build</code></li>
                                </ol>
                                <p><strong>Result:</strong> Lightweight tree for onboarding or code walkthroughs.</p>
                            </div>
                        </article>

                        <article className="use-case-card">
                            <div className="use-case-header">
                                <div className="use-case-icon">🔧</div>
                                <div>
                                    <p className="use-case-label">Config sweeps</p>
                                    <h3>Export Configuration Files</h3>
                                </div>
                            </div>
                            <p>Collect all configuration files for review or migration.</p>
                            <div className="code-tags">
                                <span className="code-tag">Path ./</span>
                                <span className="code-tag">Filter Custom</span>
                                <span className="code-tag">Pattern json|yaml</span>
                            </div>
                            <div className="code-example">
                                <p><strong>Steps</strong></p>
                                <ol>
                                    <li>Path: <code>./</code></li>
                                    <li>Filter: <code>Custom</code></li>
                                    <li>Pattern: <code>{`**/*.{json,yaml,yml,config.js,env*}`}</code></li>
                                </ol>
                                <p><strong>Result:</strong> Every config file in one searchable document.</p>
                            </div>
                        </article>

                        <article className="use-case-card">
                            <div className="use-case-header">
                                <div className="use-case-icon">🤝</div>
                                <div>
                                    <p className="use-case-label">Feature review</p>
                                    <h3>Prepare Code for Code Review</h3>
                                </div>
                            </div>
                            <p>Export a specific feature module with all its files for team review.</p>
                            <div className="code-tags">
                                <span className="code-tag">Path ./src/features/auth</span>
                                <span className="code-tag">Filter TypeScript/React</span>
                                <span className="code-tag">Exclude tests</span>
                            </div>
                            <div className="code-example">
                                <p><strong>Steps</strong></p>
                                <ol>
                                    <li>Path: <code>./src/features/auth</code></li>
                                    <li>Filter: <code>TypeScript/React</code></li>
                                    <li>Exclude: <code>.test.tsx,.spec.ts</code></li>
                                </ol>
                                <p><strong>Result:</strong> Share a focused feature bundle with zero context switching.</p>
                            </div>
                        </article>

                        <article className="use-case-card">
                            <div className="use-case-header">
                                <div className="use-case-icon">📖</div>
                                <div>
                                    <p className="use-case-label">API docs</p>
                                    <h3>Create API Documentation</h3>
                                </div>
                            </div>
                            <p>Export all API routes and handlers for documentation.</p>
                            <div className="code-tags">
                                <span className="code-tag">Path ./src/api</span>
                                <span className="code-tag">Filter TypeScript/React</span>
                                <span className="code-tag">Max 100MB</span>
                            </div>
                            <div className="code-example">
                                <p><strong>Steps</strong></p>
                                <ol>
                                    <li>Path: <code>./src/api</code> or <code>./server/routes</code></li>
                                    <li>Filter: <code>TypeScript/React</code></li>
                                    <li>Max File Size: <code>100</code> MB</li>
                                </ol>
                                <p><strong>Result:</strong> Every endpoint and handler in a single Markdown spec.</p>
                            </div>
                        </article>

                        <article className="use-case-card">
                            <div className="use-case-header">
                                <div className="use-case-icon">🏗️</div>
                                <div>
                                    <p className="use-case-label">Architecture</p>
                                    <h3>Analyze Project Structure</h3>
                                </div>
                            </div>
                            <p>Get a complete overview of your entire project.</p>
                            <div className="code-tags">
                                <span className="code-tag">Path ./</span>
                                <span className="code-tag">Filter All</span>
                                <span className="code-tag">Exclude build folders</span>
                            </div>
                            <div className="code-example">
                                <p><strong>Steps</strong></p>
                                <ol>
                                    <li>Path: <code>./</code></li>
                                    <li>Filter: <code>All</code></li>
                                    <li>Exclude: <code>node_modules,.git,dist,build,.next,out</code></li>
                                </ol>
                                <p><strong>Result:</strong> Full project documentation with structure and contents.</p>
                            </div>
                        </article>
                    </div>
                </section>

                <div className="features-highlight">
                    <h2>✨ Key Features</h2>
                    <div className="features-list">
                        <div className="feature-item">
                            <span className="feature-icon">🌳</span>
                            <div>
                                <h4>Folder Structure Tree</h4>
                                <p>Visualize your project structure with a clean, readable tree format</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🎯</span>
                            <div>
                                <h4>Smart Filtering</h4>
                                <p>Filter by file type or use custom glob patterns</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">⚡</span>
                            <div>
                                <h4>Lightning Fast</h4>
                                <p>Process large projects in milliseconds</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">📋</span>
                            <div>
                                <h4>Easy Sharing</h4>
                                <p>Download or copy to clipboard with one click</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="faq-section">
                    <h2>❓ Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h4>Why can't I export from the GitHub Pages demo?</h4>
                            <p>The GitHub Pages version is a static preview without a backend server. It can't access your local file system. You must run it locally with <code>pnpm dev</code> to use the export functionality.</p>
                        </div>
                        <div className="faq-item">
                            <h4>What are the system requirements?</h4>
                            <p>Node.js 18 or higher and pnpm. If you have npm, install pnpm globally with <code>npm install -g pnpm</code>.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Can I use absolute paths?</h4>
                            <p>Yes! You can use absolute paths like <code>C:\Users\YourName\Projects\MyApp</code> on Windows or <code>/home/user/projects/app</code> on Linux/Mac.</p>
                        </div>
                        <div className="faq-item">
                            <h4>What's the difference between "Include Folder Structure" and "Tree Only"?</h4>
                            <p><strong>Include Folder Structure:</strong> Shows tree + file contents. <strong>Tree Only:</strong> Shows only the folder structure without file contents.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Can I exclude multiple directories?</h4>
                            <p>Yes! Use comma-separated values: <code>node_modules,.git,dist,build,.next</code></p>
                        </div>
                        <div className="faq-item">
                            <h4>What file types are supported?</h4>
                            <p>All file types! You can filter by TypeScript/React, CSS, JSON, Markdown, or use custom glob patterns for precise control.</p>
                        </div>
                    </div>
                </div>

                <div className="cta-section">
                    <h2>Ready to Get Started?</h2>
                    <p>Clone the repository and run <code>pnpm dev</code> to start exporting your projects!</p>
                    <a href="https://github.com/AliSafari-IT/direxpo" target="_blank" rel="noopener noreferrer" className="btn-primary cta-button">
                        Clone from GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}
