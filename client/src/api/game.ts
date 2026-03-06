import type { CreateGameResponse } from '@/types/game'

const DEFAULT_API_BASE = 'http://localhost:3000'

export function getApiBase(): string {
  const env = import.meta.env as { VITE_API_URL?: string }
  return env.VITE_API_URL ?? DEFAULT_API_BASE
}

export async function createGame(params: {
  size: number
  diamondsCount: number
}): Promise<CreateGameResponse> {
  const res = await fetch(`${getApiBase()}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }

  return res.json() as Promise<CreateGameResponse>
}
