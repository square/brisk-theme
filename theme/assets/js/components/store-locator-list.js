window.onStoreLocatorListReady = () => {
    const createStoreLocatorItemData = (locationId) => ({
        isActive: false,
        init() {
            this.$watch('$store.storeLocator.locationId', (id) => {
                this.isActive = locationId === id;
            });
        },
        /**
         * Opens location details on item click
         * @param {String} id
         */
        onStoreLocatorItemClick(id) {
            if (Alpine.store('global').isMobile) {
                this.openLocationDetails(id);
            }
            Alpine.store('storeLocator').onStoreLocatorItemClick(id);
        },
        /**
         * Opens location details on item focus
         * @param {String} id
         */
        onStoreLocatorItemFocus(id) {
            Alpine.store('storeLocator').updateLocationId(id);
        },
        /**
         * Opens location details on item enter
         * @param {String} id
         */
        onStoreLocatorKeyEnter(id) {
            if (Alpine.store('global').isMobile) {
                this.openLocationDetails(id);
            } else {
                this.onStoreLocatorItemClick(id);
            }
        },
        /**
         * Opens location details
         * @param {String} id
         */
        openLocationDetails(id) {
            Alpine.store('storeLocator').openLocationDetails(id);
        },
    });

    Alpine.data('storeLocatorItem', createStoreLocatorItemData);
};

document.addEventListener('alpine:init', window.onStoreLocatorListReady);
