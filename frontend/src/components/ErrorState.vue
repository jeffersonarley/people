<template>
  <q-banner rounded class="bg-negative text-white q-mb-lg">
    <template #avatar>
      <q-icon name="error_outline" size="28px" />
    </template>
    {{ mensaje }}
    <template #action>
      <q-btn flat label="Reintentar" @click="$emit('retry')" />
    </template>
  </q-banner>
</template>

<script setup>
defineProps({
  mensaje: { type: String, default: 'Ocurrió un error inesperado.' }
})
defineEmits(['retry'])
</script>
