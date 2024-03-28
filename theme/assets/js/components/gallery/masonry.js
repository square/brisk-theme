document.addEventListener('alpine:init', () => {
    const createMasonryData = (dataId) => ({
        name: '',
        images: [],
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);
        },
    });

    const createMasonryImageData = () => ({
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

    Alpine.data('masonry', createMasonryData);
    Alpine.data('masonryImage', createMasonryImageData);
});
