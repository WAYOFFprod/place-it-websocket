"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.js
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
// import axios, { AxiosResponse } from "axios";
dotenv_1.default.config();
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
// app.use(cors())
const server = (0, node_http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:5173',
    }
});
// console.log(io);
let payload = {
    "id": 1,
    "pixels": {}
    // "pixels": {
    //     "0": 16,
    //     "1": 2,
    //     "2": 3,
    //     "3": 4,
    //     "4": 5,
    //     "5": 6,
    //     "6": 7,
    //     "7": 8,
    //     "8": 9,
    //     "9": 10,
    //     "10": 11,
    //     "11": 12,
    //     "12": 13,
    //     "13": 14,
    //     "14": 15,
    //     "15": 16,
    //     "20": 1,
    //     "21": 1
    // }
};
// const client = axios.create({
//   baseURL: process.env.SERVER_URL+'/api',
// });
server.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server 2");
});
io.on('connection', (socket) => {
    console.log("user connected");
    socket.on('new-pixel', (position, color) => {
        console.log('color:', color);
        socket.broadcast.emit('new-pixel-from-others', position, color);
        const k = position.x + (position.y * position.x);
        const pixels = {};
        pixels[k] = 1;
        payload.pixels = pixels;
        console.log(payload);
        // axios.post("/place-pixel", payload)
        //   .then((response: AxiosResponse) => {
        //     console.log(response);
        //   })
    });
});
