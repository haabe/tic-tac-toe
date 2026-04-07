import { useCallback, useEffect, useRef, useState } from 'react'
import type { Board, Player } from './types'
import { createEmptyBoard, makeMove } from './logic'
import type { ServerMessage } from '../../server/protocol'

export type OnlineState =
  | { phase: 'idle' }
  | { phase: 'creating' }
  | { phase: 'waiting'; code: string }
  | { phase: 'joining' }
  | { phase: 'playing'; myPlayer: Player }
  | { phase: 'disconnected'; myPlayer: Player }
  | { phase: 'error'; message: string }

export function useOnlineGame() {
  const wsRef = useRef<WebSocket | null>(null)
  const [state, setState] = useState<OnlineState>({ phase: 'idle' })
  const [board, setBoard] = useState<Board>(createEmptyBoard)
  const [rematchRequested, setRematchRequested] = useState(false)
  const [opponentWantsRematch, setOpponentWantsRematch] = useState(false)
  const [roundNumber, setRoundNumber] = useState(0)

  const getWsUrl = useCallback(() => {
    // In dev mode, Vite proxies /ws to the game server
    // In production, the game server serves everything on the same host
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${window.location.host}/ws`
  }, [])

  const connectAndSend = useCallback((msg: object, retries = 3): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      let attempt = 0

      function tryConnect() {
        const ws = new WebSocket(getWsUrl())
        wsRef.current = ws

        ws.onopen = () => {
          ws.send(JSON.stringify(msg))
          resolve(ws)
        }
        ws.onerror = () => {
          attempt++
          if (attempt < retries) {
            setTimeout(tryConnect, 2000)
          } else {
            setState({ phase: 'error', message: 'Connection failed. Please try again.' })
            reject()
          }
        }
      }

      tryConnect()
    })
  }, [getWsUrl])

  const setupMessageHandler = useCallback((ws: WebSocket) => {
    ws.onmessage = (event) => {
      const msg: ServerMessage = JSON.parse(event.data)

      switch (msg.type) {
        case 'created':
          setState({ phase: 'waiting', code: msg.code })
          break
        case 'joined':
          setState({ phase: 'playing', myPlayer: msg.player })
          break
        case 'opponent-joined':
          setState(prev => {
            if (prev.phase === 'waiting') return { phase: 'playing', myPlayer: 'X' }
            return prev
          })
          break
        case 'move':
          setBoard(prev => makeMove(prev, msg.index, msg.player))
          break
        case 'opponent-disconnected':
          setState(prev => {
            if (prev.phase === 'playing' || prev.phase === 'disconnected') {
              const myPlayer = 'myPlayer' in prev ? prev.myPlayer : 'X'
              return { phase: 'disconnected', myPlayer }
            }
            return prev
          })
          break
        case 'opponent-reconnected':
          setState(prev => {
            if (prev.phase === 'disconnected') {
              return { phase: 'playing', myPlayer: prev.myPlayer }
            }
            return prev
          })
          break
        case 'rematch-requested':
          setOpponentWantsRematch(true)
          break
        case 'rematch-accepted':
          setBoard(createEmptyBoard())
          setRematchRequested(false)
          setOpponentWantsRematch(false)
          setRoundNumber(prev => prev + 1)
          break
        case 'expired':
          setState({ phase: 'error', message: 'Game code expired' })
          break
        case 'error':
          setState({ phase: 'error', message: msg.message })
          break
      }
    }

    ws.onclose = () => {
      setState(prev => {
        if (prev.phase === 'playing') {
          const myPlayer = 'myPlayer' in prev ? prev.myPlayer : 'X'
          return { phase: 'disconnected', myPlayer }
        }
        if (prev.phase === 'waiting' || prev.phase === 'creating' || prev.phase === 'joining') {
          return { phase: 'error', message: 'Connection lost' }
        }
        return prev
      })
    }
  }, [])

  const createGame = useCallback(async () => {
    setState({ phase: 'creating' })
    setBoard(createEmptyBoard())
    setRematchRequested(false)
    setOpponentWantsRematch(false)
    try {
      const ws = await connectAndSend({ type: 'create' })
      setupMessageHandler(ws)
    } catch { /* error handled in connectAndSend */ }
  }, [connectAndSend, setupMessageHandler])

  const joinGame = useCallback(async (code: string) => {
    setState({ phase: 'joining' })
    setBoard(createEmptyBoard())
    setRematchRequested(false)
    setOpponentWantsRematch(false)
    try {
      const ws = await connectAndSend({ type: 'join', code })
      setupMessageHandler(ws)
    } catch { /* error handled in connectAndSend */ }
  }, [connectAndSend, setupMessageHandler])

  const sendMove = useCallback((index: number, myPlayer: Player) => {
    setBoard(prev => makeMove(prev, index, myPlayer))
    wsRef.current?.send(JSON.stringify({ type: 'move', index }))
  }, [])

  const requestRematch = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: 'rematch' }))
    setRematchRequested(true)
  }, [])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setState({ phase: 'idle' })
    setBoard(createEmptyBoard())
    setRematchRequested(false)
    setOpponentWantsRematch(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close()
    }
  }, [])

  return {
    state,
    board,
    rematchRequested,
    opponentWantsRematch,
    roundNumber,
    createGame,
    joinGame,
    sendMove,
    requestRematch,
    disconnect,
  }
}
