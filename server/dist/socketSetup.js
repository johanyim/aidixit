"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initializeSocket = void 0;
// socketSetup.js
const socketIO = require('socket.io');
const socket_io_1 = require("socket.io");
let io; // This will store the Socket.IO instance
function initializeSocket(server) {
    const io = new socket_io_1.Server(server, {
        //cross origin resource request
        cors: {
            origin: process.env.NODE_ENV === "production" ? false :
                [
                    "http://localhost:8080",
                    "http://127.0.0.1:8080",
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                ]
        }
    });
    // Add your Socket.IO event listeners or configuration here
    return io;
}
exports.initializeSocket = initializeSocket;
function getIo() {
    if (!io) {
        throw new Error('Socket.IO has not been initialized. Call initializeSocket first.');
    }
    return io;
}
exports.getIo = getIo;
