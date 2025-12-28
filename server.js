const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = new Map();

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);
  
  socket.on('join', (username) => {
    users.set(socket.id, username);
    io.emit('user-joined', { username, userId: socket.id });
  });
  
  socket.on('message', (data) => {
    io.emit('message', {
      username: users.get(socket.id),
      message: data.message,
      timestamp: new Date()
    });
  });
  
  socket.on('typing', () => {
    socket.broadcast.emit('user-typing', users.get(socket.id));
  });
  
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    io.emit('user-left', { username, userId: socket.id });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});