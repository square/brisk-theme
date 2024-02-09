document.addEventListener('alpine:init', () => {
    Alpine.store('siteWideFulfillment', {
        asapTime: {},
        selectedScheduleTime: Alpine.$persist({}),
        lastSelectedPickupLocationId: Alpine.$persist(''),
        lastSelectedDeliveryLocationId: Alpine.$persist(''),
        isLoadingItemList: false,
        isLoadingLocationSelector: false,
        isFailedToUpdateSchedule: false,
        /**
         * @param label This is a display such as "Today at 2:05pm"
         * @param time This is time in RFC 3339 format such as "2024-02-02T21:55:00+00:00"
         * @param timestamp This is a timestamp in seconds
         * @param dateKey the date key value in yyyy-mm-dd format
         */
        setSelectedScheduleTime(label, time, timestamp, dateKey) {
            this.selectedScheduleTime = {
                label,
                time,
                timestamp,
                dateKey,
            };
        },
        /**
         * Keep track of last selected location id by fulfillment
         * so we can restore to the correct location id when switching fulfillment option
         * @param {String} fulfillment
         * @param {String} locationId
         */
        setLastSelectedLocationId(fulfillment, locationId) {
            if (!locationId?.length) {
                return;
            }
            if (fulfillment === Constants.FULFILLMENT_PICKUP) {
                this.lastSelectedPickupLocationId = locationId;
            } else if (fulfillment === Constants.FULFILLMENT_DELIVERY) {
                this.lastSelectedDeliveryLocationId = locationId;
            }
        },
        /**
         * When a new fulfillment is selected, fetch a new schedule and reset scheduled time to earliest
         * @param fulfillment fulfillment constant such as PICKUP, SHIPMENT, DELIVERY
         * @returns {Promise<void>}
         */
        async onFulfillmentSelected(fulfillment) {
            const globalStore = Alpine.store('global');
            const locationsByFulfillment = globalStore.getHistory('locationsByFulfillment')?.[fulfillment] ?? [];
            const lastSelectedLocationId = globalStore.buyerIntent[fulfillment] ?? globalStore.defaultLocation.id;
            const promises = [];

            // Restore locations by fulfillment
            globalStore.updateProperty('locations', locationsByFulfillment);
            globalStore.updateProperty('fulfillment', fulfillment);

            if (fulfillment === Constants.FULFILLMENT_DELIVERY) {
                if (globalStore.hasDeliveryAddress()) {
                    promises.push(this.updateCartFulfillment());
                } else {
                    this.refreshChooseLocation('');
                }
            } else if (!globalStore.getCurrentLocationSupportsFulfillment(fulfillment)) {
                // Only update to the closest location if current location does not support fulfillment
                await globalStore.getLocationId(fulfillment);
            }

            // Restore to the last selected location id
            if (lastSelectedLocationId) {
                globalStore.updateProperty('locationId', lastSelectedLocationId);
            }

            // Refresh item list and load ASAP time if delivery address exists or fulfillment is not delivery
            const shouldRefreshItemList = (globalStore.hasDeliveryAddress() && fulfillment === Constants.FULFILLMENT_DELIVERY)
                || fulfillment !== Constants.FULFILLMENT_DELIVERY;

            if (shouldRefreshItemList) {
                promises.push(this.loadASAPTime());
                promises.push(this.refreshItemList());
            }

            if (promises.length) {
                await Promise.all(promises);
            }
        },
        /**
         * Checks if we should show the scheduling selector
         * @return {Boolean}
         */
        shouldShowSchedulingSelector() {
            const globalStore = Alpine.store('global');
            return ((globalStore.hasDeliveryAddress() && globalStore.fulfillment === Constants.FULFILLMENT_DELIVERY)
                || globalStore.fulfillment !== Constants.FULFILLMENT_DELIVERY) && !this.isFailedToUpdateSchedule;
        },
        /**
         * Load the earliest possible time from schedule. This is used so that we can display the earliest available time
         * as this is always changing in the ASAP case.
         * @returns {Promise<void>}
         */
        async loadASAPTime() {
            const globalStore = Alpine.store('global');
            let filters = {};
            this.selectedScheduleTime = {};

            if (!SquareWebSDK.cart.getActiveId()) {
                // We only provide these filters when there is no cart. When there is a cart, we use the cart schedule
                // automatically.
                filters = {
                    location_id: globalStore.locationId,
                    fulfillment: globalStore.fulfillment,
                    range: 365,
                };
            }
            await SquareWebSDK.resource.getResource({
                schedule: {
                    type: 'schedule-days',
                    filters,
                },
            }).then(async (data) => {
                if (data.schedule?.earliest_time) {
                    this.asapTime = {
                        label: data.schedule.earliest_time.time_formatted,
                        time: data.schedule.earliest_time.time,
                        timestamp: data.schedule.earliest_time.time_unix,
                        dateKey: Object.keys(data.schedule.available_times)[0],
                    };
                }
            });
        },
        /**
         * Returns the selected schedule time label
         */
        selectedScheduleTimeLabel() {
            return this.getSelectedScheduleTime().label;
        },
        /**
         * Returns the selected schedule time
         */
        getSelectedScheduleTime() {
            return this.selectedScheduleTime.time ? this.selectedScheduleTime : this.asapTime;
        },
        /**
         * Returns the scheduling type
         */
        getScheduleType() {
            return this.selectedScheduleTime.time ? Constants.SCHEDULE_TYPE_SCHEDULED : Constants.SCHEDULE_TYPE_ASAP;
        },
        /**
         * Opens the locations dialog
         */
        openLocationsDialog() {
            const globalStore = Alpine.store('global');
            const templateProps = {
                fulfillment: globalStore.fulfillment,
                locationId: globalStore.locationId,
                locations: globalStore.locations,
                alpine_store_name: 'global',
            };

            const dialogAction = Alpine.store('dialog').isDialogOpen ? 'openSecondaryDialog' : 'openPrimaryDialog';

            Alpine.store('dialog')[dialogAction]({
                templateUrl: 'templates/components/dialogs/locations-content',
                dialogOptions: {
                    id: `${templateProps.fulfillment}-locations`,
                    scrollable: false,
                    size: 'large',
                    showPrimaryButton: true,
                    showSecondaryButton: false,
                    disablePrimaryButton: true,
                    primaryButtonText: SquareTranslations.shared.buttons.update,
                    buttonPosition: 'footer',
                },
                templateProps,
            });
        },
        /**
         * When a new location is selected, refresh the location template to reflect the new location
         * @param locationId Square location id
         */
        refreshChooseLocation(locationId) {
            const chooseLocationSelector = document.querySelector('#chooseLocationSelector');
            if (chooseLocationSelector) {
                this.isLoadingLocationSelector = true;
                const location = Alpine.store('global').locations?.find((loc) => loc.id === locationId) ?? {};

                Utils.refreshTemplate({
                    template: 'partials/components/fulfillment-and-scheduling/choose-location',
                    props: {
                        location,
                    },
                    el: chooseLocationSelector,
                }).finally(() => {
                    this.isLoadingLocationSelector = false;
                });
            }
        },

        /**
         * Refresh the item list with latest fulfillment and location
         */
        async refreshItemList() {
            const orderItemList = document.querySelector('#orderItemList');
            if (orderItemList) {
                this.isLoadingItemList = true;
                const locationId = Alpine.store('global').locationId;
                const filters = {
                    categories: {
                        type: 'category-list',
                        filters: {
                            location_id: locationId,
                            ...this.getAvailabilityFilter(),
                        },
                    },
                };
                const { categories } = await SquareWebSDK.resource.getResource(filters);
                Utils.refreshTemplate({
                    template: 'partials/components/store/order/item-list',
                    props: {
                        categories,
                        fulfillment: Alpine.store('global').fulfillment,
                    },
                    el: orderItemList,
                }).finally(() => {
                    this.isLoadingItemList = false;
                });
            }
        },
        /**
         * returns the availability filter
         * @returns {{availability: {by: string, time: {from: (string|string)}}}}
         */
        getAvailabilityFilter() {
            let by = Constants.AVAILABILITY_ORDERING;
            const currFulfillment = Alpine.store('global').fulfillment;
            if (currFulfillment === Constants.FULFILLMENT_PICKUP) {
                by = Constants.AVAILABILITY_READY;
            } else if (currFulfillment === Constants.FULFILLMENT_DELIVERY) {
                by = Constants.AVAILABILITY_DELIVER;
            }
            const from = this.selectedScheduleTime.time ? this.selectedScheduleTime.time.toString() : 'now';
            return {
                availability: {
                    by,
                    time: {
                        from,
                    },
                },
            };
        },
        /**
         * Updates the cart fulfillment (location, fulfillment type, fulfillment details)
         */
        async updateCartFulfillment() {
            const globalStore = Alpine.store('global');
            const patchFulfillmentRequest = {
                fulfillment: {
                    fulfillmentType: globalStore.fulfillment,
                },
                locationId: globalStore.locationId,
            };
            if (this.selectedScheduleTime && this.selectedScheduleTime.timestamp <= this.asapTime.timestamp) {
                this.selectedScheduleTime = {};
            }
            if (globalStore.fulfillment === Constants.FULFILLMENT_DELIVERY) {
                patchFulfillmentRequest.fulfillment.deliveryDetails = globalStore.getDeliveryDetails();
            } else {
                patchFulfillmentRequest.fulfillment.pickupDetails = globalStore.getPickupDetails();
            }
            // only update cart if it exists
            if (SquareWebSDK.cart.getActiveId()) {
                try {
                    await SquareWebSDK.cart.patchFulfillment(patchFulfillmentRequest);
                } catch (e) {
                    this.isFailedToUpdateSchedule = true;
                }
                this.isFailedToUpdateSchedule = false;
            }
        },
        /**
         * Pre-render dialog content so the dialog opens quicker. Fulfillment, locationId, and location params
         * are optional, if not provided will fall back to the global store value
         * @param {Object} payload
         * @param {String} payload.fulfillment
         * @param {String} payload.locationId
         * @param {Array} payload.locations
         * @returns {Promise<void>}
         */
        async preloadLocationsDialog({ fulfillment, locationId, locations } = {}) {
            const props = {
                fulfillment: fulfillment ?? Alpine.store('global').fulfillment,
                locationId: locationId ?? Alpine.store('global').locationId,
                locations: locations ?? Alpine.store('global').locations,
                alpine_store_name: 'global',
            };
            Utils.prerenderTemplate({
                template: 'templates/components/dialogs/locations-content',
                props,
                id: `${props.fulfillment}-locations`,
            });
        },
    });

    Alpine.data('siteWideFulfillment', () => ({
        async init() {
            const globalStore = Alpine.store('global');
            const siteWideFulfillmentStore = Alpine.store('siteWideFulfillment');

            siteWideFulfillmentStore.preloadLocationsDialog({ fulfillment: Constants.FULFILLMENT_PICKUP });
            siteWideFulfillmentStore.preloadLocationsDialog({
                fulfillment: Constants.FULFILLMENT_DELIVERY,
                locationId: '',
                locations: [],
            });

            this.$watch('$store.global.locationId', (locationId) => {
                this.onLocationIdUpdate(locationId);
            });

            if (!siteWideFulfillmentStore.selectedScheduleTime?.time) {
                await siteWideFulfillmentStore.loadASAPTime();
            }

            this.$watch('$store.siteWideFulfillment.selectedScheduleTime', () => {
                siteWideFulfillmentStore.refreshItemList();
                siteWideFulfillmentStore.updateCartFulfillment();
            });

            // if the current fulfillment is delivery and the customer address is not set, open the locations dialog
            if (globalStore.fulfillment === Constants.FULFILLMENT_DELIVERY) {
                if (!Object.values(globalStore.customerAddress).length) {
                    siteWideFulfillmentStore.openLocationsDialog();
                }
            }
        },
        /**
         * Triggers when location id updates
         * @param {String} locationId
         */
        onLocationIdUpdate(locationId) {
            const globalStore = Alpine.store('global');
            const siteWideFulfillmentStore = Alpine.store('siteWideFulfillment');
            siteWideFulfillmentStore.refreshChooseLocation(locationId);
            siteWideFulfillmentStore.refreshItemList();
            siteWideFulfillmentStore.updateCartFulfillment();
            // Reload locations dialog content with new location id selected
            siteWideFulfillmentStore.preloadLocationsDialog();
            siteWideFulfillmentStore.setLastSelectedLocationId(globalStore.fulfillment, locationId);
        },
    }));
});
