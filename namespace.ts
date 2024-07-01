import { Server, Socket } from "socket.io";

declare module "socket.io" {
  interface Socket {
    username: string;
  }
}

console.clear();
const io = new Server(3000, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ username }) => {
    socket.username = username;
    socket.broadcast.emit("join", { socketId: socket.id, username });
  });

  socket.on("ping", () => {
    const username = socket.username;
    if (username) {
      socket.broadcast.emit("ping", { username, private: false });
    }
  });

  socket.on("private-ping", ({ pingedSocketId }) => {
    const targetSocket = io.sockets.sockets.get(pingedSocketId);
    targetSocket?.emit("ping", { username: socket.username, private: true });
  });
});

io.of("vip").on("connection", (socket) => {
  socket.on("join", ({ username }) => {
    socket.username = username;
    socket.broadcast.emit("join", { socketId: socket.id, username });
  });

  socket.on("ping", () => {
    const username = socket.username;
    if (username) {
      socket.broadcast.emit("ping", { username, private: false });
    }
  });

  socket.on("private-ping", ({ pingedSocketId }) => {
    const targetSocket = io.of("vip").sockets.get(pingedSocketId);
    targetSocket?.emit("ping", { username: socket.username, private: true });
  });
});
