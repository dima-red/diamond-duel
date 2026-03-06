# Diamond Duel

Real-time two-player game: take turns revealing cells on an N×N board. Some cells hide diamonds; others show how many diamonds are nearby. Revealing a diamond scores a point and grants an extra turn. The player with more diamonds when all are found wins.

---

## English

### Rules

- Board size N×N (N from 2 to 6) with M diamonds (M odd, M ≤ N²).
- Players take turns. On your turn you may reveal one hidden cell.
- A revealed cell shows either a diamond (♦) or the count of adjacent diamonds (0–8).
- A diamond gives +1 point and an **extra turn** for the same player.
- The game ends when all diamonds are found. The player with the higher score wins (tie if equal).

### Tech stack

- **Backend:** NestJS, TypeScript, Socket.IO (WebSocket + polling).
- **Frontend:** Vue 3, TypeScript, Vite, Vue Router, Socket.IO Client.

### Repository structure

- `client/` — Vue 3 SPA (create game, join via link, game screen, theme switcher).
- `server/` — NestJS API: HTTP for creating games, WebSocket for joining and moves.

### Run locally

Node.js required (^20.19.0 or >=22.12.0 for client; see `client/package.json`).

```bash
# Install dependencies (root + workspaces)
npm install

# Run server and client together
npm run dev
```

- **Server:** default `http://localhost:3000` (REST: `POST /games`, WebSocket on same origin).
- **Client:** default `http://localhost:5173` (Vite).

To point the client at another API, set the env var when running Vite, e.g.:

```bash
VITE_API_URL=http://localhost:3000 npm run dev
```

(in `client/` or via `.env` with `VITE_` prefix).

### How to play

1. On the home page set board size and diamond count, optionally your name, then click “Create game”.
2. You enter the game room. Copy the link and send it to the second player.
3. The second player opens the link, enters their name, and joins.
4. Once both are in the room, turns begin. Reveal cells in order; diamonds award points and an extra turn.

Theme switcher (light / dark / system) is available in the header.

---

## Русский

### Правила

- Поле размером N×N (N от 2 до 6), на нём размещено M алмазов (M нечётное, M ≤ N²).
- Игроки ходят по очереди. В свой ход можно открыть одну закрытую ячейку.
- Открытая ячейка показывает либо алмаз (♦), либо число соседних алмазов (0–8).
- Алмаз даёт +1 очко и **дополнительный ход** тому же игроку.
- Игра заканчивается, когда все алмазы найдены. Выигрывает игрок с большим счётом (при равенстве — ничья).

### Стек

- **Backend:** NestJS, TypeScript, Socket.IO (WebSocket + polling).
- **Frontend:** Vue 3, TypeScript, Vite, Vue Router, Socket.IO Client.

### Структура репозитория

- `client/` — SPA на Vue 3 (создание игры, подключение по ссылке, игровой экран, темы).
- `server/` — API NestJS: HTTP для создания игры, WebSocket для присоединения и ходов.

### Запуск

Требуется Node.js (^20.19.0 или >=22.12.0 для client, см. `client/package.json`).

```bash
# Установка зависимостей (в корне и в workspaces)
npm install

# Одновременно сервер и клиент
npm run dev
```

- **Сервер:** по умолчанию на `http://localhost:3000` (REST: `POST /games`, WebSocket на том же origin).
- **Клиент:** по умолчанию на `http://localhost:5173` (Vite).

Чтобы клиент ходил на другой API, задайте переменную окружения при сборке/запуске Vite, например:

```bash
VITE_API_URL=http://localhost:3000 npm run dev
```

(в `client/` или через `.env` с префиксом `VITE_`).

### Как играть

1. На главной странице задайте размер поля и количество алмазов, при желании — своё имя, и нажмите «Создать игру».
2. Вы попадёте в комнату игры. Скопируйте ссылку и отправьте второму игроку.
3. Второй игрок переходит по ссылке, вводит имя и входит в игру.
4. Когда оба в комнате, начинаются ходы. Открывайте ячейки по очереди; алмазы дают очки и повтор хода.

В шапке доступна смена темы (светлая / тёмная / как в системе).
