document.addEventListener('alpine:init', () => {
    const createGalleryDialogData = (activeIndex = 0) => ({
        imagesScroll: null,
        thumbnailsScroll: null,
        dialogHeight: 0,
        imagesLoaded: [],
        isLoadingImages: true,
        activeImageIndex: activeIndex,
        lastFocusedElement: document.activeElement !== document.body ? document.activeElement : null,
        /**
         * Initial events
         */
        async init() {
            await this.$nextTick();

            // Wait until the dialog header is ready
            await Utils.waitUntil(() => this.$refs.galleryDialogHeader.offsetHeight);

            this.imagesScroll = this.$refs.galleryImagesScroll;
            this.thumbnailsScroll = this.$refs.galleryThumbnailsScroll;
            this.dialogHeight = this.$refs.galleryDialogHeader.offsetHeight;

            // Show loader until images are done loading
            const images = this.imagesScroll?.getElementsByClassName('gallery-images__figure');
            await Utils.waitUntil(() => this.imagesLoaded.length === Number(images?.length));
            this.isLoadingImages = false;

            // Scroll to the active image
            if (this.activeImageIndex > 0) {
                this.handleThumbnailClick(this.activeImageIndex);
            }
        },
        /**
         * Images dialog container styles
         * @return {Object}
        */
        getContainerStyles() {
            return {
                height: this.pageHeight - this.dialogHeight,
            };
        },
        /**
         * Image offset top position by index
         * @param {Number} index
         * @return {Number} offsetTop
         */
        getImagePosition(index) {
            const imageElements = this.imagesScroll?.getElementsByClassName('gallery-images__figure');
            if (imageElements?.length) {
                return imageElements?.[index]?.offsetTop;
            }
            return 0;
        },
        /**
         * Image loaded complete callback
         * @param {String} url
         */
        onImageLoaded(url) {
            if (url) {
                this.imagesLoaded.push(url);
            }
        },
        /**
         * Product images scroll event listener
         * @param {Event} event
         */
        onGalleryImagesScroll(event) {
            this.scrollToActiveImage(event.target.scrollTop);
        },
        /**
         * Scroll to the active image
         * @param {Number} scrollTo
         */
        async scrollToActiveImage(scrollTo = 0) {
            const imageElements = this.imagesScroll?.getElementsByClassName('gallery-images__figure') ?? [];
            const scrollTop = Math.round(scrollTo);
            const scrollPositions = [];
            const lastScrollPosition = Math.round(this.imagesScroll.scrollHeight - this.imagesScroll.offsetHeight);

            // Get images scrolling position
            for (let i = 0; i < imageElements.length; i += 1) {
                scrollPositions[i] = this.getImagePosition(i);
            }

            // Get the next image scrolling position
            const scrolledImages = scrollPositions.filter((position, index) => {
                const nextPosition = scrollPositions[index + 1];
                if (nextPosition) {
                    return position <= scrollTop;
                }
                const prevPosition = scrollPositions[index - 1];
                const prevImageHeight = imageElements[index - 1] ? imageElements[index - 1].clientHeight / 2 : 0;
                return scrollTop > (prevPosition + prevImageHeight) || scrollTop === lastScrollPosition;
            });

            // Set the new active image index
            this.activeImageIndex = scrolledImages.length - 1;

            this.$nextTick(() => {
                const activeThumbnailEl = this.thumbnailsScroll.getElementsByClassName('gallery-thumbnails__figure')?.[this.activeImageIndex];

                // Check if the active thumbnail is visible in the viewport
                if (activeThumbnailEl && !Utils.isInViewport(activeThumbnailEl)) {
                    this.thumbnailsScroll.scrollTo({
                        top: this.activeImageIndex === 0 ? 0 : activeThumbnailEl.offsetTop,
                        behavior: 'smooth',
                    });
                }
            });
        },
        /**
         * Image thumbnail click event
         * @param {Number} index
         */
        handleThumbnailClick(index) {
            const imageElements = this.imagesScroll?.getElementsByClassName('gallery-images__figure') ?? [];

            if (imageElements.length) {
                // Update the active image index
                this.activeImageIndex = index;

                // Scrollbar needs to be visible in order to trigger scrollTo smooth behavior
                this.imagesScroll.style.visibility = 'visible';
                this.$nextTick(() => {
                    // Scroll to the active image
                    this.imagesScroll.scrollTo({
                        top: this.getImagePosition(index),
                        behavior: 'smooth',
                    });
                    // Hide the scrollbar after scrolling finishes
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        this.imagesScroll.style.removeProperty('visibility');
                    }, 1000);
                });
            }
        },
    });

    Alpine.data('galleryDialog', createGalleryDialogData);
});
