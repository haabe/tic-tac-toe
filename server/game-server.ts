import { WebSocketServer, WebSocket } from 'ws'
import type { IncomingMessage } from 'http'
import type { ClientMessage, ServerMessage } from './protocol.js'

interface Game {
  code: string
  players: { X: WebSocket | null; O: WebSocket | null }
  moves: { index: number; player: 'X' | 'O' }[]
  createdAt: number
  rematchVotes: Set<'X' | 'O'>
}

const CODE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 5

const games = new Map<string, Game>()
const socketToGame = new Map<WebSocket, { code: string; player: 'X' | 'O' }>()
const rateLimits = new Map<string, { count: number; resetAt: number }>()

function generateCode(): string {
  let code: string
  do {
    code = String(Math.floor(100000 + Math.random() * 900000))
  } while (games.has(code))
  return code
}

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req.socket.remoteAddress ?? 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimits.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  entry.count++
  return entry.count <= RATE_LIMIT_MAX
}

function cleanupExpiredGames() {
  const now = Date.now()
  for (const [code, game] of games) {
    if (!game.players.O && now - game.createdAt > CODE_EXPIRY_MS) {
      if (game.players.X) {
        send(game.players.X, { type: 'expired' })
      }
      games.delete(code)
      for (const [sock, info] of socketToGame) {
        if (info.code === code) socketToGame.delete(sock)
      }
    }
  }
}

function handleMessage(ws: WebSocket, data: string, clientIp: string) {
  let msg: ClientMessage
  try {
    msg = JSON.parse(data)
  } catch {
    send(ws, { type: 'error', message: 'Invalid message' })
    return
  }

  switch (msg.type) {
    case 'create': {
      // Clean up any previous game this socket was in
      cleanupSocket(ws)

      const code = generateCode()
      const game: Game = {
        code,
        players: { X: ws, O: null },
        moves: [],
        createdAt: Date.now(),
        rematchVotes: new Set(),
      }
      games.set(code, game)
      socketToGame.set(ws, { code, player: 'X' })
      send(ws, { type: 'created', code, player: 'X' })
      break
    }

    case 'join': {
      if (!checkRateLimit(clientIp)) {
        send(ws, { type: 'error', message: 'Too many attempts. Please wait a moment.' })
        return
      }

      const code = msg.code?.trim()
      if (!code || !/^\d{6}$/.test(code)) {
        send(ws, { type: 'error', message: 'Invalid code format' })
        return
      }

      const game = games.get(code)
      if (!game) {
        send(ws, { type: 'error', message: 'Game not found' })
        return
      }

      if (game.players.O && game.players.O.readyState === WebSocket.OPEN) {
        send(ws, { type: 'error', message: 'Game is full' })
        return
      }

      // Clean up any previous game this socket was in
      cleanupSocket(ws)

      game.players.O = ws
      socketToGame.set(ws, { code, player: 'O' })
      send(ws, { type: 'joined', player: 'O' })

      // Send existing moves to the joining player (for reconnection)
      for (const move of game.moves) {
        send(ws, { type: 'move', index: move.index, player: move.player })
      }

      if (game.players.X) {
        send(game.players.X, { type: 'opponent-joined' })
      }
      break
    }

    case 'move': {
      const info = socketToGame.get(ws)
      if (!info) return

      const game = games.get(info.code)
      if (!game) return

      const index = msg.index
      if (typeof index !== 'number' || index < 0 || index > 8) return

      // Validate it's this player's turn
      const expectedPlayer = game.moves.length % 2 === 0 ? 'X' : 'O'
      if (info.player !== expectedPlayer) return

      // Validate cell is empty
      if (game.moves.some(m => m.index === index)) return

      game.moves.push({ index, player: info.player })

      // Relay move to opponent
      const opponent = info.player === 'X' ? game.players.O : game.players.X
      if (opponent) {
        send(opponent, { type: 'move', index, player: info.player })
      }
      break
    }

    case 'rematch': {
      const info = socketToGame.get(ws)
      if (!info) return

      const game = games.get(info.code)
      if (!game) return

      game.rematchVotes.add(info.player)

      if (game.rematchVotes.size === 2) {
        game.moves = []
        game.rematchVotes.clear()
        if (game.players.X) send(game.players.X, { type: 'rematch-accepted' })
        if (game.players.O) send(game.players.O, { type: 'rematch-accepted' })
      } else {
        const opponent = info.player === 'X' ? game.players.O : game.players.X
        if (opponent) send(opponent, { type: 'rematch-requested' })
      }
      break
    }
  }
}

function cleanupSocket(ws: WebSocket) {
  const info = socketToGame.get(ws)
  if (!info) return

  const game = games.get(info.code)
  if (game) {
    game.players[info.player] = null

    // Notify opponent
    const opponent = info.player === 'X' ? game.players.O : game.players.X
    if (opponent) {
      send(opponent, { type: 'opponent-disconnected' })
    }

    // Clean up game if both players gone
    if (!game.players.X && !game.players.O) {
      games.delete(info.code)
    }
  }
  socketToGame.delete(ws)
}

export function createGameServer(wss: WebSocketServer) {
  // Cleanup expired games every 30 seconds
  const cleanupInterval = setInterval(cleanupExpiredGames, 30000)

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientIp = getClientIp(req)

    ws.on('message', (data: Buffer) => {
      handleMessage(ws, data.toString(), clientIp)
    })

    ws.on('close', () => {
      cleanupSocket(ws)
    })
  })

  return {
    close() {
      clearInterval(cleanupInterval)
      games.clear()
      socketToGame.clear()
      rateLimits.clear()
    },
    // Expose for testing
    _games: games,
    _rateLimits: rateLimits,
  }
}
