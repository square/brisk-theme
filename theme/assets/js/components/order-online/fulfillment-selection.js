document.addEventListener('alpine:init', () => {
    const createFulfillmentSelectionData = () => ({
        model: '',
        init() {
            this.model = Alpine.store('global').fulfillment;

            this.$watch('model', (value) => {
                Alpine.store('global').updateProperty('fulfillment', value);
                
            });
        },
    });

    Alpine.data('fulfillmentSelection', createFulfillmentSelectionData);
});
