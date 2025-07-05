import axios from "axios"

// Create axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://portfolioo.uz",
  headers: {
    "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await api.post("/api/upload/file", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
    return response.data
}

// Categories API
export const categoriesApi = {
    getAll: () => api.get("/api/categories"),
    getById: (id: number) => api.get(`/api/categories/${id}`),
    getByUrl: (categoryUrl: string) => api.get(`/api/categories/url/${categoryUrl}`),
    create: (data: {
        name: string
        categoryUrl: string
        description: string
        imageUrl?: string // Add optional imageUrl
    }) => api.post("/api/categories", data),
    update: (
        id: number,
        data: {
            name?: string
            categoryUrl?: string
            description?: string
            imageUrl?: string // Add optional imageUrl
        },
    ) => api.patch(`/api/categories/${id}`, data),
    delete: (id: number) => api.delete(`/api/categories/${id}`),
}

// Difficulties API
export const difficultiesApi = {
    getAll: () => api.get("/api/difficulties"),
    getById: (id: number) => api.get(`/api/difficulties/${id}`),
    create: (data: { name: string; description: string }) => api.post("/api/difficulties", data),
    update: (id: number, data: { name?: string; description?: string }) => api.patch(`/api/difficulties/${id}`, data),
    delete: (id: number) => api.delete(`/api/difficulties/${id}`),
}