// Shared message types between client and server

export type ClientMessage =
  | { type: 'create' }
  | { type: 'join'; code: string }
  | { type: 'move'; index: number }
  | { type: 'rematch' }

export type ServerMessage =
  | { type: 'created'; code: string; player: 'X' | 'O' }
  | { type: 'joined'; player: 'X' | 'O' }
  | { type: 'opponent-joined' }
  | { type: 'move'; index: number; player: 'X' | 'O' }
  | { type: 'opponent-disconnected' }
  | { type: 'opponent-reconnected' }
  | { type: 'rematch-requested' }
  | { type: 'rematch-accepted' }
  | { type: 'error'; message: string }
  | { type: 'expired' }
