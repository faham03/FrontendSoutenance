import axios from "axios"

const API_BASE_URL = "http://localhost:8000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        localStorage.setItem("access_token", access)

        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export const authAPI = {
  login: (username, password) => axios.post(`${API_BASE_URL}/auth/login/`, { username, password }),

  registerStudent: (data) => axios.post(`${API_BASE_URL}/users/register/student/`, data),

  getCurrentUser: () => api.get("/users/me/"),

  updatePassword: (data) => api.put("/users/me/password/", data),
}

export const coursesAPI = {
  getFilieres: () => api.get("/courses/filieres/"),
  getAnnees: () => api.get("/courses/annees/"),
  getRooms: () => api.get("/courses/rooms/"),
  getCourses: () => api.get("/courses/"),
  getSchedules: () => api.get("/courses/schedules/"),
  getEvents: () => api.get("/courses/events/"),
  getMyCourses: () => api.get("/courses/courses/my_courses/"),
  getMySchedule: () => api.get("/courses/schedules/my_schedule/"),
}

export const gradesAPI = {
  getGrades: () => api.get("/grades/grades/"),
  getMyGrades: () => api.get("/grades/grades/my_grades/"),
  getAverages: () => api.get("/grades/grades/averages/"),
  getClaims: () => api.get("/grades/claims/"),
  createClaim: (data) => api.post("/grades/claims/", data),
  respondToClaim: (id, data) => api.post(`/grades/claims/${id}/respond/`, data),
}

export const requestsAPI = {
  getRequests: () => api.get("/request/requests/"),
  getMyRequests: () => api.get("/request/requests/my_requests/"),
  createRequest: (data) => api.post("/request/requests/", data),
  updateRequest: (id, data) => api.patch(`/request/requests/${id}/`, data),
  approveRequest: (id, data) => api.post(`/request/requests/${id}/approve/`, data),
  rejectRequest: (id, data) => api.post(`/request/requests/${id}/reject/`, data),
  getPendingRequests: () => api.get("/request/requests/pending/"),
}

export const notificationsAPI = {
  getNotifications: () => api.get("/users/notifications/"),
  markAsRead: (id) => api.post(`/users/notifications/${id}/mark_read/`),
  markAllAsRead: () => api.post("/users/notifications/mark_all_read/"),
  getUnreadCount: () => api.get("/users/notifications/unread_count/"),
}

export const adminAPI = {
  // Users
  getUsers: () => api.get("/users/list/"),
  createUser: (data) => api.post("/users/register/teacher/", data),
  updateUser: (id, data) => api.put(`/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/users/${id}/`),

  // Filieres
  getFilieres: () => api.get("/courses/filieres/"),
  createFiliere: (data) => api.post("/courses/filieres/", data),
  updateFiliere: (id, data) => api.put(`/courses/filieres/${id}/`, data),
  deleteFiliere: (id) => api.delete(`/courses/filieres/${id}/`),

  // Annees
  getAnnees: () => api.get("/courses/annees/"),
  createAnnee: (data) => api.post("/courses/annees/", data),
  updateAnnee: (id, data) => api.put(`/courses/annees/${id}/`, data),
  deleteAnnee: (id) => api.delete(`/courses/annees/${id}/`),

  // Courses
  getCourses: () => api.get("/courses/courses/"),
  createCourse: (data) => api.post("/courses/courses/", data),
  updateCourse: (id, data) => api.put(`/courses/courses/${id}/`, data),
  deleteCourse: (id) => api.delete(`/courses/courses/${id}/`),

  // Rooms management
  getRooms: () => api.get("/courses/rooms/"),
  createRoom: (data) => api.post("/courses/rooms/", data),
  updateRoom: (id, data) => api.put(`/courses/rooms/${id}/`, data),
  deleteRoom: (id) => api.delete(`/courses/rooms/${id}/`),

  // Events management
  getEvents: () => api.get("/courses/events/"),
  createEvent: (data) => api.post("/courses/events/", data),
  updateEvent: (id, data) => api.put(`/courses/events/${id}/`, data),
  deleteEvent: (id) => api.delete(`/courses/events/${id}/`),

  // Schedules management
  getSchedules: () => api.get("/courses/schedules/"),
  createSchedule: (data) => api.post("/courses/schedules/", data),
  updateSchedule: (id, data) => api.put(`/courses/schedules/${id}/`, data),
  deleteSchedule: (id) => api.delete(`/courses/schedules/${id}/`),

  // Claims/Requests
  getClaims: () => api.get("/grades/claims/"),
  respondToClaim: (id, data) => api.post(`/grades/claims/${id}/respond/`, data),

  // Requests
  getRequests: () => api.get("/request/requests/"),
  getPendingRequests: () => api.get("/request/requests/pending/"),
  approveRequest: (id, data) => api.post(`/request/requests/${id}/approve/`, data),
  rejectRequest: (id, data) => api.post(`/request/requests/${id}/reject/`, data),

  // Grades
  getGrades: () => api.get("/grades/grades/"),
  createGrade: (data) => api.post("/grades/grades/", data),
  getCourseGrades: (courseId) => api.get(`/grades/grades/course_grades/?course_id=${courseId}`),
}

// Teacher API
export const teacherAPI = {
  getMyCourses: () => api.get("/courses/courses/my_courses/"),
  getMySchedule: () => api.get("/courses/schedules/my_schedule/"),
  getCourseGrades: (courseId) => api.get(`/grades/grades/course_grades/?course_id=${courseId}`),
  createGrade: (data) => api.post("/grades/grades/", data),
  updateGrade: (id, data) => api.put(`/grades/grades/${id}/`, data),
}

export default api
