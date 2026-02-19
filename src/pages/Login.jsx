import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSettings, FiLock, FiKey } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { LuUsers } from 'react-icons/lu';
import './Login.css';

export default function Login() {
    const { role } = useParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isStudent = role === 'student';
    const isAdmin = role === 'admin';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Calls POST /api/auth/login (falls back to mock if backend unavailable)
        const result = await login({ email, password });

        if (result.success) {
            const userRole = result.user.role;
            // Validate role matches the portal they selected
            if (
                (isStudent && userRole === 'STUDENT') ||
                (!isStudent && !isAdmin && userRole === 'FACULTY') ||
                (isAdmin && userRole === 'ADMIN')
            ) {
                navigate(
                    userRole === 'STUDENT' ? '/student/dashboard' :
                        userRole === 'ADMIN' ? '/admin/dashboard' :
                            '/faculty/dashboard'
                );
            } else {
                setError(`This account is registered as ${userRole}. Please use the correct portal.`);
            }
        } else {
            setError(result.error || 'Invalid email or password. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card glass-card animate-fade-in-up">
                    <div className="login-header">
                        <div className="login-icon">{isAdmin ? <FiSettings size={28} /> : isStudent ? <HiOutlineAcademicCap size={28} /> : <LuUsers size={28} />}</div>
                        <h2>{isAdmin ? 'Admin' : isStudent ? 'Student' : 'Faculty'} Login</h2>
                        <p className="login-subtitle">Sign in to access your portal</p>
                    </div>

                    {error && (
                        <div className="login-error animate-fade-in">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={isAdmin ? 'admin@veltech.edu' : isStudent ? 'arjun@veltech.edu' : 'ramesh@veltech.edu'}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p style={{ marginBottom: '1rem' }}>
                            Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Register here</Link>
                        </p>
                        <p className="login-switch">
                            {isStudent ? (
                                <>Are you faculty? <Link to="/login/faculty">Faculty Login →</Link></>
                            ) : isAdmin ? (
                                <>Are you a student? <Link to="/login/student">Student Login →</Link></>
                            ) : (
                                <>Are you a student? <Link to="/login/student">Student Login →</Link></>
                            )}
                        </p>
                        {!isAdmin && (
                            <p className="login-switch" style={{ marginTop: '0.25rem' }}>
                                <Link to="/login/admin"><FiLock size={14} style={{ marginRight: 4 }} /> Admin Login →</Link>
                            </p>
                        )}
                    </div>

                    {/* Demo credentials */}
                    <div className="demo-credentials">
                        <p className="demo-title"><FiKey size={14} style={{ marginRight: 4 }} /> Demo Credentials</p>
                        {isAdmin ? (
                            <p>Email: <code>admin@veltech.edu</code> | Password: <code>admin123</code></p>
                        ) : isStudent ? (
                            <p>Email: <code>arjun@veltech.edu</code> | Password: <code>student123</code></p>
                        ) : (
                            <p>Email: <code>ramesh@veltech.edu</code> | Password: <code>faculty123</code></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
