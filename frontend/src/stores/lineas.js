import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { lineasService } from '@/services/lineasService'
import { CANALES, OPERADORES } from '@/constants'

export const useLineasStore = defineStore('lineas', () => {
  const lineas = ref([])
  const cargando = ref(false)
  const guardando = ref(false)
  const error = ref('')
  const filtros = reactive({ busqueda: '', canal: '', operador: '', estado: '' })

  const lineasFiltradas = computed(() => {
    const termino = filtros.busqueda.trim().toLowerCase()

    return lineas.value.filter((linea) => {
      const empleado = linea.empleadoAsignado
      const texto = [
        linea.movil,
        linea.custCode,
        linea.ciclo,
        linea.canalAsignado,
        linea.operador,
        empleado?.documento,
        empleado?.nombresApellidos,
        empleado?.cargo
      ].filter(Boolean).join(' ').toLowerCase()

      const coincideTexto = !termino || texto.includes(termino)
      const coincideCanal = !filtros.canal || linea.canalAsignado === filtros.canal
      const coincideOperador = !filtros.operador || linea.operador === filtros.operador
      const coincideEstado = !filtros.estado || linea.estadoLinea === filtros.estado

      return coincideTexto && coincideCanal && coincideOperador && coincideEstado
    })
  })

  const operadores = computed(() => {
    const valores = new Set([...OPERADORES, ...lineas.value.map((linea) => linea.operador).filter(Boolean)])
    return [...valores].sort()
  })

  const canales = computed(() => {
    const valores = new Set([...CANALES, ...lineas.value.map((linea) => linea.canalAsignado).filter(Boolean)])
    return [...valores].sort()
  })

  async function cargar() {
    cargando.value = true
    error.value = ''
    try {
      lineas.value = await lineasService.getLineas({ limit: 5000 })
    } catch (err) {
      error.value = err.userMessage || 'No se pudieron cargar las líneas.'
    } finally {
      cargando.value = false
    }
  }

  async function ejecutar(metodo, id, payload) {
    guardando.value = true
    error.value = ''
    try {
      await lineasService[metodo](id, payload)
      await cargar()
      return true
    } catch (err) {
      error.value = err.userMessage || 'No se pudo completar la operación.'
      return false
    } finally {
      guardando.value = false
    }
  }

  return {
    lineas,
    cargando,
    guardando,
    error,
    filtros,
    lineasFiltradas,
    operadores,
    canales,
    cargar,
    ejecutar
  }
})
