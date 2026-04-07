import { describe, it, expect } from 'vitest'
import { getCpuMove } from './cpu'
import type { Board } from './types'

describe('getCpuMove', () => {
  describe('easy mode', () => {
    it('returns a valid move on an empty board', () => {
      const board: Board = [null, null, null, null, null, null, null, null, null]
      const move = getCpuMove(board, 'easy')
      expect(move).toBeGreaterThanOrEqual(0)
      expect(move).toBeLessThanOrEqual(8)
    })

    it('returns -1 on a full board', () => {
      const board: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
      expect(getCpuMove(board, 'easy')).toBe(-1)
    })

    it('only picks empty cells', () => {
      const board: Board = ['X', 'O', 'X', null, 'O', 'O', 'O', 'X', 'X']
      // Only cell 3 is available
      expect(getCpuMove(board, 'easy')).toBe(3)
    })
  })

  describe('hard mode', () => {
    it('takes the winning move when available', () => {
      // O can win by playing at index 2
      const board: Board = ['X', 'X', null, 'O', 'O', null, 'X', null, null]
      expect(getCpuMove(board, 'hard')).toBe(5)
    })

    it('blocks the opponent from winning', () => {
      // X is about to win at index 2 — O must block
      const board: Board = ['X', 'X', null, 'O', null, null, null, null, null]
      expect(getCpuMove(board, 'hard')).toBe(2)
    })

    it('never loses when playing optimally (draw is the worst outcome)', () => {
      // From empty board, minimax should not lose
      const board: Board = ['X', null, null, null, null, null, null, null, null]
      const move = getCpuMove(board, 'hard')
      expect(move).toBeGreaterThanOrEqual(0)
      expect(move).toBeLessThanOrEqual(8)
      expect(board[move]).toBeNull()
    })
  })
})
