// src/index.js
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
// import axios, { AxiosResponse } from "axios";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
// app.use(cors())
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  }
});
// console.log(io);

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

// const client = axios.create({
//   baseURL: process.env.SERVER_URL+'/api',
// });



server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server 2");
});


io.on('connection', (socket) => {
  console.log("user connected");
  socket.on('new-pixel', (position: any, color: any) => {
    console.log('color:', color);
    socket.broadcast.emit('new-pixel-from-others',position, color);
    const k = position.x + (position.y * position.x);
    const pixels: any = {};
    pixels[k] = 1;
    payload.pixels = pixels ;
    console.log(payload);
    // axios.post("/place-pixel", payload)
    //   .then((response: AxiosResponse) => {
    //     console.log(response);
    //   })
  })
});