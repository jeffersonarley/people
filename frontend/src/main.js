import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './assets/app.scss'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Notify, Dialog },
  config: {
    brand: {
      primary: '#235789',
      secondary: '#5c7fa3',
      accent: '#12a4a8',
      dark: '#17324d',
      positive: '#2e9b63',
      negative: '#d64550',
      info: '#3478bd',
      warning: '#e59b2f'
    },
    notify: { position: 'top-right', timeout: 3500 }
  }
})

app.mount('#app')
