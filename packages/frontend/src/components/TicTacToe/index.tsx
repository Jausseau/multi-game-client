import React, { useState, useEffect, useMemo } from "react";
import { socket } from "../../socket";

const defaultBoard = Array(9).fill(null);

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState(defaultBoard);
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[] | null>(null);
  const [users, setUsers] = useState<string[]>([]);

  const nextPlayer = useMemo(() => (isXNext ? "X" : "O"), [isXNext]);

  function resetUI() {
    setBoard(defaultBoard);
    setWinner(null);
    setIsXNext(true);
  }

  useEffect(() => {
    function move(newBoard: string[]) {
      console.log("Server: Moving");
      setBoard(newBoard);
      setIsXNext((prevState) => !prevState);
      const gameWinner = calculateWinner(newBoard);
      if (gameWinner) setWinner(gameWinner);
    }

    function reset() {
      resetUI();
      console.log("Server: Board reset.");
    }

    function _setPlayers(players: string[] | null) {
      setPlayers(players);
    }

    function setBoardUI(board: string[]) {
      console.log("Board found:", board);
      setBoard(board);
    }

    function _setUsers(users: string[]) {
      setUsers(users);
    }

    socket.on("move", move);
    socket.on("reset", reset);
    socket.on("setPlayers", _setPlayers);
    socket.on("setBoard", setBoardUI);
    socket.on("users", _setUsers);
    return () => {
      socket.off("move", move);
      socket.off("reset", reset);
      socket.off("setPlayers", _setPlayers);
      socket.off("setBoard", setBoardUI);
      socket.off("users", _setUsers);
    };
  }, []);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    const newBoard = board.slice();
    newBoard[index] = isXNext ? "X" : "O";
    socket.emit("move", newBoard);
  };

  const handleReset = () => {
    socket.emit("reset");
  };

  const handlePlayer = (player: string) => () => {
    console.log("Setting player", player);
    if (!players?.includes(player) && !currentPlayer) {
      setCurrentPlayer(player);
      socket.emit("setPlayer", player);
    } else if (players?.includes(player)) {
      console.warn("Couldn't set player. Already exist.");
    } else if (currentPlayer) {
      console.warn("Player already set. Current player:", player);
    }
  };

  const calculateWinner = (board: string[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const renderSquare = (index: number) => (
    <button
      className="square"
      onClick={() =>
        !!currentPlayer &&
        ((currentPlayer === "X" && isXNext) ||
          (currentPlayer === "O" && !isXNext))
          ? handleClick(index)
          : ""
      }
    >
      {board[index]}
    </button>
  );

  return (
    <div className="flex flex-auto gap-2 justify-center items-center">
      <div>
        <div className="board-row">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="board-row">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="board-row">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
        <div className="m-2">
          {winner ? `Winner: ${winner}` : `Next Player: ${nextPlayer}`}
        </div>
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
      <div className="flex flex-col gap-2">
        Choose your player
        <div className="flex gap-2">
          <button
            type="button"
            className={`inline-flex w-full justify-center rounded-md ${
              players?.includes("X")
                ? "bg-red-200"
                : "bg-red-600 hover:bg-red-500"
            } px-3 py-2 text-sm font-semibold text-white shadow-sm  sm:ml-3 sm:w-auto`}
            onClick={handlePlayer("X")}
            disabled={players?.includes("X")}
          >
            X
          </button>
          <button
            type="button"
            className={`inline-flex w-full justify-center rounded-md ${
              players?.includes("O")
                ? "bg-green-200"
                : "bg-green-600 hover:bg-green-500"
            } px-3 py-2 text-sm font-semibold text-white shadow-sm  sm:ml-3 sm:w-auto`}
            onClick={handlePlayer("O")}
            disabled={players?.includes("O")}
          >
            O
          </button>
        </div>
        <div className="mt-5">Players: {players?.join(", ")}</div>
        <div className="mt-5">Users connected: {users.length}</div>
      </div>
    </div>
  );
};

export default TicTacToe;
