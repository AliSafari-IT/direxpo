import { Link } from 'react-router-dom';
import './GettingStartedPage.css';

export default function GettingStartedPage() {
    return (
        <div className="getting-started-page">
            <div className="getting-started-container">
                <div className="hero-section">
                    <div className="hero-content">
                        <h1>Welcome to MD Exporter</h1>
                        <p>Convert your code projects into beautiful, shareable Markdown files in seconds</p>
                        <Link to="/" className="btn-primary hero-button">
                            Start Exporting Now
                        </Link>
                    </div>
                    <div className="hero-visual">
                        <div className="visual-box">📄</div>
                    </div>
                </div>

                <div className="quick-start-section">
                    <h2>Quick Start</h2>
                    <div className="quick-start-grid">
                        <div className="quick-start-card">
                            <div className="card-number">1</div>
                            <h4>Enter Your Path</h4>
                            <p>Specify the directory you want to export</p>
                        </div>
                        <div className="quick-start-card">
                            <div className="card-number">2</div>
                            <h4>Choose Options</h4>
                            <p>Select file types and filters</p>
                        </div>
                        <div className="quick-start-card">
                            <div className="card-number">3</div>
                            <h4>Export & Download</h4>
                            <p>Get your markdown file instantly</p>
                        </div>
                    </div>
                </div>

                <div className="features-highlight">
                    <h2>Key Features</h2>
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
                                <p>Export exactly what you need with powerful filtering options</p>
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

                <div className="use-cases-section">
                    <h2>Perfect For</h2>
                    <div className="use-cases-grid">
                        <div className="use-case-card">
                            <h4>📚 Documentation</h4>
                            <p>Create comprehensive code documentation automatically</p>
                        </div>
                        <div className="use-case-card">
                            <h4>🤝 Code Reviews</h4>
                            <p>Share project structure for better discussions</p>
                        </div>
                        <div className="use-case-card">
                            <h4>🎓 Learning</h4>
                            <p>Understand how projects are organized</p>
                        </div>
                        <div className="use-case-card">
                            <h4>📊 Analysis</h4>
                            <p>Analyze project structure at a glance</p>
                        </div>
                    </div>
                </div>

                <div className="faq-section">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h4>What is MD Exporter?</h4>
                            <p>MD Exporter is a tool that converts your project files into a single, beautifully formatted Markdown file. Perfect for documentation, sharing, and analysis.</p>
                        </div>
                        <div className="faq-item">
                            <h4>How do I use it?</h4>
                            <p>Simply enter your project path, choose your options, and click Export. Download the markdown file or copy the content to your clipboard.</p>
                        </div>
                        <div className="faq-item">
                            <h4>What file types are supported?</h4>
                            <p>All file types are supported! You can filter by TypeScript/React, CSS, JSON, Markdown, or use custom glob patterns.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Can I use it from the command line?</h4>
                            <p>Yes! MD Exporter has a powerful CLI interface for automation and scripting. Check the "How To" page for details.</p>
                        </div>
                        <div className="faq-item">
                            <h4>What is the Tree-Only export?</h4>
                            <p>Tree-Only export generates just the folder structure without file contents. Perfect for quick project overviews.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Is there a size limit?</h4>
                            <p>You can set a maximum file size to exclude large files. By default, all files are included.</p>
                        </div>
                    </div>
                </div>

                <div className="cta-section">
                    <h2>Ready to Get Started?</h2>
                    <p>Export your first project now and see how easy it is</p>
                    <Link to="/" className="btn-primary cta-button">
                        Go to Export Tool
                    </Link>
                </div>
            </div>
        </div>
    );
}
