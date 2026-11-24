<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Directorio de Empleados</h1>
        <p class="page-subtitle">Colaboradores, estado laboral y líneas corporativas vinculadas</p>
      </div>
      <q-btn
        color="primary"
        unelevated
        icon="refresh"
        label="Actualizar"
        :loading="store.cargando"
        @click="store.cargar"
      />
    </header>

    <q-card class="surface-card filter-panel">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-5">
          <q-input
            v-model="store.filtros.busqueda"
            outlined
            dense
            clearable
            label="Buscar por nombre, documento, cargo o móvil"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="store.filtros.estadoLaboral"
            :options="estados"
            outlined
            dense
            clearable
            label="Estado laboral"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-select v-model="store.filtros.canal" :options="store.canales" outlined dense clearable label="Canal" />
        </div>
        <div class="col-12 col-md-1">
          <q-btn flat dense color="grey-7" icon="filter_alt_off" @click="limpiarFiltros">
            <q-tooltip>Limpiar filtros</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card>

    <ErrorState v-if="store.error" :mensaje="store.error" @retry="store.cargar" />

    <q-card class="surface-card table-card">
      <div class="row items-center justify-between q-px-lg q-py-md border-bottom">
        <div class="text-subtitle1 text-weight-bold text-dark">
          {{ store.empleadosFiltrados.length }}
          {{ store.empleadosFiltrados.length === 1 ? 'empleado' : 'empleados' }}
        </div>
        <q-btn flat dense color="primary" icon="refresh" label="Actualizar" :loading="store.cargando" @click="store.cargar" />
      </div>

      <div v-if="store.cargando && !store.empleados.length" class="q-pa-lg">
        <LoadingState mensaje="Cargando empleados..." />
      </div>
      <EmptyState
        v-else-if="!store.empleadosFiltrados.length"
        titulo="No se encontraron empleados"
        mensaje="No hay registros que coincidan con los filtros seleccionados."
        icon="groups"
      />
      <q-table
        v-else
        flat
        :rows="store.empleadosFiltrados"
        :columns="columnas"
        row-key="_id"
        :pagination="{ rowsPerPage: 0 }"
        :loading="store.cargando"
      >
        <template #body-cell-nombresApellidos="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="34px" color="blue-1" text-color="primary" icon="person" />
              <div class="q-ml-sm">
                <div class="text-weight-medium">{{ props.row.nombresApellidos }}</div>
                <div class="text-caption text-muted">
                  {{ props.row.tipoDocumento }} {{ props.row.documento }}
                </div>
              </div>
            </div>
          </q-td>
        </template>
        <template #body-cell-canal="props">
          <q-td :props="props">
            <q-badge outline color="primary" :label="props.row.canal" />
          </q-td>
        </template>
        <template #body-cell-puntoVenta="props">
          <q-td :props="props">
            <div>{{ props.row.puntoVenta || '—' }}</div>
            <div class="text-caption text-muted">{{ props.row.ciudad || 'Sin ciudad' }}</div>
          </q-td>
        </template>
        <template #body-cell-cargo="props">
          <q-td :props="props">{{ props.row.cargo || '—' }}</q-td>
        </template>
        <template #body-cell-lineas="props">
          <q-td :props="props">
            <div v-if="props.row.lineas?.length" class="row q-gutter-xs">
              <q-chip
                v-for="linea in props.row.lineas"
                :key="linea._id"
                dense
                square
                color="blue-1"
                text-color="primary"
                icon="phonelink_ring"
              >
                {{ linea.movil }} · {{ linea.estadoLinea }}
              </q-chip>
            </div>
            <span v-else class="text-muted">Sin línea vinculada</span>
          </q-td>
        </template>
        <template #body-cell-estadoLaboral="props">
          <q-td :props="props">
            <q-select
              :model-value="props.row.estadoLaboral"
              :options="estados"
              dense
              outlined
              options-dense
              class="estado-select"
              @update:model-value="cambiarEstado(props.row, $event)"
            >
              <template #selected-item="scope">
                <q-badge
                  :color="scope.opt === 'ACTIVO' ? 'positive' : 'grey-7'"
                  :label="scope.opt"
                />
              </template>
            </q-select>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="advertenciaVisible">
      <q-card style="width: 480px; max-width: 92vw">
        <q-card-section class="row items-center q-gutter-sm text-warning q-pb-none">
          <q-icon name="warning" size="32px" />
          <div class="text-h6">Empleado con línea vinculada</div>
        </q-card-section>
        <q-card-section>
          <p class="text-body1 q-mb-md">
            <strong>{{ pendiente?.nombresApellidos }}</strong> tiene
            {{ pendiente?.lineas?.length || 0 }} línea(s) corporativa(s) asignada(s).
            Cambiar su estado a RETIRADO no libera las líneas automáticamente.
          </p>
          <q-banner rounded class="bg-orange-1 text-orange-9">
            <div v-for="linea in pendiente?.lineas || []" :key="linea._id">
              {{ linea.movil }} · {{ linea.operador }} · {{ linea.estadoLinea }}
            </div>
          </q-banner>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn v-close-popup flat label="Cancelar" color="grey-7" />
          <q-btn
            unelevated
            color="negative"
            label="Cambiar a RETIRADO"
            :loading="store.guardando"
            @click="confirmarRetirado"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useEmpleadosStore } from '@/stores/empleados'
import { ESTADOS_EMPLEADO } from '@/constants'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import EmptyState from '@/components/EmptyState.vue'

const $q = useQuasar()
const store = useEmpleadosStore()
const advertenciaVisible = ref(false)
const pendiente = ref(null)

const estados = ESTADOS_EMPLEADO
const columnas = [
  { name: 'nombresApellidos', label: 'Empleado', field: 'nombresApellidos', align: 'left', sortable: true },
  { name: 'canal', label: 'Canal', field: 'canal', align: 'left', sortable: true },
  { name: 'puntoVenta', label: 'Punto de venta', field: 'puntoVenta', align: 'left' },
  { name: 'cargo', label: 'Cargo', field: 'cargo', align: 'left' },
  { name: 'lineas', label: 'Líneas vinculadas', field: 'lineas', align: 'left' },
  { name: 'estadoLaboral', label: 'Estado', field: 'estadoLaboral', align: 'left', sortable: true }
]

function limpiarFiltros() {
  Object.assign(store.filtros, { busqueda: '', estadoLaboral: '', canal: '' })
}

async function cambiarEstado(empleado, estado) {
  if (estado === empleado.estadoLaboral) return

  if (estado === 'RETIRADO' && empleado.lineas?.length) {
    pendiente.value = empleado
    advertenciaVisible.value = true
    return
  }

  await guardarEstado(empleado, estado)
}

async function confirmarRetirado() {
  const resultado = await guardarEstado(pendiente.value, 'RETIRADO')
  if (resultado) advertenciaVisible.value = false
}

async function guardarEstado(empleado, estado) {
  const resultado = await store.actualizarEstado(empleado._id, estado)
  if (!resultado) {
    $q.notify({ type: 'negative', message: store.error })
    return null
  }

  $q.notify({ type: 'positive', message: 'Estado laboral actualizado correctamente.' })
  if (resultado.advertencia) {
    $q.notify({ type: 'warning', message: resultado.advertencia.mensaje })
  }
  return resultado
}

onMounted(store.cargar)
</script>

<style scoped>
.estado-select {
  min-width: 140px;
}
</style>
