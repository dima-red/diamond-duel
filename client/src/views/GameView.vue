<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { io } from 'socket.io-client'
import { getApiBase } from '@/api/game'
import type { PublicGameState, PublicCell } from '@/types/game'

const route = useRoute()
const router = useRouter()
const gameId = computed(() => route.params.id as string)
const nickname = computed(() => (route.query.nickname as string) ?? '')

const state = ref<PublicGameState | null>(null)
const socketError = ref('')
const myPlayerId = ref<string | null>(null)
const copyFeedback = ref('')
const nameInput = ref('')
const nameInputError = ref('')
let socket: ReturnType<typeof io> | null = null

const COPY_FEEDBACK_MS = 2000
const needsNameInput = computed(() => !nickname.value && !state.value)

// Ссылка для приглашения второго игрока — без nickname, чтобы у второго было своё имя (Игрок 2)
const shareableGameLink = computed(() => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/game/${gameId.value}`
})

async function copyGameLink() {
  try {
    await navigator.clipboard.writeText(shareableGameLink.value)
    copyFeedback.value = 'Скопировано'
    setTimeout(() => { copyFeedback.value = '' }, COPY_FEEDBACK_MS)
  } catch {
    copyFeedback.value = 'Не удалось скопировать'
  }
}

const sortedCells = computed(() => {
  const s = state.value
  if (!s) return []
  return [...s.cells].sort((a, b) => s.size * (a.y - b.y) + (a.x - b.x))
})

const isMyTurn = computed(
  () =>
    state.value?.status === 'in_progress' &&
    state.value.currentPlayerId === myPlayerId.value,
)

const canReveal = (cell: PublicCell) =>
  state.value?.status === 'in_progress' &&
  cell.state === 'hidden' &&
  state.value.currentPlayerId === myPlayerId.value

function reveal(x: number, y: number) {
  if (!state.value) return
  const cell = state.value.cells.find((c) => c.x === x && c.y === y)
  if (!cell || !canReveal(cell)) return
  socket?.emit('reveal_cell', { gameId: gameId.value, x, y })
}

function connectWithNickname(nick: string) {
  if (socket) return
  const base = getApiBase()
  socket = io(base, { transports: ['websocket', 'polling'] })

  socket.on('connect', () => {
    myPlayerId.value = socket?.id ?? null
    socket?.emit('join_game', {
      gameId: gameId.value,
      nickname: nick.trim() || undefined,
    })
  })

  socket.on('game_state', (payload: PublicGameState) => {
    state.value = payload
    socketError.value = ''
  })

  socket.on('error', (payload: { message?: string }) => {
    socketError.value = payload?.message ?? 'Ошибка'
  })
}

function submitName() {
  const name = nameInput.value.trim()
  nameInputError.value = ''
  if (!name) {
    nameInputError.value = 'Введите имя'
    return
  }
  router.replace({
    name: 'game',
    params: { id: gameId.value },
    query: { nickname: name },
  })
}

watch(
  () => nickname.value,
  (nick) => {
    if (nick && !socket) connectWithNickname(nick)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  socket?.disconnect()
  socket = null
})
</script>

<template>
  <main class="game-view">
    <template v-if="needsNameInput">
      <div class="name-form-block">
        <h2>Введите ваше имя</h2>
        <form @submit.prevent="submitName" class="name-form">
          <input
            v-model.trim="nameInput"
            type="text"
            placeholder="Имя игрока"
            class="name-input"
            aria-label="Ваше имя"
          />
          <button type="submit" class="name-submit">Войти в игру</button>
        </form>
        <p v-if="nameInputError" class="error">{{ nameInputError }}</p>
      </div>
    </template>

    <template v-else-if="!state">
      <p class="status">Подключение к игре…</p>
      <p v-if="socketError" class="error">{{ socketError }}</p>
    </template>

    <template v-else>
      <header class="game-header">
        <p class="game-info">
          Поле {{ state.size }}×{{ state.size }}, алмазов: {{ state.diamondsCount }}
        </p>
        <div
          v-if="state.status === 'waiting_for_players'"
          class="invite-block"
        >
          <p class="turn">Ожидание второго игрока</p>
          <p class="invite-hint">Отправьте ссылку второму игроку:</p>
          <div class="invite-actions">
            <input
              :value="shareableGameLink"
              type="text"
              readonly
              class="invite-input"
              aria-label="Ссылка на игру"
            />
            <button
              type="button"
              class="invite-copy"
              @click="copyGameLink"
            >
              {{ copyFeedback || 'Копировать ссылку' }}
            </button>
          </div>
        </div>
        <p v-else-if="state.status === 'in_progress'" class="turn">
          {{ isMyTurn ? 'Ваш ход' : 'Ход соперника' }}
        </p>
        <p v-else class="turn">Игра завершена</p>

        <div class="scores">
          <span
            v-for="(player, i) in state.players"
            :key="player.id"
            :class="{ 'is-me': player.id === myPlayerId }"
          >
            {{ player.name || `Игрок ${i + 1}` }}: {{ player.score }}
          </span>
        </div>
      </header>

      <p v-if="socketError" class="error">{{ socketError }}</p>

      <div
        class="grid"
        :style="{ gridTemplateColumns: `repeat(${state.size}, 1fr)` }"
      >
        <button
          v-for="cell in sortedCells"
          :key="`${cell.y}-${cell.x}`"
          type="button"
          class="cell"
          :class="{
            hidden: cell.state === 'hidden',
            revealed: cell.state === 'revealed',
            diamond: cell.type === 'diamond',
            clickable: canReveal(cell),
          }"
          :disabled="!canReveal(cell)"
          @click="reveal(cell.x, cell.y)"
        >
          <template v-if="cell.state === 'hidden'">?</template>
          <template v-else-if="cell.type === 'diamond'">♦</template>
          <template v-else>{{ cell.adjacentDiamonds ?? 0 }}</template>
        </button>
      </div>

      <div v-if="state.status === 'finished'" class="result">
        <template v-if="state.players[0] && state.players[1]">
          <p v-if="state.players[0].score > state.players[1].score">
            Победил {{ state.players[0].name || 'Игрок 1' }}
          </p>
          <p v-else-if="state.players[1].score > state.players[0].score">
            Победил {{ state.players[1].name || 'Игрок 2' }}
          </p>
          <p v-else>Ничья</p>
        </template>
      </div>
    </template>
  </main>
</template>

<style scoped>
.game-view {
  padding: 1rem;
  max-width: 500px;
  margin: 0 auto;
}
.status {
  text-align: center;
  margin-top: 2rem;
}
.game-header {
  margin-bottom: 1rem;
}
.game-info {
  font-size: 0.9rem;
  color: var(--color-text);
}
.turn {
  font-weight: 600;
  margin: 0.5rem 0;
}
.invite-block {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
.invite-hint {
  font-size: 0.9rem;
  margin: 0.5rem 0;
  color: var(--color-text);
}
.invite-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.invite-input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  font-size: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
}
.invite-copy {
  padding: 0.5rem 0.75rem;
  white-space: nowrap;
  cursor: pointer;
}
.scores {
  display: flex;
  gap: 1rem;
  font-size: 0.95rem;
}
.scores .is-me {
  font-weight: 600;
}
.error {
  color: #c00;
  margin: 0.5rem 0;
}
.grid {
  display: grid;
  gap: 4px;
  aspect-ratio: 1;
  max-width: 360px;
  margin: 0 auto 1rem;
  padding: 8px;
  background: var(--color-grid-bg);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
.cell {
  min-height: 44px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1.25rem;
  background: var(--color-cell-revealed);
  color: var(--color-text);
  cursor: default;
}
.cell.hidden {
  background: var(--color-cell-hidden);
}
.cell.clickable {
  cursor: pointer;
}
.cell.clickable:hover {
  background: var(--color-cell-hover);
}
.cell.diamond {
  background: #f0c040;
  color: #1a1a1a;
  font-weight: 600;
}
.cell:disabled {
  cursor: default;
}
.result {
  text-align: center;
  font-weight: 600;
  margin-top: 1rem;
}

.name-form-block {
  max-width: 320px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
.name-form-block h2 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-heading);
}
.name-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.name-input {
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}
.name-submit {
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
