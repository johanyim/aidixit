
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
