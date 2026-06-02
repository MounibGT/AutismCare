const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users = new Map();
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, userId, userName }) => {
    console.log(`User ${userName} (${userId}) joining room ${roomId}`);

    users.set(socket.id, { userId, userName, roomId });

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    const existingUsers = Array.from(rooms.get(roomId));

    rooms.get(roomId).add(userId);

    socket.join(roomId);

    socket.emit("all-users", existingUsers);

    socket.to(roomId).emit("user-joined", { userId, userName });

    console.log(
      `User ${userName} joined room ${roomId}. Users in room: ${rooms.get(roomId).size}`
    );
  });

  socket.on("signal", ({ roomId, userId, signal, senderUserId }) => {
    socket.to(roomId).emit("signal", {
      userId: senderUserId,
      signal,
    });
  });

  socket.on("leave-room", ({ roomId, userId }) => {
    if (rooms.has(roomId)) {
      const roomUsers = rooms.get(roomId);

      roomUsers.delete(userId);

      socket.to(roomId).emit("user-left", { userId });

      if (roomUsers.size === 0) {
        rooms.delete(roomId);
      }
    }

    socket.leave(roomId);

    users.delete(socket.id);

    console.log(`User ${userId} left room ${roomId}`);
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);

    if (user) {
      const { roomId, userId, userName } = user;

      if (rooms.has(roomId)) {
        const roomUsers = rooms.get(roomId);

        roomUsers.delete(userId);

        socket.to(roomId).emit("user-left", { userId });

        if (roomUsers.size === 0) {
          rooms.delete(roomId);
        }
      }

      users.delete(socket.id);

      console.log(`User ${userName} disconnected from room ${roomId}`);
    } else {
      console.log("User disconnected:", socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});