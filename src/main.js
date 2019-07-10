import Vue from 'vue'
import './plugins/vuetify'

import App from './App.vue'
import VueRouter from 'vue-router'
import routes from './routes.js'
import axios from 'axios'
import config from './config/configs'

const instance = axios.create({
    baseURL: config.apiURL,
    headers:{
      "X-API-KEY":config.apiKey
    }
});


Vue.use(VueRouter);

const router = new VueRouter({
  routes,
})

Vue.config.productionTip = false
Vue.prototype.$axios = instance;

let app = new Vue({
  render: h => h(App),
  router
}).$mount('#app')
