document.addEventListener('alpine:init', () => {
    const createItemFulfillmentData = (dataId) => ({
        model: '',
        translations: {},
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.$watch('model', (value) => {
                Alpine.store('product').updateProperty('fulfillment', value);
                this.updateFulfillmentDetail(value, true);
            });

            this.$nextTick(() => {
                if (this.model !== Constants.FULFILLMENT_SHIPPING && Utils.hasValidCoordinates(Alpine.store('global').customerLocale)) {
                    this.updateFulfillmentDetail(this.model);
                }
            });
        },
        /**
         * Finds the location by fulfillment and updates the fulfillment detail
         * @param {String} fulfillment
         * @param {Boolean} shouldFocusButton
         */
        async updateFulfillmentDetail(fulfillment, shouldFocusButton = false) {
            const { locations } = Alpine.store('product');
            const fulfillmentEnabledLocation = Utils.getLocationByFulfillment(locations, fulfillment);
            const location = fulfillmentEnabledLocation ?? locations[0];

            Alpine.store('product').updateProperty('locationId', location.id);

            await Square.async.refreshAsyncTemplate('fulfillment-detail', {
                fulfillment,
                location: Utils.formatLocationWithDistance(location),
            });

            if (shouldFocusButton && this.$refs.fulfillmentDetail) {
                await this.$nextTick(() => {
                    this.$refs.fulfillmentDetail.getElementsByTagName('button')?.[0]?.focus({ focusVisible: true });
                });
            }
        },
        /**
         * Opens the locations dialog
         */
        openLocationsDialog() {
            const props = {
                fulfillment: this.model,
                locationId: Alpine.store('product').locationId,
                locations: [],
                alpine_store_name: 'product',
            };
            this.$store.dialog.openPrimaryDialog('templates/components/dialogs/locations-content', {
                scrollable: false,
                size: 'large',
                showPrimaryButton: true,
                showSecondaryButton: true,
                disablePrimaryButton: true,
                primaryButtonText: this.translations.buttonUpdate,
                secondaryButtonText: this.translations.buttonCancel,
                buttonPosition: 'header',
            }, props);
        },
    });

    Alpine.data('itemFulfillment', createItemFulfillmentData);
});
