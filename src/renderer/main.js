import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import AV from 'leancloud-storage'

import App from './App'
import router from './router'
import store from './store'

Vue.use(ElementUI)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

AV.init({
  appId: "K1Ek0nRD9Bu8BSLJdRB4T29s-gzGzoHsz",
  appKey: "o5s2JIDVwejfLOKGiu2sK8m0",
  serverURL: "https://www.zlihj.cn"
});
// AV.debug.enable();

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
