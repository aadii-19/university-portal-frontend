import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ConfirmDialog from './ConfirmDialog';
import { FiSun, FiMoon, FiLogOut, FiGrid, FiSettings } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { LuUsers } from 'react-icons/lu';
import './Navbar.css';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const toggleBtnRef = useRef(null);

    const handleToggleTheme = () => {
        const btn = toggleBtnRef.current;
        if (btn) {
            btn.classList.add('spin');
            setTimeout(() => btn.classList.remove('spin'), 500);
        }
        toggleTheme();
    };

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
        setMenuOpen(false);
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container container">
                    <button
                        className={`navbar-toggle ${menuOpen ? 'active' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
                        <li>
                            <Link
                                to="/"
                                className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                className={`navbar-link ${isActive('/about') ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/courses"
                                className={`navbar-link ${isActive('/courses') ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                Courses
                            </Link>
                        </li>

                        {!user && (
                            <>
                                <li>
                                    <Link
                                        to="/login/student"
                                        className={`navbar-link portal-link ${isActive('/login/student') ? 'active' : ''}`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <HiOutlineAcademicCap style={{ marginRight: 4 }} /> Student Portal
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/login/faculty"
                                        className={`navbar-link portal-link ${isActive('/login/faculty') ? 'active' : ''}`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <LuUsers style={{ marginRight: 4 }} /> Faculty Portal
                                    </Link>
                                </li>
                            </>
                        )}

                        {user && (
                            <>
                                <li>
                                    <Link
                                        to={user.role === 'STUDENT' ? '/student/dashboard' : user.role === 'FACULTY' ? '/faculty/dashboard' : '/admin/dashboard'}
                                        className={`navbar-link portal-link ${location.pathname.includes('/student/') || location.pathname.includes('/faculty/') || location.pathname.includes('/admin/')
                                            ? 'active' : ''
                                            }`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {user.role === 'ADMIN' ? <><FiSettings style={{ marginRight: 4 }} /> Admin Panel</> : <><FiGrid style={{ marginRight: 4 }} /> Dashboard</>}
                                    </Link>
                                </li>
                                <li>
                                    <button className="navbar-link logout-btn" onClick={handleLogout}>
                                        <FiLogOut style={{ marginRight: 4 }} /> Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>

                    <button
                        ref={toggleBtnRef}
                        className="theme-toggle"
                        onClick={handleToggleTheme}
                        aria-label="Toggle theme"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <FiSun /> : <FiMoon />}
                    </button>

                    {user && (
                        <div className="navbar-user">
                            <div className="navbar-avatar">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="navbar-username">{user.name}</span>
                        </div>
                    )}
                </div>
            </nav>

            <ConfirmDialog
                show={showLogoutConfirm}
                title="Logout"
                message="Are you sure you want to logout? You will need to sign in again."
                confirmText="Logout"
                cancelText="Cancel"
                type="warning"
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </>
    );
}
