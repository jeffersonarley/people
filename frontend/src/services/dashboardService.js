import api from './api'

export const dashboardService = {
  async getResumen(canal = '') {
    const { data } = await api.get('/dashboard/resumen', { params: canal ? { canal } : {} })
    return data?.data ?? null
  }
}
