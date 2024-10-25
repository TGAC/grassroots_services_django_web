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

// Sets up the image carousel based on the `images` variable passed from the main script
function setupImageCarousel(images, plotId) {
    combinedImages = [];

    // Separate images and thumbnails
    images.forEach(url => {
        if (url.includes(`/plot_${plotId}/thumb`)) {
            const contentUrl = url.replace('/thumb_', '/');
            combinedImages.push({ thumbnail: url, contentUrl });
        }
    });

    // Create carousel HTML
    const htmlArray = [];
    htmlArray.push('<div class="image-carousel">');
    htmlArray.push('<button class="carousel-button" style="position: absolute; left: 0;" onclick="changeImage(-1)">&#10094;</button>'); // Left arrow

    combinedImages.forEach((image, index) => {
        const dateTitle = formatDateFromFilename(image.thumbnail);
        htmlArray.push(`<div class="image-container" style="display: ${index === 0 ? 'block' : 'none'};">`);
        htmlArray.push(`<div class="image-title">${dateTitle}</div>`);
        htmlArray.push(`<a href="${image.contentUrl}" target="_blank"><img class="carouselImage" src="${image.thumbnail}" height="300" onerror="this.onerror=null; this.src='fallback.jpg';"/></a>`);
        htmlArray.push('</div>');
    });

    htmlArray.push('<button class="carousel-button" style="position: absolute; right: 0;" onclick="changeImage(1)">&#10095;</button>'); // Right arrow
    htmlArray.push('</div>');

    // Add carousel to the DOM (assume you have a div with id 'carouselContainer' to inject this HTML)
    document.getElementById('carouselContainer').innerHTML = htmlArray.join('');
}
