import type { Board, Player } from './types'
import { getAvailableMoves, getGameStatus } from './logic'

export type Difficulty = 'easy' | 'hard'

export function getCpuMove(board: Board, difficulty: Difficulty): number {
  const moves = getAvailableMoves(board)
  if (moves.length === 0) return -1

  if (difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  return getBestMove(board, 'O')
}

function getBestMove(board: Board, player: Player): number {
  const moves = getAvailableMoves(board)
  let bestScore = -Infinity
  let bestMove = moves[0]

  for (const move of moves) {
    const newBoard = [...board] as unknown as Board
    ;(newBoard as unknown as (Player | null)[])[move] = player
    const score = minimax(newBoard, false, player)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}

function minimax(board: Board, isMaximizing: boolean, cpuPlayer: Player): number {
  const status = getGameStatus(board)

  if (status.state === 'won') {
    return status.winner === cpuPlayer ? 10 : -10
  }
  if (status.state === 'draw') {
    return 0
  }

  const moves = getAvailableMoves(board)
  const humanPlayer: Player = cpuPlayer === 'O' ? 'X' : 'O'
  const currentPlayer = isMaximizing ? cpuPlayer : humanPlayer

  if (isMaximizing) {
    let best = -Infinity
    for (const move of moves) {
      const newBoard = [...board] as unknown as Board
      ;(newBoard as unknown as (Player | null)[])[move] = currentPlayer
      best = Math.max(best, minimax(newBoard, false, cpuPlayer))
    }
    return best
  } else {
    let best = Infinity
    for (const move of moves) {
      const newBoard = [...board] as unknown as Board
      ;(newBoard as unknown as (Player | null)[])[move] = currentPlayer
      best = Math.min(best, minimax(newBoard, true, cpuPlayer))
    }
    return best
  }
}
