import { createRouter, createWebHistory } from "vue-router";

import MuseumSelectPage from "./pages/MuseumSelectPage.vue";
import VisitSelectPage from "./pages/VisitSelectPage.vue";
import NavigatorPage from "./pages/NavigatorPage.vue";
import ItemsPage from "./pages/ItemsPage.vue";

import SyncEntryPage from "./pages/SyncEntryPage.vue";
import SyncStudentPage from "./pages/SyncStudentPage.vue";
import SyncTeacherPage from "./pages/SyncTeacherPage.vue";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: MuseumSelectPage },

    { path: "/museums/:museumId/visits", component: VisitSelectPage },
    { path: "/museums/:museumId/items", component: ItemsPage },
    { path: "/museums/:museumId/visits/:visitId/navigator", component: NavigatorPage },

    { path: "/sync", component: SyncEntryPage },
    { path: "/sync/:code/student", component: SyncStudentPage },
    { path: "/sync/:code/teacher", component: SyncTeacherPage }
  ]
});