import express from "express";
import http from "http";
import { Server } from "socket.io";
import { uuidv4 } from "./utils";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const defaultBoard = Array(9).fill(null);
let board = defaultBoard;
let players: string[] = [];
let users: string[] = [];

io.on("connection", (socket) => {
  const userId = uuidv4();
  users.push(userId);
  io.sockets.emit("users", users);

  let currentPlayer: string | null = null;
  console.log("a user connected");

  console.log("Retrieving board");
  socket.emit("setBoard", board);

  console.log("Retrieving players");
  socket.emit("setPlayers", players);

  socket.on("move", (_board: string[]) => {
    console.log("Making a move. Set backend board.");
    board = _board;
    io.sockets.emit("move", _board);
  });

  socket.on("reset", () => {
    console.log("reset backend and frontend board.");
    io.sockets.emit("reset", board);
  });

  socket.on("setPlayer", (player: string) => {
    currentPlayer = player;
    players = [...players, player];
    io.sockets.emit("setPlayers", players);
  });

  socket.on("disconnect", () => {
    if (currentPlayer) {
      players.splice(players.indexOf(currentPlayer), 1);
      socket.broadcast.emit("setPlayers", players);
    }
    users.splice(users.indexOf(userId), 1);
    socket.broadcast.emit("users", users);
    console.log("user disconnected");
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
