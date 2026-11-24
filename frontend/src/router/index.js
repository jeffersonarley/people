import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import LineasPage from '@/pages/LineasPage.vue'
import EmpleadosPage from '@/pages/EmpleadosPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', name: 'dashboard', component: DashboardPage, meta: { title: 'Dashboard' } },
        { path: 'lineas', name: 'lineas', component: LineasPage, meta: { title: 'Gestión de Líneas' } },
        { path: 'empleados', name: 'empleados', component: EmpleadosPage, meta: { title: 'Directorio de Empleados' } },
        { path: ':pathMatch(.*)*', redirect: '/' }
      ]
    }
  ]
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'Control de Líneas'} | Control de Líneas`
})

export default router
