import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

afterEach(cleanup)

describe('App', () => {
  it('renders the game title', () => {
    render(<App />)
    expect(screen.getByText('Tic Tac Toe')).toBeInTheDocument()
  })

  it('shows mode selector on start', () => {
    render(<App />)
    expect(screen.getByText('🤖 vs CPU')).toBeInTheDocument()
    expect(screen.getByText('🌐 Online')).toBeInTheDocument()
  })

  it('enters CPU mode when clicking vs CPU', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('🤖 vs CPU'))
    const board = screen.getByRole('grid')
    const cells = within(board).getAllByRole('gridcell')
    expect(cells).toHaveLength(9)
  })

  it('shows difficulty buttons in CPU mode', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('🤖 vs CPU'))
    expect(screen.getByText('😊 Easy')).toBeInTheDocument()
    expect(screen.getByText('🧠 Hard')).toBeInTheDocument()
  })

  it('places X when clicking an empty cell in CPU mode', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('🤖 vs CPU'))
    const board = screen.getByRole('grid')
    const cells = within(board).getAllByRole('gridcell')
    await user.click(cells[0])
    expect(cells[0]).toHaveTextContent('X')
  })

  it('has accessible labels on cells', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('🤖 vs CPU'))
    const board = screen.getByRole('grid')
    const cells = within(board).getAllByRole('gridcell')
    expect(cells[0]).toHaveAccessibleName('Row 1, Column 1, empty')
    expect(cells[4]).toHaveAccessibleName('Row 2, Column 2, empty')
    expect(cells[8]).toHaveAccessibleName('Row 3, Column 3, empty')
  })

  it('can go back to menu from CPU mode', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('🤖 vs CPU'))
    await user.click(screen.getByLabelText('Back to menu'))
    expect(screen.getByText('🤖 vs CPU')).toBeInTheDocument()
  })

  it('enters online mode when clicking Online', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('🌐 Online'))
    expect(screen.getByText('🎮 Create Game')).toBeInTheDocument()
    expect(screen.getByLabelText('Game code')).toBeInTheDocument()
  })
})
