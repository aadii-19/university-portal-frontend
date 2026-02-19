import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
    return (
        <header className="header">
            <div className="header-container container">
                <Link to="/" className="header-brand">
                    <div className="header-logo">
                        <img src="/image.png" alt="Vel Tech University" width="48" height="48" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <div className="header-text">
                        <h1 className="header-title">Vel Tech University</h1>
                        <p className="header-motto">Excellence in Education, Innovation in Research</p>
                    </div>
                </Link>
            </div>
        </header>
    );
}
