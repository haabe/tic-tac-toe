import type { Board, Cell, GameStatus, Player } from './types'

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
] as const

export function createEmptyBoard(): Board {
  return [null, null, null, null, null, null, null, null, null]
}

export function makeMove(board: Board, index: number, player: Player): Board {
  if (index < 0 || index > 8 || board[index] !== null) {
    return board
  }
  const newBoard = [...board] as unknown as [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]
  newBoard[index] = player
  return newBoard
}

export function getGameStatus(board: Board): GameStatus {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { state: 'won', winner: board[a], winningLine: line }
    }
  }

  if (board.every(cell => cell !== null)) {
    return { state: 'draw' }
  }

  const moveCount = board.filter(cell => cell !== null).length
  const currentPlayer: Player = moveCount % 2 === 0 ? 'X' : 'O'
  return { state: 'playing', currentPlayer }
}

export function getAvailableMoves(board: Board): number[] {
  return board.reduce<number[]>((moves, cell, index) => {
    if (cell === null) moves.push(index)
    return moves
  }, [])
}
