// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const path = require('path');

import express from "express"
import { initializeSocket } from './src/socketSetup.js'

import path from "path"

import {
    handleNewPlayerEnter,
} from './src/game.js';

// extra code to enable __dirname = "./"
import { fileURLToPath } from "url"
import { handleSetName } from "./src/SocketHandler/LobbyHandler.js";
import { createInfoMessage, handleChatMessage } from "./src/SocketHandler/ChatHandler.js";
import { handleGameEvent } from "./src/SocketHandler/GameHandler.js";
import { handleIO } from "./src/SocketHandler/IOHandler.js";
import { handleCreateRoom, handleJoinRoom, handleGetRooms, handleLeaveRoom } from "./src/SocketHandler/RoomHandler.js";

// @ts-ignore
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname, "public")))

app.get('/', function (req, res) {
    res.redirect('./index.html');
});

const expressServer = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// const server = http.createServer(app);
// const io = socketIO(server);
const io = initializeSocket(expressServer)

export const socketToNameMap = {};
export const socketToRoomMap = {};

// send images buffer
io.on('connection', (socket) => {
    initializeConnection(socket);
    socket.on('setName', (name) => handleSetName(socket, name));

    // ------------------------- ROOMS RELATED ------------------------------
    // Maybe put to when join room, (broadcast join)
    handleIO(socket, createInfoMessage(socket));
    socket.on('createRoom', (room, cb) => handleCreateRoom(socket, room, cb));
    socket.on('joinRoom', (room, cb) => handleJoinRoom(socket, room, cb));
    socket.on('getRooms', (cb) => handleGetRooms(cb));
    socket.on('leaveRoom', (cb) => handleLeaveRoom(socket, cb));

    // ------------------------- GAME RELATED ------------------------------
    // Maybe put to when join room, (broadcast join)
    handleIO(socket, handleNewPlayerEnter(socket));
    socket.on('startGame', () => handleGameEvent(socket, 'gameStart'));
    socket.on('gameMasterSubmitCard', ({ prompt, cardId }) => handleGameEvent(socket, 'gameMasterSubmitCard', { prompt, cardId }));
    socket.on('otherSubmitCard', cardId => handleGameEvent(socket, 'submitCard', cardId));
    socket.on('vote', cardId => handleGameEvent(socket, 'vote', cardId));
    socket.on('scoring', () => handleGameEvent(socket, 'scoring'));

    // ------------------------- Chat RELATED ------------------------------
    // Handle sending a chat message
    socket.on('sendMessage', (messageInfo) => handleChatMessage(socket, messageInfo));
})

function initializeConnection(socket) {
    socketToRoomMap[socket.id] = socket.id;
    handleJoinRoom(socket, 'lobby');
}
