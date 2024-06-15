// src/index.js
import express, { Request, Response } from "express";

import dotenv from "dotenv";
import redisApp from "./helpers/redisApp";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import ServerRequests from "./helpers/serverRequest";
import Canva from "./controllers/canva";
import Chat from "./controllers/chat";
import { PixelsPayload } from "./@types/types";
import ChatController from "./controllers/chat";
import CanvaController from "./controllers/canva";

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
let canvaController: CanvaController;
let chatController: ChatController;

let canvaId: number | undefined


server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server 2");
});

io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

io.on('connection', (socket) => {
  console.log("user connected", socket.id);
  canvaController = new Canva(socket)
  chatController = new Chat(socket)
  

  socket.on("disconnect", (reason) => {
    console.log("disconnected:", reason)
  });

  socket.on('error', () => {
    console.log("can send back")
  })

  socket.on('switch-room', (data) => {
    console.log("switch-room", data)
    if(canvaId == data.canvaId) return
    if(canvaId != undefined) {
      socket.leave("canva-"+data.canvaId)
    }
    socket.join("canva-"+data.canvaId)
    chatController.switchRoom("canva-"+data.canvaId)
    canvaController.switchRoom("canva-"+data.canvaId)
  })
});


const savePixels = async (payload: PixelsPayload) => {
  const response = await serverRequest.post("/place-pixel", payload)
  return response.status == 'success';
}

const save = () => {
  redis.saveEntries(1, savePixels);
  redis.cleanUp(0);
}

setInterval(save, 5000);