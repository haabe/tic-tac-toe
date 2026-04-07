import { useCallback, useEffect, useState } from 'react'
import { createEmptyBoard, makeMove, getGameStatus } from './game/logic'
import { getCpuMove, type Difficulty } from './game/cpu'
import { useOnlineGame } from './game/useOnlineGame'
import type { Board, Player } from './game/types'
import './App.css'

type GameMode = 'menu' | 'cpu' | 'local' | 'online'

function App() {
  const [mode, setMode] = useState<GameMode>('menu')

  return (
    <>
      <h1 className="game-title" aria-label="Tic Tac Toe">Tic Tac Toe</h1>
      {mode === 'menu' && <ModeSelector onSelect={setMode} />}
      {mode === 'cpu' && <CpuGame onBack={() => setMode('menu')} />}
      {mode === 'local' && <LocalGame onBack={() => setMode('menu')} />}
      {mode === 'online' && <OnlineGame onBack={() => setMode('menu')} />}
    </>
  )
}

function ModeSelector({ onSelect }: { onSelect: (mode: GameMode) => void }) {
  return (
    <div className="mode-selector" role="group" aria-label="Game mode">
      <button className="mode-btn" onClick={() => onSelect('cpu')}>
        🤖 vs CPU
      </button>
      <button className="mode-btn" onClick={() => onSelect('local')}>
        👫 2 Players
      </button>
      <button className="mode-btn" onClick={() => onSelect('online')}>
        🌐 Online
      </button>
    </div>
  )
}

