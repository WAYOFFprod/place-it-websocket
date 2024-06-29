
import { Socket } from 'socket.io';
import {PixelsPayload, Coord} from '../@types/types'
import redisApp from '../helpers/redisApp';
import ServerRequests from '../helpers/serverRequest';
export default class CanvaController {
  redis
  serverRequest
  scope = "canva:"
  roomId: string | undefined
  id: number | undefined
  users: number = 0

  constructor(roomId: number, socket: Socket) {
    this.id = roomId
    console.log("created canvasController: ",roomId, this.id);
    this.roomId = "canva-"+roomId
    this.redis = redisApp.getInstance();
    this.serverRequest = ServerRequests.getInstance();
    this.connect(socket)
  }

  connect(socket: Socket) {
    this.initSockets(socket);
    this.users++;
  }
  disconnect() {
    this.users--
  }

  initSockets(socket: Socket) {
    console.log("CANVA: init socket", this.roomId, this.id)
    socket.on(this.scope+'new-pixel:'+this.id, (index: number, position: Coord, color: string) => {
      if(this.roomId == undefined || this.id == undefined) return
      console.log("NEW_PIXEL", index, this.scope+'new-pixel-from-others')
      socket.to(this.roomId).emit(this.scope+'new-pixel-from-others', position, color);

      let payload: PixelsPayload = {
        id: this.id,
        pixels: {}
      };
      
      payload.pixels[index] = color;
      console.log("newPixel", index)
      this.redis.saveEntry(payload)
      return payload
    })

    socket.on('init', async () => {
      if(this.id == undefined) return;
      const payload = await this.redis.getEntries(this.id);
      socket.emit(this.scope+"init-pixels", payload)
    })


    socket.on(this.scope+'reset', () => {
      if(this.roomId == undefined) return
      this.redis.clearCanva(1);
      socket.to(this.roomId).emit(this.scope+'reset-others');
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