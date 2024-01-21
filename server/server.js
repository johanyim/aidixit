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
const socketToNameMap = {};

// send images buffer
io.on('connection', (socket) => {
    initializeConnection(socket);
    handleIO(socket, createInfoMessage(socket));
    handleIO(socket, handleNewPlayerEnter(socket));
    socket.on('setName', (name) => handleSetName(socket, name));

    // ------------------------- GAME RELATED ------------------------------

    socket.on('startGame', () => handleGameEvent(socket, 'gameStart'));
    socket.on('gameMasterSubmitCard', ({ prompt, cardId }) => handleGameEvent(socket, 'gameMasterSubmitCard', { prompt, cardId }));
    socket.on('otherSubmitCard', cardId => handleGameEvent(socket, 'submitCard', cardId));
    socket.on('vote', cardId => handleGameEvent(socket, 'vote', cardId));
    socket.on('scoring', () => handleGameEvent(socket, 'scoring'));

    // ------------------------- ROOMS RELATED ------------------------------

    socket.on('createRoom', (room, cb) => handleCreateRoom(socket, room, cb));
    socket.on('joinRoom', (room, cb) => handleJoinRoom(socket, room, cb));
    socket.on('getRooms', (cb) => handleGetRooms(cb));
    socket.on('leaveRoom', (cb) => handleLeaveRoom(socket, cb));

    // ------------------------- Chat RELATED ------------------------------
    // Handle sending a chat message
    socket.on('sendMessage', (messageInfo) => handleChatMessage(socket, messageInfo));

})

function initializeConnection(socket) {
    socketToRoomMap[socket.id] = socket.id;
    joinRoom(socket, 'lobby');
}

function handleSetName(socket, name){
    // socketToNameMap[socket.id] = name
    const res = handleNameSet(socket, name)
    handleIO(socket, res)
}

function createInfoMessage(socket) {
    return {
        to: 'all',
        message: 'infoMessage',
        args: `${socket.id.substring(0, 5)} has entered`,
    };
}

function handleChatMessage(socket, messageInfo) {
    handleIO(socket, {
        to: 'all',
        message: 'broadcastMessage',
        args: `${socket.id.substring(0, 5)}: ${messageInfo}`,
    });
}


function joinRoom(socket, room, leaveCurrent = true) {
    // Exit current room first
    if (leaveCurrent) leaveRoom(socket)
    socket.join(room)
    socketToRoomMap[socket.id] = room;
}

function leaveRoom(socket) {
    const roomName = socketToRoomMap[socket.id];
    if (roomName) {
        socket.leave(roomName);
        delete socketToRoomMap[socket.id];
    }

    // BUG: causes recursive call with joinRoom
    // Back to lobby
    joinRoom(socket, 'lobby', false)
}

function handleGetRooms(cb) {
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
}

function handleCreateRoom(socket, room, cb) {
    joinRoom(socket, room)
    cb(`Created and Joined ${room}`)
}

function handleJoinRoom(socket, room, cb) {
    joinRoom(socket, room)
    cb(`Joined ${room}`)
}

function handleLeaveRoom(socket, cb) {
    leaveRoom(socket);
    cb(`Left room`);
}

function handleGameEvent(socket, eventName, data = null) {
    let res;

    switch (eventName) {
        case 'gameStart':
            res = handleGameStart(socket);
            break;
        case 'gameMasterSubmitCard':
            res = handleGameMasterSubmitCard(socket, data);
            break;
        case 'submitCard':
            console.log(data);
            res = handleSubmitCard(socket, data);
            break;
        case 'vote':
            res = handleVoting(socket, data);
            break;
        case 'scoring':
            res = handleScoring();
            break;
        default:
            // Handle unknown event
            break;
    }

    handleIO(socket, res);
}

// to = 'all' | 'sender'
function handleIO(socket, res) {
    // No response received 
    if (res === null || res == undefined) return

    const { to, message, args } = res

    if (to === 'all') {
        const room = socketToRoomMap[socket.id];
        if (room === undefined || room === null) {
            io.emit(message, args)
        } else {
            io.to(room).emit(message, args)
        }
    } else if (to === 'sender') {
        socket.emit(message, args)
    }
}