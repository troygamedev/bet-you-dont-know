import express, { Application } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import cors from "cors";
const PORT = process.env.PORT || 5000;

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
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

// on connect
io.on("connection", (socket: Socket) => {
  socket.on("connect", () => {
    io.emit("connect", { message: "lets go" });
  });
});

server.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
