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
  getCourses: () => api.get("/courses/courses/"),
  getSchedules: () => api.get("/courses/schedules/"),
  getEvents: () => api.get("/courses/events/"),
}

export const gradesAPI = {
  getGrades: () => api.get("/grades/grades/"),
  getClaims: () => api.get("/grades/claims/"),
  createClaim: (data) => api.post("/grades/claims/", data),
}

export const requestsAPI = {
  getRequests: () => api.get("/request/requests/"),
  createRequest: (data) => api.post("/request/requests/", data),
}

export const notificationsAPI = {
  getNotifications: () => api.get("/users/notifications/"),
  markAsRead: (id) => api.patch(`/users/notifications/${id}/`, { is_read: true }),
}

export const adminAPI = {
  // Users
  getUsers: () => api.get("/admin/users/"),
  createUser: (data) => api.post("/admin/users/", data),
  updateUser: (id, data) => api.put(`/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),

  // Courses
  getCourses: () => api.get("/admin/courses/"),
  createCourse: (data) => api.post("/admin/courses/", data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}/`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}/`),

  // Claims
  getClaims: () => api.get("/admin/claims/"),
  updateClaim: (id, data) => api.put(`/admin/claims/${id}/`, data),

  // Requests
  getRequests: () => api.get("/admin/requests/"),
  updateRequest: (id, data) => api.put(`/admin/requests/${id}/`, data),
}

export default api