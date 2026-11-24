<template>
  <div class="text-center q-py-xl">
    <q-icon :name="icon" size="64px" color="grey-5" />
    <div class="text-h6 text-grey-7 q-mt-md">{{ titulo }}</div>
    <div v-if="mensaje" class="text-body2 text-grey-6 q-mt-sm">{{ mensaje }}</div>
    <q-btn
      v-if="accion"
      class="q-mt-lg"
      color="primary"
      unelevated
      :label="accion"
      @click="$emit('action')"
    />
  </div>
</template>

<script setup>
defineProps({
  titulo: { type: String, default: 'No hay información para mostrar' },
  mensaje: { type: String, default: '' },
  icon: { type: String, default: 'inbox' },
  accion: { type: String, default: '' }
})
defineEmits(['action'])
</script>
