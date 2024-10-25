// imageCarousel.js

let combinedImages = [];

// Parses the filename to format it as a readable date
function formatDateFromFilename(filename) {
    const regex = /(\d{4})_(\d{2})_(\d{2})/; // Regex to find date pattern YYYY_MM_DD
    const matches = filename.match(regex);
    if (matches) {
        const year = matches[1];
        const month = matches[2];
        const day = matches[3];
        const date = new Date(`${year}-${month}-${day}`);
        return date.toLocaleDateString('en-UK', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return '';
}

// Carousel navigation function
function changeImage(direction) {
    const containers = document.querySelectorAll('.image-container');
    let currentIndex = Array.from(containers).findIndex(container => container.style.display === 'block');
    containers[currentIndex].style.display = 'none';
    currentIndex += direction;
    if (currentIndex >= containers.length) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = containers.length - 1;
    }
    containers[currentIndex].style.display = 'block';
}