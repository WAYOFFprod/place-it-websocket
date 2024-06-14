
import { Socket } from 'socket.io';
import {PixelsPayload, Coord} from '../@types/types'
import redisApp from '../helpers/redisApp';
import ServerRequests from '../helpers/serverRequest';
export default class CanvaController {
  redis
  serverRequest
  scope = "canva:"
  constructor(socket: Socket) {
    console.log("created");
    this.redis = redisApp.getInstance();
    this.serverRequest = ServerRequests.getInstance();
    socket.on(this.scope+'new-pixel', (index: number, position: Coord, color: string) => {
      socket.broadcast.emit(this.scope+'new-pixel-from-others', position, color);
      
      let payload: PixelsPayload = {
        id: 1,
        pixels: {}
      };
      payload.pixels[index] = color;
  
      this.redis.saveEntry(payload)
      return payload
    })

    socket.on('init', async () => {
      const payload = await this.redis.getEntries(1);
      socket.emit(this.scope+"init-pixels", payload)
    })


    socket.on(this.scope+'reset', () => {
      socket.broadcast.emit(this.scope+'reset-others');
    })
  }

}