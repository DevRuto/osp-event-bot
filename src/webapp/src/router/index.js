import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/participants',
      name: 'participants',
      component: () => import('../views/ParticipantsView.vue'),
    },
    {
      path: '/submit',
      name: 'submit',
      component: () => import('../views/SubmissionView.vue'),
    },
    {
      path: '/teams',
      name: 'teams',
      component: () => import('../views/TeamLeaderboardView.vue'),
    },
  ],
})

export default router
