"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNewPlayerEnter = exports.handleSubmitCard = exports.handleGameMasterSubmitCard = exports.handleGameStart = void 0;
const uuid_1 = require("uuid");
const socketSetup_1 = require("./socketSetup"); // Adjust the path based on your project structure
const io = (0, socketSetup_1.getIo)();
// ------------------------------------------------------
const phases = ['preparation', 'gameMasterSubmit', 'cardSubmission', 'voting', 'scoring'];
let currentPhaseId = 0;
const defaultPlayer = {
    id: '',
    name: '',
    score: 0,
    submittedCard: false,
    voted: false,
};
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
const cards = {};
const initialCardNumber = 6;
function handleNewPlayerEnter(socket) {
    const newPlayer = Object.assign(Object.assign({}, defaultPlayer), { 'id': socket.id, 'score': 0 });
    gameState.players.push(newPlayer);
    //Setup initial card deck
    const cardDeck = [];
    for (let i = 0; i < initialCardNumber; i++) {
        const cardId = generateCard(socket.id);
        const cardInfo = { 'id': cardId, 'URL': cards[cardId].imageUrl };
        cardDeck.push(cardInfo);
    }
    io.emit('initialCards', cardDeck);
}
exports.handleNewPlayerEnter = handleNewPlayerEnter;
// start Game
function handleGameStart(socket) {
    if (gameState.players.length > 0) {
        updatePhase();
        // Randomly select a game master
        gameState.gameMaster = gameState.players[Math.floor(Math.random() * gameState.players.length)].id;
        io.emit('updateGameState', gameState);
    }
    else {
        // Handle the case where there are no players, perhaps emit an error event
        console.log("Cannot start the game without players.");
        // You might want to emit an error event to inform clients or take appropriate action
        io.emit('gameError', 'Cannot start the game without players.');
    }
}
exports.handleGameStart = handleGameStart;
;
function handleGameMasterSubmitCard(socket, { prompt, cardInfo }) {
    // When game master submits
    updatePhase();
    gameState.prompt = prompt;
    const player = gameState.players.find(player => player.id === socket.id);
    if ((player === null || player === void 0 ? void 0 : player.id) === gameState.gameMaster) {
        player.submittedCard = true;
        if (Array.isArray(cardInfo)) {
            gameState.chosenCards = [...gameState.chosenCards, ...cardInfo];
        }
        else {
            gameState.chosenCards = [...gameState.chosenCards, cardInfo];
        }
        io.emit('updateGameState', gameState);
    }
    else {
        // Handle the case where there are no players, perhaps emit an error event
        console.log("Submited by not gameMaster.");
        // You might want to emit an error event to inform clients or take appropriate action
        io.emit('gameMasterPhaseError', '"Submited by not gameMaster.');
    }
}
exports.handleGameMasterSubmitCard = handleGameMasterSubmitCard;
// cardInfo = { 'id': string, 'URL': string }
function handleSubmitCard(socket, cardInfo) {
    // Handle a player submitting a card
    const player = gameState.players.find(player => player.id === socket.id);
    if (player) {
        player.submittedCard = true;
        if (Array.isArray(cardInfo)) {
            gameState.chosenCards = [...gameState.chosenCards, ...cardInfo];
        }
        else {
            gameState.chosenCards = [...gameState.chosenCards, cardInfo];
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
}
exports.handleSubmitCard = handleSubmitCard;
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
function generateCard(playerId) {
    const cardId = (0, uuid_1.v4)();
    const searchTerms = ['night', 'sky', 'grass', 'city', 'food', 'animal', 'sea', "nature", "cityscape", "technology", "anime", "programming", "travel", "architecture", "wildlife", "abstract", "vintage", "food", "portrait", "landscape", "ocean", "music", "sports", "night", "skyline", "artistic", "animals", "fashion", "science", "books", "fitness", "cars", "coffee", "space", "movies", "gaming", "holiday", "business", "street", "sunrise", "sunset", "beach", "mountains", "forest", "flowers", "rain", "snow", "urban", "colorful", "minimal", "texture", "water", "technology", "office", "people"];
    const imageUrl = 'https://source.unsplash.com/random?' + Math.floor(Math.random() * searchTerms.length);
    const card = {
        imageUrl: imageUrl,
        owner: playerId
    };
    cards[cardId] = card;
    return cardId;
}
function updatePhase() {
    currentPhaseId += 1;
    gameState.currentPhase = phases[currentPhaseId];
}
