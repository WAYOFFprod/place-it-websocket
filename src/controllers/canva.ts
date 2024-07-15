
import { Socket } from 'socket.io';
import {PixelsPayload, Coord} from '../@types/types'
import redisApp from '../helpers/redisApp';
import ServerRequests from '../helpers/serverRequest';
export default class CanvaController {
  redis
  serverRequest
  scope = "canva:"
  roomId: string
  id: number
  users: number = 0

  constructor(roomId: number, socket: Socket, userId: number, username: string) {
    this.id = roomId
    console.log("created canvasController: ",roomId, this.id);
    this.roomId = "canva-"+roomId
    this.redis = redisApp.getInstance();
    this.serverRequest = ServerRequests.getInstance();
    this.connect(socket, userId, username)
  }

  connect(socket: Socket, userId: number, username: string) {
    this.initSockets(socket, userId, username);
    this.users++;
  }
  disconnect() {
    this.users--
  }

  initSockets(socket: Socket, userId: number, username: string) {
    if(username == null) {
      username = socket.id;
    }

    console.log("CANVA: init socket for", this.roomId, username)
    socket.on(this.scope+'new-pixel:'+this.id, async (data: any, index: number, position: Coord, color: string) => {
      const isValid = await this.redis.isValid({
        canva_id: this.id,
        user_id: data.user_id,
        token: data.token
      })
      if(isValid) {
        if(this.roomId == undefined || this.id == undefined) return
        socket.to(this.roomId).emit(this.scope+'new-pixel-from-others', position, color);
  
        let payload: PixelsPayload = {
          id: this.id,
          pixels: {}
        };
        
        payload.pixels[index] = color;
  
        console.log("newPixel count", index)
  
        this.redis.saveEntry(payload)
      }
      // return payload
    })

    // TODO: Scoping get message to room
    socket.on('get-init-state', async () => {
      if(this.id == undefined) return;
      const payload = await this.redis.getEntries(this.id);
      socket.emit(this.scope+"init-pixels", payload)
    })
  }

  savePixelsToDb() {
    if(this.id == undefined) return;
    console.log("saving canva:", this.id);
    this.redis.saveEntries(this.id, this.savePixels);
    this.redis.cleanUp(this.id);
  }

  savePixels = async (payload: PixelsPayload) => {
    console.log("SAVE pixel to db - id:", payload.pixels);
    const response = await this.serverRequest.post("/place-pixel", payload)
    console.log(response);
    return response.status == 'success';
  }
}