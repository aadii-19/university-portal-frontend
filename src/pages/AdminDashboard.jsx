import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [news, setNews] = useState([]);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventsRes, newsRes, usersRes, coursesRes] = await Promise.all([
                adminAPI.getEvents(),
                adminAPI.getNews(),
                adminAPI.getUsers(),
                adminAPI.getCourses()
            ]);
            setEvents(eventsRes.data);
            setNews(newsRes.data);
            setUsers(usersRes.data);
            setCourses(coursesRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
        setLoading(false);
    };

    // ── Modal Handlers ──────────────────────────

    const openCreateModal = () => {
        setEditingItem(null);
        if (activeTab === 'events') {
            setFormData({ title: '', description: '', date: '', category: 'upcoming', tag: '', location: '' });
        } else if (activeTab === 'news') {
            setFormData({ title: '', description: '', date: '', content: '' });
        } else if (activeTab === 'users') {
            setFormData({ name: '', email: '', password: '', role: 'STUDENT', department: '' });
        } else if (activeTab === 'courses') {
            setFormData({ courseId: '', name: '', department: '', duration: '', degree: '', description: '' });
        }
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({ ...item, password: '' }); // Don't show password on edit
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({});
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ── CRUD Operations ─────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'events') {
                if (editingItem) {
                    await adminAPI.updateEvent(editingItem.id, formData);
                } else {
                    await adminAPI.createEvent(formData);
                }
            } else if (activeTab === 'news') {
                if (editingItem) {
                    await adminAPI.updateNews(editingItem.id, formData);
                } else {
                    await adminAPI.createNews(formData);
                }
            } else if (activeTab === 'users') {
                if (editingItem) {
                    await adminAPI.updateUser(editingItem.id, formData);
                } else {
                    await adminAPI.createUser(formData);
                }
            } else if (activeTab === 'courses') {
                if (editingItem) {
                    await adminAPI.updateCourse(editingItem.id, formData);
                } else {
                    await adminAPI.createCourse(formData);
                }
            }
            closeModal();
            fetchData();
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save. Please try again. ' + (err.response?.data?.error || ''));
        }
    };

    const handleDelete = (id) => {
        let item;
        if (activeTab === 'events') item = events.find(i => i.id === id);
        else if (activeTab === 'news') item = news.find(i => i.id === id);
        else if (activeTab === 'users') item = users.find(i => i.id === id);
        else if (activeTab === 'courses') item = courses.find(i => i.id === id);

        setDeleteConfirm({
            show: true,
            id,
            title: item?.title || item?.name || '' // Events/News use title, Users/Courses use name
        });
    };

    const confirmDelete = async () => {
        const { id } = deleteConfirm;
        setDeleteConfirm({ show: false, id: null, title: '' });
        try {
            if (activeTab === 'events') await adminAPI.deleteEvent(id);
            else if (activeTab === 'news') await adminAPI.deleteNews(id);
            else if (activeTab === 'users') await adminAPI.deleteUser(id);
            else if (activeTab === 'courses') await adminAPI.deleteCourse(id);

            fetchData();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete. Please try again.');
        }
    };

    // ── Render ───────────────────────────────────

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading admin panel...</p>
            </div>
        );
    }

    const getTabLabel = () => {
        switch (activeTab) {
            case 'events': return 'Events';
            case 'news': return 'News';
            case 'users': return 'Users';
            case 'courses': return 'Courses';
            default: return '';
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="admin-header-text">
                    <h1>⚙️ Admin Panel</h1>
                    <p>Manage portal resources</p>
                </div>
            </div>

            <div className="admin-container container">
                {/* Tab Navigation */}
                <div className="admin-tabs">
                    {['events', 'news', 'users', 'courses'].map(tab => (
                        <button
                            key={tab}
                            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {tab === 'events' ? '📅' : tab === 'news' ? '📰' : tab === 'users' ? '👥' : '🎓'} {tab}
                        </button>
                    ))}
                </div>

                {/* Action Bar */}
                <div className="admin-action-bar">
                    <h2>Manage {getTabLabel()}</h2>
                    <button className="btn btn-primary admin-add-btn" onClick={openCreateModal}>
                        ➕ Add {getTabLabel().slice(0, -1)}
                    </button>
                </div>

                {/* Data Table */}
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                {activeTab === 'events' && (
                                    <><th>Title</th><th>Date</th><th>Category</th><th>Tag</th><th>Description</th></>
                                )}
                                {activeTab === 'news' && (
                                    <><th>Title</th><th>Date</th><th>Description</th></>
                                )}
                                {activeTab === 'users' && (
                                    <><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Student ID</th></>
                                )}
                                {activeTab === 'courses' && (
                                    <><th>ID</th><th>Name</th><th>Department</th><th>Degree</th><th>Description</th></>
                                )}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const data = activeTab === 'events' ? events :
                                    activeTab === 'news' ? news :
                                        activeTab === 'users' ? users.filter(u => u.role !== 'ADMIN') : courses;

                                if (data.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan="6" className="empty-row">
                                                No {activeTab} found. Click "Add" to create one.
                                            </td>
                                        </tr>
                                    );
                                }

                                return data.map((item) => (
                                    <tr key={item.id}>
                                        {activeTab === 'events' && (
                                            <>
                                                <td className="td-title">{item.title}</td>
                                                <td className="td-date">{item.date}</td>
                                                <td><span className={`badge badge-${item.category}`}>{item.category}</span></td>
                                                <td className="td-tag">{item.tag}</td>
                                                <td className="td-desc">{item.description?.substring(0, 50)}...</td>
                                            </>
                                        )}
                                        {activeTab === 'news' && (
                                            <>
                                                <td className="td-title">{item.title}</td>
                                                <td className="td-date">{item.date}</td>
                                                <td className="td-desc">{item.description?.substring(0, 80)}...</td>
                                            </>
                                        )}
                                        {activeTab === 'users' && (
                                            <>
                                                <td className="td-title">{item.name}</td>
                                                <td>{item.email}</td>
                                                <td><span className={`badge badge-${item.role?.toLowerCase()}`}>{item.role}</span></td>
                                                <td>{item.department || '-'}</td>
                                                <td>{item.studentId || '-'}</td>
                                            </>
                                        )}
                                        {activeTab === 'courses' && (
                                            <>
                                                <td>{item.courseId}</td>
                                                <td className="td-title">{item.name}</td>
                                                <td>{item.department}</td>
                                                <td>{item.degree}</td>
                                                <td className="td-desc">{item.description?.substring(0, 50)}...</td>
                                            </>
                                        )}
                                        <td className="td-actions">
                                            <button className="action-btn edit-btn" onClick={() => openEditModal(item)}>✏️ Edit</button>
                                            <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>🗑️ Delete</button>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingItem ? 'Edit' : 'Create'} {activeTab === 'events' ? 'Event' : activeTab === 'news' ? 'News' : activeTab === 'users' ? 'User' : 'Course'}</h3>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    type="text" name="title" className="form-input"
                                    value={formData.title || ''} onChange={handleChange} required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date" name="date" className="form-input"
                                        value={formData.date || ''} onChange={handleChange} required
                                    />
                                </div>

                                {activeTab === 'events' && (
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select name="category" className="form-input" value={formData.category || 'upcoming'} onChange={handleChange}>
                                            <option value="upcoming">Upcoming</option>
                                            <option value="ongoing">Ongoing</option>
                                            <option value="past">Past</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {activeTab === 'events' && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Tag</label>
                                        <input
                                            type="text" name="tag" className="form-input"
                                            value={formData.tag || ''} onChange={handleChange}
                                            placeholder="e.g. Technology, Culture"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input
                                            type="text" name="location" className="form-input"
                                            value={formData.location || ''} onChange={handleChange}
                                            placeholder="e.g. Main Auditorium"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description" className="form-input form-textarea"
                                    value={formData.description || ''} onChange={handleChange}
                                    rows={3} required
                                />
                            </div>

                            {activeTab === 'news' && (
                                <div className="form-group">
                                    <label className="form-label">Full Content</label>
                                    <textarea
                                        name="content" className="form-input form-textarea"
                                        value={formData.content || ''} onChange={handleChange}
                                        rows={4}
                                    />
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Name</label>
                                            <input type="text" name="name" className="form-input" value={formData.name || ''} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email</label>
                                            <input type="email" name="email" className="form-input" value={formData.email || ''} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Password {editingItem && '(Leave blank to keep current)'}</label>
                                            <input type="password" name="password" className="form-input" value={formData.password || ''} onChange={handleChange} required={!editingItem} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Role</label>
                                            <select name="role" className="form-input" value={formData.role || 'STUDENT'} onChange={handleChange}>
                                                <option value="STUDENT">Student</option>
                                                <option value="FACULTY">Faculty</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <input type="text" name="department" className="form-input" value={formData.department || ''} onChange={handleChange} placeholder="Required for Faculty/Student" />
                                    </div>
                                </>
                            )}

                            {activeTab === 'courses' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Course ID</label>
                                            <input type="text" name="courseId" className="form-input" value={formData.courseId || ''} onChange={handleChange} required disabled={!!editingItem} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Course Name</label>
                                            <input type="text" name="name" className="form-input" value={formData.name || ''} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Department</label>
                                            <input type="text" name="department" className="form-input" value={formData.department || ''} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Degree</label>
                                            <select name="degree" className="form-input" value={formData.degree || 'B.Tech'} onChange={handleChange}>
                                                <option value="B.Tech">B.Tech</option>
                                                <option value="M.Tech">M.Tech</option>
                                                <option value="B.Sc">B.Sc</option>
                                                <option value="M.Sc">M.Sc</option>
                                                <option value="Ph.D">Ph.D</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea name="description" className="form-input form-textarea" value={formData.description || ''} onChange={handleChange} rows={3} />
                                    </div>
                                </>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingItem ? '💾 Update' : '➕ Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                show={deleteConfirm.show}
                title={`Delete ${activeTab === 'events' ? 'Event' : 'News'}`}
                message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ show: false, id: null, title: '' })}
            />
        </div>
    );
}
