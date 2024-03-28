document.addEventListener('alpine:init', () => {
    const createSlidesData = (dataId) => ({
        name: '',
        images: [],
        currentSlide: 1,
        totalSlides: 1,
        touchStartX: 0,
        touchEndX: 0,
        touchDirection: 'right',
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.totalSlides = this.images.length;
            this.$watch('totalSlides', (value) => {
                if (value < 1 && document.querySelector('.item-page__main-images')) {
                    // If all images failed to load, hide the slides
                    document.querySelector('.item-page__main-images').setAttribute('empty', true);
                }
            });
        },
        /**
         * Touch start event
         * @param {Event}
         */
        onTouchStart(e) {
            this.touchStartX = e.changedTouches[0].screenX;
        },
        /**
         * Touch end event
         * @param {Event}
         */
        onTouchEnd(e) {
            this.touchEndX = e.changedTouches[0].screenX;
            this.setTouchDirection();

            if (this.touchDirection === 'left') {
                this.goToNext();
            } else {
                this.goToPrevious();
            }
        },
        /**
         * Sets the touch direction
         */
        setTouchDirection() {
            this.touchDirection = this.touchEndX < this.touchStartX ? 'left' : 'right';
        },
        /**
         * Go to previous slide
         */
        goToPrevious() {
            if (this.currentSlide > 1) {
                this.currentSlide -= 1;
            }
        },
        /**
         * Go to next slide
         */
        goToNext() {
            if (this.currentSlide < this.totalSlides) {
                this.currentSlide += 1;
            }
        },
        /**
         * Go to nth slide
         * @param {Number} index
         */
        goToSlide(index) {
            if (index > 0 && index <= this.totalSlides) {
                this.currentSlide = index;
            }
        },
    });

    const createSlidesImageData = () => ({
        init() {
            this.$watch('isFailedToLoad', () => {
                this.totalSlides -= 1;
            });
        },
        /**
         * Opens the image gallery dialog
         * @param {Number} activeIndex
         */
        openImagesDialog(activeIndex = 0) {
            const templateProps = {
                images: this.images,
                name: this.name,
                activeIndex,
            };
            this.$store.dialog.openPrimaryDialog({
                templateUrl: 'templates/components/dialogs/gallery-content',
                dialogOptions: {
                    variant: 'fullscreen',
                    transition: 'left',
                    scrollable: false,
                    showCloseButton: false,
                },
                templateProps,
            });
        },
    });

    Alpine.data('slides', createSlidesData);
    Alpine.data('slidesImage', createSlidesImageData);
});
