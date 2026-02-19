import { useState, useEffect } from 'react';
import { courseAPI } from '../services/api';
import './Courses.css';

// Fallback data
const fallbackCourses = [
    { id: 1, courseId: 'CS101', name: 'Computer Science & Engineering', icon: '💻', duration: '4 Years', degree: 'B.Tech', description: 'Learn programming, algorithms, AI, and software engineering with hands-on projects.', subjects: ['Data Structures', 'Machine Learning', 'Web Development', 'Cloud Computing'] },
    { id: 2, courseId: 'EC101', name: 'Electronics & Communication', icon: '📡', duration: '4 Years', degree: 'B.Tech', description: 'Master electronic circuits, signal processing, and communication systems.', subjects: ['VLSI Design', 'Signal Processing', 'IoT', 'Embedded Systems'] },
    { id: 3, courseId: 'MBA101', name: 'Business Administration', icon: '📊', duration: '2 Years', degree: 'MBA', description: 'Develop leadership skills and business acumen for the corporate world.', subjects: ['Marketing', 'Finance', 'Operations', 'Strategy'] },
    { id: 4, courseId: 'DS101', name: 'Data Science & Analytics', icon: '📈', duration: '4 Years', degree: 'B.Sc', description: 'Dive into statistics, data visualization, and predictive modeling.', subjects: ['Statistics', 'Python', 'Big Data', 'Deep Learning'] },
    { id: 5, courseId: 'AI101', name: 'Artificial Intelligence', icon: '🤖', duration: '4 Years', degree: 'B.Tech', description: 'Specialize in AI, neural networks, NLP, and robotics.', subjects: ['Neural Networks', 'NLP', 'Computer Vision', 'Reinforcement Learning'] },
    { id: 6, courseId: 'BT101', name: 'Biotechnology', icon: '🧬', duration: '4 Years', degree: 'B.Tech', description: 'Explore genetic engineering, microbiology, and pharmaceutical sciences.', subjects: ['Genetics', 'Microbiology', 'Bioinformatics', 'Immunology'] },
];

const iconMap = {
    'Computer Science': '💻', 'Electronics': '📡', 'Business': '📊',
    'Data Science': '📈', 'Artificial Intelligence': '🤖', 'Biotechnology': '🧬',
};

export default function Courses() {
    const [courses, setCourses] = useState(fallbackCourses);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // GET /api/courses
        courseAPI.getAll()
            .then((res) => {
                if (res.data && Array.isArray(res.data)) {
                    const mapped = res.data.map((c, i) => ({
                        ...c,
                        icon: c.icon || iconMap[c.department] || '📚',
                        subjects: c.subjects || [],
                    }));
                    setCourses(mapped);
                }
            })
            .catch(() => {
                // Use fallback
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="courses-page">
            <section className="courses-hero">
                <div className="container">
                    <span className="hero-badge">📚 Academics</span>
                    <h1 className="courses-hero-title">Our Programs</h1>
                    <p className="courses-hero-subtitle">Discover world-class programs designed to prepare you for a successful career</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                    ) : (
                        <div className="courses-grid">
                            {courses.map((course, index) => (
                                <div className="course-card glass-card animate-fade-in-up" key={course.id || index} style={{ animationDelay: `${index * 0.08}s` }}>
                                    <div className="course-icon">{course.icon}</div>
                                    <div className="course-meta">
                                        <span className="badge badge-info">{course.degree || 'Degree'}</span>
                                        <span className="course-duration">{course.duration || '4 Years'}</span>
                                    </div>
                                    <h3 className="course-name">{course.name}</h3>
                                    <p className="course-desc">{course.description}</p>
                                    {course.subjects?.length > 0 && (
                                        <div className="course-subjects">
                                            {course.subjects.map((sub, i) => (
                                                <span className="subject-chip" key={i}>{sub}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
