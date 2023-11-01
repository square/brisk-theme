document.addEventListener('alpine:init', () => {
    const createItemOptionData = (dataId) => ({
        productId: null,
        property: null,
        options: [],
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.$watch('model', (value) => {
                this.formData[this.property].value = value;
                this.isInvalid = false;
            });

            // Toggles error message
            this.$watch('invalidOptionIds', (invalidOptionIds) => {
                this.isInvalid = invalidOptionIds.includes(this.property);
            });
        },
    });

    Alpine.data('itemOption', createItemOptionData);
});
