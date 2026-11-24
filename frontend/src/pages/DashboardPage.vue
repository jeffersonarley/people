<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Dashboard de líneas</h1>
        <p class="page-subtitle">Indicadores y alertas de líneas corporativas por canal</p>
      </div>
      <q-select
        v-model="canal"
        :options="opcionesCanal"
        emit-value
        map-options
        dense
        outlined
        options-dense
        label="Canal"
        style="min-width: 240px"
        @update:model-value="cambiarCanal"
      >
        <template #prepend><q-icon name="filter_alt" /></template>
      </q-select>
    </header>

    <ErrorState v-if="store.error" :mensaje="store.error" @retry="store.cargar" />

    <template v-if="store.cargando && !store.resumen">
      <LoadingState mensaje="Cargando indicadores..." />
    </template>

    <template v-else>
      <q-banner
        v-if="alertaCritica > 0"
        rounded
        class="bg-red-1 text-negative q-mb-lg alert-banner"
      >
        <template #avatar>
          <q-icon name="warning_amber" size="32px" />
        </template>
        <div class="text-weight-bold">Alerta crítica: {{ alertaCritica }} línea(s) asignada(s) a personal RETIRADO</div>
        <div class="text-caption">Requiere liberación o reasignación inmediata para evitar consumos y cobros indebidos.</div>
      </q-banner>

      <div class="row q-col-gutter-lg">
        <div v-for="kpi in store.kpis" :key="kpi.label" class="col-12 col-sm-6 col-lg-4">
          <KpiCard v-bind="kpi" />
        </div>
      </div>

      <q-card class="surface-card table-card q-mt-lg">
        <div class="row items-center justify-between q-px-lg q-py-md border-bottom">
          <div>
            <div class="text-h6 text-weight-bold text-dark">Alertas de novedades</div>
            <div class="text-caption text-muted">Líneas de personal retirado y líneas pendientes por cancelar</div>
          </div>
          <q-btn
            flat
            dense
            color="primary"
            icon="refresh"
            label="Actualizar"
            :loading="store.cargando"
            @click="store.cargar"
          />
        </div>

        <q-table
          flat
          :rows="store.alertas"
          :columns="columnas"
          row-key="movil"
          :loading="store.cargando"
          :pagination="{ rowsPerPage: 0 }"
          no-data-label="No hay alertas ni novedades para el canal seleccionado"
        >
          <template #body-cell-tipo="props">
            <q-td :props="props">
              <q-badge :color="colorTipo(props.row.tipo)" :label="etiquetaTipo(props.row.tipo)" />
            </q-td>
          </template>
          <template #body-cell-mensaje="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.mensaje }}</div>
              <div v-if="props.row.detalle" class="text-caption text-muted">{{ props.row.detalle }}</div>
            </q-td>
          </template>
          <template #body-cell-fecha="props">
            <q-td :props="props">{{ formatearFecha(props.row.fecha) }}</q-td>
          </template>
          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-badge
                outline
                :color="props.row.estado === 'CRITICA' ? 'negative' : 'warning'"
                :label="props.row.estado"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useCanalesStore } from '@/stores/canales'
import KpiCard from '@/components/KpiCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

const store = useDashboardStore()
const canalesStore = useCanalesStore()
const canal = ref(store.canalSeleccionado)

const alertaCritica = computed(() => store.resumen?.alertaCritica?.cantidad || 0)

const opcionesCanal = computed(() => [
  { label: 'Todos los canales', value: '' },
  ...canalesStore.canales.map((item) => ({ label: item, value: item }))
])

const columnas = [
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' },
  { name: 'mensaje', label: 'Descripción', field: 'mensaje', align: 'left' },
  { name: 'canal', label: 'Canal', field: 'canal', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'estado', label: 'Prioridad', field: 'estado', align: 'left' }
]

function colorTipo(tipo = '') {
  return tipo === 'RETIRADO_CON_LINEA' ? 'negative' : 'warning'
}

function etiquetaTipo(tipo = '') {
  return tipo === 'RETIRADO_CON_LINEA' ? 'RETIRADO CON LÍNEA' : 'POR CANCELAR'
}

function formatearFecha(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime())
    ? String(valor)
    : fecha.toLocaleDateString('es-CO', { dateStyle: 'medium' })
}

async function cambiarCanal(valor) {
  await store.seleccionarCanal(valor)
}

onMounted(async () => {
  await Promise.all([store.cargar(), canalesStore.cargarCanales()])
})
</script>

<style scoped>
.alert-banner {
  border: 1px solid #f3c2c6;
}
</style>
