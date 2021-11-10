import Vue from 'vue'
import App from './App.vue'
import VGraphin from "../src/index";
Vue.use(VGraphin);
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
