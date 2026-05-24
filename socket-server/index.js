const io = require('socket.io')(3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = new Map(); // Map of socketId to user info
const rooms = new Map(); // Map of roomId to Set of userIds

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, userId, userName }) => {
    console.log(`User ${userName} (${userId}) attempting to join room ${roomId}`);
    
    // Store user info
    users.set(socket.id, { userId, userName, roomId });
    
    // Add user to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    const roomUsers = rooms.get(roomId);
    roomUsers.add(userId);
    
    // Notify others in the room about the new user
    socket.to(roomId).emit('user-joined', { userId, userName });
    
    // Join the socket room
    socket.join(roomId);
    
    console.log(`User ${userName} joined room ${roomId}. Users in room: ${roomUsers.size}`);
  });

  socket.on('signal', ({ roomId, userId, signal }) => {
    // Forward signal to others in the room (except sender)
    socket.to(roomId).emit('signal', { userId, signal });
  });

  socket.on('leave-room', ({ roomId, userId }) => {
    // Remove user from room
    if (rooms.has(roomId)) {
      const roomUsers = rooms.get(roomId);
      roomUsers.delete(userId);
      
      // Notify others in the room
      socket.to(roomId).emit('user-left', { userId });
      
      // Clean up empty rooms
      if (roomUsers.size === 0) {
        rooms.delete(roomId);
      }
    }
    
    // Leave the socket room
    socket.leave(roomId);
    
    console.log(`User ${userId} left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const { roomId, userId, userName } = user;
      
      // Remove user from room
      if (rooms.has(roomId)) {
        const roomUsers = rooms.get(roomId);
        roomUsers.delete(userId);
        
        // Notify others in the room
        socket.to(roomId).emit('user-left', { userId });
        
        // Clean up empty rooms
        if (roomUsers.size === 0) {
          rooms.delete(roomId);
        }
      }
      
      // Remove user from map
      users.delete(socket.id);
      
      console.log(`User ${userName} disconnected from room ${roomId}`);
    } else {
      console.log('User disconnected (no user info):', socket.id);
    }
  });
});

console.log('Socket.IO server running on port 3001');