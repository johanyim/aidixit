
const socket = io('http://localhost:3000');
const chatMessages = document.getElementById('chat-messages')
// interface card
// id:string
// URL: string 

socket.on('initialCards', (cards) => {
    // Check if imageURLs is an array
    if (Array.isArray(cards)) {

        // Cards being played 
        const playedCards = document.getElementById('played')
        cards.forEach((card) => {
            // Create an image element for each URL and append it to the body
            const URL = card.URL
            const img = document.createElement('img');
            img.classList.add("card")
            img.src = URL;
            playedCards.appendChild(img);
        });

        // Cards in hand
        const handCards = document.getElementById('hand')
        cards.forEach((card) => {
            // Create an image element for each URL and append it to the body
            const URL = card.URL
            const img = document.createElement('img');
            img.classList.add("card")
            img.src = URL;
            handCards.appendChild(img);
        });
    } else {
        console.error('Received data is not an array:', imageURLs);
    }
});

// interface Player {
//     id: string;
//     name: string;
//     score: number;
//     submittedCard: boolean;
//     voted: boolean;
// }

// interface GameState {
//     players: Player[];
//     currentPhase: string;
//     gameMaster: string;
//     chosenCards: any[]; // Not implemented
//     prompt: string;
// }

// const phases = ['preparation', 'gameMasterSubmit', 'othersSubmit', 'voting', 'scoring']


socket.on('updateGameState', (gameState) => {
    // if(gameState.currentPhase === 'gameMasterSubmit )
    // if(gameState.gameMaster === socket.id) ///Current player is the gamemaster
    // 
    // get prompt and cardId(s)
    // io.emit('gameMasterSubmitCard', ({prompt, cardId}) 


    // if(gameState.currentPhase === 'othersSubmit )
    // get cardId(s)
    // io.emit('otherSubmitCard', (cardId) 


})








//------------------------- CHAT


document.getElementById('message-form')
    .addEventListener('submit', sendMessage)

function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('message-input');
    if (input.value) {
        // Emit the 'chatMessage' event to the server
        socket.emit('sendMessage', input.value);
        input.value = '';
    }


    input.focus()
}


socket.on('broadcastMessage', (data) => {
    const li = document.createElement('li')
    li.textContent = data
    li.classList.add('chat')
    chatMessages.appendChild(li)
    // chatMessages.scrollTo(0, chatMessages.scrollHeight);
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on('infoMessage', (data) => {
    const li = document.createElement('li')
    li.textContent = data
    li.classList.add('info')
    chatMessages.appendChild(li)
    // chatMessages.scrollTo(0, chatMessages.scrollHeight);
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on('promptMessage', (data) => {
    const li = document.createElement('li')
    li.textContent = data
    li.classList.add('prompt')
    chatMessages.appendChild(li)
    // chatMessages.scrollTo(0, chatMessages.scrollHeight);
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// ------------------------------------------------------------------------------------------Backend Test
// function backendTest(){
//     socket.emit('setName', 'SKT');

// }