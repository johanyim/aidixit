//
// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const path = require('path');

import express from "express"
import { Server } from "socket.io"
import path from "path"
import { v4 as uuidv4 } from 'uuid';
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


// static path
app.use(express.static(path.join(__dirname, "public")))


// ------------------------------------------------------ GAME (maybe a new folder, but I forgot how to link it)
const phases = ['preparation', 'gameMasterSubmit', 'cardSubmission', 'voting', 'scoring']
let currentPhaseId = 0
const gameState = {
    players: [
        // { id: 'player1', name: 'Player 1', score: 0, submittedCard: null },
        // ... other player details
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

const cards = {}
const initialCardNumber = 6

// send images buffer
io.on('connection', (socket) => {
    // Create a new player and add them to the players array
    handleNewPlayerEnter(socket)

    // start Game
    socket.on('startGame', () => {
        if (gameState.players.length > 0) {
            updatePhase()
            // Randomly select a game master
            gameState.gameMaster = Math.floor(Math.random() * gameState.players.length)
            io.emit('updateGameState', gameState);

        } else {
            // Handle the case where there are no players, perhaps emit an error event
            console.log("Cannot start the game without players.");
            // You might want to emit an error event to inform clients or take appropriate action
            io.emit('gameError', 'Cannot start the game without players.');
        }
    });

    socket.on('gameMasterSubmitCard', ({prompt, cardInfo}) => {
        // When game master submits
        updatePhase()
        gameState.prompt = prompt
        const player = gameState.players.find(player => player.id === socket.id);

        if (player.id === gameState.gameMaster) {
            player.submittedCard = true;

            if (Array.isArray(cardInfo)){
                gameState.chosenCards = [...gameState.chosenCards, ...cardInfo]
            } else {
                gameState.chosenCards = [...gameState.chosenCards, cardInfo]
            }
            io.emit('updateGameState', gameState);

        } else {
            // Handle the case where there are no players, perhaps emit an error event
            console.log("Submited by not gameMaster.");
            // You might want to emit an error event to inform clients or take appropriate action
            io.emit('gameMasterPhaseError', '"Submited by not gameMaster.');
        }
    });

    // cardInfo = { 'id': string, 'URL': string }
    socket.on('submitCard', (cardInfo) => {
        // Handle a player submitting a card
        const player = gameState.players.find(player => player.id === socket.id);

        if (player) {
            player.submittedCard = true;

            if (Array.isArray(cardInfo)){
                gameState.chosenCards = [...gameState.chosenCards, ...cardInfo]
            } else {
                gameState.chosenCards = [...gameState.chosenCards, cardInfo]
            }
        }

        // Remove from its card deck, thinking whether to store card deck
        // const playerDeck = gameState.playerDecks[socket.id];
        // const submittedCardIndex = playerDeck.findIndex(card => card.id === cardInfo.id);

        // if (submittedCardIndex !== -1) {
        //     playerDeck.splice(submittedCardIndex, 1);
        // }

        // Check if all players have submitted cards
        const allPlayersSubmitted = gameState.players.every(player => player.submittedCard);

        if (allPlayersSubmitted) {
            updatePhase();
            io.emit('updateGameState', gameState);
        }
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

function generateCard(playerId) {
    const cardId = uuidv4()
    const searchTerms = ['night', 'sky', 'grass', 'city', 'food', 'animal', 'sea', "nature", "cityscape", "technology", "anime", "programming", "travel", "architecture", "wildlife", "abstract", "vintage", "food", "portrait", "landscape", "ocean", "music", "sports", "night", "skyline", "artistic", "animals", "fashion", "science", "books", "fitness", "cars", "coffee", "space", "movies", "gaming", "holiday", "business", "street", "sunrise", "sunset", "beach", "mountains", "forest", "flowers", "rain", "snow", "urban", "colorful", "minimal", "texture", "water", "technology", "office", "people"];
    const imageUrl = 'https://source.unsplash.com/random?' + Math.floor(Math.random() * searchTerms.length)

    const card = {
        imageUrl: imageUrl,
        owner: playerId
    }
    cards[cardId] = card

    return cardId
}

function handleNewPlayerEnter(socket) {
    const newPlayer = {
        'id': socket.id,
        'score': 0,
    };

    gameState.players.push(newPlayer);

    //Setup initial card deck
    const cardDeck = []

    for (let i = 0; i < initialCardNumber; i++) {
        const cardId = generateCard(socket.id)
        const cardInfo = { 'id': cardId, 'URL': cards[cardId].imageUrl }
        cardDeck.push(cardInfo)
    }

    io.emit('initialCards', cardDeck)
}


function updatePhase(){
    currentPhaseId+=1
    gameState.currentPhase = phases[currentPhaseId]
}
