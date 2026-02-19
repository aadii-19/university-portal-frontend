import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AssignmentSubmission from './pages/AssignmentSubmission';
import StudentAssignments from './pages/StudentAssignments';
import AIFeedback from './pages/AIFeedback';
import FacultyDashboard from './pages/FacultyDashboard';
import AttendanceMarking from './pages/AttendanceMarking';
import AttendanceReport from './pages/AttendanceReport';
import AdminDashboard from './pages/AdminDashboard';
import EventDetail from './pages/EventDetail';
import FacultySubmissions from './pages/FacultySubmissions';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Header />
            <Navbar />
            <main className="app-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/login/:role" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/events/:id" element={<EventDetail />} />

                {/* Student Routes */}
                <Route path="/student/dashboard" element={
                  <ProtectedRoute requiredRole="STUDENT">
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/student/assignments" element={
                  <ProtectedRoute requiredRole="STUDENT">
                    <AssignmentSubmission />
                  </ProtectedRoute>
                } />
                <Route path="/student/feedback/:id" element={
                  <ProtectedRoute requiredRole="STUDENT">
                    <AIFeedback />
                  </ProtectedRoute>
                } />
                <Route path="/student/all-assignments" element={
                  <ProtectedRoute requiredRole="STUDENT">
                    <StudentAssignments />
                  </ProtectedRoute>
                } />

                {/* Faculty Routes */}
                <Route path="/faculty/dashboard" element={
                  <ProtectedRoute requiredRole="FACULTY">
                    <FacultyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/attendance" element={
                  <ProtectedRoute requiredRole="FACULTY">
                    <AttendanceMarking />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/reports" element={
                  <ProtectedRoute requiredRole="FACULTY">
                    <AttendanceReport />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/submissions" element={
                  <ProtectedRoute requiredRole="FACULTY">
                    <FacultySubmissions />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
