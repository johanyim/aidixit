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
io.on('connection', (socket) => {
    // Create a new player and add them to the players array
    // also broadcasts a grey info message
    socket.broadcast.emit('infoMessage', `${socket.id.substring(0,5)} has entered`) //from socket.send
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
        io.emit('broadcastMessage', `${socket.id.substring(0, 5)}: ${messageInfo}`) //from socket.send
    });

    socket.on('setName', (name) => {
        const res = handleNameSet(socket, name)
        handleIO(socket, res)

    });

});

// to = 'all' | 'sender'
function handleIO(socket, res) {
    // No response received 
    if (res === null || res == undefined) return

    const { to, message, args } = res

    if (to === 'all') {
        io.emit(message, args)
    } else if (to === 'sender') {
        socket.emit(message, args)
    }

}
