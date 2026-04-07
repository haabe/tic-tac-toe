export type Player = 'X' | 'O'
export type Cell = Player | null
export type Board = readonly [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]

export type GameStatus =
  | { state: 'playing'; currentPlayer: Player }
  | { state: 'won'; winner: Player; winningLine: readonly number[] }
  | { state: 'draw' }