function CpuGame({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Board>(createEmptyBoard)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [cpuThinking, setCpuThinking] = useState(false)

  const status = getGameStatus(board)
  const gameOver = status.state !== 'playing'
  const isPlayerTurn = status.state === 'playing' && status.currentPlayer === 'X'

  const handleCellClick = useCallback((index: number) => {
    if (!isPlayerTurn || cpuThinking || board[index] !== null) return
    setBoard(prev => makeMove(prev, index, 'X'))
  }, [isPlayerTurn, cpuThinking, board])

  useEffect(() => {
    if (status.state === 'playing' && status.currentPlayer === 'O') {
      setCpuThinking(true)
      const timer = setTimeout(() => {
        setBoard(prev => {
          const move = getCpuMove(prev, difficulty)
          return move >= 0 ? makeMove(prev, move, 'O') : prev
        })
        setCpuThinking(false)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [status, difficulty])

  const handlePlayAgain = useCallback(() => {
    setBoard(createEmptyBoard())
  }, [])

  const winningLine = status.state === 'won' ? status.winningLine : []

  const statusText = (() => {
    if (cpuThinking) return '🤔'
    switch (status.state) {
      case 'won': return status.winner === 'X' ? '🎉' : '😢'
      case 'draw': return '🤝'
      case 'playing': return status.currentPlayer === 'X' ? '👆' : '⏳'
    }
  })()

  const statusLabel = (() => {
    if (cpuThinking) return 'CPU is thinking'
    switch (status.state) {
      case 'won': return `${status.winner === 'X' ? 'You' : 'CPU'} won!`
      case 'draw': return 'Draw!'
      case 'playing': return status.currentPlayer === 'X' ? 'Your turn' : 'CPU turn'
    }
  })()

  return (
    <>
      <button className="back-btn" onClick={onBack} aria-label="Back to menu">← Back</button>

      <div className="difficulty-selector" role="group" aria-label="Difficulty">
        <button
          className="difficulty-btn"
          aria-pressed={difficulty === 'easy'}
          onClick={() => { setDifficulty('easy'); setBoard(createEmptyBoard()) }}
        >
          😊 Easy
        </button>
        <button
          className="difficulty-btn"
          aria-pressed={difficulty === 'hard'}
          onClick={() => { setDifficulty('hard'); setBoard(createEmptyBoard()) }}
        >
          🧠 Hard
        </button>
      </div>

      <div
        className={`status ${status.state}`}
        role="status"
        aria-live="polite"
        aria-label={statusLabel}
      >
        {statusText}
      </div>

      <GameBoard
        board={board}
        winningLine={winningLine}
        disabled={gameOver || !isPlayerTurn || cpuThinking}
        onCellClick={handleCellClick}
      />

      {gameOver && (
        <button className="play-again" onClick={handlePlayAgain} autoFocus>
          🔄 Play Again
        </button>
      )}
    </>
  )
}

function LocalGame({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Board>(createEmptyBoard)

  const status = getGameStatus(board)
  const gameOver = status.state !== 'playing'
  const winningLine = status.state === 'won' ? status.winningLine : []

  const handleCellClick = useCallback((index: number) => {
    if (status.state !== 'playing' || board[index] !== null) return
    setBoard(prev => makeMove(prev, index, status.currentPlayer))
  }, [status, board])

  const statusText = (() => {
    switch (status.state) {
      case 'won': return status.winner === 'X' ? '❌ 🎉' : '⭕ 🎉'
      case 'draw': return '🤝'
      case 'playing': return status.currentPlayer === 'X' ? '❌ 👆' : '⭕ 👆'
    }
  })()

  const statusLabel = (() => {
    switch (status.state) {
      case 'won': return `${status.winner} wins!`
      case 'draw': return 'Draw!'
      case 'playing': return `${status.currentPlayer}'s turn`
    }
  })()

  return (
    <>
      <button className="back-btn" onClick={onBack} aria-label="Back to menu">← Back</button>

      <div
        className={`status ${status.state}`}
        role="status"
        aria-live="polite"
        aria-label={statusLabel}
      >
        {statusText}
      </div>

      <GameBoard
        board={board}
        winningLine={winningLine}
        disabled={gameOver}
        onCellClick={handleCellClick}
      />

      {gameOver && (
        <button className="play-again" onClick={() => setBoard(createEmptyBoard())} autoFocus>
          🔄 Play Again
        </button>
      )}
    </>
  )
}

function OnlineGame({ onBack }: { onBack: () => void }) {
  const {
    state, board, rematchRequested, opponentWantsRematch,
    createGame, joinGame, sendMove, requestRematch, disconnect,
  } = useOnlineGame()
  const [joinCode, setJoinCode] = useState('')

  const status = getGameStatus(board)
  const gameOver = status.state !== 'playing'

  const handleBack = useCallback(() => {
    disconnect()
    onBack()
  }, [disconnect, onBack])

  if (state.phase === 'idle' || state.phase === 'error') {
    return (
      <>
        <button className="back-btn" onClick={handleBack} aria-label="Back to menu">← Back</button>

        {state.phase === 'error' && (
          <div className="status error" role="alert">{state.message}</div>
        )}

        <div className="online-menu">
          <button className="mode-btn" onClick={createGame}>
            🎮 Create Game
          </button>

          <div className="join-section">
            <input
              className="code-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, ''))}
              aria-label="Game code"
            />
            <button
              className="mode-btn"
              onClick={() => joinGame(joinCode)}
              disabled={joinCode.length !== 6}
            >
              🔗 Join Game
            </button>
          </div>
        </div>
      </>
    )
  }

  if (state.phase === 'creating' || state.phase === 'joining') {
    return (
      <>
        <button className="back-btn" onClick={handleBack} aria-label="Back to menu">← Back</button>
        <div className="status" role="status" aria-live="polite">⏳ Connecting...</div>
      </>
    )
  }

  if (state.phase === 'waiting') {
    return (
      <>
        <button className="back-btn" onClick={handleBack} aria-label="Back to menu">← Back</button>
        <div className="waiting-screen">
          <div className="status" role="status" aria-live="polite" aria-label="Waiting for opponent">
            ⏳ Waiting for opponent
          </div>
          <div className="game-code" aria-label={`Game code: ${state.code.split('').join(' ')}`}>
            {state.code}
          </div>
          <p className="code-hint">Share this code with your friend</p>
        </div>
      </>
    )
  }

  // Playing or disconnected
  const myPlayer: Player = state.myPlayer
  const isMyTurn = status.state === 'playing' && status.currentPlayer === myPlayer
  const winningLine = status.state === 'won' ? status.winningLine : []

  const handleCellClick = (index: number) => {
    if (!isMyTurn || board[index] !== null || state.phase === 'disconnected') return
    sendMove(index, myPlayer)
  }

  const statusText = (() => {
    if (state.phase === 'disconnected') return '📡'
    switch (status.state) {
      case 'won': return status.winner === myPlayer ? '🎉' : '😢'
      case 'draw': return '🤝'
      case 'playing': return isMyTurn ? '👆' : '⏳'
    }
  })()

  const statusLabel = (() => {
    if (state.phase === 'disconnected') return 'Opponent disconnected'
    switch (status.state) {
      case 'won': return `${status.winner === myPlayer ? 'You' : 'Opponent'} won!`
      case 'draw': return 'Draw!'
      case 'playing': return isMyTurn ? 'Your turn' : "Opponent's turn"
    }
  })()

  return (
    <>
      <button className="back-btn" onClick={handleBack} aria-label="Back to menu">← Back</button>

      <div className="player-badge" aria-label={`You are ${myPlayer}`}>
        You are <span className={myPlayer.toLowerCase()}>{myPlayer}</span>
      </div>

      <div
        className={`status ${status.state} ${state.phase === 'disconnected' ? 'error' : ''}`}
        role="status"
        aria-live="polite"
        aria-label={statusLabel}
      >
        {statusText}
      </div>

      <GameBoard
        board={board}
        winningLine={winningLine}
        disabled={!isMyTurn || gameOver || state.phase === 'disconnected'}
        onCellClick={handleCellClick}
      />

      {gameOver && state.phase !== 'disconnected' && (
        <div className="rematch-section">
          {rematchRequested ? (
            <div className="status" role="status">Waiting for opponent...</div>
          ) : opponentWantsRematch ? (
            <button className="play-again" onClick={requestRematch} autoFocus>
              🔄 Accept Rematch
            </button>
          ) : (
            <button className="play-again" onClick={requestRematch} autoFocus>
              🔄 Rematch
            </button>
          )}
        </div>
      )}
    </>
  )
}

function GameBoard({
  board, winningLine, disabled, onCellClick,
}: {
  board: Board
  winningLine: readonly number[]
  disabled: boolean
  onCellClick: (index: number) => void
}) {
  return (
    <div className="board" role="grid" aria-label="Game board">
      {board.map((cell, i) => {
        const row = Math.floor(i / 3) + 1
        const col = (i % 3) + 1
        const isWinning = winningLine.includes(i)
        return (
          <button
            key={i}
            className={`cell ${cell?.toLowerCase() ?? ''} ${isWinning ? 'winning' : ''}`}
            onClick={() => onCellClick(i)}
            disabled={disabled || cell !== null}
            aria-label={`Row ${row}, Column ${col}${cell ? `, ${cell}` : ', empty'}`}
            role="gridcell"
          >
            {cell}
          </button>
        )
      })}
    </div>
  )
}

export default App
