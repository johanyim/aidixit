
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
    document.getElementById('chat-messages')
        .appendChild(li)
})
