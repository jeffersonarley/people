<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Gestión de Líneas</h1>
        <p class="page-subtitle">Asigna, reasigna, libera y controla el estado de cada línea corporativa</p>
      </div>
      <q-btn
        color="primary"
        unelevated
        icon="refresh"
        label="Actualizar"
        :loading="store.cargando"
        @click="cargar"
      />
    </header>

    <q-card class="surface-card filter-panel">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-4">
          <q-input
            v-model="store.filtros.busqueda"
            outlined
            dense
            clearable
            label="Buscar por móvil, cédula, nombre o cust code"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-select v-model="store.filtros.canal" :options="store.canales" outlined dense clearable label="Canal" />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-select v-model="store.filtros.operador" :options="store.operadores" outlined dense clearable label="Operador" />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-select v-model="store.filtros.estado" :options="estados" outlined dense clearable label="Estado" />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-btn
            flat
            color="grey-7"
            icon="filter_alt_off"
            label="Limpiar"
            class="full-width"
            :disable="!filtrosActivos"
            @click="limpiarFiltros"
          />
        </div>
      </div>
    </q-card>

    <ErrorState v-if="store.error" :mensaje="store.error" @retry="cargar" />

    <q-card class="surface-card table-card">
      <div class="row items-center justify-between q-px-lg q-py-md border-bottom">
        <div class="text-subtitle1 text-weight-bold text-dark">
          {{ store.lineasFiltradas.length }} {{ store.lineasFiltradas.length === 1 ? 'línea' : 'líneas' }}
        </div>
        <q-chip v-if="filtrosActivos" dense color="blue-1" text-color="primary" icon="filter_alt">
          Filtros aplicados
        </q-chip>
      </div>

      <div v-if="store.cargando && !store.lineas.length" class="q-pa-lg">
        <LoadingState mensaje="Cargando líneas..." />
      </div>
      <EmptyState
        v-else-if="!store.lineasFiltradas.length"
        titulo="No se encontraron líneas"
        mensaje="Ajuste los filtros para consultar las líneas cargadas desde el Excel."
        icon="phonelink_off"
      />
      <q-table
        v-else
        flat
        :rows="store.lineasFiltradas"
        :columns="columnas"
        row-key="_id"
        :pagination="{ rowsPerPage: 0 }"
        :loading="store.cargando"
      >
        <template #body-cell-movil="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-icon name="smartphone" color="primary" class="q-mr-sm" />
              <div>
                <div class="text-weight-bold text-primary">{{ props.row.movil }}</div>
                <div class="text-caption text-muted">{{ props.row.custCode || 'Sin cust code' }}</div>
              </div>
            </div>
          </q-td>
        </template>
        <template #body-cell-canalAsignado="props">
          <q-td :props="props">
            <q-badge outline color="primary" :label="props.row.canalAsignado" />
          </q-td>
        </template>
        <template #body-cell-empleadoAsignado="props">
          <q-td :props="props">
            <template v-if="props.row.empleadoAsignado">
              <div class="row items-center no-wrap">
                <div>
                  <div class="text-weight-medium">{{ props.row.empleadoAsignado.nombresApellidos }}</div>
                  <div class="text-caption text-muted">
                    {{ props.row.empleadoAsignado.tipoDocumento }} {{ props.row.empleadoAsignado.documento }}
                  </div>
                </div>
                <q-chip
                  v-if="props.row.empleadoAsignado.estadoLaboral === 'RETIRADO'"
                  dense
                  square
                  color="negative"
                  text-color="white"
                  icon="warning"
                  class="q-ml-sm"
                >
                  RETIRADO
                </q-chip>
              </div>
            </template>
            <span v-else class="text-muted">Sin asignar</span>
          </q-td>
        </template>
        <template #body-cell-estadoLinea="props">
          <q-td :props="props">
            <q-badge :color="colorEstado(props.row.estadoLinea)" :label="props.row.estadoLinea" rounded />
          </q-td>
        </template>
        <template #body-cell-ciclo="props">
          <q-td :props="props">
            <div>{{ props.row.ciclo || '—' }}</div>
            <div class="text-caption text-muted">{{ props.row.operador }}</div>
          </q-td>
        </template>
        <template #body-cell-acciones="props">
          <q-td :props="props" auto-width>
            <div class="row no-wrap q-gutter-xs">
              <q-btn
                v-if="puedeAsignar(props.row)"
                dense
                flat
                color="primary"
                icon="assignment_ind"
                @click="abrir('asignar', props.row)"
              >
                <q-tooltip>Asignar línea</q-tooltip>
              </q-btn>
              <q-btn
                v-if="puedeReasignar(props.row)"
                dense
                flat
                color="info"
                icon="swap_horiz"
                @click="abrir('reasignar', props.row)"
              >
                <q-tooltip>Reasignar línea</q-tooltip>
              </q-btn>
              <q-btn
                v-if="puedeLiberar(props.row)"
                dense
                flat
                color="warning"
                icon="lock_open"
                @click="abrir('liberar', props.row)"
              >
                <q-tooltip>Liberar línea</q-tooltip>
              </q-btn>
              <q-btn
                v-if="puedeCancelar(props.row)"
                dense
                flat
                color="negative"
                icon="cancel"
                @click="abrir('cancelar', props.row)"
              >
                <q-tooltip>Marcar para cancelar</q-tooltip>
              </q-btn>
              <q-btn dense flat color="grey-7" icon="history" @click="abrirHistorial(props.row)">
                <q-tooltip>Ver historial</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <LineaActionDialog
      v-model="dialogVisible"
      :modo="modo"
      :linea="lineaSeleccionada"
      :guardando="store.guardando"
      @confirmar="confirmarAccion"
    />
    <LineaHistoryDrawer v-model="historialVisible" :linea="lineaSeleccionada" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useLineasStore } from '@/stores/lineas'
