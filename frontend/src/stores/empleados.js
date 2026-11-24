import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { empleadosService } from '@/services/empleadosService'
import { CANALES } from '@/constants'

export const useEmpleadosStore = defineStore('empleados', () => {
  const empleados = ref([])
  const cargando = ref(false)
  const guardando = ref(false)
  const error = ref('')
  const filtros = reactive({ busqueda: '', estadoLaboral: '', canal: '' })

  const empleadosFiltrados = computed(() => {
    const termino = filtros.busqueda.trim().toLowerCase()

    return empleados.value.filter((empleado) => {
      const texto = [
        empleado.documento,
        empleado.nombresApellidos,
        empleado.cargo,
        empleado.canal,
        empleado.puntoVenta,
        empleado.ciudad,
        ...(empleado.lineas || []).map((linea) => linea.movil)
      ].filter(Boolean).join(' ').toLowerCase()

      const coincideTexto = !termino || texto.includes(termino)
      const coincideEstado = !filtros.estadoLaboral || empleado.estadoLaboral === filtros.estadoLaboral
      const coincideCanal = !filtros.canal || empleado.canal === filtros.canal

      return coincideTexto && coincideEstado && coincideCanal
    })
  })

  const canales = computed(() => {
    const valores = new Set([...CANALES, ...empleados.value.map((empleado) => empleado.canal).filter(Boolean)])
    return [...valores].sort()
  })

  async function cargar() {
    cargando.value = true
    error.value = ''
    try {
      empleados.value = await empleadosService.getEmpleados({ limit: 5000 })
    } catch (err) {
      error.value = err.userMessage || 'No se pudo cargar el directorio de empleados.'
    } finally {
      cargando.value = false
    }
  }

  async function actualizarEstado(id, estadoLaboral) {
    guardando.value = true
    error.value = ''
    try {
      const resultado = await empleadosService.actualizar(id, { estadoLaboral })
      await cargar()
      return resultado
    } catch (err) {
      error.value = err.userMessage || 'No se pudo actualizar el estado del empleado.'
      return null
    } finally {
      guardando.value = false
    }
  }

  return {
    empleados,
    cargando,
    guardando,
    error,
    filtros,
    empleadosFiltrados,
    canales,
    cargar,
    actualizarEstado
  }
})
