import React, { useState, useEffect } from 'react';
import { startNewGame, makeMove, getScore } from './api';
import './App.css';


// creating sidebar for the user to decide what mode he wants to play
const Sidebar = ({ mode, setMode, handleNewGame, isOpen, setIsOpen }) => (
  <div className={`sidebar ${isOpen ? 'open' : ''}`}>
    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
    <h2>Game Modes</h2>
    <select value={mode} onChange={(e) => setMode(e.target.value)}>
      <option value="pvp">Player vs Player</option>
      <option value="easy">Player vs Easy AI</option>
      <option value="hard">Player vs Hard AI</option>
    </select>
    <button className="new-game-btn" onClick={handleNewGame}>New Game</button>
  </div>
);

const App = () => {

  // initialise the game
  const [gameState, setGameState] = useState({
    board: Array(9).fill(' '),
    winner: null,
    gameOver: false,
  });

  // by default, i have set the mode to pvp.
  const [mode, setMode] = useState('pvp');
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchScores();
  }, []);


  // get scores
  const fetchScores = async () => {
    try {
      const data = await getScore();
      setScores(data);
    } catch (error) {
      console.error("Error fetching scores:", error);
    }
  };


  // reset the board and display the updated scores
  const handleNewGame = async () => {
    try {
      const data = await startNewGame(mode);
      setGameState(data);
      fetchScores();
    } catch (error) {
      console.error("Error starting new game:", error);
    }
  };


  // move function
  const handleMove = async (index) => {
    if (gameState.board[index] !== ' ' || gameState.gameOver) {
      return;
    }
    try {
      const data = await makeMove(index);
      setGameState(data);
      fetchScores();
    } catch (error) {
      console.error("Error making move:", error);
    }
  };

  const renderSquare = (index) => (
    <button className="square" onClick={() => handleMove(index)}>
      {gameState.board[index]}
    </button>
  );

  return (
    <div className="app">
      <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
      <Sidebar
        mode={mode}
        setMode={setMode}
        handleNewGame={handleNewGame}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="game-container">
        <div className="game-wrapper">
          <div className="player-info">
            <h2>Player X</h2>
            <p>Score: {scores.X}</p>
          </div>
          <div className="game-board">
            <h1>Tic Tac Toe</h1>
            <div className="board-row">{[0, 1, 2].map(renderSquare)}</div>
            <div className="board-row">{[3, 4, 5].map(renderSquare)}</div>
            <div className="board-row">{[6, 7, 8].map(renderSquare)}</div>
            <div className="game-info">
              {gameState.gameOver ? (
                  <div>{gameState.winner ? `Winner: ${gameState.winner}` : "It's a draw!"}</div>
              ) : (
                  <div>Next player: {gameState.board.filter(square => square === ' ').length % 2 === 0 ? 'O' : 'X'}</div>
              )}
            </div>
          </div>
          <div className="draws">
            <p>Draws: {scores.Draws}</p>
          </div>
          <div className="player-info">
            <h2>Player O</h2>
            <p>Score: {scores.O}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
