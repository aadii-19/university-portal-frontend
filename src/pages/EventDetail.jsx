import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { universityAPI } from '../services/api';
import './EventDetail.css';

export default function EventDetail() {
    const { id } = useParams();
    const location = useLocation();

    // Use event data passed via router state (instant), fallback to API
    const [event, setEvent] = useState(location.state?.event || null);
    const [loading, setLoading] = useState(!location.state?.event);
    const [error, setError] = useState(null);

    useEffect(() => {
        // If we already have the event from router state, skip API call
        if (event) return;

        universityAPI.getEventById(id)
            .then((res) => setEvent(res.data))
            .catch(() => setError('Event not found.'))
            .finally(() => setLoading(false));
    }, [id, event]);

    if (loading) {
        return (
            <div className="event-detail-loading">
                <div className="spinner"></div>
                <p>Loading event details...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="event-detail-error">
                <h2>😕 Event Not Found</h2>
                <p>{error || 'The event you are looking for does not exist.'}</p>
                <Link to="/" className="btn btn-primary">← Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="event-detail-page">
            <div className="event-detail-container">
                <Link to="/" className="back-link">← Back to Events</Link>

                <div className="event-detail-card glass-card animate-fade-in-up">
                    <div className="event-detail-header">
                        <div className="event-detail-meta">
                            <span className={`event-detail-badge badge-${event.category}`}>
                                {event.category}
                            </span>
                            {event.tag && <span className="event-detail-tag">{event.tag}</span>}
                        </div>
                        <h1 className="event-detail-title">{event.title}</h1>
                    </div>

                    <div className="event-detail-info">
                        <div className="info-item">
                            <span className="info-icon">📅</span>
                            <div>
                                <span className="info-label">Date</span>
                                <span className="info-value">
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        {event.location && (
                            <div className="info-item">
                                <span className="info-icon">📍</span>
                                <div>
                                    <span className="info-label">Location</span>
                                    <span className="info-value">{event.location}</span>
                                </div>
                            </div>
                        )}
                        {event.category && (
                            <div className="info-item">
                                <span className="info-icon">📂</span>
                                <div>
                                    <span className="info-label">Status</span>
                                    <span className="info-value" style={{ textTransform: 'capitalize' }}>{event.category}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="event-detail-body">
                        <h2>About This Event</h2>
                        <p>{event.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
