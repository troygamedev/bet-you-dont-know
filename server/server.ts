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

  // helper function that emits an event to the user as well as everyone in the lobby
  const emitLobbyEvent = (
    thisSocket: Socket,
    lobbyID: number,
    eventName: string,
    params
  ) => {
    io.to(lobbyID.toString()).emit(eventName, params);
    thisSocket.emit(eventName, params);
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

    // create the new user
    const newUser: User = {
      username: "User" + thisLobby.users.length,
      displayName: "User" + thisLobby.users.length,
      lobbyID: thisLobby.id,
      socketID: socket.id,
      hasSetName: false,
      usernameConflictIndex: 0,
    };
    // add them to the user list
    thisLobby.users.push(newUser);

    // subscribe them to the corresponding lobby room
    const lobbyIDToString = lobbies[lobbyID].id.toString();
    socket.join(lobbyIDToString);

    sendMessage(thisLobby.id, {
      message: "Someone has joined and is picking their username right now...",
      timestamp: dayjs(),
      isServer: true,
    });

    // update everyone's lobby object with the newest changes
    emitLobbyEvent(socket, lobbyID, "updateLobby", lobbies[lobbyID]);

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
    emitLobbyEvent(socket, lobbyID, "updateLobby", lobbies[lobbyID]);
  });

  socket.on("refetchLobbyList", () => {
    socket.emit("updateLobbyList", lobbies);
  });

  const getUserReference = (user: User) => {
    // find the user in the lobby user list
    return lobbies[user.lobbyID].users.find(
      (thisUser) => thisUser.socketID == user.socketID
    );
  };

  socket.on("setUsername", (user: User, newUsername: string) => {
    // find the user in the lobby user list
    const theUser = getUserReference(user);

    // set the new name and mark as set
    theUser.username = newUsername;
    theUser.hasSetName = true;

    // check if this username conflicts with anyone else in the lobby
    // if there is the same name, just append an index

    // find the guy with the largest conflict index that also has the same conflicting name
    // ex: Bob0, Bob1, Bob2 <-- find Bob2
    let biggestConflictingIndex = 0;
    let thisNameIsADuplicate = false;
    lobbies[user.lobbyID].users.forEach((thisUser) => {
      if (
        thisUser.username == theUser.username &&
        thisUser.socketID != socket.id
      ) {
        biggestConflictingIndex = Math.max(
          biggestConflictingIndex,
          thisUser.usernameConflictIndex
        );
        thisNameIsADuplicate = true;
      }
    });
    if (thisNameIsADuplicate) {
      theUser.usernameConflictIndex = biggestConflictingIndex + 1;
    }
    if (theUser.usernameConflictIndex >= 1) {
      // conflicting name, add a number to the end
      theUser.displayName = theUser.username + theUser.usernameConflictIndex;
    } else {
      // unique name, no problem
      theUser.displayName = theUser.username;
    }

    // announce that the user has joined the lobby if this is their first set
    sendMessage(theUser.lobbyID, {
      message: theUser.displayName + " has joined the lobby!",
      timestamp: dayjs(),
      isServer: true,
    });

    // tell everyone in the lobby to update their lobby object
    emitLobbyEvent(
      socket,
      theUser.lobbyID,
      "updateLobby",
      lobbies[user.lobbyID]
    );
  });

  const leaveParty = (thisSocket: Socket) => {
    // search through lobbies for this user
    lobbies.forEach((lobby) => {
      lobby.users.forEach((user, idx) => {
        if (user.socketID == thisSocket.id) {
          // remove the user from lobby if the socket id matches
          lobby.users.splice(idx, idx + 1);

          const lobbyIDToString = lobby.id.toString();

          // send a server message that someone has left
          sendMessage(lobby.id, {
            message: user.displayName + " has left the lobby!",
            timestamp: dayjs(),
            isServer: true,
          });
          // tell everyone in the room to get the newest changes (except the guy leaving)
          thisSocket.to(lobbyIDToString).emit("updateLobby", lobby);

          // leave the room
          thisSocket.leave(lobby.id.toString());

          // tell everyone to update the lobby list
          io.emit("updateLobbyList", lobbies);
        }
      });
    });
  };

  socket.on("setReady", (user: User, isReady: boolean) => {
    const theUser = getUserReference(user);
    theUser.isReady = isReady;

    // tell everyone in the lobby to update their lobby object
    emitLobbyEvent(
      socket,
      theUser.lobbyID,
      "updateLobby",
      lobbies[user.lobbyID]
    );
  });

  socket.on("leaveParty", () => {
    leaveParty(socket);
  });
  socket.on("disconnect", () => {
    leaveParty(socket);
  });
});

// app.use(
//   express.static(path.join(__dirname, "../client/out"), {
//     // index: false,
//     extensions: ["html"],
//   })
// );

app.get("/lobby/:lobbyID", (req, res) => {
  const path = "[slug].html";
  res.sendFile(path, { root: "../client/out/lobby/" });
});

server.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
