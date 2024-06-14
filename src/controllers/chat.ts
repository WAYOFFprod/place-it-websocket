import { Socket } from 'socket.io';
import {PixelsPayload, Coord} from '../@types/types'
import redisApp from '../helpers/redisApp';
import ServerRequests from '../helpers/serverRequest';
export default class ChatController {
  redis
  scope = "chat:"
  username: string | undefined
  constructor(socket: Socket) {
    this.redis = redisApp.getInstance();

    this.connect(socket);
  }

  async connect(socket: Socket) {
    const userData = await this.redis.createChatUser("user", 0)
    this.username = userData.username
    console.log("user created on redis:", this.username)

    socket.on('init', async () => {
      const latestMessages = await this.redis.getLatestMessages(0)
      console.log(latestMessages);
      socket.emit(this.scope+'init-messages', latestMessages);
    })
    

    socket.on(this.scope+'new-message', async (message) => {
      socket.broadcast.emit(this.scope+'get-message', message);
      await this.redis.saveMessage({
        id: 0,
        message: message
      })
    })
  }

}