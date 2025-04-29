import App from './App'
import config from './config/config.js'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  
  // 初始化API基础URL到全局存储
  uni.setStorageSync('API_BASE_URL', config.API_BASE_URL)
  
  return {
    app
  }
}
// #endif