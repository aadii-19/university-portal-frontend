import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { aiFeedbackAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import { FiCpu, FiClipboard, FiZap } from 'react-icons/fi';
import './Dashboard.css';

// Fallback data
const fallbackFeedback = {
    assignment: 'Assignment',
    course: 'Course',
    submittedDate: new Date().toISOString().split('T')[0],
    grammarScore: 88,
    relevanceScore: 90,
    originalityScore: 82,
    overallScore: 87,
    summary: 'Excellent work demonstrating clear understanding of the topic with well-structured arguments and proper implementation.',
    suggestions: [
        'Add more edge case handling',
        'Consider using design patterns for flexibility',
        'Documentation could be improved with more comments',
        'Add complexity analysis for each operation',
    ],
};

export default function AIFeedback() {
    const { id } = useParams(); // submissionId
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFeedback = async () => {
            try {
                // GET /api/ai-feedback/submission/{submissionId}
                const res = await aiFeedbackAPI.getBySubmission(id);
                if (res.data) {
                    setFeedback(res.data);
                } else {
                    setFeedback(fallbackFeedback);
                }
            } catch {
                setFeedback(fallbackFeedback);
            }
            setLoading(false);
        };
        loadFeedback();
    }, [id]);

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <div className="dashboard-header animate-fade-in-up">
                    <div>
                        <Link to="/student/dashboard" style={{ color: 'var(--light-gray)', fontSize: '0.85rem' }}>← Back to Dashboard</Link>
                        <h1 style={{ marginTop: 8 }}><FiCpu size={22} style={{ marginRight: 6 }} /> AI Evaluation Report</h1>
                        <p className="dashboard-subtitle">{feedback.assignment || 'Assignment'} — {feedback.course || feedback.courseId || ''}</p>
                    </div>
                    {feedback.submittedDate && (
                        <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                            Submitted: {new Date(feedback.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    )}
                </div>

                <div className="feedback-section">
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
                        {feedback.suggestions?.length > 0 && (
                            <div className="feedback-text">
                                <h4><FiZap size={14} style={{ marginRight: 4 }} /> Suggestions for Improvement</h4>
                                <ul>{feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
