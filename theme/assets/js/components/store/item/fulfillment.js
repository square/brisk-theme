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

            const fulfillmentDetail = document.querySelector('#fulfillmentDetail');
            if (fulfillmentDetail) {
                const formattedLocation = Utils.formatLocationWithDistance(location);
                await Utils.refreshTemplate({
                    template: 'partials/components/store/item/fulfillment-detail',
                    props: {
                        fulfillment,
                        location,
                        formatted_distance: formattedLocation.formatted_distance,
                    },
                    el: fulfillmentDetail,
                });
            }

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
            const templateProps = {
                fulfillment: this.model,
                locationId: Alpine.store('product').locationId,
                locations: [],
                alpine_store_name: 'product',
            };
            this.$store.dialog.openPrimaryDialog({
                templateUrl: 'templates/components/dialogs/locations-content',
                dialogOptions: {
                    scrollable: false,
                    size: 'large',
                    showPrimaryButton: true,
                    showSecondaryButton: true,
                    disablePrimaryButton: true,
                    primaryButtonText: this.translations.buttonUpdate,
                    secondaryButtonText: this.translations.buttonCancel,
                    buttonPosition: 'header',
                },
                templateProps,
            });
        },
    });

    Alpine.data('itemFulfillment', createItemFulfillmentData);
});
