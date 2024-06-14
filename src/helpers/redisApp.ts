import { createClient, commandOptions } from 'redis';
import {PixelsPayload} from '../@types/types'

export type RedisClientType = ReturnType<typeof createClient>

export default class redisApp {
  static #instance: redisApp
  redisClient: RedisClientType | undefined
  STREAMS_KEY = "canvas:";
  currentId = '0-0';

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new redisApp();
    }
    return this.#instance;
  }

  constructor() {
    this.testRedis();
  }

  testRedis = async () => {
    console.log("-------|||||--------")
    this.redisClient = await createClient({
      socket:{
        host: process.env.REDIS_HOST,
        port: 6379,
      }
    })
    .on('error', err => console.log('Redis Client Error', err))
    .on('connect', err => console.info('Redis connected'))
    .on('ready', () => {
      console.info('Redis ready!')
    })
    .connect();

    await this.redisClient.set('key', 'test');
    const value = await this.redisClient.get('key');


    // this.redisClient = await getCache()
  }

  saveEntry(data: PixelsPayload) {
    for (const [id, color] of Object.entries(data.pixels)) {
        if(this.redisClient != undefined) {
          const pixel = JSON.stringify({
            "id": id.toString(),
            "color": color
          });
          const key = this.STREAMS_KEY+data.id;
          this.redisClient.xAdd(key, "*", JSON.parse(pixel));
        };
      };
  }

  async saveEntries (id: number, savePixelToDb: (pixelsPayload: PixelsPayload) => {}) {
    const key = this.STREAMS_KEY+id;
    if(this.redisClient == undefined) return;
    let response = await this.redisClient.xRange(key, "-", "+")
    if(response && response.length > 0) {
      const firstId = response[0].id;
      const lastId = response[response.length-1].id;
      const data = response.map((message) => {
        return message.message
      })
      
      let payload: PixelsPayload = {
        id: 1,
        pixels: {}
      };

      let count = 0
      data.forEach(pixel => {
        const p = pixel.id.toString()
        const id = parseInt(pixel.id);
        if(isNaN(id)) return;
        payload.pixels[parseInt(pixel.id)] = pixel.color;
        count++;
      })
      if(count == 0) return
      
      const isSaved = await savePixelToDb(payload) 

      if(isSaved) {
        let minIdSplit = lastId.split('-');
        let minId = parseInt(minIdSplit[0]);
        let trimResponse = await this.redisClient.xTrim(key, "MINID", minId + 1)
        if(trimResponse > 0) {
          console.info("trimmed entries:", trimResponse);
        }
      }

    }
  }

  async getEntries (id: number) {
    const key = this.STREAMS_KEY+id;
    if(this.redisClient == undefined) return;
    let response = await this.redisClient.xRange(key, "-", "+")
    if(response && response.length > 0) {
      // this.currentId = response[0].messages[0].id;
      // console.log(this.currentId);
      const firstId = response[0].id;
      const lastId = response[response.length-1].id;
      const data = response.map((message) => {
        return message.message
      })
      
      let payload: PixelsPayload = {
        id: 1,
        pixels: {}
      };

      data.forEach(pixel => {
        const p = pixel.id.toString()
        payload.pixels[p] = pixel.color;
      })
      return payload
    }
  }
}