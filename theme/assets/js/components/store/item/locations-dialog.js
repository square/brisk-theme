if (!window.onLocationsDialogReady) {
    window.onLocationsDialogReady = () => {
        const createLocationsDialogData = (dataId) => ({
            customerAddressLine2Model: Alpine.$persist(''),
            fulfillment: Constants.FULFILLMENT_PICKUP,
            locationId: '',
            alpineStoreName: 'product',
            suggestions: [],
            hasFetchedLocations: false,
            /**
             * Initial events
            */
            init() {
                Utils.loadJsonDataIntoComponent.call(this, dataId);

                this.$store.dialog.onClose = async (isConfirmed, isSecondaryDialogOpen) => {
                    if (isConfirmed) {
                        const location = this.getLocations().find((loc) => loc.id === this.locationId) ?? this.getLocations()[0];
                        const hasFulfillmentDetail = Boolean(Square.async.templates['fulfillment-detail']);

                        if (isSecondaryDialogOpen) {
                            // Wait until the primary dialog content is ready
                            await Utils.waitUntil(() => this.$store.dialog.isDialogContentReady, 600, 10);
                        }

                        if (hasFulfillmentDetail && this.fulfillment?.length) {
                            Square.async.refreshAsyncTemplate('fulfillment-detail', {
                                fulfillment: this.fulfillment,
                                location,
                                formatted_distance: location.formatted_distance,
                            }, {
                                loaded: {
                                    location: 'location',
                                },
                            });
                        }

                        if (this.locationId?.length && Alpine.store(this.alpineStoreName)) {
                            const globalStore = Alpine.store('global');
                            globalStore.updateProperty('buyerIntent', {
                                ...globalStore.buyerIntent,
                                [this.fulfillment]: this.locationId,
                            });
                            Alpine.store(this.alpineStoreName).updateProperty('locationId', this.locationId);
                        }
                    }
                };

                this.$watch('customerAddressLine2Model', (value) => {
                    this.updateCustomerAddressLine2(value);
                });
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
             * Updates customer address
             * @param {Object}
             */
            updateCustomerAddress(value) {
                Alpine.store('global').updateProperty('customerAddress', value);
            },
            /**
             * Updates customer address line 2
             * @param {Object}
             */
            updateCustomerAddressLine2(value) {
                Alpine.store('global').updateProperty('customerAddressLine2', value);
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
                return this.getLocations() > 0;
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
                        this.refreshLocationSelector(locations);

                        const hasLocationSelected = this.getLocations().some((location) => location.id === this.locationId);
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
             * Refresh location selector template
             * @param {Array} locations
             */
            async refreshLocationSelector(locations = []) {
                const formattedDistance = locations.map((loc) => loc.formatted_distance);

                if (this.$refs.locationSelector) {
                    await Utils.refreshTemplate({
                        template: 'partials/components/location-selector',
                        props: {
                            locations,
                            formatted_distance: formattedDistance,
                        },
                        el: this.$refs.locationSelector,
                    });
                }
            },
            /**
             * Focuses the locations list
             */
            focusLocationList() {
                const nextFocusableElement = this.$refs.locations?.querySelector('input:not(disabled)');
                if (nextFocusableElement) {
                    nextFocusableElement.focus({ focusVisible: true });
                }
            },
        });

        const createItemSuggestionsData = () => ({
            model: Alpine.$persist(''),
            items: Alpine.$persist([]),
            isInitialLoad: true,
            /**
             * Initial events
             */
            async init() {
                const globalStore = Alpine.store('global');
                const previousSuggestedPlace = this.getSuggestedPlaceItem();
                if (globalStore.fulfillment === Constants.FULFILLMENT_DELIVERY) {
                    await this.initForDelivery(previousSuggestedPlace);
                } else {
                    await this.initForPickup();
                }
            },
            /**
             * Load the location from previously selected address, otherwise initialize with empty suggestion
             * which will prompt buyer to enter a delivery address
             * @returns {Promise<void>}
             */
            async initForDelivery() {
                const previousSuggestedPlace = this.getSuggestedPlaceItem();
                if (Object.values(previousSuggestedPlace).length && !Utils.isPlaceTypeRegion(previousSuggestedPlace)) {
                    this.loadAutocompletePlace(previousSuggestedPlace);
                } else {
                    this.updateSuggestedPlaceItem({});
                    this.customerAddressLine2Model = '';
                    this.model = '';
                    this.items = [];
                }
            },
            /**
             * Load location for delivery from previous selected address suggestion, otherwise initialize for first time
             * @returns {Promise<void>}
             */
            async initForPickup() {
                const previousSuggestedPlace = this.getSuggestedPlaceItem();
                this.$nextTick(async () => {
                    this.isLoadingAutocomplete = true;
                    if (!Object.values(previousSuggestedPlace).length && !this.items.length) {
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

                const fulfillmentType = globalStore.fulfillment;
                await this.fetchLocations({ sort, fulfillmentType });
            },
            /**
             * Load the locations by the user's last selection for returning visitor
             */
            async initForReturning() {
                const globalStore = Alpine.store('global');

                if (this.hasSelectedItem() && globalStore.locations.length) {
                    const formattedLocations = globalStore.formatLocationsWithDistance(
                        globalStore.locations,
                        { place_id: this.getSuggestedPlaceItem().place_id },
                    );
                    this.refreshLocationSelector(formattedLocations);
                } else {
                    await this.fetchLocations();
                }

                this.hasFetchedLocations = true;
            },
            /**
             * Get locations by autocomplete input
             */
            loadSuggestions() {
                return SquareWebSDK.places.autocompletePlaces({
                    types: this.$store.global.fulfillment === Constants.FULFILLMENT_DELIVERY ? Constants.AUTOCOMPLETE_TYPE_ADDRESS : Constants.AUTOCOMPLETE_TYPE_GEOCODE,
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
                            this.updateCustomerAddress(data);
                            this.updateSuggestedPlaceItem({
                                ...this.getSuggestedPlaceItem(),
                                latitude: data.latitude,
                                longitude: data.longitude,
                            });
                        }
                    });
            },
            /**
             * Input focus event
             */
            async onInputFocus() {
                if (this.isInitialLoad && this.items.length) {
                    // Don't show the dropdown on initial load
                    await this.refreshDropdown();
                } else {
                    this.toggleDropdown(true);
                }

                this.isInitialLoad = false;
            },
            /**
             * Updates the locations list and gets the place detail
             * @param {Object} value
             */
            onAutocompleteItemSelect(value) {
                this.toggleDropdown(false);
                this.loadAutocompletePlace(value);
            },
            /**
             * Load Autocomplete place
             */
            loadAutocompletePlace(value) {
                if (value?.place_id) {
                    this.isLoadingAutocomplete = true;
                    this.$nextTick(async () => {
                        this.updateSuggestedPlaceItem(value);
                        await this.getPlaceDetails(value.place_id);
                        await this.fetchLocations({
                            sort: {
                                place_id: value.place_id,
                            },
                            fulfillmentType: this.$store.global.fulfillment,
                        });
                        this.isLoadingAutocomplete = false;
                    });
                }
            },
        });

        Alpine.data('locationsDialog', createLocationsDialogData);
        Alpine.data('itemSuggestions', createItemSuggestionsData);
    };
}

document.addEventListener('alpine:init', window.onLocationsDialogReady);

document.addEventListener('async:alpine:init', window.onLocationsDialogReady);
