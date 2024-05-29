const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const axios = require('axios')

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});

let payload = {
  "id": 1,
  "pixels": {}
  // "pixels": {
  //     "0": 16,
  //     "1": 2,
  //     "2": 3,
  //     "3": 4,
  //     "4": 5,
  //     "5": 6,
  //     "6": 7,
  //     "7": 8,
  //     "8": 9,
  //     "9": 10,
  //     "10": 11,
  //     "11": 12,
  //     "12": 13,
  //     "13": 14,
  //     "14": 15,
  //     "15": 16,
  //     "20": 1,
  //     "21": 1
  // }
}

// axios.post("http://localhost/api/place-pixel", payload)
//   .then(res => {
//     console.log(res);
//   })

    

io.on('connection', (socket) => {
  console.log("user connected");
  socket.on('new-pixel', (position, color) => {
    console.log('color:', color, );
    socket.broadcast.emit('new-pixel-from-others',position, color);
    const k = position.x + (position.y * position.x);
    const pixels = {};
    pixels[k] = 1;
    payload.pixels = pixels ;
    console.log(payload);
    axios.post("http://localhost/api/place-pixel", payload)
      .then(res => {
        // console.log(res);
      })
  })
});




server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});