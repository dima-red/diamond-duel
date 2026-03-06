import type { CreateGameResponse } from '@/types/game'

export function getApiBase(): string {
  return (
    (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
      .VITE_API_URL ?? 'http://localhost:3000'
  )
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
