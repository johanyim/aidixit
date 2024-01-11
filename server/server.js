//
// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const path = require('path');

import express from "express" 
import { Server } from "socket.io"
import path from "path"

// extra code to enable __dirname = "./"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000;

const app = express();

const expressServer = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// const server = http.createServer(app);
// const io = socketIO(server);
const io = new Server(expressServer, {
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

// // we can use express static paths 
//
// app.get('/', (req, res) => {
//     const filePath = path.join(__dirname, '../index.html');
//     res.sendFile(filePath);
// });

// static path
app.use(express.static(path.join(__dirname, "public")))


// send images buffer
io.on('connection', (socket) => {
    socket.emit('images',['https://source.unsplash.com/random', 'https://source.unsplash.com/random?blue sky', 'https://source.unsplash.com/random?grass'])
});
