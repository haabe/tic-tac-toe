// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { WebSocketServer, WebSocket } from 'ws'
import { createServer, type Server } from 'http'
import { createGameServer } from './game-server.js'
import type { ServerMessage } from './protocol.js'

let httpServer: Server
let wss: WebSocketServer
let gameServer: ReturnType<typeof createGameServer>
let port: number

function connect(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`)
    ws.on('open', () => resolve(ws))
    ws.on('error', reject)
  })
}

function waitForMessage(ws: WebSocket): Promise<ServerMessage> {
  return new Promise((resolve) => {
    ws.once('message', (data) => {
      resolve(JSON.parse(data.toString()))
    })
  })
}

function sendMsg(ws: WebSocket, msg: object) {
  ws.send(JSON.stringify(msg))
}

beforeEach(async () => {
  httpServer = createServer()
  wss = new WebSocketServer({ server: httpServer, path: '/ws' })
  gameServer = createGameServer(wss)
  await new Promise<void>((resolve) => {
    httpServer.listen(0, () => {
      const addr = httpServer.address()
      port = typeof addr === 'object' && addr ? addr.port : 0
      resolve()
    })
  })
})

afterEach(async () => {
  gameServer.close()
  wss.close()
  await new Promise<void>((resolve) => httpServer.close(() => resolve()))
})

describe('game-server', () => {
  it('creates a game and returns a 6-digit code', async () => {
    const ws = await connect()
    const msgPromise = waitForMessage(ws)
    sendMsg(ws, { type: 'create' })
    const msg = await msgPromise
    expect(msg.type).toBe('created')
    if (msg.type === 'created') {
      expect(msg.code).toMatch(/^\d{6}$/)
      expect(msg.player).toBe('X')
    }
    ws.close()
  })

  it('allows a second player to join with the code', async () => {
    const ws1 = await connect()
    const createPromise = waitForMessage(ws1)
    sendMsg(ws1, { type: 'create' })
    const createMsg = await createPromise
    if (createMsg.type !== 'created') throw new Error('Expected created')

    const ws2 = await connect()
    const joinPromise = waitForMessage(ws2)
    const opponentPromise = waitForMessage(ws1)
    sendMsg(ws2, { type: 'join', code: createMsg.code })

    const joinMsg = await joinPromise
    expect(joinMsg.type).toBe('joined')
    if (joinMsg.type === 'joined') {
      expect(joinMsg.player).toBe('O')
    }

    const opponentMsg = await opponentPromise
    expect(opponentMsg.type).toBe('opponent-joined')

    ws1.close()
    ws2.close()
  })

  it('relays moves between players', async () => {
    const ws1 = await connect()
    const createPromise = waitForMessage(ws1)
    sendMsg(ws1, { type: 'create' })
    const createMsg = await createPromise
    if (createMsg.type !== 'created') throw new Error('Expected created')

    const ws2 = await connect()
    const joinPromise = waitForMessage(ws2)
    sendMsg(ws2, { type: 'join', code: createMsg.code })
    await joinPromise
    // Also consume the opponent-joined message on ws1
    await waitForMessage(ws1)

    // X makes a move
    const movePromise = waitForMessage(ws2)
    sendMsg(ws1, { type: 'move', index: 4 })
    const moveMsg = await movePromise
    expect(moveMsg).toEqual({ type: 'move', index: 4, player: 'X' })

    // O makes a move
    const movePromise2 = waitForMessage(ws1)
    sendMsg(ws2, { type: 'move', index: 0 })
    const moveMsg2 = await movePromise2
    expect(moveMsg2).toEqual({ type: 'move', index: 0, player: 'O' })

    ws1.close()
    ws2.close()
  })

  it('rejects invalid code', async () => {
    const ws = await connect()
    const msgPromise = waitForMessage(ws)
    sendMsg(ws, { type: 'join', code: '999999' })
    const msg = await msgPromise
    expect(msg.type).toBe('error')
    if (msg.type === 'error') {
      expect(msg.message).toBe('Game not found')
    }
    ws.close()
  })

  it('rejects wrong format code', async () => {
    const ws = await connect()
    const msgPromise = waitForMessage(ws)
    sendMsg(ws, { type: 'join', code: 'abc' })
    const msg = await msgPromise
    expect(msg.type).toBe('error')
    if (msg.type === 'error') {
      expect(msg.message).toBe('Invalid code format')
    }
    ws.close()
  })

  it('prevents wrong player from moving', async () => {
    const ws1 = await connect()
    const createPromise = waitForMessage(ws1)
    sendMsg(ws1, { type: 'create' })
    const createMsg = await createPromise
    if (createMsg.type !== 'created') throw new Error('Expected created')

    const ws2 = await connect()
    const joinPromise = waitForMessage(ws2)
    sendMsg(ws2, { type: 'join', code: createMsg.code })
    await joinPromise
    await waitForMessage(ws1) // opponent-joined

    // O tries to move first (should be ignored)
    sendMsg(ws2, { type: 'move', index: 0 })

    // X makes a valid move — if O's move was accepted, this cell would conflict
    const movePromise = waitForMessage(ws2)
    sendMsg(ws1, { type: 'move', index: 0 })
    const moveMsg = await movePromise
    expect(moveMsg).toEqual({ type: 'move', index: 0, player: 'X' })

    ws1.close()
    ws2.close()
  })

  it('notifies opponent on disconnect', async () => {
    const ws1 = await connect()
    const createPromise = waitForMessage(ws1)
    sendMsg(ws1, { type: 'create' })
    const createMsg = await createPromise
    if (createMsg.type !== 'created') throw new Error('Expected created')

    const ws2 = await connect()
    const joinPromise = waitForMessage(ws2)
    sendMsg(ws2, { type: 'join', code: createMsg.code })
    await joinPromise
    await waitForMessage(ws1) // opponent-joined

    const disconnectPromise = waitForMessage(ws1)
    ws2.close()
    const disconnectMsg = await disconnectPromise
    expect(disconnectMsg.type).toBe('opponent-disconnected')

    ws1.close()
  })

  it('handles rematch flow', async () => {
    const ws1 = await connect()
    const createPromise = waitForMessage(ws1)
    sendMsg(ws1, { type: 'create' })
    const createMsg = await createPromise
    if (createMsg.type !== 'created') throw new Error('Expected created')

    const ws2 = await connect()
    const joinPromise = waitForMessage(ws2)
    sendMsg(ws2, { type: 'join', code: createMsg.code })
    await joinPromise
    await waitForMessage(ws1) // opponent-joined

    // X requests rematch
    const rematchReqPromise = waitForMessage(ws2)
    sendMsg(ws1, { type: 'rematch' })
    const rematchReqMsg = await rematchReqPromise
    expect(rematchReqMsg.type).toBe('rematch-requested')

    // O accepts
    const rematchAccept1 = waitForMessage(ws1)
    const rematchAccept2 = waitForMessage(ws2)
    sendMsg(ws2, { type: 'rematch' })
    expect((await rematchAccept1).type).toBe('rematch-accepted')
    expect((await rematchAccept2).type).toBe('rematch-accepted')

    ws1.close()
    ws2.close()
  })

  it('rate limits join attempts', async () => {
    const ws = await connect()

    for (let i = 0; i < 5; i++) {
      const msgPromise = waitForMessage(ws)
      sendMsg(ws, { type: 'join', code: '999999' })
      await msgPromise // consume "Game not found"
    }

    // 6th attempt should be rate limited
    const msgPromise = waitForMessage(ws)
    sendMsg(ws, { type: 'join', code: '999999' })
    const msg = await msgPromise
    expect(msg.type).toBe('error')
    if (msg.type === 'error') {
      expect(msg.message).toContain('Too many attempts')
    }

    ws.close()
  })
})
