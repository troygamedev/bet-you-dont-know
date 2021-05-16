import express, { Application } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import cors from "cors";
import { ChatMessage, Lobby, User } from "@shared/types";
import dayjs from "dayjs";

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
  let chatMessages: Array<ChatMessage> = [];
  lobbies.push({
    id: i,
    name: "Lobby Room " + String.fromCharCode("A".charCodeAt(0) + i),
    users: users,
    chatMessages: chatMessages,
  });
}

// on connect
io.on("connection", (socket: Socket) => {
  // to just this client
  // socket.emit("message", "hello")

  // to everyone but the client
  // socket.broadcast.emit("message", "hello");

  // to everyone
  // io.emit("message", "hello")

  socket.emit("updateLobbyList", lobbies);

  const MAX_CHAT_MESSAGES = 15;
  const sendMessage = (lobbyID: number, msg: ChatMessage) => {
    const thisLobby = lobbies[lobbyID];
    //send a chat message
    thisLobby.chatMessages.push(msg);

    // make sure the number of chat messages don't exceed the limit
    if (thisLobby.chatMessages.length > MAX_CHAT_MESSAGES) {
      thisLobby.chatMessages.shift();
    }
  };

  socket.on("joinLobby", (lobbyID: number) => {
    if (lobbyID == null) return; // make sure the lobbyID isnt null
    // make sure the lobbyID actually exists in the lobbies list
    let flag = false;
    lobbies.forEach((lobby) => {
      if (lobby.id == lobbyID) flag = true;
    });
    if (!flag) return;

    const thisLobby = lobbies[lobbyID];

    // send event to hide the user's lobby list
    socket.emit("lobbyJoined", thisLobby);

    // create the new user
    const newUser: User = {
      username: "User" + thisLobby.users.length,
      lobbyID: thisLobby.id,
      socketID: socket.id,
    };
    // add them to the user list
    thisLobby.users.push(newUser);

    // send a server message
    sendMessage(lobbyID, {
      message: newUser.username + " has joined the lobby!",
      timestamp: dayjs(),
      isServer: true,
    });

    // subscribe them to the corresponding lobby room
    const lobbyIDToString = lobbies[lobbyID].id.toString();
    socket.join(lobbyIDToString);

    // update everyone's lobby object with the newest changes
    socket.to(lobbyIDToString).emit("updateLobby", lobbies[lobbyID]);
    socket.emit("updateLobby", lobbies[lobbyID]);

    // refresh everyone's lobbies list
    io.emit("updateLobbyList", lobbies);
  });

  socket.on("sendMessage", (lobbyID: number, message: string, sender: User) => {
    const lobbyIDToString = lobbyID.toString();

    sendMessage(lobbyID, {
      message: message,
      timestamp: dayjs(),
      isServer: false,
      user: sender,
    });
    // send this to everyone in the room
    socket.to(lobbyIDToString).emit("updateLobby", lobbies[lobbyID]);
    // as well as the sender
    socket.emit("updateLobby", lobbies[lobbyID]);
  });

  socket.on("disconnect", () => {
    // search through lobbies for this user
    lobbies.forEach((lobby) => {
      lobby.users.forEach((user, idx) => {
        if (user.socketID == socket.id) {
          // remove the user from lobby if the socket id matches
          lobby.users.splice(idx, idx + 1);

          const lobbyIDToString = lobby.id.toString();

          // send a server message that someone has left
          sendMessage(lobby.id, {
            message: user.username + " has left the lobby!",
            timestamp: dayjs(),
            isServer: true,
          });
          // tell everyone in the room to get the newest changes
          socket.to(lobbyIDToString).emit("updateLobby", lobby);

          // leave the room
          socket.leave(lobby.id.toString());

          // tell everyone to update the lobby list
          io.emit("updateLobbyList", lobbies);
        }
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
