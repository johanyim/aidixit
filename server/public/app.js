
const socket = io('http://localhost:3000');

socket.on('images', (imageURLs) => {
    // Check if imageURLs is an array
    if (Array.isArray(imageURLs)) {
        // Loop through the array of image URLs
        const cardsList = document.getElementById('cards')
        imageURLs.forEach((imageURL) => {
            // Create an image element for each URL and append it to the body
            const img = document.createElement('img');
            img.classList.add("card")
            img.src = imageURL;
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