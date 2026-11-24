<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="history-card">
      <q-card-section class="bg-primary text-white row items-center q-gutter-sm">
        <q-icon name="history" size="26px" />
        <div>
          <div class="text-h6">Historial de la línea</div>
          <div class="text-caption">
            {{ linea?.movil }} · {{ linea?.operador }} · {{ linea?.canalAsignado }}
          </div>
        </div>
        <q-space />
        <q-btn v-close-popup flat round dense icon="close" />
      </q-card-section>

      <q-card-section class="history-content">
        <div v-if="cargando" class="q-py-xl text-center">
          <q-spinner-dots color="primary" size="36px" />
          <div class="q-mt-md text-muted">Cargando historial...</div>
        </div>

        <q-banner v-else-if="error" rounded class="bg-negative text-white">
          {{ error }}
          <template #action>
            <q-btn flat label="Reintentar" @click="cargar" />
          </template>
        </q-banner>

        <div v-else-if="!movimientos.length" class="text-center q-py-xl">
          <q-icon name="history" size="58px" color="grey-5" />
          <div class="text-subtitle1 text-grey-7 q-mt-md">Sin movimientos registrados</div>
          <div class="text-caption text-muted">Las asignaciones y liberaciones aparecerán aquí.</div>
        </div>

        <q-timeline v-else color="primary" class="q-pt-sm">
          <q-timeline-entry
            v-for="movimiento in movimientos"
            :key="movimiento._id"
            :icon="iconoMovimiento(movimiento.tipoMovimiento)"
            :color="colorMovimiento(movimiento.tipoMovimiento)"
            :title="tituloMovimiento(movimiento.tipoMovimiento)"
            :subtitle="formatearFecha(movimiento.fechaMovimiento)"
          >
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="q-py-sm">
                <div class="text-body2">{{ detalleMovimiento(movimiento) }}</div>
                <div v-if="movimiento.observacion" class="text-caption text-muted q-mt-xs">
                  {{ movimiento.observacion }}
                </div>
              </q-card-section>
            </q-card>
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { lineasService } from '@/services/lineasService'

const props = defineProps({
  modelValue: Boolean,
  linea: { type: Object, default: null }
})
defineEmits(['update:modelValue'])

const movimientos = ref([])
const cargando = ref(false)
const error = ref('')

async function cargar() {
  if (!props.linea?._id) return
  cargando.value = true
  error.value = ''
  try {
    const data = await lineasService.getHistorial(props.linea._id)
    movimientos.value = data?.movimientos || []
  } catch (err) {
    error.value = err.userMessage || 'No se pudo cargar el historial.'
  } finally {
    cargando.value = false
  }
}

watch(() => props.modelValue, (visible) => {
  if (visible) {
    movimientos.value = []
    cargar()
  }
})

function iconoMovimiento(tipo) {
  return {
    ASIGNACION: 'assignment_ind',
    REASIGNACION: 'swap_horiz',
    DEVOLUCION: 'lock_open',
    MARCADA_CANCELAR: 'cancel'
  }[tipo] || 'history'
}

function colorMovimiento(tipo) {
  return {
    ASIGNACION: 'positive',
    REASIGNACION: 'info',
    DEVOLUCION: 'warning',
    MARCADA_CANCELAR: 'negative'
  }[tipo] || 'primary'
}

function tituloMovimiento(tipo) {
  return {
    ASIGNACION: 'Asignación',
    REASIGNACION: 'Reasignación',
    DEVOLUCION: 'Devolución / liberación',
    MARCADA_CANCELAR: 'Marcada para cancelar'
  }[tipo] || tipo
}

function nombreEmpleado(empleado) {
  if (!empleado) return 'Sin empleado'
  return `${empleado.nombresApellidos} (${empleado.documento})`
}

function detalleMovimiento(movimiento) {
  if (movimiento.tipoMovimiento === 'ASIGNACION') {
    return `Asignada a ${nombreEmpleado(movimiento.empleadoNuevo)}.`
  }
  if (movimiento.tipoMovimiento === 'REASIGNACION') {
    return `De ${nombreEmpleado(movimiento.empleadoAnterior)} a ${nombreEmpleado(movimiento.empleadoNuevo)}.`
  }
  if (movimiento.tipoMovimiento === 'DEVOLUCION') {
    return `Liberada por ${nombreEmpleado(movimiento.empleadoAnterior)}.`
  }
  if (movimiento.tipoMovimiento === 'MARCADA_CANCELAR') {
    return movimiento.empleadoAnterior
      ? `Línea marcada para cancelar. Último empleado: ${nombreEmpleado(movimiento.empleadoAnterior)}.`
      : 'Línea marcada para cancelar.'
  }
  return movimiento.tipoMovimiento
}

function formatearFecha(valor) {
  if (!valor) return 'Fecha no disponible'
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime())
    ? String(valor)
    : fecha.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<style scoped>
.history-card {
  width: 680px;
  max-width: 95vw;
}

.history-content {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
