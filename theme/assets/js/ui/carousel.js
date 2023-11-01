if (!window.onCarouselReady) {
    window.onCarouselReady = () => {
        const createCarouselUIData = (isFullBleed = false) => ({
            isDragging: false,
            isFullBleed,
            dragStartX: 0,
            dragEndX: 0,
            startScrollLeft: 0,
            scrollLeft: 0,
            translateX: 0,
            sliderWidth: 0,
            carouselWidth: 0,
            carouselNavPosition: 0,
            scrollOffset: 0, // Used to reduce the scrolling left position
            totalSlides: 0,
            currentIndex: 0,
            /**
             * Initial events (We can't use `init()` b/c it'll get overwritten by the block data)
             */
            async initCarousel() {
                await this.$nextTick();

                if (this.isFullBleed) {
                    this.$watch('scrollLeft', (left) => {
                        this.$refs.carouselSlider.scrollLeft = left;
                    });
                }

                this.$watch('pageWidth', () => this.$nextTick(this.setupCarousel()));

                // Assigns index
                Object.values(this.$refs.carouselSlider.children).forEach((slide, i) => {
                    slide.setAttribute('data-carousel-index', i);
                });

                this.setupCarousel();
            },
            /**
             * Calculates the scrolling size and initializes the carousel
             */
            setupCarousel() {
                // Used to calculate overlay nav position
                const carouselSlides = this.$refs.carouselSlider.getElementsByClassName('ui-carousel-slide')?.length
                    ? this.$refs.carouselSlider.getElementsByClassName('ui-carousel-slide')
                    : this.$refs.carouselSlider.children;
                this.carouselWidth = this.$refs.carousel.offsetWidth;
                this.totalSlides = carouselSlides?.length;

                if (carouselSlides.length && this.$refs.carouselOverlayNav) {
                    const navHeight = this.$refs.carouselOverlayNav.offsetHeight ?? 24;
                    this.carouselNavPosition = `${Math.round((carouselSlides[0].offsetHeight - navHeight) / 2)}px`;
                }

                this.$nextTick(() => {
                    this.sliderWidth = this.$refs.carouselSlider.offsetWidth;
                });
            },
            /**
             * Slider styles
             * @return {Object}
             */
            getCarouselSliderStyles() {
                if (!this.isFullBleed && !Utils.isTouchDevice()) {
                    return { transform: `translateX(-${this.scrollLeft}px)` };
                }
                return {};
            },
            /**
             * Checks if the carousel can scroll
             * @return {Boolean}
             */
            canScroll() {
                return this.sliderWidth > this.carouselWidth;
            },
            /**
             * Checks if the carousel is at the beginning
             * @return {Boolean}
             */
            isAtBeginning() {
                return this.scrollLeft === 0;
            },
            /**
             * Checks if the carousel is at the end
             * @return {Boolean}
             */
            isAtEnd() {
                let totalVisibleSlides = 1;
                if (this.totalSlides > 0 && this.sliderWidth > 0 && !this.isFullBleed) {
                    // Get the number of slides that are visible in the viewport - exludes partially visible slide
                    totalVisibleSlides = Math.floor(this.carouselWidth / (this.sliderWidth / this.totalSlides));
                }
                return (this.currentIndex + totalVisibleSlides) === this.totalSlides;
            },
            /**
             * Gets the scrolling position
             * @param {Number} slideIndex
             * @param {Number} scrollToRight
             * @return {Number}
             */
            getScrollPosition(slideIndex, scrollToRight = true) {
                let slideOffset = (this.$refs.carouselSlider.children[slideIndex]?.offsetLeft || 0) - this.scrollOffset || 0;

                if (this.isFullBleed) {
                    return slideOffset;
                }

                const maxScrollLeftOffset = this.sliderWidth - this.carouselWidth + this.scrollOffset || 0;

                if (scrollToRight) {
                    return Math.min(slideOffset ?? this.sliderWidth, maxScrollLeftOffset);
                }

                let scrollOffset = Math.max(slideOffset, 0);
                let prevSlideIndex = slideIndex;
                if (scrollOffset > this.scrollLeft) {
                    // Find the closest scrollable slide offset
                    while (scrollOffset >= this.scrollLeft) {
                        prevSlideIndex -= 1;
                        slideOffset = this.$refs.carouselSlider.children[prevSlideIndex]?.offsetLeft || 0;
                        scrollOffset = slideOffset - this.scrollOffset || 0;
                    }
                }
                return Math.min(scrollOffset ?? this.scrollLeft, maxScrollLeftOffset);
            },
            /**
             * Scroll to the previous
             */
            scrollToPrev() {
                this.$nextTick(() => {
                    if (!this.isAtBeginning()) {
                        this.currentIndex -= 1;
                        this.scrollLeft = this.getScrollPosition(this.currentIndex, false);
                    }
                });
            },
            /**
             * Scroll to the next
             */
            scrollToNext() {
                this.$nextTick(() => {
                    if (!this.isAtEnd()) {
                        this.currentIndex += 1;
                        this.scrollLeft = this.getScrollPosition(this.currentIndex, true);
                    }
                });
            },
            /**
             * Go to nth slide
             * @param {Number} index 0 or higher
             */
            goToSlide(index) {
                if (index < this.totalSlides) {
                    const shouldSlideToRight = index > this.currentIndex;
                    this.currentIndex = index;

                    this.scrollLeft = this.getScrollPosition(this.currentIndex, shouldSlideToRight);
                }
            },
            /**
             * Starts the drag scrolling
             * @param {Event} event
             */
            onCarouselDragStart(event) {
                if (Utils.isTouchDevice()) {
                    return;
                }
                this.isDragging = true;
                this.dragStartX = event.pageX - this.$refs.carouselSlider.offsetLeft - this.scrollOffset;
                this.startScrollLeft = this.scrollLeft;
            },
            /**
             * Ends the drag scrolling
             */
            onCarouselDragEnd() {
                if (Utils.isTouchDevice()) {
                    return;
                }
                const isCarouselItemClicked = this.startScrollLeft === this.scrollLeft;

                // Immediately reset if drag ended w/o movement to trigger the click event inside the carousel
                if (isCarouselItemClicked) {
                    this.isDragging = false;
                }

                this.$nextTick(() => {
                    this.isDragging = false;

                    if (this.isFullBleed && !isCarouselItemClicked) {
                        const draggedToRight = this.dragStartX > this.dragEndX;
                        const slideIndex = draggedToRight ? this.currentIndex + 1 : this.currentIndex - 1;
                        // Snap the slide to the center of the container
                        this.goToSlide(slideIndex);
                    }
                });
            },
            /**
             * Updates the scrolling position on mouse move
             * @param {Event} event
             */
            onCarouselDrag(event) {
                if (!this.isDragging || Utils.isTouchDevice()) {
                    return;
                }

                this.dragEndX = event.pageX - this.$refs.carouselSlider.offsetLeft - this.scrollOffset;

                let scrollLeft = Math.max(this.startScrollLeft - ((this.dragEndX - this.dragStartX) * 3), 0);

                if (!this.isFullBleed) {
                    // scroll left position can't be bigger than the maximum scroll left position
                    scrollLeft = Math.min(scrollLeft, this.sliderWidth - this.carouselWidth + (this.scrollOffset * 2));
                }

                // Update scroll position
                this.scrollLeft = scrollLeft;

                if (!this.isFullBleed) {
                    this.updateCurrentIndex(this.scrollLeft);
                }
            },
            /**
             * Carousel scroll event
             * @param {Event} event
             */
            onCarouselScroll(event) {
                if (!this.isFullBleed) {
                    this.scrollLeft = event.target.scrollLeft;
                }

                this.updateCurrentIndex(event.target.scrollLeft);
            },
            /**
             * Updates the currentIndex by scrolling position
             * @param {Number} scrollLeft
             */
            updateCurrentIndex(scrollLeft = 0) {
                // Finds the first visible slide from the carousel container
                const closestSlideIndex = Object.values(this.$refs.carouselSlider.children)
                    .findIndex((slide) => slide.offsetLeft > scrollLeft);

                if (closestSlideIndex >= 0) {
                    this.currentIndex = closestSlideIndex;
                }
            },
            /**
             * Updates the current slide index on window resize
             */
            onResize() {
                const scrollLeft = this.getScrollPosition(this.currentIndex);
                this.scrollLeft = scrollLeft;
            },
        });

        Alpine.data('carouselUI', createCarouselUIData);
    };
}

document.addEventListener('alpine:init', window.onCarouselReady);

document.addEventListener('async:alpine:init', window.onCarouselReady);
