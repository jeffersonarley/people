import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CANALES } from '@/constants'
import { dashboardService } from '@/services/dashboardService'

export const useCanalesStore = defineStore('canales', () => {
  const canales = ref([...CANALES])
  const cargando = ref(false)

  function establecerCanales(valores) {
    if (!Array.isArray(valores)) return
    const normalizados = valores
      .map((canal) => typeof canal === 'string' ? canal : canal?.nombre || canal?.codigo || canal?.canal)
      .filter(Boolean)
    canales.value = [...new Set([...CANALES, ...normalizados])]
  }

  async function cargarCanales() {
    cargando.value = true
    try {
      const resumen = await dashboardService.getResumen()
      establecerCanales(resumen?.canales || [])
    } catch {
      canales.value = [...CANALES]
    } finally {
      cargando.value = false
    }
  }

  return { canales, cargando, establecerCanales, cargarCanales }
})
