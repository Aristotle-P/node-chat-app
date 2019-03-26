const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

let count = 0;

io.on('connection', socket => {
  console.log('New websocket connection');

  socket.emit('message', 'Welcome!');
  socket.broadcast.emit('message', 'A new user has joined!');

  socket.on('sendMessage', text => {
    io.emit('message', text);
  });

  socket.on('sendLocation', location => {
    io.emit(
      'message',
      `Location: https://google.com/maps?q=${location.lat},${location.long}`
    );
  });

  socket.on('disconnect', () => {
    io.emit('message', 'A user has disconnected from chat.');
  });
});

server.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
