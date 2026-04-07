import { describe, it, expect } from 'vitest'
import { createEmptyBoard, makeMove, getGameStatus, getAvailableMoves } from './logic'
import type { Board } from './types'

describe('createEmptyBoard', () => {
  it('creates a board with 9 null cells', () => {
    const board = createEmptyBoard()
    expect(board).toHaveLength(9)
    expect(board.every(cell => cell === null)).toBe(true)
  })
})

describe('makeMove', () => {
  it('places a player on an empty cell', () => {
    const board = createEmptyBoard()
    const result = makeMove(board, 0, 'X')
    expect(result[0]).toBe('X')
  })

  it('does not mutate the original board', () => {
    const board = createEmptyBoard()
    makeMove(board, 0, 'X')
    expect(board[0]).toBeNull()
  })

  it('returns the same board if the cell is occupied', () => {
    const board = makeMove(createEmptyBoard(), 0, 'X')
    const result = makeMove(board, 0, 'O')
    expect(result).toBe(board)
  })

  it('returns the same board for out-of-range index', () => {
    const board = createEmptyBoard()
    expect(makeMove(board, -1, 'X')).toBe(board)
    expect(makeMove(board, 9, 'X')).toBe(board)
  })
})

describe('getGameStatus', () => {
  it('returns playing with X as first player on empty board', () => {
    const status = getGameStatus(createEmptyBoard())
    expect(status).toEqual({ state: 'playing', currentPlayer: 'X' })
  })

  it('returns playing with O after X moves', () => {
    const board = makeMove(createEmptyBoard(), 0, 'X')
    const status = getGameStatus(board)
    expect(status).toEqual({ state: 'playing', currentPlayer: 'O' })
  })

  it('detects a row win', () => {
    const board: Board = ['X', 'X', 'X', 'O', 'O', null, null, null, null]
    const status = getGameStatus(board)
    expect(status).toEqual({ state: 'won', winner: 'X', winningLine: [0, 1, 2] })
  })

  it('detects a column win', () => {
    const board: Board = ['O', 'X', null, 'O', 'X', null, 'O', null, null]
    const status = getGameStatus(board)
    expect(status).toEqual({ state: 'won', winner: 'O', winningLine: [0, 3, 6] })
  })

  it('detects a diagonal win', () => {
    const board: Board = ['X', 'O', null, null, 'X', 'O', null, null, 'X']
    const status = getGameStatus(board)
    expect(status).toEqual({ state: 'won', winner: 'X', winningLine: [0, 4, 8] })
  })

  it('detects anti-diagonal win', () => {
    const board: Board = [null, null, 'O', null, 'O', 'X', 'O', 'X', 'X']
    const status = getGameStatus(board)
    expect(status).toEqual({ state: 'won', winner: 'O', winningLine: [2, 4, 6] })
  })

  it('detects a draw', () => {
    const board: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    const status = getGameStatus(board)
    expect(status).toEqual({ state: 'draw' })
  })
})

describe('getAvailableMoves', () => {
  it('returns all indices for empty board', () => {
    expect(getAvailableMoves(createEmptyBoard())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('returns only empty cells', () => {
    const board: Board = ['X', null, 'O', null, null, null, null, null, null]
    expect(getAvailableMoves(board)).toEqual([1, 3, 4, 5, 6, 7, 8])
  })

  it('returns empty array for full board', () => {
    const board: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    expect(getAvailableMoves(board)).toEqual([])
  })
})
