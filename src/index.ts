// src/index.js
import express, { NextFunction, Request, Response } from "express";

import dotenv from "dotenv";
import redisApp from "./helpers/redisApp";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import ServerRequests from "./helpers/serverRequest";
import Chat from "./controllers/chat";
import { PixelsPayload, ValidationPayload } from "./@types/types";
import ChatController from "./controllers/chat";
import CanvaController from "./controllers/canva";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
app.use(express.urlencoded())
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  }
});


let canvaControllers: {[key:string]: CanvaController } = {};
let chatControllers: {[key:string]: ChatController} = {};


server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server 2");
});

app.post("/server/join/", async (req: Request, res: Response, next: NextFunction) => {
  console.log("SERVER: new user joining room", req.body)
  // save token to correct room
  

  const validationPayload: ValidationPayload = {
    canva_id: req.body.canva_id,
    user_id: req.body.user_id,
    token: req.body.token
  }
  const redis = redisApp.getInstance();
  const isSaved = await redis.serverJoinCanva(validationPayload)
  res.send(isSaved);
});

io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

io.on('connection', (socket) => {
  console.log("user connected", socket.id);
  let canvaId: number | undefined

  socket.on("disconnect", (reason) => {
    if(!canvaId || !canvaControllers[canvaId]) return;
    canvaControllers[canvaId].disconnect();
    chatControllers[canvaId].disconnect();
    socket.leave("canva-"+canvaId)
    console.log("disconnected:", reason)
  });

  socket.on('error', () => {
    console.log("can send back")
  })

  socket.on('join-room', async (data) => {
    canvaId = data.canvaId;
    // validate token
    console.log("CLIENT: new user joining room", {
      canva_id: data.canvaId,
      user_id: data.userId,
      token: data.token
    })
    const redis = redisApp.getInstance();
    const isValid = await redis.isValid({
      canva_id: data.canvaId,
      user_id: data.userId,
      token: data.token
    } as ValidationPayload)

    if(isValid === false) {
      socket.emit('error',{
        'source': 'live-server',
        'message': 'user wont be allowed to place pixels',
        'status': 200
      });
      return;
    }
    if(isValid === null) {
      socket.emit('error',{
        'source': 'live-server',
        'message': 'user must not be authenticated',
        'status': 200
      });
    }
    
    console.log(data.userId, "joined", data.canvaId)
    if(canvaId != undefined) {
      socket.leave("canva-"+canvaId)
    }

    const userId = data.userId;
    const username = data.username
    canvaId  = data.canvaId;
    socket.join('canva-'+canvaId);
    
    if(canvaId != undefined) {
      // if canva exists
      if(!(canvaId in canvaControllers))  {
        // join existing controllers
        chatControllers[canvaId] = new ChatController(canvaId, socket, userId, username)
        canvaControllers[canvaId] = new CanvaController(canvaId, socket, userId, username)
        console.log("created room:", canvaId);
      } else {
        // create controllers
        canvaControllers[canvaId].connect(socket, userId, username);
        chatControllers[canvaId].connect(socket, userId, username);
        console.log("Joined room:", canvaId);
      }
    }

    socket.emit('live-canva-ready', canvaId);
  })
});

const save = () => {
  // console.log("saving count:", Object.keys(canvaControllers).length )
  let toDelete: string[] = [];
  for (const [id, canvaController] of Object.entries(canvaControllers)) {
    // console.log("USER COUNT", canvaController.users, "for:",id)
    canvaController.savePixelsToDb();
    if(canvaController.users <= 0) {
      
      toDelete.push(id);
    }
  };

  // cleanup canva
  toDelete.forEach(id => {
    delete canvaControllers[id];
    console.log("removed canva controller", id);
  });
}

setInterval(save, 5000);