import { useEmpleadosStore } from '@/stores/empleados'
import { ESTADOS_LINEA } from '@/constants'
import LineaActionDialog from '@/components/LineaActionDialog.vue'
import LineaHistoryDrawer from '@/components/LineaHistoryDrawer.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import EmptyState from '@/components/EmptyState.vue'

const $q = useQuasar()
const store = useLineasStore()
const empleadosStore = useEmpleadosStore()
const dialogVisible = ref(false)
const historialVisible = ref(false)
const modo = ref('asignar')
const lineaSeleccionada = ref(null)

const estados = ESTADOS_LINEA
const columnas = [
  { name: 'movil', label: 'Línea', field: 'movil', align: 'left', sortable: true },
  { name: 'canalAsignado', label: 'Canal', field: 'canalAsignado', align: 'left', sortable: true },
  { name: 'empleadoAsignado', label: 'Empleado asignado', field: 'empleadoAsignado', align: 'left' },
  { name: 'estadoLinea', label: 'Estado', field: 'estadoLinea', align: 'left', sortable: true },
  { name: 'ciclo', label: 'Ciclo / Operador', field: 'ciclo', align: 'left' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'left' }
]

const filtrosActivos = computed(() => Object.values(store.filtros).some(Boolean))

function colorEstado(estado = '') {
  return {
    ACTIVA: 'positive',
    DISPONIBLE: 'info',
    POR_CANCELAR: 'warning',
    CANCELADA: 'negative'
  }[estado] || 'grey-6'
}

function puedeAsignar(linea) {
  return !linea.empleadoAsignado && !['POR_CANCELAR', 'CANCELADA'].includes(linea.estadoLinea)
}

function puedeReasignar(linea) {
  return Boolean(linea.empleadoAsignado) && !['POR_CANCELAR', 'CANCELADA'].includes(linea.estadoLinea)
}

function puedeLiberar(linea) {
  return Boolean(linea.empleadoAsignado) && !['POR_CANCELAR', 'CANCELADA'].includes(linea.estadoLinea)
}

function puedeCancelar(linea) {
  return !['POR_CANCELAR', 'CANCELADA'].includes(linea.estadoLinea)
}

function abrir(tipo, linea) {
  modo.value = tipo
  lineaSeleccionada.value = linea
  dialogVisible.value = true
}

function abrirHistorial(linea) {
  lineaSeleccionada.value = linea
  historialVisible.value = true
}

function limpiarFiltros() {
  Object.assign(store.filtros, { busqueda: '', canal: '', operador: '', estado: '' })
}

async function confirmarAccion(payload) {
  const metodo = modo.value === 'liberar'
    ? 'liberar'
    : modo.value === 'cancelar'
      ? 'marcarCancelar'
      : 'asignar'

  const ok = await store.ejecutar(metodo, lineaSeleccionada.value._id, payload)
  if (ok) {
    dialogVisible.value = false
    $q.notify({ type: 'positive', message: mensajeExito(modo.value) })
  } else {
    $q.notify({ type: 'negative', message: store.error })
  }
}

function mensajeExito(accion) {
  return {
    asignar: 'Línea asignada correctamente.',
    reasignar: 'Línea reasignada correctamente.',
    liberar: 'Línea liberada correctamente.',
    cancelar: 'Línea marcada para cancelar.'
  }[accion] || 'Operación completada.'
}

async function cargar() {
  await Promise.all([store.cargar(), empleadosStore.cargar()])
}

onMounted(cargar)
</script>
