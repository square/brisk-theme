document.addEventListener('alpine:init', () => {
    Alpine.store('storeLocator', {
        locationId: '',
        locations: [],
        googleMapIframe: null,
        googleMapsBase: '',
        translations: {},
        /**
         * Initial events
         */
        init() {
            this.googleMapIframe = document.querySelector('[x-ref="googleMapIframe"]');

            if (this.googleMapIframe) {
                const iframeHref = new URL(this.googleMapIframe.src);
                this.googleMapsBase = iframeHref.origin;
            }
        },
        /**
         * Update location id
         * @param {String} id
         */
        updateLocationId(id) {
            this.locationId = id;
        },
        /**
         * Triggers google map iframe event on store locator card click
         * @param {String} locationId
         */
        onStoreLocatorItemClick(locationId) {
            if (this.googleMapIframe) {
                this.googleMapIframe.contentWindow.postMessage({
                    event: 'open:location',
                    data: locationId,
                }, this.googleMapsBase);
            }
        },
        /**
         * Open location details modal
         * @param {String} locationId
         */
        openLocationDetails(locationId) {
            const location = this.locations.find((loc) => loc.id === locationId);
            const dialogStore = Alpine.store('dialog');

            if (location && !dialogStore?.isDialogOpen) {
                dialogStore.openPrimaryDialog({
                    templateUrl: 'templates/components/dialogs/store-locator-content',
                    dialogOptions: {
                        showCloseButton: true,
                        size: 'large',
                        title: this.translations.dialogTitle,
                    },
                    templateProps: { location },
                });
            }
        },
    });

    const createStoreLocatorPage = (dataId) => ({
        /**
         * Initial events
         */
        init() {
            const data = JSON.parse(document.getElementById(dataId)?.innerHTML ?? '{}');
            Object.keys(data).forEach((property) => {
                if (typeof data[property] !== 'undefined') {
                    Alpine.store('storeLocator')[property] = data[property];
                }
            });
        },
        /**
         * Google map iframe events
         * @param {Object} event
         */
        onIframeMessage(event) {
            try {
                const events = JSON.parse(event.data);
                const [eventType, locationId] = Object.entries(events)[0];
                if (eventType === 'location_click_event' && locationId) {
                    Alpine.store('storeLocator').updateLocationId(locationId);
                } else if (eventType === 'view_more_info_click' && locationId) {
                    Alpine.store('storeLocator').openLocationDetails(locationId);
                }
            } catch (e) {
                // no-op
            }
        },
    });

    const createStoreLocatorInput = () => ({
        model: '',
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
         * Updates the locations list and gets the place detail
         * @param {Object} value
         */
        onAutocompleteItemSelect(value) {
            this.toggleDropdown(false);

            if (value?.place_id) {
                const globalStore = Alpine.store('global');

                this.isLoadingAutocomplete = true;
                this.$nextTick(async () => {
                    await globalStore.getPlaceDetails(value);

                    const storeLocatorList = document.querySelector('#store-locator-list');
                    if (storeLocatorList) {
                        const locations = globalStore.formatLocationsWithDistance(Alpine.store('storeLocator').locations, globalStore.suggestedPlaceItem);
                        const formattedDistance = locations.map((loc) => loc.formatted_distance);

                        await Utils.refreshTemplate({
                            template: 'partials/components/store-locator-list',
                            props: {
                                locations,
                                formatted_distance: formattedDistance,
                            },
                            el: storeLocatorList,
                        });
                    }

                    this.isLoadingAutocomplete = false;
                });
            }
        },
    });

    const createStoreLocatorDialog = (dataId) => ({
        formattedAddress: '',
        latitude: '',
        longitude: '',
        phoneNumber: '',
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);
        },
        /**
         * Get directions button click
         */
        onDirectionsButtonClick() {
            let directionsLink = '';

            if (this.formattedAddress) {
                const destination = this.formattedAddress.replace(/,/g, '').replace(/\s+/g, '+');
                directionsLink = Utils.getDirectionsUrl(destination);
            }
            if (this.latitude.length && this.longitude.length) {
                directionsLink = Utils.getDirectionsUrl(`${this.latitude},${this.longitude}`);
            }
            if (directionsLink.length) {
                const win = window.open(directionsLink, '_blank');
                win.opener = null;
            }
        },
        /**
         * Call button click
         */
        onCallButtonClick() {
            const win = window.open(`tel:${this.phoneNumber}`, '_blank');
            win.opener = null;
        },
    });

    Alpine.data('storeLocatorPage', createStoreLocatorPage);
    Alpine.data('storeLocatorInput', createStoreLocatorInput);
    Alpine.data('storeLocatorDialog', createStoreLocatorDialog);
});
