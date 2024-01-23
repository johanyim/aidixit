import { socketToRoomMap } from "../../server.js";
import { getIo } from "../socketSetup.js";

// to = 'all' | 'sender'
export function handleIO(socket, res) {
    // No response received 
    if (res === null || res == undefined) return

    const { to, message, args } = res

    if (to === 'all') {
        const room = socketToRoomMap[socket.id];
        if (room === undefined || room === null) {
            getIo().emit(message, args)
        } else {
            getIo().to(room).emit(message, args)
        }
    } else if (to === 'sender') {
        socket.emit(message, args)
    }
}