//
// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const path = require('path');

import express from "express"
import { initializeSocket } from './src/socketSetup.js'

import path from "path"

import {
    handleGameStart,
    handleGameMasterSubmitCard,
    handleSubmitCard,
    handleNewPlayerEnter,
    handleNameSet,
    handleVoting,
    handleScoring,
} from './src/game.js';

// extra code to enable __dirname = "./"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname, "public")))

app.get('/', (req, res) => {
    res.redirect('/index.html#landing');
});

const expressServer = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// const server = http.createServer(app);
// const io = socketIO(server);
const io = initializeSocket(expressServer)


// send images buffer
io.on('connection', (socket, room) => {
    //  broadcasts a grey info message
    const infoMessage = {
        to: 'all',
        message: 'infoMessage',
        args: `${socket.id.substring(0, 5)} has entered`,
    }
    handleIO(socket, infoMessage, room)

    const res = handleNewPlayerEnter(socket)
    handleIO(socket, res, room)

    // start Game, 
    socket.on('startGame', () => {
        const res = handleGameStart(socket)
        handleIO(socket, res, room)

    });

    // storyteller card chosen
    socket.on('gameMasterSubmitCard', ({ prompt, cardId }, room) => {
        const res = handleGameMasterSubmitCard(socket, { prompt, cardId })
        handleIO(socket, res, room)

    });

    // guesser card chosen
    // cardInfo = { 'id': string, 'URL': string }
    socket.on('otherSubmitCard', (cardId, room) => {
        console.log(cardId)
        const res = handleSubmitCard(socket, cardId)
        handleIO(socket, res, room)
    });

    socket.on('vote', (cardId, room) => {
        // Handle a player voting
        // Emit 'updateGameState' to broadcast the updated game state
        const res = handleVoting(socket, cardId)
        handleIO(socket, res, room)
    });

    socket.on('scoring', (room) => {
        const res = handleScoring()
        handleIO(socket, res, room)
    });

    // Chat events
    // Handle sending a chat message
    socket.on('sendMessage', (messageInfo, room) => {
        const res = {
            to: 'all',
            message: 'broadcastMessage',
            args: `${socket.id.substring(0, 5)}: ${messageInfo}`,
        }
        handleIO(socket, res, room)
    });

    socket.on('setName', (name, room) => {
        const res = handleNameSet(socket, name)
        handleIO(socket, res, room)

    });

    // ------------------------- ROOMS RELATED ------------------------------
    socket.on('joinRoom', (room, cb) => {
        socket.join(room)
        cb(`Joined ${room}`)
    });

    socket.on('getRooms', (cb) => {
        const roomsInfo = []
        const allRooms = io.sockets.adapter.rooms;

        for (const [roomName, socketIds] of allRooms.entries()) {
            // Get the size of the Set to determine the number of sockets in the room
            const length = socketIds.size;
        
            roomsInfo.push({
                name: roomName,
                length: length
            });
        }
        cb(roomsInfo)
    });
})

// to = 'all' | 'sender'
function handleIO(socket, res, room) {
    // No response received 
    if (res === null || res == undefined) return

    const { to, message, args } = res

    if (to === 'all') {
        if (room === undefined) {
            io.emit(message, args)
        } else {
            io.to(room).emit(message, args)
        }
    } else if (to === 'sender') {
        socket.emit(message, args)
    }

}
