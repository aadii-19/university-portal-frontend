import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FiUserPlus, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import './Login.css';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT',
        department: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await authAPI.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                department: formData.department
            });

            setSuccess(true);
            setTimeout(() => {
                navigate(`/login/${formData.role.toLowerCase()}`);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container" style={{ maxWidth: 480 }}>
                <div className="login-card glass-card animate-fade-in-up">
                    <div className="login-header">
                        <div className="login-icon"><FiUserPlus size={28} /></div>
                        <h2>Create Account</h2>
                        <p className="login-subtitle">Register for the University Portal</p>
                    </div>

                    {error && <div className="login-error animate-fade-in"><FiAlertTriangle size={14} style={{ marginRight: 4 }} /> {error}</div>}
                    {success && (
                        <div className="login-error animate-fade-in" style={{ background: 'rgba(100,255,218,0.1)', borderColor: 'rgba(100,255,218,0.3)', color: 'var(--accent-blue)' }}>
                            <FiCheckCircle size={14} style={{ marginRight: 4 }} /> Registration successful! Redirecting to login...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="your.email@veltech.edu" required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                                <option value="STUDENT">Student</option>
                                <option value="FACULTY">Faculty</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <select name="department" className="form-select" value={formData.department} onChange={handleChange} required>
                                <option value="">Select Department</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Data Science">Data Science</option>
                                <option value="AI">Artificial Intelligence</option>
                                <option value="Business">Business Administration</option>
                                <option value="Biotechnology">Biotechnology</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input type="password" name="confirmPassword" className="form-input" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
                        </div>

                        <button type="submit" className="btn btn-primary login-btn" disabled={loading || success}>
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login/student">Sign in here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
