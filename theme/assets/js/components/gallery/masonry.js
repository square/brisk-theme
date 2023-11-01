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
            const props = {
                images: this.images,
                name: this.name,
                activeIndex,
            };
            this.$store.dialog.openPrimaryDialog('templates/components/dialogs/gallery-content', {
                variant: 'fullscreen',
                transition: 'left',
                scrollable: false,
                showCloseButton: false,
            }, props);
        },
    });

    Alpine.data('masonry', createMasonryData);
    Alpine.data('masonryImage', createMasonryImageData);
});
