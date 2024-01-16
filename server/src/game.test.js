const {
    handleGameStart,
    handleGameMasterSubmitCard,
    handleSubmitCard,
    handleNewPlayerEnter,
    handleNameSet,
    getGameState,
    defaultPlayer,
} = require( './game.js');

const phases = ['preparation', 'gameMasterSubmit', 'othersSubmit', 'voting', 'scoring']
let currentPhaseId = 0

const gameState = {
    players: [],
    currentPhase: phases[currentPhaseId], // phases[0]
    gameMaster: '', // ID of the current game master
    chosenCards: [],
    prompt: '',
};

const socket = {id:'1'};
const newPlayer1 = structuredClone(defaultPlayer)
newPlayer1.id = '1'

test('player 1 enter', () => {
    handleNewPlayerEnter(socket)
    gameState.players = [newPlayer1]
    
    expect(getGameState()).toEqual(gameState);
});

test('change player name', () => {
    const newName = 'Player 1'
    handleNameSet(socket, newName)

    newPlayer1.name = newName
    gameState.players = [newPlayer1]

    expect(getGameState()).toEqual(gameState);
});