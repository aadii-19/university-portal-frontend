import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("universityPortalUser") || "{}");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ──────────────────────────────────────────
// Authentication
// ──────────────────────────────────────────
export const authAPI = {
  /** POST /api/auth/login – Login user and return role + token */
  login: (credentials) => api.post("/auth/login", credentials),

  /** GET /api/auth/me – Get logged-in user info */
  me: () => api.get("/auth/me"),

  /** POST /api/auth/register – Register a new user */
  register: (userData) => api.post("/auth/register", userData),
};

// ──────────────────────────────────────────
// University Home
// ──────────────────────────────────────────
export const universityAPI = {
  /** GET /api/university/info – University details */
  getInfo: () => api.get("/university/info"),

  /** GET /api/university/events – Events & news */
  getEvents: () => api.get("/university/events"),

  /** GET /api/university/events/{id} – Single event */
  getEventById: (id) => api.get(`/university/events/${id}`),
};

// ──────────────────────────────────────────
// Courses
// ──────────────────────────────────────────
export const courseAPI = {
  /** GET /api/courses – Get all courses */
  getAll: () => api.get("/courses"),

  /** GET /api/courses/{courseId}/students – Get students of a course */
  getStudents: (courseId) => api.get(`/courses/${courseId}/students`),
};

// ──────────────────────────────────────────
// Attendance
// ──────────────────────────────────────────
export const attendanceAPI = {
  /** POST /api/attendance – Mark attendance (faculty) */
  mark: (data) => api.post("/attendance", data),

  /** GET /api/attendance/course/{courseId}/date/{date} – View attendance by date */
  getByDate: (courseId, date) =>
    api.get(`/attendance/course/${courseId}/date/${date}`),

  /** GET /api/attendance/course/{courseId}?from=&to= – Attendance report */
  getReport: (courseId, from, to) =>
    api.get(`/attendance/course/${courseId}`, { params: { from, to } }),

  /** GET /api/attendance/student/{studentId} – Student attendance summary */
  getStudentSummary: (studentId) => api.get(`/attendance/student/${studentId}`),
};

// ──────────────────────────────────────────
// Assignments
// ──────────────────────────────────────────
export const assignmentAPI = {
  /** GET /api/assignments/course/{courseId} – Get assignments for a course */
  getByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),

  /** POST /api/assignments/upload – Upload assignment & trigger AI */
  upload: (formData) =>
    api.post("/assignments/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /** GET /api/assignments/student/{studentId} – Student submissions */
  getByStudent: (studentId) => api.get(`/assignments/student/${studentId}`),
};

// ──────────────────────────────────────────
// AI Feedback
// ──────────────────────────────────────────
export const aiFeedbackAPI = {
  /** GET /api/ai-feedback/submission/{submissionId} – Get AI feedback */
  getBySubmission: (submissionId) =>
    api.get(`/ai-feedback/submission/${submissionId}`),
};

// ──────────────────────────────────────────
// Faculty
// ──────────────────────────────────────────
export const facultyAPI = {
  /** GET /api/assignments/course/{courseId}/submissions – All submissions for a course */
  getSubmissions: (courseId) =>
    api.get(`/assignments/course/${courseId}/submissions`),

  /** GET /api/ai-feedback/submission/{submissionId} – AI feedback for a submission */
  getFeedback: (submissionId) =>
    api.get(`/ai-feedback/submission/${submissionId}`),
};

// ──────────────────────────────────────────
// Dashboards
// ──────────────────────────────────────────
export const dashboardAPI = {
  /** GET /api/dashboard/student/{studentId} – Student dashboard data */
  getStudent: (studentId) => api.get(`/dashboard/student/${studentId}`),

  /** GET /api/dashboard/faculty/{facultyId} – Faculty dashboard data */
  getFaculty: (facultyId) => api.get(`/dashboard/faculty/${facultyId}`),
};

// ──────────────────────────────────────────
// Admin (Events & News Management)
// ──────────────────────────────────────────
export const adminAPI = {
  /** GET /api/admin/events – List all events */
  getEvents: () => api.get("/admin/events"),

  /** POST /api/admin/events – Create event */
  createEvent: (event) => api.post("/admin/events", event),

  /** PUT /api/admin/events/{id} – Update event */
  updateEvent: (id, event) => api.put(`/admin/events/${id}`, event),

  /** DELETE /api/admin/events/{id} – Delete event */
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),

  /** GET /api/admin/news – List all news */
  getNews: () => api.get("/admin/news"),

  /** POST /api/admin/news – Create news */
  createNews: (news) => api.post("/admin/news", news),

  /** PUT /api/admin/news/{id} – Update news */
  updateNews: (id, news) => api.put(`/admin/news/${id}`, news),

  /** DELETE /api/admin/news/{id} – Delete news */
  deleteNews: (id) => api.delete(`/admin/news/${id}`),

  // ── Users Management ──
  getUsers: () => api.get("/admin/users"),
  createUser: (user) => api.post("/admin/users", user),
  updateUser: (id, user) => api.put(`/admin/users/${id}`, user),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // ── Courses Management ──
  getCourses: () => api.get("/admin/courses"),
  createCourse: (course) => api.post("/admin/courses", course),
  updateCourse: (id, course) => api.put(`/admin/courses/${id}`, course),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
};

export default api;
