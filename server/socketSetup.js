// socketSetup.js

import { Server } from "socket.io"

let io; // This will store the Socket.IO instance

function initializeSocket(server) {
    const io = new Server(server, {
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
    })
    // Add your Socket.IO event listeners or configuration here

    return io;
}

function getIo() {
    if (!io) {
        throw new Error('Socket.IO has not been initialized. Call initializeSocket first.');
    }

    return io;
}

export { initializeSocket, getIo };
