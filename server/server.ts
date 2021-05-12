import express, { Application } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import cors from "cors";
import { Lobby, User } from "@shared/types";
const PORT = process.env.PORT || 5000;

const app: Application = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://chess-clock-trivia.herokuapp.com"
        : "http://localhost:3000",
    credentials: true,
  },
});

//force https
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https")
      res.redirect(`https://${req.header("host")}${req.url}`);
    else next();
  });
}

//middleware
app.use(cors());
app.use(express.json());

// force paths to load html
app.use(
  express.static(path.join(__dirname, "../client/out"), {
    // index: false,
    extensions: ["html"],
  })
);

// //Routes//
// app.get("/api", (req, res) => {
//   res.json({ message: "hola" });
// });

const NUM_LOBBIES = 5;
let lobbies: Array<Lobby> = [];
for (let i = 0; i < NUM_LOBBIES; i++) {
  let users: Array<User> = [];
  lobbies.push({ id: i, name: "Lobby Room " + i, users: users });
}

// on connect
io.on("connection", (socket: Socket) => {
  // to just this client
  // socket.emit("message", "hello")

  // to everyone but the client
  // socket.broadcast.emit("message", "hello");

  // to everyone
  // io.emit("message", "hello")

  socket.emit("message", "connected!");
  socket.emit("loadLobbies", lobbies);

  socket.on("joinLobby", (lobbyID: number) => {
    socket.emit("lobbyJoined", lobbies[lobbyID]);

    const newUser: User = {
      username: "User" + lobbies[lobbyID].users.length,
      lobbyID: lobbies[lobbyID].id,
      socketID: socket.id,
    };
    lobbies[lobbyID].users.push(newUser);
    socket.emit(
      "message",
      "Welcome, " +
        newUser.username +
        ", you have joined " +
        lobbies[lobbyID].name
    );

    // refresh everyone's lobbies
    io.emit("loadLobbies", lobbies);
  });

  socket.on("disconnect", () => {
    // search through lobbies for this user
    lobbies.forEach((lobby) => {
      lobby.users.forEach((user, idx) => {
        // remove the user from lobby if the socket id matches
        if (user.socketID == socket.id) {
          lobby.users.splice(idx, idx + 1);
          io.emit("loadLobbies", lobbies);
        }
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
