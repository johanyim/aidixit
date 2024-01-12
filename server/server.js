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
    // add id
    socket.emit('images',
        [
            'https://source.unsplash.com/random?night', 
            'https://source.unsplash.com/random?sky', 
            'https://source.unsplash.com/random?grass',
            'https://source.unsplash.com/random?city',
            'https://source.unsplash.com/random?food',
            'https://source.unsplash.com/random?animal',
        ]
    )

    // Game
    // socket.on('submitCard', (cardInfo) => {
    //     // Handle a player submitting a card
    //     // Emit 'updateGameState' to broadcast the updated game state
    //     io.emit('updateGameState', updatedGameState);
    // });

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


// const gameState = {
//     players: [
//         { id: 'player1', name: 'Player 1', score: 0, submittedCard: null },
//         // ... other player details
//     ],
//     currentPhase: 'cardSubmission', // Possible phases: 'cardSubmission', 'voting', 'scoring', etc.
//     gameMaster: 'player2', // ID of the current game master
//     // ... other game state details
// };