import { Socket } from 'socket.io';
import {PixelsPayload, Coord} from '../@types/types'
import redisApp from '../helpers/redisApp';
import ServerRequests from '../helpers/serverRequest';
export default class ChatController {
  redis
  scope = "chat:"
  roomId: string
  id: number

  constructor(roomId: number, socket: Socket, userId: number, username: string) {
    this.redis = redisApp.getInstance();
    this.id = roomId;
    this.roomId = "canva-"+roomId
    this.initSockets(socket, userId, username);
  }

  connect(socket: Socket, userId: number, username: string) {
    this.initSockets(socket, userId, username);
  }

  disconnect() {
  }

  async initSockets( socket: Socket, userId: number | null, username: string| null) {
    if(username == null) {
      username = socket.id;
    }

    await this.redis.createChatUser(username, this.id)

    socket.on('get-init-state', async () => {
      const latestMessages = await this.redis.getLatestMessages(this.id)
      socket.to(this.roomId).emit(this.scope+'init-messages', latestMessages);
    })
    

    socket.on(this.scope+'new-message', async (message) => {
      const isValid = await this.redis.isValid({
        canva_id: this.id,
        user_id: message.id,
        token: message.token
      })

      if(isValid) {
        socket.to(this.roomId).emit(this.scope+'get-message', message);
        await this.redis.saveMessage({
          id: this.id,
          message: message
        })
      }
    })
  }

}