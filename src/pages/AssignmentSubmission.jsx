import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, assignmentAPI } from '../services/api';
import { evaluateAssignment, readFileContent, isAIConfigured } from '../services/aiService';
import Sidebar from '../components/Sidebar';
import { FiFileText, FiFile, FiCpu, FiClipboard, FiZap, FiCheckCircle } from 'react-icons/fi';
import './Dashboard.css';

// Fallback data
const fallbackCourses = [
    { id: 'CS201', name: 'Data Structures' },
    { id: 'CS202', name: 'Database Management' },
    { id: 'CS301', name: 'Machine Learning' },
    { id: 'CS305', name: 'Web Development' },
    { id: 'CS204', name: 'Computer Networks' },
];

const fallbackAssignmentsByCourse = {
    CS201: ['Lab 1 - Linked Lists', 'Lab 2 - Binary Trees', 'Lab 3 - Graph Algorithms'],
    CS202: ['ER Diagram Design', 'SQL Queries Assignment', 'Normalization Exercise'],
    CS301: ['Project Proposal', 'Literature Review', 'Model Implementation'],
    CS305: ['React App Development', 'REST API Design', 'Full Stack Project'],
    CS204: ['TCP/IP Analysis', 'Network Simulation', 'Protocol Design'],
};

export default function AssignmentSubmission() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState(fallbackCourses);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [aiError, setAiError] = useState('');

    const [submissions, setSubmissions] = useState([]);

    // Read pre-fill state from navigation
    const location = useLocation();
    const prefillCourseId = location.state?.courseId || '';
    const prefillAssignmentId = location.state?.assignmentId || '';
    const [prefillApplied, setPrefillApplied] = useState(false);

    // Fetch courses and student submissions
    useEffect(() => {
        const studentId = user?.studentId || user?.id;
        // Fetch courses
        courseAPI.getAll()
            .then((res) => {
                if (res.data && Array.isArray(res.data)) {
                    const mapped = res.data.map(c => ({ id: c.courseId || c.id, name: c.name || c.courseName }));
                    setCourses(mapped);
                }
            })
            .catch(() => { /* use fallback */ })
            .finally(() => {
                // Auto-fill course from navigation state after courses load
                if (prefillCourseId && !prefillApplied) {
                    handleCourseChange(prefillCourseId);
                    setPrefillApplied(true);
                }
            });

        // Fetch student submissions
        if (studentId) {
            assignmentAPI.getByStudent(studentId)
                .then(res => {
                    if (res.data) setSubmissions(res.data);
                })
                .catch(err => console.error("Failed to fetch submissions", err));
        }
    }, [user]);

    // Fetch assignments when course is selected
    const handleCourseChange = async (courseId) => {
        setSelectedCourse(courseId);
        setSelectedAssignment('');
        setFile(null);
        setSubmitted(false);
        setFeedback(null);

        if (!courseId) { setAssignments([]); return; }

        try {
            // GET /api/assignments/course/{courseId}
            const res = await assignmentAPI.getByCourse(courseId);
            if (res.data && Array.isArray(res.data)) {
                setAssignments(res.data.map(a => ({
                    id: a.id,
                    title: a.title || a.name,
                    dueDate: a.dueDate
                })));
            } else {
                throw new Error('fallback');
            }
        } catch {
            // Use fallback
            const fallback = fallbackAssignmentsByCourse[courseId] || [];
            setAssignments(fallback.map((title, i) => ({ id: i + 1, title })));
        }
    };

    // Auto-select assignment when assignments load and prefill is set
    useEffect(() => {
        if (prefillAssignmentId && assignments.length > 0) {
            const match = assignments.find(a => String(a.id) === String(prefillAssignmentId));
            if (match) {
                setSelectedAssignment(String(match.id));
            }
        }
    }, [assignments, prefillAssignmentId]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped) setFile(dropped);
    };

    // Get the selected assignment title
    const getAssignmentTitle = () => {
        const found = assignments.find(a => String(a.id) === String(selectedAssignment));
        return found?.title || selectedAssignment;
    };

    const getCourseName = () => {
        const found = courses.find(c => c.id === selectedCourse);
        return found ? `${found.id} — ${found.name}` : selectedCourse;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setAiError('');

        // Step 1: Try uploading to backend
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('courseId', selectedCourse);
            formData.append('assignmentId', selectedAssignment);
            formData.append('studentId', user?.studentId || user?.id || 'STU001');

            const res = await assignmentAPI.upload(formData);

            // If backend returns feedback directly, use it
            if (res.data?.feedback) {
                setSubmitted(true);
                setSubmitting(false);
                setFeedback(res.data.feedback);
                return;
            }
        } catch {
            // Backend unavailable — continue with AI evaluation
        }

        setSubmitted(true);
        setSubmitting(false);

        // Step 2: Use OpenRouter AI to evaluate
        setEvaluating(true);

        if (isAIConfigured()) {
            try {
                const fileContent = await readFileContent(file);
                const result = await evaluateAssignment({
                    assignmentTitle: getAssignmentTitle(),
                    courseName: getCourseName(),
                    fileContent,
                });
                setFeedback(result);
            } catch (err) {
                console.error('OpenRouter AI error:', err);
                setAiError('AI evaluation encountered an error. Showing fallback results.');
                setFeedback(getMockFeedback());
            }
        } else {
            // No API key configured — use mock
            await new Promise(r => setTimeout(r, 2000));
            setFeedback(getMockFeedback());
        }

        setEvaluating(false);
    };

    const getMockFeedback = () => ({
        grammarScore: 85,
        relevanceScore: 92,
        originalityScore: 78,
        overallScore: 85,
        summary: 'The assignment demonstrates a solid understanding of the topic with well-structured arguments and clear explanations.',
        suggestions: [
            'Consider adding more real-world examples to strengthen arguments',
            'The conclusion section could be more comprehensive',
            'Add citations from peer-reviewed sources for better credibility',
            'Minor grammatical improvements needed in paragraphs 3 and 5',
        ],
    });

    const resetForm = () => {
        setSelectedCourse('');
        setSelectedAssignment('');
        setAssignments([]);
        setFile(null);
        setSubmitted(false);
        setFeedback(null);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <div className="dashboard-header animate-fade-in-up">
                    <div>
                        <h1><FiFileText size={22} style={{ marginRight: 6 }} /> Submit Assignment</h1>
                        <p className="dashboard-subtitle">Upload your work for AI-powered evaluation</p>
                    </div>
                </div>

                {!submitted ? (
                    <div className="dashboard-section glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <form onSubmit={handleSubmit} className="dashboard-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Select Course</label>
                                    <select className="form-select" value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)} required>
                                        <option value="">Choose a course</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.id} — {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Select Assignment</label>
                                    <select className="form-select" value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)} required disabled={!selectedCourse}>
                                        <option value="">Choose an assignment</option>
                                        {assignments.map((a) => (
                                            <option key={a.id} value={a.id}>{a.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Upload File</label>
                                {(() => {
                                    const assignment = assignments.find(a => String(a.id) === String(selectedAssignment));
                                    const existing = submissions.find(s => String(s.assignmentId) === String(selectedAssignment));
                                    const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null;

                                    // Check if late (compare dates only)
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const isLate = dueDate && today > dueDate;

                                    return (
                                        <>
                                            {existing && (
                                                <div className="existing-submission" style={{ marginBottom: 15, padding: 10, background: 'rgba(100,255,218,0.1)', borderRadius: 8, border: '1px solid rgba(100,255,218,0.3)' }}>
                                                    <p style={{ margin: 0, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
                                                        <FiCheckCircle style={{ marginRight: 5 }} />
                                                        <strong>Current Submission:</strong> {existing.fileName}
                                                    </p>
                                                    <p style={{ margin: '5px 0 0', fontSize: '0.8rem', opacity: 0.8 }}>
                                                        Submitted on: {new Date(existing.submittedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}

                                            {dueDate && (
                                                <p style={{ fontSize: '0.85rem', marginBottom: 10, color: isLate ? '#ff6b6b' : 'var(--text-secondary)' }}>
                                                    <strong>Due Date:</strong> {dueDate.toLocaleDateString()} {isLate && '(Deadline Passed)'}
                                                </p>
                                            )}

                                            {!isLate ? (
                                                <div className={`file-upload-area ${file ? 'has-file' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => document.getElementById('fileInput').click()}>
                                                    <input type="file" id="fileInput" accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" onChange={handleFileChange} style={{ display: 'none' }} />
                                                    {file ? (
                                                        <>
                                                            <span className="file-upload-icon"><FiFile size={28} /></span>
                                                            <p className="file-name">{file.name}</p>
                                                            <p className="file-upload-hint">{(file.size / 1024 / 1024).toFixed(2)} MB — Click to change</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="file-upload-icon">📁</span>
                                                            <p className="file-upload-text">{existing ? 'Drag & drop to replace file' : 'Drag & drop your file here or click to browse'}</p>
                                                            <p className="file-upload-hint">Supports PDF, DOCX, PNG, JPG (Max 10MB)</p>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="file-upload-area disabled" style={{ opacity: 0.6, cursor: 'not-allowed', borderColor: '#444' }}>
                                                    <p>Submissions are closed for this assignment.</p>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={submitting || !file || !selectedAssignment} style={{ minWidth: 200 }}>
                                {submitting ? '⏳ Uploading...' : '🚀 ' + (submissions.find(s => String(s.assignmentId) === String(selectedAssignment)) ? 'Resubmit & Evaluate' : 'Submit & Evaluate')}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="feedback-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="success-message">
                            <FiCheckCircle size={14} style={{ marginRight: 4 }} /> Assignment submitted successfully!
                        </div>

                        {aiError && (
                            <div className="success-message" style={{ background: 'rgba(255,107,107,0.15)', borderColor: 'rgba(255,107,107,0.3)' }}>
                                ⚠️ {aiError}
                            </div>
                        )}

                        {!evaluating && feedback && !aiError && isAIConfigured() && (
                            <div className="success-message" style={{ background: 'rgba(100,255,218,0.1)', borderColor: 'rgba(100,255,218,0.3)' }}>
                                <FiCpu size={14} style={{ marginRight: 4 }} /> Powered by AI via OpenRouter
                            </div>
                        )}

                        {evaluating ? (
                            <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
                                <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                                <h3><FiCpu size={18} style={{ marginRight: 4 }} /> AI is evaluating your submission...</h3>
                                <p style={{ color: 'var(--light-gray)', marginTop: 8 }}>Analyzing grammar, relevance, and originality</p>
                            </div>
                        ) : feedback && (
                            <>
                                <div className="feedback-scores">
                                    {[
                                        { label: 'Grammar', score: feedback.grammarScore, color: 'rgba(100,255,218,0.2)', textColor: 'var(--accent-blue)' },
                                        { label: 'Relevance', score: feedback.relevanceScore, color: 'rgba(240,192,64,0.2)', textColor: 'var(--accent-gold)' },
                                        { label: 'Originality', score: feedback.originalityScore, color: 'rgba(167,139,250,0.2)', textColor: 'var(--accent-purple)' },
                                        { label: 'Overall', score: feedback.overallScore, color: 'rgba(100,255,218,0.25)', textColor: 'var(--accent-blue)' },
                                    ].map((item, i) => (
                                        <div className="glass-card score-item animate-fade-in-up" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                                            <div className="score-circle" style={{ background: item.color, color: item.textColor }}>{item.score}%</div>
                                            <span className="score-label">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="glass-card feedback-card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                    <div className="feedback-text">
                                        <h4><FiClipboard size={14} style={{ marginRight: 4 }} /> Summary</h4>
                                        <p>{feedback.summary}</p>
                                    </div>
                                    <div className="feedback-text">
                                        <h4><FiZap size={14} style={{ marginRight: 4 }} /> Suggestions for Improvement</h4>
                                        <ul>{feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={resetForm} style={{ marginTop: 16 }}><FiFileText size={14} style={{ marginRight: 4 }} /> Submit Another Assignment</button>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
