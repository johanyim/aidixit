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

function addNewPlayer() {
    const newSocket = { id: players.length }
    sockets.push(newSocket)

    const newPlayer = structuredClone(defaultPlayer);
    newPlayer.id = players.length
    players.push(newPlayer);
}

describe('test players join and ', () => {
    test('player 0 enter', () => {
        addNewPlayer()
        handleNewPlayerEnter(sockets[0])

        expect(getGameState()).toEqual(gameState);
    });

    test('player 1 enter', () => {
        addNewPlayer()
        handleNewPlayerEnter(sockets[1])

        expect(getGameState()).toEqual(gameState);
    });

    test('player 2 enter', () => {
        addNewPlayer()
        handleNewPlayerEnter(sockets[2])

        expect(getGameState()).toEqual(gameState);
    });

})

describe('test change names ', () => {
    test('change player 0 name', () => {
        const newName = 'Player 0'
        handleNameSet(sockets[0], newName)

        players[0].name = newName

        expect(getGameState()).toEqual(gameState);
    });


    test('change player 1 name', () => {
        const newName = 'Player 1'
        handleNameSet(sockets[1], newName)

        players[1].name = newName

        expect(getGameState()).toEqual(gameState);
    });

})

test('handleGameStart', () => {
    currentPhaseId += 1
    gameState.currentPhase = phases[currentPhaseId]

    handleGameStart()
    const resGameState = getGameState()
    expect(resGameState.currentPhase).toBe(gameState.currentPhase);

    const idArrays = Array.from({ length: players.length }, (_, index) => index)
    expect(idArrays).toContain(resGameState.gameMaster);

    // Set the same game master
    gameState.gameMaster = resGameState.gameMaster
});

test('game master submit card', () => {
    const gm = gameState.gameMaster
    const prompt = 'banana'
    const cardId = 1
    handleGameMasterSubmitCard(sockets[gm], { prompt: prompt, cardId: cardId })

    players[gm].submittedCard = true
    gameState.prompt = prompt
    gameState.chosenCards = [{ id: cardId, imageUrl: cardId, votedBy: [] }]
    currentPhaseId += 1
    gameState.currentPhase = phases[currentPhaseId]

    expect(getGameState()).toEqual(gameState);
});

test('others submit card', () => {
    const gm = gameState.gameMaster
    let remain = players.length - 1

    for (let i = 0; i < players.length; i++) {
        if (i !== gm) {
            // select first 2 cards
            const cardId1 = i * 6 + 1
            const cardId2 = i * 6 + 2
            handleSubmitCard(sockets[i], [cardId1,cardId2])
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
        expect(getGameState()).toEqual(gameState);
    }
});

test('voting', () => {
    for (let i = 0; i < players.length; i++) {
        // Simulate each player is voting a random card in the deck
        const player = players[i]
        const voteIndex = Math.floor(gameState.chosenCards.length * Math.random())
        const chosenCard = gameState.chosenCards[voteIndex]
        player.hasVoted = true

        gameState.votingResults.push({
            voter: player,
            cardId: chosenCard.id,
        });

        handleVoting(sockets[i], chosenCard.id)

        //Check if is last one to vote
        if (i === players.length-1) {
            currentPhaseId += 1
            gameState.currentPhase = phases[currentPhaseId]
        }

        expect(getGameState()).toEqual(gameState);
    }
});



