import { createApp } from "vue";
import "./styles.css";
import App from "./App.vue";
import infinityScroll from 'vue-infinite-scroll';

createApp(App).mount("#app");
// createApp(App).use(infinityScroll).mount("#app");