import { handleIO } from "./IOHandler.js";

export function createInfoMessage(socket) {
    return {
        to: 'all',
        message: 'infoMessage',
        args: `${socket.id.substring(0, 5)} has entered`,
    };
}

export function handleChatMessage(socket, messageInfo) {
    handleIO(socket, {
        to: 'all',
        message: 'broadcastMessage',
        args: `${socket.id.substring(0, 5)}: ${messageInfo}`,
    });
}



