<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import type { Theme } from '@/composables/useTheme'

const route = useRoute()
const { theme } = useTheme()

const showNewGameLink = () => route.name !== 'create-game'

const options: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
  { value: 'system', label: 'Как в системе' },
]
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <RouterLink
        v-if="showNewGameLink()"
        :to="{ name: 'create-game' }"
        class="nav-link"
      >
        Новая игра
      </RouterLink>
      <template v-else>
        <span aria-hidden="true"></span>
      </template>
      <nav class="theme-nav" aria-label="Тема оформления">
        <label for="theme-select" class="theme-label">Тема:</label>
        <select id="theme-select" v-model="theme" class="theme-select">
          <option v-for="opt in options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </nav>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
.app-layout {
  position: relative;
  min-height: 100vh;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
}
.nav-link {
  font-size: 0.9rem;
  color: var(--color-heading);
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s, border-color 0.2s;
}
.nav-link:hover {
  background: var(--color-border-hover);
  border-color: var(--color-border-hover);
  text-decoration: none;
}
.nav-link.router-link-active {
  background: var(--color-background-mute);
  border-color: var(--color-border);
  color: var(--color-heading);
}
.theme-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.theme-label {
  font-size: 0.9rem;
  color: var(--color-text);
}
.theme-select {
  padding: 0.35rem 0.5rem;
  font-size: 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}
</style>
