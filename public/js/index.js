document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    const totalItems = document.querySelectorAll('.swapper').length;
    let currentIndex = 0;

    const updateCarousel = () => {
        const offset = -currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;
    };

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    });

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    });
});
