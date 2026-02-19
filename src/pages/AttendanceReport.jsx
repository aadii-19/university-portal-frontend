import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, attendanceAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

// Fallback mock data
const fallbackReportData = [
    {
        date: '2026-02-15', course: 'CS201', students: [
            { id: 'STU001', name: 'Arjun Sharma', status: 'Present' },
            { id: 'STU002', name: 'Priya Patel', status: 'Present' },
            { id: 'STU003', name: 'Rahul Verma', status: 'Absent' },
            { id: 'STU004', name: 'Sneha Gupta', status: 'Present' },
            { id: 'STU005', name: 'Vikram Singh', status: 'Present' },
            { id: 'STU006', name: 'Ananya Reddy', status: 'Present' },
            { id: 'STU007', name: 'Karthik Nair', status: 'Absent' },
            { id: 'STU008', name: 'Meera Joshi', status: 'Present' },
        ]
    },
    {
        date: '2026-02-14', course: 'CS201', students: [
            { id: 'STU001', name: 'Arjun Sharma', status: 'Present' },
            { id: 'STU002', name: 'Priya Patel', status: 'Absent' },
            { id: 'STU003', name: 'Rahul Verma', status: 'Present' },
            { id: 'STU004', name: 'Sneha Gupta', status: 'Present' },
            { id: 'STU005', name: 'Vikram Singh', status: 'Present' },
            { id: 'STU006', name: 'Ananya Reddy', status: 'Present' },
            { id: 'STU007', name: 'Karthik Nair', status: 'Present' },
            { id: 'STU008', name: 'Meera Joshi', status: 'Absent' },
        ]
    },
    {
        date: '2026-02-15', course: 'CS202', students: [
            { id: 'STU001', name: 'Arjun Sharma', status: 'Present' },
            { id: 'STU009', name: 'Rohan Desai', status: 'Present' },
            { id: 'STU010', name: 'Kavya Menon', status: 'Absent' },
            { id: 'STU004', name: 'Sneha Gupta', status: 'Present' },
            { id: 'STU011', name: 'Aditya Iyer', status: 'Present' },
            { id: 'STU012', name: 'Pooja Saxena', status: 'Present' },
        ]
    },
];

export default function AttendanceReport() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [filterCourse, setFilterCourse] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [reports, setReports] = useState(fallbackReportData);
    const [loading, setLoading] = useState(false);

    // Fetch only courses taught by this faculty
    useEffect(() => {
        if (!user?.id) return;
        dashboardAPI.getFaculty(user.id)
            .then(res => {
                const c = res.data?.courses || [];
                if (c.length > 0) {
                    const mapped = c.map(course => ({
                        id: course.courseId,
                        name: course.courseName || course.name
                    }));
                    setCourses(mapped);
                }
            })
            .catch(() => {
                setCourses([
                    { id: 'CS201', name: 'Data Structures' },
                    { id: 'CS202', name: 'Database Management' },
                    { id: 'CS301', name: 'Machine Learning' },
                ]);
            });
    }, [user]);

    // Fetch attendance when filters change
    useEffect(() => {
        if (!filterCourse) return;

        setLoading(true);

        const fetchAttendance = async () => {
            try {
                if (filterDate) {
                    // GET /api/attendance/course/{courseId}/date/{date}
                    const res = await attendanceAPI.getByDate(filterCourse, filterDate);
                    if (res.data) {
                        setReports(Array.isArray(res.data) ? res.data : [res.data]);
                        setLoading(false);
                        return;
                    }
                } else {
                    // GET /api/attendance/course/{courseId}?from=&to=
                    const res = await attendanceAPI.getReport(filterCourse);
                    if (res.data && Array.isArray(res.data)) {
                        setReports(res.data);
                        setLoading(false);
                        return;
                    }
                }
                // If neither branch returned data, show empty
                setReports([]);
                setLoading(false);
            } catch {
                // Only use fallback on genuine API failures
                setReports(fallbackReportData);
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [filterCourse, filterDate]);

    // Client-side filter for fallback data
    const filtered = reports.filter(r => {
        const courseMatch = !filterCourse || (r.course || r.courseId) === filterCourse;
        const dateMatch = !filterDate || r.date === filterDate;
        return courseMatch && dateMatch;
    });

    const handleClear = () => {
        setFilterCourse('');
        setFilterDate('');
        setReports(fallbackReportData);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <div className="dashboard-header animate-fade-in-up">
                    <div>
                        <h1>📋 Attendance Reports</h1>
                        <p className="dashboard-subtitle">View and analyze attendance records</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="dashboard-section glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <h4 style={{ marginBottom: 16, color: 'var(--white)' }}>🔍 Filters</h4>
                    <div className="report-filters">
                        <div className="form-group">
                            <label className="form-label">Course</label>
                            <select className="form-select" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
                                <option value="">All Courses</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.id} — {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input type="date" className="form-input" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={handleClear} style={{ padding: '14px 20px' }}>Clear Filters</button>
                        </div>
                    </div>
                </div>

                {/* Reports */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
                        <p style={{ fontSize: '2rem', marginBottom: 12 }}>📭</p>
                        <h3>No records found</h3>
                        <p style={{ color: 'var(--light-gray)', marginTop: 8 }}>Try adjusting the filters</p>
                    </div>
                ) : (
                    filtered.map((record, idx) => {
                        const studentList = record.students || record.records || [];
                        const present = studentList.filter(s => (s.status || '').toLowerCase() === 'present').length;
                        const total = studentList.length;
                        const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                        return (
                            <div className="dashboard-section glass-card animate-fade-in-up" key={idx} style={{ animationDelay: `${0.1 + idx * 0.1}s` }}>
                                <div className="section-header">
                                    <h3>
                                        {record.course || record.courseId} — {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                    </h3>
                                    <span className={`badge ${pct >= 80 ? 'badge-success' : 'badge-warning'}`}>
                                        {present}/{total} ({pct}%)
                                    </span>
                                </div>
                                <div className="table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Student ID</th>
                                                <th>Name</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentList.map((s, i) => (
                                                <tr key={s.id || s.studentId || i}>
                                                    <td>{i + 1}</td>
                                                    <td>{s.id || s.studentId}</td>
                                                    <td><strong>{s.name || s.studentName}</strong></td>
                                                    <td>
                                                        <span className={`badge ${(s.status || '').toLowerCase() === 'present' ? 'badge-success' : 'badge-danger'}`}>
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );
}
