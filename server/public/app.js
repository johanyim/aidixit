const socket = io('http://localhost:3000');
const chatMessages = document.getElementById('chat-messages')
const handCards = document.getElementById('hand')
const messageInput = document.getElementById('message-input');
// interface CardInfo
// id:string
// url: string 
// import express from "express"
// const express = require("express")


// app.get("/index", (req, res) => {
//   res.send("Welcome home");
// });

socket.on('initialCards', (cards) => {
    // Check if imageurls is an array
    if (Array.isArray(cards)) {

        // Cards in hand
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
        // TESTING: 
        const playedCards = document.getElementById('played')
        cards.forEach((card) => {
            // Create an image element for each url and append it to the body
            const url = card.url
            const img = document.createElement('img');
            img.classList.add("card")
            img.src = url;
            playedCards.appendChild(img);
        });
        // -----
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
    if (messageInput.value) {
        // Emit the 'chatMessage' event to the server
        socket.emit('sendMessage', messageInput.value);
        messageInput.value = '';
    }


    messageInput.focus()
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
function backendTest(){
    // socket.emit('setName', 'SKT');

    // socket.emit('joinRoom', 'TEST', message => {
    //     console.log(message)
    // })

    // socket.emit('getRooms', roomArray => {
    //     console.log(roomArray)
    // })
}
