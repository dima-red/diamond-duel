import { createRouter, createWebHistory } from 'vue-router'
import CreateGameView from '../views/CreateGameView.vue'
import GameView from '../views/GameView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'create-game',
      component: CreateGameView,
    },
    {
      path: '/game/:id',
      name: 'game',
      component: GameView,
    },
  ],
})

export default router
