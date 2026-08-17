import { createRouter, createWebHashHistory } from 'vue-router'

// hash 模式：无需服务器路由回退，可部署到 GitHub Pages 等任意静态托管
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('@/views/LibraryView.vue')
    },
    {
      path: '/content/:id',
      name: 'content-detail',
      component: () => import('@/views/ContentDetailView.vue')
    },
    {
      path: '/timer',
      name: 'timer',
      component: () => import('@/views/TimerView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue')
    },
    {
      path: '/profile/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue')
    },
    {
      path: '/profile/history',
      name: 'history',
      component: () => import('@/views/HistoryView.vue')
    },
    {
      path: '/profile/records',
      name: 'records',
      component: () => import('@/views/RecordsView.vue')
    },
    {
      path: '/safety',
      name: 'safety',
      component: () => import('@/views/SafetyView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/disclaimer',
      name: 'disclaimer',
      component: () => import('@/views/DisclaimerView.vue')
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/PrivacyView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
