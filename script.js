document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.zoomable');
    let isFullscreen = false;
    let currentImage = null;
    let startX, startY, translateX = 0, translateY = 0, scale = 1;

    // Функция для открытия изображения в полноэкранном режиме
    function openFullscreen(img) {
        const fullscreenContainer = document.createElement('div');
        fullscreenContainer.classList.add('fullscreen-image');

        const fullscreenImg = img.cloneNode();
        fullscreenContainer.appendChild(fullscreenImg);

        const closeButton = document.createElement('button');
        closeButton.classList.add('close-button');
        closeButton.textContent = 'Close';
        fullscreenContainer.appendChild(closeButton);

        document.body.appendChild(fullscreenContainer);
        document.body.classList.add('fullscreen-mode');

        isFullscreen = true;
        currentImage = fullscreenImg;

        // Закрытие полноэкранного режима
        closeButton.addEventListener('click', closeFullscreen);

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                closeFullscreen();
            }
        });

        // Увеличение изображения при прокрутке колеса мыши
        fullscreenContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale = Math.min(Math.max(0.1, scale * delta), 5); // Лимитируем увеличение
            currentImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        });

        // Перемещение изображения при зажатой левой кнопке мыши
        let isDragging = false;

        fullscreenImg.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX - translateX;
            startY = e.pageY - translateY;
            fullscreenImg.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                translateX = e.pageX - startX;
                translateY = e.pageY - startY;
                currentImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            fullscreenImg.style.cursor = 'grab';
        });

        // Поддержка сенсорных устройств (тачскрины)
        let initialPinchDistance = null;

        fullscreenImg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // Один палец - перемещение
                isDragging = true;
                const touch = e.touches[0];
                startX = touch.pageX - translateX;
                startY = touch.pageY - translateY;
                fullscreenImg.style.cursor = 'grabbing';
            } else if (e.touches.length === 2) {
                // Два пальца - масштабирование
                initialPinchDistance = getPinchDistance(e.touches);
            }
        });

        fullscreenImg.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches.length === 1) {
                const touch = e.touches[0];
                translateX = touch.pageX - startX;
                translateY = touch.pageY - startY;
                currentImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
            } else if (e.touches.length === 2 && initialPinchDistance !== null) {
                const currentPinchDistance = getPinchDistance(e.touches);
                scale *= currentPinchDistance / initialPinchDistance;
                scale = Math.min(Math.max(0.1, scale), 5); // Лимитируем увеличение
                currentImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
                initialPinchDistance = currentPinchDistance;
            }
        });

        fullscreenImg.addEventListener('touchend', () => {
            isDragging = false;
            fullscreenImg.style.cursor = 'grab';
            initialPinchDistance = null;
        });
    }

    // Закрытие полноэкранного режима
    function closeFullscreen() {
        const fullscreenContainer = document.querySelector('.fullscreen-image');
        if (fullscreenContainer) {
            fullscreenContainer.remove();
            document.body.classList.remove('fullscreen-mode');
            isFullscreen = false;
            currentImage = null;
            translateX = 0;
            translateY = 0;
            scale = 1;
        }
    }

    // Обработка двойного клика по изображению
    images.forEach(img => {
        img.addEventListener('dblclick', () => {
            openFullscreen(img);
        });
    });

    // Вспомогательная функция для расчета расстояния между двумя пальцами
    function getPinchDistance(touches) {
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }
});
