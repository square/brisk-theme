document.addEventListener('alpine:init', () => {
    const createLocationsDialogData = (dataId) => ({
        fulfillment: Constants.FULFILLMENT_PICKUP,
        locationId: '',
        alpineStoreName: 'product',
        suggestions: [],
        hasFetchedLocations: false,
        isLoadingLocationSelector: false,
        /**
         * Initial events
        */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.$store.dialog.onClose = (isConfirmed) => {
                if (isConfirmed) {
                    const location = this.getLocations().find((loc) => loc.id === this.locationId) ?? this.getLocations()[0];
                    const fulfillmentDetail = document.querySelector('#fulfillmentDetail');

                    if (fulfillmentDetail && this.fulfillment?.length) {
                        Utils.refreshTemplate({
                            template: 'partials/components/store/item/fulfillment-detail',
                            props: {
                                fulfillment: this.fulfillment,
                                location,
                                formatted_distance: location.formatted_distance,
                            },
                            el: fulfillmentDetail,
                        });
                    }

                    if (this.locationId?.length && Alpine.store(this.alpineStoreName)) {
                        Alpine.store(this.alpineStoreName).updateProperty('locationId', this.locationId);
                    }
                }
            };
        },
        /**
         * Get suggested place item from global store
         * @return {Object}
         */
        getSuggestedPlaceItem() {
            return Alpine.store('global').suggestedPlaceItem;
        },
        /**
         * Updates suggested place item
         * @param {Object}
         */
        updateSuggestedPlaceItem(value) {
            Alpine.store('global').updateProperty('suggestedPlaceItem', value);
        },
        /**
         * Checks if the user selected the autocomplete item
         * @return {Boolean}
         */
        hasSelectedItem() {
            return Boolean(this.getSuggestedPlaceItem()?.place_id);
        },
        /**
         * Get locations from global store
         * @return {Object}
         */
        getLocations() {
            return Alpine.store('global').locations;
        },
        /**
         * Get total locations
         * @return {Number}
         */
        getLocationsCount() {
            return this.getLocations().length;
        },
        /**
         * Checks if the locations are available
         */
        hasLocations() {
            return this.getLocationsCount() > 0;
        },
        /**
         * Gets the locations by fulfillment
         * @param {Boolean} shouldFocusLocations - focuses the locations list on complete
         * @param {String} fulfillment
         */
        async fetchLocations({ shouldFocusLocations = true, fulfillmentType = Constants.FULFILLMENT_PICKUP, sort } = {}) {
            this.hasFetchedLocations = false;

            const input = {
                filters: {
                    fulfillments: [fulfillmentType],
                },
                limit: 10,
            };

            if (sort) {
                input.sort = {
                    from: sort,
                };
            }

            try {
                await Alpine.store('global').getLocations(input).then(async (locations) => {
                    const formattedDistance = locations.map((loc) => loc.formatted_distance);

                    this.isLoadingLocationSelector = true;

                    if (this.$refs.locationSelector) {
                        await Utils.refreshTemplate({
                            template: 'partials/components/store/item/location-selector',
                            props: {
                                locations,
                                formatted_distance: formattedDistance,
                            },
                            el: this.$refs.locationSelector,
                        });
                    }

                    this.isLoadingLocationSelector = false;

                    const hasLocationSelected = this.hasLocations() && this.locationId?.length;
                    Alpine.store('dialog').updateDialogOptions('disablePrimaryButton', !hasLocationSelected);

                    this.hasFetchedLocations = true;
                });

                this.$nextTick(() => {
                    if (shouldFocusLocations) {
                        this.focusLocationList();
                    }
                });
            } catch (e) {
                // @todo: error alert
            }
        },
        /**
         * Focuses the locations list
         */
        focusLocationList() {
            const nextFocusableElement = this.$refs.locations.querySelector('input:not(disabled)');
            if (nextFocusableElement) {
                nextFocusableElement.focus({ focusVisible: true });
            }
        },
    });

    const createItemSuggestionsData = () => ({
        model: Alpine.$persist(''),
        items: Alpine.$persist([]),
        /**
         * Initial events
         */
        async init() {
            // Pre-populate the input based on the history
            this.$nextTick(async () => {
                this.isLoadingAutocomplete = true;
                if (!Object.values(this.getSuggestedPlaceItem()).length && !this.items.length) {
                    await this.initForFirstTimer();
                } else {
                    await this.initForReturning();
                }
                this.isLoadingAutocomplete = false;
            });
        },
        /**
         * Load the locations by the user's current location for first time visitor
         */
        async initForFirstTimer() {
            const globalStore = Alpine.store('global');
            await globalStore.getCustomerCoordinates();
            const { customerLocale } = globalStore;
            let sort;

            if (customerLocale.postal_code) {
                this.model = customerLocale.postal_code;
                sort = {
                    lat: customerLocale.latitude,
                    lng: customerLocale.longitude,
                };
            }

            await this.fetchLocations({ sort });
        },
        /**
         * Load the locations by the user's last selection for returning visitor
         */
        async initForReturning() {
            if (this.items.length) {
                await this.refreshDropdown();
                this.toggleDropdown(false);
            }

            const promises = [];

            if (this.hasSelectedItem()) {
                promises.push(
                    this.fetchLocations({
                        sort: {
                            place_id: this.getSuggestedPlaceItem().place_id,
                        },
                    }),
                    this.getPlaceDetails(this.getSuggestedPlaceItem().place_id),
                );
            } else {
                promises.push(this.fetchLocations());
            }

            await Promise.all(promises);
            this.hasFetchedLocations = true;
        },
        /**
         * Get locations by autocomplete input
         */
        loadSuggestions() {
            return SquareWebSDK.places.autocompletePlaces({
                address: this.model,
            })
                .then(async ({ data }) => {
                    if (data) {
                        this.items = this.formatSuggestions(data);
                    } else {
                        this.items = [];
                    }
                });
        },
        /**
         * Formats the suggestions with label and value
         * @return {Array}
         */
        formatSuggestions(data) {
            return data.map((suggestion) => ({ ...suggestion, label: suggestion.description, value: Utils.deepGet(suggestion, 'place_id') }));
        },
        /**
         * Gets input value to display to the user
         * @return {String}
         */
        getInputValue(value) {
            return value?.description ?? this.model;
        },
        /**
         * Gets the place coordinates
         */
        async getPlaceDetails(placeId) {
            if (Utils.hasValidCoordinates(this.getSuggestedPlaceItem()) && this.getSuggestedPlaceItem().place_id === placeId) {
                return;
            }
            await SquareWebSDK.places.getPlace({ placeId })
                .then(async ({ data }) => {
                    if (Utils.hasValidCoordinates(data)) {
                        this.updateSuggestedPlaceItem({
                            ...this.getSuggestedPlaceItem(),
                            latitude: data.latitude,
                            longitude: data.longitude,
                        });
                    }
                });
        },
        /**
         * Updates the locations list and gets the place detail
         * @param {Object} value
         */
        onAutocompleteItemSelect(value) {
            this.toggleDropdown(false);

            if (value?.place_id) {
                this.isLoadingAutocomplete = true;
                this.$nextTick(async () => {
                    this.updateSuggestedPlaceItem(value);
                    await this.getPlaceDetails(value.place_id);
                    await this.fetchLocations({
                        sort: {
                            place_id: value.place_id,
                        },
                    });
                    this.isLoadingAutocomplete = false;
                });
            }
        },
    });

    Alpine.data('locationsDialog', createLocationsDialogData);
    Alpine.data('itemSuggestions', createItemSuggestionsData);
});
