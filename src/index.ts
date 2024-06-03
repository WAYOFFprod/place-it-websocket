// src/index.js
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
import ServerRequests from "./helpers/serverRequest";

dotenv.config();

const port = process.env.PORT || 3000;
const serverUrl = "http://"+process.env.SERVER_URL || "http://localhost";

const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  }
});

console.log(serverUrl)

const serverRequest = new ServerRequests(serverUrl+"/api")

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



server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server 2");
});


io.on('connection', (socket) => {
  console.log("user connected", socket.id);
  console.log()
  socket.on('new-pixel', (index: number, position: Coord, color: string) => {
    console.log(position, color);
    socket.broadcast.emit('new-pixel-from-others', position, color);

    const pixels: any = {};
    pixels[index] = color;
    payload.pixels = pixels;

    serverRequest.post("/place-pixel", payload)
    
  })

  socket.on("disconnect", (reason) => {
    console.log("disconnected:", reason)
  });

  socket.on('reset', () => {
    socket.broadcast.emit('reset-others');
  })
});