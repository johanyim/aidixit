
import { v4 as uuidv4 } from 'uuid';
// ------------------------------------------------------
const phases = ['preparation', 'gameMasterSubmit', 'othersSubmit', 'voting', 'scoring']
let currentPhaseId = 0

// interface Player {
//     id: string;
//     name: string;
//     score: number;
//     submittedCard: boolean;
//     voted: boolean;
// }

export const defaultPlayer = {
    id: '',
    name: '',
    score: 0,
    submittedCard: false,
    voted: false,
};

// interface CardInfo {
//     id: string;
//     imageUrl: string;
// }

// interface GameState {
//     players: Player[];
//     currentPhase: string;
//     gameMaster: string;
//     chosenCards: CardInfo[]; // Update this type based on your actual card structure
//     prompt: string;
// }

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

// interface Card {
//     owner: string;
//     imageUrl: string;
// }

// interface SentCardInfo {
//     id:string
//     url : string
// }

// const cards: Record<string, Card> = {}
const cards = {}
const initialCardNumber = 6

function handleNameSet(socket, name) {
    const player = gameState.players.find(player => player.id === socket.id);
    if (!player) {
        console.error(`playerId not found ${socket.id}`)
    }

    player.name = name

    return { to: 'all', message: 'updatePlayers', args: gameState.players }
}

function handleNewPlayerEnter(socket) {
    //chat enter message

    const newPlayer = {
        ...defaultPlayer,
        'id': socket.id,
        'score': 0,
    };

    gameState.players.push(newPlayer);

    //Setup initial card deck
    const cardDeck = []

    for (let i = 0; i < initialCardNumber; i++) {
        const cardId = generateCard(socket.id)
        const cardInfo = { 'id': cardId, 'url': cards[cardId].imageUrl }
        cardDeck.push(cardInfo)
    }

    return { to: 'sender', message: 'initialCards', args: cardDeck }

}

// start Game, get game master
function handleGameStart() {
    // TODO: Maybe change 0 to 1 in the future
    if (gameState.players.length > 0) {
        updatePhase()
        // Randomly select a game master
        gameState.gameMaster = gameState.players[Math.floor(Math.random() * gameState.players.length)].id;
        return { to: 'all', message: 'updateGameState', args: gameState }


    } else {
        // Handle the case where there are no players, perhaps emit an error event
        console.log("Cannot start the game without players.");
        // You might want to emit an error event to inform clients or take appropriate action
        return { to: 'all', message: 'gameError', args: 'Cannot start the game without players.' }

    }
};

// interface SubmittedCard {
//     prompt: string;
//     cardInfo: SentCardInfo ;
// } 

// Game master submit card and prompt
function handleGameMasterSubmitCard(socket, { prompt, cardId }) {
    updatePhase()
    gameState.prompt = prompt
    const player = gameState.players.find(player => player.id === socket.id);

    if (player?.id === gameState.gameMaster) {
        player.submittedCard = true;
        addChosenCard(cardId)
        return { to: 'all', message: 'updateGameState', args: gameState }


    } else {
        // Handle the case where there are no players, perhaps emit an error event
        console.log("Cannot start the game without players.");
        // You might want to emit an error event to inform clients or take appropriate action
        return { to: 'all', message: 'gameError', args: 'Cannot start the game without players.' }

    }
}

// Other player submit cards
function handleSubmitCard(socket, cardId) {
    const player = gameState.players.find(player => player.id === socket.id);

    if (player) {
        player.submittedCard = true;
        addChosenCard(cardId)
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
        return { to: 'all', message: 'updateGameState', args: gameState }
    }
}

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

let isTesting = false
let count = 1

function generateCard(playerId) {
    let cardId, imageUrl;
    if (!isTesting) {
        cardId = uuidv4()
        const searchTerms = ['night', 'sky', 'grass', 'city', 'food', 'animal', 'sea', "nature", "cityscape", "technology", "anime", "programming", "travel", "architecture", "wildlife", "abstract", "vintage", "food", "portrait", "landscape", "ocean", "music", "sports", "night", "skyline", "artistic", "animals", "fashion", "science", "books", "fitness", "cars", "coffee", "space", "movies", "gaming", "holiday", "business", "street", "sunrise", "sunset", "beach", "mountains", "forest", "flowers", "rain", "snow", "urban", "colorful", "minimal", "texture", "water", "technology", "office", "people"];
        imageUrl = 'https://source.unsplash.com/random?' + searchTerms[Math.floor(Math.random() * searchTerms.length)]
    } else {
        cardId = count
        imageUrl = count
        count += 1
    }

    const card = {
        imageUrl: imageUrl,
        owner: playerId
    }
    cards[cardId] = card

    return cardId
}


function updatePhase() {
    currentPhaseId += 1
    gameState.currentPhase = phases[currentPhaseId]
}


function addChosenCard(cardId) {
    // // only if cardId is an array
    if (Array.isArray(cardId)) {
        const selectedCardInfo = cardId.map((id) => ({
            id: id,
            imageUrl: cards[id]?.imageUrl || "Image not found"
        }));
        gameState.chosenCards = [...gameState.chosenCards, ...selectedCardInfo]
    } else {
        const selectedCardInfo = {
            id: cardId,
            imageUrl: cards[cardId]?.imageUrl || "Image not found"
        };
        gameState.chosenCards = [...gameState.chosenCards, selectedCardInfo]
    }
}

function getGameState() {
    return gameState
}

function setTesting() {
    isTesting = true
}

export {
    handleGameStart,
    handleGameMasterSubmitCard,
    handleSubmitCard,
    handleNewPlayerEnter,
    handleNameSet,
    getGameState,
    setTesting,
};
