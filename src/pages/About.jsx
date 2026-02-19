import './About.css';

const values = [
    { icon: '🎯', title: 'Excellence', desc: 'Committed to the highest standards in education and research.' },
    { icon: '💡', title: 'Innovation', desc: 'Fostering creative thinking and technological advancement.' },
    { icon: '🤝', title: 'Integrity', desc: 'Building trust through ethical practices and transparency.' },
    { icon: '🌍', title: 'Diversity', desc: 'Embracing diverse perspectives and inclusive community.' },
];

const milestones = [
    { year: '1985', event: 'University Founded' },
    { year: '1995', event: 'First Research Center Established' },
    { year: '2005', event: 'International Accreditation Received' },
    { year: '2015', event: 'Ranked Top 10 Nationally' },
    { year: '2020', event: 'AI & Innovation Hub Launched' },
    { year: '2025', event: '40th Anniversary — 15,000+ Students' },
];

export default function About() {
    return (
        <div className="about-page">
            {/* Hero Banner */}
            <section className="about-hero">
                <div className="container">
                    <span className="hero-badge">🏛️ About Us</span>
                    <h1 className="about-hero-title">Shaping Minds Since 1985</h1>
                    <p className="about-hero-subtitle">
                        Vel Tech University stands at the forefront of academic excellence, nurturing leaders
                        and innovators who make a lasting impact on society.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="section">
                <div className="container about-grid">
                    <div className="glass-card about-card">
                        <h3>🎯 Our Mission</h3>
                        <p>
                            To provide transformative education that empowers students to think critically,
                            innovate boldly, and contribute meaningfully to a rapidly evolving global landscape.
                        </p>
                    </div>
                    <div className="glass-card about-card">
                        <h3>🔭 Our Vision</h3>
                        <p>
                            To be a world-renowned institution recognized for academic excellence, groundbreaking
                            research, and producing graduates who lead positive change in their communities.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="section values-section">
                <div className="container">
                    <h2 className="section-title">Our Core Values</h2>
                    <p className="section-subtitle">The principles that guide everything we do</p>
                    <div className="values-grid">
                        {values.map((val, i) => (
                            <div className="glass-card value-card animate-fade-in-up" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                                <span className="value-icon">{val.icon}</span>
                                <h4>{val.title}</h4>
                                <p>{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="section timeline-section">
                <div className="container">
                    <h2 className="section-title">Our Journey</h2>
                    <p className="section-subtitle">Key milestones that define our legacy</p>
                    <div className="timeline">
                        {milestones.map((m, i) => (
                            <div className="timeline-item animate-fade-in-up" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content glass-card">
                                    <span className="timeline-year">{m.year}</span>
                                    <p className="timeline-event">{m.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
