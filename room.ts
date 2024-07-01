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
  socket.on("join", ({ username, room }) => {
    socket.username = username;
    socket.join(room);
    console.log("🚀 ~ socket.on ~ room:", room);
    socket.broadcast
      .to(room)
      .emit("join", { socketId: socket.id, username, room });
  });

  socket.on("ping", ({ room }) => {
    const username = socket.username;
    if (username) {
      socket.broadcast
        .to(room)
        .emit("ping", { username, private: false, room });
    }
  });

  socket.on("private-ping", ({ pingedSocketId, room }) => {
    const targetSocket = io.sockets.sockets.get(pingedSocketId);
    targetSocket?.emit("ping", {
      username: socket.username,
      private: true,
      room,
    });
  });
});
