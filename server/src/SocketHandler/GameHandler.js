import {
    handleGameStart,
    handleGameMasterSubmitCard,
    handleSubmitCard,
    handleNewPlayerEnter,
    handleVoting,
    handleScoring,
} from '../game.js';
import { handleIO } from './IOHandler.js';


export function handleGameEvent(socket, eventName, data = null) {
    let res;

    switch (eventName) {
        case 'gameStart':
            res = handleGameStart();
            break;
        case 'gameMasterSubmitCard':
            res = handleGameMasterSubmitCard(socket, data);
            break;
        case 'submitCard':
            console.log(data);
            res = handleSubmitCard(socket, data);
            break;
        case 'vote':
            res = handleVoting(socket, data);
            break;
        case 'scoring':
            res = handleScoring();
            break;
        default:
            // Handle unknown event
            break;
    }

    handleIO(socket, res);
}