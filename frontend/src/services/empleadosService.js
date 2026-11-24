import api from './api'

export const empleadosService = {
  async getEmpleados(params = {}) {
    const { data } = await api.get('/empleados', { params })
    return data?.data ?? []
  },
  async getEmpleado(id) {
    const { data } = await api.get(`/empleados/${id}`)
    return data?.data ?? null
  },
  async crear(payload) {
    const { data } = await api.post('/empleados', payload)
    return data?.data ?? null
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/empleados/${id}`, payload)
    return data?.data ?? null
  },
  async eliminar(id) {
    const { data } = await api.delete(`/empleados/${id}`)
    return data?.data ?? null
  }
}
