"use strict";
//
// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const path = require('path');
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socketSetup_1 = require("./socketSetup");
const path_1 = __importDefault(require("path"));
const game_1 = require("./game");
// extra code to enable __dirname = "./"
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
const expressServer = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// const server = http.createServer(app);
// const io = socketIO(server);
const io = (0, socketSetup_1.initializeSocket)(expressServer);
// static path
// ------------------------------------------------------ GAME (maybe a new folder, but I forgot how to link it)
const phases = ['preparation', 'gameMasterSubmit', 'cardSubmission', 'voting', 'scoring'];
const currentPhaseId = 0;
const gameState = {
    players: [
    // { id: 'socket id', 
    //     name: 'Player 1', 
    //     score: 0, 
    //     submittedCard: false, 
    //     voted: false 
    // },
    ],
    currentPhase: phases[currentPhaseId], // phases[0]
    gameMaster: '', // ID of the current game master
    chosenCards: [],
    prompt: '',
};
// const card = {
//     owner: '', //playerId
//     imageUrl: '' //url_to_card_image
// };
const cards = {};
const initialCardNumber = 6;
// send images buffer
io.on('connection', (socket) => {
    // Create a new player and add them to the players array
    (0, game_1.handleNewPlayerEnter)(socket);
    // start Game
    socket.on('startGame', () => {
        (0, game_1.handleGameStart)(socket);
    });
    socket.on('gameMasterSubmitCard', ({ prompt, cardInfo }) => {
        (0, game_1.handleGameMasterSubmitCard)(socket, { prompt, cardInfo });
    });
    // cardInfo = { 'id': string, 'URL': string }
    socket.on('submitCard', (cardInfo) => {
        (0, game_1.handleSubmitCard)(socket, cardInfo);
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
