document.addEventListener('alpine:init', () => {
    const createFulfillmentSelectionData = (dataId) => ({
        model: Alpine.store('global').fulfillment,
        options: [],
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.$watch('model', (value) => {
                Alpine.store('siteWideFulfillment').onFulfillmentSelected(value);
            });
        },
        onFulfillmentButtonClick(value) {
            this.model = value;
        },
    });

    Alpine.data('fulfillmentSelection', createFulfillmentSelectionData);
});
