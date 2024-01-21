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

const socketToRoomMap = {};

// send images buffer
io.on('connection', (socket) => {
    socketToRoomMap[socket.id] = socket.id;
    joinRoom(socket, 'lobby')

    //  broadcasts a grey info message
    const infoMessage = {
        to: 'all',
        message: 'infoMessage',
        args: `${socket.id.substring(0, 5)} has entered`,
    }
    handleIO(socket, infoMessage)

    const res = handleNewPlayerEnter(socket)
    handleIO(socket, res)

    // start Game, 
    socket.on('startGame', () => {
        const res = handleGameStart(socket)
        handleIO(socket, res)

    });

    // storyteller card chosen
    socket.on('gameMasterSubmitCard', ({ prompt, cardId }) => {
        const res = handleGameMasterSubmitCard(socket, { prompt, cardId })
        handleIO(socket, res)

    });

    // guesser card chosen
    // cardInfo = { 'id': string, 'URL': string }
    socket.on('otherSubmitCard', (cardId) => {
        console.log(cardId)
        const res = handleSubmitCard(socket, cardId)
        handleIO(socket, res)
    });

    socket.on('vote', (cardId) => {
        // Handle a player voting
        // Emit 'updateGameState' to broadcast the updated game state
        const res = handleVoting(socket, cardId)
        handleIO(socket, res)
    });

    socket.on('scoring', () => {
        const res = handleScoring()
        handleIO(socket, res)
    });

    // Chat events
    // Handle sending a chat message
    socket.on('sendMessage', (messageInfo) => {
        const res = {
            to: 'all',
            message: 'broadcastMessage',
            args: `${socket.id.substring(0, 5)}: ${messageInfo}`,
        }
        handleIO(socket, res)
    });

    socket.on('setName', (name) => {
        const res = handleNameSet(socket, name)
        handleIO(socket, res)

    });

    // ------------------------- ROOMS RELATED ------------------------------

    socket.on('createRoom', (room, cb) => {
        joinRoom(socket, room)
        cb(`Created and Joined ${room}`)
    });


    socket.on('joinRoom', (room, cb) => {
        joinRoom(socket, room)
        cb(`Joined ${room}`)
    });

    socket.on('getRooms', (cb) => {
        const roomsInfo = []
        const allRooms = io.sockets.adapter.rooms;
        console.log('allRooms :>> ', allRooms);

        for (const [roomName, socketIds] of allRooms.entries()) {
            // Get the size of the Set to determine the number of sockets in the room
            const length = socketIds.size;
        
            if (length > 0) {
                roomsInfo.push({
                    name: roomName,
                    length: length
                });
            }
        }
        cb(roomsInfo)
    });

    socket.on('leaveRoom', () => {
        leaveRoom(socket)
        cb(`Left ${room}`)
    });
})


function toLobbySelection(socket, room) {


}

function joinRoom(socket, room) {
    // Exit current room first
    leaveRoom(socket)
    socket.join(room)
    socketToRoomMap[socket.id] = room;
}

function leaveRoom(socket){
    const roomName = socketToRoomMap[socket.id];
    if (roomName) {
        socket.leave(roomName);
        delete socketToRoomMap[socket.id];
    } 

    // BUG: causes recursive call with joinRoom
    // Back to lobby
    // joinRoom(socket, 'lobby')
    
    // lobby selection screen
    toLobbySelection()
}

// to = 'all' | 'sender'
function handleIO(socket, res) {
    // No response received 
    if (res === null || res == undefined) return

    const room = socketToRoomMap[socket.id];
    const { to, message, args } = res

    if (to === 'all') {
        if (room === undefined || room === null) {
            io.emit(message, args)
        } else {
            io.to(room).emit(message, args)
        }
    } else if (to === 'sender') {
        socket.emit(message, args)
    }
}

