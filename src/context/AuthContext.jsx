import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('universityPortalUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // Optionally re-validate with GET /api/auth/me
      authAPI.me()
        .then((res) => {
          const freshUser = { ...parsedUser, ...res.data };
          setUser(freshUser);
          localStorage.setItem('universityPortalUser', JSON.stringify(freshUser));
        })
        .catch(() => {
          // Token expired or backend not running, keep local data
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      // POST /api/auth/login
      const res = await authAPI.login(credentials);
      const userData = res.data; // expects: { id, name, email, role, token, department, ... }
      setUser(userData);
      localStorage.setItem('universityPortalUser', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      // Fallback to mock data if backend is not running
      const mockUsers = [
        { id: 'STU001', name: 'Arjun Sharma', email: 'arjun@veltech.edu', role: 'STUDENT', department: 'Computer Science', token: 'mock-student-token' },
        { id: 'STU002', name: 'Priya Patel', email: 'priya@veltech.edu', role: 'STUDENT', department: 'Data Science', token: 'mock-student-token' },
        { id: 'FAC001', name: 'Dr. Ramesh Kumar', email: 'ramesh@veltech.edu', role: 'FACULTY', department: 'Computer Science', token: 'mock-faculty-token' },
        { id: 'FAC002', name: 'Dr. Anita Singh', email: 'anita@veltech.edu', role: 'FACULTY', department: 'Electronics', token: 'mock-faculty-token' },
        { id: 'ADM001', name: 'Admin', email: 'admin@veltech.edu', role: 'ADMIN', department: 'Administration', token: 'mock-admin-token' },
      ];

      const mockPasswords = {
        'arjun@veltech.edu': 'student123',
        'priya@veltech.edu': 'student123',
        'ramesh@veltech.edu': 'faculty123',
        'anita@veltech.edu': 'faculty123',
        'admin@veltech.edu': 'admin123',
      };

      const found = mockUsers.find(
        (u) => u.email === credentials.email && mockPasswords[credentials.email] === credentials.password
      );

      if (found) {
        setUser(found);
        localStorage.setItem('universityPortalUser', JSON.stringify(found));
        return { success: true, user: found };
      }

      return { success: false, error: 'Invalid email or password.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('universityPortalUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
