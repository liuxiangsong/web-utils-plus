import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router';
import store from './store';
import BaseDirective from './directives';

const app = createApp(App);
app.use(ElementPlus);
app.use(BaseDirective);

app.use(store).use(router)
  .mount('#app');
