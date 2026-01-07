import './FeaturesPage.css';

export default function FeaturesPage() {
  const features = [
    {
      icon: '📁',
      title: 'Folder Structure Tree',
      description:
        'Visualize your project structure with a clean, readable tree format at the top of your export.',
      details: ['Deterministic output', 'Respects all filters', 'No empty folders', 'Relative paths only'],
    },
    {
      icon: '🎯',
      title: 'Smart Filtering',
      description: 'Export exactly what you need with powerful filtering options.',
      details: ['File type filtering', 'Pattern matching', 'Size limits', 'Directory exclusion'],
    },
    {
      icon: '⚡',
      title: 'High Performance',
      description: 'Lightning-fast exports even for large projects.',
      details: ['O(n log n) complexity', '< 200ms typical', 'Efficient algorithms', 'Minimal memory usage'],
    },
    {
      icon: '🌳',
      title: 'Tree-Only Export',
      description: 'Export just the folder structure without file contents.',
      details: ['Perfect for documentation', 'Quick project overview', 'Lightweight output', 'Easy sharing'],
    },
    {
      icon: '🔄',
      title: 'Multiple Formats',
      description: 'Support for various file types and export options.',
      details: ['TypeScript/React', 'CSS files', 'JSON', 'Markdown', 'Custom patterns'],
    },
    {
      icon: '💾',
      title: 'Easy Download',
      description: 'Download or copy your exports with a single click.',
      details: ['Direct download', 'Clipboard copy', 'Multiple formats', 'Instant access'],
    },
  ];

  return (
    <div className="features-page">
      <div className="features-container">
        <div className="features-header">
          <h1>Powerful Features</h1>
          <p>Everything you need to export your code beautifully</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <ul className="feature-details">
                {feature.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="features-section">
          <h2>Why MD Exporter?</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <h4>📚 Documentation</h4>
              <p>Create comprehensive documentation of your codebase in seconds.</p>
            </div>
            <div className="benefit-item">
              <h4>🤝 Collaboration</h4>
              <p>Share your code structure with team members easily.</p>
            </div>
            <div className="benefit-item">
              <h4>🔍 Code Review</h4>
              <p>Perfect for code reviews and architectural discussions.</p>
            </div>
            <div className="benefit-item">
              <h4>📊 Analysis</h4>
              <p>Analyze your project structure and dependencies at a glance.</p>
            </div>
            <div className="benefit-item">
              <h4>🎓 Learning</h4>
              <p>Great for learning how projects are organized.</p>
            </div>
            <div className="benefit-item">
              <h4>⚙️ Automation</h4>
              <p>CLI support for integration into your workflow.</p>
            </div>
          </div>
        </div>

        <div className="features-section">
          <h2>Advanced Options</h2>
          <div className="options-list">
            <div className="option-item">
              <h4>Include Folder Structure</h4>
              <p>
                Add a visual tree representation at the top of your markdown file. Perfect for quick navigation and
                understanding project layout.
              </p>
            </div>
            <div className="option-item">
              <h4>Tree-Only Export</h4>
              <p>
                Export just the folder structure without any file contents. Ideal for sharing project architecture or
                creating quick reference guides.
              </p>
            </div>
            <div className="option-item">
              <h4>Custom Filtering</h4>
              <p>Use glob patterns to include or exclude specific files and directories. Fine-grained control over what gets exported.</p>
            </div>
            <div className="option-item">
              <h4>Size Limits</h4>
              <p>Exclude large files automatically to keep your exports manageable and focused on relevant code.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
