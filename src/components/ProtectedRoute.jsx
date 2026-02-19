import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to={`/login/${requiredRole?.toLowerCase() || 'student'}`} replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
}
