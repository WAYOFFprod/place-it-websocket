
interface Coord {
  x: number,
  y: number
}

interface PixelsPayload {
  id: number
  pixels: {[key: string]: string}
}

interface UserData {
  id: number
  username: string
}

interface MessagePayload {
  id: number,
  message: Message
}

interface Message {
  time: string
  user: string
  respondTo?: string
  message: string
}

export {PixelsPayload, Coord, MessagePayload, UserData}