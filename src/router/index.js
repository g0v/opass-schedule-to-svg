import { createWebHashHistory, createRouter } from 'vue-router'

const routes = [
  { path: '/', component: () => import('~/views/index.vue') },
  { path: '/playground', component: () => import('~/views/playground.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
