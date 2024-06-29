import { Socket } from 'socket.io';
import {PixelsPayload, Coord} from '../@types/types'
import redisApp from '../helpers/redisApp';
import ServerRequests from '../helpers/serverRequest';
export default class ChatController {
  redis
  scope = "chat:"
  username: string | undefined
  roomId: string
  id: number
  constructor(roomId: number, socket: Socket) {
    this.redis = redisApp.getInstance();
    this.id = roomId;
    this.roomId = "canva-"+roomId
    this.initSockets(socket);
  }

  connect(socket: Socket) {
    this.initSockets(socket);
  }

  disconnect() {
  }

  async initSockets( socket: Socket) {
    
    const userData = await this.redis.createChatUser("user", this.id)
    this.username = userData.username
    console.log("user created on redis:", this.username)

    socket.on('init', async () => {
      const latestMessages = await this.redis.getLatestMessages(this.id)
      socket.to(this.roomId).emit(this.scope+'init-messages', latestMessages);
    })
    

    socket.on(this.scope+'new-message', async (message) => {
      socket.to(this.roomId).emit(this.scope+'get-message', message);
      await this.redis.saveMessage({
        id: this.id,
        message: message
      })
    })
  }

}