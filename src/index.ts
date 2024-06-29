// src/index.js
import express, { Request, Response } from "express";

import dotenv from "dotenv";
import redisApp from "./helpers/redisApp";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import ServerRequests from "./helpers/serverRequest";
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


let canvaControllers: {[key:string]: CanvaController } = {};
let chatControllers: {[key:string]: ChatController} = {};

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
  

  socket.on("disconnect", (reason) => {
    if(canvaId == undefined) return;
    canvaControllers[canvaId].disconnect();
    chatControllers[canvaId].disconnect();
    socket.leave("canva-"+canvaId)
    console.log("disconnected:", reason)
  });

  socket.on('error', () => {
    console.log("can send back")
  })

  socket.on('join-room', (data) => {
    console.log("join-room", 'canva-'+canvaId, data)
    if(canvaId != undefined) {
      socket.leave("canva-"+canvaId)
    }
    canvaId  = data.canvaId;
    socket.join('canva-'+canvaId);
    if(canvaId != undefined) {
      if(!(canvaId in canvaControllers))  {
        chatControllers[canvaId] = new ChatController(canvaId, socket)
        canvaControllers[canvaId] = new CanvaController(canvaId, socket)
        console.log("created room:", canvaId);
      } else {
        canvaControllers[canvaId].connect(socket);
        chatControllers[canvaId].connect(socket);
        console.log("Joined room:", canvaId);
      }
    }
  })
});

const save = () => {
  console.log("saving count:", Object.keys(canvaControllers).length )
  let toDelete: string[] = [];
  for (const [id, canvaController] of Object.entries(canvaControllers)) {
    console.log("USER COUNT", canvaController.users, "for:",id)
    canvaController.savePixelsToDb();
    if(canvaController.users <= 0) {
      toDelete.push(id);
    }
  };

  // cleanup
  toDelete.forEach(id => {
    delete canvaControllers[id];
  });
}

setInterval(save, 5000);