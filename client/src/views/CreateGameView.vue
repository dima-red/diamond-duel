<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createGame } from '@/api/game'

const router = useRouter()
const size = ref(4)
const diamondsCount = ref(5)
const nickname = ref('')
const existingGameId = ref('')
const error = ref('')
const loading = ref(false)

const SIZE_OPTIONS = [2, 3, 4, 5, 6]

function isValidDiamonds(): boolean {
  const total = size.value * size.value
  return (
    diamondsCount.value >= 1 &&
    diamondsCount.value <= total &&
    diamondsCount.value % 2 === 1
  )
}

async function handleCreate() {
  error.value = ''
  if (!isValidDiamonds()) {
    error.value = 'Количество алмазов должно быть нечётным и не больше размера поля².'
    return
  }
  loading.value = true
  try {
    const data = await createGame({
      size: size.value,
      diamondsCount: diamondsCount.value,
    })
    router.push({
      name: 'game',
      params: { id: data.id },
      query: nickname.value ? { nickname: nickname.value } : {},
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось создать игру'
  } finally {
    loading.value = false
  }
}

function handleJoin() {
  const id = existingGameId.value.trim()
  if (!id) {
    error.value = 'Введите ID игры'
    return
  }
  error.value = ''
  router.push({
    name: 'game',
    params: { id },
    query: nickname.value ? { nickname: nickname.value } : {},
  })
}
</script>

<template>
  <main class="create-game">
    <h1>Diamond Duel</h1>

    <section class="form-section">
      <h2>Создать игру</h2>
      <form @submit.prevent="handleCreate" class="form">
        <label>
          Размер поля (N×N)
          <select v-model.number="size">
            <option v-for="n in SIZE_OPTIONS" :key="n" :value="n">
              {{ n }}×{{ n }}
            </option>
          </select>
        </label>
        <label>
          Количество алмазов (M, нечётное)
          <input
            v-model.number="diamondsCount"
            type="number"
            min="1"
            :max="size * size"
            step="2"
          />
        </label>
        <label>
          Ваше имя (по желанию)
          <input v-model.trim="nickname" type="text" placeholder="Игрок" />
        </label>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Создание…' : 'Создать игру' }}
        </button>
      </form>
    </section>

    <section class="form-section">
      <h2>Подключиться к игре</h2>
      <form @submit.prevent="handleJoin" class="form">
        <label>
          ID игры
          <input v-model.trim="existingGameId" type="text" placeholder="UUID игры" />
        </label>
        <button type="submit">Войти в игру</button>
      </form>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
  </main>
</template>

<style scoped>
.create-game {
  max-width: 400px;
  margin: 0 auto;
  padding: 1.5rem;
}
.create-game h1 {
  margin-bottom: 1.5rem;
  text-align: center;
}
.form-section {
  margin-bottom: 2rem;
}
.form-section h2 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--color-heading);
}
.form label {
  display: block;
  margin-bottom: 0.75rem;
}
.form label select,
.form label input {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.5rem;
  box-sizing: border-box;
}
.form button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.error {
  color: #c00;
  margin-top: 1rem;
}
</style>
