import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/Home/HomeView.vue';
import UploadView from '../views/Upload/UploadView.vue';
import AnalysisView from '../views/Analysis/AnalysisView.vue';
import ReportView from '../views/Report/ReportView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/upload', component: UploadView },
    { path: '/analysis/:taskId', component: AnalysisView },
    { path: '/report/:taskId', component: ReportView },
  ],
});

export default router;
