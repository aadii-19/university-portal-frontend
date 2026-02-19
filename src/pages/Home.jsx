import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { universityAPI } from '../services/api';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { LuUsers } from 'react-icons/lu';
import { FiLock, FiVolume2 } from 'react-icons/fi';
import { BsBuildings } from 'react-icons/bs';
import './Home.css';

export default function Home() {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
    const [events, setEvents] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        universityAPI.getEvents()
            .then((res) => {
                if (res.data?.events) setEvents(res.data.events);
                if (res.data?.news) setNews(res.data.news);
            })
            .catch((err) => {
                console.error('Failed to fetch events/news:', err);
            })
            .finally(() => setLoading(false));
    }, []);

    const announcements = [
        'Mid-semester examinations begin March 20, 2026',
        'Last date for scholarship applications: March 10, 2026',
        'Library will remain open 24/7 during exam season',
        'New elective courses available for next semester registration',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const filteredEvents = events.filter((e) => e.category === activeTab);

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="hero-content container">
                    <div className="hero-text animate-fade-in-up">
                        <span className="hero-badge"><BsBuildings style={{ marginRight: 4 }} /> Welcome to</span>
                        <h1 className="hero-title">Vel Tech University</h1>
                        <p className="hero-subtitle">
                            Empowering the next generation of leaders through world-class education,
                            groundbreaking research, and innovative thinking.
                        </p>
                        <div className="hero-actions">
                            <Link to="/login/student" className="btn btn-primary">
                                <HiOutlineAcademicCap style={{ marginRight: 4 }} /> Student Portal
                            </Link>
                            <Link to="/login/faculty" className="btn btn-secondary">
                                <LuUsers style={{ marginRight: 4 }} /> Faculty Portal
                            </Link>
                            <Link to="/login/admin" className="btn btn-secondary" style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6', color: '#93c5fd' }}>
                                <FiLock style={{ marginRight: 4 }} /> Admin Portal
                            </Link>
                        </div>
                    </div>

                    <div className="hero-stats animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="stat-item">
                            <span className="stat-number">15K+</span>
                            <span className="stat-label">Students</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">800+</span>
                            <span className="stat-label">Faculty</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">50+</span>
                            <span className="stat-label">Programs</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">95%</span>
                            <span className="stat-label">Placement</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Announcements Ticker */}
            <section className="announcements-bar">
                <div className="container announcements-content">
                    <span className="announcement-label"><FiVolume2 style={{ marginRight: 4 }} /> Announcement</span>
                    <p className="announcement-text" key={currentAnnouncement}>
                        {announcements[currentAnnouncement]}
                    </p>
                </div>
            </section>

            {/* Events Section */}
            <section className="section events-section">
                <div className="container">
                    <h2 className="section-title">Campus Events</h2>
                    <p className="section-subtitle">Stay updated with what's happening around campus</p>

                    <div className="event-tabs">
                        <button className={`event-tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming Events</button>
                        <button className={`event-tab ${activeTab === 'ongoing' ? 'active' : ''}`} onClick={() => setActiveTab('ongoing')}>Ongoing Events</button>
                    </div>

                    <div className="events-grid">
                        {loading ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <div className="spinner"></div>
                                <p>Loading events...</p>
                            </div>
                        ) : filteredEvents.length > 0 ? (
                            filteredEvents.map((event, index) => (
                                <div className="event-card glass-card animate-fade-in-up" key={event.id} style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="event-card-top">
                                        <span className="event-tag">{event.tag}</span>
                                        <span className="event-date">
                                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="event-title">{event.title}</h3>
                                    <p className="event-desc">{event.description}</p>
                                    <Link to={`/events/${event.id}`} state={{ event }} className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>Learn More →</Link>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <p>No {activeTab} events at the moment. Check back later!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section className="section news-section">
                <div className="container">
                    <h2 className="section-title">Latest News</h2>
                    <p className="section-subtitle">What's new at Vel Tech University</p>
                    <div className="news-grid">
                        {loading ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <div className="spinner"></div>
                                <p>Loading news...</p>
                            </div>
                        ) : news.length > 0 ? (
                            news.map((item, index) => (
                                <div className="news-card glass-card animate-fade-in-up" key={item.id} style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="news-date">
                                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <h3 className="news-title">{item.title}</h3>
                                    <p className="news-desc">{item.description}</p>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <p>No news available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container cta-content">
                    <h2>Ready to Begin Your Journey?</h2>
                    <p>Join thousands of students who are shaping their future at Vel Tech University</p>
                    <div className="cta-actions">
                        <Link to="/courses" className="btn btn-primary">Explore Courses</Link>
                        <Link to="/about" className="btn btn-secondary">Learn More</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
