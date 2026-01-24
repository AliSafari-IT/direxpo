import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    const logoSrc = `${import.meta.env.BASE_URL}favicon.svg`;

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        // Apply saved theme on initial load
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.dataset.theme = savedTheme;

        const handleThemeChange = () => {
            setTheme(localStorage.getItem('theme') || 'light');
        };

        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    handleThemeChange();
                }
            });
        });

        observer.observe(document.body, { attributes: true });

        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        document.body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        setTheme(newTheme);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <img src={logoSrc} alt="Logo" className="navbar-logo" width={50} height={50} />
                    <span className="navbar-title">Direxpo</span>
                </Link>

                <ul className="navbar-menu">
                    <li>
                        <Link
                            to="/"
                            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                        >
                            Export
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/features"
                            className={`navbar-link ${isActive('/features') ? 'active' : ''}`}
                        >
                            Features
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/how-to"
                            className={`navbar-link ${isActive('/how-to') ? 'active' : ''}`}
                        >
                            How To
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/getting-started"
                            className={`navbar-link ${isActive('/getting-started') ? 'active' : ''}`}
                        >
                            Getting Started
                        </Link>
                    </li>
                    <li>
                        <select
                            className="navbar-link"
                            onChange={(e) => {
                                if (e.target.value) {
                                    window.open(e.target.value, '_blank', 'noopener,noreferrer');
                                    e.target.value = '';
                                }
                            }}
                        >
                            <option value="">Direxpo</option>
                            <option value="https://www.npmjs.com/package/@asafarim/direxpo"><strong>npm</strong> package</option>
                            <option value="https://github.com/AliSafari-IT/direxpo"><strong>GitHub</strong> repo</option>
                        </select>
                    </li>
                    <li>
                        <button className="navbar-link theme-toggle" onClick={toggleTheme}>
                            {theme === 'dark' ? '🌞' : '🌙'}
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
