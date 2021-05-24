import express, { Application } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import cors from "cors";
import {
  ChatMessage,
  Lobby,
  User,
  TriviaQuestion,
  GameStage,
} from "@shared/types";

import dayjs from "dayjs";
import fetch from "node-fetch";

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

// fetch from the trivia json file

let triviaQuestions: Array<TriviaQuestion> = [];

const TRIVIA_ENDPOINT =
  "https://troygamedev.github.io/trivia-game-data/questions.json";

const fetchTriviaQuestions = async () => {
  try {
    // clear the old list
    triviaQuestions = [];

    // read the json file and push them into the array as TriviaQuestion objects
    const response = await fetch(TRIVIA_ENDPOINT);
    const json = await response.json();

    json.list.forEach((item) => {
      // shuffle the choices
      var shuffle = require("shuffle-array"),
        shuffledChoices = item.choices;
      shuffledChoices.push(item.answer);
      shuffle(shuffledChoices, { copy: true });
      triviaQuestions.push({
        question: item.question,
        wrongChoices: item.choices,
        answer: item.answer,
        allChoicesRandomized: shuffledChoices,
      });
    });
  } catch (error) {
    console.error(error);
  }
};

const everyHour = () => {
  // refresh trivia questions every hour
  fetchTriviaQuestions();
  setInterval(fetchTriviaQuestions, 1000 * 60 * 60);
};
everyHour();

let lobbies: Array<Lobby> = [];

const findLobbyWithID = (searchID: string) => {
  return lobbies.find((lobby) => lobby.id == searchID);
};

const myCustomDictionary = [
  "pizza",
  "chocolate",
  "syrup",
  "soccer",
  "hockey",
  "donkey",
  "chess",
  "pasta",
  "candy",
  "water",
  "fire",
  "prisma",
  "cyclone",
  "tornado",
  "ice",
  "brilliant",
  "alpha",
  "alfa",
  "bravo",
  "charlie",
  "delta",
  "echo",
  "foxtrot",
  "golf",
  "hotel",
  "india",
  "juliett",
  "kilo",
  "lima",
  "mike",
  "november",
  "oscar",
  "papa",
  "quebec",
  "romeo",
  "sierra",
  "tango",
  "uniform",
  "victor",
  "whiskey",
  "x-ray",
  "yankee",
  "zulu",
];

const createLobby = () => {
  let users: Array<User> = [];
  let chatMessages: Array<ChatMessage> = [];

  // pick a random word from the dictionary
  let randomName = "";
  // keep picking until its a unique lobby id
  do {
    randomName =
      myCustomDictionary[~~(Math.random() * myCustomDictionary.length)];
  } while (
    lobbies.findIndex((existingLobby) => existingLobby.id == randomName) != -1
  );

  lobbies.push({
    id: randomName,
    name: "Lobby " + randomName.charAt(0).toUpperCase() + randomName.slice(1),
    users: users,
    chatMessages: chatMessages,
    isPublic: false,
    isInGame: false,
    game: {
      timeLeft: 0,
      currentAnswerer: undefined,
      currentQuestion: undefined,
      gameStage: GameStage.Countdown,
    },
  });
  return randomName;
};

const getPublicLobbies = () => {
  let ans: Array<Lobby> = [];
  lobbies.forEach((thisLobby) => {
    if (thisLobby.isPublic) ans.push(thisLobby);
  });
  return ans;
};

const joinLobby = (thisSocket: Socket, lobbyID: string) => {
  if (lobbyID == null) return; // make sure the lobbyID isnt null

  // make sure the lobbyID actually exists in the lobbies list
  const thisLobby = findLobbyWithID(lobbyID);
  if (thisLobby == null) {
    thisSocket.emit("joinLobbyError", "It looks like this lobby doesn't exist");
    return;
  }

  // create the new user
  const newUser: User = {
    username: "User" + thisLobby.users.length,
    displayName: "User" + thisLobby.users.length,
    lobbyID: thisLobby.id,
    socketID: thisSocket.id,
    hasSetName: false,
    usernameConflictIndex: 0,
    isReady: false,
    isLeader: thisLobby.users.length == 0,
    isSpectator: false,
  };

  // add them to the user list
  thisLobby.users.push(newUser);

  // subscribe them to the corresponding lobby room
  thisSocket.join(thisLobby.id);

  sendMessage(thisLobby.id, {
    message: "Someone has joined and is picking their username right now...",
    timestamp: dayjs(),
    isServer: true,
  });

  // update everyone's lobby object with the newest changes
  emitLobbyEvent(thisSocket, lobbyID, "updateLobby", thisLobby);

  // refresh everyone's lobbies list
  io.emit("updatePublicLobbyList", getPublicLobbies());
};

