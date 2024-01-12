//
// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const path = require('path');

import express from "express"
import {initializeSocket} from './socketSetup'

import path from "path"

import {
    handleGameStart,
    handleGameMasterSubmitCard,
    handleSubmitCard,
    handleNewPlayerEnter,
  } from './game';
  
// extra code to enable __dirname = "./"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname, "public")))


const expressServer = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// const server = http.createServer(app);
// const io = socketIO(server);
const io = initializeSocket(expressServer)

// send images buffer
io.on('connection', (socket) => {
    // Create a new player and add them to the players array
    handleNewPlayerEnter(socket)

    // start Game
    socket.on('startGame', () => {
        handleGameStart(socket)
    });

    socket.on('gameMasterSubmitCard', ({prompt, cardInfo}) => {
        handleGameMasterSubmitCard(socket, {prompt, cardInfo})
    });

    // cardInfo = { 'id': string, 'URL': string }
    socket.on('submitCard', (cardInfo) => {
        handleSubmitCard(socket, cardInfo)
    });

    // socket.on('vote', (voteInfo) => {
    //     // Handle a player voting
    //     // Emit 'updateGameState' to broadcast the updated game state
    //     io.emit('updateGameState', updatedGameState);
    // });

    // socket.on('revealCard', () => {
    //     // Handle revealing chosen cards
    //     // Emit 'updateGameState' to broadcast the updated game state
    //     io.emit('updateGameState', updatedGameState);
    // });

    // Chat events
    // Handle sending a chat message
    socket.on('sendMessage', (messageInfo) => {
        // TODO: include/ append player at front?
        io.emit('broadcastMessage', messageInfo);
    });
});