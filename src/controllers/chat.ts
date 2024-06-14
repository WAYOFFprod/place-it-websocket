import { Socket } from 'socket.io';
import {PixelsPayload, Coord} from '../@types/types'
import redisApp from '../helpers/redisApp';
import ServerRequests from '../helpers/serverRequest';
export default class ChatController {
  redis
  scope = "chat:"
  constructor(socket: Socket) {
    this.redis = redisApp.getInstance();

    socket.on(this.scope+'new-message', async (message) => {
      socket.broadcast.emit(this.scope+'get-message', message);
    })
  }
}