const MAX_CHAT_MESSAGES = 15;
const sendMessage = (lobbyID: string, msg: ChatMessage) => {
  const thisLobby = findLobbyWithID(lobbyID);

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
  lobbyID: string,
  eventName: string,
  params
) => {
  io.to(lobbyID).emit(eventName, params);
  thisSocket.emit(eventName, params);
};

// on connect
io.on("connection", (socket: Socket) => {
  // to just this client
  // socket.emit("message", "hello")

  // to everyone but the client
  // socket.broadcast.emit("message", "hello");

  // to everyone
  // io.emit("message", "hello")

  socket.emit("updatePublicLobbyList", getPublicLobbies());

  socket.on("createLobby", () => {
    const newLobbyID = createLobby();
    // send back to the client the new id, so they can join it
    socket.emit("lobbyCreated", newLobbyID);
  });

  socket.on("joinLobby", (lobbyID: string) => {
    joinLobby(socket, lobbyID);
  });

  socket.on("sendMessage", (lobbyID: string, message: string, sender: User) => {
    sendMessage(lobbyID, {
      message: message,
      timestamp: dayjs(),
      isServer: false,
      user: sender,
    });

    const thisLobby = findLobbyWithID(lobbyID);

    // send this to everyone in the room
    emitLobbyEvent(socket, lobbyID, "updateLobby", thisLobby);
  });

  socket.on("refetchPublicLobbyList", () => {
    socket.emit("updatePublicLobbyList", getPublicLobbies());
  });

  const getUserReference = (user: User) => {
    // find the user in the lobby user list
    if (user == null) return null;
    const thisLobby = findLobbyWithID(user.lobbyID);
    return thisLobby.users.find(
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
    const thisLobby = findLobbyWithID(user.lobbyID);
    thisLobby.users.forEach((thisUser) => {
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
    emitLobbyEvent(socket, theUser.lobbyID, "updateLobby", thisLobby);
  });

  const leaveLobby = (thisSocket: Socket) => {
    // search through lobbies for this user
    lobbies.forEach((lobby, lobbyIdx) => {
      lobby.users.forEach((user, userIdx) => {
        if (user.socketID == thisSocket.id) {
          // remove the user from lobby if the socket id matches
          lobby.users.splice(userIdx, 1);

          // give the the next user the lobby leader permission
          if (lobby.users.length > 0) {
            lobby.users[0].isLeader = true;
          }

          // send a server message that someone has left
          sendMessage(lobby.id, {
            message: user.displayName + " has left the lobby!",
            timestamp: dayjs(),
            isServer: true,
          });

          // tell everyone in the room to get the newest changes (except the guy leaving)
          thisSocket.to(lobby.id).emit("updateLobby", lobby);

          // leave the room
          thisSocket.leave(lobby.id);

          // if this lobby no longer has people, recycle it (delete it)
          if (lobby != null && lobby.users.length == 0) {
            lobbies.splice(lobbyIdx, 1);
          }
          // tell everyone  to update the lobby list
          io.emit("updatePublicLobbyList", getPublicLobbies());
        }
      });
    });
  };

  socket.on("setReady", (user: User, isReady: boolean) => {
    const theUser = getUserReference(user);
    theUser.isReady = isReady;

    const thisLobby = findLobbyWithID(user.lobbyID);

    // tell everyone in the lobby to update their lobby object
    emitLobbyEvent(socket, theUser.lobbyID, "updateLobby", thisLobby);
  });

  socket.on("setIsSpectator", (user: User, isSpectator: boolean) => {
    const thisUser = getUserReference(user);
    thisUser.isSpectator = isSpectator;

    // tell everyone in the lobby to update their lobby object
    emitLobbyEvent(
      socket,
      user.lobbyID,
      "updateLobby",
      findLobbyWithID(user.lobbyID)
    );
  });
  socket.on("setLobbyPublic", (lobbyID: string, isPublic: boolean) => {
    const thisLobby = findLobbyWithID(lobbyID);
    thisLobby.isPublic = isPublic;

    // tell everyone in the lobby to update their lobby object
    emitLobbyEvent(socket, lobbyID, "updateLobby", thisLobby);

    // refresh everyone's lobbies list
    io.emit("updatePublicLobbyList", getPublicLobbies());
  });

  socket.on("startGame", (lobbyID: string) => {
    const thisLobby = findLobbyWithID(lobbyID);
    thisLobby.isInGame = true;
    // tell everyone in the lobby to update their lobby object
    emitLobbyEvent(socket, lobbyID, "updateLobby", thisLobby);
  });

  socket.on("leaveLobby", () => {
    leaveLobby(socket);
  });
  socket.on("disconnect", () => {
    leaveLobby(socket);
  });
});

// app.use(
//   express.static(path.join(__dirname, "../client/out"), {
//     // index: false,
//     extensions: ["html"],
//   })
// );

app.get("/lobby/:lobbyID", (req, res) => {
  const filePath = "[slug].html";
  res.sendFile(filePath, { root: "../client/out/lobby/" });
});

server.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
