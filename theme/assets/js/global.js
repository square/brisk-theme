document.addEventListener('alpine:init', () => {
    // Cart store
    Alpine.store('cart', {
        isReady: false,
        isMiniCartOpen: false,
        isMiniCartLoading: false,
        isInteractingMiniCart: false,
        timeout: null,
        miniCartItemsTotal: 0,
        init() {
            this.reloadMiniCart();
        },
        /**
         * Add to cart
         * @param {Number} payload.quantity
         * @param {String} payload.itemId
         * @param {String} payload.variationId
         * @param {String} payload.fulfillment (optional)
         * @param {String} payload.locationId (optional)
         * @param {Array} payload.modifiers (optional)
         * @param {Object} payload.priceOverride (optional) donation custom amount
         */
        async addToCart({
            quantity = 1, itemId, variationId, fulfillment = Constants.FULFILLMENT_SHIPPING, locationId, modifiers = [], priceOverride,
        } = {}) {
            const globalStore = Alpine.store('global');
            const fulfillmentType = globalStore.fulfillment?.length ? globalStore.fulfillment : fulfillment;
            let selectedLocationId = locationId ?? globalStore.locationId;
            const lineItem = {
                quantity,
                itemId,
                variationId,
                modifiers,
            };

            if (!selectedLocationId?.length) {
                await globalStore.getLocationId(fulfillmentType);
                selectedLocationId = globalStore.locationId;
            }

            if (priceOverride) {
                lineItem.priceOverride = priceOverride;
            }

            return SquareWebSDK.cart.addItem({
                lineItem,
                fulfillment: { fulfillmentType },
                locationId: selectedLocationId,
            }).then(async (response) => {
                // Reload mini cart and scroll to the mini cart on desktop
                if (!globalStore.isMobile) {
                    await this.reloadMiniCart();

                    window.scrollTo({ top: 0, behavior: 'smooth' });

                    // Show the mini cart after page is scrolled to the top
                    await Utils.delay(1000).then(() => {
                        Alpine.store('cart').isMiniCartOpen = true;
                    });

                    // Hide the mini cart after 5 secs
                    await Utils.delay(5000).then(() => {
                        Alpine.store('cart').isMiniCartOpen = false;
                    });
                }

                return response;
            });
        },
        /**
         * Instance purchase
         * @param {Number} payload.quantity
         * @param {String} payload.itemId
         * @param {String} payload.variationId
         * @param {String} payload.subscriptionPlanVariationId (optional)
         * @param {String} payload.fulfillment (optional)
         * @param {String} payload.locationId (optional)
         * @param {Array} payload.modifiers (optional)
         * @param {Object} payload.priceOverride (optional)
         * @param {Boolean} isManualFulfillment
         */
        async buyNow({
            quantity = 1, itemId, variationId, subscriptionPlanVariationId, fulfillment = Constants.FULFILLMENT_SHIPPING, locationId, modifiers = [], priceOverride,
        } = {}, isManualFulfillment = false) {
            const globalStore = Alpine.store('global');
            let fulfillmentType = globalStore.fulfillment?.length ? globalStore.fulfillment : fulfillment;
            let selectedLocationId = locationId ?? globalStore.locationId;
            const lineItem = {
                quantity,
                itemId,
                variationId,
                modifiers,
            };

            if (subscriptionPlanVariationId) {
                lineItem.subscriptionPlanVariationId = subscriptionPlanVariationId;
            }

            if (priceOverride) {
                lineItem.priceOverride = priceOverride;
            }

            if (!isManualFulfillment && !selectedLocationId?.length) {
                await globalStore.getLocationId(fulfillmentType);
                selectedLocationId = globalStore.locationId;
            }

            if (isManualFulfillment) {
                fulfillmentType = Constants.FULFILLMENT_MANUAL;
            }

            return SquareWebSDK.cart.buyNowItem({
                lineItem,
                fulfillment: { fulfillmentType },
                locationId: selectedLocationId,
            });
        },
        /**
         * Delete a cart item
         * @param {String} orderItemId
         * @return {Promise}
         */
        async deleteItem(orderItemId) {
            if (!orderItemId) {
                return Promise.resolve();
            }
            return SquareWebSDK.cart.removeItem({ orderItemId })
                .then(async (response) => {
                    await this.reloadMiniCart();
                    return response;
                });
        },
        /**
         * Update a cart item quantity
         * @param {String} orderItemId
         * @param {String|Number} quantity
         * @return {Promise}
         */
        async updateItemQuantity(orderItemId, quantity) {
            if (!orderItemId) {
                return Promise.resolve();
            }
            return SquareWebSDK.cart.updateItemQuantity({
                orderItemId,
                quantity: Number(quantity),
            }).then(async (response) => {
                await this.reloadMiniCart();
                return response;
            });
        },
        /**
         * Fetch updated cart data and reload the template
         */
        async reloadMiniCart() {
            const miniCart = document.querySelector('#miniCart');
            if (miniCart) {
                await SquareWebSDK.resource.getResource({
                    cart: {
                        type: 'cart',
                    },
                })
                    .then(async ({ cart }) => {
                        this.miniCartItemsTotal = cart.order?.total_quantity ?? 0;

                        Alpine.store('cart').isMiniCartLoading = true;

                        await Utils.refreshTemplate({
                            template: 'partials/components/mini-cart',
                            props: { cart },
                            el: miniCart,
                        });

                        Alpine.store('cart').isMiniCartLoading = false;
                    });
            }
        },
    });

    // Global store
    Alpine.store('global', {
        locale: Constants.DEFAULT_JS_SAFE_LOCALE, // JS safe locale
        currency: Constants.DEFAULT_CURRENCY,
        currencySymbol: Constants.DEFAULT_CURRENCY_SYMBOL,
        currencySymbolPosition: 'before',
        history: Alpine.$persist({}),
        locations: [],
        isLoadingLocations: false,
        locationId: Alpine.$persist(''),
        fulfillment: Alpine.$persist(''),
        customerLocale: Alpine.$persist({}),
        suggestedPlaceItem: Alpine.$persist({}),
        suggestedPlaceItemsCached: Alpine.$persist({}),
        isMobile: true,
        isTablet: false,
        isPageScrollDisabled: false,
        isPageScrollbarVisible: false,
        isMegaMenuVisible: false,
        pageScrollY: 0,
        headerHeight: 0,
        timeout: null,
        /**
         * Initial events
         */
        init() {
            // create an Observer instance
            const resizeObserver = new ResizeObserver(() => {
                const currentScrollbarWidth = getComputedStyle(document.documentElement).getPropertyValue('--browser-scrollbar-width');
                if (!currentScrollbarWidth || parseInt(currentScrollbarWidth, 10) === 0) {
                    const scrollbarWidth = window.innerWidth - document.body.clientWidth;
                    document.documentElement.style.setProperty('--browser-scrollbar-width', `${scrollbarWidth}px`);
                }
            });

            // start observing a DOM node
            resizeObserver.observe(document.body);

            if (Utils.isTouchDevice()) {
                document.body.classList.add('is-touch-device');
            }

            if (Utils.isSafari()) {
                // Workaround to get the page transition out work on Safari b/c Safari stops animations on page unload
                document.addEventListener('DOMNodeInserted', (event) => {
                    this.attachPageAnimation(event.target.parentElement);
                }, false);
            }

            window.onbeforeunload = () => {
                if (document.body) {
                    this.disablePageScroll();
                    document.body.classList.add('fade-out');
                    document.body.addEventListener('animationend', () => {
                        document.body.classList.add('faded');
                    });
                }
            };

            // Browser back button is clicked
            window.addEventListener('pageshow', () => {
                if (this.isPageScrollDisabled && !Alpine.store('dialog')?.isDialogOpen) {
                    this.isPageScrollDisabled = false;
                    document.body.style.top = 0;
                    document.body.classList.remove('fade-out');
                }
            });
        },
        /**
         * Attach a page animation to anchors
         */
        attachPageAnimation(parentElement) {
            if (!window.AnimationEvent || !parentElement) { return; }

            const anchors = parentElement.getElementsByTagName('a');

            for (let idx = 0; idx < anchors.length; idx += 1) {
                anchors[idx].addEventListener('click', (event) => {
                    event.preventDefault();
                    this.goToPage(event.currentTarget.href);
                });
            }
        },
        /**
         * Disable page scroll
         */
        disablePageScroll() {
            this.isPageScrollDisabled = true;
            const pageScrollY = window.scrollY;
            // Keeps the body scroll position
            document.body.style.top = `-${pageScrollY}`;
        },
        /**
         * Apply a page animation before page url changes
         */
        goToPage(href) {
            if (!href) {
                return;
            }
            if (Utils.isSafari()) {
                const body = document.body;

                const listener = () => {
                    document.body.classList.add('faded');
                    document.location.href = href;
                    body.removeEventListener('animationend', listener);
                };
                body.addEventListener('animationend', listener);

                document.body.classList.add('fade-out');

                this.disablePageScroll();
            } else {
                document.location.href = href;
            }
        },
        /**
         * Check if current viewport is desktop
         * @return {Boolean}
         */
        isDesktop() {
            return !this.isMobile && !this.isTablet;
        },
        /**
         * Triggers when the dialog is open or close
         * @param {Boolean} isOpen
         * @param {Object|String} elementOrSelector - indicates the element to focus. Can be a direct reference to the DOM element, or a selector to find it
         */
        async onOverlayToggle(isOpen, elementOrSelector) {
            if (isOpen) {
                this.isPageScrollDisabled = true;
                // Keeps the body scroll position
                this.pageScrollY = window.scrollY;
                document.body.style.top = `-${this.pageScrollY}`;

                // Wait until transition is complete
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    const nextFocusableElement = Utils.getNextFocusableElement(elementOrSelector);

                    // Find the focusable button and activate
                    if (nextFocusableElement) {
                        nextFocusableElement.focus({ focusVisible: true });
                    }
                }, 500);
            } else {
                await Utils.delay(500).then(() => {
                    this.isPageScrollDisabled = false;
                });
                // Wait until transition is complete
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    document.body.style.top = '';

                    // Scroll to the last scrolled position
                    window.scroll({ top: this.pageScrollY });
                    this.pageScrollY = window.scrollY;
                }, 100);
            }
        },
        /**
         * Updates the store data
         * @param {String} property
         * @param {Array|Object|String|Number} value
         */
        updateProperty(property, value) {
            this[property] = value;
        },
        /**
         * Updates the history in store
         * @param {String} property
         * @param {Array|Object|String|Number} value
         */
        updateHistory(property, value) {
            if (property) {
                this.history[property] = value;
            }
        },
        /**
         * Get the history property from store
         * @param {String} property
         * @return {Any}
         */
        getHistory(property) {
            return this.history[property];
        },
        /**
         * Sets currency symbol and position
         * @param {String} currency
         */
        setCurrency(currency) {
            if (currency?.length) {
                this.currency = currency;
            }
            this.currencySymbol = Utils.getCurrencySymbol(this.locale, this.currency);
            this.currencySymbolPosition = Utils.getCurrencySymbolPosition(this.locale, this.currency);
        },
        /**
         * Get the user's current location coordinates
         */
        async getCustomerCoordinates() {
            const { customerLocale } = Alpine.store('global');

            if (Utils.hasValidCoordinates(customerLocale)) {
                return Promise.resolve();
            }

            return SquareWebSDK.customers.getCoordinates()
                .then(async (data) => {
                    if (data?.postal_code && data?.latitude && data?.longitude) {
                        Alpine.store('global').updateProperty('customerLocale', data);
                    }
                });
        },
        /**
         * Get the closest location by the user's current location
         * @param {String} fufillment
         * @return {Promise}
         */
        async getClosestLocation(fulfillment) {
            const { customerLocale } = Alpine.store('global');
            const { suggestedPlaceItem } = Alpine.store('global');
            const selectedFulfillment = fulfillment ?? this.fulfillment;
            let sort = {};
            let filters = {};

            if (Utils.hasValidCoordinates(suggestedPlaceItem)) {
                sort = {
                    from: {
                        place_id: this.suggestedPlaceItem.place_id,
                    },
                };
            } else if (Utils.hasValidCoordinates(customerLocale)) {
                sort = {
                    from: {
                        lat: customerLocale.latitude,
                        lng: customerLocale.longitude,
                    },
                };
            }

            if (selectedFulfillment.length && selectedFulfillment !== Constants.FULFILLMENT_SHIPPING) {
                filters = {
                    fulfillments: [selectedFulfillment],
                };
            }

            return this.getLocations({ filters, sort })
                .then((locations = []) => {
                    if (locations[0]?.id) {
                        this.locationId = locations[0].id;
                    }
                });
        },
        /**
         * Fetch locations
         * @param {Object} payload.filters
         * @param {Object} payload.sort
         * @param {Number} payload.limit
         * @return {Promise}
         */
        async getLocations({ filters = {}, sort = {}, limit = 1 } = {}) {
            const shouldFetchSingleLocation = filters.id;
            const input = shouldFetchSingleLocation
                ? {
                    location: {
                        type: 'location',
                        filters,
                    },
                }
                : {
                    locations: {
                        type: 'location-list',
                        filters,
                        sort,
                        pagination: {
                            page_size: limit,
                        },
                    },
                };

            this.isLoadingLocations = true;

            return SquareWebSDK.resource.getResource(input)
                .then(async (data) => {
                    if (shouldFetchSingleLocation) {
                        const { location = {} } = data;
                        if (location.id) {
                            this.locations = this.formatLocationsWithDistance([location], sort.from) ?? [];
                        } else {
                            this.locations = [];
                        }
                    } else {
                        const { locations = [] } = data;
                        this.locations = this.formatLocationsWithDistance(locations, sort.from) ?? [];
                    }

                    this.isLoadingLocations = false;
                    return this.locations;
                });
        },
        /**
         * Formats the locations with distance
         * @param {Array} locations
         * @param {Object} sort
         * @return {Array}
         */
        formatLocationsWithDistance(locations, sort) {
            let customerCoordinates = {};
            let formattedLocations = locations;

            if (this.suggestedPlaceItem?.place_id === sort?.place_id && Utils.hasValidCoordinates(this.suggestedPlaceItem)) {
                customerCoordinates = { latitude: this.suggestedPlaceItem.latitude, longitude: this.suggestedPlaceItem.longitude };
            } else if (Utils.hasValidCoordinates(sort)) {
                customerCoordinates = { latitude: sort.lat, longitude: sort.lng };
            }

            if (Utils.hasValidCoordinates(customerCoordinates)) {
                formattedLocations = locations.map((location) => Utils.formatLocationWithDistance(location, customerCoordinates));
            }
            return formattedLocations.sort((a, b) => a.distance - b.distance);
        },
        /**
         * Gets the location id by the user's current location and fulfillment
         * @param {String} fufillment
         */
        async getLocationId(fulfillment) {
            const store = Alpine.store('global');
            await store.getCustomerCoordinates();
            await store.getClosestLocation(fulfillment);
        },
        /**
         * Gets the place coordinates
         * @param {Object} suggestedItem
         */
        async getPlaceDetails(suggestedItem) {
            const store = Alpine.store('global');
            const placeId = suggestedItem.place_id;

            if (store.suggestedPlaceItemsCached[placeId]) {
                store.updateProperty('suggestedPlaceItem', store.suggestedPlaceItemsCached[placeId]);
            } else {
                store.updateProperty('suggestedPlaceItem', suggestedItem);
            }

            const suggestedPlaceItem = store.suggestedPlaceItem;
            if (Utils.hasValidCoordinates(suggestedPlaceItem) && suggestedPlaceItem.place_id === placeId) {
                return;
            }

            await SquareWebSDK.places.getPlace({ placeId })
                .then(async ({ data }) => {
                    if (Utils.hasValidCoordinates(data)) {
                        const suggestedPlaceItemDetail = {
                            ...suggestedPlaceItem,
                            latitude: data.latitude,
                            longitude: data.longitude,
                        };
                        store.updateProperty('suggestedPlaceItemsCached', {
                            ...store.suggestedPlaceItemsCached,
                            [placeId]: suggestedPlaceItemDetail,
                        });
                        store.updateProperty('suggestedPlaceItem', suggestedPlaceItemDetail);
                    }
                });
        },
    });

    Alpine.data('global', (dataId) => ({
        locale: Constants.DEFAULT_LOCALE,
        currency: Constants.DEFAULT_CURRENCY,
        defaultFulfillment: Constants.FULFILLMENT_SHIPPING,
        pageHeight: 0,
        pageWidth: 0,
        bodyStyles: {},
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            const store = Alpine.store('global');
            store.updateProperty('locale', this.locale.replace(/_/g, '-'));
            store.updateProperty('fulfillment', this.defaultFulfillment);
            store.setCurrency(this.currency);

            // add whitespace at top to fit header
            this.$watch('$store.global.headerHeight', (height) => {
                this.bodyStyles = {
                    '--header-height': `${height}px`,
                };
            });
            this.onWindowResize();
        },
        /**
         * Checks if the dialog exists in the dom
         */
        dialogExists() {
            return Boolean(document.querySelector('[role="dialog"]'));
        },
        /**
         * Window resize event
         */
        onWindowResize() {
            const store = Alpine.store('global');
            this.pageHeight = window.innerHeight;
            this.pageWidth = window.innerWidth;
            store.isMobile = this.pageWidth < 700;
            store.isTablet = this.pageWidth < 992;
            store.isPageScrollbarVisible = this.pageHeight <= document.body.offsetHeight;
        },
    }));

    // Used to delete an element from the dom
    Alpine.directive('destroy', (el, { expression }, { evaluateLater, cleanup }) => {
        const clean = evaluateLater(expression);
        cleanup(() => clean());
    });
});
