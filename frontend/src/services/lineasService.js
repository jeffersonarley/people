import api from './api'

export const lineasService = {
  async getLineas(params = {}) {
    const { data } = await api.get('/lineas', { params })
    return data?.data ?? []
  },
  async getLinea(id) {
    const { data } = await api.get(`/lineas/${id}`)
    return data?.data ?? null
  },
  async crear(payload) {
    const { data } = await api.post('/lineas', payload)
    return data?.data ?? null
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/lineas/${id}`, payload)
    return data?.data ?? null
  },
  async eliminar(id) {
    const { data } = await api.delete(`/lineas/${id}`)
    return data?.data ?? null
  },
  async asignar(id, payload) {
    const { data } = await api.post(`/lineas/${id}/asignar`, payload)
    return data?.data ?? null
  },
  async liberar(id, payload = {}) {
    const { data } = await api.post(`/lineas/${id}/liberar`, payload)
    return data?.data ?? null
  },
  async marcarCancelar(id, payload = {}) {
    const { data } = await api.post(`/lineas/${id}/marcar-cancelar`, payload)
    return data?.data ?? null
  },
  async getHistorial(id) {
    const { data } = await api.get(`/lineas/${id}/historial`)
    return data?.data ?? { linea: null, movimientos: [] }
  }
}
