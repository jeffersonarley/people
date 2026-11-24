<template>
  <q-card class="surface-card kpi-card" :class="`text-${color}`">
    <div class="kpi-icon" :style="{ backgroundColor: `${colorHex}18`, color: colorHex }">
      <q-icon :name="icon" />
    </div>
    <div class="kpi-value">{{ value }}</div>
    <div class="kpi-label">{{ label }}</div>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: 0 },
  icon: { type: String, default: 'insights' },
  color: { type: String, default: 'primary' }
})

const colorHex = computed(() => ({
  primary: '#235789',
  positive: '#2e9b63',
  accent: '#12a4a8',
  info: '#3478bd',
  warning: '#e59b2f',
  negative: '#d64550'
}[props.color] || '#235789'))
</script>
