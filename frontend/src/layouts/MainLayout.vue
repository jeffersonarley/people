<template>
  <q-layout view="hHh LpR lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Abrir menú" @click="drawer = !drawer" />
        <q-toolbar-title class="row items-center q-gutter-sm">
          <q-icon name="phonelink_ring" size="25px" />
          <span class="text-weight-bold">Control de Líneas</span>
          <span class="text-caption text-blue-1 gt-sm">People &amp; Trade S.A.S.</span>
        </q-toolbar-title>
        <q-chip square color="white" text-color="primary" icon="person">
          Analista RR. HH.
        </q-chip>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :width="250" class="bg-white text-dark">
      <div class="column full-height">
        <div class="q-pa-lg text-center border-bottom">
          <q-avatar size="54px" color="primary" text-color="white" icon="support_agent" />
          <div class="text-subtitle1 text-weight-bold q-mt-sm">People &amp; Trade</div>
          <div class="text-caption text-grey-6">Gestión de líneas corporativas</div>
        </div>
        <q-list padding class="q-pt-md">
          <q-item
            v-for="item in menu"
            :key="item.to"
            v-ripple
            clickable
            :to="item.to"
            exact
            active-class="bg-blue-1 text-primary text-weight-bold"
            class="q-my-xs q-rounded-md"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </q-list>
        <q-space />
        <div class="q-pa-md text-caption text-grey-6 border-top">
          Piloto de control y trazabilidad
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-md q-pa-md-lg">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(true)
const menu = [
  { label: 'Dashboard', icon: 'dashboard', to: '/' },
  { label: 'Gestión de Líneas', icon: 'phonelink_ring', to: '/lineas' },
  { label: 'Directorio de Empleados', icon: 'groups', to: '/empleados' }
]
</script>
