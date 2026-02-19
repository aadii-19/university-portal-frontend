import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, assignmentAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import { FiFileText, FiBarChart2, FiClock, FiCheckCircle, FiAward } from 'react-icons/fi';
import './Dashboard.css';

const statusMap = {
    submitted: { label: 'Submitted', class: 'badge-warning' },
    pending: { label: 'Pending', class: 'badge-danger' },
    evaluated: { label: 'Evaluated', class: 'badge-success' },
    SUBMITTED: { label: 'Submitted', class: 'badge-warning' },
    PENDING: { label: 'Pending', class: 'badge-danger' },
    EVALUATED: { label: 'Evaluated', class: 'badge-success' },
};

// Fallback mock data
const fallbackAssignments = [
    { id: 1, title: 'Data Structures Lab - Linked Lists', course: 'CS201', status: 'submitted', score: 85, dueDate: '2026-02-20', fileName: 'linked_lists_lab.pdf', submittedAt: '2026-02-18T10:30:00' },
    { id: 2, title: 'Machine Learning Project Proposal', course: 'CS301', status: 'pending', score: null, dueDate: '2026-03-01' },
    { id: 3, title: 'Database Design - ER Diagrams', course: 'CS202', status: 'evaluated', score: 92, dueDate: '2026-02-15', fileName: 'er_diagrams.docx', submittedAt: '2026-02-14T14:20:00' },
    { id: 4, title: 'Web Development - React App', course: 'CS305', status: 'submitted', score: null, dueDate: '2026-02-25', fileName: 'react_app_submission.pdf', submittedAt: '2026-02-17T09:15:00' },
    { id: 5, title: 'Computer Networks - TCP/IP', course: 'CS204', status: 'pending', score: null, dueDate: '2026-03-05' },
];

export default function StudentDashboard() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState(fallbackAssignments);
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const studentId = user?.studentId || user?.id;
        if (!studentId) { setLoading(false); return; }

        const fetchData = async () => {
            try {
                // GET /api/dashboard/student/{studentId}
                const dashRes = await dashboardAPI.getStudent(studentId);
                if (dashRes.data) setDashData(dashRes.data);
            } catch { /* use fallback */ }

            try {
                // GET /api/assignments/student/{studentId}
                const assignRes = await assignmentAPI.getByStudent(studentId);
                if (assignRes.data && Array.isArray(assignRes.data) && assignRes.data.length > 0) {
                    setAssignments(assignRes.data);
                }
            } catch { /* use fallback */ }

            setLoading(false);
        };

        fetchData();
    }, [user]);

    const submitted = assignments.filter(a => (a.status || '').toLowerCase() === 'submitted').length;
    const pending = assignments.filter(a => (a.status || '').toLowerCase() === 'pending').length;
    const evaluated = assignments.filter(a => (a.status || '').toLowerCase() === 'evaluated').length;
    const scored = assignments.filter(a => a.score != null);
    const avgScore = scored.length ? Math.round(scored.reduce((acc, a) => acc + a.score, 0) / scored.length) : 0;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <div className="dashboard-header animate-fade-in-up">
                    <div>
                        <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                        <p className="dashboard-subtitle">Here's your academic overview</p>
                    </div>
                    <Link to="/student/assignments" className="btn btn-primary"><FiFileText size={16} style={{ marginRight: 4 }} /> Submit Assignment</Link>
                </div>

                {/* Stats */}
                <div className="stats-grid animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-card glass-card">
                        <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.12)' }}><FiBarChart2 size={20} /></div>
                        <div>
                            <span className="stat-card-number">{dashData?.totalAssignments ?? assignments.length}</span>
                            <span className="stat-card-label">Total Assignments</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.12)' }}><FiClock size={20} /></div>
                        <div>
                            <span className="stat-card-number">{dashData?.pending ?? pending}</span>
                            <span className="stat-card-label">Pending</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-card-icon" style={{ background: 'rgba(34,197,94,0.12)' }}><FiCheckCircle size={20} /></div>
                        <div>
                            <span className="stat-card-number">{dashData?.evaluated ?? evaluated}</span>
                            <span className="stat-card-label">Evaluated</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-card-icon" style={{ background: 'rgba(129,140,248,0.12)' }}><FiAward size={20} /></div>
                        <div>
                            <span className="stat-card-number">{dashData?.avgScore ?? avgScore}%</span>
                            <span className="stat-card-label">Avg Score</span>
                        </div>
                    </div>
                </div>

                {/* Assignments Table */}
                <div className="dashboard-section glass-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="section-header">
                        <h3><FiFileText size={16} style={{ marginRight: 4 }} /> Recent Assignments</h3>
                        <Link to="/student/all-assignments" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>View All →</Link>
                    </div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Assignment</th>
                                        <th>Course</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                        <th>Uploaded File</th>
                                        <th>Score</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.slice(0, 5).map((a) => {
                                        const st = statusMap[(a.status || '').toLowerCase()] || statusMap[(a.status || '').toUpperCase()] || { label: a.status, class: 'badge-info' };
                                        const dueDate = a.dueDate ? new Date(a.dueDate) : null;
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const isLate = dueDate && today > dueDate;
                                        const displayTitle = a.title || a.assignmentTitle || 'Untitled';
                                        const displayCourse = a.course || a.courseId || '—';

                                        return (
                                            <tr key={a.id}>
                                                <td><strong>{displayTitle}</strong></td>
                                                <td>{displayCourse}</td>
                                                <td>{dueDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                                                <td><span className={`badge ${st.class}`}>{st.label}</span></td>
                                                <td style={{ fontSize: '0.85rem' }}>{a.fileName ? a.fileName : <span style={{ color: 'var(--light-gray)' }}>—</span>}</td>
                                                <td>{a.score != null ? `${a.score}%` : '—'}</td>
                                                <td>
                                                    {(a.status || '').toLowerCase() === 'pending' ? (
                                                        <Link
                                                            to="/student/assignments"
                                                            state={{ courseId: displayCourse, assignmentId: a.assignmentId || a.id }}
                                                            className="btn btn-accent"
                                                            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                                        >
                                                            Submit
                                                        </Link>
                                                    ) : (a.status || '').toLowerCase() === 'evaluated' ? (
                                                        <Link to={`/student/feedback/${a.submissionId || a.id}`} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>View Feedback</Link>
                                                    ) : (
                                                        !isLate ? (
                                                            <Link
                                                                to="/student/assignments"
                                                                state={{ courseId: displayCourse, assignmentId: a.assignmentId || a.id }}
                                                                className="btn btn-primary"
                                                                style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}
                                                            >
                                                                Change File
                                                            </Link>
                                                        ) : (
                                                            <span style={{ color: 'var(--light-gray)', fontSize: '0.85rem' }}>Awaiting Review</span>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
