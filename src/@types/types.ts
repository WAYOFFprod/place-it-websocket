
interface Coord {
  x: number,
  y: number
}

interface PixelsPayload {
  id: number
  pixels: {[key: string]: string}
}

export {PixelsPayload, Coord}