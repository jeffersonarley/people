import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { dashboardService } from '@/services/dashboardService'
import { useCanalesStore } from './canales'

export const useDashboardStore = defineStore('dashboard', () => {
  const canalSeleccionado = ref('')
  const resumen = ref(null)
  const cargando = ref(false)
  const error = ref('')

  const kpis = computed(() => {
    const data = resumen.value
    if (!data) return []

    return [
      {
        label: 'Total de líneas',
        value: data.total ?? 0,
        icon: 'phonelink_ring',
        color: 'primary'
      },
      {
        label: 'Líneas activas',
        value: data.activas ?? 0,
        icon: 'check_circle',
        color: 'positive'
      },
      {
        label: 'Líneas asignadas',
        value: data.asignadas ?? 0,
        icon: 'assignment_ind',
        color: 'accent'
      },
      {
        label: 'Líneas disponibles',
        value: data.disponibles ?? 0,
        icon: 'phonelink',
        color: 'info'
      },
      {
        label: 'Por cancelar',
        value: data.porCancelar ?? 0,
        icon: 'pending_actions',
        color: 'warning'
      },
      {
        label: 'Alerta: retirados con línea',
        value: data.alertaCritica?.cantidad ?? 0,
        icon: 'warning_amber',
        color: 'negative'
      }
    ]
  })

  const alertas = computed(() => resumen.value?.alertas || [])

  async function cargar() {
    cargando.value = true
    error.value = ''
    try {
      const data = await dashboardService.getResumen(canalSeleccionado.value)
      resumen.value = data
      useCanalesStore().establecerCanales(data?.canales || [])
    } catch (err) {
      error.value = err.userMessage || 'No se pudo cargar el dashboard.'
    } finally {
      cargando.value = false
    }
  }

  function seleccionarCanal(canal) {
    canalSeleccionado.value = canal || ''
    return cargar()
  }

  return {
    canalSeleccionado,
    resumen,
    cargando,
    error,
    kpis,
    alertas,
    cargar,
    seleccionarCanal
  }
})
