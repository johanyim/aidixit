
const socket = io('http://localhost:3000');



// interface card
// id:string
// URL: string 

socket.on('initialCards', (cards) => {
    // Check if imageURLs is an array
    if (Array.isArray(cards)) {
        // Loop through the array of image URLs
        const cardsList = document.getElementById('cards')
        cards.forEach((card) => {
            // Create an image element for each URL and append it to the body
            const URL = card.URL
            const img = document.createElement('img');
            img.classList.add("card")
            img.src = URL;
            cardsList.appendChild(img);
        });
    } else {
        console.error('Received data is not an array:', imageURLs);
    }
});

//------------------------- CHAT
// Listen for 'chatMessage' events from the server
socket.on('broadcastMessage', (message) => {
    displayMessage(message);
});


function displayMessage(message) {
    // const messageElement = document.createElement('div');
    const messageElement = document.createElement('li');
    messageElement.textContent = message;

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.appendChild(messageElement);

    // Scroll to the bottom of the chat container to show the latest messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message.trim() !== '') {
        // Emit the 'chatMessage' event to the server
        socket.emit('sendMessage', message);
        messageInput.value = '';
    }
}