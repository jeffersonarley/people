import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message
      || error.response?.data?.message
      || (error.code === 'ECONNABORTED'
        ? 'La solicitud tardó demasiado. Intente nuevamente.'
        : 'No fue posible conectar con el servidor.')
    error.userMessage = message
    return Promise.reject(error)
  }
)

export default api
