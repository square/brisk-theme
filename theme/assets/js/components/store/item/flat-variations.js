document.addEventListener('alpine:init', () => {
    const createItemFlatVariationsData = (dataId) => ({
        productId: null,
        variations: [],
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            // Pre-select the first variation
            this.model = this.variations[0].name;
            this.formData.variation = { value: this.variations[0].id };

            this.$watch('model', (value) => {
                const currentVariation = this.variations.find((variation) => variation.name === value);
                this.formData.variation = { value: currentVariation?.id };
                this.isInvalid = false;
            });

            // Toggles error message
            this.$watch('isInvalidVariationId', (isInvalidVariationId) => {
                this.isInvalid = isInvalidVariationId;
            });
        },
    });

    Alpine.data('itemFlatVariations', createItemFlatVariationsData);
});
