// src/index.js
import express, { Request, Response } from "express";
import { createClient } from 'redis';
import dotenv from "dotenv";
import redisApp from "./helpers/redisApp";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import ServerRequests from "./helpers/serverRequest";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  }
});

const serverRequest = new ServerRequests()

const redis = new redisApp();

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server 2");
});

const savePixels = async (payload: PixelsPayload) => {
  const response = await serverRequest.post("/place-pixel", payload)
  return response.status == 'success';
}

function doSomething() {
    redis.saveEntries(1, savePixels);
}

setInterval(doSomething, 5000);


io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

io.on('connection', (socket) => {
  console.log("user connected", socket.id);

  socket.on('new-pixel', (index: number, position: Coord, color: string) => {
    socket.broadcast.emit('new-pixel-from-others', position, color);
    
    let payload: PixelsPayload = {
      id: 1,
      pixels: {}
    };
    payload.pixels[index] = color;

    redis.saveEntry(payload)
    return payload
  })

  socket.on("disconnect", (reason) => {
    console.log("disconnected:", reason)
  });

  socket.on('reset', () => {
    socket.broadcast.emit('reset-others');
  })

  socket.on('error', () => {
    console.log("can send back")
  })

  socket.on('get-pixels', async () => {
    const payload = await redis.getEntries(1);
    socket.emit("init-pixels", payload)
  })
});