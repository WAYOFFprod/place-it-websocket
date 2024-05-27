const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  console.log("user connected");
  socket.on('new-pixel', (position, color) => {
    console.log('color:', color);
    socket.broadcast.emit('new-pixel-from-others',position, color);
  });
});




server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});