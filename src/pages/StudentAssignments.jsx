import { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import { FiFileText, FiSearch, FiChevronDown, FiChevronUp, FiFile, FiUpload, FiEye } from 'react-icons/fi';
import './Dashboard.css';

const statusMap = {
    submitted: { label: 'Submitted', class: 'badge-warning' },
    pending: { label: 'Pending', class: 'badge-danger' },
    evaluated: { label: 'Evaluated', class: 'badge-success' },
    SUBMITTED: { label: 'Submitted', class: 'badge-warning' },
    PENDING: { label: 'Pending', class: 'badge-danger' },
    EVALUATED: { label: 'Evaluated', class: 'badge-success' },
};

const fallbackAssignments = [
    { id: 1, title: 'Data Structures Lab - Linked Lists', course: 'CS201', status: 'submitted', score: 85, dueDate: '2026-02-20', fileName: 'linked_lists_lab.pdf', submittedAt: '2026-02-18T10:30:00' },
    { id: 2, title: 'Machine Learning Project Proposal', course: 'CS301', status: 'pending', score: null, dueDate: '2026-03-01' },
    { id: 3, title: 'Database Design - ER Diagrams', course: 'CS202', status: 'evaluated', score: 92, dueDate: '2026-02-15', fileName: 'er_diagrams.docx', submittedAt: '2026-02-14T14:20:00' },
    { id: 4, title: 'Web Development - React App', course: 'CS305', status: 'submitted', score: null, dueDate: '2026-02-25', fileName: 'react_app_submission.pdf', submittedAt: '2026-02-17T09:15:00' },
    { id: 5, title: 'Computer Networks - TCP/IP', course: 'CS204', status: 'pending', score: null, dueDate: '2026-03-05' },
];

export default function StudentAssignments() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState(fallbackAssignments);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const studentId = user?.studentId || user?.id;
        if (!studentId) { setLoading(false); return; }
        assignmentAPI.getByStudent(studentId)
            .then(res => {
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setAssignments(res.data);
                }
            })
            .catch(err => console.error("API failed, using fallback:", err))
            .finally(() => setLoading(false));
    }, [user]);

    const filteredAssignments = assignments.filter(a => {
        const status = (a.status || 'pending').toLowerCase();
        const matchesFilter = filter === 'all' || status === filter;
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
            (a.courseId || a.course || '').toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleAction = (assignment) => {
        navigate('/student/assignments', {
            state: {
                courseId: assignment.courseId || assignment.course,
                assignmentId: assignment.assignmentId || assignment.id
            }
        });
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <div className="dashboard-header animate-fade-in-up">
                    <div>
                        <h1><FiFileText size={22} style={{ marginRight: 6 }} /> All Assignments</h1>
                        <p className="dashboard-subtitle">Manage and track your coursework</p>
                    </div>
                </div>

                <div className="dashboard-section glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 15, marginBottom: 20, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', left: 10, top: 12, color: '#888' }} />
                            <input type="text" placeholder="Search assignments..." className="form-input" style={{ paddingLeft: 35 }} value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div style={{ width: 150 }}>
                            <select className="form-input" value={filter} onChange={e => setFilter(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="submitted">Submitted</option>
                                <option value="evaluated">Evaluated</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                                <colgroup>
                                    <col style={{ width: '30px' }} />
                                    <col style={{ width: '25%' }} />
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '12%' }} />
                                    <col style={{ width: '18%' }} />
                                    <col style={{ width: '8%' }} />
                                    <col style={{ width: '17%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th></th>
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
                                    {filteredAssignments.length > 0 ? filteredAssignments.map((a) => {
                                        const st = statusMap[(a.status || '').toLowerCase()] || { label: a.status || 'Unknown', class: 'badge-info' };
                                        const dueDate = a.dueDate ? new Date(a.dueDate) : null;
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const isLate = dueDate && today > dueDate;
                                        const hasFile = a.fileName || a.filePath;
                                        const isExpanded = expandedId === a.id;
                                        const statusLower = (a.status || '').toLowerCase();

                                        return (
                                            <Fragment key={a.id}>
                                                <tr style={{ cursor: hasFile ? 'pointer' : 'default' }} onClick={() => hasFile && toggleExpand(a.id)}>
                                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                        {hasFile ? (isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />) : ''}
                                                    </td>
                                                    <td><strong>{a.title || a.assignmentTitle || 'Untitled'}</strong></td>
                                                    <td>{a.course || a.courseId}</td>
                                                    <td>{dueDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                                                    <td><span className={`badge ${st.class}`}>{st.label}</span></td>
                                                    <td style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {hasFile ? (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <FiFile size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.fileName || a.filePath?.split('/').pop()}</span>
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--light-gray)' }}>No file yet</span>
                                                        )}
                                                    </td>
                                                    <td>{a.score != null ? `${a.score}%` : '—'}</td>
                                                    <td onClick={(e) => e.stopPropagation()}>
                                                        {statusLower === 'pending' ? (
                                                            <button onClick={() => handleAction(a)} className="btn btn-accent" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                                                                <FiUpload size={12} style={{ marginRight: 4 }} /> Submit
                                                            </button>
                                                        ) : statusLower === 'evaluated' ? (
                                                            <Link to={`/student/feedback/${a.submissionId || a.id}`} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>View Feedback</Link>
                                                        ) : statusLower === 'submitted' && !isLate ? (
                                                            <button onClick={() => handleAction(a)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                                                                <FiUpload size={12} style={{ marginRight: 4 }} /> Change File
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: 'var(--light-gray)', fontSize: '0.85rem' }}>Submitted</span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Expanded Details Row */}
                                                {isExpanded && hasFile && (
                                                    <tr>
                                                        <td colSpan="8" style={{ padding: '4px 16px 16px 16px', border: 'none' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: 24,
                                                                alignItems: 'center',
                                                                padding: '14px 20px',
                                                                borderRadius: 8,
                                                                background: 'rgba(100,255,218,0.06)',
                                                                border: '1px solid rgba(100,255,218,0.15)',
                                                                flexWrap: 'wrap'
                                                            }}>
                                                                <div style={{ minWidth: 150 }}>
                                                                    <span style={{ fontSize: '0.7rem', color: 'var(--light-gray)', textTransform: 'uppercase', letterSpacing: 1 }}>Uploaded File</span>
                                                                    <p style={{ margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                                                                        <FiFile size={15} style={{ color: 'var(--accent-blue)' }} />
                                                                        <strong>{a.fileName || a.filePath?.split('/').pop()}</strong>
                                                                    </p>
                                                                </div>
                                                                {a.submittedAt && (
                                                                    <div style={{ minWidth: 140 }}>
                                                                        <span style={{ fontSize: '0.7rem', color: 'var(--light-gray)', textTransform: 'uppercase', letterSpacing: 1 }}>Submitted On</span>
                                                                        <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>{new Date(a.submittedAt).toLocaleString()}</p>
                                                                    </div>
                                                                )}
                                                                {a.score != null && (
                                                                    <div>
                                                                        <span style={{ fontSize: '0.7rem', color: 'var(--light-gray)', textTransform: 'uppercase', letterSpacing: 1 }}>Score</span>
                                                                        <p style={{ margin: '4px 0 0', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '1.1rem' }}>{a.score}%</p>
                                                                    </div>
                                                                )}
                                                                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                                                    {/* View button - shows file info */}
                                                                    <button
                                                                        className="btn btn-secondary"
                                                                        style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            alert(`📄 File: ${a.fileName || a.filePath?.split('/').pop()}\n📅 Submitted: ${a.submittedAt ? new Date(a.submittedAt).toLocaleString() : 'N/A'}\n📊 Score: ${a.score != null ? a.score + '%' : 'Pending'}\n\nFile is stored on the server and can be viewed by your instructor.`);
                                                                        }}
                                                                    >
                                                                        <FiEye size={14} style={{ marginRight: 5 }} /> View Details
                                                                    </button>
                                                                    {/* Upload new file button (only if not late and submitted) */}
                                                                    {statusLower === 'submitted' && !isLate && (
                                                                        <button onClick={() => handleAction(a)} className="btn btn-accent" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                                                                            <FiUpload size={14} style={{ marginRight: 5 }} /> Upload New File
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    }) : (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: 20 }}>No assignments found matching your filters.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
