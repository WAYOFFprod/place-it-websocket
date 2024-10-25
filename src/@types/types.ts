
interface Coord {
  x: number,
  y: number
}

interface Pixels {
  [key: string]: string
}

interface ValidationPayload {
  user_id: number
  canva_id: number
  token: string
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

export {PixelsPayload, Coord, MessagePayload, UserData, ValidationPayload, Pixels}