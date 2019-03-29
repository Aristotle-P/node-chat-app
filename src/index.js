const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');

const {
  generateMessage,
  generateLocationMessage
} = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

let count = 0;

io.on('connection', socket => {
  console.log('New websocket connection');

  socket.emit('message', generateMessage('Welcome!'));
  socket.broadcast.emit('message', generateMessage('A new user has joined!'));

  socket.on('sendMessage', (text, callback) => {
    const filter = new Filter();

    if (filter.isProfane(text)) {
      return callback('Watch your profanity.');
    }
    io.emit('message', generateMessage(text));
    callback();
  });

  socket.on('sendLocation', (location, callback) => {
    io.emit(
      'locationMessage',
      generateLocationMessage(
        `https://google.com/maps?q=${location.lat},${location.long}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has disconnected from chat.'));
  });
});

server.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
