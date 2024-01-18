const {
    handleGameStart,
    handleGameMasterSubmitCard,
    handleSubmitCard,
    handleNewPlayerEnter,
    handleNameSet,
    getGameState,
    defaultPlayer,
    defaultGameState,
    setTesting,
    handleScoring,
    handleVoting,
} = require('./game.js');

const phases = ['preparation', 'gameMasterSubmit', 'othersSubmit', 'voting', 'scoring']
let currentPhaseId = 0

const sockets = []
const players = []

const gameState = structuredClone(defaultGameState)
gameState.players = players

setTesting()


const expectGameStateToEqual = () => {
    expect(getGameState()).toEqual(gameState);
};


function addNewPlayer() {
    const newSocket = { id: players.length }
    sockets.push(newSocket)

    const newPlayer = structuredClone(defaultPlayer);
    newPlayer.id = players.length
    players.push(newPlayer);
}

const simulatePlayerJoin = (socketIndex) => {
    addNewPlayer();
    handleNewPlayerEnter(sockets[socketIndex]);
    expectGameStateToEqual();
};

const simulateChangeName = (socketIndex, newName) => {
    handleNameSet(sockets[socketIndex], newName);
    players[socketIndex].name = newName;
    expectGameStateToEqual();
};

describe('test players join and ', () => {
    test('player 0 enter', () => simulatePlayerJoin(0));
    test('player 1 enter', () => simulatePlayerJoin(1));
    test('player 2 enter', () => simulatePlayerJoin(2));
});


describe('test change names ', () => {
    test('change player 0 name', () => simulateChangeName(0, 'Player 0'));
    test('change player 1 name', () => simulateChangeName(1, 'Player 1'));
});

test('handleGameStart', () => {
    //simulate game start
    currentPhaseId += 1
    gameState.currentPhase = phases[currentPhaseId]

    handleGameStart()
    const curGameState = getGameState()
    expect(curGameState).toBe(gameState.currentPhase);

    //Check if a gameMaster is selected
    const idArrays = Array.from({ length: players.length }, (_, index) => index)
    expect(idArrays).toContain(curGameState.gameMaster);

    // Set the same game master
    gameState.gameMaster = curGameState.gameMaster
});

test('game master submit card', () => {
    //simulate game master select a card and prompt
    const gm = gameState.gameMaster
    const prompt = 'banana'
    const cardId = 1
    handleGameMasterSubmitCard(sockets[gm], { prompt: prompt, cardId: cardId })

    players[gm].submittedCard = true
    gameState.prompt = prompt
    gameState.chosenCards = [{ id: cardId, imageUrl: cardId, votedBy: [] }]
    currentPhaseId += 1
    gameState.currentPhase = phases[currentPhaseId]

    expectGameStateToEqual();
});

test('others submit card', () => {
    //simulate other people select 2 cards
    const gm = gameState.gameMaster
    let remain = players.length - 1

    for (let i = 0; i < players.length; i++) {
        if (i !== gm) {
            // select first 2 cards
            const cardId1 = i * 6 + 1
            const cardId2 = i * 6 + 2
            handleSubmitCard(sockets[i], [cardId1, cardId2])
            players[i].submittedCard = true
            gameState.chosenCards.push({ id: cardId1, imageUrl: cardId1, votedBy: [] })
            gameState.chosenCards.push({ id: cardId2, imageUrl: cardId2, votedBy: [] })

            remain -= 1
            //Check if it is the last player to submit
            if (remain === 0) {
                currentPhaseId += 1
                gameState.currentPhase = phases[currentPhaseId]
            }
        }
        expectGameStateToEqual();

    }
});

test('voting', () => {
    //simulate other people voting
    const gm = gameState.gameMaster
    let remain = players.length - 1

    for (let i = 0; i < players.length; i++) {
        // Simulate each player is voting a random card in the deck
        if (i !== gm) {

            const player = players[i]
            const voteIndex = Math.floor(gameState.chosenCards.length * Math.random())
            const chosenCard = gameState.chosenCards[voteIndex]
            player.hasVoted = true

            gameState.votingResults.push({
                voter: player,
                cardId: chosenCard.id,
            });
            handleVoting(sockets[i], chosenCard.id)

            remain -= 1
            //Check if it is the last player to vote
            if (remain === 0) {
                currentPhaseId += 1
                gameState.currentPhase = phases[currentPhaseId]
            }
        }
        expectGameStateToEqual();
    }
});


