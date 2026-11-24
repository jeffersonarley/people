<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="width: 520px; max-width: 94vw">
      <q-card-section class="row items-center q-gutter-sm border-bottom">
        <q-icon :name="icon" color="primary" size="26px" />
        <div class="text-h6">{{ titulo }}</div>
        <q-space />
        <q-btn v-close-popup flat round dense icon="close" />
      </q-card-section>

      <q-card-section>
        <q-banner v-if="linea" rounded class="bg-blue-1 text-primary q-mb-lg">
          <div class="text-weight-bold">Línea {{ linea.movil }} · {{ linea.operador }}</div>
          <div class="text-caption">
            {{ linea.canalAsignado }} · Estado: {{ linea.estadoLinea }}
            <span v-if="linea.empleadoAsignado">
              · Actual: {{ linea.empleadoAsignado.nombresApellidos }}
            </span>
          </div>
        </q-banner>

        <template v-if="esAsignacion">
          <q-select
            v-model="form.empleadoId"
            :options="opcionesEmpleados"
            option-value="_id"
            option-label="nombresApellidos"
            emit-value
            map-options
            outlined
            use-input
            input-debounce="250"
            label="Empleado activo"
            @filter="filtrarEmpleados"
          >
            <template #prepend><q-icon name="person" /></template>
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.nombresApellidos }}</q-item-label>
                  <q-item-label caption>
                    {{ scope.opt.tipoDocumento }} {{ scope.opt.documento }} · {{ scope.opt.canal }} · {{ scope.opt.cargo }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template #no-option>
              <q-item>
                <q-item-section class="text-muted">No hay empleados activos que coincidan.</q-item-section>
              </q-item>
            </template>
          </q-select>
        </template>

        <p v-else class="text-body2 text-muted q-mt-none">
          {{ modo === 'liberar'
            ? 'La línea quedará DISPONIBLE y se desvinculará del empleado actual.'
            : 'La línea quedará en estado POR_CANCELAR y no podrá asignarse.' }}
        </p>

        <q-input
          v-model="form.observacion"
          outlined
          type="textarea"
          autogrow
          label="Observación (opcional)"
          maxlength="500"
          counter
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md border-top">
        <q-btn v-close-popup flat label="Cancelar" color="grey-7" />
        <q-btn
          unelevated
          :label="textoBoton"
          :color="modo === 'liberar' ? 'warning' : modo === 'cancelar' ? 'negative' : 'primary'"
          :loading="guardando"
          type="button"
          @click="confirmar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useEmpleadosStore } from '@/stores/empleados'

const props = defineProps({
  modelValue: Boolean,
  modo: { type: String, default: 'asignar' },
  linea: { type: Object, default: null },
  guardando: Boolean
})
const emit = defineEmits(['update:modelValue', 'confirmar'])
const $q = useQuasar()
const empleadosStore = useEmpleadosStore()

const form = reactive({ empleadoId: null, observacion: '' })
const opcionesEmpleados = ref([])

const esAsignacion = computed(() => props.modo === 'asignar' || props.modo === 'reasignar')

const empleadosActivos = computed(() =>
  empleadosStore.empleados.filter((empleado) => empleado.estadoLaboral === 'ACTIVO')
)

const titulo = computed(() => ({
  asignar: 'Asignar línea',
  reasignar: 'Reasignar línea',
  liberar: 'Liberar línea',
  cancelar: 'Marcar para cancelar'
}[props.modo] || 'Gestionar línea'))

const icon = computed(() => ({
  asignar: 'assignment_ind',
  reasignar: 'swap_horiz',
  liberar: 'lock_open',
  cancelar: 'cancel'
}[props.modo] || 'phonelink_ring'))

const textoBoton = computed(() => ({
  asignar: 'Asignar',
  reasignar: 'Reasignar',
  liberar: 'Liberar',
  cancelar: 'Marcar para cancelar'
}[props.modo] || 'Confirmar'))

watch(() => props.modelValue, (visible) => {
  if (!visible) return
  form.empleadoId = null
  form.observacion = ''
  opcionesEmpleados.value = empleadosActivos.value
})

function filtrarEmpleados(valor, update) {
  update(() => {
    const termino = valor.toLowerCase()
    opcionesEmpleados.value = empleadosActivos.value.filter((empleado) =>
      `${empleado.nombresApellidos} ${empleado.documento} ${empleado.cargo} ${empleado.canal}`
        .toLowerCase()
        .includes(termino)
    )
  })
}

function confirmar() {
  if (esAsignacion.value && !form.empleadoId) {
    $q.notify({ type: 'warning', message: 'Seleccione un empleado activo.' })
    return
  }

  const payload = esAsignacion.value
    ? { empleadoId: form.empleadoId, observacion: form.observacion.trim() }
    : { observacion: form.observacion.trim() }

  emit('confirmar', payload)
}
</script>
