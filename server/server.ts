import express, { Application } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import cors from "cors";
import session from "express-session";
require("dotenv").config();

import {
  ChatMessage,
  Lobby,
  User,
  TriviaQuestion,
  RevealResult,
} from "@shared/types";

import {
  answeringDuration,
  bettingDuration,
  revealDuration,
  gameoverDuration,
} from "../shared/globalVariables";

import dayjs from "dayjs";
import fetch from "node-fetch";

declare module "express-session" {
  interface SessionData {
    isAdmin: boolean;
  }
}

try {
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

  // for admin purposes
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  // fetch from the trivia json file
  let triviaQuestions: Array<TriviaQuestion> = [];

  const TRIVIA_ENDPOINT =
    "https://troygamedev.github.io/trivia-game-data/questions.json";

  const shuffle = require("shuffle-array");

  const fetchTriviaQuestions = async () => {
    try {
      // clear the old list
      triviaQuestions = [];

      // read the json file and push them into the array as TriviaQuestion objects
      const response = await fetch(TRIVIA_ENDPOINT);
      const json = await response.json();

      json.list.forEach((item) => {
        triviaQuestions.push({
          question: item.question,
          wrongChoices: item.choices,
          answer: item.answer,
          allChoicesRandomized: undefined,
          correctAnswerIndex: -1,
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

  const myCustomDictionary = [
    "thunder",
    "phoenix",
    "astro",
    "ivory",
    "mercury",
    "neon",
    "velvet",
    "quest",
    "valley",
    "bridge",
    "north",
    "east",
    "south",
    "west",
    "chocolate",
    "prisma",
    "cyclone",
    "tornado",
    "ice",
    "brilliant",
    "alpha",
    "bravo",
    "charlie",
    "delta",
    "echo",
    "foxtrot",
    "kilo",
    "lima",
    "november",
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
  const leaveLobby = (thisSocket: Socket) => {
    // search through lobbies for this user
    lobbies.forEach((lobby, lobbyIdx) => {
      lobby.users.forEach((user, userIdx) => {
        if (user.socketID == thisSocket.id) {
          // remove the user from lobby if the socket id matches
          lobby.users.splice(userIdx, 1);

          // remove the player from the player list (if they are in there)
          const playerIndex = lobby.players.findIndex(
            (player) => player.socketID === user.socketID
          );
          if (playerIndex !== -1) {
            lobby.players.splice(playerIndex, 1);
          }

          // give the next user the lobby leader permission
          if (lobby.users.length > 0) {
            lobby.users[0].isLeader = true;
          }

          // send a server message that someone has left
          sendMessage(
            lobby.id,
            {
              message: user.displayName + " has left the lobby!",
              timestamp: dayjs(),
              isServer: true,
            },
            thisSocket
          );

          // tell everyone in the room to get the newest changes (except the guy leaving)
          emitLobbyEvent(thisSocket, lobby.id, "updateLobby", lobby);

          // leave the room
          thisSocket.leave(lobby.id);

          // if this lobby no longer has people, recycle it (delete it)
          if (lobby != null && lobby.users.length == 0) {
            lobbies.splice(lobbyIdx, 1);
          }
          // tell everyone  to update the lobby list
          io.emit("updatePublicLobbyList", getPublicLobbies());

          updateNumInGame();
        }
      });
    });
  };
  const findLobbyWithID = (searchID: string, thisSocket: Socket) => {
    const targetLobby = lobbies.find((lobby) => lobby.id == searchID);
    if (targetLobby === undefined) {
      thisSocket.emit(
        "joinLobbyError",
        "It looks like this lobby doesn't exist anymore"
      );
      thisSocket.emit("updateLobby", undefined);
    }
    return targetLobby;
  };

  const createLobby = () => {
    let users: Array<User> = [];
    let players: Array<User> = [];
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
      players: players,
      chatMessages: chatMessages,
      isPublic: false,
      isInGame: false,
      game: {
        timeLeft: 0,
        fullTimeDuration: answeringDuration,
        currentAnswerer: undefined,
        currentQuestion: undefined,
        gameStage: "Countdown",
        roundsCompleted: 0,
        totalRoundsUntilGameover: 0,
        revealResults: [],
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
  const updateNumInGame = () => {
    let num = 0;
    lobbies.forEach((lobby) => {
      num += lobby.users.length;
    });
    io.emit("numInGameChanged", num);
  };

  const joinLobby = (thisSocket: Socket, lobbyID: string) => {
    if (lobbyID == null) return; // make sure the lobbyID isnt null

    // make sure the lobbyID actually exists in the lobbies list
    const thisLobby = findLobbyWithID(lobbyID, thisSocket);
    if (thisLobby === undefined) {
      thisSocket.emit(
        "joinLobbyError",
        "It looks like this lobby doesn't exist anymore"
      );
      return;
    }

    // create the new user
    const newUser: User = {
      username: "Joining...",
      displayName: "Joining...",
      lobbyID: thisLobby.id,
      socketID: thisSocket.id,
      hasSetName: false,
      usernameConflictIndex: 0,
      isReady: false,
      isLeader: thisLobby.users.length == 0,
      isSpectator: false,
      money: 1000,
      bet: 0,
      guessIndex: -1,
      wantsToSkip: false,
      amKicked: false,
    };

    // add them to the user list
    thisLobby.users.push(newUser);
    // add them to the players list
    if (!thisLobby.isInGame) {
      thisLobby.players.push(newUser);
    } else {
      newUser.isSpectator = true;
    }

    // subscribe them to the corresponding lobby room
    thisSocket.join(thisLobby.id);

    sendMessage(
      thisLobby.id,
      {
        message: "Someone has connected... picking their username right now...",
        timestamp: dayjs(),
        isServer: true,
      },
      thisSocket
    );

    // update everyone's lobby object with the newest changes
    emitLobbyEvent(thisSocket, lobbyID, "updateLobby", thisLobby);

    // refresh everyone's lobbies list
    io.emit("updatePublicLobbyList", getPublicLobbies());

    updateNumInGame();
  };

  const MAX_CHAT_MESSAGES = 30;

  const Filter = require("bad-words"),
    filter = new Filter();

  const sendMessage = (
    lobbyID: string,
    msg: ChatMessage,
    thisSocket: Socket
  ) => {
    const thisLobby = findLobbyWithID(lobbyID, thisSocket);
    if (thisLobby === undefined) {
      return;
    }

    // profanity filter
    msg.message = filter.clean(msg.message);

    if (thisLobby != undefined) {
      //send a chat message
      thisLobby.chatMessages.push(msg);

      // make sure the number of chat messages don't exceed the limit
      if (thisLobby.chatMessages.length > MAX_CHAT_MESSAGES) {
        thisLobby.chatMessages.shift();
      }
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
    updateNumInGame();

    socket.on("createLobby", () => {
      const newLobbyID = createLobby();
      // send back to the client the new id, so they can join it
      socket.emit("lobbyCreated", newLobbyID);
    });

    socket.on("joinLobby", (lobbyID: string) => {
      joinLobby(socket, lobbyID);
    });

    socket.on(
      "sendMessage",
      (lobbyID: string, message: string, sender: User) => {
        sendMessage(
          lobbyID,
          {
            message: message,
            timestamp: dayjs(),
            isServer: false,
            user: sender,
          },
          socket
        );

        const thisLobby = findLobbyWithID(lobbyID, socket);
        if (thisLobby === undefined) {
          return;
        }

        // send this to everyone in the room
        emitLobbyEvent(socket, lobbyID, "updateLobby", thisLobby);
      }
    );

    socket.on("refetchPublicLobbyList", () => {
      socket.emit("updatePublicLobbyList", getPublicLobbies());
    });

    const getUserReference = (user: User) => {
      // find the user in the lobby user list
      if (user == undefined) return undefined;
      const thisLobby = findLobbyWithID(user.lobbyID, socket);
      if (thisLobby == undefined) return undefined;
      return thisLobby.users.find(
        (thisUser) => thisUser.socketID == user.socketID
      );
    };

    socket.on("setUsername", (user: User, newUsername: string) => {
      // find the user in the lobby user list
      const theUser = getUserReference(user);
      if (theUser === undefined) return;

      // set the new name and mark as set
      theUser.username = newUsername;
      theUser.hasSetName = true;

      // check if this username conflicts with anyone else in the lobby
      // if there is the same name, just append an index

      // find the guy with the largest conflict index that also has the same conflicting name
      // ex: Bob0, Bob1, Bob2 <-- find Bob2
      let biggestConflictingIndex = 0;
      let thisNameIsADuplicate = false;
      const thisLobby = findLobbyWithID(user.lobbyID, socket);
      if (thisLobby === undefined) return;

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
      sendMessage(
        theUser.lobbyID,
        {
          message: theUser.displayName + " has joined the lobby!",
          timestamp: dayjs(),
          isServer: true,
        },
        socket
      );

      // tell everyone in the lobby to update their lobby object
      emitLobbyEvent(socket, theUser.lobbyID, "updateLobby", thisLobby);
    });

    socket.on("setReady", (user: User, isReady: boolean) => {
      const theUser = getUserReference(user);
      if (theUser === undefined) return;
      theUser.isReady = isReady;

      const thisLobby = findLobbyWithID(user.lobbyID, socket);
      if (thisLobby === undefined) return;

      // tell everyone in the lobby to update their lobby object
      emitLobbyEvent(socket, theUser.lobbyID, "updateLobby", thisLobby);
    });

    socket.on("setIsSpectator", (user: User, isSpectator: boolean) => {
      const thisUser = getUserReference(user);
      if (thisUser === undefined) return;
      thisUser.isSpectator = isSpectator;

      const thisLobby = findLobbyWithID(user.lobbyID, socket);
      if (thisLobby === undefined) return;

      // helper function
      const findIndexOfUserInPlayersList = () => {
        return thisLobby.players.findIndex((searchUser) => {
          return searchUser.socketID === thisUser.socketID;
        });
      };

      // add/remove them from the players list
      if (isSpectator) {
        // find and remove this user from the player list
        thisLobby.players.splice(findIndexOfUserInPlayersList(), 1);
      } else {
        // add this user to the player list
        // check for duplicate just in case
        if (findIndexOfUserInPlayersList() === -1) {
          thisLobby.players.push(thisUser);
        }
      }

      thisUser.isReady = false;

      // tell everyone in the lobby to update their lobby object
      emitLobbyEvent(socket, user.lobbyID, "updateLobby", thisLobby);
    });
    socket.on("setLobbyPublic", (lobbyID: string, isPublic: boolean) => {
      const thisLobby = findLobbyWithID(lobbyID, socket);
      if (thisLobby === undefined) return;

      thisLobby.isPublic = isPublic;

      // tell everyone in the lobby to update their lobby object
      emitLobbyEvent(socket, lobbyID, "updateLobby", thisLobby);

      // refresh everyone's lobbies list
      io.emit("updatePublicLobbyList", getPublicLobbies());
    });

    socket.on("startGame", (lobbyID: string) => {
      const thisLobby = findLobbyWithID(lobbyID, socket);
      if (thisLobby === undefined) return;
      thisLobby.isInGame = true;
      thisLobby.game.roundsCompleted = 0;

      // set everyones balance to default 1000
      thisLobby.players.forEach((player) => {
        player.money = 1000;
      });

      // countdown until timeLeft hits 0
      const countdown = (
        callbackWhenComplete: () => void,
        duration: number
      ) => {
        thisLobby.game.timeLeft = duration;
        thisLobby.game.fullTimeDuration = duration;

        // reset everyones vote to skip to false
        thisLobby.players.forEach((player) => {
          player.wantsToSkip = false;
        });

        // tell everyone in the lobby to update their lobby object
        emitLobbyEvent(socket, lobbyID, "updateLobby", thisLobby);

        const tick = () => {
          // check if there are even players
          if (
            thisLobby.game.gameStage !== "GameOver" &&
            thisLobby.players.length <= 1
          ) {
            startGameOverStage();
            return;
          }

          // if the countdown is finished or if everyone wants to skip
          const everyoneWantsToSkip =
            thisLobby.players.filter((p) => p.wantsToSkip).length ===
            thisLobby.players.length;

          if (thisLobby.game.timeLeft <= 0 || everyoneWantsToSkip) {
            // make sure this game is still ongoing (if the lobby is gone or if all but 1 player left, end the game)
            if (
              (findLobbyWithID(lobbyID, socket) != undefined &&
                thisLobby.players.length > 1) ||
              (thisLobby.players.length == 1 &&
                thisLobby.game.gameStage === "GameOver")
            ) {
              callbackWhenComplete();
            } else {
              startGameOverStage();
            }
          } else {
            thisLobby.game.timeLeft--;

            // call itself again after 1 second
            setTimeout(tick, 1000);
          }
          // tell everyone in the lobby to update their lobby object
          emitLobbyEvent(socket, lobbyID, "updateLobby", thisLobby);
        };
        setTimeout(tick, 1000);
      };

      // start the countdown, then set the game to "answering phase" when it finishes counting down
      thisLobby.game.gameStage = "Countdown";
      countdown(() => {
        startAnsweringStage();
      }, 3);

      // create an array that will determine the random order of which the trivia questions are picked
      // ex: [3, 12, 4, 0, 2, 8, ...] will pick triviaQuestions[3] as the first question, and so on...
      let randomIndexesArray: Array<number> = [];
      // first fill this array with all the triviaQuestions (copy it over)
      for (let i = 0; i < triviaQuestions.length; i++) {
        randomIndexesArray.push(i);
      }
      // then, shuffle this array of [0,1,2,3,4,5... triviaQuestions.length-1]
      shuffle(randomIndexesArray);

      const startAnsweringStage = () => {
        thisLobby.game.gameStage = "Answering";

        thisLobby.game.currentAnswerer =
          thisLobby.players[
            thisLobby.game.roundsCompleted % thisLobby.players.length
          ];

        const currentQuestion =
          triviaQuestions[
            randomIndexesArray[
              thisLobby.game.roundsCompleted % randomIndexesArray.length
            ]
          ];
        thisLobby.game.currentQuestion = currentQuestion;

        thisLobby.game.currentAnswerer.guessIndex = -1; // reset their guess

        // shuffle the choices
        const allChoices = currentQuestion.wrongChoices.concat(
          currentQuestion.answer
        );
        shuffle(allChoices);
        thisLobby.game.currentQuestion.allChoicesRandomized = allChoices;
        thisLobby.game.currentQuestion.correctAnswerIndex =
          allChoices.findIndex((str) => str === currentQuestion.answer);

        // start the betting stage after answeringDuration seconds
        countdown(() => {
          startBettingStage();
        }, answeringDuration);
      };

      const startBettingStage = () => {
        thisLobby.game.gameStage = "Betting";
        // reset everyone's bets
        thisLobby.players.forEach((player) => {
          player.bet = 0;
        });

        // start the reveal stage after bettingDuration seconds
        countdown(() => {
          startRevealStage();
        }, bettingDuration);
      };

      const startRevealStage = () => {
        thisLobby.game.gameStage = "Reveal";

        // logs every gain and loss, will be displayed on everyone's screen
        let revealResults: Array<RevealResult> = [];

        // adds a new entry into revealResults if this user doesnt exist in the logs yet; updates the entry if they do
        // also actually adds / subtracts from their balance
        const logGain = (who: User, amount: number) => {
          who.money += amount;

          // find this user in the revealResults
          const thisUserIndex = revealResults.findIndex(
            (result) => result.who.socketID === who.socketID
          );
          if (thisUserIndex === -1) {
            revealResults.push({ who: who, netGain: amount });
          } else {
            revealResults[thisUserIndex].netGain += amount;
          }
        };

        const theAnswerer = thisLobby.game.currentAnswerer;

        // if the answerer guessed correctly
        let wasCorrect =
          theAnswerer.guessIndex ===
          thisLobby.game.currentQuestion.correctAnswerIndex;

        if (wasCorrect) {
          logGain(theAnswerer, 1000);
        }
        // loop through each player to see how much they bet (how much they win or lose)

        thisLobby.players.forEach((player) => {
          // if it's NOT the answerer
          if (player.socketID !== theAnswerer.displayName) {
            // they actually made a bet
            if (player.bet !== 0) {
              // add / deduct their balance for their bet
              if (wasCorrect) {
                logGain(player, -player.bet);
                logGain(theAnswerer, player.bet);
              } else {
                logGain(player, player.bet);
                logGain(theAnswerer, -player.bet);
              }
            }
          }
        });

        // sort the results
        revealResults.sort((a, b) => b.netGain - a.netGain);

        thisLobby.game.revealResults = revealResults;

        countdown(() => {
          // check if game is over
          if (
            thisLobby.game.roundsCompleted >=
            thisLobby.game.totalRoundsUntilGameover - 1
          ) {
            startGameOverStage();
          } else {
            thisLobby.game.roundsCompleted++;
            startAnsweringStage();
          }
        }, revealDuration);
      };

      const startGameOverStage = () => {
        thisLobby.game.gameStage = "GameOver";
        countdown(() => {
          resetGame();
        }, gameoverDuration);
      };

      const resetGame = () => {
        // do some resetting
        thisLobby.isInGame = false;
        // set everyone to unready
        thisLobby.users.forEach((user) => {
          user.isReady = false;
        });
        // tell everyone in the lobby to update their lobby object
        emitLobbyEvent(socket, lobbyID, "updateLobby", thisLobby);
      };
    });

    socket.on("guessAnswer", (guesser: User, index: number) => {
      const thisUser = getUserReference(guesser);
      if (thisUser === undefined) return;
      const thisLobby = findLobbyWithID(thisUser.lobbyID, socket);

      thisUser.guessIndex = index;

      // tell this user to update their lobby object
      socket.emit("updateLobby", thisLobby);
    });

    socket.on("placeBet", (bettor: User, amount: number) => {
      const thisUser = getUserReference(bettor);
      if (thisUser === undefined) return;
      const thisLobby = findLobbyWithID(thisUser.lobbyID, socket);

      thisUser.bet = amount;

      // tell this user to update their lobby object
      socket.emit("updateLobby", thisLobby);
    });

    socket.on("setTotalRounds", (lobbyID: string, rounds: number) => {
      const thisLobby = findLobbyWithID(lobbyID, socket);
      if (thisLobby != undefined) {
        thisLobby.game.totalRoundsUntilGameover = rounds;
      }
      socket.emit("updateLobby", thisLobby);
    });

    socket.on("wantSkip", (who: User) => {
      const thisUser = getUserReference(who);
      if (thisUser === undefined) return;
      const thisLobby = findLobbyWithID(thisUser.lobbyID, socket);
      thisUser.wantsToSkip = true;
      emitLobbyEvent(socket, thisLobby.id, "updateLobby", thisLobby);
    });

    socket.on("kickPlayer", (userToKick: User) => {
      try {
        const thisUser = getUserReference(userToKick);
        if (thisUser === undefined) return;
        const thisLobby = findLobbyWithID(thisUser.lobbyID, socket);
        thisUser.amKicked = true;
        emitLobbyEvent(socket, thisLobby.id, "updateLobby", thisLobby);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("leaveLobby", () => {
      leaveLobby(socket);
    });
    socket.on("disconnect", () => {
      leaveLobby(socket);
    });
  });

  app.use(
    express.static(path.join(__dirname, "../client/out"), {
      // index: false,
      extensions: ["html"],
    })
  );

  app.get("/lobby/:lobbyID", (req, res) => {
    const filePath = "[slug].html";
    res.sendFile(filePath, { root: "../client/out/lobby/" });
  });

  app.post("/api/admin/login", (req, res) => {
    try {
      const { password } = req.body;
      if (password == process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.status(200);
      } else {
        res.status(403);
      }
      res.send("received");
    } catch (err) {
      console.error(err);
    }
  });
  app.post("/api/admin/lobbies", (req, res) => {
    try {
      if (req.session.isAdmin) {
        res.send({ lobbies: lobbies });
      } else {
        res.status(403);
        res.send([]);
      }
    } catch (err) {
      console.error(err);
    }
  });
  app.post("/api/admin/shutdown", (req, res) => {
    try {
      if (req.session.isAdmin) {
        const { id } = req.body;
        // find and delete the lobby
        const index = lobbies.findIndex((lobby) => lobby.id === id);
        lobbies.splice(index, 1);
      } else {
        res.status(403);
      }
      res.send("received");
    } catch (err) {
      console.error(err);
    }
  });

  server.listen(PORT, () => {
    console.log(`server has started on port ${PORT}`);
  });
} catch (err) {
  console.error(err);
  process.exit(1);
}
