const socket = io('http://localhost:3000');
const chatMessages = document.getElementById('chat-messages')
// interface CardInfo
// id:string
// url: string 

socket.on('initialCards', (cards) => {
    // Check if imageurls is an array
    if (Array.isArray(cards)) {

        // Cards in hand
        const handCards = document.getElementById('hand')
        cards.forEach((card) => {
            // Create an image element for each url and append it to the body
            
            // filler id for testing
            const id = Math.floor(Math.random() * 10000000);

            const url = card.url
            const img = document.createElement('img');
            img.classList.add("card")
            img.src = url;
            img.addEventListener('click', () => {
                console.log(url);
                socket.emit('otherSubmitCard', (id))
            })
            handCards.appendChild(img);
        });
    } else {
        console.error('received data is not an array:', cards);
    }
});


socket.on('cardsPlayed', (cards) => {
    if (Array.isArray(cards)) {

        // Cards being played 
        const playedCards = document.getElementById('played')
        cards.forEach((card) => {
            // Create an image element for each url and append it to the body
            const url = card.url
            const img = document.createElement('img');
            img.classList.add("card")
            img.src = url;
            playedCards.appendChild(img);
        });
    } else {
        console.error('received data is not an array:', cards);
    }
})

// interface Player {
//     id: string;
//     name: string;
//     score: number;
//     submittedCard: boolean;
//     voted: boolean;
// }

// const phases = ['preparation', 'gameMasterSubmit', 'othersSubmit', 'voting', 'scoring']
// interface GameState {
//     players: Player[];
//     currentPhase: string;
//     gameMaster: string; //playerId of the current gameMaster
//     chosenCards: cardInfo[]; // // Include all the card infos submitted, use in voting phase (when all players submitted)
//     prompt: string;
// }



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
