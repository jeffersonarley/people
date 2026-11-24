<template>
  <div class="flex flex-center q-py-xl text-muted">
    <q-spinner-dots size="42px" color="primary" />
    <span class="q-ml-md">{{ mensaje }}</span>
  </div>
</template>

<script setup>
defineProps({
  mensaje: { type: String, default: 'Cargando información...' }
})
</script>
