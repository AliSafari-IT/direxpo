import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    const logoSrc = `${import.meta.env.BASE_URL}favicon.svg`;

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
                </ul>
            </div>
        </nav>
    );
}
